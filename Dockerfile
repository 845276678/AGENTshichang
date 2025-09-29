# ==========================================
# AI创意协作平台 - 生产级Docker配置
# CRITICAL FIX: 修复standalone与自定义server.js冲突
# ==========================================

# 基础镜像 - 使用Node.js 18 Alpine
FROM node:18-alpine AS base

# 缓存破坏 - 强制完全重新构建 (修复Zeabur端口8080)
RUN echo "Cache bust: 2025-09-29-20:30-ZEABUR-PORT-8080" > /tmp/cache_bust

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

# 安装生产依赖 (包含dev dependencies for Prisma)
RUN npm ci --frozen-lockfile --legacy-peer-deps

# 生成 Prisma 客户端
ENV PRISMA_CLI_QUERY_ENGINE_TYPE=library
ENV PRISMA_CLIENT_ENGINE_TYPE=library
RUN npx prisma generate

# ==========================================
# 构建阶段
# ==========================================
FROM base AS builder

# 复制依赖配置文件
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# 安装全部依赖（包括开发依赖）
RUN npm ci --frozen-lockfile --legacy-peer-deps

# 生成 Prisma 客户端（关键修复）
ENV PRISMA_CLI_QUERY_ENGINE_TYPE=library
ENV PRISMA_CLIENT_ENGINE_TYPE=library
RUN npx prisma generate

# 复制源代码
COPY . .

# 构建Next.js应用 (不使用standalone模式)
RUN npm run build

# 确保Prisma客户端在生产环境中可用
RUN npx prisma generate

# ==========================================
# 运行时阶段 - 使用自定义server.js
# ==========================================
FROM base AS runner

# 创建应用目录
RUN mkdir -p /app/logs /app/uploads && \
    chown -R nextjs:nodejs /app

# 复制完整的node_modules (包含Prisma)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# 复制Next.js构建产物 (非standalone)
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 复制应用文件
COPY --from=builder --chown=nextjs:nodejs /app/src ./src
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/next.config.js ./next.config.js

# 复制配置文件
COPY --from=builder --chown=nextjs:nodejs /app/postcss.config.js ./postcss.config.js
COPY --from=builder --chown=nextjs:nodejs /app/tailwind.config.js ./tailwind.config.js

# 复制自定义服务器和健康检查
COPY --from=builder --chown=nextjs:nodejs /app/server.js ./server.js
COPY --from=builder --chown=nextjs:nodejs /app/healthcheck.js ./healthcheck.js

# 设置权限
RUN chown -R nextjs:nodejs /app

# 切换到非root用户
USER nextjs

# 暴露端口 - Zeabur使用8080
EXPOSE 8080

# 环境变量 - 适配Zeabur端口
ENV PORT=8080 \
    WEB_PORT=8080 \
    HOSTNAME="0.0.0.0" \
    PRISMA_CLI_QUERY_ENGINE_TYPE=library \
    PRISMA_CLIENT_ENGINE_TYPE=library

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD node healthcheck.js || exit 1

# 启动命令
CMD ["node", "server.js"]