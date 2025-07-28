import { PrismaClient } from '@prisma/client'
import { cleanupDatabase, verifyDatabaseEmpty } from './database-cleanup'
import { getFreshTestPrisma, cleanupTestPrisma } from './test-prisma'

// Global test prisma instance
let testPrisma: PrismaClient

/**
 * Setup function to be called in beforeAll/beforeEach hooks
 */
export async function setupIntegrationTest() {
  // Get a fresh Prisma client instance
  testPrisma = getFreshTestPrisma()
  
  // Ensure database is clean before test
  await cleanupDatabase(testPrisma)
  
  // Verify cleanup worked
  if (process.env.DEBUG) {
    const isEmpty = await verifyDatabaseEmpty(testPrisma)
    if (!isEmpty) {
      console.warn('Warning: Database not empty after cleanup')
    }
  }
  
  return testPrisma
}

/**
 * Teardown function to be called in afterEach/afterAll hooks
 */
export async function teardownIntegrationTest() {
  if (testPrisma) {
    // Clean up all data
    await cleanupDatabase(testPrisma)
    
    // Disconnect from database
    await cleanupTestPrisma()
  }
}

/**
 * Get the current test Prisma instance
 */
export function getTestPrismaClient(): PrismaClient {
  if (!testPrisma) {
    throw new Error('Test Prisma client not initialized. Call setupIntegrationTest() first.')
  }
  return testPrisma
}

/**
 * Helper to run a test within a transaction that gets rolled back
 * This provides perfect isolation but may not work with all test scenarios
 */
export async function runInTransaction<T>(
  testFn: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  const prisma = getTestPrismaClient()
  
  try {
    // Start a transaction
    return await prisma.$transaction(async (tx) => {
      // Run the test function with the transaction client
      const result = await testFn(tx as any)
      
      // Throw an error to rollback the transaction
      throw new Error('ROLLBACK_TEST_TRANSACTION')
    })
  } catch (error: any) {
    // If it's our rollback error, that's expected
    if (error.message === 'ROLLBACK_TEST_TRANSACTION') {
      return undefined as any
    }
    // Otherwise, re-throw the actual test error
    throw error
  }
}

/**
 * Create a test wrapper that handles setup/teardown automatically
 */
export function describeIntegration(name: string, fn: () => void) {
  describe(name, () => {
    beforeAll(async () => {
      await setupIntegrationTest()
    })

    afterAll(async () => {
      await teardownIntegrationTest()
    })

    beforeEach(async () => {
      await cleanupDatabase(getTestPrismaClient())
    })

    fn()
  })
}