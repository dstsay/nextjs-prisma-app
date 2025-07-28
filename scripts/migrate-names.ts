import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateNames() {
  console.log('Starting name migration...')

  try {
    // Migrate MakeupArtist names
    const artists = await prisma.makeupArtist.findMany({
      where: {
        AND: [
          { firstName: null },
          { lastName: null },
          { name: { not: '' } }
        ]
      }
    })

    console.log(`Found ${artists.length} artists to migrate`)

    for (const artist of artists) {
      const nameParts = artist.name.trim().split(/\s+/)
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      await prisma.makeupArtist.update({
        where: { id: artist.id },
        data: {
          firstName,
          lastName
        }
      })

      console.log(`Migrated artist: ${artist.name} → ${firstName} ${lastName}`)
    }

    // Migrate Client names
    const clients = await prisma.client.findMany({
      where: {
        AND: [
          { firstName: null },
          { lastName: null },
          { name: { not: '' } }
        ]
      }
    })

    console.log(`Found ${clients.length} clients to migrate`)

    for (const client of clients) {
      if (!client.name) continue
      
      const nameParts = client.name.trim().split(/\s+/)
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      await prisma.client.update({
        where: { id: client.id },
        data: {
          firstName,
          lastName
        }
      })

      console.log(`Migrated client: ${client.name} → ${firstName} ${lastName}`)
    }

    console.log('Name migration completed successfully!')
  } catch (error) {
    console.error('Error during migration:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
migrateNames()
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })