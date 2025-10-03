# 商业计划生成调试指南

## 问题现象
点击"生成商业计划书"按钮后，新窗口卡在空白页，控制台无任何输出。

## 调试步骤

### 1. 清除浏览器缓存
```
Ctrl + Shift + Delete (Chrome/Edge)
勾选：
- 缓存的图片和文件
- Cookie和其他网站数据

时间范围：全部时间
```

### 2. 硬刷新页面
```
Ctrl + Shift + R (强制刷新)
或
Ctrl + F5
```

### 3. 打开开发者工具
```
F12 或 Ctrl + Shift + I
切换到 Console 标签
```

### 4. 访问竞价页面
```
http://localhost:4000/marketplace/bidding
```

### 5. 触发竞价流程
确保完成以下步骤：
1. 输入创意内容
2. 等待AI专家竞价完成（进入result阶段）
3. 看到"🎉 AI竞价完成！"消息
4. 点击"生成商业计划书"按钮

### 6. 检查控制台输出

#### 如果函数被调用，应该看到：
```
🚀 handleGenerateBusinessPlan called
📝 Opening new window...
✅ New window opened successfully
🔄 isCreatingPlan set to true
📊 Status update: 正在准备竞价数据... (error: false)
📊 Starting business plan generation...
ideaContent: [你的创意内容]
ideaId: [创意ID]
currentBids: {...}
highestBid: [最高出价]
aiMessages count: [消息数量]
📤 Sending request to /api/business-plan-session: {...}
📥 Response status: [状态码]
```

#### 如果看到错误：
记录完整的错误信息，包括：
- 错误消息
- 堆栈跟踪
- 请求/响应数据

### 7. 检查新窗口内容

新窗口应该显示：
```
AI 正在整理商业计划...
请稍候片刻，完成后将自动打开详细报告。

[状态更新区域]
正在准备竞价数据...
```

如果出错，会显示：
```
生成失败
错误: [错误信息]
[关闭窗口]
```

### 8. 检查网络请求

在开发者工具的 Network 标签：
1. 找到 `business-plan-session` 请求
2. 检查：
   - Request Headers（特别是Authorization）
   - Request Payload
   - Response（状态码和内容）

### 9. 检查认证状态

在控制台执行：
```javascript
localStorage.getItem('auth.access_token')
```

应该返回一个JWT token，如果是null，说明未登录。

### 10. 检查服务器日志

查看终端中的Next.js开发服务器日志，看是否有：
- API路由错误
- 数据库连接错误
- 认证错误

## 常见问题排查

### 问题1: 控制台完全没有输出
**原因**: 函数没有被调用
**解决**:
1. 确认是否在result阶段（竞价完成后）
2. 检查按钮是否被禁用（disabled状态）
3. 查看React DevTools检查组件状态

### 问题2: 新窗口被浏览器阻止
**原因**: 弹窗拦截器
**解决**:
1. 允许浏览器弹窗
2. 控制台会显示: `❌ Failed to open new window`

### 问题3: 401 认证错误
**原因**: Token无效或缺失
**解决**:
1. 检查localStorage中的token
2. 重新登录
3. 控制台会显示token检查日志

### 问题4: 500 服务器错误
**原因**: API服务器错误
**解决**:
1. 查看服务器终端日志
2. 检查数据库连接
3. 查看API错误响应的details字段（开发环境）

## 最新代码位置

- 商业计划生成逻辑: `src/components/bidding/UnifiedBiddingStage.tsx:212-391`
- API路由: `src/app/api/business-plan-session/route.ts`
- 错误处理: `src/lib/auth.ts:274-309`

## 提交记录

```bash
ec20360 - debug: 添加详细的调试日志追踪商业计划生成流程
7cce9f9 - fix: 改进商业计划生成的错误处理和用户反馈
f79b43b - fix: 添加WebSocket user_interaction_prompt消息处理和改进错误日志
685be70 - fix: 统一使用tokenStorage管理认证令牌
```

## 需要报告的信息

如果问题仍然存在，请提供：

1. **控制台完整输出**（截图或文本）
2. **新窗口显示的内容**（截图）
3. **Network标签的business-plan-session请求详情**
4. **浏览器和版本**
5. **是否登录**（localStorage中有token吗）
6. **竞价是否完成**（是否看到"AI竞价完成"）

---

最后更新: 2025-10-03
