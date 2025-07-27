import { PrismaClient } from '@prisma/client';
import * as readline from 'readline/promises';

// This script migrates existing Cloudinary public IDs to use versioned URLs
// Run this AFTER setting up auto-upload mapping in Cloudinary

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function migrateToVersionedUrls() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Cloudinary Versioned URLs Migration\n');
    
    // Check if we're connected to production
    const dbUrl = process.env.DATABASE_URL || '';
    const isProduction = dbUrl.includes('vercel-storage.com') || 
                        dbUrl.includes('@ep-') || 
                        dbUrl.includes('db.prisma.io');
    
    if (isProduction) {
      console.log('⚠️  WARNING: You are connected to a PRODUCTION database!');
      console.log(`   Host: ${dbUrl.split('@')[1]?.split(':')[0] || 'unknown'}\n`);
      
      const confirm = await rl.question('Are you sure you want to continue? Type "yes" to proceed: ');
      if (confirm.toLowerCase() !== 'yes') {
        console.log('❌ Migration cancelled');
        return;
      }
    }
    
    // Get the default version from Cloudinary (you'll need to set this)
    // This should be the version number from your auto-upload mapping
    const DEFAULT_VERSION = await rl.question('\nEnter the Cloudinary version to use (e.g., "v1234567890"): ');
    
    if (!DEFAULT_VERSION || !DEFAULT_VERSION.startsWith('v')) {
      console.log('❌ Invalid version format. Must start with "v" followed by numbers.');
      return;
    }
    
    // Fetch all artists
    const artists = await prisma.makeupArtist.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        profileImage: true,
        portfolioImages: true
      }
    });
    
    console.log(`\n📊 Found ${artists.length} artists to migrate\n`);
    
    let updatedCount = 0;
    
    for (const artist of artists) {
      let needsUpdate = false;
      let newProfileImage = artist.profileImage;
      let newPortfolioImages = [...artist.portfolioImages];
      
      // Check if profileImage needs versioning
      if (artist.profileImage && 
          !artist.profileImage.startsWith('http') && 
          !artist.profileImage.match(/^v\d+\//)) {
        newProfileImage = `${DEFAULT_VERSION}/${artist.profileImage}`;
        needsUpdate = true;
      }
      
      // Check portfolio images
      for (let i = 0; i < artist.portfolioImages.length; i++) {
        const img = artist.portfolioImages[i];
        if (img && !img.startsWith('http') && !img.match(/^v\d+\//)) {
          newPortfolioImages[i] = `${DEFAULT_VERSION}/${img}`;
          needsUpdate = true;
        }
      }
      
      if (needsUpdate) {
        console.log(`\n👤 Updating ${artist.name} (@${artist.username})`);
        
        if (newProfileImage !== artist.profileImage) {
          console.log(`   Profile: ${artist.profileImage} → ${newProfileImage}`);
        }
        
        // Show portfolio changes
        artist.portfolioImages.forEach((oldImg, i) => {
          if (oldImg !== newPortfolioImages[i]) {
            console.log(`   Portfolio ${i + 1}: ${oldImg} → ${newPortfolioImages[i]}`);
          }
        });
        
        // Update in database
        await prisma.makeupArtist.update({
          where: { id: artist.id },
          data: {
            profileImage: newProfileImage,
            portfolioImages: newPortfolioImages
          }
        });
        
        updatedCount++;
      }
    }
    
    console.log(`\n✅ Migration complete!`);
    console.log(`   Updated ${updatedCount} artists`);
    console.log(`   Skipped ${artists.length - updatedCount} artists (already versioned or external URLs)\n`);
    
    console.log('📝 Next steps:');
    console.log('1. Deploy these changes to production');
    console.log('2. Test that images load correctly');
    console.log('3. When you replace images in Cloudinary, they will automatically get new versions');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

// Run the migration
migrateToVersionedUrls().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});