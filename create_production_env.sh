#!/bin/bash
# 完整的生产环境变量配置文件
# 使用: cp env_production_complete.sh .env.production

cat > .env.production << 'EOF'
# ===========================================
# AI创意竞价平台生产环境配置
# ===========================================

# Database
DATABASE_URL=file:./production.db

# NextAuth.js
NEXTAUTH_URL=http://139.155.232.19
NEXTAUTH_SECRET=aijiayuan-super-secret-production-key-2024-$(date +%s)

# AI Services - 已配置实际API密钥
DEEPSEEK_API_KEY=sk-9f53027a39124ed1b93c7829edf7127a
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat

ZHIPU_API_KEY=3226f1f5f8f140e0862a5f6bbd3c30d4.qjAzzID6BYmmU0ok

DASHSCOPE_API_KEY=sk-410c92dae50c4e3c964629fe6b91f4e2

# Application Settings
NODE_ENV=production
APP_URL=http://139.155.232.19

# JWT
JWT_SECRET=aijiayuan-jwt-secret-production-2024-$(date +%s)
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_MAX=1000
RATE_LIMIT_WINDOW_MS=900000

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=.pdf,.doc,.docx,.txt,.json

# OSS Storage (阿里云对象存储)
OSS_REGION=oss-cn-hangzhou
OSS_ACCESS_KEY_ID=your-oss-access-key-id
OSS_ACCESS_KEY_SECRET=your-oss-access-key-secret
OSS_BUCKET=ai-agent-marketplace

# Analytics (可选)
GOOGLE_ANALYTICS_ID=
POSTHOG_KEY=

# Monitoring (可选)
SENTRY_DSN=
EOF

echo "✅ 生产环境变量配置文件已生成: .env.production"