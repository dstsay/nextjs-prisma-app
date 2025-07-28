import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema
const portfolioImageSchema = z.object({
  publicId: z.string().min(1).max(500),
})

// POST /api/artist/portfolio - Add image to portfolio
export async function POST(request: NextRequest) {
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
    
    const validationResult = portfolioImageSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid input data", 
          details: validationResult.error.flatten() 
        },
        { status: 400 }
      )
    }

    const { publicId } = validationResult.data

    // Get current artist data
    const currentArtist = await prisma.makeupArtist.findUnique({
      where: { id: session.user.id },
      select: { portfolioImages: true }
    })

    if (!currentArtist) {
      return NextResponse.json(
        { error: "Artist profile not found" },
        { status: 404 }
      )
    }

    // Check portfolio limit
    const currentImages = currentArtist.portfolioImages || []
    if (currentImages.length >= 100) {
      return NextResponse.json(
        { error: "Portfolio limit reached. Maximum 100 images allowed." },
        { status: 400 }
      )
    }

    // Add new image to portfolio
    const updatedArtist = await prisma.makeupArtist.update({
      where: { id: session.user.id },
      data: {
        portfolioImages: {
          push: publicId
        }
      },
      select: {
        id: true,
        portfolioImages: true,
      }
    })

    return NextResponse.json({
      message: "Image added to portfolio successfully",
      portfolioImages: updatedArtist.portfolioImages
    })

  } catch (error) {
    console.error("Error adding portfolio image:", error)
    return NextResponse.json(
      { error: "Failed to add image to portfolio" },
      { status: 500 }
    )
  }
}