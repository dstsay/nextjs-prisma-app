# Cloudinary Setup Instructions

## 1. Create a Cloudinary Account

1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Click "Sign up for free"
3. Fill in your details and create an account
4. Verify your email address

## 2. Get Your Credentials

1. Log in to your Cloudinary Dashboard
2. You'll see your credentials on the dashboard:
   - **Cloud Name**: This is your unique identifier
   - **API Key**: Your public API key
   - **API Secret**: Your private API secret (keep this secure!)

## 3. Update Environment Variables

1. Update `.env.local` with your Cloudinary credentials:
```env
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
```

2. Update `.env.production` with the same credentials

## 4. Create Upload Preset (Optional)

1. In your Cloudinary Dashboard, go to Settings > Upload
2. Click "Add upload preset"
3. Set the following:
   - **Preset name**: `goldiegrace-uploads`
   - **Signing Mode**: Unsigned (for client-side uploads)
   - **Folder**: `goldiegrace`
4. Save the preset

5. Add to your environment variables:
```env
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="goldiegrace-uploads"
```

## 5. Verify Setup

Run the migration script test to verify your setup:
```bash
npm run test:cloudinary
```

All tests should pass if your credentials are configured correctly.

## Free Tier Limits

Your free Cloudinary account includes:
- 10GB storage
- 20GB bandwidth/month
- 300,000 total images/videos
- 25 monthly credits (25,000 transformations)

This is more than enough for development and small production usage.