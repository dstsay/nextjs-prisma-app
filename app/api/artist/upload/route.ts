import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { uploadToCloudinary } from "@/lib/cloudinary-admin"

// POST /api/artist/upload - Upload image with server-side authentication
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

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary with specific folder
    const result = await uploadToCloudinary(buffer, {
      folder: folder || `goldiegrace/artists/${session.user.id}`,
      public_id: `${Date.now()}_${file.name.replace(/\.[^/.]+$/, '')}`.replace(/[^a-zA-Z0-9_-]/g, '_')
    })

    if (!result.success || !result.result) {
      return NextResponse.json(
        { error: "Upload failed" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      url: result.result.secure_url,
      publicId: result.result.public_id
    })

  } catch (error) {
    console.error("Error uploading image:", error)
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    )
  }
}