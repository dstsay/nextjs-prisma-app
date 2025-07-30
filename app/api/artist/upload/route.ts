import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { uploadToCloudinary } from "@/lib/cloudinary-admin"
import { validateImageFile, validateImageContent, sanitizeFileName } from '@/lib/file-validation'
import { validateCSRFToken } from '@/lib/csrf'

// POST /api/artist/upload - Upload image with server-side authentication
export async function POST(request: NextRequest) {
  try {
    // Validate CSRF token
    const isValidCSRF = await validateCSRFToken(request)
    if (!isValidCSRF) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
    }

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

    // Validate file
    const fileValidation = validateImageFile(file)
    if (!fileValidation.isValid) {
      console.error("File validation failed:", fileValidation.error, "File:", file.name, "Size:", file.size, "Type:", file.type)
      return NextResponse.json(
        { error: fileValidation.error },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Validate file content
    const contentValidation = await validateImageContent(buffer)
    if (!contentValidation.isValid) {
      console.error("Content validation failed:", contentValidation.error, "File:", file.name)
      return NextResponse.json(
        { error: contentValidation.error },
        { status: 400 }
      )
    }

    // Sanitize filename
    const sanitizedName = sanitizeFileName(file.name)
    const nameWithoutExt = sanitizedName.replace(/\.[^/.]+$/, '')
    console.log("Uploading file:", file.name, "->", sanitizedName, "Size:", file.size, "Type:", file.type)

    // Upload to Cloudinary with specific folder
    const result = await uploadToCloudinary(buffer, {
      folder: folder || `goldiegrace/artists/${session.user.id}`,
      public_id: `${Date.now()}_${nameWithoutExt}`
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