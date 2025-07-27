# Cloudinary Auto-Upload Mapping Guide

This guide explains how to set up and use Cloudinary's auto-upload mapping with versioning for automatic image updates.

## Setup Instructions

### 1. Configure Auto-Upload Mapping in Cloudinary

1. Log in to your [Cloudinary Dashboard](https://cloudinary.com/console)
2. Navigate to **Settings** → **Upload**
3. Scroll to **Auto upload mapping**
4. Click **Add mapping**
5. Configure as follows:
   - **Folder**: `goldiegrace`
   - **URL prefix**: Leave empty (uses default)
   - ✅ **Enable "Include version in URL"**
   - Click **Save**

### 2. Get the Version Number

After creating the mapping, Cloudinary will show you the version (e.g., `v1234567890`). Note this down.

### 3. Run the Migration Script

Update your existing images to use versioned URLs:

```bash
# For local testing (uses local database)
npm run migrate:versioned

# For production (set DATABASE_URL first)
DATABASE_URL="your-production-url" npm run migrate:versioned
```

Enter the version number when prompted (e.g., `v1234567890`).

## How It Works

### Before (Without Versioning)
```
goldiegrace/portfolio/diane_luxe/image1.jpg
```

### After (With Versioning)
```
v1234567890/goldiegrace/portfolio/diane_luxe/image1.jpg
```

## Updating Images

### Old Workflow ❌
1. Replace image in Cloudinary
2. Image URL stays the same
3. Old image cached, changes don't show
4. Manual database update required

### New Workflow ✅
1. Replace image in Cloudinary using the "Replace" button
2. Cloudinary automatically creates new version (e.g., `v1234567891`)
3. New image loads immediately
4. No database update needed!

## Benefits

1. **Automatic Updates**: Replace image → See changes immediately
2. **Perfect Caching**: Each version cached separately
3. **Version History**: Access previous versions if needed
4. **No Manual Work**: Database always points to latest version

## Important Notes

- **One-time Setup**: Run migration script once after setting up mapping
- **Folder Structure**: Keep images in the mapped folder (`goldiegrace/`)
- **Replace vs Upload**: Use "Replace" to update existing images
- **New Images**: Upload to the mapped folder for automatic versioning

## Troubleshooting

### Images not updating after replace?
1. Check that auto-upload mapping is enabled
2. Verify "Include version in URL" is checked
3. Make sure you're using "Replace" not "Upload new"

### Version not showing in URL?
1. Image must be in the mapped folder
2. Check Cloudinary dashboard for correct version
3. Run migration script if needed

## Example Workflow

1. **Artist wants new portfolio image**
2. **Go to Cloudinary** → Navigate to `goldiegrace/portfolio/diane_luxe/`
3. **Click "Replace"** on the image to update
4. **Select new image** and upload
5. **Done!** New image appears on website immediately

No database updates, no code changes, no deployments needed!