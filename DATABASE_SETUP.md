# Database Setup Guide

This guide will help you complete the local PostgreSQL setup for the Goldie Grace website.

## Current Status
✅ All code and configuration files are ready
✅ Dependencies installed
✅ Tests written and configured
⏳ Local PostgreSQL installation needed

## Next Steps

### 1. Install PostgreSQL Locally

**macOS (using Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows:**
Download and install from https://www.postgresql.org/download/windows/

### 2. Create Local Databases

```bash
# Connect to PostgreSQL
psql -U postgres

# Create development and test databases
CREATE DATABASE goldie_grace_dev;
CREATE DATABASE goldie_grace_test;

# Exit PostgreSQL
\q
```

### 3. Run Database Migrations

```bash
# Generate Prisma client
npm run db:generate

# Push schema to development database
npm run db:push

# Seed the database with sample data
npm run db:seed
```

### 4. Test the Setup

```bash
# Run all tests
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

### 5. Set Up Production (Vercel Postgres)

1. Go to your Vercel dashboard
2. Navigate to your project
3. Go to Settings → Environment Variables
4. Add these variables:
   - `DATABASE_URL`: Your Vercel Postgres connection string
   - `NODE_ENV`: "production"

5. In Vercel CLI or dashboard, add Vercel Postgres:
```bash
vercel env add DATABASE_URL
```

### 6. Deploy Migrations to Production

```bash
# Deploy migrations to production
npm run db:migrate:deploy
```

## Environment Files

Your environment files are already configured:

- `.env.local` - Local development
- `.env.test` - Test environment  
- `.env.staging` - Staging environment (when needed)

## Database Schema Features

✅ **Authentication**: Username/password fields for Client and MakeupArtist
✅ **Quiz System**: Complete quiz functionality with image support
✅ **Appointments**: Full booking workflow
✅ **Reviews**: Client feedback system
✅ **Consultations**: Video consultation support
✅ **Cascading Deletes**: Proper data cleanup

## Test Coverage

✅ **Unit Tests**: Client, Quiz, Appointment models
✅ **Integration Tests**: Complete booking workflow
✅ **Password Security**: bcrypt hashing validation
✅ **Data Relationships**: Foreign key constraints

## Commands Reference

```bash
# Database commands
npm run db:generate     # Generate Prisma client
npm run db:push        # Push schema (development)
npm run db:migrate:dev # Create migration (development) 
npm run db:seed        # Seed database
npm run db:studio      # Open Prisma Studio GUI

# Testing commands
npm test              # Run all tests
npm run test:unit     # Unit tests only
npm run test:integration # Integration tests only
```

## Troubleshooting

**Connection Error**: If you get "Can't reach database server at localhost:5432"
- Make sure PostgreSQL is running: `brew services list | grep postgresql`
- Check your .env.local file has the correct DATABASE_URL

**Permission Error**: 
- Make sure you can connect: `psql -U postgres -d goldie_grace_dev`
- Check database exists: `\l` in psql

**Test Failures**:
- Ensure test database exists: `goldie_grace_test`
- Check NODE_ENV=test in your test environment