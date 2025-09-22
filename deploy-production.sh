#!/bin/bash

# ==========================================
# AI创意协作平台 - aijiayuan.top 生产环境部署脚本
# ==========================================

set -e  # 遇到错误立即退出

# 服务器配置
SERVER_IP="47.108.90.221"
DOMAIN="aijiayuan.top"
DEPLOY_PATH="/opt/ai-marketplace"
PROJECT_NAME="ai-agent-marketplace"

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
        apt install -y curl wget git unzip htop

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
        mkdir -p docker/nginx docker/postgres
        mkdir -p scripts data/postgres data/redis

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

    # 检查是否存在生产环境配置
    if [ ! -f .env.production ]; then
        log_warn ".env.production 文件不存在，创建默认配置..."

        cat > .env.production << EOF
# 生产环境配置 - aijiayuan.top
NODE_ENV=production

# 域名配置
NEXTAUTH_URL=https://$DOMAIN
NEXT_PUBLIC_APP_URL=https://$DOMAIN

# 数据库配置
DATABASE_URL=postgresql://postgres:your-secure-password@postgres-primary:5432/ai_marketplace
POSTGRES_DB=ai_marketplace
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password-here
POSTGRES_REPLICATION_PASSWORD=your-replication-password

# Redis配置
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=your-redis-password-here

# JWT和认证配置
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NEXTAUTH_SECRET=your-nextauth-secret-change-this-in-production

# Docker镜像配置
DOCKER_IMAGE=ai-agent-marketplace:latest

# AI服务配置 (请替换为实际的API密钥)
BAIDU_API_KEY=your-baidu-api-key
BAIDU_SECRET_KEY=your-baidu-secret-key
XUNFEI_APP_ID=your-xunfei-app-id
XUNFEI_API_KEY=your-xunfei-api-key
XUNFEI_API_SECRET=your-xunfei-api-secret
DASHSCOPE_API_KEY=your-dashscope-api-key
TENCENT_SECRET_ID=your-tencent-secret-id
TENCENT_SECRET_KEY=your-tencent-secret-key
ZHIPU_API_KEY=your-zhipu-api-key

# 支付配置
ALIPAY_APP_ID=your-alipay-app-id
ALIPAY_PRIVATE_KEY=your-alipay-private-key
ALIPAY_PUBLIC_KEY=your-alipay-public-key
WECHAT_APPID=your-wechat-appid
WECHAT_MCHID=your-wechat-mchid
WECHAT_PRIVATE_KEY=your-wechat-private-key
WECHAT_CERT_SERIAL_NO=your-wechat-cert-serial

# 阿里云OSS配置
ALIYUN_OSS_REGION=oss-cn-hangzhou
ALIYUN_OSS_ACCESS_KEY_ID=your-oss-access-key-id
ALIYUN_OSS_ACCESS_KEY_SECRET=your-oss-access-key-secret
ALIYUN_OSS_BUCKET=your-oss-bucket-name
EOF

        log_warn "请编辑 .env.production 文件，填入实际的API密钥和配置"
        log_warn "部署将暂停，请配置完成后重新运行"
        return 1
    fi

    # 上传环境变量文件
    scp .env.production root@$SERVER_IP:$DEPLOY_PATH/.env

    log_info "环境变量配置完成"
}

# 配置Nginx for aijiayuan.top
configure_nginx() {
    log_info "配置Nginx for $DOMAIN..."

    ssh root@$SERVER_IP << ENDSSH
        set -e
        cd $DEPLOY_PATH

        # 创建Nginx配置
        cat > docker/nginx/nginx.conf << 'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # 日志格式
    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                    '\$status \$body_bytes_sent "\$http_referer" '
                    '"\$http_user_agent" "\$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # 基础配置
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 10M;

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    include /etc/nginx/conf.d/*.conf;
}
EOF

        # 创建域名配置
        cat > docker/nginx/conf.d/production.conf << EOF
# 上游服务器
upstream app_server {
    server app:3000;
    keepalive 32;
}

# HTTP重定向到HTTPS
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Let's Encrypt验证
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # 其他请求重定向到HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS主服务器
server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL配置
    ssl_certificate /etc/nginx/ssl/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/live/$DOMAIN/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 安全头
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # 静态文件缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf|svg)\$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Cache-Status "STATIC";
    }

    # 上传文件
    location /uploads/ {
        alias /var/www/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API代理
    location /api/ {
        proxy_pass http://app_server;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # 健康检查
    location /health {
        access_log off;
        proxy_pass http://app_server/api/health;
        proxy_set_header Host \$host;
    }

    # Next.js应用代理
    location / {
        proxy_pass http://app_server;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # Next.js特殊配置
        proxy_buffering off;
        proxy_request_buffering off;
    }
}
EOF

        echo "Nginx配置创建完成"
ENDSSH

    log_info "Nginx配置完成"
}

# 获取SSL证书
setup_ssl_certificate() {
    log_info "为 $DOMAIN 设置SSL证书..."

    ssh root@$SERVER_IP << ENDSSH
        set -e
        cd $DEPLOY_PATH

        # 创建certbot目录
        mkdir -p ssl/live/$DOMAIN
        mkdir -p /var/www/certbot

        # 首先启动nginx容器用于验证
        echo "临时启动nginx进行域名验证..."

        # 创建临时nginx配置用于验证
        cat > docker/nginx/temp-verification.conf << 'EOF'
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 200 'Domain verification in progress';
        add_header Content-Type text/plain;
    }
}
EOF

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
        cp -r /etc/letsencrypt/archive/$DOMAIN/ ssl/archive/

        # 设置证书自动续期
        (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet --post-hook 'docker-compose restart nginx'") | crontab -

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
        docker volume create postgres_primary_data 2>/dev/null || true
        docker volume create redis_data 2>/dev/null || true
        docker volume create app_logs 2>/dev/null || true
        docker volume create nginx_logs 2>/dev/null || true

        # 构建应用镜像
        echo "构建应用镜像..."
        docker build -t ai-agent-marketplace:latest .

        # 使用生产配置启动服务
        echo "启动服务..."
        docker-compose -f docker-compose.prod.yml up -d

        # 等待服务启动
        echo "等待服务启动..."
        sleep 60

        # 运行数据库迁移
        echo "运行数据库迁移..."
        docker-compose -f docker-compose.prod.yml exec -T app npx prisma generate
        docker-compose -f docker-compose.prod.yml exec -T app npx prisma db push

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

        # 安装服务文件
        cp systemd/*.service /etc/systemd/system/
        cp systemd/*.timer /etc/systemd/system/

        # 重新加载systemd
        systemctl daemon-reload

        # 启用并启动主应用服务
        systemctl enable aijiayuan-app.service

        # 启用健康检查定时器
        systemctl enable aijiayuan-health-check.timer
        systemctl start aijiayuan-health-check.timer

        # 启用备份定时器
        systemctl enable aijiayuan-backup.timer
        systemctl start aijiayuan-backup.timer

        echo "systemd服务安装完成"
ENDSSH

    log_info "systemd服务安装完成"
}
verify_deployment() {
    log_info "验证部署状态..."

    ssh root@$SERVER_IP << ENDSSH
        set -e
        cd $DEPLOY_PATH

        # 检查服务状态
        echo "=== 服务状态 ==="
        docker-compose -f docker-compose.prod.yml ps

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
            docker-compose -f docker-compose.prod.yml logs --tail=50 app
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
ENDSSH

    log_info "部署验证完成"
}

# 显示部署后信息
show_completion_info() {
    log_info "=========================================="
    log_info "🎉 AI创意协作平台部署到 aijiayuan.top 完成！"
    log_info "=========================================="
    echo
    log_info "📱 访问地址:"
    echo "  - 主站: https://$DOMAIN"
    echo "  - www: https://www.$DOMAIN"
    echo "  - API健康检查: https://$DOMAIN/api/health"
    echo
    log_info "🔧 管理命令:"
    echo "  - 查看状态: ssh root@$SERVER_IP 'cd $DEPLOY_PATH && ./scripts/maintenance.sh status'"
    echo "  - 查看日志: ssh root@$SERVER_IP 'cd $DEPLOY_PATH && ./scripts/maintenance.sh logs'"
    echo "  - 重启服务: ssh root@$SERVER_IP 'cd $DEPLOY_PATH && ./scripts/maintenance.sh restart'"
    echo "  - 手动备份: ssh root@$SERVER_IP 'cd $DEPLOY_PATH && ./scripts/maintenance.sh backup'"
    echo "  - 健康检查: ssh root@$SERVER_IP 'cd $DEPLOY_PATH && ./scripts/maintenance.sh health-check'"
    echo "  - 系统清理: ssh root@$SERVER_IP 'cd $DEPLOY_PATH && ./scripts/maintenance.sh cleanup'"
    echo
    log_info "📊 监控地址:"
    echo "  - Grafana: http://$SERVER_IP:3001 (admin/admin)"
    echo "  - Prometheus: http://$SERVER_IP:9090"
    echo
    log_warn "⚠️  重要提醒:"
    echo "  1. 请及时修改 .env 中的默认密码和API密钥"
    echo "  2. SSL证书将自动续期，无需手动操作"
    echo "  3. 系统已配置自动备份和健康检查"
    echo "  4. 定期查看 systemctl status aijiayuan-* 服务状态"
    echo "  5. 监控服务器资源使用情况"
    echo "  6. 备份文件位于 /opt/ai-marketplace/backups/"
}

# 主部署流程
main() {
    log_info "开始部署 AI创意协作平台 到 aijiayuan.top..."

    # 检查参数
    if [ "$1" = "--skip-deps" ]; then
        log_info "跳过依赖检查..."
    else
        check_local_requirements
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
    echo "AI创意协作平台 - aijiayuan.top 部署脚本"
    echo ""
    echo "使用方法:"
    echo "  $0                 # 完整部署"
    echo "  $0 --skip-deps     # 跳过依赖安装"
    echo "  $0 --help          # 显示帮助"
    echo ""
    echo "部署前准备:"
    echo "  1. 确保能够SSH访问到服务器 47.108.90.221"
    echo "  2. 域名 aijiayuan.top 已解析到服务器IP"
    echo "  3. 编辑 .env.production 配置文件"
    exit 0
fi

# 执行主流程
main "$@"