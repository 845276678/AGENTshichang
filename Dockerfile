# ==========================================
# AI创意协作平台 - 生产级Docker配置
# ==========================================

# 基础镜像 - 使用Node.js 18 Alpine
FROM node:18-alpine AS base

# 安装系统依赖和时区数据
RUN apk add --no-cache \
    libc6-compat \
    tzdata \
    curl \
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

# 复制依赖配置
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# 安装全部依赖（包括开发依赖）
RUN npm ci --frozen-lockfile --legacy-peer-deps

# 复制源代码
COPY . .

# 生成Prisma客户端（包含多平台二进制文件）
ENV PRISMA_CLI_QUERY_ENGINE_TYPE=binary
RUN unset PRISMA_QUERY_ENGINE_LIBRARY && npx prisma generate

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
    HOSTNAME="0.0.0.0"

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD node healthcheck.js || exit 1

# 启动命令
CMD ["node", "server.js"]