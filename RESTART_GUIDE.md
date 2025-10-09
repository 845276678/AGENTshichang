# 服务器重启指南 - 修复 AI 回复截断问题

## 🚨 紧急提示

**您看到的 AI 专家回复截断问题是因为服务器正在运行旧代码！**

代码已经修复（maxTokens: 600→1500），但服务器需要重启才能加载新代码。

## 📋 快速重启步骤

### 方法 1: 使用 PM2（推荐用于生产环境）

如果您使用 PM2 管理进程：

```bash
# 查看当前运行的进程
pm2 list

# 重启所有进程
pm2 restart all

# 或重启特定进程
pm2 restart server  # WebSocket 服务器
pm2 restart next    # Next.js 应用

# 查看日志确认重启成功
pm2 logs
```

### 方法 2: 使用 npm scripts（本地开发）

如果您在本地开发环境：

```bash
# 1. 停止当前运行的服务
# 按 Ctrl + C 停止 Next.js 和 WebSocket 服务器

# 2. 重新启动服务

# 启动 Next.js 开发服务器
npm run dev
# 或
npm run dev:3000

# 在另一个终端窗口启动 WebSocket 服务器
npm run dev:ws
```

### 方法 3: 手动停止进程

如果进程卡住无法正常停止：

```bash
# Windows
# 查找 Node 进程
tasklist | findstr node

# 强制终止进程（替换 PID）
taskkill /F /PID <进程ID>

# Linux/Mac
# 查找进程
ps aux | grep node

# 终止进程
kill -9 <进程ID>

# 然后重新启动服务
npm run dev:ws
npm run dev
```

## ✅ 验证重启成功

### 1. 检查服务器日志

重启后，您应该看到：

```
🚀 WebSocket server started on port 8080
✅ Database connected
📡 Server is ready to accept connections
```

### 2. 检查浏览器

1. **清除浏览器缓存**
   - Chrome: `Ctrl + Shift + Delete`
   - 选择"缓存的图像和文件"
   - 点击"清除数据"

2. **刷新页面**
   - 按 `Ctrl + F5` 强制刷新

### 3. 测试新消息

1. 提交一个新的创意
2. 等待 AI 专家竞价和讨论
3. 检查专家回复是否完整

**完整回复的标志：**
- ✅ 老王的回复包含完整的"互动建议"部分
- ✅ 李博的回复包含完整的"财务预测"部分
- ✅ 回复不会在句子中间突然截断
- ✅ 字数明显增加（500-1000字）

## 🔍 故障排查

### 问题 1: 重启后仍然截断

**可能原因：**
- 浏览器缓存未清除
- 查看的是旧消息（修复前生成的）
- WebSocket 连接未断开重连

**解决方法：**
```bash
# 1. 完全停止所有服务
pm2 stop all  # 或 Ctrl+C

# 2. 等待 5 秒

# 3. 重新启动
pm2 start all  # 或 npm run dev:ws

# 4. 清除浏览器所有缓存
# 5. 关闭浏览器，重新打开
# 6. 提交新创意测试
```

### 问题 2: 服务器启动失败

**检查端口占用：**
```bash
# Windows
netstat -ano | findstr :8080
netstat -ano | findstr :4000

# Linux/Mac
lsof -i :8080
lsof -i :4000

# 如果端口被占用，终止进程
# Windows
taskkill /F /PID <PID>

# Linux/Mac
kill -9 <PID>
```

### 问题 3: WebSocket 连接失败

**检查配置：**
1. 确认 `server.js` 正在运行
2. 检查端口是否正确（默认 8080）
3. 查看浏览器控制台的 WebSocket 连接状态

```javascript
// 浏览器控制台应该显示
WebSocket connection established
Connected to AI bidding server
```

## 📊 验证 maxTokens 修复

### 检查代码版本

```bash
# 查看最近的提交
git log --oneline -5

# 应该看到这个提交
91e6c5a fix: 增加AI专家回复的maxTokens限制，避免内容被截断
```

### 检查 server.js 中的值

```bash
# 搜索 maxTokens 配置
grep "maxTokens:" server.js

# 应该看到
maxTokens: 1500  # 补充和预热阶段
maxTokens: 2000  # 讨论阶段
maxTokens: 1200  # 出价阶段
```

## 🎯 新旧消息对比

### 旧消息（修复前，600 tokens）
```
老王：...互动建议：
1. 对于产品经理：你们打算如何进行市场定位？能否给出具体的市
```
**特征：**
- ❌ 在"市"字截断
- ❌ 缺少完整段落
- ❌ 约 400-500 字

### 新消息（修复后，1500 tokens）
```
老王：...互动建议：
1. 对于产品经理：你们打算如何进行市场定位？能否给出具体的市场细分策略和目标客户画像？
2. 对于技术团队：你们的技术栈选型依据是什么？如何保证系统的扩展性和稳定性？
3. 对于商务团队：你们的定价策略是怎样的？如何进行客户获取和留存？

总结：这个项目有一定的市场前景，但需要在成本控制、市场定位、竞争策略上下功夫。我出价 480 元，期待看到更详细的商业计划和执行方案。
```
**特征：**
- ✅ 完整的段落和结尾
- ✅ 包含所有建议点
- ✅ 有总结和出价
- ✅ 约 700-900 字

## ⏱️ 预计时间

- **停止服务**: 10 秒
- **重启服务**: 30 秒
- **清除缓存**: 30 秒
- **测试新消息**: 2-3 分钟

**总计约 5 分钟**即可解决问题！

## 📞 需要帮助？

如果重启后问题仍然存在：

1. 检查服务器日志中的错误信息
2. 确认 git 提交版本（应该包含 91e6c5a）
3. 尝试完全重新克隆代码库
4. 检查环境变量配置

---

**重要提醒**: 修复只影响**新提交的创意**，历史消息无法自动修复。
