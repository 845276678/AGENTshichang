@echo off
REM ==================================================
REM AI创意协作平台 - Windows本地开发环境启动脚本
REM ==================================================

echo.
echo 🚀 AI创意协作平台 - 本地开发环境启动
echo ==================================================
echo.

REM 检查Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js 未安装，请先安装 Node.js ^>= 18.0.0
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js 已安装:
node --version

REM 检查npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm 未安装
    pause
    exit /b 1
)

echo ✅ npm 已安装:
npm --version

REM 检查package.json
if not exist package.json (
    echo ❌ package.json 不存在，请确保在项目根目录运行此脚本
    pause
    exit /b 1
)

echo.
echo 📦 安装项目依赖...
call npm install --legacy-peer-deps
if errorlevel 1 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)
echo ✅ 依赖安装完成

echo.
echo ⚙️ 配置环境变量...
if not exist .env.local (
    if exist .env.example (
        copy .env.example .env.local >nul
        echo ✅ 已复制 .env.example 到 .env.local
    ) else (
        echo 创建基础环境配置...
        (
            echo # 基础开发环境配置
            echo DATABASE_URL="postgresql://postgres:123456@localhost:5432/ai_marketplace?schema=public"
            echo JWT_SECRET="dev-secret-key-change-in-production"
            echo JWT_EXPIRES_IN="1h"
            echo JWT_REFRESH_EXPIRES_IN="7d"
            echo NEXTAUTH_URL="http://localhost:3000"
            echo NEXTAUTH_SECRET="dev-nextauth-secret"
            echo NODE_ENV="development"
        ) > .env.local
        echo ✅ 已创建基础 .env.local 配置
    )
) else (
    echo ✅ .env.local 已存在
)

echo.
echo 🗄️ 初始化数据库...
echo 请确保 PostgreSQL 已安装并运行，或使用 Docker:
echo docker run --name postgres-ai -e POSTGRES_PASSWORD=123456 -e POSTGRES_DB=ai_marketplace -p 5432:5432 -d postgres:14
echo.

REM 生成Prisma客户端
call npx prisma generate
if errorlevel 1 (
    echo ❌ Prisma 客户端生成失败
    pause
    exit /b 1
)

REM 推送数据库架构
call npx prisma db push
if errorlevel 1 (
    echo ❌ 数据库初始化失败，请检查数据库连接
    echo 确保 PostgreSQL 已启动并且连接配置正确
    pause
    exit /b 1
)

echo ✅ 数据库初始化完成

echo.
echo 🎉 环境配置完成！
echo.
echo 🚀 启动开发服务器...
echo 📱 应用地址: http://localhost:4000
echo 🗄️ 数据库管理: npx prisma studio
echo.
echo 按 Ctrl+C 停止服务器
echo.

REM 启动开发服务器
call npm run dev

pause