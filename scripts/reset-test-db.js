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

console.log('🔄 Resetting test database...');

try {
  // Reset database schema
  execSync('dotenv -e .env.test -- npx prisma migrate reset --force --skip-seed', {
    stdio: 'inherit'
  });
  console.log('✅ Test database reset successfully');
} catch (error) {
  console.error('❌ Error resetting database:', error.message);
  process.exit(1);
}