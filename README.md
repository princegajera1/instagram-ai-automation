# Instagram AI Automation SaaS Platform

A production-grade, enterprise-ready Instagram AI Automation SaaS platform. Built as a monorepo containing a Next.js 15 frontend and a NestJS API backend.

## Monorepo Architecture

This project is configured as a `pnpm` workspace containing the following sub-packages:

```
├── apps/
│   ├── web/           # Next.js 15 (App Router) + React 19 + TypeScript + Tailwind
│   └── api/           # NestJS + Prisma ORM + PostgreSQL + Redis + JWT Security
├── docker-compose.yml # PostgreSQL & Redis local infrastructure services
├── docker-compose.prod.yml # Production-ready multi-container configuration
├── package.json       # Workspace scripts and dev dependencies
├── pnpm-workspace.yaml# pnpm packages listing
└── pnpm-lock.yaml     # Lockfile
```

---

## Technical Features & Modules

1. **Instagram Graph API Integration**: Built-in OAuth flow (`/api/instagram/connect` + callback) with AES-256-GCM token encryption, scheduled background token refreshing, and direct media publishing (image/video/reels/carousels) with status polling.
2. **Media Upload pipeline**: Multi-part upload validator (types/sizes), local disk storage, and AWS S3 integration.
3. **AI Content Engine**: Powered by OpenAI SDK (`gpt-4o-mini`). Includes caption generation, caption rewriting, AI-estimated competition hashtag clusters, emoji suggests, call-to-actions, SEO optimization, and engagement scoring.
4. **Analytics Dashboard**: Follower metrics, reach/impressions trend graphs, top posts sorted by engagement rate, and top hashtags chart powered by `recharts`.
5. **Stripe Billing & Subscriptions**: 5-tier plan limit enforcement (Free, Starter, Pro, Business, Enterprise) with Stripe Checkout sessions, Billing Portal management, and webhook verification (`STRIPE_WEBHOOK_SECRET`).
6. **Notifications System**: In-app paginated logs and email notifications for critical failures using Nodemailer.
7. **Admin Panel**: Role-based guarded diagnostics panel for user search/activation, system health (DB/Redis/BullMQ depths), and OpenAI tokens/cost billing tracker.

---

## Local Development Setup

### Prerequisites
- **Node.js**: `v20` or higher
- **pnpm**: `v9` or higher
- **Docker Desktop**

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Start PostgreSQL & Redis
```bash
docker compose up -d
```

### 3. Environment Configurations
```bash
# Frontend
cp apps/web/.env.example apps/web/.env.local

# Backend
cp apps/api/.env.example apps/api/.env
```

### 4. Prisma Sync & Migrations
```bash
cd apps/api
npx prisma generate
npx prisma migrate dev
```

### 5. Start Servers
```bash
# From workspace root
pnpm dev
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:4000`

---

## Deployment Architectures

### Frontend: Vercel
1. Set up a new NextJS project on Vercel pointed to `apps/web`.
2. Configure Environment Variables:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_API_URL` (points to deployed Railway backend API)
3. Build Command: `pnpm --filter @web/app build`
4. Install Command: `pnpm install`

### Backend: Railway
1. Set up a Web Service on Railway pointed to `apps/api`.
2. Deploy using the NIXPACKS builder (reads `apps/api/railway.json`).
3. Set environment variables on Railway:
   - `DATABASE_URL` (points to Railway PG instance)
   - `REDIS_URL` (points to Railway Redis instance)
   - `CLERK_JWKS_URI`
   - `CLERK_ISSUER`
   - `BYPASS_AUTH`=false (production enforce clerk)
   - `TOKEN_ENCRYPTION_KEY` (64-character hex key)
   - `META_APP_ID` & `META_APP_SECRET` & `META_REDIRECT_URI`
   - `OPENAI_API_KEY`
   - `STRIPE_SECRET_KEY` & `STRIPE_WEBHOOK_SECRET`
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`

---

## Stripe Webhook Setup

To verify webhooks in development:
1. Install [Stripe CLI](https://stripe.com/docs/stripe-cli).
2. Login to your account: `stripe login`.
3. Forward webhook events to the local endpoint:
   ```bash
   stripe listen --forward-to localhost:4000/api/billing/webhook
   ```
4. Copy the webhook signing secret returned by Stripe (starts with `whsec_`) and set it as `STRIPE_WEBHOOK_SECRET` in `apps/api/.env`.

---

## Meta App Setup & Graph API Review

Going live with the Instagram Graph API requires a verified Meta Developer App:
1. **App Type**: Select "Business" or "Consumer" type app.
2. **Products**: Add "Facebook Login for Business" and "Instagram Graph API".
3. **OAuth Redirects**: Register your callback endpoint `https://<api-domain>/api/instagram/callback` under Facebook Login → Settings.
4. **App Review Permissions**: Request approval for these permissions to publish and track:
   - `instagram_basic`
   - `instagram_content_publish`
   - `instagram_manage_insights`
   - `pages_read_engagement`
   - `pages_show_list`
   - `business_management`
5. **Business Verification**: Confirm your company details under Business settings to remove request rate limits and allow global users to connect their accounts.
