#!/usr/bin/env node

const { execSync } = require('child_process');

// Use the test database URL directly
const DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/nextjs_prisma_test_db';

console.log('🔄 Resetting test database...');

try {
  // Reset database schema with explicit DATABASE_URL
  execSync('npx prisma migrate reset --force --skip-seed --skip-generate', {
    stdio: 'inherit',
    env: { 
      ...process.env, 
      DATABASE_URL,
      // Override any existing env file loading
      DOTENV_CONFIG_PATH: '.env.test'
    }
  });
  
  // Generate Prisma client
  execSync('npx prisma generate', {
    stdio: 'inherit',
    env: { 
      ...process.env, 
      DATABASE_URL 
    }
  });
  
  console.log('✅ Test database reset successfully');
} catch (error) {
  console.error('❌ Error resetting database:', error.message);
  process.exit(1);
}