// ============================================================================
// EMAIL SERVICE CONFIGURATION
// ============================================================================
// To switch back to SendGrid:
// 1. Comment out the RESEND IMPLEMENTATION section
// 2. Uncomment the SENDGRID IMPLEMENTATION section
// 3. Update your environment variables to use SENDGRID_API_KEY
// ============================================================================

// === SENDGRID IMPLEMENTATION (CURRENTLY DISABLED) ===
// import sgMail from '@sendgrid/mail'
// const sendgridApiKey = process.env.SENDGRID_API_KEY
// const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com'
// if (sendgridApiKey) {
//   sgMail.setApiKey(sendgridApiKey)
// }

// === RESEND IMPLEMENTATION (CURRENTLY ACTIVE) ===
import { Resend } from 'resend'
import crypto from 'crypto'

const resendApiKey = process.env.RESEND_API_KEY
const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com'

const resend = resendApiKey ? new Resend(resendApiKey) : null

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function getVerificationExpiry(): Date {
  const expiry = new Date()
  expiry.setHours(expiry.getHours() + 24) // 24 hour expiry
  return expiry
}

export async function sendVerificationEmail(
  to: string,
  username: string,
  verificationToken: string
): Promise<void> {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}`

  const emailContent = {
    subject: 'Verify your email address',
    text: `Hi ${username},\n\nPlease verify your email address by clicking the link below:\n\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, you can safely ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verify your email address</h2>
        <p>Hi ${username},</p>
        <p>Please verify your email address by clicking the button below:</p>
        <div style="margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #3b82f6; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #6b7280;">${verificationUrl}</p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `,
  }

  // === SENDGRID IMPLEMENTATION (CURRENTLY DISABLED) ===
  // if (!sendgridApiKey) {
  //   console.error('SendGrid API key not configured')
  //   throw new Error('Email service not configured')
  // }
  // 
  // const msg = {
  //   to,
  //   from: fromEmail,
  //   subject: emailContent.subject,
  //   text: emailContent.text,
  //   html: emailContent.html,
  // }
  // 
  // try {
  //   await sgMail.send(msg)
  //   console.log('Verification email sent successfully via SendGrid')
  // } catch (error) {
  //   console.error('Error sending verification email via SendGrid:', error)
  //   throw new Error('Failed to send verification email')
  // }

  // === RESEND IMPLEMENTATION (CURRENTLY ACTIVE) ===
  if (!resend || !resendApiKey) {
    console.error('Resend API key not configured')
    throw new Error('Email service not configured')
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    })

    if (error) {
      console.error('Error sending verification email via Resend:', error)
      throw new Error('Failed to send verification email')
    }

    console.log('Verification email sent successfully via Resend')
  } catch (error) {
    console.error('Error sending verification email via Resend:', error)
    throw new Error('Failed to send verification email')
  }
}

export async function sendPasswordResetEmail(
  to: string,
  username: string,
  resetToken: string
): Promise<void> {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`

  const emailContent = {
    subject: 'Reset your password',
    text: `Hi ${username},\n\nYou requested to reset your password. Click the link below:\n\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset your password</h2>
        <p>Hi ${username},</p>
        <p>You requested to reset your password. Click the button below:</p>
        <div style="margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #3b82f6; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          This link will expire in 1 hour. If you didn't request this, please ignore this email.
        </p>
      </div>
    `,
  }

  // === SENDGRID IMPLEMENTATION (CURRENTLY DISABLED) ===
  // if (!sendgridApiKey) {
  //   console.error('SendGrid API key not configured')
  //   throw new Error('Email service not configured')
  // }
  // 
  // const msg = {
  //   to,
  //   from: fromEmail,
  //   subject: emailContent.subject,
  //   text: emailContent.text,
  //   html: emailContent.html,
  // }
  // 
  // try {
  //   await sgMail.send(msg)
  //   console.log('Password reset email sent successfully via SendGrid')
  // } catch (error) {
  //   console.error('Error sending password reset email via SendGrid:', error)
  //   throw new Error('Failed to send password reset email')
  // }

  // === RESEND IMPLEMENTATION (CURRENTLY ACTIVE) ===
  if (!resend || !resendApiKey) {
    console.error('Resend API key not configured')
    throw new Error('Email service not configured')
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    })

    if (error) {
      console.error('Error sending password reset email via Resend:', error)
      throw new Error('Failed to send password reset email')
    }

    console.log('Password reset email sent successfully via Resend')
  } catch (error) {
    console.error('Error sending password reset email via Resend:', error)
    throw new Error('Failed to send password reset email')
  }
}