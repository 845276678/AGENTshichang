# MVP前端可视化工作坊 - 当前稳定版本记录

> **版本**: v1.0-stable
> **记录日期**: 2025-10-25
> **状态**: 设计完成，待实施
> **维护者**: Claude Code

---

## 📌 版本概述

本文档记录了MVP前端可视化工作坊的完整设计决策和技术架构，作为未来开发和维护的基准参考。

---

## 🎯 核心定位和功能范围

### 核心价值
**将完善后创意中的前端内容，生成可视化的HTML+CSS界面**

### 功能边界
- ✅ **包含**：前端UI可视化、HTML+CSS代码生成、设备预览
- ❌ **不包含**：后端代码、数据库设计、JavaScript交互逻辑、完整应用开发

### 用户流程
```
AI竞价（50积分）
    ↓
创意完善工作坊（免费）
    ↓
MVP工作坊（免费）
    ↓
导出HTML文件 + 创意计划书
```

**单独进入**：消耗10积分（积分不足时阻止进入）

---

## 🏗️ 技术架构决策

### 1. 页面路由
- **路径**：`/business-plan/mvp-generator`
- **决策**：复用现有路由，重构MVPBuilderConversational组件
- **原因**：保持URL稳定，不影响现有链接和SEO

### 2. 布局设计
- **比例**：左侧40% + 右侧60%
- **左侧**：AI对话面板（消息列表、输入框、建议卡片）
- **右侧**：实时预览iframe（沙箱渲染、设备模拟）

### 3. 对话策略
- **轮次限制**：5次对话
- **策略类型**：渐进式完善（初步确认 → 布局调整 → 功能细化 → 视觉优化 → 最终确认）
- **用户体验**：
  - 连续3次不满意时，AI主动引导用户详细描述需求
  - 提供"重新开始"功能（不消耗对话次数）
  - 显示建议卡片，用户可一键应用

### 4. AI服务选型
- **优先**：DeepSeek API
- **备用**：DashScope API（当DeepSeek失败时自动切换）
- **降级**：连续失败时引导用户访问 https://aijiayuan.top/about 联系客服
- **成本**：单次生成约 $0.00004，5轮完整流程约 $0.0002

### 5. 代码渲染方案
- **技术**：iframe沙箱渲染
- **安全**：`sandbox="allow-same-origin"` 禁止JavaScript执行
- **限制**：
  - HTML最大500KB
  - CSS最大200KB
  - DOM节点最多1000个
  - 禁止<script>标签、on*事件、外部资源加载

### 6. 数据库设计
- **数据库**：PostgreSQL（复用现有，无需新增）
- **新增表**：`mvp_visualization_sessions`
- **关键字段**：
  ```prisma
  model MVPVisualizationSession {
    id                    String
    userId                String
    refinementDocumentId  String?  // 关联创意完善文档
    frontendRequirements  Json     // 前端设计需求
    generatedHTML         String
    generatedCSS          String
    conversationHistory   Json[]
    currentRound          Int
    creditsDeducted       Int
    isFromBidding         Boolean
    status                String   // IN_PROGRESS / COMPLETED / CANCELLED
    createdAt             DateTime
    updatedAt             DateTime
    completedAt           DateTime?
  }
  ```

---

## 🔑 关键技术决策

### 决策1：数据来源处理（混合模式）
**场景**：用户可能从创意完善工作坊进入，也可能单独进入

**解决方案**：
```typescript
if (refinementDocumentId) {
  // 从创意完善文档读取frontendDesign数据
  loadFromRefinement(refinementDocumentId)
} else {
  // 显示简化输入表单，让用户手动描述前端需求
  showManualInputForm()
  // 同时提示："建议先完成创意完善工作坊，获得更好的生成效果"
}
```

### 决策2：AI生成失败处理
**策略**：
1. 第1-2轮：DeepSeek失败 → 显示错误，允许用户重试
2. 第3-5轮：DeepSeek失败 → 自动切换到DashScope
3. 连续失败：引导用户访问 `/about` 联系客服

**不使用**：预设模板降级（避免用户获得低质量结果）

### 决策3：积分不足处理
**策略**：完全阻止进入
- 显示清晰提示："您当前有X积分，进入MVP工作坊需要10积分"
- 提供充值或赚取积分的链接
- 推荐："通过AI竞价流程可免费使用所有工作坊"

### 决策4：会话恢复机制
**策略**：
- 会话数据保留7天
- 自动保存间隔30秒
- 页面加载时检测未完成会话
- 显示恢复提示，用户可选择继续或重新开始

### 决策5：并发和资源限制
**配置**：
```typescript
const PRODUCTION_LIMITS = {
  ai: {
    maxConcurrentRequests: 15,      // 同时最多15个AI请求
    queueSize: 50,                   // 队列最多50个等待请求
  },
  iframe: {
    maxActiveIframes: 50,            // 最多50个活跃iframe
    memoryLimitPerIframe: 10 * 1024 * 1024
  }
}
```
**目标**：稳定支持50-100个并发用户

### 决策6：错误处理和用户体验
**原则**：避免显示技术错误，提供明确解决方案

**错误分类**：
- 网络错误 → "网络连接异常，请检查后重试"
- AI服务错误 → "AI服务暂时不可用，请访问/about联系客服"
- 代码生成错误 → "代码生成失败，请重新描述需求或联系客服"
- 权限错误 → "积分不足或会话已过期"

---

## 📂 文件组织结构

### Context状态管理
```
src/contexts/MVPVisualizationContext.tsx
  - MVPVisualizationProvider
  - useMVPVisualization Hook
  - 状态：sessionId, conversationHistory, currentHTML, currentCSS, currentRound等
  - 方法：initializeSession, sendMessage, applySuggestion, generateOutput等
```

### 核心业务逻辑
```
src/lib/mvp-visualization/
  ├── ai-code-generator.ts          # AI代码生成引擎
  ├── code-validator.ts             # 代码安全验证
  ├── prompt-templates.ts           # 5轮对话Prompt模板
  └── plan-document-merger.ts       # 创意计划书更新逻辑
```

### UI组件
```
src/components/workshop/mvp/
  ├── MVPVisualizationWorkshop.tsx     # 主容器（双栏布局）
  ├── LeftPanel/
  │   ├── ConversationPanel.tsx        # 对话面板容器
  │   ├── MessageBubble.tsx            # 消息气泡
  │   └── SuggestionCards.tsx          # AI建议卡片
  ├── RightPanel/
  │   └── LivePreviewFrame.tsx         # iframe预览
  └── BottomActions/
      └── RoundProgress.tsx            # 进度条和操作按钮
```

### API路由
```
src/app/api/workshop/mvp/
  ├── start/route.ts                # POST - 启动会话
  ├── generate-code/route.ts        # POST - AI生成代码
  ├── save-draft/route.ts           # POST - 保存草稿
  └── export/route.ts               # POST - 导出最终文件
```

### 类型定义
```
src/types/mvp-visualization.ts
  - FrontendDesign
  - ConversationMessage
  - Suggestion
  - CodeGenerationResult
  - MVPSessionConfig
```

---

## 🔐 安全和性能约束

### 代码安全
```typescript
const CODE_LIMITS = {
  maxHTMLSize: 500 * 1024,      // 500KB
  maxCSSSize: 200 * 1024,       // 200KB
  maxDOMNodes: 1000,
  allowedTags: [
    'div', 'span', 'p', 'h1', 'h2', 'h3', 'button', 'input',
    'img', 'form', 'header', 'footer', 'nav', 'main', 'section'
  ]
}

// 禁止项
- <script>标签
- on*事件处理器（onclick, onload等）
- 外部资源加载（<link href="http...">, <img src="http...">）
- JavaScript代码
```

### iframe沙箱配置
```html
<iframe
  sandbox="allow-same-origin"
  srcDoc={generatedHTML}
  style={{ width: '100%', height: '100%' }}
/>
```

### 性能基准
- 页面加载时间：< 3秒
- API响应时间：< 2秒
- AI代码生成：< 20秒
- iframe渲染：< 1秒
- 数据库查询：< 100ms

---

## 🔄 数据流转

### 完整流程数据流
```
1. 用户完成AI竞价
   ↓ [竞价数据]

2. 进入创意完善工作坊
   ↓ [创建 IdeaRefinementDocument]
   ↓ [完善6个维度，包含productDetails.frontendDesign]

3. 点击"下一步"进入MVP工作坊
   ↓ [URL参数: refinementId=xxx, source=from-bidding]

4. MVP工作坊启动
   ↓ [调用 POST /api/workshop/mvp/start]
   ↓ [创建 MVPVisualizationSession]
   ↓ [读取 frontendDesign → frontendRequirements]

5. AI生成初始界面
   ↓ [调用 POST /api/workshop/mvp/generate-code]
   ↓ [DeepSeek API生成HTML+CSS]
   ↓ [更新 generatedHTML, generatedCSS]

6. 用户5轮对话优化
   ↓ [每次调用 generate-code API]
   ↓ [conversationHistory累积]
   ↓ [currentRound递增]

7. 导出最终文件
   ↓ [调用 POST /api/workshop/mvp/export]
   ↓ [生成完整HTML文件]
   ↓ [更新创意计划书（整合前端内容）]
   ↓ [下载 HTML + Markdown]
```

### 单独进入数据流
```
1. 用户直接访问 /business-plan/mvp-generator?source=standalone
   ↓ [检查积分 >= 10]

2. 扣除10积分
   ↓ [调用 deductCredits(userId, 10)]

3. 显示简化输入表单
   ↓ [用户手动输入前端需求]
   ↓ [保存到 frontendRequirements]

4. 后续流程同上（从步骤5开始）
```

---

## 📊 AI Prompt策略

### 系统角色定位
```
你是MVP前端可视化助手，擅长将用户的产品创意转化为可视化的HTML+CSS界面。

核心原则：
1. 使用简单易懂的语言，避免专业术语
2. 生成简洁、美观、易用的代码
3. 给出3-5条具体优化建议
4. 关注用户体验而非技术实现
```

### 5轮对话策略
1. **第1轮（初步确认）**：复述理解、生成初步代码、询问是否符合预期
2. **第2轮（布局调整）**：根据反馈调整页面布局（header/main/footer）
3. **第3轮（功能细化）**：细化核心功能区域（按钮、表单、卡片）
4. **第4轮（视觉优化）**：优化视觉细节（颜色、字体、间距、阴影）
5. **第5轮（最终确认）**：最后微调、总结成果、询问是否满意

### 输出格式规范
```
AI回复格式：

```html
<div class="container">
  <!-- 生成的HTML代码 -->
</div>
```

```css
.container {
  /* 生成的CSS代码 */
}
```

建议：
1. [具体建议内容]
2. [具体建议内容]
3. [具体建议内容]
```

---

## 🎨 用户体验设计

### 进度反馈
- 对话轮次显示："对话 3/5"
- 剩余次数提示："剩余 2 次对话机会"
- AI生成时显示进度："正在理解您的需求... 30%"

### 智能引导
- 连续3次不满意 → AI主动询问："能否详细描述理想界面？或给个参考案例？"
- 输入过于简单 → AI追问："能否补充一些细节，比如颜色偏好、布局方式？"
- 生成失败 → 提供明确解决方案："请访问 /about 联系客服"

### 建议卡片交互
```
┌─────────────────────────────────────┐
│ 💡 AI优化建议                        │
├─────────────────────────────────────┤
│ 1. 建议将主按钮改为蓝色，更吸引眼球     │
│    [应用]                            │
│                                     │
│ 2. 建议增加卡片阴影，增强层次感        │
│    [应用]                            │
│                                     │
│ 3. 建议调整行间距，提升阅读舒适度      │
│    [✓ 已应用]                        │
└─────────────────────────────────────┘
```

### 设备模拟器
- 桌面端（100%宽度）
- 平板端（768px宽度）
- 移动端（375px宽度）
- 一键切换，实时预览

---

## 🚀 部署配置

### Zeabur环境
- **自动部署**：已配置，每次Git推送自动触发
- **区域**：hkg1（香港）
- **数据库**：PostgreSQL（已有）
- **环境变量**：
  ```
  DATABASE_URL=postgresql://...
  DEEPSEEK_API_KEY=sk-...
  DASHSCOPE_API_KEY=sk-...  # 可选
  NEXTAUTH_SECRET=...
  NEXTAUTH_URL=https://aijiayuan.top
  ```

### 构建配置
```json
{
  "buildCommand": "npm run build",
  "startCommand": "npm run start",
  "framework": "nextjs"
}
```

### 性能优化
- 启用SWC最小化
- 移除生产环境console.log
- 懒加载大组件（MVPVisualizationWorkshop、LivePreviewFrame）
- 数据库查询使用select减少数据传输

---

## 📈 监控和日志

### 不使用第三方监控
**原因**：需要免费且无需操作的服务，目前无合适选项

### 自建日志
```typescript
// 生产环境日志
console.error('[ERROR]', { message, stack, context, timestamp })
console.log('[PERF]', { action, duration, timestamp })
console.log('[AI-USAGE]', { userId, tokens, cost, timestamp })
```

### 关键指标
- API响应时间
- AI调用成功率
- 用户完成率（进入 → 导出）
- 错误率和类型分布
- 积分消耗统计

---

## ⚠️ 已知限制和依赖

### 依赖项
1. **创意完善工作坊**（推荐但非必需）
   - MVP工作坊可读取 `refinedDocument.productDetails.frontendDesign`
   - 如未完成创意完善工作坊，用户需手动输入前端需求

2. **DeepSeek API**（核心依赖）
   - 必须可用，否则影响核心功能
   - 备用：DashScope API

3. **PostgreSQL数据库**（核心依赖）
   - 需要创建 `mvp_visualization_sessions` 表

### 已知限制
1. **不支持JavaScript交互**：只生成静态HTML+CSS
2. **图片使用占位符**：不支持真实图片上传
3. **5次对话上限**：无法无限优化（防止成本失控）
4. **代码体积限制**：HTML 500KB, CSS 200KB（防止性能问题）
5. **并发用户上限**：50-100人（受AI API和服务器限制）

---

## 🔍 故障排查指南

### 问题1：AI生成失败
**可能原因**：
- DeepSeek API密钥无效
- API限流（超过每分钟调用次数）
- 网络连接问题

**解决方法**：
1. 检查环境变量 `DEEPSEEK_API_KEY`
2. 查看API调用日志
3. 尝试DashScope备用服务
4. 引导用户联系客服

### 问题2：iframe不显示
**可能原因**：
- 生成的HTML代码有语法错误
- 代码包含被沙箱禁止的内容
- CSS选择器冲突

**解决方法**：
1. 检查浏览器控制台错误
2. 验证HTML语法（使用validator.w3.org）
3. 检查沙箱配置
4. 清理缓存重新生成

### 问题3：会话恢复失败
**可能原因**：
- 会话数据已超过7天被清理
- 数据库连接异常
- sessionId丢失

**解决方法**：
1. 检查数据库中是否存在会话记录
2. 验证sessionId是否正确传递
3. 清除localStorage重新开始

### 问题4：积分扣除异常
**可能原因**：
- 数据库事务未提交
- 并发请求导致重复扣除
- 用户余额计算错误

**解决方法**：
1. 检查事务日志
2. 实现幂等性控制（session级别锁）
3. 核对用户积分变更记录

---

## 📚 相关文档索引

- [MVP工作坊实施清单](./MVP工作坊实施清单.md) - 85个任务的详细实施指南
- [创意完善工作坊实施清单](./创意完善工作坊实施清单.md) - 前置依赖工作坊
- [创意完善工作坊技术设计文档](./创意完善工作坊技术设计文档.md) - 1093行技术规范

---

## 🎯 下一步行动

### 立即可开始（Phase 1）
1. 更新 `prisma/schema.prisma` 添加MVPVisualizationSession模型
2. 运行 `npx prisma migrate dev` 创建数据表
3. 创建TypeScript类型定义文件

### 后续开发顺序
1. Phase 1: 数据库和类型定义（1-2小时）
2. Phase 2: 核心业务逻辑（1.5-2小时）
3. Phase 3: UI组件开发（2-3小时）
4. Phase 4: API路由实现（1.5-2小时）
5. Phase 5: AI集成（1-1.5小时）
6. Phase 6: 测试和优化（1-1.5小时）

**预计总时长**：8-12小时

---

## 📝 版本变更记录

### v1.0-stable (2025-10-25)
- ✅ 完成10轮设计讨论
- ✅ 确定技术架构和关键决策
- ✅ 创建完整实施清单（85个任务）
- ✅ 定义所有边界情况处理策略
- ✅ 明确部署和优化方案
- 🔜 待实施代码

---

**最后更新**: 2025-10-25
**维护者**: Claude Code
**状态**: 设计完成，生产就绪
**优先级**: 高
