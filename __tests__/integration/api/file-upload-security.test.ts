import { NextRequest } from 'next/server'
import { POST as uploadPOST } from '../../../app/api/artist/upload/route'
import { auth } from '@/lib/auth'
import { hashToken } from '@/lib/csrf'
import * as cloudinaryAdmin from '@/lib/cloudinary-admin'

// Mock auth
jest.mock('@/lib/auth', () => ({
  auth: jest.fn()
}))

// Mock cloudinary-admin
jest.mock('@/lib/cloudinary-admin', () => ({
  uploadToCloudinary: jest.fn()
}))

// Mock next/headers
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn((name) => {
      if (name === 'csrf-token') {
        return { value: hashToken('valid-csrf-token') }
      }
      return undefined
    }),
    set: jest.fn(),
  }))
}))

describe('File Upload Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const createFileFormData = (fileName: string, fileType: string, fileSize: number = 1000) => {
    const formData = new FormData()
    const file = new File([Buffer.alloc(fileSize)], fileName, { type: fileType })
    formData.append('file', file)
    formData.append('folder', 'test-folder')
    return formData
  }

  describe('File Type Validation', () => {
    it('should accept valid image types', async () => {
      const mockAuth = auth as jest.MockedFunction<typeof auth>
      mockAuth.mockResolvedValue({
        user: { id: 'artist123', userType: 'artist', email: 'artist@test.com' },
        expires: new Date().toISOString()
      })

      const mockUpload = cloudinaryAdmin.uploadToCloudinary as jest.MockedFunction<typeof cloudinaryAdmin.uploadToCloudinary>
      mockUpload.mockResolvedValue({
        success: true,
        result: {
          secure_url: 'https://cloudinary.com/image.jpg',
          public_id: 'test-image'
        }
      } as any)

      const validTypes = [
        { name: 'test.jpg', type: 'image/jpeg' },
        { name: 'test.png', type: 'image/png' },
        { name: 'test.webp', type: 'image/webp' },
        { name: 'test.gif', type: 'image/gif' }
      ]

      for (const { name, type } of validTypes) {
        const formData = createFileFormData(name, type)
        const request = new NextRequest('http://localhost:3000/api/artist/upload', {
          method: 'POST',
          headers: {
            'X-CSRF-Token': 'valid-csrf-token'
          },
          body: formData
        })

        const response = await uploadPOST(request)
        expect(response.status).toBe(200)
      }
    })

    it('should reject invalid file types', async () => {
      const mockAuth = auth as jest.MockedFunction<typeof auth>
      mockAuth.mockResolvedValue({
        user: { id: 'artist123', userType: 'artist', email: 'artist@test.com' },
        expires: new Date().toISOString()
      })

      const invalidTypes = [
        { name: 'test.exe', type: 'application/exe' },
        { name: 'test.pdf', type: 'application/pdf' },
        { name: 'test.txt', type: 'text/plain' },
        { name: 'test.zip', type: 'application/zip' }
      ]

      for (const { name, type } of invalidTypes) {
        const formData = createFileFormData(name, type)
        const request = new NextRequest('http://localhost:3000/api/artist/upload', {
          method: 'POST',
          headers: {
            'X-CSRF-Token': 'valid-csrf-token'
          },
          body: formData
        })

        const response = await uploadPOST(request)
        const data = await response.json()
        
        expect(response.status).toBe(400)
        expect(data.error).toContain('Invalid file type')
      }
    })
  })

  describe('File Size Validation', () => {
    it('should reject files larger than 5MB', async () => {
      const mockAuth = auth as jest.MockedFunction<typeof auth>
      mockAuth.mockResolvedValue({
        user: { id: 'artist123', userType: 'artist', email: 'artist@test.com' },
        expires: new Date().toISOString()
      })

      const formData = createFileFormData('large.jpg', 'image/jpeg', 6 * 1024 * 1024) // 6MB
      const request = new NextRequest('http://localhost:3000/api/artist/upload', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': 'valid-csrf-token'
        },
        body: formData
      })

      const response = await uploadPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('File size exceeds maximum')
    })
  })

  describe('File Name Validation', () => {
    it('should reject files with malicious names', async () => {
      const mockAuth = auth as jest.MockedFunction<typeof auth>
      mockAuth.mockResolvedValue({
        user: { id: 'artist123', userType: 'artist', email: 'artist@test.com' },
        expires: new Date().toISOString()
      })

      const maliciousNames = [
        '../../../etc/passwd.jpg',
        'test<script>.jpg',
        'test;rm -rf /.jpg',
        'test\x00.jpg'
      ]

      for (const name of maliciousNames) {
        const formData = createFileFormData(name, 'image/jpeg')
        const request = new NextRequest('http://localhost:3000/api/artist/upload', {
          method: 'POST',
          headers: {
            'X-CSRF-Token': 'valid-csrf-token'
          },
          body: formData
        })

        const response = await uploadPOST(request)
        const data = await response.json()
        
        expect(response.status).toBe(400)
        expect(data.error).toContain('invalid characters')
      }
    })
  })

  describe('CSRF Protection for Uploads', () => {
    it('should reject upload without CSRF token', async () => {
      const mockAuth = auth as jest.MockedFunction<typeof auth>
      mockAuth.mockResolvedValue({
        user: { id: 'artist123', userType: 'artist', email: 'artist@test.com' },
        expires: new Date().toISOString()
      })

      const formData = createFileFormData('test.jpg', 'image/jpeg')
      const request = new NextRequest('http://localhost:3000/api/artist/upload', {
        method: 'POST',
        body: formData
      })

      const response = await uploadPOST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Invalid CSRF token')
    })
  })

  describe('Authentication', () => {
    it('should reject unauthenticated uploads', async () => {
      const mockAuth = auth as jest.MockedFunction<typeof auth>
      mockAuth.mockResolvedValue(null)

      const formData = createFileFormData('test.jpg', 'image/jpeg')
      const request = new NextRequest('http://localhost:3000/api/artist/upload', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': 'valid-csrf-token'
        },
        body: formData
      })

      const response = await uploadPOST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('Unauthorized')
    })

    it('should reject non-artist uploads', async () => {
      const mockAuth = auth as jest.MockedFunction<typeof auth>
      mockAuth.mockResolvedValue({
        user: { id: 'client123', userType: 'client', email: 'client@test.com' },
        expires: new Date().toISOString()
      })

      const formData = createFileFormData('test.jpg', 'image/jpeg')
      const request = new NextRequest('http://localhost:3000/api/artist/upload', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': 'valid-csrf-token'
        },
        body: formData
      })

      const response = await uploadPOST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('Unauthorized')
    })
  })
})