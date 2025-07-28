import { describe, it, expect, jest, beforeEach } from "@jest/globals"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

// Mock next/navigation
jest.mock("next/navigation", () => ({
  redirect: jest.fn((url: string) => {
    throw new Error("NEXT_REDIRECT")
  }),
}))

// Import after mocks are set up
import { 
  getCurrentUser, 
  requireAuth, 
  requireClientAuth, 
  requireArtistAuth,
  getLoginUrl,
  getDashboardUrl,
  isValidUserType 
} from "@/lib/auth-helpers"

// Get mocked functions for assertions
const mockAuth = auth as jest.MockedFunction<typeof auth>
const mockRedirect = redirect as jest.MockedFunction<typeof redirect>

describe("Auth Helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("getCurrentUser", () => {
    it("should return user from session", async () => {
      const mockUser = { id: "1", email: "test@example.com", userType: "client" }
      mockAuth.mockResolvedValue({ user: mockUser })

      const user = await getCurrentUser()
      expect(user).toEqual(mockUser)
      expect(mockAuth).toHaveBeenCalled()
    })

    it("should return undefined when no session", async () => {
      mockAuth.mockResolvedValue(null)

      const user = await getCurrentUser()
      expect(user).toBeUndefined()
    })
  })

  describe("requireAuth", () => {
    it("should redirect to signin when no user", async () => {
      mockAuth.mockResolvedValue(null)

      await expect(requireAuth()).rejects.toThrow("NEXT_REDIRECT")
    })

    it("should redirect to unauthorized when user type mismatch", async () => {
      const mockUser = { id: "1", email: "test@example.com", userType: "client" }
      mockAuth.mockResolvedValue({ user: mockUser })

      await expect(requireAuth("artist")).rejects.toThrow("NEXT_REDIRECT")
    })

    it("should return user when authorized", async () => {
      const mockUser = { id: "1", email: "test@example.com", userType: "client" }
      mockAuth.mockResolvedValue({ user: mockUser })

      const user = await requireAuth("client")
      expect(user).toEqual(mockUser)
    })
  })

  describe("requireClientAuth", () => {
    it("should call requireAuth with client type", async () => {
      const mockUser = { id: "1", email: "test@example.com", userType: "client" }
      mockAuth.mockResolvedValue({ user: mockUser })

      const user = await requireClientAuth()
      expect(user).toEqual(mockUser)
    })

    it("should redirect when user is artist", async () => {
      const mockUser = { id: "1", email: "test@example.com", userType: "artist" }
      mockAuth.mockResolvedValue({ user: mockUser })

      await expect(requireClientAuth()).rejects.toThrow("NEXT_REDIRECT")
    })
  })

  describe("requireArtistAuth", () => {
    it("should call requireAuth with artist type", async () => {
      const mockUser = { id: "1", email: "test@example.com", userType: "artist" }
      mockAuth.mockResolvedValue({ user: mockUser })

      const user = await requireArtistAuth()
      expect(user).toEqual(mockUser)
    })

    it("should redirect when user is client", async () => {
      const mockUser = { id: "1", email: "test@example.com", userType: "client" }
      mockAuth.mockResolvedValue({ user: mockUser })

      await expect(requireArtistAuth()).rejects.toThrow("NEXT_REDIRECT")
    })
  })

  describe("getLoginUrl", () => {
    it("should return client login URL", () => {
      expect(getLoginUrl("client")).toBe("/auth/client/login")
    })

    it("should return artist login URL", () => {
      expect(getLoginUrl("artist")).toBe("/auth/artist/login")
    })
  })

  describe("getDashboardUrl", () => {
    it("should return client dashboard URL", () => {
      expect(getDashboardUrl("client")).toBe("/client/dashboard")
    })

    it("should return artist dashboard URL", () => {
      expect(getDashboardUrl("artist")).toBe("/artist/dashboard")
    })
  })

  describe("isValidUserType", () => {
    it("should return true for valid user types", () => {
      expect(isValidUserType("client")).toBe(true)
      expect(isValidUserType("artist")).toBe(true)
    })

    it("should return false for invalid user types", () => {
      expect(isValidUserType("admin")).toBe(false)
      expect(isValidUserType("")).toBe(false)
      expect(isValidUserType("random")).toBe(false)
    })
  })
})