import { PrismaClient } from '@prisma/client';
import { uploadImageFromUrl, generatePublicId } from '../lib/cloudinary';
import * as fs from 'fs';

// Automated version of migration script - no prompts
// Use with caution - set CONFIRM_PRODUCTION=true to run on production

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

async function migrateToCloudinaryAuto() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🚀 Starting Cloudinary Migration (Automated)\n');
    
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('❌ Cloudinary credentials not found in environment variables.');
      process.exit(1);
    }

    // Check database URL
    const dbUrl = process.env.DATABASE_URL || '';
    const isProduction = dbUrl.includes('vercel-storage.com') || dbUrl.includes('@ep-') || dbUrl.includes('prisma.io');
    
    console.log('🔍 Database Check:');
    console.log(`- Database Type: ${isProduction ? 'Production' : 'Development'}`);
    console.log(`- Host: ${dbUrl.split('@')[1]?.split(':')[0] || 'unknown'}\n`);

    // Safety check for production
    if (isProduction && process.env.CONFIRM_PRODUCTION !== 'true') {
      console.error('❌ Production database detected but CONFIRM_PRODUCTION is not set to "true"');
      console.error('To run on production, set CONFIRM_PRODUCTION=true');
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

    const needsToMigrate = artists.filter(artist => 
      !artist.portfolioImages.some(img => img.includes('goldiegrace/')) ||
      (artist.profileImage && !artist.profileImage.includes('goldiegrace/'))
    );

    console.log(`Found ${artists.length} makeup artists`);
    console.log(`Artists to migrate: ${needsToMigrate.length}\n`);

    if (needsToMigrate.length === 0) {
      console.log('✅ All artists are already migrated!');
      process.exit(0);
    }

    console.log('🔄 Starting migration...\n');

    // Create backup
    const backup = artists.map(artist => ({
      id: artist.id,
      username: artist.username,
      originalPortfolioImages: artist.portfolioImages,
      originalProfileImage: artist.profileImage
    }));

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilename = `cloudinary-migration-backup-auto-${timestamp}.json`;
    fs.writeFileSync(backupFilename, JSON.stringify(backup, null, 2));
    console.log(`✅ Backup saved to ${backupFilename}\n`);

    // Track migration results
    const migrationResults = {
      successful: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[]
    };

    // Migrate each artist
    for (const artist of needsToMigrate) {
      console.log(`\n👤 Migrating ${artist.name} (${artist.username})...`);
      
      try {
        // Check if already has Cloudinary images
        if (artist.portfolioImages.some(img => img.includes('goldiegrace/'))) {
          console.log(`  ⏭️  Skipping - already has Cloudinary images`);
          migrationResults.skipped++;
          continue;
        }

        // Find the correct portfolio images for this artist
        const artistData = artistPortfolioImages.find(a => a.username === artist.username);
        const portfolioUrls = artistData?.portfolioImages || artist.portfolioImages;
        
        // Upload portfolio images
        const newPortfolioImages: string[] = [];
        let uploadErrors = 0;
        
        for (let i = 0; i < portfolioUrls.length; i++) {
          const imageUrl = portfolioUrls[i];
          const publicId = generatePublicId(`portfolio_${artist.username}_${i + 1}`);
          
          try {
            console.log(`  📸 Uploading portfolio image ${i + 1}/${portfolioUrls.length}...`);
            const result = await uploadImageFromUrl(imageUrl, {
              folder: `goldiegrace/portfolio/${artist.username}`,
              public_id: publicId,
              overwrite: true
            });
            
            newPortfolioImages.push(result.public_id);
            console.log(`  ✅ Uploaded: ${result.public_id}`);
          } catch (error) {
            console.error(`  ❌ Failed to upload portfolio image ${i + 1}:`, error);
            uploadErrors++;
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
              public_id: publicId,
              overwrite: true
            });
            
            newProfileImage = result.public_id;
            console.log(`  ✅ Uploaded profile: ${result.public_id}`);
          } catch (error) {
            console.error(`  ❌ Failed to upload profile image:`, error);
          }
        }

        // Update database
        if (newPortfolioImages.length > 0 || (newProfileImage !== artist.profileImage)) {
          await prisma.makeupArtist.update({
            where: { id: artist.id },
            data: {
              portfolioImages: newPortfolioImages.length > 0 ? newPortfolioImages : artist.portfolioImages,
              profileImage: newProfileImage
            }
          });
          
          console.log(`  ✅ Updated database for ${artist.name}`);
          migrationResults.successful++;
        } else {
          console.log(`  ⚠️  No images were successfully uploaded`);
          migrationResults.failed++;
          migrationResults.errors.push(`${artist.username}: No images uploaded`);
        }
      } catch (error) {
        console.error(`  ❌ Failed to migrate ${artist.username}:`, error);
        migrationResults.failed++;
        migrationResults.errors.push(`${artist.username}: ${error}`);
      }
    }

    console.log('\n✨ Migration completed!\n');
    
    // Summary
    console.log('📊 Migration Summary:');
    console.log(`- Total artists: ${artists.length}`);
    console.log(`- Successfully migrated: ${migrationResults.successful}`);
    console.log(`- Failed: ${migrationResults.failed}`);
    console.log(`- Skipped: ${migrationResults.skipped}`);
    
    if (migrationResults.errors.length > 0) {
      console.log('\n❌ Errors:');
      migrationResults.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    console.log(`\n📁 Backup saved to: ${backupFilename}`);
    console.log('\n🎉 Migration process complete!');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
if (require.main === module) {
  migrateToCloudinaryAuto().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { migrateToCloudinaryAuto };