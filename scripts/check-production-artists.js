const { PrismaClient } = require('@prisma/client');

// Production database URL
const PRODUCTION_DATABASE_URL = "postgres://e3cef5fc121209ad0bc230a343d1422ea01c241e8f495e47b3c3288e4656cfaf:sk_UwGDNfwGoTpr5rpzpo4ZN@db.prisma.io:5432/?sslmode=require";

// Initialize Prisma Client with production URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: PRODUCTION_DATABASE_URL
    }
  }
});

// Expected artists from seed script
const expectedArtists = [
  'sarah_beauty',
  'maria_glam',
  'jessica_artistry',
  'alex_pro',
  'taylor_mua',
  'nina_beauty',
  'rachel_glow',
  'lisa_transform',
  'monica_style',
  'diana_luxe',
  'kim_minimal',
  'amanda_vintage'
];

async function checkProductionArtists() {
  try {
    console.log('🔍 Checking production database...\n');
    console.log('Database URL:', PRODUCTION_DATABASE_URL.replace(/:[^:]*@/, ':****@'));
    console.log('\n');

    // Get all artists
    const artists = await prisma.makeupArtist.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        createdAt: true,
        isAvailable: true,
        reviews: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`📊 Found ${artists.length} artists in production database:\n`);

    // Display each artist
    artists.forEach((artist, index) => {
      console.log(`${index + 1}. ${artist.name} (@${artist.username})`);
      console.log(`   - Email: ${artist.email}`);
      console.log(`   - Available: ${artist.isAvailable ? 'Yes' : 'No'}`);
      console.log(`   - Reviews: ${artist.reviews.length}`);
      console.log(`   - Created: ${artist.createdAt.toLocaleDateString()}`);
      console.log('');
    });

    // Check for missing artists
    const existingUsernames = artists.map(a => a.username);
    const missingArtists = expectedArtists.filter(username => !existingUsernames.includes(username));

    if (missingArtists.length > 0) {
      console.log(`\n⚠️  Missing ${missingArtists.length} artists from expected list:`);
      missingArtists.forEach(username => {
        console.log(`   - ${username}`);
      });
    } else {
      console.log('\n✅ All expected artists are present!');
    }

    // Additional stats
    const totalReviews = await prisma.review.count();
    const totalClients = await prisma.client.count();
    const totalAppointments = await prisma.appointment.count();

    console.log('\n📈 Database Statistics:');
    console.log(`   - Total Artists: ${artists.length}`);
    console.log(`   - Total Clients: ${totalClients}`);
    console.log(`   - Total Reviews: ${totalReviews}`);
    console.log(`   - Total Appointments: ${totalAppointments}`);

  } catch (error) {
    console.error('❌ Error checking production database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkProductionArtists();