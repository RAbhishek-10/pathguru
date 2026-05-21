# TrueEducator

India's exam prep platform for NEET, JEE, GATE, UPSC, and more.

## Quick Start

```bash
pnpm install
copy .env.example .env
pnpm db:setup
pnpm dev
```

Open `http://localhost:3000`.

## Demo Accounts

All seeded demo accounts use password `password123`.

| Role | Email |
| --- | --- |
| Student | `rahul@example.com` |
| Faculty | `rajesh@trueeducator.in` |
| Admin | `admin@trueeducator.in` |

Faculty and admin users are redirected to `/educator` after login.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Generate Prisma Client and build the app |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run Vitest tests |
| `pnpm db:generate` | Generate Prisma Client |
| `pnpm db:push` | Push schema changes to the configured database |
| `pnpm db:seed` | Seed demo data |
| `pnpm db:setup` | Push schema and seed demo data |

## Documentation

- [Architecture](docs/architecture.md)
- [API Docs](docs/api.md)
- [Deployment](docs/deployment.md)
- [GitHub Setup](docs/github.md)
- [Contributing](CONTRIBUTING.md)

## Verification

Run the full local gate before opening a pull request:

```bash
pnpm lint
pnpm test
pnpm exec tsc --noEmit
pnpm build
```
