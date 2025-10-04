#!/bin/bash
# 设置构建信息脚本

# 获取git commit hash
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

# 获取git branch
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")

# 获取构建时间
BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# 获取版本号 (从package.json)
VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "0.1.0")

echo "=== 构建信息 ==="
echo "版本: $VERSION"
echo "Git Commit: $GIT_COMMIT"
echo "Git Branch: $GIT_BRANCH"
echo "构建时间: $BUILD_TIME"
echo ""

# 创建 .env.production 文件 (如果不存在)
if [ ! -f .env.production ]; then
  echo "创建 .env.production..."
  touch .env.production
fi

# 添加或更新环境变量
echo "NEXT_PUBLIC_APP_VERSION=$VERSION" >> .env.production.tmp
echo "NEXT_PUBLIC_GIT_COMMIT=$GIT_COMMIT" >> .env.production.tmp
echo "NEXT_PUBLIC_GIT_BRANCH=$GIT_BRANCH" >> .env.production.tmp
echo "NEXT_PUBLIC_BUILD_TIME=$BUILD_TIME" >> .env.production.tmp

# 替换文件
mv .env.production.tmp .env.production

echo "✅ 构建信息已设置到 .env.production"
