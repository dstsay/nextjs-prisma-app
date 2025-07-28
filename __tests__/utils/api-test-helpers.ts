import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createTestArtist, createTestClient } from "../fixtures/testData"

// Mock auth function
jest.mock("@/lib/auth")

// Types
interface MockSession {
  user: {
    id: string
    email: string
    name: string
    userType: "client" | "artist"
  }
}

interface TestRequestOptions {
  method?: string
  body?: any
  headers?: Record<string, string>
  session?: MockSession | null
}

// Helper to create a mock NextRequest
export function createMockRequest(
  url: string,
  options: TestRequestOptions = {}
): any {
  const { method = "GET", body, headers = {}, session } = options

  // Set auth mock if session provided
  if (session !== undefined) {
    mockAuth(session)
  }

  // Create mock request object that matches what the API expects
  return {
    url,
    method,
    headers: new Headers({
      "Content-Type": "application/json",
      ...headers,
    }),
    json: async () => body,
    text: async () => JSON.stringify(body),
  }
}

// Helper to mock authentication
export function mockAuth(session: MockSession | null) {
  (auth as jest.Mock).mockResolvedValue(session)
}

// Helper to clear auth mock
export function clearAuthMock() {
  (auth as jest.Mock).mockReset()
}

// Helper to create authenticated artist session
export async function createAuthenticatedArtistSession() {
  const artist = await createTestArtist()
  const session: MockSession = {
    user: {
      id: artist.id,
      email: artist.email,
      name: artist.name,
      userType: "artist",
    },
  }
  mockAuth(session)
  return { artist, session }
}

// Helper to create authenticated client session
export async function createAuthenticatedClientSession() {
  const client = await createTestClient()
  const session: MockSession = {
    user: {
      id: client.id,
      email: client.email,
      name: client.name,
      userType: "client",
    },
  }
  mockAuth(session)
  return { client, session }
}

// Helper to parse response
export async function parseResponse(response: NextResponse) {
  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

// Import our new cleanup function
import { cleanupDatabase as cleanupDatabaseImpl } from './database-cleanup'

// Database helpers
export async function cleanupDatabase() {
  await cleanupDatabaseImpl(prisma)
}

// Test data helpers
export const validArtistProfileData = {
  name: "Test Artist Updated",
  bio: "Updated bio for testing",
  specialties: ["Bridal", "Editorial", "Glam"],
  yearsExperience: 7,
  location: "Los Angeles, CA",
  badges: ["Certified Pro", "Best of 2024"],
  hourlyRate: 200,
  isAvailable: true,
}

export const invalidArtistProfileData = {
  name: "", // Invalid: empty name
  bio: "a".repeat(1001), // Invalid: exceeds max length
  specialties: ["a".repeat(51)], // Invalid: specialty too long
  yearsExperience: -1, // Invalid: negative
  location: "a".repeat(101), // Invalid: too long
  badges: Array(11).fill("badge"), // Invalid: too many badges
  hourlyRate: 100001, // Invalid: exceeds max
  isAvailable: "yes", // Invalid: should be boolean
}

// Assertion helpers
export function expectUnauthorizedResponse(response: NextResponse, data: any) {
  expect(response.status).toBe(401)
  expect(data.error).toContain("Unauthorized")
}

export function expectBadRequestResponse(response: NextResponse, data: any) {
  expect(response.status).toBe(400)
  expect(data.error).toBeDefined()
}

export function expectSuccessResponse(response: NextResponse) {
  expect(response.status).toBe(200)
}

export function expectNotFoundResponse(response: NextResponse, data: any) {
  expect(response.status).toBe(404)
  expect(data.error).toBeDefined()
}