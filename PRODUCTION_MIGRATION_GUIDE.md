# Production Cloudinary Migration Guide

This guide explains how to migrate your production database from Unsplash image URLs to Cloudinary public IDs.

## Prerequisites

1. **Cloudinary Account**: Ensure you have a Cloudinary account with your images already uploaded
2. **Environment Variables**: Set the following in your local `.env.local` file:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `DATABASE_URL` (pointing to your production Vercel Postgres database)

## Migration Scripts

### 1. Verification Script
Check the current migration status of your database:

```bash
npx tsx scripts/verify-cloudinary-migration.ts
```

This script will show:
- Total number of artists
- Migration status (fully migrated, partially migrated, not migrated)
- Detailed status for each artist
- Recommendations

### 2. Production Migration Script
Run the migration to update all artists to use Cloudinary images:

```bash
npx tsx scripts/migrate-to-cloudinary-production.ts
```

The script includes:
- Multiple safety confirmations for production databases
- Automatic backup creation before migration
- Progress tracking and error handling
- Detailed migration summary

## Step-by-Step Migration Process

### Step 1: Verify Current Status
First, check what needs to be migrated:

```bash
# Set your production DATABASE_URL
export DATABASE_URL="your-vercel-postgres-url"

# Run verification
npx tsx scripts/verify-cloudinary-migration.ts
```

### Step 2: Prepare for Migration
1. Ensure all Cloudinary environment variables are set
2. Verify you have the correct DATABASE_URL for production
3. Make sure you have a recent database backup

### Step 3: Run Migration
```bash
# Run the production migration script
npx tsx scripts/migrate-to-cloudinary-production.ts
```

The script will:
1. Confirm you want to migrate production (requires typing "yes")
2. Confirm the database host
3. Create a backup JSON file
4. Upload images to Cloudinary (if not already uploaded)
5. Update database records with Cloudinary public IDs
6. Provide a detailed summary

### Step 4: Verify Migration Success
After migration, verify everything worked:

```bash
npx tsx scripts/verify-cloudinary-migration.ts
```

Check your production website to ensure images are loading correctly.

## Important Notes

### Database URLs
- **Local Development**: Uses your local database
- **Production**: Must set DATABASE_URL to your Vercel Postgres URL

Example Vercel Postgres URL format:
```
postgres://default:password@ep-xxx-xxx-123456.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require
```

### Backups
The migration script automatically creates a backup file:
- Format: `cloudinary-migration-backup-production-[timestamp].json`
- Contains original image URLs for all artists
- Keep this file in case you need to rollback

### Rollback Process
If you need to rollback the migration:
1. Use the backup JSON file created during migration
2. Manually update the database using the original URLs
3. Or create a rollback script using the backup data

## Troubleshooting

### "Cloudinary credentials not found"
Ensure these environment variables are set:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### "No makeup artists found in database"
Check that:
- DATABASE_URL is pointing to the correct database
- The database has been seeded with artist data

### Images not showing after migration
1. Check that `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is set in Vercel
2. Verify the Cloudinary public IDs are correct
3. Check browser console for errors
4. Run the verification script to check migration status

### Migration appears successful but images still show old URLs
1. Clear your browser cache
2. Check if your app has caching (CDN, Redis, etc.)
3. Verify the database was actually updated
4. Try force-refreshing the page (Ctrl+F5)

## Quick Commands Reference

```bash
# Check migration status
npx tsx scripts/verify-cloudinary-migration.ts

# Run production migration
npx tsx scripts/migrate-to-cloudinary-production.ts

# For local testing (uses local database)
npx tsx scripts/migrate-to-cloudinary.ts
```

## Safety Features

The production migration script includes:
- ✅ Double confirmation for production databases
- ✅ Host verification to prevent accidents
- ✅ Automatic backup before changes
- ✅ Detection of already-migrated artists
- ✅ Detailed error tracking
- ✅ Migration summary and verification

## After Migration

1. **Monitor**: Check your application logs for any image loading errors
2. **Performance**: Cloudinary should improve image loading performance
3. **Costs**: Monitor your Cloudinary usage and bandwidth
4. **Cache**: Consider implementing cache headers for better performance