import { PrismaClient } from '@prisma/client'

/**
 * Comprehensive database cleanup for test isolation
 * Deletes all data from all tables in the correct order to avoid foreign key constraints
 */
export async function cleanupDatabase(prisma: PrismaClient) {
  // The order matters due to foreign key constraints
  const deletions = [
    // First, delete tables that reference other tables
    prisma.answer.deleteMany(),
    prisma.answerOption.deleteMany(),
    prisma.question.deleteMany(),
    prisma.quizResponse.deleteMany(),
    prisma.quiz.deleteMany(),
    
    prisma.consultation.deleteMany(),
    prisma.appointment.deleteMany(),
    prisma.review.deleteMany(),
    prisma.availability.deleteMany(),
    
    // Auth-related tables
    prisma.artistSession.deleteMany(),
    prisma.artistAccount.deleteMany(),
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    
    // Finally, delete the main entities
    prisma.client.deleteMany(),
    prisma.makeupArtist.deleteMany(),
  ]

  // Execute all deletions in a transaction for consistency
  try {
    await prisma.$transaction(deletions, {
      timeout: 30000, // 30 second timeout for cleanup
    })
  } catch (error) {
    console.error('Error during database cleanup:', error)
    // Try individual deletions if transaction fails
    for (const deletion of deletions) {
      try {
        await deletion
      } catch (e) {
        // Continue with other deletions even if one fails
      }
    }
  }
}

/**
 * Alternative cleanup using raw SQL for better performance
 * This truncates all tables which is faster than deleteMany
 */
export async function truncateDatabase(prisma: PrismaClient) {
  const tables = [
    'Answer',
    'AnswerOption', 
    'Question',
    'QuizResponse',
    'Quiz',
    'Consultation',
    'Appointment',
    'Review',
    'Availability',
    'ArtistSession',
    'ArtistAccount',
    'Session',
    'Account',
    'Client',
    'MakeupArtist',
  ]

  try {
    // Disable foreign key checks temporarily
    await prisma.$executeRaw`SET CONSTRAINTS ALL DEFERRED`
    
    // Truncate all tables
    for (const table of tables) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE`)
    }
  } catch (error) {
    console.error('Error truncating database:', error)
    // Fall back to regular cleanup
    await cleanupDatabase(prisma)
  }
}

/**
 * Verify database is empty (useful for debugging)
 */
export async function verifyDatabaseEmpty(prisma: PrismaClient): Promise<boolean> {
  const counts = await Promise.all([
    prisma.client.count(),
    prisma.makeupArtist.count(),
    prisma.appointment.count(),
    prisma.review.count(),
    prisma.quiz.count(),
  ])
  
  return counts.every(count => count === 0)
}