import { NextRequest } from 'next/server'
import { PUT } from '../../../../app/api/artist/profile-image/route'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { deleteCloudinaryImage } from '@/lib/cloudinary-admin'

// Mock modules
jest.mock('@/lib/auth')
jest.mock('@/lib/prisma', () => ({
  prisma: {
    makeupArtist: {
      findUnique: jest.fn(),
      update: jest.fn()
    }
  }
}))
jest.mock('@/lib/cloudinary-admin')

describe('PUT /api/artist/profile-image', () => {
  const mockAuth = auth as jest.MockedFunction<typeof auth>
  const mockDeleteCloudinaryImage = deleteCloudinaryImage as jest.MockedFunction<typeof deleteCloudinaryImage>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('updates profile image successfully', async () => {
    // Mock authentication
    mockAuth.mockResolvedValue({
      user: { id: 'artist123', userType: 'artist', name: 'Test Artist' },
      expires: new Date().toISOString()
    })

    // Mock existing artist
    ;(prisma.makeupArtist.findUnique as jest.Mock).mockResolvedValue({
      profileImage: 'old-image-id'
    })

    // Mock cloudinary deletion
    mockDeleteCloudinaryImage.mockResolvedValue({ success: true, result: 'ok' })

    // Mock update
    ;(prisma.makeupArtist.update as jest.Mock).mockResolvedValue({
      id: 'artist123',
      profileImage: 'new-image-id',
      profileImageVersion: 2
    })

    // Create mock request
    const request = {
      json: jest.fn().mockResolvedValue({ publicId: 'new-image-id' })
    } as unknown as NextRequest

    // Call route handler
    const response = await PUT(request)
    const data = await response.json()

    // Assertions
    expect(response.status).toBe(200)
    expect(data.message).toBe('Profile image updated successfully')
    expect(data.artist.profileImage).toBe('new-image-id')
    
    // Verify old image was deleted
    expect(mockDeleteCloudinaryImage).toHaveBeenCalledWith('old-image-id')
    
    // Verify database update
    expect(prisma.makeupArtist.update).toHaveBeenCalledWith({
      where: { id: 'artist123' },
      data: {
        profileImage: 'new-image-id',
        profileImageVersion: { increment: 1 }
      },
      select: {
        id: true,
        profileImage: true,
        profileImageVersion: true
      }
    })
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)

    const request = {
      json: jest.fn().mockResolvedValue({ publicId: 'new-image-id' })
    } as unknown as NextRequest

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized. Artist authentication required.')
  })

  it('returns 401 when user is not an artist', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'client123', userType: 'client', name: 'Test Client' },
      expires: new Date().toISOString()
    })

    const request = {
      json: jest.fn().mockResolvedValue({ publicId: 'new-image-id' })
    } as unknown as NextRequest

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized. Artist authentication required.')
  })

  it('returns 400 for invalid input', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'artist123', userType: 'artist', name: 'Test Artist' },
      expires: new Date().toISOString()
    })

    const request = {
      json: jest.fn().mockResolvedValue({ publicId: '' }) // Invalid: empty string
    } as unknown as NextRequest

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid input data')
    expect(data.details).toBeDefined()
  })

  it('returns 404 when artist profile not found', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'artist123', userType: 'artist', name: 'Test Artist' },
      expires: new Date().toISOString()
    })

    ;(prisma.makeupArtist.findUnique as jest.Mock).mockResolvedValue(null)

    const request = {
      json: jest.fn().mockResolvedValue({ publicId: 'new-image-id' })
    } as unknown as NextRequest

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Artist profile not found')
  })

  it('handles artist without existing profile image', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'artist123', userType: 'artist', name: 'Test Artist' },
      expires: new Date().toISOString()
    })

    // Artist without profile image
    ;(prisma.makeupArtist.findUnique as jest.Mock).mockResolvedValue({
      profileImage: null
    })

    ;(prisma.makeupArtist.update as jest.Mock).mockResolvedValue({
      id: 'artist123',
      profileImage: 'new-image-id',
      profileImageVersion: 1
    })

    const request = {
      json: jest.fn().mockResolvedValue({ publicId: 'new-image-id' })
    } as unknown as NextRequest

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.artist.profileImage).toBe('new-image-id')
    
    // Should not attempt to delete old image
    expect(mockDeleteCloudinaryImage).not.toHaveBeenCalled()
  })

  it('continues update even if Cloudinary deletion fails', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'artist123', userType: 'artist', name: 'Test Artist' },
      expires: new Date().toISOString()
    })

    ;(prisma.makeupArtist.findUnique as jest.Mock).mockResolvedValue({
      profileImage: 'old-image-id'
    })

    // Cloudinary deletion fails
    mockDeleteCloudinaryImage.mockRejectedValue(new Error('Cloudinary error'))

    ;(prisma.makeupArtist.update as jest.Mock).mockResolvedValue({
      id: 'artist123',
      profileImage: 'new-image-id',
      profileImageVersion: 2
    })

    const request = {
      json: jest.fn().mockResolvedValue({ publicId: 'new-image-id' })
    } as unknown as NextRequest

    const response = await PUT(request)
    const data = await response.json()

    // Should still succeed
    expect(response.status).toBe(200)
    expect(data.artist.profileImage).toBe('new-image-id')
  })

  it('returns 500 for database errors', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'artist123', userType: 'artist', name: 'Test Artist' },
      expires: new Date().toISOString()
    })

    ;(prisma.makeupArtist.findUnique as jest.Mock).mockRejectedValue(
      new Error('Database connection error')
    )

    const request = {
      json: jest.fn().mockResolvedValue({ publicId: 'new-image-id' })
    } as unknown as NextRequest

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to update profile image')
  })
})