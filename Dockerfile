# ==========================================
# Base image (Node.js 18 on Alpine)
FROM node:18-alpine AS base

# Cache bust to force a fresh build
RUN echo "Cache bust: 2025-10-07-npm-mirror" > /tmp/cache_bust

# Install system dependencies and timezone data
RUN apk add --no-cache \
    libc6-compat \
    tzdata \
    curl \
    openssl \
    && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone

WORKDIR /app

# Global environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create application user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# ==========================================
# Dependency installation stage
FROM base AS deps

# Copy dependency manifests
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Configure npm for faster and more reliable downloads
RUN npm config set registry https://registry.npmmirror.com && \
    npm config set disturl https://npmmirror.com/dist && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set network-timeout 300000

# Install production dependencies (includes Prisma dev requirements)
RUN npm ci --frozen-lockfile --legacy-peer-deps

# ==========================================
FROM base AS builder
WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Configure npm for faster and more reliable downloads
RUN npm config set registry https://registry.npmmirror.com && \
    npm config set disturl https://npmmirror.com/dist && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set network-timeout 300000

# Install all dependencies (including dev)
RUN npm ci --frozen-lockfile --legacy-peer-deps

# 复制应用文件
COPY . .

# Generate Prisma client (critical fix)
RUN npx prisma generate

# Provide dummy DATABASE_URL for build process only
# This allows Next.js to complete static generation without actual DB connection
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy?schema=public"

# Build Next.js application (custom server, no standalone)
RUN npm run build

# Clear dummy DATABASE_URL (will be provided by runtime environment)
ENV DATABASE_URL=""
# ==========================================
# Runtime stage (serving via custom server.js)
FROM base AS runner
# Create application directory
RUN mkdir -p /app/logs /app/uploads
WORKDIR /app
# Prepare Prisma engines for runtime
ENV PRISMA_CLI_QUERY_ENGINE_TYPE=library
ENV PRISMA_CLIENT_ENGINE_TYPE=library

# Copy complete node_modules (including Prisma)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
# Copy Next.js build output (non-standalone)
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy custom server and health checks
COPY --from=builder --chown=nextjs:nodejs /app/server.js ./server.js
COPY --from=builder --chown=nextjs:nodejs /app/healthcheck.js ./healthcheck.js
COPY --from=builder --chown=nextjs:nodejs /app/src ./src
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/next.config.js ./next.config.js

# Generate Prisma client for runtime
RUN npx prisma generate
# 设置权限
RUN chown -R nextjs:nodejs /app
# 切换到非 root 用户
USER nextjs
# 暴露端口
EXPOSE 8080
# 环境变量
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
