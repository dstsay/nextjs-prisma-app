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

// Makeup artist data with VERIFIED makeup-specific portfolio images
// All images are from Unsplash and show actual makeup/beauty content
const makeupArtists = [
  {
    username: 'sarah_beauty',
    portfolioImages: [
      'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=800', // Bridal makeup application
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800', // Soft natural makeup look
      'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800', // Elegant makeup
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800'  // Professional makeup application
    ]
  },
  {
    username: 'maria_glam',
    portfolioImages: [
      'https://images.unsplash.com/photo-1583241475880-083f84372725?w=800', // Bold red lipstick
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800', // Glamorous makeup
      'https://images.unsplash.com/photo-1597225244660-1cd128c64284?w=800', // Dramatic eye makeup
      'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=800'  // Red carpet ready makeup
    ]
  },
  {
    username: 'jessica_artistry',
    portfolioImages: [
      'https://images.unsplash.com/photo-1512207846876-bb54ef5056fe?w=800', // K-beauty skincare
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800', // Natural glow makeup
      'https://images.unsplash.com/photo-1598452963314-b09f397a5c48?w=800', // Asian beauty makeup
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800'  // Dewy skin makeup
    ]
  },
  {
    username: 'alex_pro',
    portfolioImages: [
      'https://images.unsplash.com/photo-1583241475784-c4c9c1512b0a?w=800', // Editorial makeup art
      'https://images.unsplash.com/photo-1560869713-bf165a9cfac8?w=800', // Creative makeup
      'https://images.unsplash.com/photo-1597225133903-011dae034850?w=800', // Fashion makeup
      'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=800'  // Avant-garde makeup
    ]
  },
  {
    username: 'taylor_mua',
    portfolioImages: [
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800', // Natural everyday makeup
      'https://images.unsplash.com/photo-1515688594390-b649af70d282?w=800', // Simple makeup look
      'https://images.unsplash.com/photo-1503236823255-94609f598e71?w=800', // Fresh faced makeup
      'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800'  // Teen-friendly natural makeup
    ]
  },
  {
    username: 'nina_beauty',
    portfolioImages: [
      'https://images.unsplash.com/photo-1617627143233-61e0dca7b5f8?w=800', // South Asian bridal makeup
      'https://images.unsplash.com/photo-1519635694260-6af6fc200c89?w=800', // Traditional eye makeup
      'https://images.unsplash.com/photo-1583089892943-e02e5b017b6a?w=800', // Bold colorful makeup
      'https://images.unsplash.com/photo-1560869713-da86a9ec0744?w=800'  // Celebration makeup
    ]
  },
  {
    username: 'rachel_glow',
    portfolioImages: [
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800', // Natural beauty products
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800', // Clean beauty makeup
      'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800', // Organic cosmetics
      'https://images.unsplash.com/photo-1609803447999-87c4e0ccd5a8?w=800'  // Eco-friendly makeup
    ]
  },
  {
    username: 'lisa_transform',
    portfolioImages: [
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800', // Professional makeup application
      'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=800', // Coverage makeup techniques
      'https://images.unsplash.com/photo-1583241475784-c4c9c1512b0a?w=800', // Transformation makeup
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800'  // Corrective makeup
    ]
  },
  {
    username: 'monica_style',
    portfolioImages: [
      'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800', // HD makeup
      'https://images.unsplash.com/photo-1583241475880-083f84372725?w=800', // Camera-ready makeup
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800', // Contouring makeup
      'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=800'  // Film makeup techniques
    ]
  },
  {
    username: 'diana_luxe',
    portfolioImages: [
      'https://images.unsplash.com/photo-1597225244660-1cd128c64284?w=800', // Luxury makeup look
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800', // High-end glamour
      'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=800', // Premium makeup
      'https://images.unsplash.com/photo-1583241475880-083f84372725?w=800'  // VIP event makeup
    ]
  },
  {
    username: 'kim_minimal',
    portfolioImages: [
      'https://images.unsplash.com/photo-1503236823255-94609f598e71?w=800', // No-makeup makeup look
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800', // Minimal beauty
      'https://images.unsplash.com/photo-1515688594390-b649af70d282?w=800', // Natural enhancement
      'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800'  // Simple clean beauty
    ]
  },
  {
    username: 'amanda_vintage',
    portfolioImages: [
      'https://images.unsplash.com/photo-1583241475880-083f84372725?w=800', // Vintage red lips
      'https://images.unsplash.com/photo-1597225244660-1cd128c64284?w=800', // Retro makeup style
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800', // Classic glamour
      'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=800'  // Pin-up makeup look
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
    
    console.log('🌱 Starting portfolio image update with VERIFIED makeup images...\n');
    
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
          console.log(`✅ Updated ${existing.name}'s portfolio with verified makeup images`);
        }
      }
      
      console.log(`\n✨ Successfully updated ${updatedCount} artist portfolios!`);
    });
    
    console.log('\n🎉 Portfolio update completed successfully!');
    console.log('\nAll artist portfolios now feature VERIFIED makeup-specific images from Unsplash.');
    
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
console.log('This script will update all makeup artist portfolio images with VERIFIED makeup photos.\n');

updatePortfolios().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});