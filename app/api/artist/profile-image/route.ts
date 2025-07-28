import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { deleteCloudinaryImage } from "@/lib/cloudinary-admin"
import { extractPublicIdFromUrl } from "@/lib/cloudinary-utils"
import { z } from "zod"

// Validation schema
const profileImageSchema = z.object({
  publicId: z.string().min(1).max(500),
})

// PUT /api/artist/profile-image - Update artist's profile image
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
    
    const validationResult = profileImageSchema.safeParse(body)
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
      select: { profileImage: true }
    })

    if (!currentArtist) {
      return NextResponse.json(
        { error: "Artist profile not found" },
        { status: 404 }
      )
    }

    // Delete old profile image from Cloudinary if it exists
    if (currentArtist.profileImage) {
      try {
        // Extract public ID if it's a full URL
        const publicIdToDelete = extractPublicIdFromUrl(currentArtist.profileImage) || currentArtist.profileImage
        await deleteCloudinaryImage(publicIdToDelete)
      } catch (deleteError) {
        // Log error but continue with update
        console.error("Failed to delete old image from Cloudinary:", deleteError)
      }
    }

    // Update artist profile with new image
    const updatedArtist = await prisma.makeupArtist.update({
      where: { id: session.user.id },
      data: {
        profileImage: publicId,
        profileImageVersion: { increment: 1 }
      },
      select: {
        id: true,
        profileImage: true,
        profileImageVersion: true,
      }
    })

    return NextResponse.json({
      message: "Profile image updated successfully",
      artist: updatedArtist
    })

  } catch (error) {
    console.error("Error updating profile image:", error)
    return NextResponse.json(
      { error: "Failed to update profile image" },
      { status: 500 }
    )
  }
}