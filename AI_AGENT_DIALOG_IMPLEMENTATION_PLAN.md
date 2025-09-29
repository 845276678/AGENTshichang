# AI Agent 对话框系统实施方案

## 📋 项目概述

基于用户需求，重构现有的AI竞价系统，实现5位AI Agent全程可见的对话框系统，提供沉浸式的AI专家讨论和竞价体验。

## 🎯 核心需求

### 用户期望流程
1. **用户输入创意** - 在表单上方看到5位AI专家待命状态
2. **AI开场讨论** - 用户观看AI之间的开场交流
3. **AI深度讨论与竞价** - 用户观看AI专家深度分析和竞价博弈
4. **用户补充机会** - 用户获得3次补充创意的机会
5. **最终结果** - 显示竞价结果和商业报告生成

### 技术要求
- 保留现有的AI竞价舞台功能
- 5位AI Agent全程可见并有对话框显示
- 明确的阶段权限控制
- 流畅的用户体验转换

## 🏗️ 系统架构设计

### 组件层次结构
```
UnifiedBiddingSystem/
├── PhaseController (阶段控制器)
│   ├── PhaseStatusBar (阶段状态栏)
│   └── PhasePermissionManager (权限管理)
├── AgentDisplaySystem (AI展示系统)
│   ├── AgentDialogPanel × 5 (AI对话面板)
│   │   ├── AgentAvatar (头像)
│   │   ├── AgentStatus (状态)
│   │   ├── DialogBubble (对话气泡)
│   │   └── BiddingStatus (竞价状态)
│   └── AgentStateManager (状态管理)
├── UserInteractionSystem (用户交互系统)
│   ├── IdeaInputPanel (创意输入面板)
│   ├── SupplementInputPanel (补充输入面板)
│   └── ViewerPanel (观看面板)
└── DataLayer (数据层)
    ├── WebSocketManager (WebSocket管理)
    ├── StateStore (状态存储)
    └── MessageHandler (消息处理)
```

### 数据流设计
```
用户操作 → PhaseController → WebSocket → Server
                ↓
AgentStateManager ← WebSocket ← AI服务响应
                ↓
AgentDialogPanel × 5 (UI更新)
```

## 📊 详细技术规范

### 1. 阶段管理系统

#### BiddingPhase 枚举
```typescript
enum BiddingPhase {
  IDEA_INPUT = 'idea_input',           // 创意输入阶段
  AGENT_WARMUP = 'agent_warmup',       // AI专家热身
  AGENT_DISCUSSION = 'agent_discussion', // AI深度讨论
  AGENT_BIDDING = 'agent_bidding',     // AI竞价阶段
  USER_SUPPLEMENT = 'user_supplement',  // 用户补充阶段
  FINAL_BIDDING = 'final_bidding',     // 最终竞价
  RESULT_DISPLAY = 'result_display'     // 结果展示
}
```

#### 阶段配置
```typescript
interface PhaseConfig {
  phase: BiddingPhase
  duration: number // 秒
  userCanInput: boolean
  userCanWatch: boolean
  showBiddingStatus: boolean
  agentInteractionLevel: 'low' | 'medium' | 'high'
  nextPhase?: BiddingPhase
}

const PHASE_CONFIGS: Record<BiddingPhase, PhaseConfig> = {
  [BiddingPhase.IDEA_INPUT]: {
    phase: BiddingPhase.IDEA_INPUT,
    duration: 0, // 无限制
    userCanInput: true,
    userCanWatch: true,
    showBiddingStatus: false,
    agentInteractionLevel: 'low',
    nextPhase: BiddingPhase.AGENT_WARMUP
  },
  [BiddingPhase.AGENT_WARMUP]: {
    phase: BiddingPhase.AGENT_WARMUP,
    duration: 120, // 2分钟
    userCanInput: false,
    userCanWatch: true,
    showBiddingStatus: false,
    agentInteractionLevel: 'medium',
    nextPhase: BiddingPhase.AGENT_DISCUSSION
  },
  [BiddingPhase.AGENT_DISCUSSION]: {
    phase: BiddingPhase.AGENT_DISCUSSION,
    duration: 300, // 5分钟
    userCanInput: false,
    userCanWatch: true,
    showBiddingStatus: true,
    agentInteractionLevel: 'high',
    nextPhase: BiddingPhase.AGENT_BIDDING
  },
  [BiddingPhase.AGENT_BIDDING]: {
    phase: BiddingPhase.AGENT_BIDDING,
    duration: 240, // 4分钟
    userCanInput: false,
    userCanWatch: true,
    showBiddingStatus: true,
    agentInteractionLevel: 'high',
    nextPhase: BiddingPhase.USER_SUPPLEMENT
  },
  [BiddingPhase.USER_SUPPLEMENT]: {
    phase: BiddingPhase.USER_SUPPLEMENT,
    duration: 180, // 3分钟
    userCanInput: true,
    userCanWatch: true,
    showBiddingStatus: true,
    agentInteractionLevel: 'medium',
    nextPhase: BiddingPhase.FINAL_BIDDING
  },
  [BiddingPhase.FINAL_BIDDING]: {
    phase: BiddingPhase.FINAL_BIDDING,
    duration: 120, // 2分钟
    userCanInput: false,
    userCanWatch: true,
    showBiddingStatus: true,
    agentInteractionLevel: 'high',
    nextPhase: BiddingPhase.RESULT_DISPLAY
  },
  [BiddingPhase.RESULT_DISPLAY]: {
    phase: BiddingPhase.RESULT_DISPLAY,
    duration: 0, // 无限制
    userCanInput: false,
    userCanWatch: true,
    showBiddingStatus: true,
    agentInteractionLevel: 'low'
  }
}
```

### 2. Agent状态管理

#### AgentState 接口
```typescript
interface AgentState {
  id: string
  name: string
  phase: AgentPhase
  emotion: AgentEmotion
  currentMessage?: string
  currentBid?: number
  confidence: number // 0-1
  lastActivity: Date
  messageHistory: AgentMessage[]
  biddingHistory: BidRecord[]
  thinkingDuration?: number
  speakingIntensity: number // 0-1
  isSupported: boolean
  supportCount: number
}

enum AgentPhase {
  IDLE = 'idle',
  THINKING = 'thinking',
  SPEAKING = 'speaking',
  BIDDING = 'bidding',
  WAITING = 'waiting',
  REACTING = 'reacting'
}

enum AgentEmotion {
  NEUTRAL = 'neutral',
  EXCITED = 'excited',
  CONFIDENT = 'confident',
  WORRIED = 'worried',
  AGGRESSIVE = 'aggressive',
  THOUGHTFUL = 'thoughtful'
}
```

#### StateManager Hook
```typescript
interface UseAgentStatesReturn {
  agentStates: Record<string, AgentState>
  currentPhase: BiddingPhase
  timeRemaining: number
  userSupplementCount: number
  maxSupplementCount: number
  updateAgentState: (agentId: string, update: Partial<AgentState>) => void
  setPhase: (phase: BiddingPhase) => void
  canUserInput: boolean
  canUserWatch: boolean
  showBiddingStatus: boolean
}

const useAgentStates = (sessionId: string): UseAgentStatesReturn => {
  // 状态管理逻辑
  // WebSocket 消息处理
  // 阶段转换逻辑
  // 权限控制
}
```

### 3. WebSocket消息协议

#### 消息类型扩展
```typescript
type WSMessageType =
  // 阶段管理
  | 'phase_start'
  | 'phase_transition'
  | 'phase_complete'
  // Agent状态
  | 'agent_thinking_start'
  | 'agent_thinking_end'
  | 'agent_speaking_start'
  | 'agent_speaking_end'
  | 'agent_message'
  | 'agent_bid'
  | 'agent_reaction'
  | 'agent_emotion_change'
  // 用户交互
  | 'user_input_allowed'
  | 'user_supplement_received'
  | 'user_support_recorded'
  // 系统状态
  | 'session_status'
  | 'connection_status'
  | 'error'

interface WSMessage {
  type: WSMessageType
  sessionId: string
  timestamp: Date
  payload: any
}
```

#### 具体消息格式
```typescript
// Agent开始思考
interface AgentThinkingStartMessage extends WSMessage {
  type: 'agent_thinking_start'
  payload: {
    agentId: string
    estimatedDuration: number
    context: string
  }
}

// Agent发送消息
interface AgentMessageMessage extends WSMessage {
  type: 'agent_message'
  payload: {
    agentId: string
    content: string
    emotion: AgentEmotion
    confidence: number
    replyTo?: string
  }
}

// Agent出价
interface AgentBidMessage extends WSMessage {
  type: 'agent_bid'
  payload: {
    agentId: string
    bidAmount: number
    reasoning: string
    confidence: number
    isCounterBid: boolean
  }
}

// 阶段转换
interface PhaseTransitionMessage extends WSMessage {
  type: 'phase_transition'
  payload: {
    fromPhase: BiddingPhase
    toPhase: BiddingPhase
    reason: string
    timeRemaining: number
  }
}
```

## 🎨 UI组件设计

### 1. AgentDialogPanel 组件

#### 组件接口
```typescript
interface AgentDialogPanelProps {
  agent: AIPersona
  state: AgentState
  isActive: boolean
  currentPhase: BiddingPhase
  onSupport: () => void
  onAvatarClick?: () => void
  showDialogBubble: boolean
  showBiddingStatus: boolean
  size?: 'small' | 'medium' | 'large'
}
```

#### 视觉状态设计
```typescript
// 状态颜色映射
const AGENT_STATE_COLORS = {
  [AgentPhase.IDLE]: 'bg-gray-100 text-gray-600',
  [AgentPhase.THINKING]: 'bg-blue-100 text-blue-700',
  [AgentPhase.SPEAKING]: 'bg-green-100 text-green-700',
  [AgentPhase.BIDDING]: 'bg-yellow-100 text-yellow-700',
  [AgentPhase.WAITING]: 'bg-purple-100 text-purple-700',
  [AgentPhase.REACTING]: 'bg-orange-100 text-orange-700'
}

// 情感动画映射
const EMOTION_ANIMATIONS = {
  [AgentEmotion.EXCITED]: { scale: [1, 1.1, 1], duration: 0.6 },
  [AgentEmotion.CONFIDENT]: { scale: [1, 1.05, 1], duration: 0.8 },
  [AgentEmotion.WORRIED]: { x: [-2, 2, -2, 0], duration: 0.4 },
  [AgentEmotion.AGGRESSIVE]: { scale: [1, 1.15, 1], duration: 0.3 },
  [AgentEmotion.THOUGHTFUL]: { rotateY: [-5, 5, -5, 0], duration: 1.0 }
}
```

#### 布局结构
```tsx
const AgentDialogPanel = ({ agent, state, isActive, currentPhase, onSupport }: AgentDialogPanelProps) => {
  return (
    <motion.div
      className={`agent-panel ${isActive ? 'active' : ''}`}
      animate={EMOTION_ANIMATIONS[state.emotion]}
    >
      {/* 头像区域 */}
      <div className="agent-avatar-container">
        <motion.div
          className="agent-avatar"
          animate={state.phase === AgentPhase.SPEAKING ? { scale: 1.1 } : { scale: 1 }}
        >
          <img src={agent.avatar} alt={agent.name} />

          {/* 说话指示器 */}
          {state.phase === AgentPhase.SPEAKING && (
            <SpeakingIndicator intensity={state.speakingIntensity} />
          )}

          {/* 思考指示器 */}
          {state.phase === AgentPhase.THINKING && (
            <ThinkingIndicator duration={state.thinkingDuration} />
          )}
        </motion.div>

        {/* 状态标签 */}
        <Badge className={AGENT_STATE_COLORS[state.phase]}>
          {getPhaseDisplayName(state.phase)}
        </Badge>
      </div>

      {/* 信息区域 */}
      <div className="agent-info">
        <h4 className="agent-name">{agent.name}</h4>
        <p className="agent-specialty">{agent.specialty}</p>
      </div>

      {/* 对话气泡 */}
      <AnimatePresence>
        {state.currentMessage && (
          <motion.div
            className="dialog-bubble"
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bubble-content">
              {state.currentMessage}
            </div>
            <div className="bubble-tail" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 竞价状态 */}
      {state.currentBid && currentPhase === BiddingPhase.AGENT_BIDDING && (
        <div className="bidding-status">
          <div className="bid-amount">
            💰 {state.currentBid}元
          </div>
          <div className="confidence-bar">
            <Progress value={state.confidence * 100} className="h-2" />
            <span className="text-xs">信心: {Math.round(state.confidence * 100)}%</span>
          </div>
        </div>
      )}

      {/* 支持按钮 */}
      {currentPhase === BiddingPhase.USER_SUPPLEMENT && (
        <Button
          size="sm"
          variant={state.isSupported ? "default" : "outline"}
          onClick={onSupport}
          className="support-button"
        >
          {state.isSupported ? "已支持" : "支持"}
          {state.supportCount > 0 && ` (${state.supportCount})`}
        </Button>
      )}
    </motion.div>
  )
}
```

### 2. UnifiedBiddingStage 主组件

#### 布局设计
```tsx
const UnifiedBiddingStage = ({ ideaId, sessionId, ideaContent }: UnifiedBiddingStageProps) => {
  const {
    agentStates,
    currentPhase,
    timeRemaining,
    userSupplementCount,
    canUserInput,
    canUserWatch,
    showBiddingStatus
  } = useAgentStates(sessionId)

  return (
    <div className="unified-bidding-stage">
      {/* 阶段状态栏 */}
      <PhaseStatusBar
        phase={currentPhase}
        timeRemaining={timeRemaining}
        description={getPhaseDescription(currentPhase)}
      />

      {/* 主要内容区域 */}
      <div className="main-content">
        {/* AI专家面板网格 */}
        <div className="agents-grid">
          {AI_PERSONAS.map(agent => (
            <AgentDialogPanel
              key={agent.id}
              agent={agent}
              state={agentStates[agent.id] || getDefaultAgentState(agent.id)}
              isActive={activeSpeaker === agent.id}
              currentPhase={currentPhase}
              onSupport={() => handleSupportAgent(agent.id)}
              showDialogBubble={canUserWatch}
              showBiddingStatus={showBiddingStatus}
            />
          ))}
        </div>

        {/* 用户交互区域 */}
        <div className="user-interaction-area">
          {currentPhase === BiddingPhase.IDEA_INPUT && (
            <IdeaInputPanel
              onSubmit={handleIdeaSubmit}
              defaultContent={ideaContent}
              isLoading={isSubmitting}
            />
          )}

          {currentPhase === BiddingPhase.USER_SUPPLEMENT && (
            <SupplementInputPanel
              supplementCount={userSupplementCount}
              maxSupplement={3}
              onSubmit={handleSupplementSubmit}
              placeholder="您可以补充完善您的创意描述..."
            />
          )}

          {!canUserInput && canUserWatch && (
            <ViewerPanel
              phase={currentPhase}
              message={getViewerMessage(currentPhase)}
              showProgress={true}
            />
          )}
        </div>
      </div>

      {/* 竞价状态面板 */}
      {showBiddingStatus && (
        <BiddingStatusPanel
          highestBid={getHighestBid(agentStates)}
          highestBidder={getHighestBidder(agentStates)}
          viewerCount={viewerCount}
          connectionStatus={connectionStatus}
        />
      )}

      {/* 结果展示 */}
      {currentPhase === BiddingPhase.RESULT_DISPLAY && (
        <ResultDisplayPanel
          winningAgent={getWinningAgent(agentStates)}
          finalBid={getFinalBid(agentStates)}
          onGenerateBusinessPlan={handleGenerateBusinessPlan}
        />
      )}
    </div>
  )
}
```

### 3. 辅助组件

#### PhaseStatusBar
```tsx
const PhaseStatusBar = ({ phase, timeRemaining, description }: PhaseStatusBarProps) => {
  const phaseInfo = PHASE_DISPLAY_INFO[phase]

  return (
    <Card className="phase-status-bar">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <div className={`phase-icon ${phaseInfo.color}`}>
            <phaseInfo.icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{phaseInfo.title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        {timeRemaining > 0 && (
          <div className="time-display">
            <div className="text-2xl font-bold">
              {formatTime(timeRemaining)}
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="w-4 h-4" />
              剩余时间
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

#### SpeakingIndicator
```tsx
const SpeakingIndicator = ({ intensity }: { intensity: number }) => {
  return (
    <div className="speaking-indicator">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="wave-bar"
          animate={{
            scaleY: [1, intensity * 2, 1],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1
          }}
        />
      ))}
    </div>
  )
}
```

## 📱 响应式设计

### 布局断点
```css
/* 桌面端 (>= 1024px) */
.agents-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1.5rem;
}

/* 平板端 (768px - 1023px) */
@media (max-width: 1023px) {
  .agents-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .agents-grid .agent-panel:nth-child(4),
  .agents-grid .agent-panel:nth-child(5) {
    grid-column: span 1.5;
    justify-self: center;
  }
}

/* 手机端 (< 768px) */
@media (max-width: 767px) {
  .agents-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .agents-grid .agent-panel:nth-child(5) {
    grid-column: span 2;
    justify-self: center;
  }

  .dialog-bubble {
    font-size: 0.875rem;
    max-width: 150px;
  }
}
```

## 🔄 实施步骤

### 第一阶段：核心组件开发 (3-4天)
1. **Day 1**: 开发 `AgentDialogPanel` 组件
   - 基础布局和样式
   - 状态显示逻辑
   - 动画效果实现

2. **Day 2**: 开发 `useAgentStates` Hook
   - 状态管理逻辑
   - WebSocket消息处理
   - 阶段转换控制

3. **Day 3**: 开发 `UnifiedBiddingStage` 主组件
   - 整体布局实现
   - 组件集成
   - 基础交互逻辑

4. **Day 4**: 辅助组件开发
   - `PhaseStatusBar`
   - `SpeakingIndicator`
   - `ThinkingIndicator`

### 第二阶段：数据层集成 (2-3天)
1. **Day 5**: WebSocket协议扩展
   - 新消息类型实现
   - 服务端消息处理
   - 前端消息解析

2. **Day 6**: 状态同步优化
   - 实时状态更新
   - 错误处理机制
   - 重连逻辑

3. **Day 7**: 阶段流程实现
   - 自动阶段转换
   - 用户权限控制
   - 补充功能实现

### 第三阶段：体验优化 (2-3天)
1. **Day 8**: 动画和视觉效果
   - 说话动画优化
   - 思考状态显示
   - 情感表达动画

2. **Day 9**: 响应式适配
   - 移动端布局
   - 平板端优化
   - 触摸交互

3. **Day 10**: 性能优化和测试
   - 组件性能优化
   - 内存泄漏检查
   - 全流程测试

### 第四阶段：集成和部署 (1-2天)
1. **Day 11**: 与现有系统集成
   - 替换旧组件
   - 路由配置
   - 兼容性测试

2. **Day 12**: 生产部署
   - 部署配置
   - 监控设置
   - 用户验收测试

## 🧪 测试计划

### 功能测试
- [ ] 创意输入阶段AI状态显示
- [ ] AI专家热身对话
- [ ] AI深度讨论和竞价
- [ ] 用户补充功能 (3次限制)
- [ ] 阶段自动转换
- [ ] 最终结果展示

### 性能测试
- [ ] 组件渲染性能
- [ ] WebSocket连接稳定性
- [ ] 内存使用情况
- [ ] 移动端流畅度

### 兼容性测试
- [ ] 桌面端浏览器 (Chrome, Firefox, Safari, Edge)
- [ ] 移动端浏览器 (iOS Safari, Android Chrome)
- [ ] 平板端适配
- [ ] 网络异常处理

## 📈 成功指标

### 用户体验指标
- 🎯 用户在AI讨论阶段的停留时间 > 80%
- 🎯 用户对AI角色认知度 > 85%
- 🎯 阶段转换的流畅度感知 > 90%
- 🎯 用户补充功能使用率 > 60%

### 技术指标
- 🔧 组件渲染时间 < 100ms
- 🔧 WebSocket消息延迟 < 200ms
- 🔧 移动端首屏加载 < 2s
- 🔧 内存占用增长 < 20%

## 🚀 未来扩展

### 短期优化 (1-2个月)
- 🔜 AI语音合成集成
- 🔜 更丰富的情感动画
- 🔜 用户头像和状态显示
- 🔜 观众互动功能

### 长期规划 (3-6个月)
- 🚀 AI角色个性化训练
- 🚀 多语言支持
- 🚀 VR/AR 沉浸式体验
- 🚀 AI角色定制功能

---

**💡 这个实施方案将创造一个前所未有的AI专家竞价体验，让用户真正感受到AI团队的智慧碰撞和专业竞价！**