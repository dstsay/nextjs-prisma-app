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

export async function sendAppointmentConfirmationEmail(
  to: string,
  recipientName: string,
  appointmentDetails: {
    id: string;
    date: Date;
    artistName: string;
    clientName: string;
    hourlyRate: number;
    type: 'client' | 'artist';
    notes?: string;
  }
): Promise<void> {
  const { id, date, artistName, clientName, hourlyRate, type, notes } = appointmentDetails;
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(date);

  const videoUrl = type === 'client' 
    ? `${process.env.NEXTAUTH_URL}/consultation/${id}/join`
    : `${process.env.NEXTAUTH_URL}/artist/consultation/${id}/host`;

  const emailContent = type === 'client' ? {
    subject: `Your Makeup Consultation Confirmed - ${formattedDate} at ${formattedTime}`,
    text: `Hi ${recipientName},

Your makeup consultation is confirmed!

APPOINTMENT DETAILS:
Date: ${formattedDate}
Time: ${formattedTime}
Artist: ${artistName}
Type: Virtual Consultation (60 minutes)
Rate: $${hourlyRate}

VIDEO CONSULTATION ACCESS:
Join your consultation: ${videoUrl}

You can join your video consultation up to 10 minutes before your scheduled time.

WHAT TO EXPECT:
• Have your current makeup products ready to show
• Ensure good lighting near a window or bright lamp
• Use your phone in a stable position
• Test your camera and microphone beforehand

Can't make it? Please cancel at least 24 hours in advance.

Questions? Reply to this email or contact support.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1f2937;">Your Makeup Consultation Confirmed</h2>
        <p>Hi ${recipientName},</p>
        <p>Your makeup consultation is confirmed!</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1f2937;">APPOINTMENT DETAILS:</h3>
          <p style="margin: 5px 0;">📅 <strong>Date:</strong> ${formattedDate}</p>
          <p style="margin: 5px 0;">⏰ <strong>Time:</strong> ${formattedTime}</p>
          <p style="margin: 5px 0;">👩‍🎨 <strong>Artist:</strong> ${artistName}</p>
          <p style="margin: 5px 0;">📱 <strong>Type:</strong> Virtual Consultation (60 minutes)</p>
          <p style="margin: 5px 0;">💰 <strong>Rate:</strong> $${hourlyRate}</p>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <h3 style="margin-top: 0; color: #1f2937;">VIDEO CONSULTATION ACCESS:</h3>
          <a href="${videoUrl}" 
             style="background-color: #9333ea; color: white; padding: 14px 28px; 
                    text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
            Join Video Consultation
          </a>
          <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">
            You can join up to 10 minutes before your scheduled time.
          </p>
        </div>
        
        <div style="margin: 20px 0;">
          <h3 style="color: #1f2937;">WHAT TO EXPECT:</h3>
          <ul style="color: #374151;">
            <li>Have your current makeup products ready to show</li>
            <li>Ensure good lighting near a window or bright lamp</li>
            <li>Use your phone in a stable position</li>
            <li>Test your camera and microphone beforehand</li>
          </ul>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">
          Can't make it? Please cancel at least 24 hours in advance.
        </p>
        <p style="color: #6b7280; font-size: 14px;">
          Questions? Reply to this email or contact support.
        </p>
      </div>
    `,
  } : {
    subject: `New Consultation Booking - ${clientName} on ${formattedDate}`,
    text: `Hi ${recipientName},

You have a new consultation booking!

CLIENT DETAILS:
Client: ${clientName}

APPOINTMENT DETAILS:
Date: ${formattedDate}
Time: ${formattedTime}
Type: Virtual Consultation (60 minutes)
Your Rate: $${hourlyRate}

${notes ? `CLIENT'S CONCERNS/NOTES:\n${notes}\n` : ''}

VIDEO CONSULTATION ACCESS:
Host your consultation: ${videoUrl}

Your client can join 10 minutes early. You'll see when they're waiting.

HOSTING TIPS:
• Review client's quiz responses beforehand
• Prepare product recommendations
• Ensure professional background
• Test your equipment before the call

Need to reschedule? Contact the client at least 24 hours in advance.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1f2937;">New Consultation Booking</h2>
        <p>Hi ${recipientName},</p>
        <p>You have a new consultation booking!</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1f2937;">CLIENT DETAILS:</h3>
          <p style="margin: 5px 0;">👤 <strong>Client:</strong> ${clientName}</p>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1f2937;">APPOINTMENT DETAILS:</h3>
          <p style="margin: 5px 0;">📅 <strong>Date:</strong> ${formattedDate}</p>
          <p style="margin: 5px 0;">⏰ <strong>Time:</strong> ${formattedTime}</p>
          <p style="margin: 5px 0;">📱 <strong>Type:</strong> Virtual Consultation (60 minutes)</p>
          <p style="margin: 5px 0;">💰 <strong>Your Rate:</strong> $${hourlyRate}</p>
        </div>
        
        ${notes ? `
        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1f2937;">CLIENT'S CONCERNS/NOTES:</h3>
          <p style="color: #374151;">${notes}</p>
        </div>
        ` : ''}
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <h3 style="margin-top: 0; color: #1f2937;">VIDEO CONSULTATION ACCESS:</h3>
          <a href="${videoUrl}" 
             style="background-color: #9333ea; color: white; padding: 14px 28px; 
                    text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
            Host Video Consultation
          </a>
          <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">
            Your client can join 10 minutes early. You'll see when they're waiting.
          </p>
        </div>
        
        <div style="margin: 20px 0;">
          <h3 style="color: #1f2937;">HOSTING TIPS:</h3>
          <ul style="color: #374151;">
            <li>Review client's quiz responses beforehand</li>
            <li>Prepare product recommendations</li>
            <li>Ensure professional background</li>
            <li>Test your equipment before the call</li>
          </ul>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">
          Need to reschedule? Contact the client at least 24 hours in advance.
        </p>
      </div>
    `,
  };

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
      console.error('Error sending appointment confirmation email via Resend:', error)
      throw new Error('Failed to send appointment confirmation email')
    }

    console.log('Appointment confirmation email sent successfully via Resend')
  } catch (error) {
    console.error('Error sending appointment confirmation email via Resend:', error)
    throw new Error('Failed to send appointment confirmation email')
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