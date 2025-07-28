import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/auth/LoginForm"

// Mock next-auth
jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}))

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}))

describe("LoginForm", () => {
  const mockPush = jest.fn()
  const mockRefresh = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    })
  })

  it("renders login form with username and password fields", () => {
    render(<LoginForm userType="client" />)
    
    expect(screen.getByLabelText("Username")).toBeInTheDocument()
    expect(screen.getByLabelText("Password")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument()
  })

  it("calls signIn with client credentials", async () => {
    ;(signIn as jest.Mock).mockResolvedValue({ ok: true })
    
    render(<LoginForm userType="client" />)
    
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "testuser" },
    })
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    })
    
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }))

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith("client-credentials", {
        username: "testuser",
        password: "password123",
        redirect: false,
      })
    })
  })

  it("calls signIn with artist credentials", async () => {
    ;(signIn as jest.Mock).mockResolvedValue({ ok: true })
    
    render(<LoginForm userType="artist" />)
    
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "artistuser" },
    })
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "artistpass" },
    })
    
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }))

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith("artist-credentials", {
        username: "artistuser",
        password: "artistpass",
        redirect: false,
      })
    })
  })

  it("redirects to dashboard on successful login", async () => {
    ;(signIn as jest.Mock).mockResolvedValue({ ok: true })
    
    render(<LoginForm userType="client" />)
    
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "testuser" },
    })
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    })
    
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/client/dashboard")
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it("shows error message on failed login", async () => {
    ;(signIn as jest.Mock).mockResolvedValue({ error: "Invalid credentials" })
    
    render(<LoginForm userType="client" />)
    
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "testuser" },
    })
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrongpass" },
    })
    
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }))

    await waitFor(() => {
      expect(screen.getByText("Invalid username or password")).toBeInTheDocument()
    })
  })

  it("disables form while loading", async () => {
    ;(signIn as jest.Mock).mockImplementation(() => new Promise(() => {})) // Never resolves
    
    render(<LoginForm userType="client" />)
    
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "testuser" },
    })
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    })
    
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }))

    await waitFor(() => {
      expect(screen.getByLabelText("Username")).toBeDisabled()
      expect(screen.getByLabelText("Password")).toBeDisabled()
      expect(screen.getByRole("button", { name: /Signing in/ })).toBeDisabled()
    })
  })

  it("shows loading spinner when signing in", async () => {
    ;(signIn as jest.Mock).mockImplementation(() => new Promise(() => {})) // Never resolves
    
    render(<LoginForm userType="client" />)
    
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "testuser" },
    })
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    })
    
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }))

    await waitFor(() => {
      expect(screen.getByText("Signing in...")).toBeInTheDocument()
      const button = screen.getByRole("button")
      const spinner = button.querySelector(".animate-spin")
      expect(spinner).toBeInTheDocument()
    })
  })
})