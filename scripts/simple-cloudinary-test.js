const { v2: cloudinary } = require('cloudinary');
require('dotenv').config({ path: '.env.local' });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function runSimpleTest() {
  console.log('🔍 Running Simple Cloudinary Test...\n');
  
  try {
    // Test 1: Check configuration
    const config = cloudinary.config();
    console.log('✅ Configuration loaded:');
    console.log(`   Cloud Name: ${config.cloud_name}`);
    console.log(`   API Key: ${config.api_key?.substring(0, 5)}...`);
    console.log(`   API Secret: ${config.api_secret ? '***' : 'Not set'}\n`);
    
    // Test 2: Simple upload test
    console.log('📤 Testing upload...');
    const testUrl = 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400';
    const uploadResult = await cloudinary.uploader.upload(testUrl, {
      folder: 'goldiegrace/test',
      public_id: `test_${Date.now()}`,
    });
    
    console.log('✅ Upload successful:');
    console.log(`   Public ID: ${uploadResult.public_id}`);
    console.log(`   URL: ${uploadResult.secure_url}`);
    console.log(`   Size: ${uploadResult.width}x${uploadResult.height}\n`);
    
    // Test 3: Delete the uploaded image
    console.log('🗑️  Testing deletion...');
    const deleteResult = await cloudinary.uploader.destroy(uploadResult.public_id);
    console.log(`✅ Delete successful: ${deleteResult.result === 'ok'}\n`);
    
    console.log('✨ All tests passed! Your Cloudinary setup is working correctly.');
    console.log('🚀 You can now run the migration script to move your images to Cloudinary.\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error(error.message || error);
    console.log('\nPlease check your Cloudinary credentials in .env.local');
    process.exit(1);
  }
}

runSimpleTest();