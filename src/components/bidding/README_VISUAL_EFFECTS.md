# AI Agent 说话视觉效果系统

## 概述

这个系统为AI竞价舞台提供了丰富的视觉效果，当AI Agent说话时能够吸引用户注意力，提升互动体验。

## 功能特性

### 🎨 **多种视觉效果**
- **聚光灯模式**: 突出说话者，其他Agent变暗
- **发光边框**: 柔和的光晕效果
- **脉冲圈层**: 从内向外的脉冲扩散
- **声波效果**: 模拟真实声音传播的波纹
- **动态粒子**: 背景粒子动画
- **头像动画**: 说话时的头像呼吸/摆动效果

### 🔧 **智能适应**
- **阶段适配**: 不同竞价阶段使用不同效果强度
- **内容感知**: 根据消息类型和情感调整效果
- **性能优化**: 自动检测设备性能并推荐合适方案
- **用户偏好**: 支持个性化效果配置

## 组件结构

```
src/components/bidding/
├── EnhancedAIPersonaStage.tsx      # 增强的AI角色卡片
├── AIPersonaSceneManager.tsx       # 场景管理器
├── EnhancedBiddingStage.tsx        # 完整的竞价舞台
src/lib/
└── visual-effects-config.ts        # 视觉效果配置
```

## 使用方法

### 1. 基础用法

```tsx
import AIPersonaSceneManager from '@/components/bidding/AIPersonaSceneManager'

<AIPersonaSceneManager
  messages={aiMessages}
  currentBids={currentBids}
  activeSpeaker={activeSpeaker}
  onSupportPersona={handleSupportPersona}
  effectStyle="all"
  enableDimming={true}
  enableFocusMode={true}
/>
```

### 2. 自定义效果

```tsx
import EnhancedBiddingStage from '@/components/bidding/EnhancedBiddingStage'

<EnhancedBiddingStage
  ideaId={ideaId}
  messages={messages}
  currentBids={currentBids}
  activeSpeaker={activeSpeaker}
  currentPhase="bidding"
  onSupportPersona={handleSupport}
/>
```

### 3. 单个AI角色

```tsx
import EnhancedAIPersonaStage from '@/components/bidding/EnhancedAIPersonaStage'

<EnhancedAIPersonaStage
  persona={persona}
  isActive={false}
  isSpeaking={true}
  currentBid={250}
  messages={personaMessages}
  onSupport={handleSupport}
  speakingIntensity={0.8}
  effectStyle="glow"
/>
```

## 配置选项

### 效果预设

```typescript
// 6种预设效果方案
'spotlight'   // 聚光灯模式 - 专注性强
'glow'        // 光芒模式 - 优雅柔和
'pulse'       // 脉冲模式 - 强烈提示
'soundwave'   // 声波模式 - 动态传播
'festival'    // 节日模式 - 华丽庆祝
'minimal'     // 简约模式 - 专业场景
'all'         // 完整体验 - 所有效果
```

### 阶段适配

```typescript
// 系统会根据竞价阶段自动调整效果
'warmup'      // 预热: 温和效果
'discussion'  // 讨论: 中等效果
'bidding'     // 竞价: 强烈效果
'prediction'  // 预测: 互动效果
'result'      // 结果: 庆祝效果
```

### 性能优化

```typescript
// 自动检测并推荐合适配置
const perfCheck = checkPerformanceOptimization()
// 返回: { canUseFullEffects, recommendedPreset, reasons }
```

## 集成到现有组件

### 步骤1: 替换现有AI角色展示

将现有的AI角色卡片组件替换为 `AIPersonaSceneManager`：

```tsx
// 原来的代码
{AI_PERSONAS.map((persona) => (
  <AIPersonaCard key={persona.id} ... />
))}

// 替换为
<AIPersonaSceneManager
  messages={aiMessages}
  currentBids={currentBids}
  activeSpeaker={activeSpeaker}
  onSupportPersona={handleSupportPersona}
/>
```

### 步骤2: 添加说话状态管理

确保你有说话状态的数据源：

```tsx
const [currentSpeaker, setCurrentSpeaker] = useState<string>()
const [speakingIntensity, setSpeakingIntensity] = useState<number>(0.8)

// 当有新消息时设置说话状态
useEffect(() => {
  if (newMessage) {
    setCurrentSpeaker(newMessage.personaId)

    // 2-8秒后清除说话状态
    setTimeout(() => {
      setCurrentSpeaker(undefined)
    }, calculateSpeakingDuration(newMessage.content))
  }
}, [newMessage])
```

### 步骤3: 添加效果控制(可选)

如果需要用户控制效果：

```tsx
import { VISUAL_EFFECT_PRESETS } from '@/lib/visual-effects-config'

const [effectStyle, setEffectStyle] = useState('all')
const [showEffectControls, setShowEffectControls] = useState(false)
```

## API 参考

### EnhancedAIPersonaStage Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|-------|------|
| `persona` | `AIPersona` | - | AI角色信息 |
| `isActive` | `boolean` | - | 是否为活跃状态 |
| `isSpeaking` | `boolean` | - | 是否正在说话 |
| `currentBid` | `number` | - | 当前竞价金额 |
| `messages` | `AIMessage[]` | - | 该角色的消息历史 |
| `onSupport` | `() => void` | - | 支持按钮回调 |
| `speakingIntensity` | `number` | `0.8` | 说话强度 0-1 |
| `effectStyle` | `EffectStyle` | `'all'` | 效果风格 |

### AIPersonaSceneManager Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|-------|------|
| `messages` | `AIMessage[]` | - | 所有AI消息 |
| `currentBids` | `Record<string, number>` | - | 当前竞价状态 |
| `activeSpeaker` | `string?` | - | 当前活跃说话者ID |
| `onSupportPersona` | `(id: string) => void` | - | 支持角色回调 |
| `effectStyle` | `EffectStyle` | `'all'` | 效果风格 |
| `enableDimming` | `boolean` | `true` | 启用背景变暗 |
| `enableFocusMode` | `boolean` | `true` | 启用聚焦模式 |

## 自定义扩展

### 添加新的视觉效果

1. 在 `visual-effects-config.ts` 中添加新的效果类型
2. 在 `EnhancedAIPersonaStage.tsx` 中实现效果逻辑
3. 更新配置预设

### 自定义说话检测逻辑

```tsx
// 自定义说话持续时间计算
const calculateCustomDuration = (content: string, type: string) => {
  const baseTime = 1500
  const typeMultiplier = type === 'bid' ? 1.5 : 1.0
  return Math.min(baseTime + content.length * 30 * typeMultiplier, 10000)
}
```

### 添加音效支持

```tsx
// 在说话时播放音效
useEffect(() => {
  if (isSpeaking && enableSound) {
    const audio = new Audio('/sounds/speaking.mp3')
    audio.volume = 0.3
    audio.play().catch(() => {}) // 忽略自动播放限制错误
  }
}, [isSpeaking, enableSound])
```

## 最佳实践

### 性能考虑
- 在低端设备上使用 'minimal' 或 'glow' 预设
- 避免同时启用过多视觉效果
- 监听设备性能变化并动态调整

### 用户体验
- 根据竞价阶段自动调整效果强度
- 提供用户自定义选项但设置合理默认值
- 在关键时刻（如竞价）使用更强烈的效果

### 可访问性
- 提供关闭动画的选项
- 确保在禁用效果时核心功能仍可用
- 考虑使用 `prefers-reduced-motion` 媒体查询

## 故障排除

### 常见问题

**Q: 效果不显示？**
A: 检查是否正确传递了 `isSpeaking` 状态，确保消息数据格式正确。

**Q: 性能问题？**
A: 使用 `checkPerformanceOptimization()` 检测并切换到推荐的轻量级预设。

**Q: 效果太强烈？**
A: 调整 `speakingIntensity` 参数或切换到 'glow' 或 'minimal' 预设。

### 调试模式

```tsx
// 开启详细日志
const DEBUG_EFFECTS = process.env.NODE_ENV === 'development'

if (DEBUG_EFFECTS) {
  console.log('Speaking state:', { personaId, intensity, duration })
}
```

这个视觉效果系统将大大提升AI竞价舞台的用户体验，让用户更容易跟踪AI对话并保持注意力集中！