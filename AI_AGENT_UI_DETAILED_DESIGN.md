# AI Agent 对话框系统 - 详细 UI 设计规范

## 整体视觉设计系统
### 设计原则
- 沉浸式体验：界面氛围接近真人专家会议，保持舞台感。
- 信息层次清晰：核心事件与状态优先级最高，辅以辅助信息。
- 视觉一致性：颜色、字体、间距、圆角保持统一节奏。
- 响应式适配：桌面、平板、手机均需具备良好可用性。
- 动画服务体验：动画不喧宾夺主，时长 < 400ms，帧率 ≥ 60fps。

### 配色系统
```css
:root {
  /* 主品牌色 */
  --primary-purple: #7C3AED;
  --primary-blue: #3B82F6;
  --primary-gradient: linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%);

  /* 角色色 */
  --agent-alex: #3B82F6;
  --agent-wang: #10B981;
  --agent-lin: #EC4899;
  --agent-alan: #8B5CF6;
  --agent-prof: #F59E0B;

  /* 状态色 */
  --state-thinking: #6366F1;
  --state-speaking: #10B981;
  --state-bidding: #F59E0B;
  --state-waiting: #6B7280;
  --state-idle: #E5E7EB;

  /* 背景与遮罩 */
  --bg-primary: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%);
  --bg-card: rgba(255, 255, 255, 0.95);
  --bg-dialog: rgba(255, 255, 255, 0.98);
  --bg-overlay: rgba(0, 0, 0, 0.1);

  /* 文字 */
  --text-primary: #1F2937;
  --text-secondary: #4B5563;
  --text-muted: #9CA3AF;
  --text-inverse: #FFFFFF;
}
```

### 字体与排版
```css
:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  --text-xs: 0.75rem;   /* 时间戳、标签 */
  --text-sm: 0.875rem;  /* 辅助信息 */
  --text-base: 1rem;    /* 正文 */
  --text-lg: 1.125rem;  /* 小标题 */
  --text-xl: 1.25rem;   /* 标题 */
  --text-2xl: 1.5rem;   /* 阶段标题 */
  --text-3xl: 1.875rem; /* 页面主标题 */

  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

### 阴影与圆角
```css
:root {
  --radius-lg: 20px;
  --radius-md: 16px;
  --radius-sm: 12px;
  --shadow-soft: 0 20px 40px rgba(15, 23, 42, 0.08);
  --shadow-strong: 0 24px 48px rgba(79, 70, 229, 0.12);
}
```

## 布局系统设计
### 页面分区
1. 顶部阶段状态栏（80px）：展示阶段、进度条、倒计时与核心指标。
2. 中部主体舞台（约 400px 高）：五位 Agent 面板水平排布，可在窄屏换列。
3. 底部用户交互区：根据阶段切换创意输入、观看提示、补充面板。
4. 竞价状态条（60px）：最高出价、观众数、连接状态、活跃度。

### 栅格与断点
```css
.agents-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(200px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 1279px) {
  .agents-grid {
    grid-template-columns: repeat(3, minmax(200px, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 1023px) {
  .agents-grid {
    grid-template-columns: repeat(3, minmax(180px, 1fr));
    gap: 1rem;
  }
  .agents-grid .agent-panel:nth-child(4),
  .agents-grid .agent-panel:nth-child(5) {
    justify-self: center;
  }
}

@media (max-width: 767px) {
  .agents-grid {
    grid-template-columns: repeat(2, minmax(160px, 1fr));
    gap: 0.75rem;
  }
  .agents-grid .agent-panel:last-child {
    grid-column: span 2;
    justify-self: center;
  }
}
```

## AgentDialogPanel 组件规范
### 结构层次
```tsx
<div className="agent-panel">
  <div className="agent-avatar-section">头像 + 状态标记 + 激活光环</div>
  <div className="agent-info">姓名、专长、信心度</div>
  <div className="agent-dialog">对话气泡 + 情绪标签 + 时间戳</div>
  <div className="agent-bidding">竞价金额（允许 0）+ 进度条</div>
  <div className="agent-interaction">支持按钮或占位说明</div>
</div>
```
- 面板默认使用 `--radius-lg` 圆角与 `--shadow-soft` 阴影，激活态叠加外圈描边。
- 头像区域保持 64px 半径，使用角色色渐变描边。
- 状态徽章采用状态色，字体 `--text-xs`。

### 对话气泡
```css
.dialog-bubble {
  position: relative;
  max-width: 220px;
  padding: 12px 16px;
  border-radius: 16px;
  background: var(--bg-dialog);
  box-shadow: var(--shadow-soft);
}
.dialog-bubble::after {
  content: '';
  position: absolute;
  left: 32px;
  bottom: -8px;
  width: 16px;
  height: 16px;
  background: inherit;
  transform: rotate(45deg);
}
```
- 当前消息使用渐进出现动画（淡入 + 缩放）。
- 情绪标签使用角色色底 + 白字，例如“兴奋”“自信”。
- 时间戳使用 `--text-xs` 并对齐气泡右下角。

### 状态指示器
- SpeakingIndicator：3 条等宽波形，幅度与 `speakingIntensity` 匹配。
- ThinkingIndicator：脉冲环形，使用 `--state-thinking`。
- BiddingIndicator：旋转硬币动画，突出竞价阶段。
- WaitingIndicator（可选）：柔和呼吸光点。

### 竞价展示
- 使用 `¥` 符号展示金额，0 出价显示为 `¥ 0`。
- 进度条颜色映射信心度，0-50% 使用 `--state-thinking`，≥50% 使用 `--state-speaking`。
- 若当前阶段不允许竞价，区域折叠为占位文案“等待竞价阶段”。

### 支持按钮
- 默认 `outline` 风格，激活后填充品牌渐变并显示 “已支持”。
- 禁用状态使用 30% 透明度并保留标签，说明补充次数已用尽。

## PhaseStatusBar 设计
- 左侧：阶段图标 + 标题（如 “当前阶段：AI 深度讨论”）。
- 中部：线性进度条（700px 宽），支持渐变填充与动态百分比。
- 右侧：倒计时、提醒提示（如 “本阶段剩余 03:45”）。
- 背景使用 `--primary-gradient`，文本白色，整体高度 80px。

## 用户交互面板
- IDEA_INPUT：展示多段输入（标题、简介、预算），右侧卡片小贴士与示例。
- VIEW_ONLY：居中提示文案 + 动态倒计时，强调“请观看专家表现”。
- USER_SUPPLEMENT：包含补充表单、剩余次数显示、提交按钮（与 0 出价兼容）。
- 校验提示在字段下方展示，颜色使用 `#F87171`。

## 竞价状态面板
```tsx
<Card className="bidding-status-panel">
  <div className="bid-display">
    <span className="label">最高出价</span>
    <span className="amount">¥ {highestBid}</span>
    <span className="bidder">({highestBidder})</span>
  </div>
  <div className="stats">
    <div className="stat-item">👥 观众 {viewerCount}</div>
    <div className="stat-item">
      <span className={clsx('connection-indicator', connectionStatus)}></span>
      {getConnectionText(connectionStatus)}
    </div>
    <div className="stat-item">📊 活跃度 {activityRate}%</div>
  </div>
  <div className="realtime-tag">实时</div>
</Card>
```
- 0 出价展示 `¥ 0`，并搭配灰色提示 “尚无溢价”。
- 连接状态指示器使用绿色（connected）、黄色（unstable）、红色（disconnected）。
- “实时”标签使用循环呼吸动画提升动感。

## 动画效果规范
```tsx
const bubbleVariants = {
  initial: { opacity: 0, scale: 0.9, y: 10 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 22 }
  },
  exit: { opacity: 0, scale: 0.9, y: -8 }
};
```
- Agent 面板进入动画：0.5s easeOut，延迟 0.1s 级联。
- 阶段切换动画：滑入/滑出 0.6s，配合背景渐变过渡。
- SpeakingIndicator：1.2s 循环，幅度与强度线性映射。
- ThinkingIndicator：1.5s 循环缩放，保持对比度。
- BiddingIndicator：1.8s 旋转，0 出价时保持浅色并减少旋转幅度。

## 无障碍与可用性
- 所有按钮提供 `aria-label` 与键盘焦点样式。
- 色彩对比满足 WCAG AA（主要文案与背景对比 ≥ 4.5:1）。
- 气泡内容超出时提供滚动并限制最大高度。
- 重要状态更迭（如竞价更新、阶段变化）通过 sr-only 提示播报。

## 开发自检清单
### AgentDialogPanel
- [ ] 头像、状态徽章、情绪动画实现。
- [ ] 对话气泡显示、隐藏、过渡动画。
- [ ] 竞价金额展示（含 0 出价）与信心度进度条。
- [ ] 支持按钮与补充次数提示。
- [ ] 响应式布局与键盘导航支持。

### PhaseStatusBar
- [ ] 阶段文案、图标、倒计时及进度条。
- [ ] 阶段切换动画与对比度校验。
- [ ] 大屏、窄屏适配。

### 用户交互面板
- [ ] 创意输入表单校验。
- [ ] 观看模式提示与倒计时。
- [ ] 补充输入表单、剩余次数与禁用态。

### 竞价状态面板
- [ ] 最高出价数据刷新（包含 0 出价）。
- [ ] 连接状态、观众数、活跃度显示。
- [ ] 实时标签动画与语义化提示。

## 测试建议
- 视觉回归（Chromatic 或 Percy）覆盖三种断点。
- 与后端联调 0 出价、断线重连、阶段权限变更场景。
- 无障碍测试：键盘操作、屏幕阅读器朗读。
- 性能监测：首屏渲染、Agent 面板切换、WebSocket 消息峰值。

## 发布注意事项
- 通过特征开关灰度发布，监控用户反馈与性能指标。
- 保留旧版舞台视图的回退入口。
- 更新设计资产（Figma、Icon 库）与组件文档。
- 迭代总结中记录 0 出价相关的产品与技术决策。
