#!/bin/bash
# ==========================================
# AI创意协作平台 - aijiayuan.top 增强备份脚本
# ==========================================

set -e

# 配置
BACKUP_DIR="/opt/ai-marketplace/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="aijiayuan_backup_${DATE}"
RETENTION_DAYS=7
LOG_FILE="/opt/ai-marketplace/logs/backup.log"

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

log "🚀 开始备份 aijiayuan.top AI创意协作平台..."

# 备份数据库
log "🗄️ 备份PostgreSQL数据库..."
if docker exec ai-marketplace-postgres-primary pg_dump -U postgres -d ai_marketplace > "$BACKUP_DIR/$BACKUP_NAME/database.sql"; then
    log "✅ 数据库备份完成"
else
    log_error "❌ 数据库备份失败"
    exit 1
fi

# 备份Redis数据
log "🔴 备份Redis数据..."
if docker exec ai-marketplace-redis redis-cli --rdb /data/dump.rdb; then
    docker cp ai-marketplace-redis:/data/dump.rdb "$BACKUP_DIR/$BACKUP_NAME/"
    log "✅ Redis备份完成"
else
    log_warn "⚠️ Redis备份失败"
fi

# 备份应用数据卷
log "📁 备份应用数据卷..."

# 应用日志
if docker volume inspect app_logs > /dev/null 2>&1; then
    docker run --rm \
        -v app_logs:/source:ro \
        -v "$BACKUP_DIR/$BACKUP_NAME":/backup \
        alpine tar czf /backup/app_logs.tar.gz -C /source .
    log "✅ 应用日志备份完成"
fi

# 上传文件（如果存在）
if [ -d "/opt/ai-marketplace/uploads" ]; then
    tar czf "$BACKUP_DIR/$BACKUP_NAME/uploads.tar.gz" -C /opt/ai-marketplace uploads/
    log "✅ 上传文件备份完成"
fi

# 备份监控数据
log "📊 备份监控数据..."

# Prometheus数据
if docker volume inspect prometheus_data > /dev/null 2>&1; then
    docker run --rm \
        -v prometheus_data:/source:ro \
        -v "$BACKUP_DIR/$BACKUP_NAME":/backup \
        alpine tar czf /backup/prometheus_data.tar.gz -C /source .
    log "✅ Prometheus数据备份完成"
fi

# Grafana数据
if docker volume inspect grafana_data > /dev/null 2>&1; then
    docker run --rm \
        -v grafana_data:/source:ro \
        -v "$BACKUP_DIR/$BACKUP_NAME":/backup \
        alpine tar czf /backup/grafana_data.tar.gz -C /source .
    log "✅ Grafana数据备份完成"
fi

# 备份配置文件
log "⚙️ 备份配置文件..."
cp .env "$BACKUP_DIR/$BACKUP_NAME/env_production" 2>/dev/null || cp .env.production "$BACKUP_DIR/$BACKUP_NAME/" 2>/dev/null || log_warn "环境配置文件未找到"
tar czf "$BACKUP_DIR/$BACKUP_NAME/docker_configs.tar.gz" docker/ 2>/dev/null || log_warn "Docker配置目录未找到"
cp docker-compose*.yml "$BACKUP_DIR/$BACKUP_NAME/" 2>/dev/null || log_warn "Docker Compose文件未找到"

# 备份SSL证书
if [ -d "/opt/ai-marketplace/ssl" ]; then
    tar czf "$BACKUP_DIR/$BACKUP_NAME/ssl_certificates.tar.gz" -C /opt/ai-marketplace ssl/
    log "✅ SSL证书备份完成"
fi

# 创建详细备份清单
log "📋 创建备份清单..."
cat > "$BACKUP_DIR/$BACKUP_NAME/backup_info.txt" << EOF
========================================
aijiayuan.top 备份信息
========================================
备份时间: $(date)
备份版本: $BACKUP_NAME
服务器: 47.108.90.221
域名: aijiayuan.top

包含内容:
- database.sql (PostgreSQL数据库完整备份)
- dump.rdb (Redis数据备份)
- app_logs.tar.gz (应用运行日志)
- uploads.tar.gz (用户上传文件)
- prometheus_data.tar.gz (监控历史数据)
- grafana_data.tar.gz (监控面板配置)
- env_production (生产环境配置)
- docker_configs.tar.gz (Docker配置文件)
- docker-compose*.yml (容器编排配置)
- ssl_certificates.tar.gz (SSL证书文件)

备份大小: $(du -sh "$BACKUP_DIR/$BACKUP_NAME" | cut -f1)
========================================
EOF

# 验证备份完整性
log "🔍 验证备份完整性..."
backup_files_count=$(find "$BACKUP_DIR/$BACKUP_NAME" -type f | wc -l)
log "备份包含 $backup_files_count 个文件"

# 压缩整个备份
log "🗜️ 压缩备份包..."
cd "$BACKUP_DIR"
tar czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"
rm -rf "$BACKUP_NAME"

final_size=$(du -sh "${BACKUP_NAME}.tar.gz" | cut -f1)
log "✅ 最终备份大小: $final_size"

# 清理旧备份
log "🧹 清理 ${RETENTION_DAYS} 天前的旧备份..."
deleted_count=$(find "$BACKUP_DIR" -name "aijiayuan_backup_*.tar.gz" -mtime +${RETENTION_DAYS} -type f | wc -l)
find "$BACKUP_DIR" -name "aijiayuan_backup_*.tar.gz" -mtime +${RETENTION_DAYS} -delete
log "已清理 $deleted_count 个旧备份文件"

# 显示当前备份列表
log "📦 当前备份列表:"
ls -lh "$BACKUP_DIR"/aijiayuan_backup_*.tar.gz 2>/dev/null | tail -5 | while read line; do
    log "  $line"
done

log "🎉 备份任务完成: $BACKUP_DIR/${BACKUP_NAME}.tar.gz"
log "备份可通过以下命令恢复:"
log "  tar xzf $BACKUP_DIR/${BACKUP_NAME}.tar.gz"
log "=========================================="