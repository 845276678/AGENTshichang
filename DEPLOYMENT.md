# 生产环境部署指南

## 🚀 快速部署

### 前置要求
- [ ] Linux服务器 (Ubuntu 20.04+ 推荐)
- [ ] Docker & Docker Compose
- [ ] 域名和SSL证书
- [ ] 2GB+ RAM, 20GB+ 磁盘空间

### 1. 服务器准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 添加用户到docker组
sudo usermod -aG docker $USER
```

### 2. 部署应用

```bash
# 克隆代码
git clone <your-repo-url> /opt/ai-marketplace
cd /opt/ai-marketplace

# 配置环境变量
cp .env.production.example .env.production
# 编辑 .env.production 填入真实配置
nano .env.production

# 给脚本执行权限
chmod +x scripts/*.sh

# 执行部署
sudo ./scripts/deploy.sh
```

### 3. SSL配置

```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx

# 申请SSL证书
sudo certbot --nginx -d yourdomain.com

# 自动续期
sudo crontab -e
# 添加: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 配置清单

### 必需配置

#### 数据库配置
- [ ] PostgreSQL数据库URL
- [ ] 数据库用户名和密码
- [ ] Redis连接配置

#### 认证配置
- [ ] NextAuth secret key
- [ ] JWT secret key
- [ ] OAuth应用配置 (GitHub, Google)

#### AI服务配置
- [ ] 百度文心一言 API Key
- [ ] 讯飞星火 API Key
- [ ] 阿里通义千问 API Key
- [ ] 腾讯混元 API Key
- [ ] 智谱GLM API Key

#### 支付配置
- [ ] 支付宝应用配置
- [ ] 微信支付配置
- [ ] 支付回调URL配置

#### 存储配置
- [ ] 阿里云OSS配置
- [ ] 文件上传域名配置

### 可选配置

#### 监控配置
- [ ] Grafana管理员密码
- [ ] 告警通知配置
- [ ] 邮件SMTP配置

#### 安全配置
- [ ] 防火墙规则
- [ ] Rate limiting配置
- [ ] CORS域名白名单

## 📊 监控和维护

### 健康检查
```bash
# 手动健康检查
./scripts/health-check.sh

# 查看服务状态
docker-compose -f docker-compose.prod.yml ps

# 查看应用日志
docker-compose -f docker-compose.prod.yml logs -f app
```

### 备份和恢复
```bash
# 创建备份
./scripts/backup.sh

# 查看备份列表
ls -la /opt/backups/ai-marketplace/

# 恢复备份 (示例)
tar xzf /opt/backups/ai-marketplace/backup_20231201_120000.tar.gz
```

### 监控访问
- Grafana: http://yourserver:3001
- Prometheus: http://yourserver:9090
- 应用健康检查: https://yourdomain.com/api/health

## 🛡️ 安全建议

### 服务器安全
- [ ] 配置防火墙 (UFW)
- [ ] 禁用root登录
- [ ] 配置SSH密钥认证
- [ ] 定期安全更新

### 应用安全
- [ ] 使用强密码
- [ ] 定期轮换API密钥
- [ ] 监控异常访问
- [ ] 定期备份数据

### 网络安全
- [ ] HTTPS强制跳转
- [ ] 安全头配置
- [ ] Rate limiting
- [ ] IP白名单配置

## 🚀 性能优化

### 应用优化
- [ ] CDN配置
- [ ] 图片压缩
- [ ] 缓存策略
- [ ] 数据库索引优化

### 服务器优化
- [ ] 负载均衡配置
- [ ] 数据库主从复制
- [ ] Redis集群
- [ ] 容器资源限制

## 📞 故障排查

### 常见问题

1. **应用无法启动**
   ```bash
   # 检查日志
   docker-compose logs app
   # 检查环境变量
   docker-compose config
   ```

2. **数据库连接失败**
   ```bash
   # 检查数据库状态
   docker exec postgres-primary pg_isready
   # 检查连接字符串
   echo $DATABASE_URL
   ```

3. **支付回调失败**
   - 检查回调URL配置
   - 验证SSL证书
   - 检查防火墙设置

4. **AI服务调用失败**
   - 验证API密钥
   - 检查API配额
   - 查看错误日志

### 紧急恢复
```bash
# 快速重启所有服务
docker-compose -f docker-compose.prod.yml restart

# 回滚到上一个版本
docker-compose -f docker-compose.prod.yml down
docker pull previous-image-tag
docker-compose -f docker-compose.prod.yml up -d
```

## 📈 扩展计划

### 水平扩展
- [ ] 多实例部署
- [ ] 负载均衡器配置
- [ ] 数据库读写分离
- [ ] 缓存集群

### 功能扩展
- [ ] 多语言支持
- [ ] 移动端应用
- [ ] 第三方集成
- [ ] 高级分析功能