const { PrismaClient } = require('@prisma/client');
const { v2: cloudinary } = require('cloudinary');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function verifyMigration() {
  try {
    console.log('🔍 Verifying Cloudinary Migration...\n');
    
    // Get all artists
    const artists = await prisma.makeupArtist.findMany({
      select: {
        name: true,
        username: true,
        portfolioImages: true,
        profileImage: true
      }
    });
    
    console.log(`Found ${artists.length} artists\n`);
    
    // Check first artist in detail
    const firstArtist = artists[0];
    console.log(`📋 Checking ${firstArtist.name} (${firstArtist.username}):`);
    console.log(`   Profile Image: ${firstArtist.profileImage}`);
    console.log(`   Portfolio Images: ${firstArtist.portfolioImages.length}`);
    
    // Generate a URL for the first portfolio image
    if (firstArtist.portfolioImages.length > 0) {
      const imageUrl = cloudinary.url(firstArtist.portfolioImages[0], {
        secure: true,
        transformation: [{ width: 400, height: 400, crop: 'fill' }]
      });
      console.log(`\n   Sample portfolio image URL:`);
      console.log(`   ${imageUrl}`);
    }
    
    // Check all artists have Cloudinary images
    console.log('\n📊 Migration Status:');
    let allMigrated = true;
    
    for (const artist of artists) {
      const hasCloudinaryProfile = artist.profileImage && artist.profileImage.includes('goldiegrace/');
      const hasCloudinaryPortfolio = artist.portfolioImages.every(img => img.includes('goldiegrace/'));
      
      if (hasCloudinaryProfile && hasCloudinaryPortfolio) {
        console.log(`   ✅ ${artist.name}: Fully migrated`);
      } else {
        console.log(`   ❌ ${artist.name}: Not fully migrated`);
        allMigrated = false;
      }
    }
    
    if (allMigrated) {
      console.log('\n✨ All artists successfully migrated to Cloudinary!');
    } else {
      console.log('\n⚠️  Some artists need migration');
    }
    
  } catch (error) {
    console.error('Error verifying migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyMigration();