#!/bin/bash
# ==========================================
# AI创意协作平台 - 容灾恢复脚本
# ==========================================

set -e

# 配置
BACKUP_DIR="/opt/ai-marketplace/backups"
RESTORE_DIR="/opt/ai-marketplace-restore"
LOG_FILE="/opt/ai-marketplace/logs/disaster-recovery.log"

# MySQL配置
MYSQL_HOST="${DB_HOST:-8.137.153.81}"
MYSQL_PORT="${DB_PORT:-30183}"
MYSQL_USER="${DB_USER:-root}"
MYSQL_PASSWORD="${DB_PASSWORD:-mw7Wf5Dsv0946qr8PNaHQBMjY123Xugy}"
MYSQL_DATABASE="${DB_NAME:-zeabur}"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

# 显示可用备份
list_backups() {
    log_info "可用备份列表:"
    ls -lh "$BACKUP_DIR"/aijiayuan_*backup_*.tar.gz 2>/dev/null | nl
}

# 选择备份文件
select_backup() {
    list_backups

    echo ""
    read -p "请输入要恢复的备份编号: " backup_num

    backup_file=$(ls -1 "$BACKUP_DIR"/aijiayuan_*backup_*.tar.gz 2>/dev/null | sed -n "${backup_num}p")

    if [ -z "$backup_file" ]; then
        log_error "无效的备份编号"
        exit 1
    fi

    echo "$backup_file"
}

# 验证备份完整性
verify_backup() {
    local backup_file="$1"

    log_info "验证备份文件完整性: $(basename "$backup_file")"

    if [ ! -f "$backup_file" ]; then
        log_error "备份文件不存在: $backup_file"
        return 1
    fi

    # 检查文件大小
    local file_size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file" 2>/dev/null)
    if [ "$file_size" -lt 1000000 ]; then  # 小于1MB可能有问题
        log_warn "备份文件大小可能异常: $(du -h "$backup_file" | cut -f1)"
    fi

    # 测试压缩文件完整性
    if tar -tzf "$backup_file" >/dev/null 2>&1; then
        log_info "✅ 备份文件完整性验证通过"
        return 0
    else
        log_error "❌ 备份文件损坏"
        return 1
    fi
}

# 解压备份文件
extract_backup() {
    local backup_file="$1"

    log_info "解压备份文件..."

    mkdir -p "$RESTORE_DIR"
    cd "$RESTORE_DIR"

    tar -xzf "$backup_file"

    # 查找解压后的目录
    local extracted_dir=$(find . -name "aijiayuan_*backup_*" -type d | head -1)
    if [ -n "$extracted_dir" ]; then
        echo "$extracted_dir"
    else
        log_error "无法找到解压后的备份目录"
        exit 1
    fi
}

# 恢复MySQL数据库
restore_mysql() {
    local backup_dir="$1"
    local sql_file="$backup_dir/mysql_database.sql"

    log_info "恢复MySQL数据库..."

    if [ ! -f "$sql_file" ]; then
        log_error "数据库备份文件不存在: $sql_file"
        return 1
    fi

    # 备份当前数据库
    log_info "备份当前数据库..."
    docker run --rm mysql:8.0 mysqldump -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" \
        --single-transaction --routines --triggers --events \
        "$MYSQL_DATABASE" > "$RESTORE_DIR/current_database_backup_$(date +%Y%m%d_%H%M%S).sql"

    # 恢复数据库
    log_info "恢复数据库..."
    if docker run --rm -i mysql:8.0 mysql -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" < "$sql_file"; then
        log_info "✅ 数据库恢复成功"
    else
        log_error "❌ 数据库恢复失败"
        return 1
    fi
}

# 恢复Redis数据
restore_redis() {
    local backup_dir="$1"
    local redis_file="$backup_dir/dump.rdb"

    log_info "恢复Redis数据..."

    if [ ! -f "$redis_file" ]; then
        log_warn "Redis备份文件不存在，跳过Redis恢复"
        return 0
    fi

    # 停止Redis服务
    docker-compose -f /opt/ai-marketplace/docker-compose*.yml stop redis

    # 复制Redis数据文件
    docker run --rm -v redis_data:/data -v "$backup_dir":/backup alpine cp /backup/dump.rdb /data/

    # 启动Redis服务
    docker-compose -f /opt/ai-marketplace/docker-compose*.yml start redis

    log_info "✅ Redis数据恢复完成"
}

# 恢复应用数据
restore_app_data() {
    local backup_dir="$1"

    log_info "恢复应用数据..."

    # 恢复应用日志
    if [ -f "$backup_dir/app_logs.tar.gz" ]; then
        docker run --rm -v app_logs:/target -v "$backup_dir":/backup alpine sh -c "cd /target && tar xzf /backup/app_logs.tar.gz"
        log_info "✅ 应用日志恢复完成"
    fi

    # 恢复上传文件
    if [ -f "$backup_dir/app_uploads.tar.gz" ]; then
        docker run --rm -v app_uploads:/target -v "$backup_dir":/backup alpine sh -c "cd /target && tar xzf /backup/app_uploads.tar.gz"
        log_info "✅ 上传文件恢复完成"
    fi
}

# 恢复配置文件
restore_configs() {
    local backup_dir="$1"

    log_info "恢复配置文件..."

    cd /opt/ai-marketplace

    # 备份当前配置
    mkdir -p backup_current_$(date +%Y%m%d_%H%M%S)
    cp .env* backup_current_$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || true
    cp -r docker/ backup_current_$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || true

    # 恢复环境配置
    if [ -f "$backup_dir/env_production" ]; then
        cp "$backup_dir/env_production" .env
        log_info "✅ 环境配置恢复完成"
    fi

    # 恢复Docker配置
    if [ -f "$backup_dir/docker_configs.tar.gz" ]; then
        tar xzf "$backup_dir/docker_configs.tar.gz"
        log_info "✅ Docker配置恢复完成"
    fi

    # 恢复SSL证书
    if [ -f "$backup_dir/ssl_certificates.tar.gz" ]; then
        tar xzf "$backup_dir/ssl_certificates.tar.gz"
        log_info "✅ SSL证书恢复完成"
    fi
}

# 恢复监控数据
restore_monitoring() {
    local backup_dir="$1"

    log_info "恢复监控数据..."

    # 停止监控服务
    docker-compose -f /opt/ai-marketplace/docker-compose*.yml stop prometheus grafana

    # 恢复Prometheus数据
    if [ -f "$backup_dir/prometheus_data.tar.gz" ]; then
        docker run --rm -v prometheus_data:/target -v "$backup_dir":/backup alpine sh -c "cd /target && tar xzf /backup/prometheus_data.tar.gz"
        log_info "✅ Prometheus数据恢复完成"
    fi

    # 恢复Grafana数据
    if [ -f "$backup_dir/grafana_data.tar.gz" ]; then
        docker run --rm -v grafana_data:/target -v "$backup_dir":/backup alpine sh -c "cd /target && tar xzf /backup/grafana_data.tar.gz"
        log_info "✅ Grafana数据恢复完成"
    fi

    # 启动监控服务
    docker-compose -f /opt/ai-marketplace/docker-compose*.yml start prometheus grafana
}

# 验证恢复结果
verify_restore() {
    log_info "验证恢复结果..."

    # 等待服务启动
    sleep 30

    # 检查数据库连接
    if docker run --rm mysql:8.0 mysql -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SELECT 1;" "$MYSQL_DATABASE" &>/dev/null; then
        log_info "✅ 数据库连接正常"
    else
        log_error "❌ 数据库连接失败"
        return 1
    fi

    # 检查应用健康状态
    if curl -s -f https://aijiayuan.top/api/health > /dev/null; then
        log_info "✅ 应用健康检查通过"
    else
        log_error "❌ 应用健康检查失败"
        return 1
    fi

    log_info "🎉 容灾恢复验证完成！"
}

# 完整恢复流程
full_restore() {
    log_info "=========================================="
    log_info "🚨 开始容灾恢复流程"
    log_info "=========================================="

    # 选择备份
    local backup_file=$(select_backup)
    log_info "选择的备份文件: $(basename "$backup_file")"

    # 确认操作
    echo ""
    log_warn "⚠️  警告: 此操作将覆盖当前所有数据！"
    read -p "确定要继续吗？(输入 'yes' 确认): " confirm

    if [ "$confirm" != "yes" ]; then
        log_info "操作已取消"
        exit 0
    fi

    # 验证备份
    if ! verify_backup "$backup_file"; then
        exit 1
    fi

    # 解压备份
    local backup_dir=$(extract_backup "$backup_file")
    backup_dir="$RESTORE_DIR/$backup_dir"

    # 停止应用服务
    log_info "停止应用服务..."
    cd /opt/ai-marketplace
    docker-compose -f docker-compose*.yml stop app nginx

    # 执行恢复
    restore_mysql "$backup_dir"
    restore_redis "$backup_dir"
    restore_app_data "$backup_dir"
    restore_configs "$backup_dir"
    restore_monitoring "$backup_dir"

    # 启动服务
    log_info "启动所有服务..."
    docker-compose -f docker-compose*.yml up -d

    # 验证恢复
    verify_restore

    log_info "=========================================="
    log_info "🎉 容灾恢复完成！"
    log_info "=========================================="
    echo
    log_info "恢复摘要:"
    echo "  - 备份文件: $(basename "$backup_file")"
    echo "  - 恢复时间: $(date)"
    echo "  - 应用地址: https://aijiayuan.top"
    echo "  - 监控地址: http://47.108.90.221:3001"
    echo
    log_info "请验证应用功能是否正常！"
}

# 快速数据库恢复
quick_db_restore() {
    log_info "快速数据库恢复模式..."

    local backup_file=$(select_backup)

    if ! verify_backup "$backup_file"; then
        exit 1
    fi

    local backup_dir=$(extract_backup "$backup_file")
    backup_dir="$RESTORE_DIR/$backup_dir"

    restore_mysql "$backup_dir"

    log_info "✅ 数据库快速恢复完成"
}

# 显示帮助
show_help() {
    echo "AI创意协作平台 - 容灾恢复工具"
    echo ""
    echo "用法: $0 <命令>"
    echo ""
    echo "命令:"
    echo "  full-restore    完整恢复 (数据库+文件+配置)"
    echo "  db-restore      仅恢复数据库"
    echo "  list-backups    列出可用备份"
    echo "  verify <file>   验证备份文件"
    echo "  help            显示帮助"
    echo ""
    echo "示例:"
    echo "  $0 list-backups"
    echo "  $0 full-restore"
    echo "  $0 db-restore"
}

# 主函数
main() {
    mkdir -p "$(dirname "$LOG_FILE")"

    case "$1" in
        "full-restore")
            full_restore
            ;;
        "db-restore")
            quick_db_restore
            ;;
        "list-backups")
            list_backups
            ;;
        "verify")
            if [ -n "$2" ]; then
                verify_backup "$2"
            else
                log_error "请指定备份文件路径"
                exit 1
            fi
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

# 执行主函数
main "$@"