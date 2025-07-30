import { NextRequest } from 'next/server'
import { GET, POST } from '../../../../app/api/auth/verify-email/route'
import { prisma } from '../../../../src/lib/prisma'
import * as emailModule from '../../../../src/lib/email'
import { createMockRequest } from '../../../helpers/api-test-helpers'

jest.mock('../../../../src/lib/email', () => ({
  generateVerificationToken: jest.fn(() => 'new-verification-token'),
  getVerificationExpiry: jest.fn(() => new Date('2025-02-01')),
  sendVerificationEmail: jest.fn(),
}))

jest.mock('next/headers', () => ({
  cookies: () => ({
    get: jest.fn().mockReturnValue({ value: 'test-cookie' }),
    set: jest.fn(),
  })
}))

describe('Email Verification API', () => {
  beforeEach(async () => {
    // Clean up database before each test
    await prisma.client.deleteMany()
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('GET /api/auth/verify-email', () => {
    it('verifies email with valid token', async () => {
      // Create a client with verification token
      const futureDate = new Date()
      futureDate.setHours(futureDate.getHours() + 24)

      await prisma.client.create({
        data: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'hashedpassword',
          emailVerificationToken: 'valid-token',
          emailVerificationExpires: futureDate,
        },
      })

      const request = createMockRequest('/api/auth/verify-email', {
        searchParams: { token: 'valid-token' }
      })
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Email verified successfully')
      expect(data.username).toBe('testuser')

      // Verify database was updated
      const client = await prisma.client.findUnique({
        where: { username: 'testuser' },
      })

      expect(client?.emailVerified).toBeTruthy()
      expect(client?.emailVerificationToken).toBeNull()
      expect(client?.emailVerificationExpires).toBeNull()
    })

    it('rejects invalid token', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/verify-email?token=invalid-token')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid verification token')
    })

    it('rejects expired token', async () => {
      // Create a client with expired token
      const pastDate = new Date()
      pastDate.setHours(pastDate.getHours() - 25)

      await prisma.client.create({
        data: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'hashedpassword',
          emailVerificationToken: 'expired-token',
          emailVerificationExpires: pastDate,
        },
      })

      const request = new NextRequest('http://localhost:3000/api/auth/verify-email?token=expired-token')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Verification token has expired')
    })

    it('handles already verified email', async () => {
      await prisma.client.create({
        data: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'hashedpassword',
          emailVerified: new Date(),
          emailVerificationToken: 'old-token',
        },
      })

      const request = new NextRequest('http://localhost:3000/api/auth/verify-email?token=old-token')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Email already verified')
      expect(data.alreadyVerified).toBe(true)
    })

    it('requires token parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/verify-email')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Verification token is required')
    })
  })

  describe('POST /api/auth/verify-email (Resend)', () => {
    it('resends verification email for unverified user', async () => {
      await prisma.client.create({
        data: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'hashedpassword',
          emailVerificationToken: 'old-token',
          emailVerificationExpires: new Date(),
        },
      })

      const request = new NextRequest('http://localhost:3000/api/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('A new verification link has been sent to your email.')

      // Verify new token was generated
      const client = await prisma.client.findUnique({
        where: { email: 'test@example.com' },
      })

      expect(client?.emailVerificationToken).toBe('new-verification-token')
      expect(client?.emailVerificationExpires).toEqual(new Date('2025-02-01'))

      // Verify email was sent
      expect(emailModule.sendVerificationEmail).toHaveBeenCalledWith(
        'test@example.com',
        'testuser',
        'new-verification-token'
      )
    })

    it('returns generic message for non-existent email', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email: 'nonexistent@example.com' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('If an account exists with this email, a new verification link has been sent.')
      expect(emailModule.sendVerificationEmail).not.toHaveBeenCalled()
    })

    it('handles already verified email', async () => {
      await prisma.client.create({
        data: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'hashedpassword',
          emailVerified: new Date(),
        },
      })

      const request = new NextRequest('http://localhost:3000/api/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Email is already verified')
      expect(data.alreadyVerified).toBe(true)
      expect(emailModule.sendVerificationEmail).not.toHaveBeenCalled()
    })

    it('requires email parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Email is required')
    })

    it('handles email sending failure', async () => {
      await prisma.client.create({
        data: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'hashedpassword',
        },
      })

      // Mock email sending to throw error
      ;(emailModule.sendVerificationEmail as jest.Mock).mockRejectedValueOnce(
        new Error('SendGrid error')
      )

      const request = new NextRequest('http://localhost:3000/api/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to send verification email')
    })
  })
})