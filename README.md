# Instagram AI Automation SaaS Platform - Phase 1 Foundation

Enterprise-grade foundation scaffold for the Instagram AI Automation SaaS platform. Built as a monorepo containing a Next.js 15 frontend and a NestJS API backend.

## Monorepo Architecture

This project is configured as a `pnpm` workspace containing the following sub-packages:

```
├── apps/
│   ├── web/           # Next.js 15 (App Router) + React 19 + TypeScript + Tailwind
│   └── api/           # NestJS + Prisma ORM + PostgreSQL + Redis + JWT Security
├── docker-compose.yml # PostgreSQL & Redis local infrastructure services
├── package.json       # Workspace scripts and dev dependencies
└── pnpm-workspace.yaml# pnpm packages listing
```

### Directory Structures

#### Frontend (`apps/web/src`)
- `components/`: Atomic and layout UI components (e.g. sidebar navigation shell)
- `features/`: Module feature scopes (posts, calendar, analytics dashboard)
- `hooks/`: Reusable react hooks
- `lib/`: Configuration instances and API clients
- `services/`: Client-side HTTP services
- `types/`: Type declarations and interface boundaries
- `schemas/`: Zod forms validation schemas
- `store/`: Zustand state management store
- `utils/`: Common utility methods
- `constants/`: Global variables and copy tokens

#### Backend (`apps/api/src`)
- `modules/`: NestJS modules
- `services/`: Business logic services
- `repositories/`: Database abstraction layers
- `dto/`: Data Transfer Objects (class-validator decorated validation schemes)
- `entities/`: Class schemas corresponding to database definitions
- `middlewares/`: Sanitization and logging middlewares
- `validators/`: Custom validation decorators
- `guards/`: Security and authorization guards (Clerk Auth, roles validator)
- `common/`: Shared interceptors, decorators, and constants

---

## Local Development Setup

### Prerequisites

- **Node.js**: `v20` or higher
- **pnpm**: `v9` or higher
- **Docker & Docker Compose** (highly recommended for running database and cache locally)

### 1. Install Dependencies
Run from the root of the project:
```bash
pnpm install
```

### 2. Run Local Infrastructure
Start PostgreSQL and Redis services in the background using Docker Compose:
```bash
docker compose up -d
```

### 3. Environment Setup
Copy the example environment files to configure environment variables:

```bash
# Frontend Env Setup
cp apps/web/.env.example apps/web/.env.local

# Backend Env Setup
cp apps/api/.env.example apps/api/.env
```

*Note: For local development, `BYPASS_AUTH=true` is enabled in `apps/api/.env` by default to allow testing API routes without calling active Clerk JWKS services.*

### 4. Database Setup & Migrations
Synchronize your local PostgreSQL database with the Prisma schema and run migrations:
```bash
cd apps/api
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Running the Application
Launch both the frontend and backend servers concurrently:
```bash
# From root workspace
pnpm dev
```
- **Frontend** runs on: `http://localhost:3000`
- **Backend API** runs on: `http://localhost:4000`

---

## Verification & Self-Testing

Ensure your scaffold maintains compilation, formatting, and linting integrity by running:

```bash
# Build both frontend and backend
pnpm build

# Run linting across workspace
pnpm lint
```
