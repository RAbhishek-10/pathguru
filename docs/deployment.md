# Deployment

## Vercel

1. Import the GitHub repository into Vercel.
2. Set the framework preset to Next.js.
3. Use `pnpm install` for install and `pnpm build` for build.
4. Add environment variables for Production and Preview.

## Environment Variables

Required:

- `DATABASE_URL`: production database connection string. Use PostgreSQL for production.
- `AUTH_SECRET`: random secret at least 32 characters.
- `AUTH_URL`: canonical app URL, for example `https://your-domain.com`.

Local defaults are documented in `.env.example`.

## Database Changes

Local development:

```bash
pnpm db:push
pnpm db:seed
```

Production recommendation:

1. Use Prisma migrations for production schema changes.
2. Review generated SQL before applying it to production.
3. Back up production data before destructive changes.
4. Apply migrations before or during deployment.

This project currently ships with `prisma db push` scripts for development speed. Before a production launch, add migration files and use `prisma migrate deploy` in the release process.

## Preview Deploys

Every pull request should create a Vercel Preview Deployment. Use preview deployments to verify:

- Login/register flows.
- Student dashboard and enrollments.
- Educator batch management.
- Checkout/cart behavior.
- Scholarship registration.
- Mobile layout.

## Post-Deploy Checks

After each production deploy:

```bash
pnpm test
```

Then smoke test:

- Visit `/`.
- Log in with a seeded/test account in the target environment.
- Open `/dashboard`.
- Open `/educator` with a faculty/admin account.
- Submit a scholarship registration.
