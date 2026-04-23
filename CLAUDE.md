# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server on port 9000 (Turbopack)
npm run build        # Production build (4096MB heap — required)
npm run typecheck    # TypeScript check without emitting
npm run lint         # ESLint
npm run test         # Jest
npm run test:watch   # Jest watch mode
npm run test:coverage

# Single test file
npx jest src/path/to/file.test.ts

# Database migrations (run with tsx, not ts-node)
npm run setup-db
npm run migrate:transformatie-3
npm run migrate:kickstart-21
```

## Architecture

### Database
Neon (serverless PostgreSQL) via `@vercel/postgres`. All queries use tagged template literals from `src/lib/db.ts`:

```ts
import { sql, executeQuery, executeQuerySingle } from '@/lib/db';
const user = await executeQuerySingle<User>(sql`SELECT * FROM users WHERE id = ${id}`);
```

Schema overview lives in `src/lib/db-schema.ts` (150+ tables). Key tables: `users`, `user_profiles`, `conversations`, `messages`, `program_enrollments`, `subscription_history`, `blog_posts`.

### Authentication
Custom JWT — **not** next-auth despite it being in package.json. Flow:
- Login → `src/app/api/auth/login/route.ts` → bcrypt verify → set HTTP-only JWT cookie
- JWT config (HS256, 7-day expiry): `src/lib/jwt-config.ts`
- Route protection helpers: `verifyAuth()`, `requireAuth()`, `requireAdmin()` in `src/lib/auth.ts`
- Email verification required before first login
- Middleware: `src/middleware.ts` protects `/dashboard`, `/admin`, `/api` routes

### Plan / Access Control
Four tiers in `src/lib/access-control.ts`:

| Tier | Price | Duration |
|------|-------|----------|
| free | €0 | Forever |
| kickstart | €97 / €47 beta | 21 days |
| transformatie | €297 / €147 beta | 90 days |
| vip | €997 / €497 beta | 6 months |

`TIER_HIERARCHY`: free(0) → kickstart(1) → transformatie(2) → vip(3). Use `hasFeatureAccess(user, feature)` to gate UI. Freemium credits: `src/lib/freemium-access.ts`.

Cursus access tiers: `gratis` → `starter` → `groeier` → `expert` → `vip`. Transformatie gets gratis + starter + groeier content.

### AI Integration
**All AI goes through OpenRouter** (`src/lib/openrouter.ts`), not directly to Anthropic. Default model: `anthropic/claude-3.5-haiku`. `src/lib/anthropic.ts` is a legacy placeholder — do not use it.

Two layers:
1. **Genkit flows** (`src/ai/flows/`) — server actions for coach chat, profile refinement, opener generation, photo analysis
2. **Direct OpenRouter** (`src/lib/ai-service.ts`) — blog generation, cached completions

Dev mode returns fallback mock responses when no API key is set. Production requires `OPENROUTER_API_KEY`.

AI coach logic (Dutch cultural context, attachment styles, coaching phases): `src/lib/ai-coach-service.ts`.

### Content
- **Kennisbank** (knowledge base): markdown files in `content/kennisbank/` organized by topic, served via `/kennisbank/[...slug]`. Dual purpose: SEO + user education.
- **Blog**: stored in `blog_posts` database table, AI-generated via admin panel.

### Dashboard Navigation Structure
The dashboard (`/dashboard`) is a single-page tab system. Current tabs: `home`, `pad` (Mijn Reis), `coach`, `profiel`, `cursussen`, `settings`.

Three parallel course systems exist:
- `/cursussen` — public gallery (pre-login)
- Dashboard `cursussen` tab — authenticated gallery with access gating
- Dashboard `pad` tab → `TransformatieDashboardView` — the 12-module Transformatie program (3 phases: DESIGN → ACTION → SURRENDER)

### Email
Resend (`src/lib/email-service.ts`) with React Email templates (`src/lib/email-templates.tsx`). Sendgrid key exists in config but Resend is primary.

### Payments
Stripe via `src/lib/stripe.ts`. Coupon codes: `src/lib/coupon-service.ts`. Webhook handling in `src/app/api/webhooks/stripe/`.

## Key Patterns

**API routes vs server actions**: Use API routes (`/api/`) for auth, payments, webhooks, and admin ops. Use Genkit flows (`src/ai/flows/`) for AI features — they run as server actions and have built-in safety.

**Component organization**: `src/components/` is organized by feature domain (auth, coach, courses, landing, layout, shared). Avoid cross-domain imports except through `src/components/shared/`.

**Security**: CSRF tokens required on mutation endpoints (`src/lib/csrf.ts`). Rate limiting on auth routes (`src/lib/rate-limit-edge.ts`). Never bypass security headers in `src/lib/security-headers.ts`.

**Environment**: `scripts/check-env.ts` validates required variables. Run `npm run check-env` when setting up a new environment. Required: `DATABASE_URL`, `JWT_SECRET` (min 32 chars), `OPENROUTER_API_KEY`, `RESEND_API_KEY`, `STRIPE_SECRET_KEY`.
