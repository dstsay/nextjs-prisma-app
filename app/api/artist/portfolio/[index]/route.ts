import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { deleteCloudinaryImage } from "@/lib/cloudinary-admin"
import { extractPublicIdFromUrl } from "@/lib/cloudinary-utils"

// DELETE /api/artist/portfolio/[index] - Remove image from portfolio
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ index: string }> }
) {
  try {
    // Verify authentication
    const session = await auth()
    
    if (!session?.user || session.user.userType !== "artist") {
      return NextResponse.json(
        { error: "Unauthorized. Artist authentication required." },
        { status: 401 }
      )
    }

    // Get params
    const { index: indexParam } = await params

    // Validate index parameter
    const index = parseInt(indexParam, 10)
    if (isNaN(index) || index < 0) {
      return NextResponse.json(
        { error: "Invalid image index" },
        { status: 400 }
      )
    }

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

    const portfolioImages = currentArtist.portfolioImages || []

    // Check if index is valid
    if (index >= portfolioImages.length) {
      return NextResponse.json(
        { error: "Image index out of bounds" },
        { status: 400 }
      )
    }

    // Get the image URL/public ID to delete
    const imageToDelete = portfolioImages[index]
    
    // Extract public ID from URL if it's a full URL
    const publicId = extractPublicIdFromUrl(imageToDelete)
    
    if (publicId) {
      // Delete from Cloudinary
      const deleteResult = await deleteCloudinaryImage(publicId)
      if (!deleteResult.success) {
        console.error("Failed to delete from Cloudinary:", deleteResult.error)
        // Continue with database update even if Cloudinary deletion fails
      }
    } else {
      console.error("Could not extract public ID from:", imageToDelete)
    }

    // Remove image from array
    const updatedImages = portfolioImages.filter((_, i) => i !== index)

    // Update artist profile
    const updatedArtist = await prisma.makeupArtist.update({
      where: { id: session.user.id },
      data: {
        portfolioImages: updatedImages
      },
      select: {
        id: true,
        portfolioImages: true,
      }
    })

    return NextResponse.json({
      message: "Image removed from portfolio successfully",
      portfolioImages: updatedArtist.portfolioImages
    })

  } catch (error) {
    console.error("Error removing portfolio image:", error)
    return NextResponse.json(
      { error: "Failed to remove image from portfolio" },
      { status: 500 }
    )
  }
}