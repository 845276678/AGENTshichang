# AI Agent 对话框系统设计文档

## 🎯 设计目标

基于用户反馈，设计一个完整的5位AI Agent对话框系统，让用户在创意输入阶段就能看到5位AI专家，并在整个竞价流程中保持沉浸式体验。

## 📊 当前状况分析

### 现有组件结构
```
StageBasedBidding.tsx
├── CreativeInputForm (创意输入表单)
│   └── 静态AI专家展示区域 (5位agent头像 + 基础信息)
└── EnhancedBiddingStage (增强竞价舞台)
    └── AIPersonaSceneManager
        └── EnhancedAIPersonaStage (单个agent展示)
```

### 现存问题
1. **创意输入阶段**：5位AI专家只是静态头像展示，缺乏对话框
2. **交互断层**：输入创意后直接跳转到竞价舞台，体验不连贯
3. **用户参与时机错误**：用户从开始就能参与，没有纯观看阶段
4. **Agent状态缺失**：无法看到Agent的实时思考和讨论状态

## 🎨 新设计方案

### 1. 整体布局改进

#### 创意输入阶段 - 增强版AI专家面板
```
┌─────────────────────────────────────────────────────────────┐
│                    🎁 AI创意竞价舞台                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐               │
│  │艾克斯│  │老王 │  │小琳 │  │阿伦 │  │李博 │               │
│  │[💭] │  │[💭] │  │[💭] │  │[💭] │  │[💭] │               │
│  │ 等待 │  │ 等待 │  │ 等待 │  │ 等待 │  │ 等待 │               │
│  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘               │
├─────────────────────────────────────────────────────────────┤
│                   [创意输入表单]                            │
│               [开始AI专家评估]                              │
└─────────────────────────────────────────────────────────────┘
```

#### 竞价进行阶段 - 完整对话展示
```
┌─────────────────────────────────────────────────────────────┐
│           当前阶段: AI专家深度讨论 [3:45] ⏱️                │
├─────────────────────────────────────────────────────────────┤
│ 艾克斯💻   老王💰    小琳🎨    阿伦📈    李博📚            │
│ ┌─────────┐┌─────────┐┌─────────┐┌─────────┐┌─────────┐      │
│ │"这个架构││"从商业角││"用户体验││"营销潜力││"需要更多│      │
│ │ 很有前景"││ 度来看..."│"角度..."│"不错..."│"数据支撑"│      │
│ │ [活跃]  ││         ││         ││         ││         │      │
│ └─────────┘└─────────┘└─────────┘└─────────┘└─────────┘      │
│                                                             │
│ 💰 当前最高出价: 350元 (老王)                               │
│ 👥 观众: 1  🔗 连接状态: ✅ 已连接                         │
└─────────────────────────────────────────────────────────────┘
```

### 2. 新增组件设计

#### AgentDialogPanel 组件
```typescript
interface AgentDialogPanelProps {
  agent: AIPersona
  currentMessage?: string
  isActive: boolean
  isSpeaking: boolean
  currentBid?: number
  phase: 'waiting' | 'thinking' | 'speaking' | 'bidding'
  onSupport?: () => void
}
```

**特性：**
- 💭 思考气泡显示
- 🗣️ 实时对话内容
- ⚡ 说话状态动画
- 💰 出价状态显示
- 🎯 用户支持功能

#### EnhancedCreativeInput 组件
```typescript
interface EnhancedCreativeInputProps {
  onIdeaSubmit: (idea: string) => void
  aiAgents: AIPersona[]
  agentStates: Record<string, AgentState>
  isLoading: boolean
}
```

**新增功能：**
- 🤖 5位Agent实时状态显示
- 💬 Agent预热对话展示
- 🎪 动态等待动画
- 📱 响应式布局

### 3. 流程重构

#### 新的阶段流程
```typescript
type BiddingPhase =
  | 'input'           // 用户输入创意
  | 'agent_warmup'    // AI专家预热讨论
  | 'agent_analysis'  // AI专家深度分析
  | 'agent_bidding'   // AI专家竞价阶段
  | 'user_supplement' // 用户补充阶段 (3次机会)
  | 'final_bidding'   // 最终竞价
  | 'result'          // 结果展示
```

#### 交互权限控制
```typescript
interface PhasePermissions {
  canUserInput: boolean
  canUserWatch: boolean
  showAgentDialog: boolean
  showBiddingStatus: boolean
  userSupplementCount: number
  maxSupplementCount: 3
}

const PHASE_PERMISSIONS: Record<BiddingPhase, PhasePermissions> = {
  'input': { canUserInput: true, canUserWatch: false, showAgentDialog: true, showBiddingStatus: false, userSupplementCount: 0, maxSupplementCount: 3 },
  'agent_warmup': { canUserInput: false, canUserWatch: true, showAgentDialog: true, showBiddingStatus: false, userSupplementCount: 0, maxSupplementCount: 3 },
  'agent_analysis': { canUserInput: false, canUserWatch: true, showAgentDialog: true, showBiddingStatus: true, userSupplementCount: 0, maxSupplementCount: 3 },
  'agent_bidding': { canUserInput: false, canUserWatch: true, showAgentDialog: true, showBiddingStatus: true, userSupplementCount: 0, maxSupplementCount: 3 },
  'user_supplement': { canUserInput: true, canUserWatch: true, showAgentDialog: true, showBiddingStatus: true, userSupplementCount: 0, maxSupplementCount: 3 },
  'final_bidding': { canUserInput: false, canUserWatch: true, showAgentDialog: true, showBiddingStatus: true, userSupplementCount: 3, maxSupplementCount: 3 },
  'result': { canUserInput: false, canUserWatch: true, showAgentDialog: true, showBiddingStatus: true, userSupplementCount: 3, maxSupplementCount: 3 }
}
```

### 4. 具体实现方案

#### A. 统一的Agent状态管理
```typescript
interface AgentState {
  id: string
  phase: 'idle' | 'thinking' | 'speaking' | 'bidding' | 'waiting'
  currentMessage?: string
  currentBid?: number
  emotion: 'neutral' | 'excited' | 'confident' | 'worried' | 'aggressive'
  lastActivity: Date
  thinkingDuration?: number
  speakingIntensity: number // 0-1
}

// 全局Agent状态管理
const useAgentStates = () => {
  const [agentStates, setAgentStates] = useState<Record<string, AgentState>>({})
  const [currentPhase, setCurrentPhase] = useState<BiddingPhase>('input')

  // 从WebSocket更新Agent状态
  const updateAgentState = (agentId: string, update: Partial<AgentState>) => {
    setAgentStates(prev => ({
      ...prev,
      [agentId]: { ...prev[agentId], ...update }
    }))
  }

  return { agentStates, currentPhase, updateAgentState }
}
```

#### B. 增强的WebSocket消息处理
```typescript
// 新增消息类型
type WSMessageType =
  | 'agent_thinking'    // Agent开始思考
  | 'agent_speaking'    // Agent开始说话
  | 'agent_message'     // Agent发送消息
  | 'agent_bid'         // Agent出价
  | 'phase_transition'  // 阶段转换
  | 'user_input_allowed' // 允许用户输入

// 消息处理增强
const handleWSMessage = (data: WSMessage) => {
  switch (data.type) {
    case 'agent_thinking':
      updateAgentState(data.agentId, {
        phase: 'thinking',
        thinkingDuration: data.duration
      })
      break

    case 'agent_speaking':
      updateAgentState(data.agentId, {
        phase: 'speaking',
        currentMessage: data.message,
        speakingIntensity: data.intensity
      })
      break

    case 'user_input_allowed':
      setCurrentPhase('user_supplement')
      setUserSupplementCount(data.remainingCount)
      break
  }
}
```

#### C. UI组件优化

**AgentDialogPanel组件**：
```typescript
const AgentDialogPanel = ({ agent, currentMessage, isActive, isSpeaking, phase }: AgentDialogPanelProps) => {
  return (
    <motion.div
      className={`agent-panel ${isActive ? 'active' : ''}`}
      animate={isSpeaking ? { scale: 1.05 } : { scale: 1 }}
    >
      {/* Agent头像 */}
      <div className="agent-avatar">
        <img src={agent.avatar} alt={agent.name} />
        {isSpeaking && <SpeakingIndicator intensity={speakingIntensity} />}
      </div>

      {/* Agent状态 */}
      <div className="agent-status">
        <h4>{agent.name}</h4>
        <Badge variant={getPhaseColor(phase)}>{getPhaseText(phase)}</Badge>
      </div>

      {/* 对话气泡 */}
      <AnimatePresence>
        {currentMessage && (
          <motion.div
            className="dialog-bubble"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {currentMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 支持按钮 */}
      {phase === 'bidding' && (
        <Button size="sm" onClick={onSupport}>
          支持 ({currentBid}积分)
        </Button>
      )}
    </motion.div>
  )
}
```

**统一舞台布局**：
```typescript
const UnifiedBiddingStage = () => {
  const { agentStates, currentPhase } = useAgentStates()
  const permissions = PHASE_PERMISSIONS[currentPhase]

  return (
    <div className="unified-bidding-stage">
      {/* 阶段状态栏 */}
      <PhaseStatusBar phase={currentPhase} timeRemaining={timeRemaining} />

      {/* 5位Agent面板 */}
      <div className="agents-panel-grid">
        {AI_PERSONAS.map(agent => (
          <AgentDialogPanel
            key={agent.id}
            agent={agent}
            currentMessage={agentStates[agent.id]?.currentMessage}
            isActive={activeSpeaker === agent.id}
            isSpeaking={agentStates[agent.id]?.phase === 'speaking'}
            phase={agentStates[agent.id]?.phase || 'idle'}
            currentBid={currentBids[agent.id]}
            onSupport={() => supportPersona(agent.id)}
          />
        ))}
      </div>

      {/* 用户交互区域 */}
      {permissions.canUserInput && (
        <UserInputPanel
          phase={currentPhase}
          supplementCount={userSupplementCount}
          maxSupplement={permissions.maxSupplementCount}
          onSubmit={handleUserInput}
        />
      )}

      {/* 竞价状态显示 */}
      {permissions.showBiddingStatus && (
        <BiddingStatusPanel
          highestBid={highestBid}
          viewerCount={viewerCount}
          connectionStatus={connectionStatus}
        />
      )}
    </div>
  )
}
```

### 5. 保留和优化现有功能

#### 保留的组件
- ✅ `EnhancedBiddingStage` - 作为新系统的基础
- ✅ `AIPersonaSceneManager` - 整合到新的Agent状态管理
- ✅ `useBiddingWebSocket` - 扩展消息类型处理
- ✅ 视觉效果系统 - 整合到新的对话框中

#### 优化点
- 🔄 统一状态管理，避免重复渲染
- 🎨 一致的视觉设计语言
- 📱 响应式布局优化
- ⚡ 性能优化，减少不必要的re-render

## 📋 实施步骤

### 第一阶段：基础组件开发
1. 创建 `AgentDialogPanel` 组件
2. 开发 `UnifiedBiddingStage` 布局
3. 实现 `useAgentStates` Hook
4. 扩展WebSocket消息处理

### 第二阶段：流程集成
1. 重构 `StageBasedBidding` 主流程
2. 集成新的阶段控制系统
3. 实现用户补充功能
4. 测试阶段转换逻辑

### 第三阶段：体验优化
1. 动画效果调优
2. 响应式布局测试
3. 性能优化
4. 用户体验测试

## 🎯 预期效果

### 用户体验改进
- 🎪 **沉浸式观看**：从输入创意开始就能看到AI专家的互动
- 👀 **清晰的阶段感知**：用户明确知道什么时候观看，什么时候参与
- 🎭 **真实的AI人格**：每个Agent都有独特的对话风格和反应
- 🔄 **流畅的转换**：阶段之间无缝衔接，不会突然跳转

### 技术优势
- 🏗️ **统一架构**：所有AI展示逻辑集中管理
- 🚀 **性能优化**：避免重复组件和状态冲突
- 🔧 **易于维护**：清晰的组件层次和职责分离
- 📈 **可扩展性**：容易添加新的Agent或交互功能

## 🤔 待确认问题

1. **对话内容长度**：Agent对话气泡最多显示多少字符？
2. **动画强度**：说话动画的强度和持续时间如何设置？
3. **布局响应**：移动端如何展示5个Agent面板？
4. **状态持久化**：刷新页面后是否需要保持Agent状态？

---

**💡 这个设计将创造一个真正沉浸式的AI竞价体验，让用户感觉自己在观看一场真实的专家讨论和竞价表演！**