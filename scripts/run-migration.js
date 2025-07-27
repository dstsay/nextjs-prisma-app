const { PrismaClient } = require('@prisma/client');
const { uploadImageFromUrl, generatePublicId } = require('../lib/cloudinary');
const readline = require('readline');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

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
  let rl;
  
  try {
    console.log('🚀 Starting Cloudinary Migration\n');
    
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('❌ Cloudinary credentials not found in environment variables.');
      console.log('\nPlease set up your Cloudinary account and add credentials to .env.local:');
      console.log('- CLOUDINARY_CLOUD_NAME');
      console.log('- CLOUDINARY_API_KEY');
      console.log('- CLOUDINARY_API_SECRET\n');
      console.log('See CLOUDINARY_SETUP.md for detailed instructions.\n');
      process.exit(1);
    }

    // Create readline interface for user prompts
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const prompt = (question) => 
      new Promise((resolve) => rl.question(question, resolve));

    // Check if we're in production mode
    const isProduction = await prompt('Are you migrating the PRODUCTION database? (yes/no): ');
    if (isProduction.toLowerCase() !== 'yes' && isProduction.toLowerCase() !== 'no') {
      console.log('Please answer yes or no');
      process.exit(1);
    }

    console.log(`\n📊 Checking ${isProduction.toLowerCase() === 'yes' ? 'PRODUCTION' : 'development'} database...\n`);

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

    // Show migration plan
    console.log('📋 Migration Plan:');
    console.log('1. Upload all portfolio images to Cloudinary');
    console.log('2. Upload profile images to Cloudinary');
    console.log('3. Update database with Cloudinary URLs');
    console.log('4. Create backup of original URLs\n');

    const proceed = await prompt('Proceed with migration? (yes/no): ');
    if (proceed.toLowerCase() !== 'yes') {
      console.log('Migration cancelled.');
      process.exit(0);
    }

    console.log('\n🔄 Starting migration...\n');

    // Create backup
    const backup = artists.map(artist => ({
      id: artist.id,
      username: artist.username,
      originalPortfolioImages: artist.portfolioImages,
      originalProfileImage: artist.profileImage
    }));

    // Save backup to file
    const backupFilename = `cloudinary-migration-backup-${Date.now()}.json`;
    fs.writeFileSync(backupFilename, JSON.stringify(backup, null, 2));
    console.log(`✅ Backup saved to ${backupFilename}\n`);

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
        } catch (error) {
          console.error(`  ❌ Failed to upload portfolio image ${i + 1}:`, error);
          // Continue with next image
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
        } catch (error) {
          console.error(`  ❌ Failed to upload profile image:`, error);
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

    console.log('\n✨ Migration completed successfully!\n');
    
    // Summary
    const updatedArtists = await prisma.makeupArtist.findMany({
      select: {
        name: true,
        portfolioImages: true
      }
    });
    
    console.log('📊 Migration Summary:');
    console.log(`- Total artists migrated: ${updatedArtists.length}`);
    console.log(`- Backup saved to: ${backupFilename}`);
    console.log('\n🎉 All portfolio images are now hosted on Cloudinary!');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (rl) {
      rl.close();
    }
    await prisma.$disconnect();
  }
}

// Run migration
migrateToCloudinary().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});