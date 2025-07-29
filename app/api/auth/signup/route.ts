import { NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { generateVerificationToken, getVerificationExpiry, sendVerificationEmail } from "@/lib/email"

const clientSignupSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  userType: z.literal("client"),
})

const artistSignupSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  userType: z.literal("artist"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input based on user type
    let validatedData: any
    if (body.userType === "artist") {
      validatedData = artistSignupSchema.parse(body)
    } else {
      validatedData = clientSignupSchema.parse(body)
    }
    
    // Check if username already exists
    const existingClient = await prisma.client.findUnique({
      where: { username: validatedData.username },
    })
    const existingArtist = await prisma.makeupArtist.findUnique({
      where: { username: validatedData.username },
    })
    
    // Debug logging
    console.log('Signup check for username:', validatedData.username)
    console.log('Client found:', existingClient)
    console.log('Artist found:', existingArtist)
    
    if (existingClient || existingArtist) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 }
      )
    }
    
    // Check if email already exists (case-insensitive)
    const existingClientEmail = await prisma.client.findFirst({
      where: { email: { equals: validatedData.email, mode: 'insensitive' } },
    })
    const existingArtistEmail = await prisma.makeupArtist.findFirst({
      where: { email: { equals: validatedData.email, mode: 'insensitive' } },
    })
    
    if (existingClientEmail || existingArtistEmail) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      )
    }
    
    // Hash password
    const hashedPassword = await hash(validatedData.password, 12)
    
    // Create user based on type
    if (validatedData.userType === "artist") {
      const artist = await prisma.makeupArtist.create({
        data: {
          username: validatedData.username,
          email: validatedData.email,
          password: hashedPassword,
          name: validatedData.name,
        },
      })
      
      return NextResponse.json({
        message: "Artist account created successfully",
        userType: "artist",
      })
    } else {
      // Generate verification token
      const verificationToken = generateVerificationToken()
      const verificationExpiry = getVerificationExpiry()

      const client = await prisma.client.create({
        data: {
          username: validatedData.username,
          email: validatedData.email,
          password: hashedPassword,
          name: validatedData.name,
          emailVerificationToken: verificationToken,
          emailVerificationExpires: verificationExpiry,
        },
      })

      // Send verification email
      try {
        await sendVerificationEmail(client.email, client.username, verificationToken)
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError)
        // Continue with signup even if email fails
      }
      
      return NextResponse.json({
        message: "Client account created successfully. Please check your email to verify your account.",
        userType: "client",
      })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.format() },
        { status: 400 }
      )
    }
    
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "An error occurred during signup" },
      { status: 500 }
    )
  }
}