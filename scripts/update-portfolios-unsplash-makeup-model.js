// Load environment variables
require('dotenv').config({ path: '.env.production' });

const { PrismaClient } = require('@prisma/client');

// Initialize Prisma Client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Makeup artist data with images from Unsplash makeup-model search
// Using verified free Unsplash images only
const makeupArtists = [
  {
    username: 'sarah_beauty',
    portfolioImages: [
      'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=800', // Soft bridal makeup
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', // Natural beauty look
      'https://images.unsplash.com/photo-1521146764736-56c929d59c83?w=800', // Elegant makeup
      'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800'  // Bridal beauty
    ]
  },
  {
    username: 'maria_glam',
    portfolioImages: [
      'https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=800', // Bold glamour makeup
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800', // Red carpet glam
      'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=800', // Dramatic makeup
      'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=800'  // Evening glamour
    ]
  },
  {
    username: 'jessica_artistry',
    portfolioImages: [
      'https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?w=800', // K-beauty glow
      'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800', // Natural Asian beauty
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800', // Dewy skin look
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800'  // Glass skin effect
    ]
  },
  {
    username: 'alex_pro',
    portfolioImages: [
      'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=800', // Editorial fashion
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800', // Creative makeup art
      'https://images.unsplash.com/photo-1523264653568-d3d4032d1476?w=800', // Avant-garde look
      'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=800'  // High fashion beauty
    ]
  },
  {
    username: 'taylor_mua',
    portfolioImages: [
      'https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=800', // Natural everyday
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800', // Simple beauty
      'https://images.unsplash.com/photo-1521146764736-56c929d59c83?w=800', // Fresh faced look
      'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=800'  // Teen-friendly makeup
    ]
  },
  {
    username: 'nina_beauty',
    portfolioImages: [
      'https://images.unsplash.com/photo-1523264653568-d3d4032d1476?w=800', // South Asian beauty
      'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=800', // Vibrant colors
      'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=800', // Traditional glam
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800'  // Celebration makeup
    ]
  },
  {
    username: 'rachel_glow',
    portfolioImages: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', // Natural clean beauty
      'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=800', // Minimal makeup
      'https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?w=800', // Eco-friendly look
      'https://images.unsplash.com/photo-1521146764736-56c929d59c83?w=800'  // Organic beauty
    ]
  },
  {
    username: 'lisa_transform',
    portfolioImages: [
      'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800', // Professional application
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800', // Coverage techniques
      'https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=800', // Transformation
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800'  // Corrective makeup
    ]
  },
  {
    username: 'monica_style',
    portfolioImages: [
      'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=800', // HD makeup
      'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=800', // Camera ready
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800', // Contoured look
      'https://images.unsplash.com/photo-1523264653568-d3d4032d1476?w=800'  // TV/Film makeup
    ]
  },
  {
    username: 'diana_luxe',
    portfolioImages: [
      'https://images.unsplash.com/photo-1523264653568-d3d4032d1476?w=800', // Luxury beauty
      'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=800', // High-end glam
      'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=800', // Premium makeup
      'https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=800'  // VIP glamour
    ]
  },
  {
    username: 'kim_minimal',
    portfolioImages: [
      'https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?w=800', // No-makeup makeup
      'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=800', // Minimal beauty
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', // Natural look
      'https://images.unsplash.com/photo-1521146764736-56c929d59c83?w=800'  // Simple beauty
    ]
  },
  {
    username: 'amanda_vintage',
    portfolioImages: [
      'https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=800', // Vintage red lips
      'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=800', // Retro glamour
      'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=800', // Classic beauty
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800'  // Pin-up style
    ]
  }
];

async function updatePortfolios() {
  try {
    const isProduction = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('prisma.io');
    console.log(`🔍 Checking ${isProduction ? 'PRODUCTION' : 'development'} database...\n`);
    
    // Check if artists exist
    const existingArtists = await prisma.makeupArtist.findMany({
      select: {
        id: true,
        username: true,
        name: true
      }
    });
    
    if (existingArtists.length === 0) {
      console.log('❌ No makeup artists found in database.');
      await prisma.$disconnect();
      return;
    }
    
    console.log(`✅ Found ${existingArtists.length} makeup artists in database.\n`);
    console.log('Artists to update:');
    existingArtists.forEach(artist => {
      console.log(`  - ${artist.name} (${artist.username})`);
    });
    console.log('');
    
    console.log('🌱 Starting portfolio update with Unsplash makeup-model images...\n');
    
    // Use a transaction for data integrity
    await prisma.$transaction(async (tx) => {
      let updatedCount = 0;
      
      for (const artistData of makeupArtists) {
        const existing = existingArtists.find(a => a.username === artistData.username);
        
        if (existing) {
          console.log(`Updating portfolio for: ${existing.name}...`);
          
          // Update only the portfolio images
          await tx.makeupArtist.update({
            where: { id: existing.id },
            data: {
              portfolioImages: artistData.portfolioImages
            }
          });
          
          updatedCount++;
          console.log(`✅ Updated ${existing.name}'s portfolio`);
        }
      }
      
      console.log(`\n✨ Successfully updated ${updatedCount} artist portfolios!`);
    });
    
    console.log('\n🎉 Portfolio update completed successfully!');
    console.log('\nAll portfolios now use images from Unsplash makeup-model search.');
    
  } catch (error) {
    console.error('❌ Error updating portfolios:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
const isProduction = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('prisma.io');
console.log(`=== ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} PORTFOLIO UPDATE ===\n`);
console.log('Using images from: https://unsplash.com/s/photos/makeup-model\n');

updatePortfolios().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});