# 🚀 AI创意协作平台 - aijiayuan.top 部署指南

## 📋 部署前检查清单

### 1. 域名解析配置
确保域名已正确解析到服务器：
```bash
# 检查域名解析
nslookup aijiayuan.top
nslookup www.aijiayuan.top
```
应该返回：`47.108.90.221`

### 2. 服务器访问
确保可以SSH访问服务器：
```bash
ssh root@47.108.90.221
```

### 3. 必要信息准备
请准备以下API密钥（可在部署后配置）：
- [ ] 百度千帆 API Key
- [ ] 讯飞星火 API Key
- [ ] 阿里通义千问 API Key
- [ ] 腾讯混元 API Key
- [ ] 智谱GLM API Key
- [ ] 支付宝支付配置
- [ ] 微信支付配置
- [ ] 阿里云OSS配置

## 🚀 一键部署

### 方法1：完整自动部署
```bash
# 给脚本执行权限
chmod +x deploy-production.sh

# 执行完整部署
./deploy-production.sh
```

### 方法2：跳过依赖安装（如果服务器已配置）
```bash
./deploy-production.sh --skip-deps
```

## 📝 部署步骤说明

部署脚本将自动执行以下步骤：

1. **✅ 服务器环境检查**
   - 测试SSH连接
   - 安装Docker和Docker Compose
   - 安装Certbot (SSL证书工具)

2. **📁 项目文件上传**
   - 同步所有项目文件到服务器
   - 排除开发文件和依赖

3. **⚙️ 环境配置**
   - 上传生产环境配置
   - 配置域名和SSL

4. **🔒 SSL证书申请**
   - 自动申请Let's Encrypt证书
   - 配置自动续期

5. **🐳 Docker服务部署**
   - 构建应用镜像
   - 启动所有服务容器
   - 运行数据库迁移

6. **✅ 部署验证**
   - 健康检查
   - SSL验证
   - 服务状态检查

## 🔧 部署后配置

### 1. 配置AI服务API密钥
```bash
# SSH到服务器
ssh root@47.108.90.221

# 编辑环境配置
cd /opt/ai-marketplace
nano .env

# 重启应用以应用新配置
docker-compose -f docker-compose.prod.yml restart app
```

### 2. 监控服务状态
```bash
# 查看所有服务状态
docker-compose -f docker-compose.prod.yml ps

# 查看应用日志
docker-compose -f docker-compose.prod.yml logs -f app

# 健康检查
curl -f https://aijiayuan.top/api/health
```

## 📊 访问地址

部署完成后，您可以通过以下地址访问：

- **主站**: https://aijiayuan.top
- **www**: https://www.aijiayuan.top
- **API健康检查**: https://aijiayuan.top/api/health
- **Grafana监控**: http://47.108.90.221:3001 (admin/admin)
- **Prometheus**: http://47.108.90.221:9090

## 🛠️ 常用管理命令

```bash
# SSH连接到服务器
ssh root@47.108.90.221

# 进入项目目录
cd /opt/ai-marketplace

# 查看服务状态
docker-compose -f docker-compose.prod.yml ps

# 重启所有服务
docker-compose -f docker-compose.prod.yml restart

# 重启单个服务
docker-compose -f docker-compose.prod.yml restart app

# 查看实时日志
docker-compose -f docker-compose.prod.yml logs -f

# 更新应用
git pull
docker-compose -f docker-compose.prod.yml build app
docker-compose -f docker-compose.prod.yml up -d app

# 数据库备份
./scripts/backup.sh

# 查看系统资源
htop
df -h
docker system df
```

## 🔒 安全建议

1. **定期更新密码**
   - 数据库密码
   - Redis密码
   - 管理员密码

2. **API密钥安全**
   - 定期轮换API密钥
   - 限制API调用频率
   - 监控异常使用

3. **服务器安全**
   - 配置防火墙
   - 定期安全更新
   - 监控登录日志

## 🆘 故障排查

### 应用无法访问
```bash
# 检查服务状态
docker-compose -f docker-compose.prod.yml ps

# 检查Nginx日志
docker-compose -f docker-compose.prod.yml logs nginx

# 检查应用日志
docker-compose -f docker-compose.prod.yml logs app
```

### SSL证书问题
```bash
# 检查证书状态
certbot certificates

# 手动续期证书
certbot renew

# 重新申请证书
certbot certonly --webroot -w /var/www/certbot -d aijiayuan.top -d www.aijiayuan.top
```

### 数据库连接问题
```bash
# 检查数据库状态
docker-compose -f docker-compose.prod.yml exec postgres-primary pg_isready

# 查看数据库日志
docker-compose -f docker-compose.prod.yml logs postgres-primary
```

## 📞 技术支持

如遇到部署问题，请检查：
1. 域名DNS解析是否正确
2. 服务器防火墙设置
3. Docker服务是否正常运行
4. SSL证书是否成功申请

---

**🎉 部署完成后，您的AI创意协作平台将在 https://aijiayuan.top 正式上线！**