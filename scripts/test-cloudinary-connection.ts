import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testCloudinaryConnection() {
  console.log('🔍 Testing Cloudinary connection...\n');
  
  try {
    // Test 1: Check configuration
    const config = cloudinary.config();
    console.log('✅ Configuration loaded:');
    console.log(`   Cloud Name: ${config.cloud_name}`);
    console.log(`   API Key: ${config.api_key?.substring(0, 5)}...`);
    console.log(`   API Secret: ${config.api_secret ? '***' : 'Not set'}\n`);
    
    // Test 2: Try to get account usage (simple API call)
    console.log('📊 Fetching account usage...');
    const usage = await cloudinary.api.usage();
    console.log('✅ Account usage retrieved successfully:');
    console.log(`   Plan: ${usage.plan}`);
    console.log(`   Credits used: ${usage.credits.used_percent}%`);
    console.log(`   Storage: ${(usage.storage.usage / 1024 / 1024).toFixed(2)} MB / ${(usage.storage.limit / 1024 / 1024 / 1024).toFixed(2)} GB`);
    console.log(`   Bandwidth: ${(usage.bandwidth.usage / 1024 / 1024).toFixed(2)} MB / ${(usage.bandwidth.limit / 1024 / 1024 / 1024).toFixed(2)} GB\n`);
    
    // Test 3: Check if our folders exist
    console.log('📁 Checking folders...');
    try {
      const folders = await cloudinary.api.sub_folders('goldiegrace');
      console.log('✅ Goldiegrace folder exists with subfolders:', folders.folders.map((f: any) => f.name).join(', ') || 'none');
    } catch (error) {
      console.log('ℹ️  Goldiegrace folder does not exist yet (will be created on first upload)');
    }
    
    console.log('\n✨ Cloudinary connection test completed successfully!');
    console.log('🚀 You can now run the migration script.\n');
    
  } catch (error) {
    console.error('\n❌ Cloudinary connection test failed:');
    console.error(error);
    console.log('\nPlease check your credentials in .env.local');
    process.exit(1);
  }
}

// Run the test
testCloudinaryConnection();