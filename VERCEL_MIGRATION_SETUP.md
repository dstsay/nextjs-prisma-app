# Vercel Automatic Migration Setup

Your project is now configured to automatically run database migrations on every Vercel deployment.

## What Changed

1. **Added `vercel-build` script to package.json**:
   ```json
   "vercel-build": "prisma generate && prisma migrate deploy && next build"
   ```

   This script:
   - Generates Prisma Client
   - Applies pending migrations
   - Builds the Next.js application

## How It Works

When you push code to Git:
1. Vercel detects the push and starts a deployment
2. Vercel runs `npm install` (installs dependencies)
3. Vercel runs `vercel-build` script:
   - `prisma generate` - Creates Prisma Client
   - `prisma migrate deploy` - Applies any pending migrations
   - `next build` - Builds your Next.js app
4. If migrations fail, deployment stops (preventing broken deployments)

## Prerequisites

Make sure these environment variables are set in your Vercel project:
- `DATABASE_URL` - Your Vercel Postgres connection string
- `POSTGRES_URL_NON_POOLING` - Direct connection URL (if using connection pooling)

## Creating New Migrations

When you change your schema:

1. **Update schema.prisma**
2. **Create migration locally**:
   ```bash
   npx prisma migrate dev --name describe_your_change
   ```
3. **Test locally**
4. **Commit and push** - Vercel will apply automatically

## First Deployment

The first deployment with this setup will:
- Apply the initial migration (`20241126000000_init`)
- Create all tables in your Vercel Postgres database
- Set up the migration tracking table

## Monitoring Migrations

Check migration status in Vercel deployment logs:
1. Go to your Vercel dashboard
2. Click on a deployment
3. View "Build Logs"
4. Look for Prisma migration output

## Troubleshooting

If migrations fail:
- Check Vercel deployment logs for errors
- Verify DATABASE_URL is correctly set
- Ensure your database user has migration permissions
- Check if migrations were already applied

## Rollback

To rollback a migration:
1. Revert your schema changes
2. Create a new migration that undoes the changes
3. Deploy (automatic rollback via forward migration)