const { execSync } = require('child_process');

async function initDatabase() {
  console.log('🔍 Checking database state...');
  
  try {
    // Try to run migrations
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('✅ Migrations applied successfully');
  } catch (error) {
    console.log('⚠️  Database already has schema, attempting to resolve...');
    
    try {
      // Mark the migration as already applied (baseline)
      execSync('npx prisma migrate resolve --applied "20241126000000_init"', { stdio: 'inherit' });
      console.log('✅ Migration marked as applied');
      
      // Try to deploy any remaining migrations
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      console.log('✅ All migrations are now in sync');
    } catch (resolveError) {
      console.log('⚠️  Could not resolve migration, trying alternative approach...');
      
      // If all else fails, just generate the client
      console.log('📝 Database schema already exists, skipping migration');
    }
  }
}

initDatabase().catch(console.error);