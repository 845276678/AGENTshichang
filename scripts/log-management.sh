#!/bin/bash
# ==========================================
# AI创意协作平台 - 生产环境日志管理脚本
# ==========================================

set -e

# 配置
LOG_BASE_DIR="/opt/ai-marketplace/logs"
ARCHIVE_DIR="/opt/ai-marketplace/logs/archive"
LOG_RETENTION_DAYS=90
ARCHIVE_RETENTION_DAYS=365
COMPRESS_THRESHOLD_DAYS=7

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

# 创建日志目录结构
create_log_structure() {
    log_info "创建日志目录结构..."

    mkdir -p "$LOG_BASE_DIR"/{app,nginx,system,security,audit,archive}
    mkdir -p "$LOG_BASE_DIR"/app/{access,error,performance,api}
    mkdir -p "$LOG_BASE_DIR"/nginx/{access,error}
    mkdir -p "$LOG_BASE_DIR"/system/{docker,cron,backup}
    mkdir -p "$LOG_BASE_DIR"/security/{fail2ban,ufw,auth}
    mkdir -p "$LOG_BASE_DIR"/audit/{db,config,user}

    # 设置权限
    chmod 755 "$LOG_BASE_DIR"
    chmod 644 "$LOG_BASE_DIR"/**/*.log 2>/dev/null || true

    log_info "日志目录结构创建完成"
}

# 配置logrotate
configure_logrotate() {
    log_info "配置日志轮转..."

    cat > /etc/logrotate.d/aijiayuan << 'EOF'
# AI创意协作平台日志轮转配置

/opt/ai-marketplace/logs/app/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 root root
    postrotate
        docker kill -s USR1 $(docker ps -q --filter ancestor=ai-agent-marketplace) 2>/dev/null || true
    endscript
}

/opt/ai-marketplace/logs/nginx/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 root root
    postrotate
        docker exec $(docker ps -q --filter ancestor=nginx) nginx -s reload 2>/dev/null || true
    endscript
}

/opt/ai-marketplace/logs/system/*.log {
    weekly
    missingok
    rotate 12
    compress
    delaycompress
    notifempty
    create 0644 root root
}

/opt/ai-marketplace/logs/security/*.log {
    daily
    missingok
    rotate 90
    compress
    delaycompress
    notifempty
    create 0644 root root
}

/opt/ai-marketplace/logs/audit/*.log {
    daily
    missingok
    rotate 365
    compress
    delaycompress
    notifempty
    create 0600 root root
}
EOF

    log_info "logrotate配置完成"
}

# 配置rsyslog
configure_rsyslog() {
    log_info "配置系统日志..."

    cat > /etc/rsyslog.d/30-aijiayuan.conf << 'EOF'
# AI创意协作平台系统日志配置

# 应用日志
:programname, isequal, "aijiayuan-app" /opt/ai-marketplace/logs/app/app.log
:programname, isequal, "aijiayuan-app" stop

# Docker日志
:programname, isequal, "dockerd" /opt/ai-marketplace/logs/system/docker.log
:programname, isequal, "dockerd" stop

# 认证日志
auth,authpriv.* /opt/ai-marketplace/logs/security/auth.log

# Cron日志
cron.* /opt/ai-marketplace/logs/system/cron.log

# 防火墙日志
:msg, contains, "[UFW" /opt/ai-marketplace/logs/security/ufw.log
:msg, contains, "[UFW" stop
EOF

    # 重启rsyslog
    systemctl restart rsyslog

    log_info "系统日志配置完成"
}

# 安装和配置日志分析工具
install_log_tools() {
    log_info "安装日志分析工具..."

    # 安装基础工具
    apt update
    apt install -y logwatch goaccess multitail ccze

    # 配置logwatch
    cat > /etc/logwatch/conf/logwatch.conf << 'EOF'
# AI创意协作平台logwatch配置
LogDir = /opt/ai-marketplace/logs
TmpDir = /var/cache/logwatch
MailTo = admin@aijiayuan.top
MailFrom = logwatch@aijiayuan.top
Print = Yes
Save = /opt/ai-marketplace/logs/system/logwatch-$(date +%Y%m%d).log
Range = yesterday
Detail = Med
Service = All
EOF

    log_info "日志分析工具安装完成"
}

# 日志清理
cleanup_logs() {
    log_info "清理过期日志..."

    local cleaned_files=0

    # 清理应用日志
    find "$LOG_BASE_DIR"/app -name "*.log" -mtime +$LOG_RETENTION_DAYS -type f -delete 2>/dev/null && ((cleaned_files++)) || true

    # 清理Nginx日志
    find "$LOG_BASE_DIR"/nginx -name "*.log" -mtime +$LOG_RETENTION_DAYS -type f -delete 2>/dev/null && ((cleaned_files++)) || true

    # 清理系统日志
    find "$LOG_BASE_DIR"/system -name "*.log" -mtime +$LOG_RETENTION_DAYS -type f -delete 2>/dev/null && ((cleaned_files++)) || true

    # 压缩旧日志
    find "$LOG_BASE_DIR" -name "*.log" -mtime +$COMPRESS_THRESHOLD_DAYS -type f -exec gzip {} \; 2>/dev/null || true

    # 清理归档日志
    find "$ARCHIVE_DIR" -name "*.gz" -mtime +$ARCHIVE_RETENTION_DAYS -type f -delete 2>/dev/null || true

    log_info "日志清理完成，清理了 $cleaned_files 个日志文件"
}

# 归档日志
archive_logs() {
    log_info "归档日志文件..."

    local archive_date=$(date +%Y%m%d)
    local archive_file="$ARCHIVE_DIR/logs_$archive_date.tar.gz"

    mkdir -p "$ARCHIVE_DIR"

    # 归档7天前的日志
    find "$LOG_BASE_DIR" -name "*.log" -mtime +7 -type f -exec tar -czf "$archive_file" {} + 2>/dev/null || true

    if [ -f "$archive_file" ]; then
        log_info "日志归档完成: $(basename "$archive_file")"
        # 删除已归档的原文件
        find "$LOG_BASE_DIR" -name "*.log" -mtime +7 -type f -delete 2>/dev/null || true
    fi
}

# 生成日志报告
generate_log_report() {
    log_info "生成日志分析报告..."

    local report_date=$(date +%Y%m%d)
    local report_file="$LOG_BASE_DIR/system/log_report_$report_date.html"

    # 生成Nginx访问日志报告
    if [ -f "$LOG_BASE_DIR/nginx/access.log" ]; then
        goaccess "$LOG_BASE_DIR/nginx/access.log" \
            --log-format=COMBINED \
            --output="$report_file" \
            --html-report-title="AI创意协作平台访问统计" \
            --date-format=%d/%b/%Y \
            --time-format=%H:%M:%S 2>/dev/null || true
    fi

    # 生成系统日志摘要
    cat > "$LOG_BASE_DIR/system/log_summary_$report_date.txt" << EOF
========================================
AI创意协作平台日志摘要 - $(date)
========================================

=== 错误统计 ===
应用错误: $(grep -c "ERROR" "$LOG_BASE_DIR"/app/*.log 2>/dev/null || echo "0")
Nginx错误: $(grep -c "error" "$LOG_BASE_DIR"/nginx/error.log 2>/dev/null || echo "0")
系统错误: $(grep -c "ERROR" "$LOG_BASE_DIR"/system/*.log 2>/dev/null || echo "0")

=== 安全事件 ===
SSH失败登录: $(grep -c "Failed password" /var/log/auth.log 2>/dev/null || echo "0")
Fail2ban封禁: $(grep -c "Ban" "$LOG_BASE_DIR"/security/fail2ban.log 2>/dev/null || echo "0")
防火墙阻断: $(grep -c "BLOCK" "$LOG_BASE_DIR"/security/ufw.log 2>/dev/null || echo "0")

=== 磁盘使用 ===
日志目录大小: $(du -sh "$LOG_BASE_DIR" | cut -f1)
归档目录大小: $(du -sh "$ARCHIVE_DIR" | cut -f1)

=== 服务状态 ===
应用容器状态: $(docker ps --filter ancestor=ai-agent-marketplace --format "table {{.Status}}" | tail -n +2)
数据库连接: $(docker run --rm mysql:8.0 mysql -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SELECT 'OK';" "$MYSQL_DATABASE" 2>/dev/null | tail -1 || echo "FAILED")

生成时间: $(date)
========================================
EOF

    log_info "日志报告生成完成: $report_file"
}

# 实时日志监控
monitor_logs() {
    log_info "启动实时日志监控..."

    # 使用multitail监控多个日志文件
    multitail \
        -ci green "$LOG_BASE_DIR/app/app.log" \
        -ci yellow "$LOG_BASE_DIR/nginx/access.log" \
        -ci red "$LOG_BASE_DIR/nginx/error.log" \
        -ci blue "$LOG_BASE_DIR/security/auth.log" \
        2>/dev/null || {
        log_warn "multitail不可用，使用tail -f"
        tail -f "$LOG_BASE_DIR"/app/*.log "$LOG_BASE_DIR"/nginx/*.log
    }
}

# 搜索日志
search_logs() {
    local search_term="$1"
    local log_type="$2"

    if [ -z "$search_term" ]; then
        log_error "请提供搜索关键词"
        return 1
    fi

    log_info "搜索日志: '$search_term'"

    case "$log_type" in
        "app")
            grep -r "$search_term" "$LOG_BASE_DIR"/app/ | ccze -A
            ;;
        "nginx")
            grep -r "$search_term" "$LOG_BASE_DIR"/nginx/ | ccze -A
            ;;
        "security")
            grep -r "$search_term" "$LOG_BASE_DIR"/security/ | ccze -A
            ;;
        *)
            grep -r "$search_term" "$LOG_BASE_DIR"/ | ccze -A
            ;;
    esac
}

# 日志健康检查
health_check() {
    log_info "执行日志健康检查..."

    # 检查日志目录大小
    local log_size=$(du -sb "$LOG_BASE_DIR" | cut -f1)
    local log_size_gb=$((log_size / 1024 / 1024 / 1024))

    if [ "$log_size_gb" -gt 10 ]; then
        log_warn "日志目录过大: ${log_size_gb}GB"
    fi

    # 检查日志轮转
    if [ ! -f /var/lib/logrotate/status ]; then
        log_warn "logrotate状态文件不存在"
    fi

    # 检查磁盘空间
    local disk_usage=$(df "$LOG_BASE_DIR" | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt 80 ]; then
        log_warn "日志分区磁盘使用率过高: ${disk_usage}%"
    fi

    log_info "日志健康检查完成"
}

# 显示帮助
show_help() {
    echo "AI创意协作平台 - 日志管理工具"
    echo ""
    echo "用法: $0 <命令> [参数]"
    echo ""
    echo "命令:"
    echo "  setup           初始化日志管理"
    echo "  cleanup         清理过期日志"
    echo "  archive         归档日志"
    echo "  report          生成日志报告"
    echo "  monitor         实时监控日志"
    echo "  search <term>   搜索日志内容"
    echo "  health          日志健康检查"
    echo "  help            显示帮助"
    echo ""
    echo "示例:"
    echo "  $0 setup"
    echo "  $0 cleanup"
    echo "  $0 search 'ERROR'"
    echo "  $0 monitor"
}

# 主函数
main() {
    case "$1" in
        "setup")
            create_log_structure
            configure_logrotate
            configure_rsyslog
            install_log_tools
            ;;
        "cleanup")
            cleanup_logs
            ;;
        "archive")
            archive_logs
            ;;
        "report")
            generate_log_report
            ;;
        "monitor")
            monitor_logs
            ;;
        "search")
            search_logs "$2" "$3"
            ;;
        "health")
            health_check
            ;;
        "help"|"--help"|"-h"|"")
            show_help
            ;;
        *)
            log_error "未知命令: $1"
            show_help
            exit 1
            ;;
    esac
}

# 检查root权限
if [ "$EUID" -ne 0 ] && [ "$1" = "setup" ]; then
    log_error "setup命令需要root权限"
    exit 1
fi

# 执行主函数
main "$@"