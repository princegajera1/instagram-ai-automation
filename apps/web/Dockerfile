# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile
COPY apps/web ./apps/web
# Next build requires env vars statically or placeholder mapping
ENV NEXT_PUBLIC_API_URL=http://localhost:4000
RUN pnpm --filter @web/app build

# Stage 2: Production Run
FROM node:20-alpine
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
RUN pnpm install --prod --frozen-lockfile
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/next.config.ts ./apps/web/

EXPOSE 3000
ENV NODE_ENV=production
CMD ["pnpm", "--filter", "@web/app", "start"]
