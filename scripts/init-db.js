const { execSync } = require('child_process');

async function initDatabase() {
  console.log('🔍 Checking database state...');
  
  try {
    // Try to run migrations
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('✅ Migrations applied successfully');
  } catch (error) {
    console.log('⚠️  Database already has schema, attempting to resolve...');
    
    // Check if it's a P3005 error (non-empty database)
    if (error.toString().includes('P3005')) {
      try {
        // Mark the initial migration as already applied (baseline)
        execSync('npx prisma migrate resolve --applied "20241126000000_init"', { stdio: 'inherit' });
        console.log('✅ Initial migration marked as applied');
        
        // Try to deploy any remaining migrations (like add_missing_columns)
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
        console.log('✅ All migrations are now in sync');
      } catch (resolveError) {
        console.log('⚠️  Migration resolution failed, trying db push as fallback...');
        
        try {
          // Use db push as a last resort to sync schema
          execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
          console.log('✅ Database schema synced using db push');
          
          // Mark all migrations as applied to sync migration history
          try {
            execSync('npx prisma migrate resolve --applied "20241126000000_init"', { stdio: 'inherit' });
            execSync('npx prisma migrate resolve --applied "20241126000001_add_missing_columns"', { stdio: 'inherit' });
            console.log('✅ Migration history synced');
          } catch (e) {
            console.log('⚠️  Could not sync migration history, but schema is updated');
          }
        } catch (pushError) {
          console.error('❌ Failed to sync database schema:', pushError.message);
          throw pushError;
        }
      }
    } else {
      // For other errors, try db push directly
      console.log('⚠️  Unexpected error, attempting db push...');
      try {
        execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
        console.log('✅ Database schema synced using db push');
      } catch (pushError) {
        console.error('❌ Failed to sync database schema:', pushError.message);
        throw pushError;
      }
    }
  }
}

initDatabase().catch(console.error);