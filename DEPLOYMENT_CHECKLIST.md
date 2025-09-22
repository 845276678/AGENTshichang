# 📋 aijiayuan.top 完整部署检查清单

## 🎯 部署前必须完成

### ✅ 基础设施检查
- [ ] 服务器 47.108.90.221 SSH访问正常
- [ ] 域名 aijiayuan.top 已解析到服务器IP
- [ ] 域名 www.aijiayuan.top 已解析到服务器IP
- [ ] 服务器至少2GB内存，20GB磁盘空间
- [ ] 服务器已开放80, 443端口

### ✅ 环境配置
- [ ] .env.production 文件已配置
- [ ] 数据库密码已修改（默认: AiJiaYuan2024Secure!）
- [ ] Redis密码已修改（默认: AiJiaYuan2024Redis!）
- [ ] JWT密钥已修改
- [ ] NextAuth密钥已修改

### ✅ API密钥配置（可部署后配置）
- [ ] 百度千帆 API Key
- [ ] 讯飞星火 API Key
- [ ] 阿里通义千问 API Key
- [ ] 腾讯混元 API Key
- [ ] 智谱GLM API Key
- [ ] 支付宝支付配置
- [ ] 微信支付配置
- [ ] 阿里云OSS配置

## 🚀 部署步骤

### 1. 执行一键部署
```bash
# 完整部署（推荐）
./deploy-production.sh

# 或跳过依赖安装
./deploy-production.sh --skip-deps
```

### 2. 验证部署结果
- [ ] Web服务访问: https://aijiayuan.top
- [ ] API健康检查: https://aijiayuan.top/api/health
- [ ] SSL证书有效
- [ ] 所有Docker服务运行正常

## 📊 部署后配置

### ✅ 系统服务状态
```bash
# 检查系统服务
systemctl status aijiayuan-app.service
systemctl status aijiayuan-health-check.timer
systemctl status aijiayuan-backup.timer

# 查看定时任务
systemctl list-timers | grep aijiayuan
```

### ✅ 监控和日志
- [ ] Grafana访问: http://47.108.90.221:3001 (admin/admin)
- [ ] Prometheus访问: http://47.108.90.221:9090
- [ ] 日志目录: /opt/ai-marketplace/logs/
- [ ] 备份目录: /opt/ai-marketplace/backups/

### ✅ 安全配置
- [ ] 修改Grafana默认密码
- [ ] 配置防火墙规则
- [ ] 检查SSL证书自动续期

## 🛠️ 常用维护命令

### 服务管理
```bash
# 连接服务器
ssh root@47.108.90.221

# 进入项目目录
cd /opt/ai-marketplace

# 使用维护工具
./scripts/maintenance.sh status      # 查看状态
./scripts/maintenance.sh logs       # 查看日志
./scripts/maintenance.sh restart    # 重启服务
./scripts/maintenance.sh backup     # 手动备份
./scripts/maintenance.sh cleanup    # 系统清理
./scripts/maintenance.sh health-check  # 健康检查
./scripts/maintenance.sh monitor    # 实时监控
```

### Docker 命令
```bash
# 查看服务状态
docker-compose -f docker-compose.prod.yml ps

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f app

# 重启单个服务
docker-compose -f docker-compose.prod.yml restart app

# 进入容器
docker exec -it ai-marketplace-app bash
```

### 备份恢复
```bash
# 手动备份
./scripts/backup.sh

# 查看备份列表
ls -la /opt/ai-marketplace/backups/

# 恢复备份（示例）
cd /opt/ai-marketplace/backups
tar xzf aijiayuan_backup_20241222_120000.tar.gz
```

## 🔧 故障排查

### 服务无法访问
1. 检查域名解析: `nslookup aijiayuan.top`
2. 检查服务状态: `./scripts/maintenance.sh status`
3. 查看错误日志: `./scripts/maintenance.sh logs`
4. 重启服务: `./scripts/maintenance.sh restart`

### SSL证书问题
```bash
# 检查证书状态
certbot certificates

# 手动续期
certbot renew

# 重新申请
certbot certonly --webroot -w /var/www/certbot -d aijiayuan.top -d www.aijiayuan.top
```

### 数据库问题
```bash
# 检查数据库连接
docker exec ai-marketplace-postgres-primary pg_isready -U postgres

# 进入数据库
docker exec -it ai-marketplace-postgres-primary psql -U postgres -d ai_marketplace

# 查看数据库日志
docker logs ai-marketplace-postgres-primary
```

### 性能问题
```bash
# 系统资源监控
htop
df -h
docker stats

# 应用性能监控
访问 Grafana: http://47.108.90.221:3001
```

## 📞 技术支持

### 关键文件位置
- 应用目录: `/opt/ai-marketplace/`
- 环境配置: `/opt/ai-marketplace/.env`
- Docker配置: `/opt/ai-marketplace/docker/`
- 日志文件: `/opt/ai-marketplace/logs/`
- 备份文件: `/opt/ai-marketplace/backups/`
- SSL证书: `/opt/ai-marketplace/ssl/`

### 重要端口
- HTTP: 80
- HTTPS: 443
- Grafana: 3001
- Prometheus: 9090
- PostgreSQL: 5432（内部）
- Redis: 6379（内部）

### 联系信息
- 项目文档: 查看项目根目录文档文件
- 部署问题: 检查 `/opt/ai-marketplace/logs/` 日志
- 健康监控: 访问 https://aijiayuan.top/api/health

---

## 🎉 部署完成确认

部署成功后，以下项目应全部正常：

- [ ] ✅ https://aijiayuan.top 可正常访问
- [ ] ✅ https://www.aijiayuan.top 可正常访问
- [ ] ✅ SSL证书有效且自动续期已配置
- [ ] ✅ 所有Docker服务运行正常
- [ ] ✅ 数据库连接正常
- [ ] ✅ Redis连接正常
- [ ] ✅ 自动备份已配置（每日执行）
- [ ] ✅ 健康检查已配置（每5分钟执行）
- [ ] ✅ 监控系统可访问
- [ ] ✅ 系统服务已配置自启动

**🎊 恭喜！aijiayuan.top AI创意协作平台部署成功！**