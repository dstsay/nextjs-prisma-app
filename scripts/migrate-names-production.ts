import { PrismaClient } from '@prisma/client'

// Use production database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgres://e3cef5fc121209ad0bc230a343d1422ea01c241e8f495e47b3c3288e4656cfaf:sk_UwGDNfwGoTpr5rpzpo4ZN@db.prisma.io:5432/?sslmode=require'
    }
  }
})

async function migrateNames() {
  console.log('Starting name migration on PRODUCTION database...')
  console.log('Database URL:', process.env.DATABASE_URL ? 'Using DATABASE_URL env var' : 'Using hardcoded production URL')

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

// Add confirmation prompt for safety
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})

readline.question('Are you sure you want to run this migration on the PRODUCTION database? (yes/no): ', (answer) => {
  if (answer.toLowerCase() === 'yes') {
    migrateNames()
      .then(() => {
        console.log('Migration completed successfully!')
        process.exit(0)
      })
      .catch((error) => {
        console.error('Migration failed:', error)
        process.exit(1)
      })
  } else {
    console.log('Migration cancelled.')
    process.exit(0)
  }
  readline.close()
})