# AI创意交易市场生产环境部署文档

## 📋 项目概述

**项目名称**: AI创意交易市场
**预算**: 1万元内
**用户规模**: 5000用户
**上线时间**: 本月底
**云服务商**: 阿里云

## 🏗️ 系统架构设计

### 技术栈
- **前端**: Next.js 14 + TypeScript + Tailwind CSS
- **后端**: Node.js + Next.js API Routes
- **数据库**: MySQL 8.0 + Redis 6.0
- **部署**: 阿里云ECS + RDS + Redis + OSS
- **监控**: 阿里云ARMS + 自定义日志

### 架构图
```
[用户] → [CDN] → [SLB] → [ECS服务器] → [RDS数据库]
                                    ↓
                              [Redis缓存]
                                    ↓
                              [OSS存储]
                                    ↓
                            [AI服务集群]
```

## 💰 成本预算（月费用：800-1000元）

| 服务 | 配置 | 月费用 | 说明 |
|------|------|--------|------|
| ECS服务器 | 2核4GB | 350元 | 支持5000并发 |
| RDS MySQL | 2核4GB | 280元 | 100GB存储 |
| Redis | 1GB | 70元 | 缓存服务 |
| OSS存储 | 100GB | 50元 | 文件存储 |
| CDN | 500GB流量 | 80元 | 内容分发 |
| 短信服务 | 1500条 | 70元 | 验证码 |
| 域名+SSL | - | 100元 | 年费分摊 |
| **总计** | - | **1000元** | 预留100元缓冲 |

## 🔧 阿里云服务配置清单

### 1. ECS云服务器
```yaml
实例规格: ecs.c6.large
CPU: 2核
内存: 4GB
系统盘: 40GB SSD
数据盘: 100GB SSD
带宽: 5Mbps
地域: 华东1(杭州)
操作系统: Ubuntu 20.04 LTS
```

### 2. RDS云数据库
```yaml
规格: mysql.n2.medium.1
CPU: 2核
内存: 4GB
存储: 100GB SSD
版本: MySQL 8.0
地域: 华东1(杭州)
网络: 专有网络VPC
备份: 自动备份7天
```

### 3. Redis缓存
```yaml
规格: redis.master.micro.default
内存: 1GB
版本: Redis 6.0
地域: 华东1(杭州)
网络: 专有网络VPC
```

### 4. OSS对象存储
```yaml
存储类型: 标准存储
存储空间: 100GB
地域: 华东1(杭州)
访问控制: 私有读写
CDN加速: 开启
```

## 📊 数据库设计

### 核心表结构
```sql
-- 用户表
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  credits INT DEFAULT 1000,
  level ENUM('bronze', 'silver', 'gold') DEFAULT 'bronze',
  status ENUM('active', 'banned') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创意表
CREATE TABLE ideas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category ENUM('tech', 'lifestyle', 'education', 'health', 'finance', 'entertainment') NOT NULL,
  author_id INT NOT NULL,
  status ENUM('pending', 'bidding', 'completed') DEFAULT 'pending',
  ai_score DECIMAL(3,1) DEFAULT 0,
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id)
);

-- AI竞价表
CREATE TABLE ai_bids (
  id INT PRIMARY KEY AUTO_INCREMENT,
  idea_id INT NOT NULL,
  ai_agent VARCHAR(50) NOT NULL,
  bid_amount INT NOT NULL,
  confidence DECIMAL(3,1) NOT NULL,
  analysis_result JSON,
  status ENUM('bidding', 'won', 'lost') DEFAULT 'bidding',
  bid_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (idea_id) REFERENCES ideas(id)
);

-- 商业计划表
CREATE TABLE business_plans (
  id INT PRIMARY KEY AUTO_INCREMENT,
  idea_id INT NOT NULL,
  user_id INT NOT NULL,
  plan_data JSON NOT NULL,
  overall_score DECIMAL(3,1) DEFAULT 0,
  status ENUM('generating', 'completed', 'failed') DEFAULT 'generating',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (idea_id) REFERENCES ideas(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 🤖 AI服务集成方案

### API密钥配置
```javascript
// 环境变量配置 (.env.production)
BAIDU_API_KEY=your_baidu_api_key
BAIDU_SECRET_KEY=your_baidu_secret_key
ALIBABA_DASHSCOPE_API_KEY=your_alibaba_api_key
IFLYTEK_APP_ID=your_iflytek_app_id
IFLYTEK_API_SECRET=your_iflytek_secret
TENCENT_SECRET_ID=your_tencent_id
TENCENT_SECRET_KEY=your_tencent_key
ZHIPU_API_KEY=your_zhipu_api_key
```

### AI服务调用流程
1. **百度文心一言**: 创意解析与理解
2. **阿里通义千问**: 技术架构设计
3. **讯飞星火**: 市场调研与分析
4. **腾讯混元**: 财务建模与预测
5. **智谱GLM**: 法律合规分析

## 🚀 部署流程

### Phase 1: 基础环境搭建 (1-2天)
```bash
# 1. 购买阿里云服务
- ECS服务器购买与配置
- RDS数据库创建
- Redis实例创建
- OSS存储桶创建
- 域名注册与备案

# 2. 服务器环境配置
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g pm2
```

### Phase 2: 应用部署 (2-3天)
```bash
# 1. 代码部署
git clone https://github.com/your-repo/ai-market.git
cd ai-market
npm install
npm run build

# 2. 环境变量配置
cp .env.example .env.production
# 编辑 .env.production 填入真实配置

# 3. 数据库初始化
mysql -u root -p < database-schema.sql

# 4. 启动应用
pm2 start ecosystem.config.js --env production
```

### Phase 3: 配置优化 (1天)
```bash
# 1. Nginx配置
sudo apt install nginx
sudo cp nginx.conf /etc/nginx/sites-available/aimarket
sudo ln -s /etc/nginx/sites-available/aimarket /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 2. SSL证书配置
sudo certbot --nginx -d yourdomain.com

# 3. 防火墙配置
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22
sudo ufw enable
```

## 🔒 安全配置

### 服务器安全
```bash
# 1. 创建非root用户
sudo adduser aimarket
sudo usermod -aG sudo aimarket

# 2. SSH密钥认证
ssh-keygen -t rsa -b 4096
# 禁用密码登录

# 3. 自动更新
sudo apt install unattended-upgrades
sudo dpkg-reconfigure unattended-upgrades
```

### 应用安全
```javascript
// 安全中间件配置
const securityConfig = {
  helmet: true,           // 安全headers
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
    credentials: true
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100                   // 最多100次请求
  },
  csrf: true,               // CSRF保护
  xss: true                 // XSS保护
}
```

## 📈 监控与运维

### 系统监控
```yaml
# Prometheus + Grafana 配置
监控指标:
  - CPU使用率
  - 内存使用率
  - 磁盘空间
  - 网络流量
  - 数据库连接数
  - Redis连接数
  - API响应时间
  - 错误率
```

### 日志管理
```javascript
// Winston日志配置
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console()
  ]
});
```

## 🔄 备份策略

### 数据库备份
```bash
# 自动备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u backup_user -p ai_market > /backup/ai_market_$DATE.sql
# 保留30天备份
find /backup -name "ai_market_*.sql" -mtime +30 -delete
```

### 代码备份
```bash
# Git自动部署
git pull origin main
npm run build
pm2 reload all
```

## 📱 API接口文档

### 用户认证
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "phone": "13800138000",
  "smsCode": "123456"
}
```

### 创意提交
```http
POST /api/ideas
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "智能冰箱管理助手",
  "description": "详细描述...",
  "category": "tech",
  "tags": ["AI", "IoT", "智能家居"]
}
```

### 商业计划生成
```http
POST /api/business-plan/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "ideaId": 1,
  "options": {
    "detailed": true,
    "aiServices": ["baidu", "alibaba", "iflytek", "tencent", "zhipu"]
  }
}
```

## 🎯 性能优化

### 缓存策略
```javascript
// Redis缓存配置
const cacheConfig = {
  userSessions: 7 * 24 * 3600,     // 用户会话7天
  ideas: 60 * 60,                  // 创意列表1小时
  businessPlans: 24 * 3600,        // 商业计划1天
  aiResults: 7 * 24 * 3600         // AI分析结果7天
}
```

### CDN配置
```nginx
# Nginx缓存配置
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location /api/ {
    add_header Cache-Control "no-cache";
}
```

## 📞 应急预案

### 故障处理流程
1. **监控告警** → 自动通知
2. **快速诊断** → 查看日志和监控
3. **故障修复** → 重启服务/回滚代码
4. **服务恢复** → 验证功能正常
5. **事后分析** → 改进监控和预防

### 联系方式
- **技术支持**: tech@aimarket.com
- **运维值班**: ops@aimarket.com
- **紧急联系**: +86-400-xxx-xxxx

## ✅ 上线检查清单

### 部署前检查
- [ ] 阿里云服务购买完成
- [ ] 域名备案完成
- [ ] SSL证书配置
- [ ] AI API密钥获取
- [ ] 数据库初始化
- [ ] 环境变量配置
- [ ] 安全配置完成

### 功能测试
- [ ] 用户注册登录
- [ ] 创意提交功能
- [ ] AI竞价系统
- [ ] 商业计划生成
- [ ] 支付积分系统
- [ ] 文件上传下载
- [ ] 移动端适配

### 性能测试
- [ ] 负载测试(1000并发)
- [ ] 数据库压力测试
- [ ] API响应时间(<500ms)
- [ ] 页面加载速度(<3s)
- [ ] 内存使用率(<80%)

## 📈 上线后运营

### 用户增长策略
1. **新用户奖励**: 注册送1000积分
2. **邀请机制**: 邀请好友获得积分
3. **优质内容**: 精选创意推荐
4. **社交分享**: 微信/微博分享
5. **SEO优化**: 搜索引擎优化

### 数据分析
- 日活用户数(DAU)
- 月活用户数(MAU)
- 创意提交数量
- AI分析成功率
- 用户留存率
- 收入转化率

---

**文档版本**: v1.0
**更新时间**: 2024年12月
**维护人员**: AI市场技术团队

*此文档包含完整的生产环境部署指南，请严格按照流程执行*