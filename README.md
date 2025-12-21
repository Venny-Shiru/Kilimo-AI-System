# Kilimo AI System

> **Land Restoration & Monitoring Platform** — An intelligent geospatial analytics and AI-driven recommendation engine for environmental monitoring and land restoration project planning.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://v0-agri-protect-ai-dashboard.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15.2.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=for-the-badge&logo=supabase)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Architecture](#architecture)
- [API Endpoints](#api-endpoints)
- [Authentication & Webhooks](#authentication--webhooks)
- [Deployment](#deployment)
- [Development](#development)
- [Contributing](#contributing)

---

## 🌍 Overview

**Kilimo AI System** is a comprehensive platform for monitoring land degradation and planning restoration efforts. It combines real-time environmental data with AI-powered recommendations to help organizations and stakeholders make informed decisions about land management and restoration strategies.

The platform integrates satellite imagery analysis, soil health metrics, geospatial mapping, and machine learning models to provide actionable insights for sustainable land restoration.

---

## ✨ Features

### Core Features
- **🗺️ Interactive Map Viewer** — Real-time geospatial visualization of monitored regions with degradation overlays
- **📊 Advanced Analytics Dashboard** — Comprehensive degradation trends, soil health metrics, and restoration impact analysis
- **🤖 AI Recommendations Engine** — Intelligent suggestions for restoration strategies based on environmental data
- **📈 Environmental Monitoring** — NDVI, soil health scores, erosion risk assessment, and degradation level tracking
- **🎯 Restoration Project Planner** — Create, track, and manage restoration initiatives with success metrics
- **🔔 Real-time Notifications** — Alert system for critical degradation events and project milestones
- **📥 Data Upload & Processing** — Bulk import environmental data with automated validation and storage

### Technical Features
- **🔐 Secure Authentication** — Email/password auth with profile management and role-based access
- **⚡ Server-side Session Management** — Supabase SSR integration with middleware-based auth refresh
- **🔌 Webhook Integration** — Automatic profile creation on user signup via Supabase auth webhooks
- **📊 Real-time Data Sync** — Live updates across dashboard components
- **🌙 Dark Mode Support** — Full light/dark theme support with user preference persistence
- **📱 Responsive Design** — Mobile-first approach with adaptive layouts

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.2.5 (App Router, Server Components)
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 4.1.9 + PostCSS
- **UI Components**: Radix UI + shadcn/ui
- **Charting**: Recharts 3.2.1
- **Maps**: Leaflet + React Leaflet
- **State Management**: React Hooks + Context API
- **Forms**: React Hook Form + Zod validation

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (JWT)
- **Storage**: Vercel Blob (file uploads)
- **API**: Next.js API Routes + Server Functions

### DevOps & Deployment
- **Hosting**: Vercel Edge Functions + Serverless
- **CI/CD**: Git-based automatic deployments
- **Package Manager**: pnpm 10.x
- **Runtime**: Node.js 22+

### AI & Analytics
- **AI SDK**: Vercel AI SDK (streaming responses)
- **LLM**: OpenAI GPT-4o-mini
- **Analytics**: Vercel Analytics

---

## 🚀 Getting Started

### Prerequisites
- Node.js 22+ and pnpm 10.x
- Supabase account with a project
- Vercel account (for deployment)

### Local Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/Venny-Shiru/Kilimo-AI-System.git
cd Kilimo-AI-System
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Configure environment variables** (see [Environment Configuration](#environment-configuration))
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase and Vercel credentials
```

4. **Run the development server**
```bash
pnpm dev
```
Visit `http://localhost:3000` and start hacking!

5. **Type-check your code**
```bash
npx tsc --noEmit
```

6. **Build for production**
```bash
pnpm build
pnpm start
```

---

## 🔑 Environment Configuration

Create a `.env.local` file in the project root with the following variables:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Optional: Webhook Signature Verification
SUPABASE_WEBHOOK_SECRET=your-webhook-secret-here

# (Optional) Demo account credentials (for local development)
# Use these to enable the "Use demo account" button on the login page.
NEXT_PUBLIC_DEMO_EMAIL=demo@example.com
NEXT_PUBLIC_DEMO_PASSWORD=demo-password
# (Optional) Enable secure demo route (recommended for development only)
# When enabled, the server-side demo route will use your SUPABASE_SERVICE_ROLE_KEY to create session cookies
NEXT_PUBLIC_ALLOW_DEMO=true

# Running tests
# Install dev dependencies: pnpm install -D vitest
# Run tests locally: pnpm test
# The tests include a focused test for the secure demo endpoint at `tests/api/auth/demo.test.ts`

# CI
# A GitHub Actions workflow is included to run the test suite on each push and pull request: `.github/workflows/ci-tests.yml`.
# It enables the demo route in CI via NEXT_PUBLIC_ALLOW_DEMO=true so the demo tests can run without additional secrets.

# Manual E2E checklist (run locally)
1. Create a `.env.local` in the project root and add your Supabase creds + demo flags:

   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   SUPABASE_WEBHOOK_SECRET=your-webhook-secret
   NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
   NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=your-google-client-secret
   NEXT_PUBLIC_DEMO_EMAIL=demo@example.com
   NEXT_PUBLIC_DEMO_PASSWORD=demo-password
   NEXT_PUBLIC_ALLOW_DEMO=true

2. Start the dev server:
   pnpm dev

3. Confirm server is up:
   curl -i http://localhost:3000/api/health
   # Expect 200 and body {"status":"ok"}

4. Demo sign-in (server-side):
   curl -i -X POST http://localhost:3000/api/auth/demo
   # If SUPABASE_SERVICE_ROLE_KEY is set and demo creds exist, this should return 200 and set session cookies.
   # If keys are missing you'll see a helpful error message and 500/403 status.

Playwright E2E tests:
- Run locally: `pnpm test:e2e` (this will start a server if none running)
- CI: `.github/workflows/e2e-tests.yml` will run the E2E suite on push/PR. Add repository secrets for `SUPABASE_SERVICE_ROLE_KEY`, `DEMO_EMAIL`, and `DEMO_PASSWORD` to allow the demo sign-in test to fully pass in CI.

Signup & confirmation E2E:
- A test-only endpoint exists at `/api/auth/confirm-user` which marks a user confirmed using the Supabase service role key (only enabled in development or when `NEXT_PUBLIC_ALLOW_DEMO=true`). The Playwright E2E will call this endpoint to confirm the test user and then verify sign-in works. If the endpoint is not available the test will skip the confirmation assertion and instead verify the app shows the expected confirmation-related UI and "send sign-in link" behavior.

5. Sign-up and confirmation flow:
   - Go to http://localhost:3000/auth/sign-up and create a new account.
   - Check your email for confirmation link (or use Supabase console to set user as confirmed).
   - If unconfirmed, try Login and use the "Send sign-in link" button when prompted.

6. Google OAuth:
   - Configure Google provider in Supabase Auth settings (use redirect URL from step 1).
   - Click "Continue with Google" on Sign-up or Login and complete OAuth flow.

If you'd like, I can add a small Playwright script to automate steps 3–4 and add it to CI as an optional E2E job.

# Google OAuth (Configure in Supabase and add provider in Auth Settings)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=your-google-client-secret


# Optional: Redirect URL after signup (defaults to /dashboard)
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
```

### Getting Supabase Credentials
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project → **Settings** → **API**
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

### Vercel Deployment Environment
Add the same variables to Vercel:
1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add each variable from `.env.local`

---

## 🏗️ Architecture

### High-Level System Design
```
┌─────────────────────────────────────────────────────────────┐
│                    Client (Browser)                         │
│  Next.js App Router + React Components + Tailwind CSS       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│               Edge Middleware (Auth)                        │
│  Session Refresh + Cookie Management (5s timeout)          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│            Next.js API Routes (Vercel Serverless)          │
│  • /api/webhooks/supabase-auth (Profile Creation)          │
│  • /api/upload (File Storage via Vercel Blob)              │
│  • /api/environmental-data, /api/ai/recommendations, etc.  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              Supabase (PostgreSQL + Auth)                   │
│  • Authentication (JWT)                                     │
│  • RLS Policies (Row-Level Security)                        │
│  • Real-time subscriptions (via pg_changes)                 │
│  • Webhooks (on user.created events)                        │
└─────────────────────────────────────────────────────────────┘
```

### Key Components
- **Middleware** (`middleware.ts`) — Validates sessions with 5-second timeout
- **Auth Pages** (`app/auth/*`) — Login, signup, and success flows with defensive error handling
- **Dashboard** (`app/dashboard/*`) — Protected routes for authenticated users
- **API Routes** (`app/api/*`) — Serverless backend functions
- **Webhooks** (`app/api/webhooks/supabase-auth/route.ts`) — Profile creation on signup

---

## 📡 API Endpoints

### Authentication
- `POST /auth/signInWithPassword` — Login (client-side via Supabase)
- `POST /auth/signUp` — Register (client-side via Supabase)
- `POST /auth/signOut` — Logout (client-side via Supabase)

### Webhooks
- `POST /api/webhooks/supabase-auth` — Supabase auth event listener (creates profiles on user.created)

### Environmental Data
- `GET /api/environmental-data` — Fetch monitored regions and degradation metrics
- `POST /api/process-upload` — Process uploaded environmental datasets

### Restoration Projects
- `GET /api/restoration-projects` — List restoration projects
- `POST /api/restoration-projects` — Create new project

### AI Recommendations
- `POST /api/ai/recommendations` — Generate AI-powered restoration suggestions

### File Management
- `POST /api/upload` — Upload files to Vercel Blob storage
- `GET /api/export` — Export analytics data (CSV/PDF)

---

## 🔐 Authentication & Webhooks

### Sign-Up Flow
1. User fills out form and submits (email, password, full name, organization)
2. `supabase.auth.signUp()` creates a user in Supabase Auth
3. Webhook (`/api/webhooks/supabase-auth`) is triggered on `user.created` event
4. Webhook upserts a `profiles` row with user metadata
5. User is redirected to `/auth/sign-up-success`

### Session Management
- **Client-side**: `createBrowserClient` from Supabase SSR (cookie-based)
- **Server-side**: `createServerClient` reads/writes cookies in middleware
- **Middleware**: Refreshes session with 5-second timeout to prevent blocking
- **Token Refresh**: Automatic if refresh token exists in cookies

### Webhook Configuration
To enable automatic profile creation:
1. Go to Supabase Dashboard → **Database** → **Webhooks**
2. Create a webhook:
   - **Event**: `user.created`
   - **HTTP Endpoint**: `https://your-vercel-url.vercel.app/api/webhooks/supabase-auth`
   - **Secret** (optional): Set `SUPABASE_WEBHOOK_SECRET` in Vercel env vars

---

## 🚀 Deployment

### Vercel (Current)
Your project is automatically deployed on every push to `main`:

1. **Live URL**: [v0-agri-protect-ai-dashboard.vercel.app](https://v0-agri-protect-ai-dashboard.vercel.app)
2. **Auto-deployments**: Enabled (Git-based)
3. **Environment Variables**: Configure in Vercel Dashboard
4. **Logs**: View in Vercel Dashboard → **Deployments** → **Runtime Logs**

### Manual Redeploy
```bash
git push origin main  # Automatically triggers Vercel rebuild
```

### Build Status
- ✅ Next.js Build: Optimized production bundle
- ✅ TypeScript: Type-checked before build
- ⚠️ Security: Check CVE-2025-66478 (Next.js 15.2.5+ patches)

---

## 💻 Development

### Project Structure
```
├── app/                          # Next.js App Router
│   ├── api/                      # API routes & webhooks
│   ├── auth/                     # Authentication pages
│   ├── dashboard/                # Protected dashboard pages
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # React components
│   ├── charts/                   # Chart components (Recharts)
│   ├── ui/                       # shadcn/ui components
│   └── ...                       # Dashboard components
├── lib/                          # Utilities & helpers
│   ├── ai/                       # AI SDK wrappers
│   ├── supabase/                 # Supabase clients
│   └── utils.ts                  # Helper functions
├── public/                       # Static assets
├── styles/                       # Global styles
├── middleware.ts                 # Next.js middleware
├── .env.local                    # Local env vars (git-ignored)
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
└── tailwind.config.mjs           # Tailwind CSS config
```

### Common Development Tasks

**Run tests** (if added):
```bash
pnpm test
```

**Format code**:
```bash
npx prettier --write .
```

**Lint code**:
```bash
pnpm lint
```

**Type-check**:
```bash
npx tsc --noEmit
```

---

## 🔧 Troubleshooting

### Issue: `ERR_NAME_NOT_RESOLVED` for Supabase
**Cause**: Supabase environment variables not set on Vercel  
**Solution**: Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel Environment Variables

### Issue: 504 Middleware Timeout
**Cause**: Session refresh taking too long  
**Solution**: Middleware now has 5-second timeout; skip API routes  

### Issue: Profile not created after signup
**Cause**: Webhook not configured or service role key missing  
**Solution**: Configure Supabase webhook + add `SUPABASE_SERVICE_ROLE_KEY` to env vars

---

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🤝 Support & Contact

For issues, questions, or suggestions:
- **GitHub Issues**: [Open an issue](https://github.com/Venny-Shiru/Kilimo-AI-System/issues)
- **Documentation**: See [TECHNICAL_ARCHITECTURE.md](docs/TECHNICAL_ARCHITECTURE.md)

---

**Built with ❤️ for sustainable land restoration**
