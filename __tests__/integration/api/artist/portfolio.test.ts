import { NextRequest } from 'next/server'
import { POST } from '../../../../app/api/artist/portfolio/route'
import { DELETE } from '../../../../app/api/artist/portfolio/[index]/route'
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

describe('Portfolio API Routes', () => {
  const mockAuth = auth as jest.MockedFunction<typeof auth>
  const mockDeleteCloudinaryImage = deleteCloudinaryImage as jest.MockedFunction<typeof deleteCloudinaryImage>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/artist/portfolio', () => {
    it('adds image to portfolio successfully', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'artist123', userType: 'artist', name: 'Test Artist' },
        expires: new Date().toISOString()
      })

      ;(prisma.makeupArtist.findUnique as jest.Mock).mockResolvedValue({
        portfolioImages: ['existing-image-1', 'existing-image-2']
      })

      ;(prisma.makeupArtist.update as jest.Mock).mockResolvedValue({
        id: 'artist123',
        portfolioImages: ['existing-image-1', 'existing-image-2', 'new-image-id']
      })

      const request = {
        json: jest.fn().mockResolvedValue({ publicId: 'new-image-id' })
      } as unknown as NextRequest

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Image added to portfolio successfully')
      expect(data.portfolioImages).toHaveLength(3)
      expect(data.portfolioImages).toContain('new-image-id')

      expect(prisma.makeupArtist.update).toHaveBeenCalledWith({
        where: { id: 'artist123' },
        data: {
          portfolioImages: {
            push: 'new-image-id'
          }
        },
        select: {
          id: true,
          portfolioImages: true
        }
      })
    })

    it('returns 400 when portfolio limit reached', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'artist123', userType: 'artist', name: 'Test Artist' },
        expires: new Date().toISOString()
      })

      // Artist already has 100 images
      const fullPortfolio = Array(100).fill(0).map((_, i) => `image-${i}`)
      ;(prisma.makeupArtist.findUnique as jest.Mock).mockResolvedValue({
        portfolioImages: fullPortfolio
      })

      const request = {
        json: jest.fn().mockResolvedValue({ publicId: 'new-image-id' })
      } as unknown as NextRequest

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Portfolio limit reached. Maximum 100 images allowed.')
      expect(prisma.makeupArtist.update).not.toHaveBeenCalled()
    })

    it('handles empty portfolio array', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'artist123', userType: 'artist', name: 'Test Artist' },
        expires: new Date().toISOString()
      })

      ;(prisma.makeupArtist.findUnique as jest.Mock).mockResolvedValue({
        portfolioImages: null // No portfolio images yet
      })

      ;(prisma.makeupArtist.update as jest.Mock).mockResolvedValue({
        id: 'artist123',
        portfolioImages: ['new-image-id']
      })

      const request = {
        json: jest.fn().mockResolvedValue({ publicId: 'new-image-id' })
      } as unknown as NextRequest

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.portfolioImages).toHaveLength(1)
      expect(data.portfolioImages[0]).toBe('new-image-id')
    })

    it('validates authentication and authorization', async () => {
      // Test unauthenticated
      mockAuth.mockResolvedValue(null)

      let request = {
        json: jest.fn().mockResolvedValue({ publicId: 'new-image-id' })
      } as unknown as NextRequest

      let response = await POST(request)
      expect(response.status).toBe(401)

      // Test non-artist user
      mockAuth.mockResolvedValue({
        user: { id: 'client123', userType: 'client', name: 'Test Client' },
        expires: new Date().toISOString()
      })

      request = {
        json: jest.fn().mockResolvedValue({ publicId: 'new-image-id' })
      } as unknown as NextRequest

      response = await POST(request)
      expect(response.status).toBe(401)
    })

    it('validates input data', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'artist123', userType: 'artist', name: 'Test Artist' },
        expires: new Date().toISOString()
      })

      const request = {
        json: jest.fn().mockResolvedValue({ publicId: '' }) // Invalid: empty string
      } as unknown as NextRequest

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid input data')
    })
  })

  describe('DELETE /api/artist/portfolio/[index]', () => {
    it('removes image from portfolio successfully', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'artist123', userType: 'artist', name: 'Test Artist' },
        expires: new Date().toISOString()
      })

      ;(prisma.makeupArtist.findUnique as jest.Mock).mockResolvedValue({
        portfolioImages: ['image-1', 'image-2', 'image-3']
      })

      mockDeleteCloudinaryImage.mockResolvedValue({ success: true, result: 'ok' })

      ;(prisma.makeupArtist.update as jest.Mock).mockResolvedValue({
        id: 'artist123',
        portfolioImages: ['image-1', 'image-3']
      })

      const request = {} as NextRequest

      const response = await DELETE(request, { params: { index: '1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Image removed from portfolio successfully')
      expect(data.portfolioImages).toEqual(['image-1', 'image-3'])

      expect(mockDeleteCloudinaryImage).toHaveBeenCalledWith('image-2')
      expect(prisma.makeupArtist.update).toHaveBeenCalledWith({
        where: { id: 'artist123' },
        data: {
          portfolioImages: ['image-1', 'image-3']
        },
        select: {
          id: true,
          portfolioImages: true
        }
      })
    })

    it('returns 400 for invalid index', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'artist123', userType: 'artist', name: 'Test Artist' },
        expires: new Date().toISOString()
      })

      // Test non-numeric index
      let request = {} as NextRequest

      let response = await DELETE(request, { params: { index: 'abc' } })
      let data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid image index')

      // Test negative index
      response = await DELETE(request, { params: { index: '-1' } })
      data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid image index')
    })

    it('returns 400 for out of bounds index', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'artist123', userType: 'artist', name: 'Test Artist' },
        expires: new Date().toISOString()
      })

      ;(prisma.makeupArtist.findUnique as jest.Mock).mockResolvedValue({
        portfolioImages: ['image-1', 'image-2']
      })

      const request = {} as NextRequest

      const response = await DELETE(request, { params: { index: '5' } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Image index out of bounds')
    })

    it('continues deletion even if Cloudinary fails', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'artist123', userType: 'artist', name: 'Test Artist' },
        expires: new Date().toISOString()
      })

      ;(prisma.makeupArtist.findUnique as jest.Mock).mockResolvedValue({
        portfolioImages: ['image-1', 'image-2']
      })

      // Cloudinary deletion fails
      mockDeleteCloudinaryImage.mockResolvedValue({ success: false, error: 'Not found' })

      ;(prisma.makeupArtist.update as jest.Mock).mockResolvedValue({
        id: 'artist123',
        portfolioImages: ['image-2']
      })

      const request = {} as NextRequest

      const response = await DELETE(request, { params: { index: '0' } })
      const data = await response.json()

      // Should still succeed
      expect(response.status).toBe(200)
      expect(data.portfolioImages).toEqual(['image-2'])
    })

    it('handles empty portfolio array', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'artist123', userType: 'artist', name: 'Test Artist' },
        expires: new Date().toISOString()
      })

      ;(prisma.makeupArtist.findUnique as jest.Mock).mockResolvedValue({
        portfolioImages: null // No portfolio images
      })

      const request = {} as NextRequest

      const response = await DELETE(request, { params: { index: '0' } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Image index out of bounds')
    })

    it('validates authentication', async () => {
      mockAuth.mockResolvedValue(null)

      const request = {} as NextRequest

      const response = await DELETE(request, { params: { index: '0' } })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized. Artist authentication required.')
    })
  })
})