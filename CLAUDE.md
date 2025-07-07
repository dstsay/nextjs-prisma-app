# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application with TypeScript, Prisma ORM, and Tailwind CSS for building a responsive web and mobile application.

## Rules for Coding and Development

1. First think through the problem, read the codebase for relevant files, and write a plan to tasks/todo.md.
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Please every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. Finally, add a review section to the [todo.md](http://todo.md/) file with a summary of the changes you made and any other relevant information.


## Commands

### Development
```bash
npm install          # Install all dependencies
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Prisma Commands
```bash
npx prisma generate     # Generate Prisma Client
npx prisma db push      # Push schema changes to database (development)
npx prisma migrate dev  # Create and apply migrations (development)
npx prisma migrate deploy # Apply migrations (production)
npx prisma studio       # Open Prisma Studio GUI
```

## Architecture

### Technology Stack
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type safety throughout the application
- **Prisma**: Type-safe ORM for database operations
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **PostgreSQL**: Default database (configurable in schema.prisma)

### Project Structure
- `/app`: Next.js App Router pages and layouts
- `/components`: Reusable React components
- `/lib`: Utility functions and configurations
  - `prisma.ts`: Singleton Prisma client instance
- `/prisma`: Database schema and migrations
  - `schema.prisma`: Database models and configuration
- `/public`: Static assets

### Key Design Patterns

1. **Prisma Client Singleton**: The Prisma client is initialized as a singleton in `/lib/prisma.ts` to prevent multiple instances in development.

2. **App Router**: Using Next.js 15's App Router for:
   - Server Components by default
   - Nested layouts
   - Server Actions for form handling
   - Streaming and Suspense

3. **Responsive Design**: Tailwind CSS classes are used throughout for mobile-first responsive design:
   - Use `sm:`, `md:`, `lg:`, `xl:` prefixes for breakpoints
   - Default styles apply to mobile views

### Database Setup

1. Copy `.env.example` to `.env`
2. Update `DATABASE_URL` with your database connection string
3. Run `npx prisma generate` to generate the Prisma Client
4. Run `npx prisma db push` or `npx prisma migrate dev` to sync the schema

### Environment Variables

Required environment variables:
- `DATABASE_URL`: Database connection string (PostgreSQL, MySQL, SQLite, etc.)

## Development Workflow

1. Define or update models in `prisma/schema.prisma`
2. Run `npx prisma generate` to update the TypeScript types
3. Use `prisma` client from `@/lib/prisma` in your Server Components or API routes
4. For client-side data fetching, create Server Actions or API routes in `/app/api`