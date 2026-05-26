# Database Configuration Guide

This project is configured with Prisma and supports multiple relational databases (PostgreSQL, MySQL, SQLite). By default, it uses SQLite for zero-setup local development.

To connect this application to your actual/production database (e.g., PostgreSQL):

## Step 1: Update Prisma Schema

Open `prisma/schema.prisma` and modify the `datasource` block:

```prisma
datasource db {
  provider = "postgresql" // Change from "sqlite" to "postgresql" (or "mysql")
  url      = env("DATABASE_URL")
}
```

## Step 2: Configure Environment Variables

Open `.env` (or create it from `.env.example`) and set your database connection string:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/true_educator?schema=public"
```

## Step 3: Push Schema & Seed Data

Run the setup command to push the schema to your database and seed it with demo accounts:

```bash
pnpm db:setup
```

*(This command runs `prisma db push` and seeds the database using `prisma/seed.ts`)*

## Step 4: Start the Application

```bash
pnpm dev
```
