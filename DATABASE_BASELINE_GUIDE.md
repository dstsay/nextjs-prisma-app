# Database Baseline Guide

This guide explains how we handle existing Vercel Postgres databases that already have schema.

## The Problem

When connecting Prisma to an existing database (like Vercel Postgres), you might encounter:
```
Error: P3005
The database schema is not empty.
```

This happens because:
1. Your Vercel Postgres already has tables/schema
2. Prisma doesn't know about the migration history
3. Prisma wants to create tables that already exist

## The Solution

We've implemented an automatic resolution in `scripts/init-db.js` that:

1. **First attempts** to apply migrations normally
2. **If database has existing schema**, marks the initial migration as already applied
3. **Falls back gracefully** if the database is already in sync

## How It Works

The `vercel-build` script now runs:
```bash
prisma generate && node scripts/init-db.js && next build
```

The `init-db.js` script handles three scenarios:

### Scenario 1: Fresh Database
- Migrations apply normally
- All tables are created

### Scenario 2: Existing Schema, No Migration History
- Detects the P3005 error
- Marks the initial migration as "already applied"
- Syncs the migration history

### Scenario 3: Already Synced
- Recognizes database is already in sync
- Proceeds with the build

## Manual Baseline (if needed)

If you need to manually baseline your database:

1. **Pull current schema**:
   ```bash
   npx prisma db pull
   ```

2. **Mark migration as applied**:
   ```bash
   npx prisma migrate resolve --applied "20241126000000_init"
   ```

3. **Verify sync**:
   ```bash
   npx prisma migrate status
   ```

## Creating New Migrations

After baselining, create new migrations normally:
```bash
npx prisma migrate dev --name your_migration_name
```

These will apply on top of the baseline.

## Troubleshooting

If deployment still fails:

1. **Check Vercel logs** for specific errors
2. **Verify DATABASE_URL** is set correctly
3. **Try resetting migration history** (careful - backup first!):
   ```bash
   npx prisma migrate reset --skip-seed
   ```

## Best Practices

1. Always test migrations locally first
2. Keep migration files in version control
3. Don't modify existing migration files
4. Use descriptive migration names