@echo off
REM ==================================================
REM 修复本地开发环境 - 数据库连接问题
REM ==================================================

echo.
echo 🔧 诊断并修复本地开发环境问题
echo ==================================================
echo.

REM 检查当前问题
echo 🔍 检查当前状态...
curl -s http://localhost:4000/api/health/simple
echo.

echo.
echo 📊 问题分析:
echo - 应用服务器正常运行在 http://localhost:4000
echo - 数据库连接失败 (Can't reach database server at localhost:5432)
echo.

echo 💡 解决方案选择:
echo 1. 启动本地 PostgreSQL 服务
echo 2. 使用 Docker 启动 PostgreSQL 容器
echo 3. 修改配置使用 SQLite (最简单)
echo.

set /p choice="请选择解决方案 (1/2/3): "

if "%choice%"=="1" goto local_postgres
if "%choice%"=="2" goto docker_postgres
if "%choice%"=="3" goto sqlite_option
goto invalid_choice

:local_postgres
echo.
echo 🚀 启动本地 PostgreSQL 服务...
echo.
echo 请手动启动 PostgreSQL 服务:
echo Windows: 在服务管理器中启动 PostgreSQL 服务
echo 或运行: net start postgresql
echo.
echo 然后创建数据库:
echo psql -U postgres -c "CREATE DATABASE ai_agent_marketplace;"
echo.
goto test_connection

:docker_postgres
echo.
echo 🐳 使用 Docker 启动 PostgreSQL...

REM 检查 Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker 未安装或未启动
    echo 请先安装并启动 Docker Desktop
    echo 下载地址: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo ✅ Docker 可用

REM 停止并删除旧容器
docker stop postgres-ai >nul 2>&1
docker rm postgres-ai >nul 2>&1

echo 启动 PostgreSQL 容器...
docker run --name postgres-ai ^
  -e POSTGRES_PASSWORD=postgres ^
  -e POSTGRES_DB=ai_agent_marketplace ^
  -p 5432:5432 ^
  -d postgres:14

if errorlevel 1 (
    echo ❌ Docker 容器启动失败
    pause
    exit /b 1
)

echo ✅ PostgreSQL 容器已启动
echo 等待数据库初始化...
timeout /t 10 /nobreak >nul

goto test_connection

:sqlite_option
echo.
echo 🗄️ 切换到 SQLite 数据库 (推荐用于本地开发)...

REM 备份原配置
copy .env.local .env.local.backup >nul 2>&1

REM 更新数据库URL为SQLite
powershell -Command "(Get-Content .env.local) -replace '^DATABASE_URL=.*', 'DATABASE_URL=\"file:./dev.db\"' | Set-Content .env.local"

echo ✅ 已切换到 SQLite 数据库
echo 重新生成数据库...

call npx prisma generate
call npx prisma db push

if errorlevel 1 (
    echo ❌ 数据库初始化失败
    pause
    exit /b 1
)

echo ✅ SQLite 数据库初始化完成

goto test_connection

:test_connection
echo.
echo 🧪 测试数据库连接...
timeout /t 3 /nobreak >nul

curl -s http://localhost:4000/api/health/simple
echo.

echo.
echo ✨ 修复完成！请访问: http://localhost:4000
echo.
pause
exit /b 0

:invalid_choice
echo ❌ 无效选择
pause
exit /b 1