# 每日创意自动生成系统

本系统使用AI（阿里通义、智谱GLM、DeepSeek）自动生成每日创意内容。

## 功能特点

- ✨ **AI驱动生成**：使用真实AI API生成高质量创意
- 🔄 **自动降级**：AI失败时自动切换到预设模板
- 📅 **定时执行**：支持多种定时任务方式
- 🎯 **智能选择**：避免重复领域，成熟度随机分布
- 🔧 **灵活配置**：可指定AI提供商或自动选择最优服务

## 使用方式

### 1. 手动执行

#### 生成今日创意
```bash
npm run generate-ideas
```

#### 批量生成（默认7天）
```bash
npm run generate-ideas:batch
```

#### 自定义批量天数
```bash
npm run generate-ideas:batch 14  # 生成未来14天的创意
```

### 2. 定时任务配置

#### Linux/Mac (Crontab)

编辑crontab：
```bash
crontab -e
```

添加以下行（每天8点执行）：
```bash
0 8 * * * cd /path/to/AIagentshichang && npm run generate-ideas >> /var/log/daily-idea.log 2>&1
```

#### Windows (任务计划程序)

1. 打开"任务计划程序"
2. 创建基本任务
3. 触发器：每天 08:00
4. 操作：启动程序
   - 程序：`cmd.exe`
   - 参数：`/c cd /d D:\ai\AIagentshichang && npm run generate-ideas`

#### PM2 (推荐生产环境)

创建PM2配置文件 `ecosystem.config.js`：
```javascript
module.exports = {
  apps: [{
    name: 'daily-idea-cron',
    script: 'scripts/generate-daily-idea.ts',
    interpreter: 'ts-node',
    cron_restart: '0 8 * * *',
    autorestart: false
  }]
};
```

启动：
```bash
pm2 start ecosystem.config.js
pm2 save
```

### 3. Vercel部署（云端自动执行）

本项目已配置Vercel Cron Jobs，部署到Vercel后会自动每天8点执行。

#### 配置步骤：

1. 在Vercel项目设置中添加环境变量：
   ```
   CRON_SECRET=your-random-secret-key
   ```

2. 确保AI服务的API Keys已配置：
   ```
   ALI_API_KEY=your-ali-key
   ZHIPU_API_KEY=your-zhipu-key
   DEEPSEEK_API_KEY=your-deepseek-key
   ```

3. 部署后，Vercel会自动执行 `vercel.json` 中配置的Cron任务

#### 手动触发（测试）：
```bash
curl -X POST https://your-domain.vercel.app/api/cron/generate-daily-idea \
  -H "Authorization: Bearer your-cron-secret"
```

## AI服务配置

### 优先级顺序

系统会按以下优先级自动选择可用的AI服务：

1. **DeepSeek** - 性价比最高，优先使用
2. **智谱GLM** - 中文理解好
3. **阿里通义千问** - 备选方案

### 指定AI提供商

在代码中可以指定使用特定的AI服务：

```typescript
import { AIProvider } from '@/lib/ai-services';

const idea = await DailyIdeaService.generateDailyIdea({
  useAI: true,
  aiProvider: AIProvider.DEEPSEEK // 或 ZHIPU、ALI
});
```

### 环境变量配置

在 `.env.local` 中配置AI服务的API密钥：

```env
# AI服务配置
ALI_API_KEY=your_ali_tongyi_api_key
ZHIPU_API_KEY=your_zhipu_glm_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key

# Vercel Cron密钥（用于验证定时任务请求）
CRON_SECRET=your_random_secret_key_here
```

## 生成策略

### 成熟度分布

- **低成熟度 (0-30分)**: 30% 概率 - 概念期创意
- **中低成熟度 (30-50分)**: 40% 概率 - 发展期创意
- **中高成熟度 (50-70分)**: 20% 概率 - 成长期创意
- **高成熟度 (70-100分)**: 10% 概率 - 成熟期创意

### 领域选择

系统会自动避免最近7天使用过的领域，确保创意多样性。

可选领域：
- 科技
- 生活方式
- 教育
- 健康
- 金融
- 娱乐
- 商业
- 零售

## 日志和监控

### 查看执行日志

**Linux/Mac:**
```bash
tail -f /var/log/daily-idea.log
```

**PM2:**
```bash
pm2 logs daily-idea-cron
```

**Vercel:**
在Vercel Dashboard > Functions > 查看具体函数的日志

### 检查生成状态

访问API查看最近的创意：
```bash
curl http://localhost:4000/api/daily-idea/today
```

## 故障排查

### AI生成失败

系统会自动降级到预设模板，不影响服务。可以检查：

1. API密钥是否配置正确
2. API服务是否正常（网络、配额）
3. 查看日志中的具体错误信息

### 定时任务未执行

1. 检查cron配置是否正确
2. 确认脚本路径正确
3. 检查执行权限
4. 查看系统日志

### Vercel Cron不工作

1. 确认 `CRON_SECRET` 环境变量已设置
2. 检查Vercel项目的Cron配置
3. 在Vercel Dashboard查看Cron执行历史

## 最佳实践

1. **定期检查**: 每周检查一次生成的创意质量
2. **备份策略**: 同时配置本地定时任务和Vercel Cron，互为备份
3. **监控告警**: 配置失败通知（邮件、webhook等）
4. **批量预生成**: 每周日批量生成下周的创意，避免临时失败

## 示例：完整部署流程

```bash
# 1. 克隆项目
git clone your-repo
cd AIagentshichang

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入API密钥

# 4. 测试生成
npm run generate-ideas

# 5. 批量生成一周的创意
npm run generate-ideas:week

# 6. 部署到Vercel
vercel deploy --prod

# 7. 配置本地定时任务（可选）
crontab -e
# 添加: 0 8 * * * cd /path/to/project && npm run generate-ideas
```

## API接口

### GET /api/daily-idea/today
获取今日创意

### POST /api/cron/generate-daily-idea
触发创意生成（需要CRON_SECRET验证）

## 贡献

欢迎提交Issue和Pull Request！