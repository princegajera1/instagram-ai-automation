# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile
COPY apps/api ./apps/api
RUN npx prisma generate --schema=./apps/api/prisma/schema.prisma
RUN pnpm --filter @api/app build

# Stage 2: Production Run
FROM node:20-alpine
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
RUN pnpm install --prod --frozen-lockfile
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
RUN npx prisma generate --schema=./apps/api/prisma/schema.prisma

EXPOSE 4000
ENV NODE_ENV=production
CMD ["node", "apps/api/dist/main"]
