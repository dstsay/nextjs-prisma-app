import { POST } from "@/app/api/auth/signup/route"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"

// Mock NextRequest
class MockNextRequest {
  url: string
  method: string
  private body: string

  constructor(url: string, init?: { method?: string; body?: string }) {
    this.url = url
    this.method = init?.method || "GET"
    this.body = init?.body || ""
  }

  async json() {
    return JSON.parse(this.body)
  }
}

// Mock dependencies
jest.mock("@/lib/prisma", () => ({
  prisma: {
    client: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    makeupArtist: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
}))

// Mock zod
jest.mock("zod", () => ({
  z: {
    object: jest.fn(() => ({
      parse: jest.fn((data) => data),
    })),
    string: jest.fn(() => ({
      min: jest.fn().mockReturnThis(),
      max: jest.fn().mockReturnThis(),
      email: jest.fn().mockReturnThis(),
      optional: jest.fn().mockReturnThis(),
    })),
    literal: jest.fn((value) => value),
  },
  ZodError: class ZodError extends Error {
    errors: any[]
    constructor(errors: any[]) {
      super("Validation error")
      this.errors = errors
    }
  },
}))

describe("POST /api/auth/signup", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const createRequest = (body: any) => {
    return new MockNextRequest("http://localhost:3000/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(body),
    }) as any
  }

  describe("Client Signup", () => {
    it("creates a new client successfully", async () => {
      const requestBody = {
        username: "testclient",
        email: "client@example.com",
        password: "password123",
        name: "Test Client",
        userType: "client",
      }

      ;(prisma.client.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.makeupArtist.findUnique as jest.Mock).mockResolvedValue(null)
      ;(hash as jest.Mock).mockResolvedValue("hashedpassword")
      ;(prisma.client.create as jest.Mock).mockResolvedValue({
        id: "1",
        ...requestBody,
        password: "hashedpassword",
      })

      const response = await POST(createRequest(requestBody))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        message: "Client account created successfully",
        userType: "client",
      })
      expect(hash).toHaveBeenCalledWith("password123", 12)
      expect(prisma.client.create).toHaveBeenCalledWith({
        data: {
          username: "testclient",
          email: "client@example.com",
          password: "hashedpassword",
          name: "Test Client",
        },
      })
    })
  })

  describe("Artist Signup", () => {
    it("creates a new artist successfully", async () => {
      const requestBody = {
        username: "testartist",
        email: "artist@example.com",
        password: "password123",
        name: "Test Artist",
        userType: "artist",
      }

      ;(prisma.client.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.makeupArtist.findUnique as jest.Mock).mockResolvedValue(null)
      ;(hash as jest.Mock).mockResolvedValue("hashedpassword")
      ;(prisma.makeupArtist.create as jest.Mock).mockResolvedValue({
        id: "1",
        ...requestBody,
        password: "hashedpassword",
      })

      const response = await POST(createRequest(requestBody))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        message: "Artist account created successfully",
        userType: "artist",
      })
      expect(prisma.makeupArtist.create).toHaveBeenCalledWith({
        data: {
          username: "testartist",
          email: "artist@example.com",
          password: "hashedpassword",
          name: "Test Artist",
        },
      })
    })
  })

  describe("Validation", () => {
    it("returns error for invalid email", async () => {
      const requestBody = {
        username: "testuser",
        email: "invalid-email",
        password: "password123",
        userType: "client",
      }

      const response = await POST(createRequest(requestBody))
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe("Invalid input")
      expect(data.details).toBeDefined()
    })

    it("returns error for short username", async () => {
      const requestBody = {
        username: "ab",
        email: "test@example.com",
        password: "password123",
        userType: "client",
      }

      const response = await POST(createRequest(requestBody))
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe("Invalid input")
    })

    it("returns error for short password", async () => {
      const requestBody = {
        username: "testuser",
        email: "test@example.com",
        password: "12345",
        userType: "client",
      }

      const response = await POST(createRequest(requestBody))
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe("Invalid input")
    })

    it("returns error for artist without name", async () => {
      const requestBody = {
        username: "testartist",
        email: "artist@example.com",
        password: "password123",
        userType: "artist",
      }

      const response = await POST(createRequest(requestBody))
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe("Invalid input")
    })
  })

  describe("Duplicate Checks", () => {
    it("returns error when username already exists in clients", async () => {
      const requestBody = {
        username: "existinguser",
        email: "new@example.com",
        password: "password123",
        userType: "client",
      }

      ;(prisma.client.findUnique as jest.Mock)
        .mockResolvedValueOnce({ id: "1", username: "existinguser" }) // username check
        .mockResolvedValueOnce(null) // email check
      ;(prisma.makeupArtist.findUnique as jest.Mock).mockResolvedValue(null)

      const response = await POST(createRequest(requestBody))
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe("Username already taken")
    })

    it("returns error when username already exists in artists", async () => {
      const requestBody = {
        username: "existingartist",
        email: "new@example.com",
        password: "password123",
        userType: "client",
      }

      ;(prisma.client.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.makeupArtist.findUnique as jest.Mock)
        .mockResolvedValueOnce({ id: "1", username: "existingartist" }) // username check
        .mockResolvedValueOnce(null) // email check

      const response = await POST(createRequest(requestBody))
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe("Username already taken")
    })

    it("returns error when email already exists", async () => {
      const requestBody = {
        username: "newuser",
        email: "existing@example.com",
        password: "password123",
        userType: "client",
      }

      ;(prisma.client.findUnique as jest.Mock)
        .mockResolvedValueOnce(null) // username check
        .mockResolvedValueOnce({ id: "1", email: "existing@example.com" }) // email check
      ;(prisma.makeupArtist.findUnique as jest.Mock).mockResolvedValue(null)

      const response = await POST(createRequest(requestBody))
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe("Email already registered")
    })
  })

  describe("Error Handling", () => {
    it("handles database errors gracefully", async () => {
      const requestBody = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        userType: "client",
      }

      ;(prisma.client.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.makeupArtist.findUnique as jest.Mock).mockResolvedValue(null)
      ;(hash as jest.Mock).mockResolvedValue("hashedpassword")
      ;(prisma.client.create as jest.Mock).mockRejectedValue(new Error("Database error"))

      const consoleError = jest.spyOn(console, "error").mockImplementation()
      
      const response = await POST(createRequest(requestBody))
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe("An error occurred during signup")
      expect(consoleError).toHaveBeenCalled()

      consoleError.mockRestore()
    })
  })
})