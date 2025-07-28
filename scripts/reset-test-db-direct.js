#!/usr/bin/env node

const { execSync } = require('child_process');
const { Client } = require('pg');

const TEST_DB_URL = 'postgresql://postgres:postgres@localhost:5432/nextjs_prisma_test_db';

async function resetTestDatabase() {
  console.log('🔄 Resetting test database directly...');
  
  // Extract connection info
  const dbName = 'nextjs_prisma_test_db';
  const baseUrl = 'postgresql://postgres:postgres@localhost:5432';
  
  // Connect to postgres database to drop/create test database
  const client = new Client({
    connectionString: `${baseUrl}/postgres`
  });
  
  try {
    await client.connect();
    
    // Drop database if exists
    try {
      console.log(`🗑️  Dropping database: ${dbName}`);
      await client.query(`DROP DATABASE IF EXISTS ${dbName}`);
      console.log('✅ Database dropped');
    } catch (error) {
      console.log('⚠️  Could not drop database:', error.message);
    }
    
    // Create database
    console.log(`📦 Creating database: ${dbName}`);
    await client.query(`CREATE DATABASE ${dbName}`);
    console.log('✅ Database created');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
  
  // Run migrations
  console.log('🔄 Running migrations...');
  try {
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: TEST_DB_URL,
        POSTGRES_URL_NON_POOLING: TEST_DB_URL,
        SKIP_ENV_VALIDATION: 'true'
      }
    });
    console.log('✅ Migrations completed');
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  }
  
  console.log('🎉 Test database reset complete!');
}

resetTestDatabase();