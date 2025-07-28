import { NextRequest, NextResponse } from "next/server"
import middleware from "@/middleware"

// Mock the auth function
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}))

import { auth } from "@/lib/auth"

describe("Middleware", () => {
  let mockRequest: NextRequest

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const createMockRequest = (pathname: string) => {
    return new NextRequest(new URL(`http://localhost:3000${pathname}`))
  }

  describe("Protected Routes", () => {
    it("redirects to client login when accessing client routes without auth", async () => {
      ;(auth as jest.Mock).mockResolvedValue(null)
      mockRequest = createMockRequest("/client/dashboard")

      const response = await middleware(mockRequest)

      expect(response?.status).toBe(307)
      expect(response?.headers.get("location")).toContain("/auth/client/login")
      expect(response?.headers.get("location")).toContain("callbackUrl=%2Fclient%2Fdashboard")
    })

    it("redirects to artist login when accessing artist routes without auth", async () => {
      ;(auth as jest.Mock).mockResolvedValue(null)
      mockRequest = createMockRequest("/artist/dashboard")

      const response = await middleware(mockRequest)

      expect(response?.status).toBe(307)
      expect(response?.headers.get("location")).toContain("/auth/artist/login")
      expect(response?.headers.get("location")).toContain("callbackUrl=%2Fartist%2Fdashboard")
    })

    it("allows access to client routes for authenticated clients", async () => {
      ;(auth as jest.Mock).mockResolvedValue({
        user: { id: "1", userType: "client" }
      })
      mockRequest = createMockRequest("/client/dashboard")

      const response = await middleware(mockRequest)

      expect(response).toBeInstanceOf(NextResponse)
      expect(response?.status).toBe(200)
    })

    it("allows access to artist routes for authenticated artists", async () => {
      ;(auth as jest.Mock).mockResolvedValue({
        user: { id: "1", userType: "artist" }
      })
      mockRequest = createMockRequest("/artist/dashboard")

      const response = await middleware(mockRequest)

      expect(response).toBeInstanceOf(NextResponse)
      expect(response?.status).toBe(200)
    })
  })

  describe("Role-based Access Control", () => {
    it("redirects to unauthorized when client accesses artist routes", async () => {
      ;(auth as jest.Mock).mockResolvedValue({
        user: { id: "1", userType: "client" }
      })
      mockRequest = createMockRequest("/artist/dashboard")

      const response = await middleware(mockRequest)

      expect(response?.status).toBe(307)
      expect(response?.headers.get("location")).toContain("/auth/unauthorized")
    })

    it("redirects to unauthorized when artist accesses client routes", async () => {
      ;(auth as jest.Mock).mockResolvedValue({
        user: { id: "1", userType: "artist" }
      })
      mockRequest = createMockRequest("/client/dashboard")

      const response = await middleware(mockRequest)

      expect(response?.status).toBe(307)
      expect(response?.headers.get("location")).toContain("/auth/unauthorized")
    })
  })

  describe("Auth Routes", () => {
    it("redirects authenticated clients away from login pages", async () => {
      ;(auth as jest.Mock).mockResolvedValue({
        user: { id: "1", userType: "client" }
      })
      mockRequest = createMockRequest("/auth/client/login")

      const response = await middleware(mockRequest)

      expect(response?.status).toBe(307)
      expect(response?.headers.get("location")).toContain("/client/dashboard")
    })

    it("redirects authenticated artists away from login pages", async () => {
      ;(auth as jest.Mock).mockResolvedValue({
        user: { id: "1", userType: "artist" }
      })
      mockRequest = createMockRequest("/auth/artist/login")

      const response = await middleware(mockRequest)

      expect(response?.status).toBe(307)
      expect(response?.headers.get("location")).toContain("/artist/dashboard")
    })

    it("allows unauthenticated users to access login pages", async () => {
      ;(auth as jest.Mock).mockResolvedValue(null)
      mockRequest = createMockRequest("/auth/client/login")

      const response = await middleware(mockRequest)

      expect(response).toBeInstanceOf(NextResponse)
      expect(response?.status).toBe(200)
    })
  })

  describe("Unprotected Routes", () => {
    it("allows access to unprotected routes without auth", async () => {
      ;(auth as jest.Mock).mockResolvedValue(null)
      mockRequest = createMockRequest("/")

      const response = await middleware(mockRequest)

      expect(response).toBeInstanceOf(NextResponse)
      expect(response?.status).toBe(200)
    })

    it("allows access to unprotected routes with auth", async () => {
      ;(auth as jest.Mock).mockResolvedValue({
        user: { id: "1", userType: "client" }
      })
      mockRequest = createMockRequest("/about")

      const response = await middleware(mockRequest)

      expect(response).toBeInstanceOf(NextResponse)
      expect(response?.status).toBe(200)
    })
  })
})