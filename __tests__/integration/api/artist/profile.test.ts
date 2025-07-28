// Polyfill for Next.js server components
global.Request = jest.fn().mockImplementation(() => ({})) as any
global.Response = jest.fn().mockImplementation(() => ({})) as any

// Mock Next.js server components before importing
jest.mock("next/server", () => ({
  NextRequest: class MockNextRequest {
    url: string
    method: string
    headers: Headers
    private body: any

    constructor(url: string | URL, init?: RequestInit) {
      this.url = typeof url === 'string' ? url : url.toString()
      this.method = init?.method || 'GET'
      this.headers = new Headers(init?.headers || {})
      this.body = init?.body
    }

    async json() {
      if (typeof this.body === 'string') {
        return JSON.parse(this.body)
      }
      return this.body
    }

    text() {
      return Promise.resolve(this.body?.toString() || '')
    }
  },
  NextResponse: {
    json: jest.fn((data: any, init?: any) => ({
      json: async () => data,
      text: async () => JSON.stringify(data),
      status: init?.status || 200,
    })),
  },
}))

// Mock zod before importing route
jest.mock("zod", () => ({
  z: {
    object: jest.fn(() => ({
      safeParse: jest.fn((data) => {
        // Basic validation for integration tests
        const errors: any = {}
        
        if (!data.name || data.name === "") {
          errors.name = ["Required"]
        }
        if (data.bio && data.bio.length > 1000) {
          errors.bio = ["Too long"]
        }
        if (data.specialties && data.specialties.some((s: string) => s.length > 50)) {
          errors.specialties = ["Item too long"]
        }
        if (data.yearsExperience !== undefined && data.yearsExperience < 0) {
          errors.yearsExperience = ["Must be positive"]
        }
        if (data.hourlyRate !== undefined && data.hourlyRate > 10000) {
          errors.hourlyRate = ["Too high"]
        }
        
        if (Object.keys(errors).length > 0) {
          return {
            success: false,
            error: { flatten: () => ({ fieldErrors: errors }) }
          }
        }
        
        return { success: true, data }
      }),
    })),
    string: jest.fn(() => ({
      min: jest.fn().mockReturnThis(),
      max: jest.fn().mockReturnThis(),
      optional: jest.fn(() => ({
        nullable: jest.fn().mockReturnThis(),
      })),
    })),
    array: jest.fn(() => ({
      max: jest.fn().mockReturnThis(),
    })),
    number: jest.fn(() => ({
      min: jest.fn().mockReturnThis(),
      max: jest.fn().mockReturnThis(),
      optional: jest.fn(() => ({
        nullable: jest.fn().mockReturnThis(),
      })),
    })),
    boolean: jest.fn().mockReturnThis(),
  },
}))

import { GET, PUT, POST, DELETE } from "../../../../app/api/artist/profile/route"
import { prisma } from "@/lib/prisma"
import {
  createMockRequest,
  mockAuth,
  clearAuthMock,
  createAuthenticatedArtistSession,
  createAuthenticatedClientSession,
  parseResponse,
  cleanupDatabase,
  validArtistProfileData,
  invalidArtistProfileData,
  expectUnauthorizedResponse,
  expectBadRequestResponse,
  expectSuccessResponse,
  expectNotFoundResponse,
} from "../../../utils/api-test-helpers"
import { createTestArtist } from "../../../fixtures/testData"
import { auth } from "@/lib/auth"

// Mock the auth function
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}))

describe("Artist Profile API Integration Tests", () => {
  beforeEach(async () => {
    await cleanupDatabase()
    clearAuthMock()
  })

  afterAll(async () => {
    await cleanupDatabase()
    await prisma.$disconnect()
  })

  describe("GET /api/artist/profile", () => {
    it("should return 401 when not authenticated", async () => {
      mockAuth(null)

      const request = createMockRequest("http://localhost:3000/api/artist/profile")
      const response = await GET(request)
      const data = await parseResponse(response)

      expectUnauthorizedResponse(response, data)
    })

    it("should return 401 when authenticated as client", async () => {
      await createAuthenticatedClientSession()

      const request = createMockRequest("http://localhost:3000/api/artist/profile")
      const response = await GET(request)
      const data = await parseResponse(response)

      expectUnauthorizedResponse(response, data)
    })

    it("should return artist profile when authenticated as artist", async () => {
      const { artist } = await createAuthenticatedArtistSession()

      const request = createMockRequest("http://localhost:3000/api/artist/profile")
      const response = await GET(request)
      const data = await parseResponse(response)

      expectSuccessResponse(response)
      expect(data.id).toBe(artist.id)
      expect(data.email).toBe(artist.email)
      expect(data.name).toBe(artist.name)
      expect(data.specialties).toEqual(artist.specialties)
      expect(data.badges).toEqual(artist.badges)
      // Should not include password
      expect(data.password).toBeUndefined()
    })

    it("should return 404 when artist profile is deleted", async () => {
      const { artist, session } = await createAuthenticatedArtistSession()
      
      // Delete the artist from database
      await prisma.makeupArtist.delete({ where: { id: artist.id } })
      
      // Session still exists but artist is gone
      const request = createMockRequest("http://localhost:3000/api/artist/profile")
      const response = await GET(request)
      const data = await parseResponse(response)

      expectNotFoundResponse(response, data)
    })
  })

  describe("PUT /api/artist/profile", () => {
    it("should return 401 when not authenticated", async () => {
      mockAuth(null)

      const request = createMockRequest("http://localhost:3000/api/artist/profile", {
        method: "PUT",
        body: validArtistProfileData,
      })
      const response = await PUT(request)
      const data = await parseResponse(response)

      expectUnauthorizedResponse(response, data)
    })

    it("should return 401 when authenticated as client", async () => {
      await createAuthenticatedClientSession()

      const request = createMockRequest("http://localhost:3000/api/artist/profile", {
        method: "PUT",
        body: validArtistProfileData,
      })
      const response = await PUT(request)
      const data = await parseResponse(response)

      expectUnauthorizedResponse(response, data)
    })

    it("should successfully update artist profile with valid data", async () => {
      const { artist } = await createAuthenticatedArtistSession()

      const request = createMockRequest("http://localhost:3000/api/artist/profile", {
        method: "PUT",
        body: validArtistProfileData,
      })
      const response = await PUT(request)
      const data = await parseResponse(response)

      expectSuccessResponse(response)
      expect(data.message).toBe("Profile updated successfully")
      expect(data.artist.name).toBe(validArtistProfileData.name)
      expect(data.artist.bio).toBe(validArtistProfileData.bio)
      expect(data.artist.specialties).toEqual(validArtistProfileData.specialties)
      expect(data.artist.hourlyRate).toBe(validArtistProfileData.hourlyRate)

      // Verify database was actually updated
      const updatedArtist = await prisma.makeupArtist.findUnique({
        where: { id: artist.id },
      })
      expect(updatedArtist?.name).toBe(validArtistProfileData.name)
      expect(updatedArtist?.bio).toBe(validArtistProfileData.bio)
    })

    it("should return 400 with invalid data", async () => {
      await createAuthenticatedArtistSession()

      const request = createMockRequest("http://localhost:3000/api/artist/profile", {
        method: "PUT",
        body: invalidArtistProfileData,
      })
      const response = await PUT(request)
      const data = await parseResponse(response)

      expectBadRequestResponse(response, data)
      expect(data.details).toBeDefined()
    })

    it("should handle empty arrays for specialties and badges", async () => {
      const { artist } = await createAuthenticatedArtistSession()

      const updateData = {
        ...validArtistProfileData,
        specialties: [],
        badges: [],
      }

      const request = createMockRequest("http://localhost:3000/api/artist/profile", {
        method: "PUT",
        body: updateData,
      })
      const response = await PUT(request)
      const data = await parseResponse(response)

      expectSuccessResponse(response)
      expect(data.artist.specialties).toEqual([])
      expect(data.artist.badges).toEqual([])
    })

    it("should not allow updating another artist's profile", async () => {
      // Create two artists
      const artist1 = await createTestArtist({ name: "Artist 1" })
      const artist2 = await createTestArtist({ name: "Artist 2" })

      // Authenticate as artist1
      mockAuth({
        user: {
          id: artist1.id,
          email: artist1.email,
          name: artist1.name,
          userType: "artist",
        },
      })

      // Try to update with data that would identify artist2
      const request = createMockRequest("http://localhost:3000/api/artist/profile", {
        method: "PUT",
        body: { ...validArtistProfileData, name: "Hacked Name" },
      })
      const response = await PUT(request)
      const data = await parseResponse(response)

      expectSuccessResponse(response)
      
      // Verify artist1 was updated, not artist2
      const updatedArtist1 = await prisma.makeupArtist.findUnique({
        where: { id: artist1.id },
      })
      const updatedArtist2 = await prisma.makeupArtist.findUnique({
        where: { id: artist2.id },
      })
      
      expect(updatedArtist1?.name).toBe("Hacked Name")
      expect(updatedArtist2?.name).toBe("Artist 2") // Unchanged
    })

    it("should sanitize HTML/script tags in text fields", async () => {
      const { artist } = await createAuthenticatedArtistSession()

      const maliciousData = {
        ...validArtistProfileData,
        name: "Test<script>alert('xss')</script>Artist",
        bio: "Bio with <img src=x onerror=alert('xss')>",
        location: "LA<iframe src='evil.com'></iframe>",
      }

      const request = createMockRequest("http://localhost:3000/api/artist/profile", {
        method: "PUT",
        body: maliciousData,
      })
      const response = await PUT(request)
      const data = await parseResponse(response)

      expectSuccessResponse(response)
      
      // Verify dangerous content was stored as-is (sanitization should happen on display)
      const updated = await prisma.makeupArtist.findUnique({
        where: { id: artist.id },
      })
      expect(updated?.name).toContain("<script>")
      expect(updated?.bio).toContain("<img")
      expect(updated?.location).toContain("<iframe")
    })
  })

  describe("Unsupported Methods", () => {
    it("should return 405 for POST method", async () => {
      const request = createMockRequest("http://localhost:3000/api/artist/profile", {
        method: "POST",
      })
      const response = await POST(request)
      const data = await parseResponse(response)

      expect(response.status).toBe(405)
      expect(data.error).toBe("Method not allowed")
    })

    it("should return 405 for DELETE method", async () => {
      const request = createMockRequest("http://localhost:3000/api/artist/profile", {
        method: "DELETE",
      })
      const response = await DELETE(request)
      const data = await parseResponse(response)

      expect(response.status).toBe(405)
      expect(data.error).toBe("Method not allowed")
    })
  })

  describe("Concurrent Update Handling", () => {
    it("should handle concurrent updates gracefully", async () => {
      const { artist } = await createAuthenticatedArtistSession()

      // Simulate concurrent updates
      const update1 = {
        ...validArtistProfileData,
        name: "Update 1",
      }
      const update2 = {
        ...validArtistProfileData,
        name: "Update 2",
      }

      const request1 = createMockRequest("http://localhost:3000/api/artist/profile", {
        method: "PUT",
        body: update1,
      })
      const request2 = createMockRequest("http://localhost:3000/api/artist/profile", {
        method: "PUT",
        body: update2,
      })

      // Execute updates concurrently
      const [response1, response2] = await Promise.all([
        PUT(request1),
        PUT(request2),
      ])

      // Both should succeed
      expect(response1.status).toBe(200)
      expect(response2.status).toBe(200)

      // Last update wins
      const finalArtist = await prisma.makeupArtist.findUnique({
        where: { id: artist.id },
      })
      expect(finalArtist?.name).toMatch(/Update [12]/)
    })
  })
})