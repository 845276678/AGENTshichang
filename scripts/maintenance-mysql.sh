#!/bin/bash
# ==========================================
# AI创意协作平台 - aijiayuan.top MySQL版本维护工具
# ==========================================

set -e

# 配置
DEPLOY_PATH="/opt/ai-marketplace"
LOG_FILE="$DEPLOY_PATH/logs/maintenance.log"
COMPOSE_FILE="docker-compose.mysql.yml"

# MySQL配置
MYSQL_HOST="${DB_HOST:-8.137.153.81}"
MYSQL_PORT="${DB_PORT:-31369}"
MYSQL_USER="${DB_USER:-root}"
MYSQL_PASSWORD="${DB_PASSWORD:-Jk8Iq9ijPht04m6ud7G3N12wZVlEMvY5}"
MYSQL_DATABASE="${DB_NAME:-zeabur}"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# 日志函数
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARN:${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

# 显示使用帮助
show_help() {
    echo "AI创意协作平台 - aijiayuan.top MySQL版本维护工具"
    echo ""
    echo "用法: $0 <命令> [选项]"
    echo ""
    echo "可用命令:"
    echo "  status          显示服务状态"
    echo "  logs            查看服务日志"
    echo "  restart         重启所有服务"
    echo "  update          更新应用"
    echo "  backup          手动备份"
    echo "  cleanup         清理系统"
    echo "  ssl-renew       续期SSL证书"
    echo "  health-check    执行健康检查"
    echo "  mysql-check     检查MySQL连接"
    echo "  monitor         实时监控"
    echo ""
    echo "选项:"
    echo "  --help, -h      显示此帮助"
    echo "  --verbose, -v   详细输出"
    echo ""
    echo "示例:"
    echo "  $0 status"
    echo "  $0 logs --verbose"
    echo "  $0 mysql-check"
    echo "  $0 restart"
}

# 显示服务状态
show_status() {
    log "📊 检查 aijiayuan.top 服务状态 (MySQL版本)..."

    cd "$DEPLOY_PATH"

    echo ""
    echo "=== Docker 服务状态 ==="
    docker-compose -f "$COMPOSE_FILE" ps

    echo ""
    echo "=== MySQL 连接状态 ==="
    if docker run --rm mysql:8.0 mysql -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SELECT 'MySQL连接正常' as status, NOW() as time;" "$MYSQL_DATABASE" 2>/dev/null; then
        echo "✅ MySQL连接正常"
    else
        echo "❌ MySQL连接异常"
    fi

    echo ""
    echo "=== 系统资源使用 ==="
    echo "内存使用:"
    free -h
    echo ""
    echo "磁盘使用:"
    df -h "$DEPLOY_PATH"
    echo ""
    echo "Docker 资源使用:"
    docker system df

    echo ""
    echo "=== 网络连接状态 ==="
    if curl -s -f https://aijiayuan.top/api/health > /dev/null; then
        echo "✅ Web服务正常"
    else
        echo "❌ Web服务异常"
    fi

    echo ""
    echo "=== SSL证书状态 ==="
    if cert_info=$(echo | openssl s_client -connect aijiayuan.top:443 -servername aijiayuan.top 2>/dev/null | openssl x509 -noout -dates 2>/dev/null); then
        expire_date=$(echo "$cert_info" | grep "notAfter" | cut -d= -f2)
        echo "SSL证书过期时间: $expire_date"
    else
        echo "❌ SSL证书检查失败"
    fi
}

# 查看日志
show_logs() {
    local service="$1"
    local follow="${2:-false}"

    cd "$DEPLOY_PATH"

    if [ -n "$service" ]; then
        if [ "$follow" = "true" ]; then
            docker-compose -f "$COMPOSE_FILE" logs -f "$service"
        else
            docker-compose -f "$COMPOSE_FILE" logs --tail=100 "$service"
        fi
    else
        if [ "$follow" = "true" ]; then
            docker-compose -f "$COMPOSE_FILE" logs -f
        else
            docker-compose -f "$COMPOSE_FILE" logs --tail=50
        fi
    fi
}

# 重启服务
restart_services() {
    log "🔄 重启 aijiayuan.top 服务..."

    cd "$DEPLOY_PATH"

    log "停止服务..."
    docker-compose -f "$COMPOSE_FILE" down

    log "启动服务..."
    docker-compose -f "$COMPOSE_FILE" up -d

    log "等待服务启动..."
    sleep 30

    log "验证MySQL连接..."
    if docker run --rm mysql:8.0 mysql -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SELECT 1;" "$MYSQL_DATABASE" &>/dev/null; then
        log "✅ MySQL连接正常"
    else
        log_error "❌ MySQL连接失败"
    fi

    log "验证服务状态..."
    if curl -s -f https://aijiayuan.top/api/health > /dev/null; then
        log "✅ 服务重启成功"
    else
        log_error "❌ 服务重启后健康检查失败"
        exit 1
    fi
}

# 更新应用
update_application() {
    log "🚀 更新 aijiayuan.top 应用..."

    cd "$DEPLOY_PATH"

    # 备份当前版本
    log "创建更新前备份..."
    ./scripts/backup-mysql.sh

    # 拉取最新代码（如果是git部署）
    if [ -d ".git" ]; then
        log "拉取最新代码..."
        git pull
    fi

    # 重新构建镜像
    log "重新构建应用镜像..."
    docker build -t ai-agent-marketplace:latest .

    # 滚动更新
    log "执行滚动更新..."
    docker-compose -f "$COMPOSE_FILE" up -d --no-deps app

    # 等待服务启动
    log "等待服务启动..."
    sleep 15

    # 验证更新
    log "验证更新..."
    if curl -s -f https://aijiayuan.top/api/health > /dev/null; then
        log "✅ 应用更新完成"
    else
        log_error "❌ 应用更新后健康检查失败"
        exit 1
    fi
}

# 手动备份
manual_backup() {
    log "💾 执行手动备份..."
    cd "$DEPLOY_PATH"
    ./scripts/backup-mysql.sh
}

# 清理系统
cleanup_system() {
    log "🧹 清理 aijiayuan.top 系统..."

    cd "$DEPLOY_PATH"

    # 清理Docker资源
    log "清理Docker未使用资源..."
    docker system prune -f

    # 清理旧日志
    log "清理旧日志..."
    find logs/ -name "*.log" -mtime +30 -delete 2>/dev/null || true

    # 清理临时文件
    log "清理临时文件..."
    find /tmp -name "*aijiayuan*" -mtime +1 -delete 2>/dev/null || true

    log "✅ 系统清理完成"
}

# 续期SSL证书
renew_ssl() {
    log "🔒 续期SSL证书..."

    certbot renew --quiet

    if [ $? -eq 0 ]; then
        log "重启Nginx以应用新证书..."
        docker-compose -f "$DEPLOY_PATH/$COMPOSE_FILE" restart nginx
        log "✅ SSL证书续期成功"
    else
        log_error "❌ SSL证书续期失败"
        exit 1
    fi
}

# 执行健康检查
run_health_check() {
    log "🔍 执行健康检查..."
    cd "$DEPLOY_PATH"
    ./scripts/health-check-mysql.sh
}

# 检查MySQL连接
check_mysql() {
    log "🗄️ 检查MySQL连接..."
    cd "$DEPLOY_PATH"
    ./scripts/test-mysql-connection.sh
}

# 实时监控
real_time_monitor() {
    log "📈 启动实时监控..."

    while true; do
        clear
        echo "==============================================="
        echo "  aijiayuan.top 实时监控 (MySQL版本) - $(date)"
        echo "==============================================="
        echo ""

        # CPU和内存
        echo "=== 系统资源 ==="
        top -bn1 | head -5

        echo ""
        echo "=== Docker容器状态 ==="
        docker-compose -f "$DEPLOY_PATH/$COMPOSE_FILE" ps

        echo ""
        echo "=== MySQL连接状态 ==="
        if docker run --rm mysql:8.0 mysql -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SELECT 'OK' as status;" "$MYSQL_DATABASE" 2>/dev/null | tail -1 | grep -q "OK"; then
            echo "✅ MySQL连接正常"
        else
            echo "❌ MySQL连接异常"
        fi

        echo ""
        echo "=== Web服务状态 ==="
        if curl -s -f https://aijiayuan.top/api/health > /dev/null; then
            echo "✅ aijiayuan.top 服务正常"
        else
            echo "❌ aijiayuan.top 服务异常"
        fi

        echo ""
        echo "按 Ctrl+C 退出监控"
        sleep 5
    done
}

# 主函数
main() {
    case "$1" in
        "status")
            show_status
            ;;
        "logs")
            if [ "$2" = "--follow" ] || [ "$2" = "-f" ]; then
                show_logs "$3" "true"
            else
                show_logs "$2" "false"
            fi
            ;;
        "restart")
            restart_services
            ;;
        "update")
            update_application
            ;;
        "backup")
            manual_backup
            ;;
        "cleanup")
            cleanup_system
            ;;
        "ssl-renew")
            renew_ssl
            ;;
        "health-check")
            run_health_check
            ;;
        "mysql-check")
            check_mysql
            ;;
        "monitor")
            real_time_monitor
            ;;
        "--help"|"-h"|"help"|"")
            show_help
            ;;
        *)
            echo "未知命令: $1"
            echo "使用 $0 --help 查看可用命令"
            exit 1
            ;;
    esac
}

# 创建日志目录
mkdir -p "$(dirname "$LOG_FILE")"

# 详细模式
if [ "$2" = "--verbose" ] || [ "$2" = "-v" ]; then
    set -x
fi

# 执行主函数
main "$@"