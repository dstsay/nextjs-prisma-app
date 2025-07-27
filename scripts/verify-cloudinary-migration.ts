import { PrismaClient } from '@prisma/client';

async function verifyCloudinaryMigration() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verifying Cloudinary Migration Status\n');
    
    // Check database connection
    const dbUrl = process.env.DATABASE_URL || '';
    const isVercelPostgres = dbUrl.includes('vercel-storage.com') || dbUrl.includes('@ep-');
    
    console.log('📊 Database Info:');
    console.log(`- Type: ${isVercelPostgres ? 'Vercel Postgres' : 'Other'}`);
    console.log(`- Host: ${dbUrl.split('@')[1]?.split(':')[0] || 'unknown'}\n`);
    
    // Get all artists
    const artists = await prisma.makeupArtist.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        portfolioImages: true,
        profileImage: true,
        createdAt: true
      },
      orderBy: {
        username: 'asc'
      }
    });
    
    if (artists.length === 0) {
      console.log('❌ No makeup artists found in database.');
      return;
    }
    
    console.log(`Found ${artists.length} makeup artists\n`);
    
    // Analyze migration status
    const migrationStats = {
      totalArtists: artists.length,
      fullyMigrated: 0,
      partiallyMigrated: 0,
      notMigrated: 0,
      withCloudinaryImages: 0,
      withUnsplashImages: 0,
      withMixedImages: 0,
      missingImages: 0
    };
    
    const detailedStatus: any[] = [];
    
    artists.forEach(artist => {
      const hasCloudinaryPortfolio = artist.portfolioImages.some(img => 
        img.includes('goldiegrace/') || img.includes('res.cloudinary.com')
      );
      const hasUnsplashPortfolio = artist.portfolioImages.some(img => 
        img.includes('unsplash.com')
      );
      const hasCloudinaryProfile = artist.profileImage && (
        artist.profileImage.includes('goldiegrace/') || 
        artist.profileImage.includes('res.cloudinary.com')
      );
      const hasUnsplashProfile = artist.profileImage && 
        artist.profileImage.includes('unsplash.com');
      
      const status = {
        username: artist.username,
        name: artist.name,
        portfolioCount: artist.portfolioImages.length,
        hasCloudinaryPortfolio,
        hasUnsplashPortfolio,
        hasCloudinaryProfile,
        hasUnsplashProfile,
        profileImage: artist.profileImage,
        samplePortfolioImage: artist.portfolioImages[0] || 'none'
      };
      
      detailedStatus.push(status);
      
      // Update stats
      if (hasCloudinaryPortfolio && hasCloudinaryProfile) {
        migrationStats.fullyMigrated++;
      } else if (hasCloudinaryPortfolio || hasCloudinaryProfile) {
        migrationStats.partiallyMigrated++;
      } else {
        migrationStats.notMigrated++;
      }
      
      if (hasCloudinaryPortfolio || hasCloudinaryProfile) {
        migrationStats.withCloudinaryImages++;
      }
      if (hasUnsplashPortfolio || hasUnsplashProfile) {
        migrationStats.withUnsplashImages++;
      }
      if ((hasCloudinaryPortfolio && hasUnsplashPortfolio) || 
          (hasCloudinaryProfile && hasUnsplashProfile)) {
        migrationStats.withMixedImages++;
      }
      if (artist.portfolioImages.length === 0) {
        migrationStats.missingImages++;
      }
    });
    
    // Display summary
    console.log('📈 Migration Summary:');
    console.log(`- Total Artists: ${migrationStats.totalArtists}`);
    console.log(`- Fully Migrated: ${migrationStats.fullyMigrated} (${Math.round(migrationStats.fullyMigrated / migrationStats.totalArtists * 100)}%)`);
    console.log(`- Partially Migrated: ${migrationStats.partiallyMigrated}`);
    console.log(`- Not Migrated: ${migrationStats.notMigrated}`);
    console.log(`- With Cloudinary Images: ${migrationStats.withCloudinaryImages}`);
    console.log(`- With Unsplash Images: ${migrationStats.withUnsplashImages}`);
    console.log(`- With Mixed Sources: ${migrationStats.withMixedImages}`);
    console.log(`- Missing Portfolio Images: ${migrationStats.missingImages}\n`);
    
    // Display detailed status
    console.log('📋 Detailed Artist Status:');
    console.log('━'.repeat(80));
    
    detailedStatus.forEach(status => {
      console.log(`\n👤 ${status.name} (@${status.username})`);
      console.log(`   Portfolio: ${status.portfolioCount} images`);
      
      if (status.hasCloudinaryPortfolio && status.hasCloudinaryProfile) {
        console.log(`   ✅ Fully migrated to Cloudinary`);
      } else if (status.hasUnsplashPortfolio || status.hasUnsplashProfile) {
        console.log(`   ⚠️  Still using Unsplash images`);
        if (status.hasUnsplashPortfolio) {
          console.log(`      - Portfolio: Unsplash`);
        }
        if (status.hasUnsplashProfile) {
          console.log(`      - Profile: Unsplash`);
        }
      }
      
      if (status.portfolioCount > 0) {
        console.log(`   Sample image: ${status.samplePortfolioImage.substring(0, 60)}...`);
      } else {
        console.log(`   ❌ No portfolio images`);
      }
    });
    
    console.log('\n' + '━'.repeat(80) + '\n');
    
    // Recommendations
    if (migrationStats.notMigrated > 0 || migrationStats.partiallyMigrated > 0) {
      console.log('💡 Recommendations:');
      if (migrationStats.notMigrated > 0) {
        console.log(`- ${migrationStats.notMigrated} artists need full migration`);
      }
      if (migrationStats.partiallyMigrated > 0) {
        console.log(`- ${migrationStats.partiallyMigrated} artists need to complete migration`);
      }
      console.log('\nRun the migration script to update these artists to Cloudinary.');
    } else if (migrationStats.fullyMigrated === migrationStats.totalArtists) {
      console.log('✅ All artists are fully migrated to Cloudinary!');
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
if (require.main === module) {
  verifyCloudinaryMigration().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { verifyCloudinaryMigration };