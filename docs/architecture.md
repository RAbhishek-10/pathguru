# TrueEducator Architecture

## Stack

- Frontend: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, shadcn/ui.
- Auth: NextAuth v5 credentials provider with JWT sessions.
- Database: Prisma ORM. SQLite is used locally; production should use a hosted PostgreSQL database by changing `DATABASE_URL`.
- API: REST-style Next.js Route Handlers under `app/api`.
- Tests: Vitest for unit tests.
- CI/CD: GitHub Actions runs install, Prisma generation, database push, lint, tests, and build.

## Folder Map

- `app/`: pages, layouts, protected dashboards, and API route handlers.
- `components/`: shared layout, content cards, and shadcn/ui primitives.
- `contexts/`: client providers for auth and cart state.
- `hooks/` and `lib/hooks/`: reusable client hooks.
- `lib/`: auth, database client, serializers, API utilities, JSON helpers, and shared types.
- `prisma/`: Prisma schema, local SQLite database, and seed script.
- `docs/`: architecture, API, deployment, and GitHub operations docs.
- `.github/`: CI workflow and GitHub templates.

## Auth Flow

1. A student registers through `POST /api/register`; public signup always creates a `STUDENT` account.
2. Login uses the NextAuth credentials provider in `lib/auth.ts`.
3. Passwords are hashed with bcrypt before storage.
4. Sessions use JWT strategy and expose `id`, `name`, `email`, `role`, and `avatar`.
5. `middleware.ts` protects dashboard/profile/settings/analytics/educator routes.
6. Educator routes require `FACULTY` or `ADMIN`; other users are redirected to `/dashboard`.

Faculty and admin accounts should be created through trusted admin/seed workflows, not public registration.

## Data Model

Core models in `prisma/schema.prisma`:

- `User`: account, role, status, wallet, referral code, and profile fields.
- `FacultyProfile`: faculty metadata tied to a user.
- `Batch`, `Lecture`, `BatchFaculty`: courses, lectures, and assigned faculty.
- `Enrollment`, `LectureProgress`: student access and progress tracking.
- `Note`, `TestSeries`, `Question`, `TestResultRecord`: learning and assessment content.
- `LiveClass`, `Book`, `BlogPost`, `Topper`, `Testimonial`: marketing/content catalog data.
- `Doubt`, `Notification`, `Order`, `OrderItem`, `Purchase`: product workflows.
- `ScholarshipRegistration`: scholarship form submissions.

JSON-like arrays are stored as strings in a few SQLite-compatible columns, with parsing handled by `lib/json.ts`.

## API Design

API routes return JSON and use helpers from `lib/api-utils.ts` for auth and consistent errors. Public catalog routes expose content for pages; authenticated routes use `requireAuth`; educator routes use `requireRole(["FACULTY", "ADMIN"])`.

See `docs/api.md` for endpoint details.

## Local Setup

```bash
pnpm install
copy .env.example .env
pnpm db:setup
pnpm dev
```

Demo users seeded by `pnpm db:setup` use password `password123`.
