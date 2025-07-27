const { PrismaClient } = require('@prisma/client');

// Initialize Prisma Client
const prisma = new PrismaClient();

// Makeup artist data with makeup-specific portfolio images
const makeupArtists = [
  {
    username: 'sarah_beauty',
    portfolioImages: [
      'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=800', // Soft bridal makeup
      'https://images.unsplash.com/photo-1560869713-da86a9ec0744?w=800', // Natural glam makeup
      'https://images.unsplash.com/photo-1620724072825-66c33d1564dd?w=800', // Elegant bridal look
      'https://images.unsplash.com/photo-1609207807107-e8ec2120f9de?w=800'  // Editorial beauty makeup
    ]
  },
  {
    username: 'maria_glam',
    portfolioImages: [
      'https://images.unsplash.com/photo-1583241800698-e8ab01828e07?w=800', // Bold red lips glam
      'https://images.unsplash.com/photo-1560718936-dd2fcbb4ed35?w=800', // Dramatic eye makeup
      'https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=800', // Red carpet glamour
      'https://images.unsplash.com/photo-1617019114583-e1c8ba8fabaa?w=800'  // Creative makeup art
    ]
  },
  {
    username: 'jessica_artistry',
    portfolioImages: [
      'https://images.unsplash.com/photo-1620065416918-beddedf15de2?w=800', // Glass skin makeup
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800', // K-beauty natural glow
      'https://images.unsplash.com/photo-1617331721458-bd3bd3f9c7f8?w=800', // Dewy makeup look
      'https://images.unsplash.com/photo-1612201142855-7873879b5c5b?w=800'  // Asian beauty techniques
    ]
  },
  {
    username: 'alex_pro',
    portfolioImages: [
      'https://images.unsplash.com/photo-1600298881203-29bf33316e20?w=800', // Fashion editorial makeup
      'https://images.unsplash.com/photo-1620122830785-a18b43585b44?w=800', // Avant-garde creative
      'https://images.unsplash.com/photo-1583241801030-0d0cac872800?w=800', // Runway makeup
      'https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?w=800'  // High fashion beauty
    ]
  },
  {
    username: 'taylor_mua',
    portfolioImages: [
      'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800', // Natural everyday makeup
      'https://images.unsplash.com/photo-1618354691249-18772bbac3a5?w=800', // Simple glam look
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800', // Fresh makeup look
      'https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=800'  // Teen-friendly makeup
    ]
  },
  {
    username: 'nina_beauty',
    portfolioImages: [
      'https://images.unsplash.com/photo-1617627143233-61e0dca7b5f8?w=800', // South Asian bridal
      'https://images.unsplash.com/photo-1620415836902-b05534ff7b19?w=800', // Traditional makeup
      'https://images.unsplash.com/photo-1619451451124-e21de5572020?w=800', // Bollywood glamour
      'https://images.unsplash.com/photo-1595936760906-625f4307c925?w=800'  // Vibrant celebration makeup
    ]
  },
  {
    username: 'rachel_glow',
    portfolioImages: [
      'https://images.unsplash.com/photo-1599983420164-e43f9ed32c33?w=800', // Natural clean beauty
      'https://images.unsplash.com/photo-1612636761294-5c0e869b4f9a?w=800', // Minimal makeup look
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800', // Eco-friendly beauty
      'https://images.unsplash.com/photo-1618374647107-d33f6d5330a8?w=800'  // Organic makeup products
    ]
  },
  {
    username: 'lisa_transform',
    portfolioImages: [
      'https://images.unsplash.com/photo-1608068811588-81e9c83b1e04?w=800', // Corrective makeup
      'https://images.unsplash.com/photo-1620916297217-1520862e9cdc?w=800', // Coverage techniques
      'https://images.unsplash.com/photo-1583241475784-c4c9c1512b0a?w=800', // Transformation makeup
      'https://images.unsplash.com/photo-1618354691229-88d47f285158?w=800'  // Professional coverage
    ]
  },
  {
    username: 'monica_style',
    portfolioImages: [
      'https://images.unsplash.com/photo-1560325978-3169a42619f9?w=800', // HD camera makeup
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800', // Contouring techniques
      'https://images.unsplash.com/photo-1620011557027-8dc7a5ec7a85?w=800', // Film makeup
      'https://images.unsplash.com/photo-1609207753409-3cf51b0fc9ba?w=800'  // TV ready makeup
    ]
  },
  {
    username: 'diana_luxe',
    portfolioImages: [
      'https://images.unsplash.com/photo-1583241800025-7a007de0ebec?w=800', // Luxury makeup
      'https://images.unsplash.com/photo-1620724072948-cb9c2e80abcd?w=800', // High-end glam
      'https://images.unsplash.com/photo-1613553507747-5f8d62ad5904?w=800', // Premium makeup look
      'https://images.unsplash.com/photo-1619775862973-8def165e91df?w=800'  // VIP event makeup
    ]
  },
  {
    username: 'kim_minimal',
    portfolioImages: [
      'https://images.unsplash.com/photo-1620916566398-5fe5d8e43470?w=800', // No-makeup makeup
      'https://images.unsplash.com/photo-1614252369616-40e03d0e60de?w=800', // Minimal beauty
      'https://images.unsplash.com/photo-1618354691792-d1d42acfd860?w=800', // Natural enhancement
      'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800'  // Simple clean look
    ]
  },
  {
    username: 'amanda_vintage',
    portfolioImages: [
      'https://images.unsplash.com/photo-1583147610331-c5dbb007737d?w=800', // Vintage red lips
      'https://images.unsplash.com/photo-1592621385612-4d7129426394?w=800', // Retro glamour
      'https://images.unsplash.com/photo-1601972602373-28ba01f732d8?w=800', // Pin-up style
      'https://images.unsplash.com/photo-1620122830462-87ae57950e64?w=800'  // Period makeup look
    ]
  }
];

async function updatePortfolios() {
  try {
    console.log('🔍 Checking database...\n');
    
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
    console.log('🌱 Starting portfolio image update...\n');
    
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
          console.log(`✅ Updated ${existing.name}'s portfolio with makeup-specific images`);
        }
      }
      
      console.log(`\n✨ Successfully updated ${updatedCount} artist portfolios!`);
    });
    
    console.log('\n🎉 Portfolio update completed successfully!');
    
  } catch (error) {
    console.error('❌ Error updating portfolios:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updatePortfolios().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});