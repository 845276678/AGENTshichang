# ==========================================
# Zeabur 部署配置指南
# ==========================================

## 🚀 Zeabur 部署配置

### 项目配置文件
已创建 `zeabur.json` 配置文件，包含以下配置：

```json
{
  "name": "AI创意协作平台",
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "startCommand": "npm start",
  "installCommand": "npm ci",
  "serverless": false,
  "env": { ... },
  "regions": ["hkg1"],
  "healthCheck": {
    "path": "/api/health",
    "expectedStatusCode": 200
  }
}
```

### 环境变量配置
在 Zeabur 控制台需要配置以下环境变量：

#### 🔐 基础配置
```
NODE_ENV=production
PORT=3000
```

#### 🗄️ 数据库配置
```
DATABASE_URL=postgresql://user:password@host:5432/database
```

#### 🔑 认证配置
```
JWT_SECRET=your-super-secret-jwt-key
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-app.zeabur.app
```

#### 🤖 AI服务配置
```
BAIDU_API_KEY=your-baidu-api-key
BAIDU_SECRET_KEY=your-baidu-secret-key
ALI_API_KEY=your-ali-api-key
XUNFEI_APP_ID=your-xunfei-app-id
XUNFEI_API_SECRET=your-xunfei-api-secret
XUNFEI_API_KEY=your-xunfei-api-key
TENCENT_SECRET_ID=your-tencent-secret-id
TENCENT_SECRET_KEY=your-tencent-secret-key
ZHIPU_API_KEY=your-zhipu-api-key
```

#### 💾 存储服务配置
```
OSS_ACCESS_KEY_ID=your-oss-access-key
OSS_ACCESS_KEY_SECRET=your-oss-secret-key
OSS_BUCKET=your-bucket-name
OSS_REGION=your-region
```

#### 💰 支付配置
```
ALIPAY_APP_ID=your-alipay-app-id
ALIPAY_PRIVATE_KEY=your-alipay-private-key
WECHAT_APP_ID=your-wechat-app-id
WECHAT_APP_SECRET=your-wechat-app-secret
```

#### 📧 邮件服务配置
```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-password
```

### 部署步骤

#### 1. 连接 GitHub 仓库
1. 登录 [Zeabur 控制台](https://dash.zeabur.com)
2. 创建新项目
3. 连接到 GitHub 仓库
4. 选择要部署的分支（通常是 `main`）

#### 2. 配置服务
1. **Web服务**: 自动检测为 Next.js 项目
2. **数据库**: 添加 PostgreSQL 服务
3. **环境变量**: 在设置中添加上述所有环境变量

#### 3. 域名配置
1. 在 Zeabur 控制台中配置自定义域名
2. 更新 `NEXTAUTH_URL` 为正确的域名
3. 配置 SSL 证书（Zeabur 自动提供）

### GitHub Actions 集成

CI/CD 流水线已配置 Zeabur 部署：

```yaml
deploy-zeabur:
  runs-on: ubuntu-latest
  needs: build-docker
  if: github.ref == 'refs/heads/main'

  steps:
  - name: 部署到Zeabur
    uses: zeabur/deploy-action@v1
    with:
      service-id: ${{ secrets.ZEABUR_SERVICE_ID }}
      service-token: ${{ secrets.ZEABUR_SERVICE_TOKEN }}
      image: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
```

#### 需要配置的 GitHub Secrets:
```
ZEABUR_SERVICE_ID=your-service-id
ZEABUR_SERVICE_TOKEN=your-service-token
```

### 监控和健康检查

#### 健康检查端点
- **路径**: `/api/health`
- **预期状态码**: 200
- **检查内容**: 数据库连接、AI服务状态、系统资源

#### 监控指标
- 响应时间
- 错误率
- 数据库连接状态
- AI服务可用性
- 内存和CPU使用率

### 扩容配置

#### 自动扩容
```json
{
  "scaling": {
    "minReplicas": 1,
    "maxReplicas": 5,
    "targetCPUUtilization": 70,
    "targetMemoryUtilization": 80
  }
}
```

#### 资源限制
```json
{
  "resources": {
    "requests": {
      "memory": "512Mi",
      "cpu": "250m"
    },
    "limits": {
      "memory": "1Gi",
      "cpu": "500m"
    }
  }
}
```

### 备份和恢复

#### 数据库备份
- Zeabur PostgreSQL 服务自动每日备份
- 可通过控制台手动创建备份点
- 支持一键恢复到任意备份点

#### 文件存储备份
- 使用阿里云OSS进行文件存储
- OSS具有跨区域备份能力
- 支持版本控制和回收站功能

### 日志管理

#### 应用日志
- 通过 Zeabur 控制台查看实时日志
- 支持关键词搜索和过滤
- 自动日志轮转和清理

#### 错误追踪
- 集成错误监控服务
- 实时错误报警
- 性能指标追踪

### 性能优化

#### CDN配置
- 静态资源通过CDN加速
- 图片压缩和格式优化
- 缓存策略配置

#### 数据库优化
- 连接池配置
- 查询优化
- 索引策略

### 安全配置

#### HTTPS
- 自动SSL证书
- 强制HTTPS重定向
- HSTS头部设置

#### 访问控制
- IP白名单（如需要）
- DDoS防护
- API速率限制

### 故障排除

#### 常见问题
1. **构建失败**: 检查依赖版本兼容性
2. **数据库连接失败**: 验证DATABASE_URL格式
3. **环境变量未生效**: 检查变量名拼写和值格式
4. **AI服务调用失败**: 验证API密钥有效性

#### 调试步骤
1. 查看构建日志
2. 检查运行时日志
3. 验证环境变量
4. 测试数据库连接
5. 检查API端点响应

### 成本优化

#### 资源监控
- 定期检查资源使用情况
- 根据实际负载调整配置
- 使用 Zeabur 的计费透明度功能

#### 优化建议
- 合理设置副本数量
- 优化镜像大小
- 使用缓存减少计算
- 监控第三方服务调用成本

---

## 📞 支持联系

- Zeabur 官方文档: https://docs.zeabur.com
- GitHub Issues: 项目仓库 Issues 页面
- 技术支持邮箱: 见项目文档