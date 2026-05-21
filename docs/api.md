# API Docs

All endpoints are REST-style Next.js Route Handlers under `app/api`. Responses are JSON.

## Auth

- `POST /api/register`: create a student account.
- `GET /api/users/me`: return the current authenticated user.
- `PATCH /api/users/me`: update profile fields or password.
- `/api/auth/[...nextauth]`: NextAuth handlers.

## Public Catalog

- `GET /api/home`: homepage aggregate data.
- `GET /api/exams`: exam categories with batch counts.
- `GET /api/batches?examSlug=<slug>`: batch list.
- `GET /api/batches/[id]`: batch detail.
- `GET /api/notes?examSlug=<slug>`: notes catalog.
- `GET /api/tests?examSlug=<slug>`: test series catalog.
- `GET /api/tests/[id]`: test detail and questions.
- `GET /api/live-classes`: live classes.
- `GET /api/books`: books catalog.
- `GET /api/blog`: blog posts.
- `GET /api/faculty`: faculty list.
- `POST /api/scholarship`: submit scholarship registration.

## Student APIs

Require authentication:

- `GET /api/enrollments`: current user's enrollments.
- `POST /api/enrollments`: enroll in a batch.
- `GET /api/progress`: current user's lecture progress.
- `POST /api/progress`: update lecture progress.
- `GET /api/doubts`: current user's doubts.
- `POST /api/doubts`: create a doubt.
- `GET /api/notifications`: current user's notifications.
- `PATCH /api/notifications`: mark notifications read.
- `GET /api/analytics`: learning analytics.
- `GET /api/orders`: current user's orders.
- `POST /api/orders`: checkout cart items.

## Educator APIs

Require `FACULTY` or `ADMIN`:

- `GET /api/educator/stats`: educator dashboard stats.
- `GET /api/educator/students`: enrolled students.
- `GET /api/educator/batches`: educator/admin batches.
- `POST /api/educator/batches`: create batch.
- `GET /api/educator/batches/[id]`: batch management detail.
- `PUT /api/educator/batches/[id]`: update batch.
- `DELETE /api/educator/batches/[id]`: delete batch.
- `GET /api/educator/batches/[id]/lectures`: batch lectures.
- `POST /api/educator/batches/[id]/lectures`: create lecture.

## Error Format

Errors use:

```json
{ "error": "Message" }
```

Common statuses:

- `400`: invalid input.
- `401`: unauthenticated.
- `403`: forbidden.
- `404`: not found.
- `409`: conflict.
- `500`: unexpected server error.
