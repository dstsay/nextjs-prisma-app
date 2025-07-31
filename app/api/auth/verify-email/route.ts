import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl?.searchParams || new URLSearchParams()
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      )
    }

    // Find client with this token
    const client = await prisma.client.findUnique({
      where: { emailVerificationToken: token },
    })

    if (!client) {
      return NextResponse.json(
        { error: "Invalid verification token" },
        { status: 400 }
      )
    }

    // Check if token has expired
    if (client.emailVerificationExpires && client.emailVerificationExpires < new Date()) {
      return NextResponse.json(
        { error: "Verification token has expired" },
        { status: 400 }
      )
    }

    // Check if already verified
    if (client.emailVerified) {
      return NextResponse.json({
        message: "Email already verified",
        alreadyVerified: true,
      })
    }

    // Update client to mark email as verified
    await prisma.client.update({
      where: { id: client.id },
      data: {
        emailVerified: new Date(),
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    })

    return NextResponse.json({
      message: "Email verified successfully",
      username: client.username,
    })
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json(
      { error: "An error occurred during verification" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Find client by email
    const client = await prisma.client.findUnique({
      where: { email },
    })

    if (!client) {
      // Don't reveal if email exists or not
      return NextResponse.json({
        message: "If an account exists with this email, a new verification link has been sent.",
      })
    }

    // Check if already verified
    if (client.emailVerified) {
      return NextResponse.json({
        message: "Email is already verified",
        alreadyVerified: true,
      })
    }

    // Import email utilities dynamically to avoid circular dependencies
    const { generateVerificationToken, getVerificationExpiry, sendVerificationEmail } = await import("../../../../src/lib/email")

    // Generate new verification token
    const verificationToken = generateVerificationToken()
    const verificationExpiry = getVerificationExpiry()

    // Update client with new token
    await prisma.client.update({
      where: { id: client.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpiry,
      },
    })

    // Send verification email
    try {
      await sendVerificationEmail(client.email, client.username, verificationToken)
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError)
      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: "A new verification link has been sent to your email.",
    })
  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}