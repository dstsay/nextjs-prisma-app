import { NextRequest } from 'next/server'
import { POST } from '../../../../app/api/auth/signup/route'
import { prisma } from '../../../../src/lib/prisma'
import { compare } from 'bcryptjs'
import * as emailModule from '../../../../src/lib/email'

jest.mock('../../../../src/lib/email', () => ({
  generateVerificationToken: jest.fn(() => 'test-verification-token'),
  getVerificationExpiry: jest.fn(() => new Date('2025-01-01')),
  sendVerificationEmail: jest.fn(),
}))

describe('POST /api/auth/signup', () => {
  beforeEach(async () => {
    // Clean up database before each test
    await prisma.client.deleteMany()
    await prisma.makeupArtist.deleteMany()
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('creates a new client account with valid data', async () => {
    const requestData = {
      username: 'testclient',
      email: 'client@example.com',
      password: 'password123',
      userType: 'client',
    }

    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(requestData),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toContain('Client account created successfully')
    expect(data.userType).toBe('client')

    // Verify user was created in database
    const client = await prisma.client.findUnique({
      where: { username: 'testclient' },
    })

    expect(client).toBeTruthy()
    expect(client?.email).toBe('client@example.com')
    expect(client?.emailVerificationToken).toBe('test-verification-token')
    expect(client?.emailVerificationExpires).toEqual(new Date('2025-01-01'))
    
    // Verify password was hashed
    const isPasswordValid = await compare('password123', client?.password || '')
    expect(isPasswordValid).toBe(true)

    // Verify email was sent
    expect(emailModule.sendVerificationEmail).toHaveBeenCalledWith(
      'client@example.com',
      'testclient',
      'test-verification-token'
    )
  })

  it('creates an artist account with valid data', async () => {
    const requestData = {
      username: 'testartist',
      email: 'artist@example.com',
      password: 'password123',
      name: 'Test Artist',
      userType: 'artist',
    }

    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(requestData),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Artist account created successfully')
    expect(data.userType).toBe('artist')

    // Verify artist was created
    const artist = await prisma.makeupArtist.findUnique({
      where: { username: 'testartist' },
    })

    expect(artist).toBeTruthy()
    expect(artist?.email).toBe('artist@example.com')
    expect(artist?.name).toBe('Test Artist')
  })

  it('rejects duplicate username across client and artist tables', async () => {
    // Create a client first
    await prisma.client.create({
      data: {
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'hashedpassword',
      },
    })

    // Try to create an artist with same username
    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        username: 'existinguser',
        email: 'new@example.com',
        password: 'password123',
        name: 'New Artist',
        userType: 'artist',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Username already taken')
  })

  it('rejects duplicate email across tables (case-insensitive)', async () => {
    // Create a client first
    await prisma.client.create({
      data: {
        username: 'client1',
        email: 'test@example.com',
        password: 'hashedpassword',
      },
    })

    // Try to create another client with same email (different case)
    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        username: 'client2',
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
        userType: 'client',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Email already registered')
  })

  it('validates username format', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        username: 'ab',  // Too short
        email: 'test@example.com',
        password: 'password123',
        userType: 'client',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid input')
    expect(data.details).toBeDefined()
  })

  it('validates email format', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123',
        userType: 'client',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid input')
  })

  it('validates password length', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        username: 'testuser',
        email: 'test@example.com',
        password: '12345',  // Too short
        userType: 'client',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid input')
  })

  it('requires name for artist signup', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        username: 'testartist',
        email: 'artist@example.com',
        password: 'password123',
        // name is missing
        userType: 'artist',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid input')
  })

  it('continues signup even if email sending fails', async () => {
    // Mock email sending to throw error
    ;(emailModule.sendVerificationEmail as jest.Mock).mockRejectedValueOnce(
      new Error('SendGrid error')
    )

    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        username: 'testclient',
        email: 'client@example.com',
        password: 'password123',
        userType: 'client',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toContain('Client account created successfully')

    // Verify user was still created
    const client = await prisma.client.findUnique({
      where: { username: 'testclient' },
    })
    expect(client).toBeTruthy()
  })

  it('handles malformed JSON request', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: 'invalid json',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('An error occurred during signup')
  })
})