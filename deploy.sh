#!/bin/bash

# ==========================================
# AI创意协作平台 - 生产环境部署脚本
# ==========================================

set -e  # 遇到错误立即退出

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

# 检查系统要求
check_requirements() {
    log_info "检查系统要求..."

    # 检查Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装，请先安装Docker"
        exit 1
    fi

    # 检查Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose未安装，请先安装Docker Compose"
        exit 1
    fi

    # 检查Git
    if ! command -v git &> /dev/null; then
        log_error "Git未安装，请先安装Git"
        exit 1
    fi

    # 检查系统资源
    AVAILABLE_MEMORY=$(free -m | awk 'NR==2{printf "%.0f", $7}')
    if [ "$AVAILABLE_MEMORY" -lt 2048 ]; then
        log_warn "可用内存少于2GB，可能影响性能"
    fi

    log_info "系统要求检查完成"
}

# 创建必要目录
create_directories() {
    log_info "创建必要目录..."

    mkdir -p logs
    mkdir -p uploads
    mkdir -p backups
    mkdir -p ssl
    mkdir -p monitoring/prometheus
    mkdir -p monitoring/grafana/dashboards
    mkdir -p monitoring/grafana/provisioning
    mkdir -p nginx
    mkdir -p scripts

    log_info "目录创建完成"
}

# 生成SSL证书（自签名，生产环境请使用正式证书）
generate_ssl_cert() {
    log_info "生成SSL证书..."

    if [ ! -f ssl/server.crt ] || [ ! -f ssl/server.key ]; then
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl/server.key \
            -out ssl/server.crt \
            -subj "/C=CN/ST=Shanghai/L=Shanghai/O=AI Creative Platform/CN=localhost"

        log_info "SSL证书生成完成"
    else
        log_info "SSL证书已存在，跳过生成"
    fi
}

# 创建Nginx配置
create_nginx_config() {
    log_info "创建Nginx配置..."

    cat > nginx/nginx.conf << 'EOF'
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
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

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

    cat > nginx/default.conf << 'EOF'
# 上游服务器
upstream app_server {
    server app:3000;
    keepalive 32;
}

# HTTP重定向到HTTPS
server {
    listen 80;
    server_name _;
    return 301 https://$server_name$request_uri;
}

# HTTPS服务器
server {
    listen 443 ssl http2;
    server_name _;

    # SSL配置
    ssl_certificate /etc/nginx/ssl/server.crt;
    ssl_certificate_key /etc/nginx/ssl/server.key;
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

    # 静态文件
    location /uploads/ {
        alias /usr/share/nginx/html/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API代理
    location /api/ {
        proxy_pass http://app_server;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # 应用代理
    location / {
        proxy_pass http://app_server;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

    log_info "Nginx配置创建完成"
}

# 创建监控配置
create_monitoring_config() {
    log_info "创建监控配置..."

    # Prometheus配置
    cat > monitoring/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'ai-marketplace-app'
    static_configs:
      - targets: ['app:9464']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:80']
EOF

    log_info "监控配置创建完成"
}

# 创建部署脚本
create_deployment_scripts() {
    log_info "创建部署脚本..."

    # 备份脚本
    cat > scripts/backup.sh << 'EOF'
#!/bin/bash
# 数据库备份脚本

BACKUP_DIR="/opt/ai-marketplace/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
docker exec ai-marketplace-postgres pg_dump -U postgres ai_marketplace > $BACKUP_FILE

# 压缩备份文件
gzip $BACKUP_FILE

# 删除7天前的备份
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "数据库备份完成: $BACKUP_FILE.gz"
EOF

    # 健康检查脚本
    cat > scripts/health-check.sh << 'EOF'
#!/bin/bash
# 健康检查脚本

HEALTH_URL="http://localhost/api/health"
MAX_RETRIES=5
RETRY_DELAY=10

for i in $(seq 1 $MAX_RETRIES); do
    if curl -f -s $HEALTH_URL > /dev/null; then
        echo "健康检查通过"
        exit 0
    else
        echo "健康检查失败，重试 $i/$MAX_RETRIES"
        if [ $i -lt $MAX_RETRIES ]; then
            sleep $RETRY_DELAY
        fi
    fi
done

echo "健康检查最终失败"
exit 1
EOF

    # 蓝绿部署脚本
    cat > scripts/blue-green-deploy.sh << 'EOF'
#!/bin/bash
# 蓝绿部署脚本

NEW_IMAGE=$1

if [ -z "$NEW_IMAGE" ]; then
    echo "使用方法: $0 <new-image>"
    exit 1
fi

echo "开始蓝绿部署，新镜像: $NEW_IMAGE"

# 拉取新镜像
docker pull $NEW_IMAGE

# 停止当前服务
docker-compose down

# 更新镜像
sed -i "s|image: .*|image: $NEW_IMAGE|g" docker-compose.yml

# 启动新服务
docker-compose up -d

# 等待服务启动
sleep 30

# 健康检查
./scripts/health-check.sh

if [ $? -eq 0 ]; then
    echo "蓝绿部署成功"
else
    echo "蓝绿部署失败，回滚中..."
    # 这里可以添加回滚逻辑
    exit 1
fi
EOF

    chmod +x scripts/*.sh
    log_info "部署脚本创建完成"
}

# 生成环境变量文件
generate_env_file() {
    log_info "生成环境变量文件..."

    if [ ! -f .env ]; then
        log_warn ".env文件不存在，使用默认配置"
        cat > .env << 'EOF'
# 数据库配置
POSTGRES_DB=ai_marketplace
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password-here

# Redis配置
REDIS_PASSWORD=your-redis-password-here

# 监控配置
GRAFANA_PASSWORD=admin

# JWT配置
JWT_SECRET=your-super-secret-jwt-key
NEXTAUTH_SECRET=your-nextauth-secret

# 应用配置
NEXTAUTH_URL=https://localhost

# AI服务配置（请替换为实际的API密钥）
BAIDU_API_KEY=your-baidu-api-key
BAIDU_SECRET_KEY=your-baidu-secret-key
# ... 其他AI服务配置
EOF
        log_warn "请编辑.env文件，配置实际的密钥和密码"
    else
        log_info ".env文件已存在"
    fi
}

# 初始化数据库
init_database() {
    log_info "初始化数据库..."

    cat > scripts/init-db.sql << 'EOF'
-- 数据库初始化脚本
-- 创建必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 设置时区
SET TIME ZONE 'Asia/Shanghai';

-- 创建性能监控视图
CREATE OR REPLACE VIEW pg_stat_statements_summary AS
SELECT
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 100;
EOF

    log_info "数据库初始化脚本创建完成"
}

# 构建和启动服务
deploy_services() {
    log_info "构建和启动服务..."

    # 构建Docker镜像
    log_info "构建应用镜像..."
    docker build -t ai-agent-marketplace:latest .

    # 启动服务
    log_info "启动所有服务..."
    docker-compose up -d

    # 等待服务启动
    log_info "等待服务启动..."
    sleep 30

    # 运行数据库迁移
    log_info "运行数据库迁移..."
    docker-compose exec -T app npx prisma generate
    docker-compose exec -T app npx prisma db push

    log_info "服务部署完成"
}

# 验证部署
verify_deployment() {
    log_info "验证部署..."

    # 检查服务状态
    log_info "检查服务状态..."
    docker-compose ps

    # 健康检查
    log_info "执行健康检查..."
    sleep 10

    if ./scripts/health-check.sh; then
        log_info "部署验证成功！"
        log_info "应用访问地址: https://localhost"
        log_info "Grafana监控: http://localhost:3001 (admin/admin)"
        log_info "Prometheus: http://localhost:9090"
    else
        log_error "部署验证失败"
        log_info "查看日志: docker-compose logs"
        exit 1
    fi
}

# 显示部署信息
show_deployment_info() {
    log_info "==================================="
    log_info "AI创意协作平台部署完成！"
    log_info "==================================="
    echo
    log_info "服务访问地址:"
    echo "  - 主应用: https://localhost"
    echo "  - API健康检查: https://localhost/api/health"
    echo "  - Grafana监控: http://localhost:3001 (admin/admin)"
    echo "  - Prometheus: http://localhost:9090"
    echo
    log_info "常用命令:"
    echo "  - 查看日志: docker-compose logs -f"
    echo "  - 重启服务: docker-compose restart"
    echo "  - 停止服务: docker-compose down"
    echo "  - 更新服务: docker-compose pull && docker-compose up -d"
    echo
    log_info "重要文件:"
    echo "  - 环境配置: .env"
    echo "  - 应用日志: logs/"
    echo "  - 数据备份: backups/"
    echo "  - SSL证书: ssl/"
    echo
    log_warn "请妥善保管.env文件中的密钥信息！"
}

# 主部署流程
main() {
    log_info "开始部署AI创意协作平台..."

    check_requirements
    create_directories
    generate_ssl_cert
    create_nginx_config
    create_monitoring_config
    create_deployment_scripts
    generate_env_file
    init_database
    deploy_services
    verify_deployment
    show_deployment_info

    log_info "部署流程完成！"
}

# 错误处理
trap 'log_error "部署过程中发生错误，退出码: $?"; exit 1' ERR

# 执行主流程
main "$@"