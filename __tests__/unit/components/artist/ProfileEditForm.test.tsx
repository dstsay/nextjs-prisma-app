import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { useRouter } from "next/navigation"
import { ProfileEditForm } from "@/components/artist/ProfileEditForm"

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
  })),
}))

// Mock global fetch
global.fetch = jest.fn()

// Mock CSRF token
jest.mock('@/lib/csrf', () => ({
  getCsrfToken: jest.fn().mockResolvedValue('mock-csrf-token'),
}))

describe("ProfileEditForm", () => {
  const mockRefresh = jest.fn()
  const mockFetch = global.fetch as jest.Mock

  const mockInitialData = {
    id: "artist1",
    username: "test_artist",
    email: "artist@test.com",
    name: "Test Artist",
    bio: "Test bio",
    specialties: ["Bridal", "Editorial"],
    yearsExperience: 5,
    location: "New York, NY",
    badges: ["Certified Pro", "Best of 2023"],
    hourlyRate: 150,
    isAvailable: true,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      refresh: mockRefresh,
    })
  })

  it("renders all form fields with initial data", () => {
    render(<ProfileEditForm initialData={mockInitialData} />)

    // Read-only fields
    expect(screen.getByDisplayValue("test_artist")).toBeDisabled()
    expect(screen.getByDisplayValue("artist@test.com")).toBeDisabled()

    // Editable fields
    expect(screen.getByDisplayValue("Test Artist")).toBeInTheDocument()
    expect(screen.getByDisplayValue("Test bio")).toBeInTheDocument()
    expect(screen.getByDisplayValue("5")).toBeInTheDocument()
    expect(screen.getByDisplayValue("150")).toBeInTheDocument()
    expect(screen.getByDisplayValue("New York, NY")).toBeInTheDocument()
    expect(screen.getByDisplayValue("Bridal, Editorial")).toBeInTheDocument()
    expect(screen.getByDisplayValue("Certified Pro, Best of 2023")).toBeInTheDocument()
    
    // Checkbox
    const checkbox = screen.getByRole("checkbox", { name: /available for bookings/i })
    expect(checkbox).toBeChecked()
  })

  it("handles input changes correctly", () => {
    render(<ProfileEditForm initialData={mockInitialData} />)

    const nameInput = screen.getByLabelText("Display Name *")
    fireEvent.change(nameInput, { target: { value: "Updated Artist Name" } })
    expect(nameInput).toHaveValue("Updated Artist Name")

    const bioTextarea = screen.getByLabelText("Bio")
    fireEvent.change(bioTextarea, { target: { value: "Updated bio text" } })
    expect(bioTextarea).toHaveValue("Updated bio text")

    const checkbox = screen.getByRole("checkbox", { name: /available for bookings/i })
    fireEvent.click(checkbox)
    expect(checkbox).not.toBeChecked()
  })

  it("converts comma-separated strings to arrays on submit", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Profile updated successfully" }),
    })

    render(<ProfileEditForm initialData={mockInitialData} />)

    // Update specialties and badges
    const specialtiesInput = screen.getByLabelText(/specialties/i)
    fireEvent.change(specialtiesInput, { target: { value: "Glam, Natural, Creative" } })

    const badgesInput = screen.getByLabelText(/badges/i)
    fireEvent.change(badgesInput, { target: { value: "Pro Artist, Featured" } })

    // Submit form
    const submitButton = screen.getByRole("button", { name: "Save Profile" })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/artist/profile", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          'X-CSRF-Token': 'mock-csrf-token'
        },
        body: JSON.stringify({
          name: "Test Artist",
          bio: "Test bio",
          specialties: ["Glam", "Natural", "Creative"],
          yearsExperience: 5,
          location: "New York, NY",
          badges: ["Pro Artist", "Featured"],
          hourlyRate: 150,
          isAvailable: true,
        }),
      })
    })
  })

  it("shows success message on successful update", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Profile updated successfully" }),
    })

    render(<ProfileEditForm initialData={mockInitialData} />)

    const submitButton = screen.getByRole("button", { name: "Save Profile" })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("Profile updated successfully!")).toBeInTheDocument()
    })

    expect(mockRefresh).toHaveBeenCalled()
  })

  it("shows error message on failed update", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Failed to update profile" }),
    })

    render(<ProfileEditForm initialData={mockInitialData} />)

    const submitButton = screen.getByRole("button", { name: "Save Profile" })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("Failed to update profile")).toBeInTheDocument()
    })

    expect(mockRefresh).not.toHaveBeenCalled()
  })

  it("shows generic error message on network error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"))

    render(<ProfileEditForm initialData={mockInitialData} />)

    const submitButton = screen.getByRole("button", { name: "Save Profile" })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument()
    })
  })

  it("disables submit button while loading", async () => {
    mockFetch.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    )

    render(<ProfileEditForm initialData={mockInitialData} />)

    const submitButton = screen.getByRole("button", { name: "Save Profile" })
    fireEvent.click(submitButton)

    expect(submitButton).toBeDisabled()
    expect(submitButton).toHaveTextContent("Saving...")

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
      expect(submitButton).toHaveTextContent("Save Profile")
    })
  })

  it("keeps username and email read-only", () => {
    render(<ProfileEditForm initialData={mockInitialData} />)

    const usernameInput = screen.getByDisplayValue("test_artist")
    const emailInput = screen.getByDisplayValue("artist@test.com")

    expect(usernameInput).toBeDisabled()
    expect(emailInput).toBeDisabled()

    // Try to change them
    fireEvent.change(usernameInput, { target: { value: "new_username" } })
    fireEvent.change(emailInput, { target: { value: "new@email.com" } })

    // Values should not change
    expect(usernameInput).toHaveValue("test_artist")
    expect(emailInput).toHaveValue("artist@test.com")
  })

  it("handles null values in initial data", () => {
    const dataWithNulls = {
      ...mockInitialData,
      bio: null,
      yearsExperience: null,
      location: null,
      hourlyRate: null,
    }

    render(<ProfileEditForm initialData={dataWithNulls} />)

    expect(screen.getByLabelText("Bio")).toHaveValue("")
    expect(screen.getByLabelText("Years of Experience")).toHaveValue(null)
    expect(screen.getByLabelText("Location")).toHaveValue("")
    expect(screen.getByLabelText("Hourly Rate ($)")).toHaveValue(null)
  })

  it("validates character limits", () => {
    render(<ProfileEditForm initialData={mockInitialData} />)

    const bioTextarea = screen.getByLabelText("Bio")
    expect(bioTextarea).toHaveAttribute("maxLength", "1000")

    const nameInput = screen.getByLabelText("Display Name *")
    expect(nameInput).toHaveAttribute("maxLength", "100")

    const locationInput = screen.getByLabelText("Location")
    expect(locationInput).toHaveAttribute("maxLength", "100")
  })

  it("shows character count for bio", () => {
    render(<ProfileEditForm initialData={mockInitialData} />)

    const bioTextarea = screen.getByLabelText("Bio")
    const charCount = screen.getByText("8/1000 characters")

    fireEvent.change(bioTextarea, { target: { value: "New bio text" } })
    
    expect(screen.getByText("12/1000 characters")).toBeInTheDocument()
  })

  it("handles empty arrays for specialties and badges", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Profile updated successfully" }),
    })

    render(<ProfileEditForm initialData={mockInitialData} />)

    // Clear specialties and badges
    const specialtiesInput = screen.getByLabelText(/specialties/i)
    fireEvent.change(specialtiesInput, { target: { value: "" } })

    const badgesInput = screen.getByLabelText(/badges/i)
    fireEvent.change(badgesInput, { target: { value: "" } })

    // Submit form
    const submitButton = screen.getByRole("button", { name: "Save Profile" })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/artist/profile", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          'X-CSRF-Token': 'mock-csrf-token'
        },
        body: expect.stringContaining('"specialties":[]'),
      })
    })
  })
})