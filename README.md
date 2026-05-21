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
--------------------------------------------------------------
# 🎓 PathGuru

> **Your Guided Path to Academic Success**

An intelligent EdTech platform connecting students with quality educators, scholarship tests, structured learning paths, and performance analytics.

---

## 🚀 Overview

PathGuru is a modern full-stack educational platform designed to deliver a seamless digital learning experience for students while empowering educators and administrators with powerful management tools.

The platform supports:

- Course enrollment
- Scholarship & entrance examinations
- Faculty-led learning
- Performance analytics
- Educator management
- Student engagement
- Secure authentication

---

# ✨ Features

## 👨‍🎓 Student Features

- Student registration & login
- Scholarship & entrance test registration
- Batch enrollment
- Course participation
- Live classes
- Notes & study material access
- Doubt resolution
- Result tracking
- Progress analytics
- Profile management
- Notifications

---

## 👨‍🏫 Educator Features

- Educator dashboard
- Create & manage batches
- Student management
- Upload learning materials
- Analytics dashboard
- Lecture scheduling

---

## 👨‍💼 Admin Features

- User management
- Faculty management
- Enrollment oversight
- Analytics dashboard
- Platform administration

---

# 🏗 Architecture

```text
Browser
   ↓
Next.js Frontend
   ↓
API Routes + Server Actions
   ↓
Auth.js Authentication
   ↓
Prisma ORM
   ↓
PostgreSQL
   ↓
Deployment Infrastructure
```

---

# 🛠 Tech Stack

## Frontend

- Next.js 16
- React
- TypeScript
- Tailwind CSS

## Backend

- Next.js API Routes
- Server Actions

## Database

- PostgreSQL
- Prisma ORM

## Authentication

- Auth.js (NextAuth)

## Deployment

- Vercel

## Testing

- Jest
- Playwright (planned)

---

# 📂 Project Structure

```text
PathGuru/
│
├── app/
├── components/
├── prisma/
├── public/
├── styles/
├── middleware.ts
├── package.json
├── next.config.ts
└── README.md
```

---

# 🔐 Environment Variables

Create:

```env
.env
```

Add:

```env
DATABASE_URL=

NEXTAUTH_SECRET=

NEXTAUTH_URL=

AUTH_SECRET=
```

Optional:

```env
STRIPE_SECRET_KEY=

STRIPE_WEBHOOK_SECRET=
```

---

# ⚙ Installation

Clone repository:

```bash
git clone https://github.com/YOUR_USERNAME/pathguru.git
```

Enter project:

```bash
cd pathguru
```

Install dependencies:

```bash
npm install
```

---

# 🗄 Database Setup

Generate Prisma Client:

```bash
npx prisma generate
```

Run migrations:

```bash
npx prisma migrate dev
```

Open database studio:

```bash
npx prisma studio
```

---

# ▶ Run Locally

Start development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 📦 Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

---

# ☁ Deployment

Recommended Stack:

- Vercel
- PostgreSQL
- Prisma
- Auth.js

Deployment Flow:

```text
GitHub
↓
Vercel
↓
Environment Variables
↓
Production
```

Build:

```bash
npm run build
```

---

# 🧪 Testing

Current:

- Manual testing

Planned:

- Unit tests
- Integration tests
- End-to-End tests

Run:

```bash
npm test
```

---

# 🛣 Roadmap

### Phase 1
- [x] Authentication
- [x] Dashboard
- [x] Course Management

### Phase 2
- [ ] Payment Integration
- [ ] Email Verification
- [ ] Notifications

### Phase 3
- [ ] Analytics
- [ ] Monitoring
- [ ] Full Test Coverage

---

# 🔒 Security

- Protected API routes
- Environment configuration
- Role-based access control
- Secure authentication

---

# 🤝 Contributing

Contributions are welcome.

Steps:

```text
Fork
↓
Create Branch
↓
Commit
↓
Pull Request
```

---

# 📜 License

MIT License

---

# ❤️ Author

Built with Next.js, Prisma, and PostgreSQL.

**PathGuru — Your Guided Path to Academic Success**