import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { signIn } from "next-auth/react"
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons"

// Mock next-auth
jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}))

describe("SocialLoginButtons", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders all social login buttons", () => {
    render(<SocialLoginButtons userType="client" />)
    
    expect(screen.getByText("Continue with Google")).toBeInTheDocument()
    expect(screen.getByText("Continue with Facebook")).toBeInTheDocument()
    expect(screen.getByText("Continue with Apple")).toBeInTheDocument()
  })

  it("calls signIn with correct provider and callback URL for client", async () => {
    render(<SocialLoginButtons userType="client" />)
    
    const googleButton = screen.getByText("Continue with Google")
    fireEvent.click(googleButton)

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith("google", {
        callbackUrl: "/client/dashboard",
        redirect: true,
      })
    })
  })

  it("calls signIn with correct provider and callback URL for artist", async () => {
    render(<SocialLoginButtons userType="artist" />)
    
    const facebookButton = screen.getByText("Continue with Facebook")
    fireEvent.click(facebookButton)

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith("facebook", {
        callbackUrl: "/artist/dashboard",
        redirect: true,
      })
    })
  })

  it("uses custom callback URL when provided", async () => {
    render(<SocialLoginButtons userType="client" callbackUrl="/custom/path" />)
    
    const appleButton = screen.getByText("Continue with Apple")
    fireEvent.click(appleButton)

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith("apple", {
        callbackUrl: "/custom/path",
        redirect: true,
      })
    })
  })

  it("disables all buttons when one is loading", async () => {
    render(<SocialLoginButtons userType="client" />)
    
    const googleButton = screen.getByText("Continue with Google")
    fireEvent.click(googleButton)

    await waitFor(() => {
      const buttons = screen.getAllByRole("button")
      buttons.forEach(button => {
        expect(button).toBeDisabled()
      })
    })
  })

  it("shows loading spinner when button is clicked", async () => {
    render(<SocialLoginButtons userType="client" />)
    
    const googleButton = screen.getByText("Continue with Google")
    fireEvent.click(googleButton)

    await waitFor(() => {
      // Check for loading spinner (animate-spin class)
      const spinner = googleButton.parentElement?.querySelector(".animate-spin")
      expect(spinner).toBeInTheDocument()
    })
  })
})