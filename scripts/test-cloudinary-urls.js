const { v2: cloudinary } = require('cloudinary');
require('dotenv').config({ path: '.env.local' });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test public ID from the database
const publicId = 'goldiegrace/portfolio/maria_glam/portfolio_maria_glam_1_1753566034361_qm50e4k';

console.log('Testing Cloudinary URL generation...\n');
console.log('Public ID:', publicId);

// Generate basic URL
const basicUrl = cloudinary.url(publicId, {
  secure: true,
});
console.log('\nBasic URL:', basicUrl);

// Generate optimized URL
const optimizedUrl = cloudinary.url(publicId, {
  secure: true,
  transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }]
});
console.log('\nOptimized URL:', optimizedUrl);

// Test if the URL works
const https = require('https');
https.get(basicUrl, (res) => {
  console.log('\nURL Test Result:');
  console.log('Status Code:', res.statusCode);
  console.log('Content Type:', res.headers['content-type']);
});