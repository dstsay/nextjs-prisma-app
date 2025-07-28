import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { signOut } from "next-auth/react"
import { LogoutButton } from "@/components/auth/LogoutButton"

// Mock next-auth
jest.mock("next-auth/react", () => ({
  signOut: jest.fn(),
}))

describe("LogoutButton", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders logout button", () => {
    render(<LogoutButton />)
    
    expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument()
  })

  it("calls signOut when clicked", async () => {
    render(<LogoutButton />)
    
    fireEvent.click(screen.getByRole("button", { name: "Logout" }))

    await waitFor(() => {
      expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/" })
    })
  })

  it("applies custom className", () => {
    render(<LogoutButton className="custom-class" />)
    
    const button = screen.getByRole("button", { name: "Logout" })
    expect(button).toHaveClass("custom-class")
  })

  it("shows loading state when logging out", async () => {
    ;(signOut as jest.Mock).mockImplementation(() => new Promise(() => {})) // Never resolves
    
    render(<LogoutButton />)
    
    fireEvent.click(screen.getByRole("button", { name: "Logout" }))

    await waitFor(() => {
      expect(screen.getByText("Logging out...")).toBeInTheDocument()
      const button = screen.getByRole("button")
      expect(button).toBeDisabled()
      const spinner = button.querySelector(".animate-spin")
      expect(spinner).toBeInTheDocument()
    })
  })

  it("handles logout error gracefully", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation()
    ;(signOut as jest.Mock).mockRejectedValue(new Error("Logout failed"))
    
    render(<LogoutButton />)
    
    fireEvent.click(screen.getByRole("button", { name: "Logout" }))

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith("Logout error:", expect.any(Error))
    })

    consoleError.mockRestore()
  })
})