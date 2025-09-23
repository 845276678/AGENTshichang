#!/bin/bash

# ==========================================
# AI创意协作平台 - aijiayuan.top MySQL版本部署脚本
# ==========================================

set -e  # 遇到错误立即退出

# 服务器配置
SERVER_IP="47.108.90.221"
DOMAIN="aijiayuan.top"
DEPLOY_PATH="/opt/ai-marketplace"
PROJECT_NAME="ai-agent-marketplace"

# MySQL配置
MYSQL_HOST="8.137.153.81"
MYSQL_PORT="31369"
MYSQL_USER="root"
MYSQL_PASSWORD="Jk8Iq9ijPht04m6ud7G3N12wZVlEMvY5"
MYSQL_DATABASE="zeabur"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_debug() {
    echo -e "${BLUE}[DEBUG]${NC} $1"
}

# 检查本地环境
check_local_requirements() {
    log_info "检查本地部署环境..."

    if ! command -v rsync &> /dev/null; then
        log_error "rsync未安装，请先安装: sudo apt install rsync"
        exit 1
    fi

    if ! command -v ssh &> /dev/null; then
        log_error "ssh未安装，请先安装openssh-client"
        exit 1
    fi

    log_info "本地环境检查完成"
}

# 测试MySQL连接
test_mysql_connection() {
    log_info "测试MySQL连接..."

    # 检查网络连接
    if ! nc -z "$MYSQL_HOST" "$MYSQL_PORT" 2>/dev/null; then
        log_error "无法连接到MySQL服务器 $MYSQL_HOST:$MYSQL_PORT"
        exit 1
    fi

    # 测试数据库连接
    if docker run --rm mysql:8.0 mysql -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SELECT 1;" "$MYSQL_DATABASE" &>/dev/null; then
        log_info "✅ MySQL连接测试成功"
    else
        log_error "❌ MySQL连接测试失败"
        exit 1
    fi
}

# 测试服务器连接
test_server_connection() {
    log_info "测试服务器连接..."

    if ! ssh -o ConnectTimeout=10 -o BatchMode=yes root@$SERVER_IP 'echo "Connection successful"' 2>/dev/null; then
        log_error "无法连接到服务器 $SERVER_IP"
        log_error "请确保："
        log_error "1. 服务器IP地址正确"
        log_error "2. SSH密钥已配置或能够密码登录"
        log_error "3. 服务器防火墙允许SSH连接"
        exit 1
    fi

    log_info "服务器连接测试成功"
}

# 检查和安装服务器依赖
install_server_dependencies() {
    log_info "检查服务器依赖..."

    ssh root@$SERVER_IP << 'ENDSSH'
        set -e

        # 更新系统
        echo "更新系统包..."
        apt update && apt upgrade -y

        # 安装基础工具
        apt install -y curl wget git unzip htop netcat-openbsd

        # 检查Docker
        if ! command -v docker &> /dev/null; then
            echo "安装Docker..."
            curl -fsSL https://get.docker.com -o get-docker.sh
            sh get-docker.sh
            systemctl enable docker
            systemctl start docker
        else
            echo "Docker已安装"
        fi

        # 检查Docker Compose
        if ! command -v docker-compose &> /dev/null; then
            echo "安装Docker Compose..."
            curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
            chmod +x /usr/local/bin/docker-compose
        else
            echo "Docker Compose已安装"
        fi

        # 安装Certbot (用于SSL证书)
        if ! command -v certbot &> /dev/null; then
            echo "安装Certbot..."
            apt install -y certbot python3-certbot-nginx
        else
            echo "Certbot已安装"
        fi

        echo "服务器依赖安装完成"
ENDSSH

    log_info "服务器依赖检查完成"
}

# 创建部署目录结构
create_deployment_structure() {
    log_info "创建部署目录结构..."

    ssh root@$SERVER_IP << ENDSSH
        set -e

        # 创建主目录
        mkdir -p $DEPLOY_PATH
        cd $DEPLOY_PATH

        # 创建必要目录
        mkdir -p logs uploads backups ssl
        mkdir -p docker/nginx docker/prometheus docker/grafana
        mkdir -p scripts data/redis

        echo "部署目录结构创建完成"
ENDSSH

    log_info "部署目录结构创建完成"
}

# 上传项目文件
upload_project_files() {
    log_info "上传项目文件到服务器..."

    # 创建临时排除文件
    cat > .rsync-exclude << 'EOF'
node_modules/
.next/
.git/
logs/
*.log
.env.local
.env.development
tsconfig.tsbuildinfo
coverage/
test-*.js
*.test.js
*.spec.js
docker/postgres/
EOF

    # 同步项目文件
    rsync -avz --delete \
        --exclude-from=.rsync-exclude \
        --progress \
        ./ root@$SERVER_IP:$DEPLOY_PATH/

    # 清理临时文件
    rm .rsync-exclude

    log_info "项目文件上传完成"
}

# 配置环境变量
configure_environment() {
    log_info "配置生产环境变量..."

    # 检查MySQL特定的环境文件
    if [ ! -f .env.production ]; then
        log_error ".env.production 文件不存在"
        exit 1
    fi

    # 上传环境变量文件
    scp .env.production root@$SERVER_IP:$DEPLOY_PATH/.env

    log_info "环境变量配置完成"
}

# 配置Nginx
configure_nginx() {
    log_info "配置Nginx for $DOMAIN..."

    # Nginx配置已经在项目文件中，直接使用
    log_info "Nginx配置完成"
}

# 设置SSL证书
setup_ssl_certificate() {
    log_info "为 $DOMAIN 设置SSL证书..."

    ssh root@$SERVER_IP << ENDSSH
        set -e
        cd $DEPLOY_PATH

        # 创建certbot目录
        mkdir -p ssl/live/$DOMAIN
        mkdir -p /var/www/certbot

        # 使用Let's Encrypt获取证书
        echo "申请SSL证书..."
        certbot certonly --webroot \
            --webroot-path=/var/www/certbot \
            --email admin@$DOMAIN \
            --agree-tos \
            --no-eff-email \
            --force-renewal \
            -d $DOMAIN \
            -d www.$DOMAIN

        # 复制证书到Docker挂载目录
        cp -r /etc/letsencrypt/live/$DOMAIN/ ssl/live/
        cp -r /etc/letsencrypt/archive/$DOMAIN/ ssl/archive/ 2>/dev/null || true

        # 设置证书自动续期
        (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet --post-hook 'cd $DEPLOY_PATH && docker-compose -f docker-compose.mysql.yml restart nginx'") | crontab -

        echo "SSL证书设置完成"
ENDSSH

    log_info "SSL证书设置完成"
}

# 构建和部署服务
build_and_deploy() {
    log_info "构建Docker镜像并部署服务..."

    ssh root@$SERVER_IP << ENDSSH
        set -e
        cd $DEPLOY_PATH

        # 创建Docker networks
        docker network create ai-marketplace 2>/dev/null || true
        docker network create monitoring 2>/dev/null || true

        # 创建Docker volumes
        docker volume create redis_data 2>/dev/null || true
        docker volume create app_logs 2>/dev/null || true
        docker volume create app_uploads 2>/dev/null || true
        docker volume create nginx_logs 2>/dev/null || true
        docker volume create prometheus_data 2>/dev/null || true
        docker volume create grafana_data 2>/dev/null || true

        # 构建应用镜像
        echo "构建应用镜像..."
        docker build -f Dockerfile.simple -t ai-agent-marketplace:latest .

        # 使用MySQL配置启动服务
        echo "启动服务..."
        docker-compose -f docker-compose.mysql.yml up -d

        # 等待服务启动
        echo "等待服务启动..."
        sleep 60

        # 测试MySQL连接
        echo "测试MySQL连接..."
        docker run --rm mysql:8.0 mysql -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SELECT 1;" "$MYSQL_DATABASE"

        # 运行数据库迁移 (如果需要)
        echo "运行数据库迁移..."
        # 注意：这里需要根据您的应用具体情况调整
        # docker-compose -f docker-compose.mysql.yml exec -T app npx prisma generate
        # docker-compose -f docker-compose.mysql.yml exec -T app npx prisma db push

        echo "服务部署完成"
ENDSSH

    log_info "服务部署完成"
}

# 安装系统服务
install_systemd_services() {
    log_info "安装systemd服务..."

    ssh root@$SERVER_IP << ENDSSH
        set -e
        cd $DEPLOY_PATH

        # 更新systemd服务文件以使用MySQL版本
        sed -i 's/docker-compose.prod.yml/docker-compose.mysql.yml/g' systemd/*.service 2>/dev/null || true

        # 安装服务文件
        cp systemd/*.service /etc/systemd/system/ 2>/dev/null || true
        cp systemd/*.timer /etc/systemd/system/ 2>/dev/null || true

        # 重新加载systemd
        systemctl daemon-reload

        # 启用主应用服务
        systemctl enable aijiayuan-app.service 2>/dev/null || true

        # 启用健康检查定时器
        systemctl enable aijiayuan-health-check.timer 2>/dev/null || true
        systemctl start aijiayuan-health-check.timer 2>/dev/null || true

        # 启用备份定时器
        systemctl enable aijiayuan-backup.timer 2>/dev/null || true
        systemctl start aijiayuan-backup.timer 2>/dev/null || true

        echo "systemd服务安装完成"
ENDSSH

    log_info "systemd服务安装完成"
}

# 验证部署
verify_deployment() {
    log_info "验证部署状态..."

    ssh root@$SERVER_IP << ENDSSH
        set -e
        cd $DEPLOY_PATH

        # 检查服务状态
        echo "=== 服务状态 ==="
        docker-compose -f docker-compose.mysql.yml ps

        echo ""
        echo "=== MySQL连接测试 ==="
        docker run --rm mysql:8.0 mysql -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SELECT 'MySQL连接正常' as status;" "$MYSQL_DATABASE"

        echo ""
        echo "=== 服务健康检查 ==="

        # 等待服务完全启动
        sleep 30

        # 检查应用健康状态
        if curl -f -s https://$DOMAIN/api/health > /dev/null; then
            echo "✅ 应用健康检查通过"
        else
            echo "❌ 应用健康检查失败"
            echo "检查应用日志:"
            docker-compose -f docker-compose.mysql.yml logs --tail=50 app
        fi

        # 检查SSL证书
        if openssl s_client -connect $DOMAIN:443 -servername $DOMAIN < /dev/null 2>/dev/null | grep -q "Verify return code: 0"; then
            echo "✅ SSL证书验证通过"
        else
            echo "❌ SSL证书验证失败"
        fi

        echo ""
        echo "=== 部署信息 ==="
        echo "应用地址: https://$DOMAIN"
        echo "API健康检查: https://$DOMAIN/api/health"
        echo "服务器IP: $SERVER_IP"
        echo "MySQL服务器: $MYSQL_HOST:$MYSQL_PORT"
        echo "数据库: $MYSQL_DATABASE"
ENDSSH

    log_info "部署验证完成"
}

# 显示部署后信息
show_completion_info() {
    log_info "=========================================="
    log_info "🎉 AI创意协作平台部署到 aijiayuan.top 完成！(MySQL版本)"
    log_info "=========================================="
    echo
    log_info "📱 访问地址:"
    echo "  - 主站: https://$DOMAIN"
    echo "  - www: https://www.$DOMAIN"
    echo "  - API健康检查: https://$DOMAIN/api/health"
    echo
    log_info "🗄️ 数据库信息:"
    echo "  - MySQL服务器: $MYSQL_HOST:$MYSQL_PORT"
    echo "  - 数据库: $MYSQL_DATABASE"
    echo "  - 用户: $MYSQL_USER"
    echo
    log_info "🔧 管理命令:"
    echo "  - 查看状态: ssh root@$SERVER_IP 'cd $DEPLOY_PATH && ./scripts/maintenance.sh status'"
    echo "  - 查看日志: ssh root@$SERVER_IP 'cd $DEPLOY_PATH && ./scripts/maintenance.sh logs'"
    echo "  - 重启服务: ssh root@$SERVER_IP 'cd $DEPLOY_PATH && ./scripts/maintenance.sh restart'"
    echo "  - 手动备份: ssh root@$SERVER_IP 'cd $DEPLOY_PATH && ./scripts/backup-mysql.sh'"
    echo "  - 健康检查: ssh root@$SERVER_IP 'cd $DEPLOY_PATH && ./scripts/health-check-mysql.sh'"
    echo "  - MySQL连接测试: ssh root@$SERVER_IP 'cd $DEPLOY_PATH && ./scripts/test-mysql-connection.sh'"
    echo
    log_info "📊 监控地址:"
    echo "  - Grafana: http://$SERVER_IP:3001 (admin/admin)"
    echo "  - Prometheus: http://$SERVER_IP:9090"
    echo
    log_warn "⚠️  重要提醒:"
    echo "  1. 请及时修改 .env 中的默认密码和API密钥"
    echo "  2. SSL证书将自动续期，无需手动操作"
    echo "  3. 系统已配置自动备份和健康检查"
    echo "  4. MySQL数据库托管在Zeabur，请定期检查服务状态"
    echo "  5. 监控服务器资源使用情况"
    echo "  6. 备份文件位于 /opt/ai-marketplace/backups/"
}

# 主部署流程
main() {
    log_info "开始部署 AI创意协作平台 到 aijiayuan.top (MySQL版本)..."

    # 检查参数
    if [ "$1" = "--skip-deps" ]; then
        log_info "跳过依赖检查..."
    else
        check_local_requirements
        test_mysql_connection
        test_server_connection
        install_server_dependencies
    fi

    create_deployment_structure
    upload_project_files

    if ! configure_environment; then
        log_error "环境配置未完成，请配置 .env.production 后重新运行"
        exit 1
    fi

    configure_nginx
    setup_ssl_certificate
    build_and_deploy
    install_systemd_services
    verify_deployment
    show_completion_info

    log_info "部署流程全部完成！ 🎉"
}

# 错误处理
trap 'log_error "部署过程中发生错误，退出码: $?"; exit 1' ERR

# 显示使用说明
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "AI创意协作平台 - aijiayuan.top MySQL版本部署脚本"
    echo ""
    echo "使用方法:"
    echo "  $0                 # 完整部署"
    echo "  $0 --skip-deps     # 跳过依赖安装"
    echo "  $0 --help          # 显示帮助"
    echo ""
    echo "部署前准备:"
    echo "  1. 确保能够SSH访问到服务器 47.108.90.221"
    echo "  2. 域名 aijiayuan.top 已解析到服务器IP"
    echo "  3. Zeabur MySQL服务正常运行"
    echo "  4. 编辑 .env.production 配置文件"
    exit 0
fi

# 执行主流程
main "$@"