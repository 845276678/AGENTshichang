# AI创意交易市场部署脚本文档

## 🚀 自动化部署脚本集合

### 一键部署主脚本

```bash
#!/bin/bash
# deploy.sh - AI创意交易市场一键部署脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN} AI创意交易市场 自动化部署脚本 v1.0${NC}"
echo -e "${GREEN}========================================${NC}"

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}请使用root权限运行此脚本${NC}"
    exit 1
fi

# 环境变量检查
check_env() {
    echo -e "${YELLOW}[1/10] 检查环境变量...${NC}"

    required_vars=(
        "DATABASE_URL"
        "REDIS_URL"
        "JWT_SECRET"
        "BAIDU_API_KEY"
        "ALIBABA_DASHSCOPE_API_KEY"
        "ALIYUN_ACCESS_KEY_ID"
        "ALIYUN_ACCESS_KEY_SECRET"
    )

    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            echo -e "${RED}错误: 环境变量 $var 未设置${NC}"
            exit 1
        fi
    done

    echo -e "${GREEN}环境变量检查通过${NC}"
}

# 系统更新
system_update() {
    echo -e "${YELLOW}[2/10] 系统更新...${NC}"
    apt update && apt upgrade -y
    echo -e "${GREEN}系统更新完成${NC}"
}

# 安装Node.js
install_nodejs() {
    echo -e "${YELLOW}[3/10] 安装Node.js 18...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs

    # 验证安装
    node_version=$(node -v)
    npm_version=$(npm -v)
    echo -e "${GREEN}Node.js安装完成: $node_version${NC}"
    echo -e "${GREEN}NPM版本: $npm_version${NC}"
}

# 安装PM2
install_pm2() {
    echo -e "${YELLOW}[4/10] 安装PM2...${NC}"
    npm install -g pm2
    pm2 startup
    echo -e "${GREEN}PM2安装完成${NC}"
}

# 安装Nginx
install_nginx() {
    echo -e "${YELLOW}[5/10] 安装配置Nginx...${NC}"
    apt install -y nginx

    # 配置Nginx
    cat > /etc/nginx/sites-available/aimarket << 'EOF'
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # 重定向到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL配置
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API代理
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Next.js应用代理
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

    # 启用站点
    ln -sf /etc/nginx/sites-available/aimarket /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default

    # 测试配置
    nginx -t
    systemctl enable nginx
    systemctl restart nginx

    echo -e "${GREEN}Nginx配置完成${NC}"
}

# 克隆代码
clone_project() {
    echo -e "${YELLOW}[6/10] 克隆项目代码...${NC}"

    # 创建项目目录
    mkdir -p /var/www
    cd /var/www

    # 克隆代码(替换为实际的Git仓库地址)
    if [ -d "aimarket" ]; then
        echo "项目目录已存在，拉取最新代码..."
        cd aimarket
        git pull origin main
    else
        git clone https://github.com/your-repo/aimarket.git
        cd aimarket
    fi

    echo -e "${GREEN}代码克隆完成${NC}"
}

# 安装依赖
install_dependencies() {
    echo -e "${YELLOW}[7/10] 安装项目依赖...${NC}"
    cd /var/www/aimarket

    npm ci --only=production
    echo -e "${GREEN}依赖安装完成${NC}"
}

# 构建项目
build_project() {
    echo -e "${YELLOW}[8/10] 构建生产版本...${NC}"
    cd /var/www/aimarket

    npm run build
    echo -e "${GREEN}项目构建完成${NC}"
}

# 配置环境变量
setup_env() {
    echo -e "${YELLOW}[9/10] 配置环境变量...${NC}"
    cd /var/www/aimarket

    cat > .env.production << EOF
NODE_ENV=production
PORT=3000

# 数据库配置
DATABASE_URL=${DATABASE_URL}
REDIS_URL=${REDIS_URL}

# JWT配置
JWT_SECRET=${JWT_SECRET}
NEXTAUTH_SECRET=${JWT_SECRET}
NEXTAUTH_URL=https://yourdomain.com

# 阿里云配置
ALIYUN_ACCESS_KEY_ID=${ALIYUN_ACCESS_KEY_ID}
ALIYUN_ACCESS_KEY_SECRET=${ALIYUN_ACCESS_KEY_SECRET}
ALIYUN_OSS_BUCKET=aimarket-prod
ALIYUN_OSS_REGION=oss-cn-hangzhou

# AI服务配置
BAIDU_API_KEY=${BAIDU_API_KEY}
BAIDU_SECRET_KEY=${BAIDU_SECRET_KEY}
ALIBABA_DASHSCOPE_API_KEY=${ALIBABA_DASHSCOPE_API_KEY}
IFLYTEK_APP_ID=${IFLYTEK_APP_ID}
IFLYTEK_API_SECRET=${IFLYTEK_API_SECRET}
TENCENT_SECRET_ID=${TENCENT_SECRET_ID}
TENCENT_SECRET_KEY=${TENCENT_SECRET_KEY}
ZHIPU_API_KEY=${ZHIPU_API_KEY}

# 短信服务
ALIYUN_SMS_ACCESS_KEY=${ALIYUN_SMS_ACCESS_KEY}
ALIYUN_SMS_SECRET=${ALIYUN_SMS_SECRET}
EOF

    chmod 600 .env.production
    echo -e "${GREEN}环境变量配置完成${NC}"
}

# 启动应用
start_application() {
    echo -e "${YELLOW}[10/10] 启动应用...${NC}"
    cd /var/www/aimarket

    # PM2配置文件
    cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'aimarket',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF

    # 创建日志目录
    mkdir -p logs

    # 启动应用
    pm2 start ecosystem.config.js --env production
    pm2 save

    echo -e "${GREEN}应用启动完成${NC}"
}

# 安装SSL证书
install_ssl() {
    echo -e "${YELLOW}安装SSL证书...${NC}"

    # 安装certbot
    apt install -y certbot python3-certbot-nginx

    # 获取证书(需要替换域名)
    certbot --nginx -d yourdomain.com -d www.yourdomain.com --non-interactive --agree-tos --email admin@yourdomain.com

    # 设置自动续期
    crontab -l | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | crontab -

    echo -e "${GREEN}SSL证书安装完成${NC}"
}

# 主函数
main() {
    echo -e "${GREEN}开始部署 AI创意交易市场...${NC}"

    check_env
    system_update
    install_nodejs
    install_pm2
    install_nginx
    clone_project
    install_dependencies
    build_project
    setup_env
    start_application

    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN} 🎉 部署完成! ${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}应用地址: http://your-server-ip${NC}"
    echo -e "${GREEN}请配置域名和SSL证书${NC}"
    echo -e "${GREEN}部署日志: /var/www/aimarket/logs/${NC}"
    echo -e "${GREEN}========================================${NC}"
}

# 错误处理
trap 'echo -e "${RED}部署过程中发生错误，请检查日志${NC}"; exit 1' ERR

# 执行主函数
main "$@"
```

## 🔄 数据库迁移脚本

```bash
#!/bin/bash
# database-setup.sh - 数据库初始化脚本

echo "初始化AI创意交易市场数据库..."

# 数据库配置
DB_HOST=${DB_HOST:-"your-rds-host.mysql.rds.aliyuncs.com"}
DB_USER=${DB_USER:-"aimarket"}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME:-"aimarket_prod"}

# 连接数据库并创建表结构
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME << 'EOF'
-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    credits INT DEFAULT 1000,
    level ENUM('bronze', 'silver', 'gold') DEFAULT 'bronze',
    status ENUM('active', 'banned') DEFAULT 'active',
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_phone (phone)
);

-- 用户会话表
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id INT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_expires (expires_at)
);

-- 创意表
CREATE TABLE IF NOT EXISTS ideas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category ENUM('tech', 'lifestyle', 'education', 'health', 'finance', 'entertainment', 'business', 'art') NOT NULL,
    author_id INT NOT NULL,
    status ENUM('pending', 'bidding', 'completed', 'cancelled') DEFAULT 'pending',
    ai_score DECIMAL(3,1) DEFAULT 0,
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    tags JSON,
    attachments JSON,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id),
    INDEX idx_category (category),
    INDEX idx_author (author_id),
    INDEX idx_status (status),
    INDEX idx_score (ai_score),
    FULLTEXT idx_title_desc (title, description)
);

-- AI竞价表
CREATE TABLE IF NOT EXISTS ai_bids (
    id INT PRIMARY KEY AUTO_INCREMENT,
    idea_id INT NOT NULL,
    ai_agent VARCHAR(50) NOT NULL,
    bid_amount INT NOT NULL,
    confidence DECIMAL(3,1) NOT NULL,
    analysis_result JSON,
    status ENUM('bidding', 'won', 'lost', 'cancelled') DEFAULT 'bidding',
    bid_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE CASCADE,
    INDEX idx_idea_id (idea_id),
    INDEX idx_agent (ai_agent),
    INDEX idx_status (status),
    INDEX idx_bid_time (bid_time)
);

-- 商业计划表
CREATE TABLE IF NOT EXISTS business_plans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    idea_id INT NOT NULL,
    user_id INT NOT NULL,
    plan_data JSON NOT NULL,
    generation_stages JSON,
    overall_score DECIMAL(3,1) DEFAULT 0,
    status ENUM('generating', 'completed', 'failed') DEFAULT 'generating',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_idea_id (idea_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
);

-- AI服务日志表
CREATE TABLE IF NOT EXISTS ai_service_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    service VARCHAR(50) NOT NULL,
    request_data JSON,
    response_data JSON,
    error_message TEXT,
    execution_time INT,
    status ENUM('success', 'error') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_service (service),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- AI使用统计表
CREATE TABLE IF NOT EXISTS ai_usage_stats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    service VARCHAR(50) NOT NULL,
    prompt_tokens INT DEFAULT 0,
    completion_tokens INT DEFAULT 0,
    total_tokens INT DEFAULT 0,
    cost DECIMAL(10,4) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_service (service),
    INDEX idx_created_at (created_at)
);

-- 积分交易记录表
CREATE TABLE IF NOT EXISTS credit_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    amount INT NOT NULL,
    type ENUM('earn', 'spend', 'refund') NOT NULL,
    description VARCHAR(255),
    related_id INT,
    related_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
);

-- 系统配置表
CREATE TABLE IF NOT EXISTS system_configs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (config_key)
);

-- 插入初始配置数据
INSERT IGNORE INTO system_configs (config_key, config_value, description) VALUES
('credits_per_yuan', '100', '1元对应积分数'),
('platform_fee_rate', '0.1', '平台手续费率'),
('idea_submission_cost', '10', '提交创意消耗积分'),
('business_plan_cost', '500', '生成商业计划消耗积分'),
('min_withdraw_amount', '1000', '最低提现积分'),
('max_daily_withdraw', '10000', '每日最大提现积分');

-- 创建视图：用户统计
CREATE OR REPLACE VIEW user_stats AS
SELECT
    u.id,
    u.username,
    u.credits,
    u.level,
    COUNT(DISTINCT i.id) as ideas_count,
    COUNT(DISTINCT bp.id) as business_plans_count,
    COALESCE(SUM(CASE WHEN ct.type = 'earn' THEN ct.amount ELSE 0 END), 0) as total_earned,
    COALESCE(SUM(CASE WHEN ct.type = 'spend' THEN ct.amount ELSE 0 END), 0) as total_spent
FROM users u
LEFT JOIN ideas i ON u.id = i.author_id
LEFT JOIN business_plans bp ON u.id = bp.user_id
LEFT JOIN credit_transactions ct ON u.id = ct.user_id
WHERE u.status = 'active'
GROUP BY u.id, u.username, u.credits, u.level;

COMMIT;
EOF

echo "数据库初始化完成！"
```

## 🔧 服务管理脚本

```bash
#!/bin/bash
# service-control.sh - 服务控制脚本

SERVICE_NAME="aimarket"
PROJECT_DIR="/var/www/aimarket"

case "$1" in
    start)
        echo "启动AI创意交易市场服务..."
        cd $PROJECT_DIR
        pm2 start ecosystem.config.js --env production
        pm2 save
        echo "服务启动完成"
        ;;
    stop)
        echo "停止AI创意交易市场服务..."
        pm2 stop $SERVICE_NAME
        echo "服务已停止"
        ;;
    restart)
        echo "重启AI创意交易市场服务..."
        cd $PROJECT_DIR
        pm2 restart $SERVICE_NAME
        echo "服务重启完成"
        ;;
    reload)
        echo "重载AI创意交易市场服务..."
        cd $PROJECT_DIR
        npm run build
        pm2 reload $SERVICE_NAME
        echo "服务重载完成"
        ;;
    status)
        echo "AI创意交易市场服务状态:"
        pm2 status $SERVICE_NAME
        ;;
    logs)
        echo "查看AI创意交易市场服务日志:"
        pm2 logs $SERVICE_NAME --lines 100
        ;;
    deploy)
        echo "部署最新代码..."
        cd $PROJECT_DIR
        git pull origin main
        npm ci --only=production
        npm run build
        pm2 reload $SERVICE_NAME
        echo "部署完成"
        ;;
    backup)
        echo "创建数据库备份..."
        BACKUP_DIR="/var/backups/aimarket"
        mkdir -p $BACKUP_DIR
        DATE=$(date +%Y%m%d_%H%M%S)

        # 数据库备份
        mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME > $BACKUP_DIR/database_$DATE.sql

        # 压缩备份文件
        gzip $BACKUP_DIR/database_$DATE.sql

        # 删除30天前的备份
        find $BACKUP_DIR -name "database_*.sql.gz" -mtime +30 -delete

        echo "数据库备份完成: $BACKUP_DIR/database_$DATE.sql.gz"
        ;;
    monitor)
        echo "系统监控信息:"
        echo "========================="
        echo "CPU使用率:"
        top -bn1 | grep "Cpu(s)" | awk '{print $2 $3}'
        echo "========================="
        echo "内存使用率:"
        free -m
        echo "========================="
        echo "磁盘使用率:"
        df -h
        echo "========================="
        echo "服务状态:"
        pm2 status
        echo "========================="
        ;;
    *)
        echo "使用方法: $0 {start|stop|restart|reload|status|logs|deploy|backup|monitor}"
        exit 1
        ;;
esac

exit 0
```

## 🔄 自动更新脚本

```bash
#!/bin/bash
# auto-update.sh - 自动更新部署脚本

LOG_FILE="/var/log/aimarket-update.log"
PROJECT_DIR="/var/www/aimarket"
BACKUP_DIR="/var/backups/aimarket"

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# 创建备份
create_backup() {
    log "创建备份..."

    # 创建备份目录
    mkdir -p $BACKUP_DIR
    DATE=$(date +%Y%m%d_%H%M%S)

    # 备份当前代码
    tar -czf $BACKUP_DIR/code_backup_$DATE.tar.gz -C /var/www aimarket

    # 备份数据库
    mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

    log "备份完成: $BACKUP_DIR/code_backup_$DATE.tar.gz"
}

# 更新代码
update_code() {
    log "更新代码..."
    cd $PROJECT_DIR

    # 拉取最新代码
    git fetch origin
    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse origin/main)

    if [ "$LOCAL" = "$REMOTE" ]; then
        log "代码已是最新版本"
        return 0
    fi

    log "发现新版本，开始更新..."
    git pull origin main

    # 安装依赖
    npm ci --only=production

    # 构建项目
    npm run build

    log "代码更新完成"
}

# 健康检查
health_check() {
    log "执行健康检查..."

    # 检查服务是否运行
    if ! pm2 describe aimarket > /dev/null; then
        log "错误: 服务未运行"
        return 1
    fi

    # 检查HTTP响应
    if ! curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        log "错误: 健康检查失败"
        return 1
    fi

    log "健康检查通过"
    return 0
}

# 回滚函数
rollback() {
    log "开始回滚..."

    # 停止服务
    pm2 stop aimarket

    # 找到最新的备份
    LATEST_BACKUP=$(ls -t $BACKUP_DIR/code_backup_*.tar.gz | head -n 1)

    if [ -z "$LATEST_BACKUP" ]; then
        log "错误: 未找到备份文件"
        exit 1
    fi

    # 恢复代码
    rm -rf $PROJECT_DIR
    tar -xzf $LATEST_BACKUP -C /var/www

    # 重启服务
    cd $PROJECT_DIR
    pm2 start ecosystem.config.js --env production

    log "回滚完成"
}

# 主函数
main() {
    log "开始自动更新..."

    # 创建备份
    create_backup

    # 更新代码
    if ! update_code; then
        log "代码更新失败"
        exit 1
    fi

    # 重新加载服务
    log "重载服务..."
    pm2 reload aimarket

    # 等待服务启动
    sleep 10

    # 健康检查
    if ! health_check; then
        log "健康检查失败，开始回滚..."
        rollback
        exit 1
    fi

    # 清理旧备份
    find $BACKUP_DIR -name "code_backup_*.tar.gz" -mtime +7 -delete
    find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete

    log "自动更新完成"
}

# 执行主函数
main "$@"
```

## 📊 监控脚本

```bash
#!/bin/bash
# monitor.sh - 系统监控脚本

ALERT_EMAIL="admin@yourdomain.com"
LOG_FILE="/var/log/aimarket-monitor.log"

# 发送告警
send_alert() {
    local subject="$1"
    local message="$2"

    # 发送邮件告警
    echo "$message" | mail -s "$subject" $ALERT_EMAIL

    # 记录日志
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ALERT: $subject - $message" >> $LOG_FILE
}

# CPU检查
check_cpu() {
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
    CPU_THRESHOLD=80

    if (( $(echo "$CPU_USAGE > $CPU_THRESHOLD" | bc -l) )); then
        send_alert "CPU使用率过高" "当前CPU使用率: ${CPU_USAGE}%"
    fi
}

# 内存检查
check_memory() {
    MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.2f", $3/$2 * 100.0)}')
    MEMORY_THRESHOLD=80

    if (( $(echo "$MEMORY_USAGE > $MEMORY_THRESHOLD" | bc -l) )); then
        send_alert "内存使用率过高" "当前内存使用率: ${MEMORY_USAGE}%"
    fi
}

# 磁盘检查
check_disk() {
    DISK_USAGE=$(df -h / | awk 'NR==2{print $5}' | sed 's/%//')
    DISK_THRESHOLD=80

    if [ $DISK_USAGE -gt $DISK_THRESHOLD ]; then
        send_alert "磁盘使用率过高" "当前磁盘使用率: ${DISK_USAGE}%"
    fi
}

# 服务检查
check_service() {
    if ! pm2 describe aimarket > /dev/null 2>&1; then
        send_alert "服务异常" "AI创意交易市场服务未运行"
        # 尝试重启服务
        pm2 start /var/www/aimarket/ecosystem.config.js --env production
    fi
}

# 数据库连接检查
check_database() {
    if ! mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -e "SELECT 1" > /dev/null 2>&1; then
        send_alert "数据库连接失败" "无法连接到MySQL数据库"
    fi
}

# API健康检查
check_api() {
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)

    if [ "$RESPONSE" != "200" ]; then
        send_alert "API健康检查失败" "API响应状态码: $RESPONSE"
    fi
}

# 主函数
main() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 开始系统监控..." >> $LOG_FILE

    check_cpu
    check_memory
    check_disk
    check_service
    check_database
    check_api

    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 系统监控完成" >> $LOG_FILE
}

# 运行监控
main "$@"
```

## ⚙️ 环境变量模板

```bash
# .env.production.template
# AI创意交易市场生产环境配置模板

# 应用基础配置
NODE_ENV=production
PORT=3000
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_nextauth_secret_here

# JWT配置
JWT_SECRET=your_jwt_secret_here

# 数据库配置
DATABASE_URL=mysql://user:password@host:3306/database
REDIS_URL=redis://user:password@host:6379

# 阿里云基础配置
ALIYUN_ACCESS_KEY_ID=your_access_key_id
ALIYUN_ACCESS_KEY_SECRET=your_access_key_secret
ALIYUN_OSS_BUCKET=aimarket-prod
ALIYUN_OSS_REGION=oss-cn-hangzhou

# AI服务配置
BAIDU_API_KEY=your_baidu_api_key
BAIDU_SECRET_KEY=your_baidu_secret_key
ALIBABA_DASHSCOPE_API_KEY=your_alibaba_api_key
IFLYTEK_APP_ID=your_iflytek_app_id
IFLYTEK_API_SECRET=your_iflytek_api_secret
TENCENT_SECRET_ID=your_tencent_secret_id
TENCENT_SECRET_KEY=your_tencent_secret_key
ZHIPU_API_KEY=your_zhipu_api_key

# 短信服务配置
ALIYUN_SMS_ACCESS_KEY=your_sms_access_key
ALIYUN_SMS_SECRET=your_sms_secret

# 邮件配置（可选）
SMTP_HOST=smtp.aliyun.com
SMTP_PORT=465
SMTP_USER=your_email@yourdomain.com
SMTP_PASS=your_email_password

# 监控配置（可选）
SENTRY_DSN=your_sentry_dsn
```

## 🎯 使用说明

### 部署步骤

1. **服务器准备**
   ```bash
   # 上传脚本到服务器
   scp deploy.sh root@your-server:/root/
   scp database-setup.sh root@your-server:/root/

   # 设置执行权限
   chmod +x deploy.sh database-setup.sh
   ```

2. **配置环境变量**
   ```bash
   # 设置必要的环境变量
   export DATABASE_URL="mysql://user:pass@host:3306/db"
   export JWT_SECRET="your_jwt_secret"
   # ... 其他环境变量
   ```

3. **执行部署**
   ```bash
   # 一键部署
   ./deploy.sh

   # 初始化数据库
   ./database-setup.sh
   ```

4. **配置定时任务**
   ```bash
   # 添加监控和备份定时任务
   crontab -e

   # 每5分钟执行一次系统监控
   */5 * * * * /root/monitor.sh

   # 每天2点执行数据库备份
   0 2 * * * /root/service-control.sh backup

   # 每天4点执行自动更新
   0 4 * * * /root/auto-update.sh
   ```

### 日常维护命令

```bash
# 查看服务状态
./service-control.sh status

# 查看服务日志
./service-control.sh logs

# 重启服务
./service-control.sh restart

# 部署最新代码
./service-control.sh deploy

# 系统监控
./service-control.sh monitor

# 数据库备份
./service-control.sh backup
```

---

**所有脚本都已配置错误处理和日志记录，确保生产环境的稳定性和可维护性。**