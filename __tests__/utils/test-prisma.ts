import { PrismaClient } from '@prisma/client'

// Create a new Prisma instance for each test file to ensure isolation
let prismaInstance: PrismaClient | null = null

export function getTestPrisma(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/nextjs_prisma_test_db'
        }
      },
      log: process.env.DEBUG ? ['query', 'error', 'warn'] : ['error'],
    })
  }
  return prismaInstance
}

export async function cleanupTestPrisma() {
  if (prismaInstance) {
    await prismaInstance.$disconnect()
    prismaInstance = null
  }
}

// Get a fresh Prisma instance (useful for ensuring clean state)
export function getFreshTestPrisma(): PrismaClient {
  if (prismaInstance) {
    prismaInstance.$disconnect().catch(() => {})
    prismaInstance = null
  }
  return getTestPrisma()
}

// Export a singleton instance for backward compatibility
export const testPrisma = getTestPrisma()