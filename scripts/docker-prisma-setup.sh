#!/bin/sh
# Docker Prisma Setup Script for Zeabur Deployment
# This script ensures proper Prisma client generation in Docker environment

set -e

echo "🚀 Starting Prisma setup for Docker deployment..."

# Clear any existing Prisma engine environment variables
unset PRISMA_QUERY_ENGINE_LIBRARY
unset PRISMA_QUERY_ENGINE_BINARY

# Set binary engine type explicitly
export PRISMA_CLI_QUERY_ENGINE_TYPE=binary
export PRISMA_CLIENT_ENGINE_TYPE=binary
export PRISMA_QUERY_ENGINE_BINARY=""
export PRISMA_QUERY_ENGINE_LIBRARY=""

# Clean up any existing Prisma artifacts
echo "🧹 Cleaning up existing Prisma artifacts..."
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma/client/runtime
rm -rf src/generated/prisma

# Generate Prisma client with binary engines
echo "🔄 Generating Prisma client with binary engines..."
npx prisma generate --schema=./prisma/schema.prisma

# Verify the generated client
if [ -d "src/generated/prisma" ]; then
  echo "✅ Prisma client generated successfully at src/generated/prisma"
  ls -la src/generated/prisma/
else
  echo "❌ Prisma client generation failed!"
  exit 1
fi

echo "🎉 Prisma setup completed successfully!"