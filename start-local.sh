#!/bin/bash
# ==================================================
# AI创意协作平台 - 本地开发环境快速启动脚本
# ==================================================

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 检查系统要求
check_requirements() {
    log_step "检查系统环境..."

    # 检查Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装，请先安装 Node.js >= 18.0.0"
        echo "下载地址: https://nodejs.org/"
        exit 1
    fi

    node_version=$(node -v | sed 's/v//' | cut -d. -f1)
    if [ "$node_version" -lt 18 ]; then
        log_error "Node.js 版本过低 (当前: $(node -v))，需要 >= 18.0.0"
        exit 1
    fi

    log_info "✅ Node.js $(node -v) 检查通过"

    # 检查npm
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安装"
        exit 1
    fi

    log_info "✅ npm $(npm -v) 检查通过"

    # 检查PostgreSQL
    if ! command -v psql &> /dev/null; then
        log_warn "PostgreSQL 未安装，将提供 Docker 替代方案"
        USE_DOCKER_DB=true
    else
        log_info "✅ PostgreSQL 已安装"
        USE_DOCKER_DB=false
    fi

    # 检查Docker（如果需要）
    if [ "$USE_DOCKER_DB" = true ]; then
        if ! command -v docker &> /dev/null; then
            log_error "PostgreSQL 和 Docker 都未安装，请安装其中之一"
            echo "PostgreSQL: https://www.postgresql.org/download/"
            echo "Docker: https://www.docker.com/get-started"
            exit 1
        fi
        log_info "✅ Docker 已安装，将使用 Docker 数据库"
    fi
}

# 安装依赖
install_dependencies() {
    log_step "安装项目依赖..."

    if [ ! -f "package.json" ]; then
        log_error "package.json 不存在，请确保在项目根目录运行此脚本"
        exit 1
    fi

    npm install --legacy-peer-deps
    log_info "✅ 依赖安装完成"
}

# 设置数据库
setup_database() {
    log_step "配置数据库..."

    if [ "$USE_DOCKER_DB" = true ]; then
        log_info "启动 Docker PostgreSQL 容器..."

        # 停止可能存在的旧容器
        docker stop postgres-ai 2>/dev/null || true
        docker rm postgres-ai 2>/dev/null || true

        # 启动新容器
        docker run --name postgres-ai \
            -e POSTGRES_PASSWORD=123456 \
            -e POSTGRES_DB=ai_marketplace \
            -p 5432:5432 \
            -d postgres:14

        log_info "✅ PostgreSQL Docker 容器已启动"
        DB_URL="postgresql://postgres:123456@localhost:5432/ai_marketplace?schema=public"
    else
        log_info "使用本地 PostgreSQL..."

        # 检查数据库是否存在
        if ! psql -lqt | cut -d \| -f 1 | grep -qw ai_marketplace; then
            log_info "创建数据库 ai_marketplace..."
            createdb ai_marketplace 2>/dev/null || {
                log_warn "自动创建数据库失败，请手动创建："
                echo "psql -U postgres -c \"CREATE DATABASE ai_marketplace;\""
            }
        fi

        log_info "✅ 本地 PostgreSQL 数据库已准备"
        DB_URL="postgresql://postgres:@localhost:5432/ai_marketplace?schema=public"
    fi
}

# 配置环境变量
setup_environment() {
    log_step "配置环境变量..."

    if [ ! -f ".env.local" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env.local
            log_info "✅ 已复制 .env.example 到 .env.local"
        else
            log_warn "未找到 .env.example，创建基础配置..."
            create_basic_env
        fi
    else
        log_info "✅ .env.local 已存在"
    fi

    # 更新数据库URL
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=\"$DB_URL\"|" .env.local
    else
        # Linux/Windows
        sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"$DB_URL\"|" .env.local
    fi

    log_info "✅ 环境变量配置完成"
}

# 创建基础环境配置
create_basic_env() {
    cat > .env.local << EOF
# 数据库配置
DATABASE_URL="$DB_URL"

# JWT配置
JWT_SECRET="dev-secret-key-change-in-production"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

# NextAuth配置
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-nextauth-secret"

# 开发环境
NODE_ENV="development"

# AI服务配置（可选）
# OPENAI_API_KEY="your-openai-api-key"
# DEEPSEEK_API_KEY="your-deepseek-api-key"
# ZHIPU_API_KEY="your-zhipu-api-key"
EOF
}

# 初始化数据库
init_database() {
    log_step "初始化数据库架构..."

    # 等待数据库启动（如果使用Docker）
    if [ "$USE_DOCKER_DB" = true ]; then
        log_info "等待数据库启动..."
        sleep 5

        # 检查数据库连接
        for i in {1..30}; do
            if docker exec postgres-ai pg_isready &>/dev/null; then
                break
            fi
            if [ $i -eq 30 ]; then
                log_error "数据库启动超时"
                exit 1
            fi
            sleep 1
        done
    fi

    # 生成Prisma客户端
    npx prisma generate

    # 推送数据库架构
    npx prisma db push

    log_info "✅ 数据库初始化完成"
}

# 启动开发服务器
start_dev_server() {
    log_step "启动开发服务器..."

    log_info "🚀 开发服务器启动中..."
    log_info "📱 应用地址: http://localhost:4000"
    log_info "🗄️ 数据库管理: http://localhost:5555 (运行 'npx prisma studio')"
    log_info ""
    log_info "按 Ctrl+C 停止服务器"
    log_info ""

    npm run dev
}

# 显示帮助信息
show_help() {
    echo "AI创意协作平台 - 本地开发环境快速启动"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  --help, -h     显示帮助信息"
    echo "  --setup-only   仅设置环境，不启动服务器"
    echo "  --skip-deps    跳过依赖安装"
    echo "  --use-docker   强制使用Docker数据库"
    echo ""
    echo "示例:"
    echo "  $0                    # 完整启动流程"
    echo "  $0 --setup-only       # 仅设置环境"
    echo "  $0 --skip-deps        # 跳过依赖安装"
}

# 主函数
main() {
    local setup_only=false
    local skip_deps=false

    # 解析参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            --help|-h)
                show_help
                exit 0
                ;;
            --setup-only)
                setup_only=true
                shift
                ;;
            --skip-deps)
                skip_deps=true
                shift
                ;;
            --use-docker)
                USE_DOCKER_DB=true
                shift
                ;;
            *)
                log_error "未知参数: $1"
                show_help
                exit 1
                ;;
        esac
    done

    echo "🚀 AI创意协作平台 - 本地开发环境启动脚本"
    echo "=================================================="
    echo ""

    # 执行步骤
    check_requirements

    if [ "$skip_deps" = false ]; then
        install_dependencies
    fi

    setup_database
    setup_environment
    init_database

    if [ "$setup_only" = false ]; then
        start_dev_server
    else
        log_info "🎉 环境设置完成！"
        log_info "运行 'npm run dev' 启动开发服务器"
    fi
}

# 执行主函数
main "$@"