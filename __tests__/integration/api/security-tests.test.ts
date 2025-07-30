import { NextRequest } from 'next/server'
import { POST as availabilityPOST } from '../../../app/api/artist/availability/route'
import { POST as uploadPOST } from '../../../app/api/artist/upload/route'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { hashToken } from '@/lib/csrf'

// Mock auth
jest.mock('@/lib/auth', () => ({
  auth: jest.fn()
}))

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    makeupArtist: {
      findUnique: jest.fn()
    },
    availability: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
      findMany: jest.fn()
    }
  }
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

describe('API Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('CSRF Protection', () => {
    it('should reject POST request without CSRF token', async () => {
      const mockAuth = auth as jest.MockedFunction<typeof auth>
      mockAuth.mockResolvedValue({
        user: { id: 'artist123', userType: 'artist', email: 'artist@test.com' },
        expires: new Date().toISOString()
      })

      const request = new NextRequest('http://localhost:3000/api/artist/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          schedule: [{
            dayOfWeek: 1,
            startTime: '09:00',
            endTime: '17:00',
            isActive: true
          }]
        })
      })

      const response = await availabilityPOST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Invalid CSRF token')
    })

    it('should accept POST request with valid CSRF token', async () => {
      const mockAuth = auth as jest.MockedFunction<typeof auth>
      mockAuth.mockResolvedValue({
        user: { id: 'artist123', userType: 'artist', email: 'artist@test.com' },
        expires: new Date().toISOString()
      })

      const mockPrisma = prisma as any
      mockPrisma.makeupArtist.findUnique.mockResolvedValue({ id: 'artist123' })
      mockPrisma.availability.deleteMany.mockResolvedValue({})
      mockPrisma.availability.createMany.mockResolvedValue({})
      mockPrisma.availability.findMany.mockResolvedValue([
        {
          id: '1',
          artistId: 'artist123',
          dayOfWeek: 1,
          startTime: '09:00',
          endTime: '17:00',
          isActive: true
        }
      ])

      const request = new NextRequest('http://localhost:3000/api/artist/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'valid-csrf-token'
        },
        body: JSON.stringify({
          schedule: [{
            dayOfWeek: 1,
            startTime: '09:00',
            endTime: '17:00',
            isActive: true
          }]
        })
      })

      const response = await availabilityPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(1)
      expect(data[0].startTime).toBe('09:00')
    })
  })

  describe('Input Validation', () => {
    it('should reject invalid time format', async () => {
      const mockAuth = auth as jest.MockedFunction<typeof auth>
      mockAuth.mockResolvedValue({
        user: { id: 'artist123', userType: 'artist', email: 'artist@test.com' },
        expires: new Date().toISOString()
      })

      const mockPrisma = prisma as any
      mockPrisma.makeupArtist.findUnique.mockResolvedValue({ id: 'artist123' })

      const request = new NextRequest('http://localhost:3000/api/artist/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'valid-csrf-token'
        },
        body: JSON.stringify({
          schedule: [{
            dayOfWeek: 1,
            startTime: '25:00', // Invalid hour
            endTime: '17:00',
            isActive: true
          }]
        })
      })

      const response = await availabilityPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation error')
    })

    it('should reject when end time is before start time', async () => {
      const mockAuth = auth as jest.MockedFunction<typeof auth>
      mockAuth.mockResolvedValue({
        user: { id: 'artist123', userType: 'artist', email: 'artist@test.com' },
        expires: new Date().toISOString()
      })

      const mockPrisma = prisma as any
      mockPrisma.makeupArtist.findUnique.mockResolvedValue({ id: 'artist123' })

      const request = new NextRequest('http://localhost:3000/api/artist/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'valid-csrf-token'
        },
        body: JSON.stringify({
          schedule: [{
            dayOfWeek: 1,
            startTime: '17:00',
            endTime: '09:00', // End before start
            isActive: true
          }]
        })
      })

      const response = await availabilityPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation error')
    })

    it('should reject invalid day of week', async () => {
      const mockAuth = auth as jest.MockedFunction<typeof auth>
      mockAuth.mockResolvedValue({
        user: { id: 'artist123', userType: 'artist', email: 'artist@test.com' },
        expires: new Date().toISOString()
      })

      const mockPrisma = prisma as any
      mockPrisma.makeupArtist.findUnique.mockResolvedValue({ id: 'artist123' })

      const request = new NextRequest('http://localhost:3000/api/artist/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'valid-csrf-token'
        },
        body: JSON.stringify({
          schedule: [{
            dayOfWeek: 7, // Invalid (should be 0-6)
            startTime: '09:00',
            endTime: '17:00',
            isActive: true
          }]
        })
      })

      const response = await availabilityPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation error')
    })
  })
})