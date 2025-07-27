import { PrismaClient } from '@prisma/client';
import { uploadImageFromUrl, generatePublicId } from '../lib/cloudinary';
import * as readline from 'readline';
import * as fs from 'fs';

// Production-safe version of the migration script
// This script includes additional safety checks and better error handling

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

async function migrateToCloudinaryProduction() {
  let rl: readline.Interface | undefined;
  const prisma = new PrismaClient();
  
  try {
    console.log('🚀 Starting Cloudinary Migration (Production Version)\n');
    
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('❌ Cloudinary credentials not found in environment variables.');
      console.log('\nPlease set up your Cloudinary account and add credentials:');
      console.log('- CLOUDINARY_CLOUD_NAME');
      console.log('- CLOUDINARY_API_KEY');
      console.log('- CLOUDINARY_API_SECRET\n');
      process.exit(1);
    }

    // Check database URL
    const dbUrl = process.env.DATABASE_URL || '';
    const isVercelPostgres = dbUrl.includes('vercel-storage.com') || dbUrl.includes('@ep-');
    
    console.log('🔍 Database Check:');
    console.log(`- Database Type: ${isVercelPostgres ? 'Vercel Postgres' : 'Other'}`);
    console.log(`- Host: ${dbUrl.split('@')[1]?.split(':')[0] || 'unknown'}\n`);

    // Create readline interface for user prompts
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const prompt = (question: string): Promise<string> => 
      new Promise((resolve) => rl!.question(question, resolve));

    // Extra confirmation for production
    if (isVercelPostgres) {
      console.log('⚠️  WARNING: You are about to migrate a PRODUCTION database!');
      console.log('This will modify artist profile and portfolio images.\n');
      
      const confirm1 = await prompt('Are you SURE you want to proceed with PRODUCTION migration? (type "yes" to confirm): ');
      if (confirm1 !== 'yes') {
        console.log('Migration cancelled.');
        process.exit(0);
      }
      
      const confirm2 = await prompt('Please type the database host to confirm: ');
      const actualHost = dbUrl.split('@')[1]?.split(':')[0] || '';
      if (!confirm2 || !actualHost.includes(confirm2)) {
        console.log('Host confirmation failed. Migration cancelled.');
        process.exit(0);
      }
    }

    console.log('\n📊 Checking database...\n');

    // Get all artists and check their current state
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

    // Check if migration has already been done
    const alreadyMigrated = artists.filter(artist => 
      artist.portfolioImages.some(img => img.includes('goldiegrace/')) ||
      (artist.profileImage && artist.profileImage.includes('goldiegrace/'))
    );

    if (alreadyMigrated.length > 0) {
      console.log(`⚠️  ${alreadyMigrated.length} artists appear to already have Cloudinary images.`);
      console.log('Artists already migrated:');
      alreadyMigrated.forEach(artist => {
        console.log(`  - ${artist.name} (${artist.username})`);
      });
      console.log('');
      
      const continueAnyway = await prompt('Continue with migration anyway? (yes/no): ');
      if (continueAnyway.toLowerCase() !== 'yes') {
        console.log('Migration cancelled.');
        process.exit(0);
      }
    }

    console.log(`Found ${artists.length} makeup artists\n`);

    // Show migration plan
    console.log('📋 Migration Plan:');
    console.log('1. Create backup of current database state');
    console.log('2. Upload all portfolio images to Cloudinary');
    console.log('3. Upload profile images to Cloudinary');
    console.log('4. Update database with Cloudinary public IDs');
    console.log('5. Verify migration success\n');

    const needsToMigrate = artists.filter(artist => 
      !artist.portfolioImages.some(img => img.includes('goldiegrace/')) ||
      (artist.profileImage && !artist.profileImage.includes('goldiegrace/'))
    );

    console.log(`Artists to migrate: ${needsToMigrate.length}`);
    console.log(`Artists already migrated: ${alreadyMigrated.length}\n`);

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

    // Save backup to file with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilename = `cloudinary-migration-backup-production-${timestamp}.json`;
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
              public_id: publicId
            });
            
            newPortfolioImages.push(result.public_id);
            console.log(`  ✅ Uploaded: ${result.public_id}`);
          } catch (error) {
            console.error(`  ❌ Failed to upload portfolio image ${i + 1}:`, error);
            uploadErrors++;
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

        // Only update if we successfully uploaded at least some images
        if (newPortfolioImages.length > 0 || (newProfileImage !== artist.profileImage)) {
          await prisma.makeupArtist.update({
            where: { id: artist.id },
            data: {
              portfolioImages: newPortfolioImages.length > 0 ? newPortfolioImages : artist.portfolioImages,
              profileImage: newProfileImage
            }
          });
          
          console.log(`  ✅ Updated database for ${artist.name}`);
          console.log(`     - Portfolio images: ${newPortfolioImages.length}/${portfolioUrls.length}`);
          console.log(`     - Profile image: ${newProfileImage !== artist.profileImage ? 'Updated' : 'Unchanged'}`);
          
          if (uploadErrors > 0) {
            console.log(`     - ⚠️  ${uploadErrors} images failed to upload`);
          }
          
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
    console.log(`- Total artists in database: ${artists.length}`);
    console.log(`- Successfully migrated: ${migrationResults.successful}`);
    console.log(`- Failed migrations: ${migrationResults.failed}`);
    console.log(`- Skipped (already migrated): ${migrationResults.skipped + alreadyMigrated.length}`);
    
    if (migrationResults.errors.length > 0) {
      console.log('\n❌ Errors:');
      migrationResults.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    console.log(`\n📁 Backup saved to: ${backupFilename}`);
    console.log('\n🎉 Migration process complete!');
    
    // Verify final state
    const finalCheck = await prisma.makeupArtist.findMany({
      select: {
        name: true,
        username: true,
        portfolioImages: true
      }
    });
    
    const stillUsingUnsplash = finalCheck.filter(artist => 
      artist.portfolioImages.some(img => img.includes('unsplash.com'))
    );
    
    if (stillUsingUnsplash.length > 0) {
      console.log(`\n⚠️  ${stillUsingUnsplash.length} artists still have Unsplash images:`);
      stillUsingUnsplash.forEach(artist => {
        console.log(`  - ${artist.name} (${artist.username})`);
      });
    } else {
      console.log('\n✅ All artists are now using Cloudinary images!');
    }
    
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

// Export for testing
export { migrateToCloudinaryProduction };

// Run migration only if this is the main module
if (require.main === module) {
  migrateToCloudinaryProduction().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}