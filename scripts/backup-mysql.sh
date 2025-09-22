#!/bin/bash
# ==========================================
# AI创意协作平台 - aijiayuan.top MySQL备份脚本
# ==========================================

set -e

# 配置
BACKUP_DIR="/opt/ai-marketplace/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="aijiayuan_mysql_backup_${DATE}"
RETENTION_DAYS=7
LOG_FILE="/opt/ai-marketplace/logs/backup.log"

# MySQL配置 (从环境变量读取)
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

# 创建备份目录结构
mkdir -p "$BACKUP_DIR/$BACKUP_NAME"
mkdir -p "$(dirname "$LOG_FILE")"

log "🚀 开始备份 aijiayuan.top AI创意协作平台 (MySQL版本)..."

# 检查MySQL连接
check_mysql_connection() {
    log "🔍 检查MySQL连接..."

    if command -v mysql &> /dev/null; then
        if mysql -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SELECT 1;" "$MYSQL_DATABASE" &>/dev/null; then
            log "✅ MySQL连接正常"
            return 0
        else
            log_error "❌ MySQL连接失败"
            return 1
        fi
    else
        # 使用Docker中的MySQL客户端
        if docker run --rm mysql:8.0 mysql -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SELECT 1;" "$MYSQL_DATABASE" &>/dev/null; then
            log "✅ MySQL连接正常 (通过Docker)"
            return 0
        else
            log_error "❌ MySQL连接失败"
            return 1
        fi
    fi
}

# 备份MySQL数据库
backup_mysql_database() {
    log "🗄️ 备份MySQL数据库..."

    local backup_file="$BACKUP_DIR/$BACKUP_NAME/mysql_database.sql"

    # 尝试使用本地mysqldump
    if command -v mysqldump &> /dev/null; then
        if mysqldump -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" \
            --single-transaction --routines --triggers --events \
            "$MYSQL_DATABASE" > "$backup_file"; then
            log "✅ MySQL数据库备份完成 (本地mysqldump)"
        else
            log_error "❌ MySQL数据库备份失败"
            return 1
        fi
    else
        # 使用Docker中的mysqldump
        if docker run --rm mysql:8.0 mysqldump -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" \
            --single-transaction --routines --triggers --events \
            "$MYSQL_DATABASE" > "$backup_file"; then
            log "✅ MySQL数据库备份完成 (Docker mysqldump)"
        else
            log_error "❌ MySQL数据库备份失败"
            return 1
        fi
    fi

    # 验证备份文件
    if [ -s "$backup_file" ]; then
        local file_size=$(du -h "$backup_file" | cut -f1)
        log "数据库备份文件大小: $file_size"
    else
        log_error "备份文件为空或不存在"
        return 1
    fi
}

# 备份Redis数据
backup_redis() {
    log "🔴 备份Redis数据..."

    if docker ps | grep -q "ai-marketplace.*redis"; then
        local redis_container=$(docker ps --format "table {{.Names}}" | grep "ai-marketplace.*redis" | head -1)
        if docker exec "$redis_container" redis-cli BGSAVE; then
            sleep 5  # 等待后台保存完成
            if docker cp "$redis_container":/data/dump.rdb "$BACKUP_DIR/$BACKUP_NAME/"; then
                log "✅ Redis备份完成"
            else
                log_warn "⚠️ Redis备份文件复制失败"
            fi
        else
            log_warn "⚠️ Redis后台保存失败"
        fi
    else
        log_warn "⚠️ Redis容器未找到，跳过Redis备份"
    fi
}

# 备份应用数据卷
backup_volumes() {
    log "📁 备份应用数据卷..."

    # 应用日志
    if docker volume inspect app_logs > /dev/null 2>&1; then
        docker run --rm \
            -v app_logs:/source:ro \
            -v "$BACKUP_DIR/$BACKUP_NAME":/backup \
            alpine tar czf /backup/app_logs.tar.gz -C /source . 2>/dev/null || log_warn "应用日志备份失败"
        log "✅ 应用日志备份完成"
    fi

    # 上传文件
    if docker volume inspect app_uploads > /dev/null 2>&1; then
        docker run --rm \
            -v app_uploads:/source:ro \
            -v "$BACKUP_DIR/$BACKUP_NAME":/backup \
            alpine tar czf /backup/app_uploads.tar.gz -C /source . 2>/dev/null || log_warn "上传文件备份失败"
        log "✅ 上传文件备份完成"
    fi
}

# 备份监控数据
backup_monitoring() {
    log "📊 备份监控数据..."

    # Prometheus数据
    if docker volume inspect prometheus_data > /dev/null 2>&1; then
        docker run --rm \
            -v prometheus_data:/source:ro \
            -v "$BACKUP_DIR/$BACKUP_NAME":/backup \
            alpine tar czf /backup/prometheus_data.tar.gz -C /source . 2>/dev/null || log_warn "Prometheus数据备份失败"
        log "✅ Prometheus数据备份完成"
    fi

    # Grafana数据
    if docker volume inspect grafana_data > /dev/null 2>&1; then
        docker run --rm \
            -v grafana_data:/source:ro \
            -v "$BACKUP_DIR/$BACKUP_NAME":/backup \
            alpine tar czf /backup/grafana_data.tar.gz -C /source . 2>/dev/null || log_warn "Grafana数据备份失败"
        log "✅ Grafana数据备份完成"
    fi
}

# 备份配置文件
backup_configs() {
    log "⚙️ 备份配置文件..."

    # 复制环境配置
    cp .env "$BACKUP_DIR/$BACKUP_NAME/env_production" 2>/dev/null || \
    cp .env.production "$BACKUP_DIR/$BACKUP_NAME/" 2>/dev/null || \
    log_warn "环境配置文件未找到"

    # 备份Docker配置
    tar czf "$BACKUP_DIR/$BACKUP_NAME/docker_configs.tar.gz" docker/ 2>/dev/null || log_warn "Docker配置目录未找到"

    # 备份Docker Compose文件
    cp docker-compose*.yml "$BACKUP_DIR/$BACKUP_NAME/" 2>/dev/null || log_warn "Docker Compose文件未找到"

    # 备份脚本文件
    tar czf "$BACKUP_DIR/$BACKUP_NAME/scripts.tar.gz" scripts/ 2>/dev/null || log_warn "脚本目录未找到"
}

# 备份SSL证书
backup_ssl() {
    if [ -d "/opt/ai-marketplace/ssl" ]; then
        tar czf "$BACKUP_DIR/$BACKUP_NAME/ssl_certificates.tar.gz" -C /opt/ai-marketplace ssl/
        log "✅ SSL证书备份完成"
    fi
}

# 创建详细备份清单
create_manifest() {
    log "📋 创建备份清单..."
    cat > "$BACKUP_DIR/$BACKUP_NAME/backup_info.txt" << EOF
========================================
aijiayuan.top 备份信息 (MySQL版本)
========================================
备份时间: $(date)
备份版本: $BACKUP_NAME
服务器: 47.108.90.221
域名: aijiayuan.top
数据库: MySQL (Zeabur服务)

数据库信息:
- 主机: $MYSQL_HOST
- 端口: $MYSQL_PORT
- 数据库: $MYSQL_DATABASE
- 用户: $MYSQL_USER

包含内容:
- mysql_database.sql (MySQL数据库完整备份)
- dump.rdb (Redis数据备份)
- app_logs.tar.gz (应用运行日志)
- app_uploads.tar.gz (用户上传文件)
- prometheus_data.tar.gz (监控历史数据)
- grafana_data.tar.gz (监控面板配置)
- env_production (生产环境配置)
- docker_configs.tar.gz (Docker配置文件)
- docker-compose*.yml (容器编排配置)
- scripts.tar.gz (脚本文件)
- ssl_certificates.tar.gz (SSL证书文件)

备份大小: $(du -sh "$BACKUP_DIR/$BACKUP_NAME" | cut -f1)
========================================
EOF
}

# 验证备份完整性
verify_backup() {
    log "🔍 验证备份完整性..."
    local backup_files_count=$(find "$BACKUP_DIR/$BACKUP_NAME" -type f | wc -l)
    log "备份包含 $backup_files_count 个文件"

    # 检查关键文件
    if [ -f "$BACKUP_DIR/$BACKUP_NAME/mysql_database.sql" ]; then
        local sql_size=$(stat -f%z "$BACKUP_DIR/$BACKUP_NAME/mysql_database.sql" 2>/dev/null || stat -c%s "$BACKUP_DIR/$BACKUP_NAME/mysql_database.sql" 2>/dev/null || echo "0")
        if [ "$sql_size" -gt 1000 ]; then
            log "✅ MySQL备份文件完整性检查通过"
        else
            log_error "❌ MySQL备份文件可能损坏或为空"
            return 1
        fi
    else
        log_error "❌ MySQL备份文件不存在"
        return 1
    fi
}

# 压缩备份
compress_backup() {
    log "🗜️ 压缩备份包..."
    cd "$BACKUP_DIR"
    tar czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"
    rm -rf "$BACKUP_NAME"

    local final_size=$(du -sh "${BACKUP_NAME}.tar.gz" | cut -f1)
    log "✅ 最终备份大小: $final_size"
}

# 清理旧备份
cleanup_old_backups() {
    log "🧹 清理 ${RETENTION_DAYS} 天前的旧备份..."
    local deleted_count=$(find "$BACKUP_DIR" -name "aijiayuan_mysql_backup_*.tar.gz" -mtime +${RETENTION_DAYS} -type f | wc -l)
    find "$BACKUP_DIR" -name "aijiayuan_mysql_backup_*.tar.gz" -mtime +${RETENTION_DAYS} -delete
    log "已清理 $deleted_count 个旧备份文件"
}

# 显示备份列表
show_backup_list() {
    log "📦 当前备份列表:"
    ls -lh "$BACKUP_DIR"/aijiayuan_mysql_backup_*.tar.gz 2>/dev/null | tail -5 | while read line; do
        log "  $line"
    done
}

# 主备份流程
main() {
    local backup_success=true

    # 检查MySQL连接
    if ! check_mysql_connection; then
        log_error "MySQL连接失败，无法继续备份"
        exit 1
    fi

    # 执行各项备份
    backup_mysql_database || backup_success=false
    backup_redis || backup_success=false
    backup_volumes || backup_success=false
    backup_monitoring || backup_success=false
    backup_configs || backup_success=false
    backup_ssl || backup_success=false

    # 创建清单和验证
    create_manifest
    verify_backup || backup_success=false

    # 压缩备份
    compress_backup

    # 清理旧备份
    cleanup_old_backups

    # 显示备份列表
    show_backup_list

    if [ "$backup_success" = true ]; then
        log "🎉 MySQL备份任务完成: $BACKUP_DIR/${BACKUP_NAME}.tar.gz"
        log "备份可通过以下命令恢复:"
        log "  tar xzf $BACKUP_DIR/${BACKUP_NAME}.tar.gz"
        log "=========================================="
        exit 0
    else
        log_error "❌ 备份任务部分失败"
        exit 1
    fi
}

# 错误处理
trap 'log_error "备份过程中发生错误，退出码: $?"; exit 1' ERR

# 执行主流程
main "$@"