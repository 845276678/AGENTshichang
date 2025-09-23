#!/bin/bash
# Zeabur Deployment Verification Script
# This script helps debug and verify Zeabur deployments

set -e

echo "🚀 Zeabur Deployment Verification Script"
echo "========================================"

# Check git status
echo "📋 Checking Git Status..."
git status --porcelain
if [ $? -eq 0 ]; then
  echo "✅ Git repository is clean"
else
  echo "⚠️  Uncommitted changes detected"
fi

# Check recent commits
echo "📜 Recent commits:"
git log --oneline -5

# Verify Prisma configuration
echo "🔍 Verifying Prisma Configuration..."
if [ -f "prisma/schema.prisma" ]; then
  echo "✅ Prisma schema found"
  grep -E "(engineType|binaryTargets)" prisma/schema.prisma || echo "⚠️  Engine configuration not found"
else
  echo "❌ Prisma schema not found"
fi

# Verify Docker configuration
echo "🐳 Verifying Docker Configuration..."
if [ -f "Dockerfile" ]; then
  echo "✅ Dockerfile found"
  grep -E "(PRISMA_.*ENGINE)" Dockerfile || echo "⚠️  Prisma engine environment variables not found"
else
  echo "❌ Dockerfile not found"
fi

# Verify .dockerignore
echo "🚫 Verifying .dockerignore..."
if [ -f ".dockerignore" ]; then
  echo "✅ .dockerignore found"
  grep "src/generated/prisma" .dockerignore && echo "✅ Prisma client excluded from Docker context"
else
  echo "❌ .dockerignore not found"
fi

# Check for build scripts
echo "📜 Verifying build scripts..."
if [ -f "scripts/docker-prisma-setup.sh" ]; then
  echo "✅ Docker Prisma setup script found"
else
  echo "❌ Docker Prisma setup script not found"
fi

echo "========================================"
echo "🎯 Next Steps for Zeabur Deployment:"
echo "1. Commit all changes: git add . && git commit -m 'Fix Prisma Docker deployment'"
echo "2. Push to GitHub: git push origin master"
echo "3. In Zeabur dashboard:"
echo "   - Go to your project settings"
echo "   - Click 'Redeploy' or 'Rebuild'"
echo "   - Clear build cache if available"
echo "   - Monitor build logs for Prisma generation"
echo "========================================"