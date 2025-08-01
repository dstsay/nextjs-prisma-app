import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// List of common US timezones
const VALID_TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
];

// Validation schema for profile updates
const profileUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(), // Make optional for backward compatibility
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  bio: z.string().max(1000).optional().nullable(),
  specialties: z.array(z.string().max(50)).max(10),
  yearsExperience: z.number().min(0).max(50).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  timezone: z.string().refine(tz => VALID_TIMEZONES.includes(tz), {
    message: "Invalid timezone. Please select a valid US timezone.",
  }).optional(),
  badges: z.array(z.string().max(50)).max(10),
  hourlyRate: z.number().min(0).max(10000).optional().nullable(),
  isAvailable: z.boolean(),
})

// GET /api/artist/profile - Get authenticated artist's profile
export async function GET() {
  try {
    // Verify authentication
    const session = await auth()
    
    if (!session?.user || session.user.userType !== "artist") {
      return NextResponse.json(
        { error: "Unauthorized. Artist authentication required." },
        { status: 401 }
      )
    }

    // Fetch artist profile using authenticated user ID
    const artist = await prisma.makeupArtist.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        bio: true,
        specialties: true,
        yearsExperience: true,
        location: true,
        timezone: true,
        badges: true,
        hourlyRate: true,
        isAvailable: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!artist) {
      return NextResponse.json(
        { error: "Artist profile not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(artist)
  } catch (error) {
    console.error("Error fetching artist profile:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT /api/artist/profile - Update authenticated artist's profile
export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth()
    
    if (!session?.user || session.user.userType !== "artist") {
      return NextResponse.json(
        { error: "Unauthorized. Artist authentication required." },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    
    // Validate input data
    const validationResult = profileUpdateSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid input data", 
          details: validationResult.error.flatten() 
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Compute full name if firstName and lastName are provided
    let computedName = data.name
    if (data.firstName || data.lastName) {
      computedName = `${data.firstName || ''} ${data.lastName || ''}`.trim()
    }

    // Update only the authenticated artist's profile
    const updatedArtist = await prisma.makeupArtist.update({
      where: { 
        id: session.user.id // Use session ID, never trust client-provided IDs
      },
      data: {
        name: computedName || data.name,
        firstName: data.firstName,
        lastName: data.lastName,
        bio: data.bio,
        specialties: data.specialties,
        yearsExperience: data.yearsExperience,
        location: data.location,
        timezone: data.timezone,
        badges: data.badges,
        hourlyRate: data.hourlyRate,
        isAvailable: data.isAvailable,
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        bio: true,
        specialties: true,
        yearsExperience: true,
        location: true,
        timezone: true,
        badges: true,
        hourlyRate: true,
        isAvailable: true,
        updatedAt: true,
      }
    })

    return NextResponse.json({
      message: "Profile updated successfully",
      artist: updatedArtist
    })

  } catch (error) {
    console.error("Error updating artist profile:", error)
    
    // Don't expose internal errors to client
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}

// Prevent other HTTP methods
export async function POST() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  )
}