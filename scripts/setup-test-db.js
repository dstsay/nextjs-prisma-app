#!/usr/bin/env node

const { execSync } = require('child_process');
const dotenv = require('dotenv');
const path = require('path');

// Load test environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL not found in .env.test');
  process.exit(1);
}

// Extract database name from URL
const dbName = DATABASE_URL.split('/').pop().split('?')[0];
const baseUrl = DATABASE_URL.substring(0, DATABASE_URL.lastIndexOf('/'));

console.log('🔧 Setting up test database...');

try {
  // Create database if it doesn't exist
  console.log(`📦 Creating database: ${dbName}`);
  execSync(`psql ${baseUrl}/postgres -c "CREATE DATABASE ${dbName};"`, { 
    stdio: 'pipe' 
  });
  console.log('✅ Database created successfully');
} catch (error) {
  if (error.message.includes('already exists')) {
    console.log('ℹ️  Database already exists');
  } else {
    console.error('❌ Error creating database:', error.message);
    // Don't exit, database might already exist
  }
}

try {
  // Run Prisma migrations
  console.log('🔄 Running Prisma migrations...');
  execSync('dotenv -e .env.test -- npx prisma migrate deploy', {
    stdio: 'inherit'
  });
  console.log('✅ Migrations completed successfully');
} catch (error) {
  console.error('❌ Error running migrations:', error.message);
  process.exit(1);
}

console.log('🎉 Test database setup complete!');