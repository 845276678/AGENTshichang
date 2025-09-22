#!/bin/bash
# ==========================================
# AI创意协作平台 - aijiayuan.top 健康检查脚本
# ==========================================

set -e

# 配置
DOMAIN="aijiayuan.top"
SERVER_IP="47.108.90.221"
LOG_FILE="/opt/ai-marketplace/logs/health-check.log"
ALERT_THRESHOLD=3  # 连续失败次数阈值
STATUS_FILE="/tmp/health-check-status"

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

log_debug() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] DEBUG:${NC} $1" | tee -a "$LOG_FILE"
}

# 创建日志目录
mkdir -p "$(dirname "$LOG_FILE")"

# 初始化状态文件
[ ! -f "$STATUS_FILE" ] && echo "0" > "$STATUS_FILE"

# 检查Web服务
check_web_service() {
    log_debug "检查Web服务..."

    local status_code
    local response_time

    # 检查HTTP响应
    if response=$(curl -s -w "%{http_code}:%{time_total}" -o /dev/null "https://$DOMAIN" 2>/dev/null); then
        status_code=$(echo "$response" | cut -d: -f1)
        response_time=$(echo "$response" | cut -d: -f2)

        if [ "$status_code" -eq 200 ]; then
            log "✅ Web服务正常 (响应码: $status_code, 响应时间: ${response_time}s)"
            return 0
        else
            log_error "❌ Web服务异常 (响应码: $status_code)"
            return 1
        fi
    else
        log_error "❌ Web服务无法访问"
        return 1
    fi
}

# 检查API健康状态
check_api_health() {
    log_debug "检查API健康状态..."

    if response=$(curl -s -f "https://$DOMAIN/api/health" 2>/dev/null); then
        # 解析JSON响应（简单检查）
        if echo "$response" | grep -q '"status".*"ok"'; then
            log "✅ API健康检查通过"
            return 0
        else
            log_error "❌ API健康检查失败: $response"
            return 1
        fi
    else
        log_error "❌ API健康检查无法访问"
        return 1
    fi
}

# 检查SSL证书
check_ssl_certificate() {
    log_debug "检查SSL证书..."

    if cert_info=$(echo | openssl s_client -connect "$DOMAIN:443" -servername "$DOMAIN" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null); then
        # 提取过期时间
        expire_date=$(echo "$cert_info" | grep "notAfter" | cut -d= -f2)
        expire_timestamp=$(date -d "$expire_date" +%s 2>/dev/null || echo "0")
        current_timestamp=$(date +%s)
        days_left=$(( (expire_timestamp - current_timestamp) / 86400 ))

        if [ "$days_left" -gt 30 ]; then
            log "✅ SSL证书正常 (还有 $days_left 天过期)"
            return 0
        elif [ "$days_left" -gt 7 ]; then
            log_warn "⚠️ SSL证书即将过期 (还有 $days_left 天)"
            return 0
        else
            log_error "❌ SSL证书即将过期 (还有 $days_left 天)"
            return 1
        fi
    else
        log_error "❌ SSL证书检查失败"
        return 1
    fi
}

# 检查数据库连接
check_database() {
    log_debug "检查数据库连接..."

    if docker exec ai-marketplace-postgres-primary pg_isready -U postgres -d ai_marketplace >/dev/null 2>&1; then
        log "✅ 数据库连接正常"
        return 0
    else
        log_error "❌ 数据库连接失败"
        return 1
    fi
}

# 检查Redis连接
check_redis() {
    log_debug "检查Redis连接..."

    if docker exec ai-marketplace-redis redis-cli ping >/dev/null 2>&1; then
        log "✅ Redis连接正常"
        return 0
    else
        log_error "❌ Redis连接失败"
        return 1
    fi
}

# 检查Docker服务状态
check_docker_services() {
    log_debug "检查Docker服务状态..."

    local failed_services=()

    # 检查主要服务
    for service in app postgres-primary redis nginx; do
        if docker-compose -f /opt/ai-marketplace/docker-compose.prod.yml ps "$service" | grep -q "Up"; then
            log_debug "✅ $service 服务运行正常"
        else
            log_error "❌ $service 服务异常"
            failed_services+=("$service")
        fi
    done

    if [ ${#failed_services[@]} -eq 0 ]; then
        log "✅ 所有Docker服务运行正常"
        return 0
    else
        log_error "❌ 以下服务异常: ${failed_services[*]}"
        return 1
    fi
}

# 检查系统资源
check_system_resources() {
    log_debug "检查系统资源..."

    # 检查磁盘空间
    local disk_usage=$(df /opt/ai-marketplace | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$disk_usage" -lt 80 ]; then
        log "✅ 磁盘使用率正常 ($disk_usage%)"
    elif [ "$disk_usage" -lt 90 ]; then
        log_warn "⚠️ 磁盘使用率较高 ($disk_usage%)"
    else
        log_error "❌ 磁盘使用率过高 ($disk_usage%)"
        return 1
    fi

    # 检查内存使用
    local mem_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    if [ "$mem_usage" -lt 80 ]; then
        log "✅ 内存使用率正常 ($mem_usage%)"
    elif [ "$mem_usage" -lt 90 ]; then
        log_warn "⚠️ 内存使用率较高 ($mem_usage%)"
    else
        log_error "❌ 内存使用率过高 ($mem_usage%)"
        return 1
    fi

    return 0
}

# 发送告警通知
send_alert() {
    local message="$1"
    local level="$2"

    log "📢 发送告警通知: $message"

    # 这里可以集成多种通知方式
    # 例如：微信、邮件、钉钉等

    # 示例：写入告警日志
    echo "[$(date)] [$level] $message" >> "/opt/ai-marketplace/logs/alerts.log"
}

# 主健康检查流程
main() {
    log "=========================================="
    log "🔍 开始 aijiayuan.top 健康检查"
    log "=========================================="

    local check_passed=0
    local total_checks=7

    # 执行各项检查
    check_web_service && ((check_passed++))
    check_api_health && ((check_passed++))
    check_ssl_certificate && ((check_passed++))
    check_database && ((check_passed++))
    check_redis && ((check_passed++))
    check_docker_services && ((check_passed++))
    check_system_resources && ((check_passed++))

    # 计算健康评分
    local health_score=$((check_passed * 100 / total_checks))

    log "=========================================="
    log "🎯 健康检查结果: $check_passed/$total_checks 项通过"
    log "📊 健康评分: $health_score%"

    # 读取上次失败次数
    local failure_count=$(cat "$STATUS_FILE" 2>/dev/null || echo "0")

    if [ "$health_score" -ge 80 ]; then
        log "✅ 系统整体状态良好"
        echo "0" > "$STATUS_FILE"  # 重置失败计数
        exit 0
    elif [ "$health_score" -ge 60 ]; then
        log_warn "⚠️ 系统存在部分问题，但仍可用"
        failure_count=$((failure_count + 1))
        echo "$failure_count" > "$STATUS_FILE"

        if [ "$failure_count" -ge "$ALERT_THRESHOLD" ]; then
            send_alert "aijiayuan.top 系统持续出现问题，健康评分: $health_score%" "WARNING"
        fi
        exit 1
    else
        log_error "❌ 系统存在严重问题"
        failure_count=$((failure_count + 1))
        echo "$failure_count" > "$STATUS_FILE"

        if [ "$failure_count" -ge "$ALERT_THRESHOLD" ]; then
            send_alert "aijiayuan.top 系统出现严重问题，健康评分: $health_score%" "CRITICAL"
        fi
        exit 2
    fi
}

# 显示使用帮助
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "aijiayuan.top 健康检查脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  --help, -h     显示此帮助信息"
    echo "  --verbose, -v  详细输出"
    echo ""
    echo "检查项目:"
    echo "  - Web服务可用性"
    echo "  - API健康状态"
    echo "  - SSL证书有效性"
    echo "  - 数据库连接"
    echo "  - Redis连接"
    echo "  - Docker服务状态"
    echo "  - 系统资源使用"
    exit 0
fi

# 详细模式
if [ "$1" = "--verbose" ] || [ "$1" = "-v" ]; then
    set -x
fi

# 执行主流程
main