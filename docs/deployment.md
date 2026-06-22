# Deployment

## Vercel + Supabase

### 1. GitHub

Push the repo to GitHub. Ensure these are committed:

- `public/pathguru-logo.png`
- `pnpm-lock.yaml` (use pnpm on Vercel)
- **Do not** commit `.env`

### 2. Vercel project settings

| Setting | Value |
| --- | --- |
| Framework | Next.js |
| Install Command | `pnpm install` |
| Build Command | `pnpm build` |
| Output Directory | `.next` (default) |

### 3. Supabase database

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Settings → Database**.
2. Copy two connection strings:
   - **Transaction pooler** (port `6543`) → `DATABASE_URL`
   - **Direct** (port `5432`) → `DIRECT_URL`
3. Add `?pgbouncer=true&connection_limit=1` to the pooled URL if not present.
4. Push schema and seed (run once from your machine or CI):

```bash
pnpm db:push
pnpm db:seed
```

Or use Supabase SQL editor after `prisma db push` generates tables.

### 4. Vercel environment variables

Set these for **Production** (and Preview if needed):

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Supabase **pooled** URI (port 6543) |
| `DIRECT_URL` | Supabase **direct** URI (port 5432) |
| `AUTH_SECRET` | Random 32+ char secret (`openssl rand -base64 32`) |
| `AUTH_URL` | Production URL, e.g. `https://your-app.vercel.app` |
| `RAZORPAY_KEY_ID` | Optional — Razorpay payments |
| `RAZORPAY_KEY_SECRET` | Optional — Razorpay payments |

### 5. Redeploy

After env vars are set, trigger a **Redeploy** in Vercel so the build picks them up.

## Local development

```bash
pnpm install
cp .env.example .env
# Fill DATABASE_URL + DIRECT_URL from Supabase
pnpm db:setup
pnpm dev
```

## Post-deploy smoke test

- Visit `/` — homepage loads with courses
- Visit `/exam-categories` — exam list visible
- Log in with a seeded account
- Open `/dashboard` and `/test-series`

## Troubleshooting

| Issue | Fix |
| --- | --- |
| `Can't reach database server` | Check `DATABASE_URL` uses pooler port 6543 with `pgbouncer=true` |
| `relation does not exist` | Run `pnpm db:push` and `pnpm db:seed` against Supabase |
| CSS build error | Ensure `globals.css` has no commas inside `@apply` shadow utilities |
| Auth redirect loops | Set `AUTH_URL` to exact production domain (no trailing slash) |
