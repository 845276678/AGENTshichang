# ==========================================
# AI创意协作平台 - 生产级Docker配置
# FORCE REBUILD: 2025-09-23-16:55:00-CRITICAL-FIX
# ==========================================

# 基础镜像 - 使用Node.js 18 Alpine
FROM node:18-alpine AS base

# 缓存破坏 - 强制完全重新构建
RUN echo "Cache bust: 2025-09-23-16:55:00" > /tmp/cache_bust

# 安装系统依赖和时区数据
RUN apk add --no-cache \
    libc6-compat \
    tzdata \
    curl \
    openssl \
    && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone

WORKDIR /app

# 全局环境变量
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

# 创建应用用户
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# ==========================================
# 依赖安装阶段
# ==========================================
FROM base AS deps

# 复制依赖配置文件
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# 安装生产依赖
RUN npm ci --only=production --frozen-lockfile --legacy-peer-deps && \
    npm cache clean --force

# ==========================================
# 构建阶段
# ==========================================
FROM base AS builder

# 复制依赖配置文件 (先复制 Prisma schema)
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# 安装全部依赖（包括开发依赖）
RUN npm ci --frozen-lockfile --legacy-peer-deps

# 在复制其他代码之前生成 Prisma 客户端（关键修复）
# 这确保为容器环境生成正确的二进制文件
ENV PRISMA_CLI_QUERY_ENGINE_TYPE=binary
ENV PRISMA_CLIENT_ENGINE_TYPE=binary
RUN npx prisma generate

# 现在复制其余源代码
COPY . .

# 构建Next.js应用
RUN npm run build

# ==========================================
# 运行时阶段
# ==========================================
FROM base AS runner

# 创建应用目录
RUN mkdir -p /app/logs /app/uploads && \
    chown -R nextjs:nodejs /app

# 复制生产依赖
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# 复制构建产物
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 复制Prisma文件
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/src/generated ./src/generated

# 复制健康检查文件
COPY --from=builder --chown=nextjs:nodejs /app/healthcheck.js ./

# 设置权限
RUN chown -R nextjs:nodejs /app

# 切换到非root用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 环境变量
ENV PORT=3000 \
    HOSTNAME="0.0.0.0" \
    PRISMA_CLI_QUERY_ENGINE_TYPE=binary \
    PRISMA_CLIENT_ENGINE_TYPE=binary \
    PRISMA_QUERY_ENGINE_BINARY="" \
    PRISMA_QUERY_ENGINE_LIBRARY=""

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD node healthcheck.js || exit 1

# 启动命令
CMD ["node", "server.js"]