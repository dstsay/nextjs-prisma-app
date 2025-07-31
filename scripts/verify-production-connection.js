const { PrismaClient } = require('@prisma/client');

// Production database URL
const PRODUCTION_DATABASE_URL = "postgres://e3cef5fc121209ad0bc230a343d1422ea01c241e8f495e47b3c3288e4656cfaf:sk_UwGDNfwGoTpr5rpzpo4ZN@db.prisma.io:5432/?sslmode=require";

async function verifyConnection() {
  console.log('🔍 Testing direct SQL query to production database...\n');
  
  // Create a new Prisma client with production URL
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: PRODUCTION_DATABASE_URL
      }
    },
    log: ['query', 'info', 'warn', 'error']
  });

  try {
    // Run a raw SQL query to count artists
    const result = await prisma.$queryRaw`SELECT COUNT(*) as count, MIN(name) as first_artist, MAX(name) as last_artist FROM "MakeupArtist"`;
    console.log('Raw SQL Query Result:', result);
    
    // Also get artist names
    const artists = await prisma.$queryRaw`SELECT id, username, name FROM "MakeupArtist" ORDER BY name`;
    console.log('\nAll Artists in Database:');
    artists.forEach((artist, index) => {
      console.log(`${index + 1}. ${artist.name} (@${artist.username})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyConnection();