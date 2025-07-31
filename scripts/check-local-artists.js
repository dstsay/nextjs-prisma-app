const { PrismaClient } = require('@prisma/client');

// Local database URL from .env.local
const LOCAL_DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/nextjs_prisma_db";

// Initialize Prisma Client with local URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: LOCAL_DATABASE_URL
    }
  }
});

async function checkLocalArtists() {
  try {
    console.log('🔍 Checking LOCAL database...\n');
    console.log('Database URL:', LOCAL_DATABASE_URL);
    console.log('\n');

    // Get all artists
    const artists = await prisma.makeupArtist.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        createdAt: true,
        isAvailable: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`📊 Found ${artists.length} artists in LOCAL database:\n`);

    // Display each artist
    artists.forEach((artist, index) => {
      console.log(`${index + 1}. ${artist.name} (@${artist.username})`);
      console.log(`   - Email: ${artist.email}`);
      console.log(`   - Available: ${artist.isAvailable ? 'Yes' : 'No'}`);
      console.log(`   - Created: ${artist.createdAt.toLocaleDateString()}`);
      console.log('');
    });

    // Additional stats
    const totalReviews = await prisma.review.count();
    const totalClients = await prisma.client.count();
    const totalAppointments = await prisma.appointment.count();

    console.log('\n📈 LOCAL Database Statistics:');
    console.log(`   - Total Artists: ${artists.length}`);
    console.log(`   - Total Clients: ${totalClients}`);
    console.log(`   - Total Reviews: ${totalReviews}`);
    console.log(`   - Total Appointments: ${totalAppointments}`);

  } catch (error) {
    console.error('❌ Error checking local database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkLocalArtists();