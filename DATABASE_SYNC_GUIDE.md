# Database Sync Guide for Staging and Production

This guide explains how to sync your database schema with staging and production environments.

## Current Database Schema

Your Prisma schema includes the following models:
- **Client**: User accounts for customers
- **MakeupArtist**: Professional makeup artist accounts
- **Quiz/Question/Answer**: Quiz system for client intake
- **Appointment/Consultation**: Booking and consultation management
- **Review**: Client reviews for artists
- **Availability**: Artist availability scheduling

## Prerequisites

1. Ensure you have access to your staging and production database URLs
2. Have the appropriate database credentials
3. Backup your databases before applying migrations

## Environment Setup

### 1. Create Environment Files

Create separate `.env` files for each environment:

```bash
# .env.staging
DATABASE_URL="postgresql://USER:PASSWORD@STAGING_HOST:PORT/DATABASE_NAME"
POSTGRES_URL_NON_POOLING="postgresql://USER:PASSWORD@STAGING_HOST:PORT/DATABASE_NAME"

# .env.production
DATABASE_URL="postgresql://USER:PASSWORD@PROD_HOST:PORT/DATABASE_NAME"
POSTGRES_URL_NON_POOLING="postgresql://USER:PASSWORD@PROD_HOST:PORT/DATABASE_NAME"
```

### 2. For Vercel Deployment

If using Vercel, set these environment variables in your Vercel project settings:
- `DATABASE_URL`: Your production database connection string
- `POSTGRES_URL_NON_POOLING`: Direct connection URL (for migrations)

## Syncing Database Schema

### Option 1: Using Prisma Migrate (Recommended for Production)

1. **Generate Migration Files Locally** (already done):
   ```bash
   npx prisma migrate dev --name init
   ```

2. **Apply to Staging**:
   ```bash
   # Load staging environment
   export $(cat .env.staging | xargs)
   
   # Apply migrations
   npx prisma migrate deploy
   ```

3. **Apply to Production**:
   ```bash
   # Load production environment
   export $(cat .env.production | xargs)
   
   # Apply migrations
   npx prisma migrate deploy
   ```

### Option 2: Using Prisma DB Push (Quick sync for staging)

For staging environments where you want to quickly sync:

```bash
# Load staging environment
export $(cat .env.staging | xargs)

# Push schema to staging
npx prisma db push
```

### Option 3: Manual SQL Migration

The migration SQL file is available at: `prisma/migrations/20240726_init/migration.sql`

You can apply this manually to your database using:
- pgAdmin
- psql command line
- Your database provider's web interface

```bash
# Example with psql
psql -h STAGING_HOST -U USERNAME -d DATABASE_NAME -f prisma/migrations/20240726_init/migration.sql
```

## Vercel-Specific Instructions

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Link your project**:
   ```bash
   vercel link
   ```

3. **Run migrations during deployment**:
   
   Update your `package.json`:
   ```json
   {
     "scripts": {
       "vercel-build": "prisma generate && prisma migrate deploy && next build"
     }
   }
   ```

4. **For preview deployments**, you might want to use:
   ```json
   {
     "scripts": {
       "vercel-build": "prisma generate && prisma db push && next build"
     }
   }
   ```

## Important Considerations

1. **Backup First**: Always backup your databases before applying migrations
   ```bash
   pg_dump -h HOST -U USER DATABASE_NAME > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Test on Staging**: Always test migrations on staging before production

3. **Connection Pooling**: Use `DATABASE_URL` for Prisma Client connections and `POSTGRES_URL_NON_POOLING` for migrations

4. **Rollback Plan**: Keep track of your migration history and have a rollback plan

## Troubleshooting

### Common Issues:

1. **"Database is already in sync"**: This means the schema is already applied
2. **Connection errors**: Check your DATABASE_URL and firewall settings
3. **Permission errors**: Ensure your database user has schema modification permissions

### Verify Schema Sync:

```bash
# Check if schema is in sync
npx prisma db pull
npx prisma validate
```

## Next Steps

1. Set up your environment variables for staging/production
2. Test the migration on staging first
3. Apply to production after verification
4. Update your CI/CD pipeline to run migrations automatically

## Migration Commands Reference

```bash
# Generate Prisma Client
npx prisma generate

# Create a new migration
npx prisma migrate dev --name <migration_name>

# Apply migrations (production)
npx prisma migrate deploy

# Push schema without migrations (development/staging)
npx prisma db push

# Pull current schema from database
npx prisma db pull

# Reset database (DANGER: drops all data)
npx prisma migrate reset
```