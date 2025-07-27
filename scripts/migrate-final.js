const { PrismaClient } = require('@prisma/client');
const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper functions
function generatePublicId(prefix = 'img') {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${timestamp}_${random}`;
}

async function uploadImageFromUrl(imageUrl, options = {}) {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: options.folder || 'goldiegrace',
      public_id: options.public_id,
      resource_type: 'auto',
    });
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
}

// Artists and their portfolio images from our seed data
const artistPortfolioImages = [
  {
    username: 'sarah_beauty',
    portfolioImages: [
      'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=800',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
      'https://images.unsplash.com/photo-1521146764736-56c929d59c83?w=800',
      'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800'
    ]
  },
  {
    username: 'maria_glam',
    portfolioImages: [
      'https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=800',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800',
      'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=800',
      'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=800'
    ]
  },
  {
    username: 'jessica_artistry',
    portfolioImages: [
      'https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?w=800',
      'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800'
    ]
  },
  {
    username: 'alex_pro',
    portfolioImages: [
      'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=800',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800',
      'https://images.unsplash.com/photo-1523264653568-d3d4032d1476?w=800',
      'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=800'
    ]
  },
  {
    username: 'taylor_mua',
    portfolioImages: [
      'https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=800',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800',
      'https://images.unsplash.com/photo-1521146764736-56c929d59c83?w=800',
      'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=800'
    ]
  },
  {
    username: 'nina_beauty',
    portfolioImages: [
      'https://images.unsplash.com/photo-1523264653568-d3d4032d1476?w=800',
      'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=800',
      'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=800',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800'
    ]
  },
  {
    username: 'rachel_glow',
    portfolioImages: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
      'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=800',
      'https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?w=800',
      'https://images.unsplash.com/photo-1521146764736-56c929d59c83?w=800'
    ]
  },
  {
    username: 'lisa_transform',
    portfolioImages: [
      'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800',
      'https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=800',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800'
    ]
  },
  {
    username: 'monica_style',
    portfolioImages: [
      'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=800',
      'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=800',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800',
      'https://images.unsplash.com/photo-1523264653568-d3d4032d1476?w=800'
    ]
  },
  {
    username: 'diana_luxe',
    portfolioImages: [
      'https://images.unsplash.com/photo-1523264653568-d3d4032d1476?w=800',
      'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=800',
      'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=800',
      'https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=800'
    ]
  },
  {
    username: 'kim_minimal',
    portfolioImages: [
      'https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?w=800',
      'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=800',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
      'https://images.unsplash.com/photo-1521146764736-56c929d59c83?w=800'
    ]
  },
  {
    username: 'amanda_vintage',
    portfolioImages: [
      'https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=800',
      'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=800',
      'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=800',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800'
    ]
  }
];

async function migrateToCloudinary() {
  try {
    console.log('🚀 Starting Cloudinary Migration\n');
    
    // Check if Cloudinary is configured
    const config = cloudinary.config();
    console.log('📋 Cloudinary Configuration:');
    console.log(`   Cloud Name: ${config.cloud_name}`);
    console.log(`   API Key: ${config.api_key?.substring(0, 5)}...`);
    console.log(`   API Secret: ${config.api_secret ? '***' : 'Not set'}\n`);
    
    if (!config.cloud_name || !config.api_key || !config.api_secret) {
      console.error('❌ Cloudinary credentials not properly configured.');
      process.exit(1);
    }

    console.log('📊 Checking database...\n');

    // Get all artists
    const artists = await prisma.makeupArtist.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        portfolioImages: true,
        profileImage: true
      }
    });

    if (artists.length === 0) {
      console.log('❌ No makeup artists found in database.');
      process.exit(1);
    }

    console.log(`Found ${artists.length} makeup artists\n`);

    // Create backup
    const backup = artists.map(artist => ({
      id: artist.id,
      username: artist.username,
      originalPortfolioImages: artist.portfolioImages,
      originalProfileImage: artist.profileImage
    }));

    const backupFilename = `cloudinary-migration-backup-${Date.now()}.json`;
    fs.writeFileSync(backupFilename, JSON.stringify(backup, null, 2));
    console.log(`✅ Backup saved to ${backupFilename}\n`);

    console.log('🔄 Starting migration...\n');

    let totalImagesUploaded = 0;
    let totalImagesFailed = 0;

    // Migrate each artist
    for (const artist of artists) {
      console.log(`\n👤 Migrating ${artist.name} (${artist.username})...`);
      
      // Find the correct portfolio images for this artist
      const artistData = artistPortfolioImages.find(a => a.username === artist.username);
      const portfolioUrls = artistData?.portfolioImages || artist.portfolioImages;
      
      // Upload portfolio images
      const newPortfolioImages = [];
      
      for (let i = 0; i < portfolioUrls.length; i++) {
        const imageUrl = portfolioUrls[i];
        const publicId = generatePublicId(`portfolio_${artist.username}_${i + 1}`);
        
        try {
          console.log(`  📸 Uploading portfolio image ${i + 1}/${portfolioUrls.length}...`);
          const result = await uploadImageFromUrl(imageUrl, {
            folder: `goldiegrace/portfolio/${artist.username}`,
            public_id: publicId
          });
          
          newPortfolioImages.push(result.public_id);
          console.log(`  ✅ Uploaded: ${result.public_id}`);
          totalImagesUploaded++;
        } catch (error) {
          console.error(`  ❌ Failed to upload portfolio image ${i + 1}:`, error.message);
          totalImagesFailed++;
        }
      }

      // Upload profile image
      let newProfileImage = artist.profileImage;
      if (artist.profileImage && artist.profileImage.includes('unsplash.com')) {
        try {
          console.log(`  👤 Uploading profile image...`);
          const publicId = generatePublicId(`profile_${artist.username}`);
          const result = await uploadImageFromUrl(artist.profileImage, {
            folder: `goldiegrace/profile-images/artists`,
            public_id: publicId
          });
          
          newProfileImage = result.public_id;
          console.log(`  ✅ Uploaded profile: ${result.public_id}`);
          totalImagesUploaded++;
        } catch (error) {
          console.error(`  ❌ Failed to upload profile image:`, error.message);
          totalImagesFailed++;
        }
      }

      // Update database with Cloudinary public IDs
      if (newPortfolioImages.length > 0 || newProfileImage !== artist.profileImage) {
        await prisma.makeupArtist.update({
          where: { id: artist.id },
          data: {
            portfolioImages: newPortfolioImages.length > 0 ? newPortfolioImages : artist.portfolioImages,
            profileImage: newProfileImage
          }
        });
        
        console.log(`  ✅ Updated database for ${artist.name}`);
      }
    }

    console.log('\n✨ Migration completed!\n');
    
    // Summary
    console.log('📊 Migration Summary:');
    console.log(`- Total artists migrated: ${artists.length}`);
    console.log(`- Total images uploaded: ${totalImagesUploaded}`);
    console.log(`- Total images failed: ${totalImagesFailed}`);
    console.log(`- Backup saved to: ${backupFilename}`);
    
    if (totalImagesUploaded > 0) {
      console.log('\n🎉 Successfully migrated images to Cloudinary!');
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateToCloudinary().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});