import { generateVerificationToken, getVerificationExpiry } from '@/lib/email'

describe('Email Utilities', () => {
  describe('generateVerificationToken', () => {
    it('generates a 64-character hex token', () => {
      const token = generateVerificationToken()
      
      expect(token).toHaveLength(64)
      expect(token).toMatch(/^[a-f0-9]{64}$/)
    })

    it('generates unique tokens', () => {
      const token1 = generateVerificationToken()
      const token2 = generateVerificationToken()
      
      expect(token1).not.toBe(token2)
    })
  })

  describe('getVerificationExpiry', () => {
    it('returns a date 24 hours in the future', () => {
      const now = new Date()
      const expiry = getVerificationExpiry()
      
      const expectedTime = now.getTime() + (24 * 60 * 60 * 1000)
      const actualTime = expiry.getTime()
      
      // Allow 1 second tolerance for test execution time
      expect(Math.abs(actualTime - expectedTime)).toBeLessThan(1000)
    })

    it('returns a valid Date object', () => {
      const expiry = getVerificationExpiry()
      
      expect(expiry).toBeInstanceOf(Date)
      expect(expiry.getTime()).toBeGreaterThan(Date.now())
    })
  })
})