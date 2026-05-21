# Contributing

## Local Setup

```bash
pnpm install
copy .env.example .env
pnpm db:setup
pnpm dev
```

Use `pnpm db:push` after changing `prisma/schema.prisma`, and `pnpm db:generate` after schema changes that need updated Prisma Client types.

## Branch Naming

Use short, descriptive branches:

- `feature/<short-name>`
- `fix/<short-name>`
- `docs/<short-name>`
- `chore/<short-name>`

Examples: `feature/scholarship-api`, `fix/test-engine-hooks`, `docs/deployment-guide`.

## Before Opening A PR

Run:

```bash
pnpm lint
pnpm test
pnpm exec tsc --noEmit
pnpm build
```

## Pull Request Process

1. Keep PRs focused on one feature, fix, or docs change.
2. Fill out the PR template.
3. Include screenshots for UI changes.
4. Note any Prisma schema changes and whether migrations/db push are required.
5. Wait for CI to pass.
6. Request at least one review before merging to `main`.

## Code Guidelines

- Follow existing Next.js App Router and shadcn/ui patterns.
- Use Zod validation on route handlers that accept input.
- Use `requireAuth` or `requireRole` for protected API routes.
- Keep serializers in `lib/serializers.ts` as the boundary between Prisma models and API/UI types.
- Do not commit secrets or local `.env` values.
