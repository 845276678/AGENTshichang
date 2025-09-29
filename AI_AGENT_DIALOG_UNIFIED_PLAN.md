# AI Agent 对话框系统 - 完整实施方案

## 项目概述
基于现有的 AI 创意竞价舞台系统，本方案在不破坏 15-45 分钟竞价体验的前提下，引入“对话框模式”。用户在提交创意的第一时间即可看到五位 AI 专家的状态与观点，从而获得连贯、沉浸的陪伴感。

## 核心目标
- 保留现有舞台展示、竞价机制与混合模型调用策略。
- 在创意输入阶段即展示 AI 专家的气泡、状态与情绪反馈。
- 明确观看与参与阶段的权限边界，降低用户迷惑度。
- 延续 DeepSeek、智谱 GLM、通义千问等真实模型的调用，同时控制预算。
- 为语音播报、音效、AR/VR 等后续能力保留扩展接口。

## 系统架构整合
- 表层 UI：UnifiedBiddingStage、AgentDialogPanel(×5)、PhaseStatusBar、UserInteractionPanel。
- 业务服务：DialogueDecisionEngine、TemplateManager、AIServiceManager、useAgentStates、AgentStateManager、PhasePermissionManager。
- 数据与集成：WebSocket 通道、AI API、成本监控、日志埋点。
- 基础设施：任务队列、缓存、特征开关与 A/B 实验（沿用现有实现）。

## 核心需求梳理
### 已有能力
1. DeepSeek、智谱 GLM、通义千问 API 已完成集成。
2. 支持成本优化的混合对话触发策略。
3. 五位 AI 人设、模板与声音设定体系。
4. 舞台化界面与实时 WebSocket 推送。
5. 预热 → 讨论 → 竞价 → 预测 → 结果 的完整流程。

### 待增强能力
1. 对话气泡与状态在各阶段的实时展示。
2. AI 思考、说话、竞价等行为的视觉化呈现。
3. 用户权限与阶段切换的统一配置与校验。
4. 创意输入阶段的体验优化与连贯引导。
5. 对 0 出价场景的展示与逻辑兜底。

## 阶段流程与权限
```typescript
export enum BiddingPhase {
  IDEA_INPUT = 'idea_input',
  AGENT_WARMUP = 'warmup',
  AGENT_DISCUSSION = 'discussion',
  AGENT_BIDDING = 'bidding',
  USER_SUPPLEMENT = 'prediction',
  RESULT_DISPLAY = 'result'
}
```

```typescript
interface PhasePermissions {
  canUserInput: boolean;
  canUserWatch: boolean;
  showAgentDialog: boolean;
  showBiddingStatus: boolean;
  userSupplementAllowed: boolean;
}

export const PHASE_PERMISSIONS: Record<BiddingPhase, PhasePermissions> = {
  [BiddingPhase.IDEA_INPUT]: {
    canUserInput: true,
    canUserWatch: true,
    showAgentDialog: true,
    showBiddingStatus: false,
    userSupplementAllowed: false
  },
  [BiddingPhase.AGENT_WARMUP]: {
    canUserInput: false,
    canUserWatch: true,
    showAgentDialog: true,
    showBiddingStatus: false,
    userSupplementAllowed: false
  },
  [BiddingPhase.AGENT_DISCUSSION]: {
    canUserInput: false,
    canUserWatch: true,
    showAgentDialog: true,
    showBiddingStatus: true,
    userSupplementAllowed: false
  },
  [BiddingPhase.AGENT_BIDDING]: {
    canUserInput: false,
    canUserWatch: true,
    showAgentDialog: true,
    showBiddingStatus: true,
    userSupplementAllowed: false
  },
  [BiddingPhase.USER_SUPPLEMENT]: {
    canUserInput: true,
    canUserWatch: true,
    showAgentDialog: true,
    showBiddingStatus: true,
    userSupplementAllowed: true
  },
  [BiddingPhase.RESULT_DISPLAY]: {
    canUserInput: false,
    canUserWatch: true,
    showAgentDialog: true,
    showBiddingStatus: true,
    userSupplementAllowed: false
  }
};
```

## Agent 对话框系统设计
```typescript
interface AgentDialogPanelProps {
  agent: AIPersona;
  state: AgentState;
  isActive: boolean;
  currentPhase: BiddingPhase;
  onSupport: () => void;
  messages: AIMessage[];
  currentBid?: number;
}

interface AgentState {
  id: string;
  phase: 'idle' | 'thinking' | 'speaking' | 'bidding' | 'waiting';
  emotion: 'neutral' | 'excited' | 'confident' | 'worried' | 'aggressive';
  currentMessage?: string;
  confidence: number;
  lastActivity: Date;
  speakingIntensity: number;
  thinkingDuration?: number;
  isSupported?: boolean;
}
```

### 组件结构
```tsx
const AgentDialogPanel = ({ agent, state, isActive, currentPhase, onSupport, currentBid }: AgentDialogPanelProps) => {
  const showBidInfo = currentBid !== undefined && currentPhase === BiddingPhase.AGENT_BIDDING;

  return (
    <motion.div className="agent-panel-container" animate={isActive ? { scale: 1.05 } : { scale: 1 }}>
      <div className="agent-avatar-section">
        <motion.div className="agent-avatar" animate={state.phase === 'speaking' ? { scale: 1.1 } : { scale: 1 }}>
          <img src={agent.avatar} alt={agent.name} />
          {state.phase === 'speaking' && <SpeakingIndicator intensity={state.speakingIntensity} />}
          {state.phase === 'thinking' && <ThinkingIndicator duration={state.thinkingDuration} />}
        </motion.div>
        <Badge className={getStateColor(state.phase)}>{getStateDisplayName(state.phase)}</Badge>
      </div>

      <div className="agent-info">
        <h4 className="agent-name">{agent.name}</h4>
        <p className="agent-specialty">{agent.specialty}</p>
      </div>

      <AnimatePresence>
        {state.currentMessage && (
          <motion.div
            className="dialog-bubble"
            initial={{ opacity: 0, y: 12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
          >
            <div className="bubble-content">{state.currentMessage}</div>
            <div className="bubble-tail" />
            <div className="message-timestamp">{formatTime(state.lastActivity)}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {showBidInfo && (
        <div className="bidding-status">
          <div className="bid-amount">¥ {currentBid}</div>
          <Progress value={state.confidence * 100} className="confidence-bar" />
        </div>
      )}

      {currentPhase === BiddingPhase.USER_SUPPLEMENT && (
        <Button size="sm" onClick={onSupport} variant={state.isSupported ? 'default' : 'outline'}>
          {state.isSupported ? '已支持' : `支持 ${agent.name}`}
        </Button>
      )}
    </motion.div>
  );
};
```

### 状态与动画映射
```typescript
const AGENT_STATE_COLORS: Record<AgentState['phase'], string> = {
  idle: 'bg-slate-100 text-slate-600',
  thinking: 'bg-blue-100 text-blue-700',
  speaking: 'bg-emerald-100 text-emerald-700',
  bidding: 'bg-amber-100 text-amber-700',
  waiting: 'bg-purple-100 text-purple-700'
};

const EMOTION_ANIMATIONS: Record<AgentState['emotion'], MotionProps> = {
  neutral: { animate: { scale: 1 } },
  excited: { animate: { scale: [1, 1.08, 1] }, transition: { repeat: Infinity, duration: 0.6 } },
  confident: { animate: { scale: [1, 1.04, 1] }, transition: { repeat: Infinity, duration: 0.9 } },
  worried: { animate: { x: [-2, 2, -2, 0] }, transition: { repeat: Infinity, duration: 0.5 } },
  aggressive: { animate: { scale: [1, 1.12, 1] }, transition: { repeat: Infinity, duration: 0.4 } }
};
```

## 状态管理与消息扩展
- 扩展 useAgentStates：新增情绪、思考时长、支持状态、最近一次出价等字段。
- WebSocket 消息类型新增：`agent_thinking`、`agent_speaking`、`agent_bidding`、`agent_emotion_change`、`agent_bid_update`（允许 0 出价）、`user_permission_update`。
- 每条消息需带时间戳和追踪 ID，以便回放和监控。
- 对 0 出价消息，前端直接展示 `¥ 0`，并在状态条上保持突出，避免用户误判为无响应。

## 用户交互流程
1. 用户在 `IDEA_INPUT` 阶段填写创意，右侧同时展示五位 AI 的等待态和欢迎语。
2. 进入 `AGENT_WARMUP` 后，用户只读，气泡显示思考动画，底部出现阶段倒计时。
3. `AGENT_DISCUSSION` 阶段，气泡轮流输出观点，支持热度条渐进更新。
4. `AGENT_BIDDING` 阶段，显示竞价金额（允许 0），同时维护信心度进度条。
5. `USER_SUPPLEMENT` 阶段开放按钮，用户可对三次补充机会进行投票或加价。
6. `RESULT_DISPLAY` 阶段收束对话，展示最终名次、预算消耗和推荐结果。

## 响应式布局原则
```css
.agents-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(200px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 1279px) {
  .agents-grid {
    grid-template-columns: repeat(3, minmax(200px, 1fr));
  }
}

@media (max-width: 767px) {
  .agents-grid {
    grid-template-columns: repeat(2, minmax(160px, 1fr));
  }
  .agents-grid .agent-panel-container:last-child {
    grid-column: span 2;
  }
}
```

## 实施步骤
- 第 1 天：搭建 `AgentDialogPanel` 基础组件，完成对话气泡与状态指示器。
- 第 2 天：扩展 `useAgentStates`、集成权限与阶段配置、完成 WebSocket 解包。
- 第 3 天：补齐动画细节、响应式布局、无障碍标签、0 出价展示。
- 第 4 天：重构 `UnifiedBiddingStage`，串联新面板并完成回放兼容。
- 第 5 天：扩展 WebSocket 服务端消息，完成性能调优与灰度开关。
- 第 6 天：全量功能与响应式测试、E2E 用例、观测指标校验。
- 第 7 天：生产部署、监控面板、用户反馈收集与文档更新。

## 成功指标
- 创意输入阶段平均停留时长提升 30% 以上。
- 用户对 AI 角色记忆度 ≥ 80%。
- 对话真实感满意度 ≥ 85%。
- 组件平均渲染耗时 < 100 ms，WebSocket 延迟 < 200 ms，移动端帧率 ≥ 60 fps。

## 技术依赖与环境
- Next.js 14（App Router）、TypeScript、Framer Motion。
- Tailwind CSS、Radix UI、现有 WebSocket 服务。
- 保持 DeepSeek、智谱 GLM、通义千问三方模型接入不变。
- 可选依赖：`react-spring`（高级动画）、`use-sound`（音效）。

## 未来扩展
- 短期：音效系统、用户头像、丰富情绪动画、移动端触摸优化。
- 中期：语音合成、个性化主题、观众弹幕、投票榜单。
- 长期：3D 虚拟形象、VR/AR 体验、多语言扩展、角色定制。

## 风险与保障
- 采用渐进式上线（灰度 + A/B 测试），随时可回滚至旧界面。
- 加强性能与成本监控，异常时降级为文字+静态模板方案。
- 完善错误处理与空数据兜底（包含 0 出价、延迟、断线场景）。
