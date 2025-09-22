#!/bin/bash
# ==================================================
# 修复本地开发环境 - 数据库连接问题
# ==================================================

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 诊断并修复本地开发环境问题${NC}"
echo "=================================================="
echo

# 检查当前状态
echo -e "${BLUE}🔍 检查当前状态...${NC}"
health_status=$(curl -s http://localhost:4000/api/health/simple 2>/dev/null || echo "应用未运行")
echo "$health_status"
echo

echo -e "${YELLOW}📊 问题分析:${NC}"
echo "- 应用服务器正常运行在 http://localhost:4000"
echo "- 数据库连接失败 (Can't reach database server at localhost:5432)"
echo

echo -e "${GREEN}💡 解决方案选择:${NC}"
echo "1. 启动本地 PostgreSQL 服务"
echo "2. 使用 Docker 启动 PostgreSQL 容器"
echo "3. 修改配置使用 SQLite (最简单)"
echo

read -p "请选择解决方案 (1/2/3): " choice

case $choice in
    1)
        echo
        echo -e "${BLUE}🚀 启动本地 PostgreSQL 服务...${NC}"

        # 尝试启动PostgreSQL
        if command -v brew &> /dev/null; then
            # macOS with Homebrew
            brew services start postgresql@14 || brew services start postgresql
        elif command -v systemctl &> /dev/null; then
            # Linux with systemd
            sudo systemctl start postgresql
        else
            echo -e "${YELLOW}请手动启动 PostgreSQL 服务${NC}"
        fi

        # 创建数据库
        if command -v createdb &> /dev/null; then
            createdb ai_agent_marketplace 2>/dev/null || echo "数据库已存在"
        else
            echo "请手动创建数据库: createdb ai_agent_marketplace"
        fi
        ;;

    2)
        echo
        echo -e "${BLUE}🐳 使用 Docker 启动 PostgreSQL...${NC}"

        # 检查Docker
        if ! command -v docker &> /dev/null; then
            echo -e "${RED}❌ Docker 未安装${NC}"
            echo "请先安装 Docker: https://www.docker.com/get-started"
            exit 1
        fi

        echo -e "${GREEN}✅ Docker 可用${NC}"

        # 停止并删除旧容器
        docker stop postgres-ai 2>/dev/null || true
        docker rm postgres-ai 2>/dev/null || true

        echo "启动 PostgreSQL 容器..."
        docker run --name postgres-ai \
            -e POSTGRES_PASSWORD=postgres \
            -e POSTGRES_DB=ai_agent_marketplace \
            -p 5432:5432 \
            -d postgres:14

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ PostgreSQL 容器已启动${NC}"
            echo "等待数据库初始化..."
            sleep 10
        else
            echo -e "${RED}❌ Docker 容器启动失败${NC}"
            exit 1
        fi
        ;;

    3)
        echo
        echo -e "${BLUE}🗄️ 切换到 SQLite 数据库 (推荐用于本地开发)...${NC}"

        # 备份原配置
        cp .env.local .env.local.backup 2>/dev/null || true

        # 更新数据库URL为SQLite
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' 's|^DATABASE_URL=.*|DATABASE_URL="file:./dev.db"|' .env.local
        else
            # Linux
            sed -i 's|^DATABASE_URL=.*|DATABASE_URL="file:./dev.db"|' .env.local
        fi

        echo -e "${GREEN}✅ 已切换到 SQLite 数据库${NC}"
        echo "重新生成数据库..."

        npx prisma generate
        npx prisma db push

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ SQLite 数据库初始化完成${NC}"
        else
            echo -e "${RED}❌ 数据库初始化失败${NC}"
            exit 1
        fi
        ;;

    *)
        echo -e "${RED}❌ 无效选择${NC}"
        exit 1
        ;;
esac

# 测试连接
echo
echo -e "${BLUE}🧪 测试数据库连接...${NC}"
sleep 3

health_result=$(curl -s http://localhost:4000/api/health/simple)
echo "$health_result"

if echo "$health_result" | grep -q '"status":"ok"'; then
    echo
    echo -e "${GREEN}✨ 修复完成！数据库连接正常${NC}"
    echo -e "${GREEN}🌐 请访问: http://localhost:4000${NC}"
else
    echo
    echo -e "${RED}❌ 修复失败，请检查错误信息${NC}"
fi

echo