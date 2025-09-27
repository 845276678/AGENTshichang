// AI Agent 说话视觉效果配置
export interface VisualEffectConfig {
  id: string
  name: string
  description: string
  effects: {
    spotlight: boolean    // 聚光灯效果（其他Agent变暗）
    glow: boolean        // 发光边框效果
    pulse: boolean       // 脉冲圈层效果
    soundwave: boolean   // 声波扩散效果
    particles: boolean   // 动态粒子效果
    avatarAnimation: boolean // 头像动画
    backgroundShimmer: boolean // 背景闪烁
    focusMode: boolean   // 聚焦模式
  }
  colors: {
    primary: string      // 主色调
    accent: string       // 强调色
    glow: string         // 发光色
    pulse: string        // 脉冲色
  }
  animations: {
    intensity: number    // 动画强度 0-1
    speed: number        // 动画速度倍数
    duration: number     // 持续时间系数
  }
  sounds?: {
    enabled: boolean
    volume: number       // 音效音量 0-1
    pitchVariation: boolean // 音调变化
  }
}

// 预设效果方案
export const VISUAL_EFFECT_PRESETS: VisualEffectConfig[] = [
  {
    id: 'spotlight',
    name: '聚光灯模式',
    description: '突出说话者，其他Agent变暗，适合注意力集中',
    effects: {
      spotlight: true,
      glow: false,
      pulse: false,
      soundwave: false,
      particles: false,
      avatarAnimation: true,
      backgroundShimmer: false,
      focusMode: true
    },
    colors: {
      primary: 'rgb(147, 51, 234)',
      accent: 'rgb(59, 130, 246)',
      glow: 'rgba(147, 51, 234, 0.4)',
      pulse: 'rgba(147, 51, 234, 0.6)'
    },
    animations: {
      intensity: 0.7,
      speed: 1.0,
      duration: 1.0
    }
  },
  {
    id: 'glow',
    name: '光芒模式',
    description: '柔和发光效果，优雅且不打扰其他内容',
    effects: {
      spotlight: false,
      glow: true,
      pulse: false,
      soundwave: false,
      particles: false,
      avatarAnimation: true,
      backgroundShimmer: true,
      focusMode: false
    },
    colors: {
      primary: 'rgb(34, 197, 94)',
      accent: 'rgb(16, 185, 129)',
      glow: 'rgba(34, 197, 94, 0.5)',
      pulse: 'rgba(34, 197, 94, 0.3)'
    },
    animations: {
      intensity: 0.5,
      speed: 0.8,
      duration: 1.2
    }
  },
  {
    id: 'pulse',
    name: '脉冲模式',
    description: '明显的脉冲效果，强烈的视觉提示',
    effects: {
      spotlight: false,
      glow: true,
      pulse: true,
      soundwave: false,
      particles: false,
      avatarAnimation: true,
      backgroundShimmer: false,
      focusMode: false
    },
    colors: {
      primary: 'rgb(239, 68, 68)',
      accent: 'rgb(245, 101, 101)',
      glow: 'rgba(239, 68, 68, 0.4)',
      pulse: 'rgba(239, 68, 68, 0.6)'
    },
    animations: {
      intensity: 0.8,
      speed: 1.2,
      duration: 0.8
    }
  },
  {
    id: 'soundwave',
    name: '声波模式',
    description: '动态声波效果，模拟真实的声音传播',
    effects: {
      spotlight: false,
      glow: false,
      pulse: false,
      soundwave: true,
      particles: false,
      avatarAnimation: true,
      backgroundShimmer: false,
      focusMode: false
    },
    colors: {
      primary: 'rgb(99, 102, 241)',
      accent: 'rgb(129, 140, 248)',
      glow: 'rgba(99, 102, 241, 0.3)',
      pulse: 'rgba(99, 102, 241, 0.5)'
    },
    animations: {
      intensity: 0.6,
      speed: 1.5,
      duration: 1.0
    },
    sounds: {
      enabled: true,
      volume: 0.3,
      pitchVariation: true
    }
  },
  {
    id: 'festival',
    name: '节日模式',
    description: '华丽的粒子和多重效果，营造庆祝氛围',
    effects: {
      spotlight: false,
      glow: true,
      pulse: true,
      soundwave: true,
      particles: true,
      avatarAnimation: true,
      backgroundShimmer: true,
      focusMode: false
    },
    colors: {
      primary: 'rgb(217, 70, 239)',
      accent: 'rgb(251, 191, 36)',
      glow: 'rgba(217, 70, 239, 0.6)',
      pulse: 'rgba(251, 191, 36, 0.5)'
    },
    animations: {
      intensity: 1.0,
      speed: 1.3,
      duration: 1.5
    },
    sounds: {
      enabled: true,
      volume: 0.4,
      pitchVariation: true
    }
  },
  {
    id: 'minimal',
    name: '简约模式',
    description: '最小化视觉效果，适合专业场景',
    effects: {
      spotlight: false,
      glow: false,
      pulse: false,
      soundwave: false,
      particles: false,
      avatarAnimation: false,
      backgroundShimmer: false,
      focusMode: false
    },
    colors: {
      primary: 'rgb(75, 85, 99)',
      accent: 'rgb(107, 114, 128)',
      glow: 'rgba(75, 85, 99, 0.2)',
      pulse: 'rgba(107, 114, 128, 0.3)'
    },
    animations: {
      intensity: 0.2,
      speed: 0.5,
      duration: 2.0
    }
  },
  {
    id: 'all',
    name: '完整体验',
    description: '所有效果组合，最丰富的视觉体验',
    effects: {
      spotlight: true,
      glow: true,
      pulse: true,
      soundwave: true,
      particles: true,
      avatarAnimation: true,
      backgroundShimmer: true,
      focusMode: true
    },
    colors: {
      primary: 'rgb(147, 51, 234)',
      accent: 'rgb(59, 130, 246)',
      glow: 'rgba(147, 51, 234, 0.4)',
      pulse: 'rgba(147, 51, 234, 0.6)'
    },
    animations: {
      intensity: 0.9,
      speed: 1.0,
      duration: 1.0
    },
    sounds: {
      enabled: true,
      volume: 0.3,
      pitchVariation: true
    }
  }
]

// 场景特定配置
export const SCENE_SPECIFIC_CONFIGS = {
  discussion: {
    // 讨论阶段：温和的效果
    recommendedPresets: ['glow', 'minimal'],
    intensity: 0.6,
    focusMode: false
  },
  bidding: {
    // 竞价阶段：强烈的效果
    recommendedPresets: ['pulse', 'festival', 'all'],
    intensity: 0.9,
    focusMode: true
  },
  result: {
    // 结果阶段：庆祝效果
    recommendedPresets: ['festival', 'soundwave'],
    intensity: 1.0,
    focusMode: false
  }
}

// 动态效果强度计算
export function calculateDynamicIntensity(
  messageType: string,
  emotion: string,
  bidAmount?: number,
  baseIntensity: number = 0.5
): number {
  let intensity = baseIntensity

  // 根据消息类型调整
  switch (messageType) {
    case 'bid':
      intensity += 0.4
      break
    case 'reaction':
      intensity += 0.2
      break
    case 'celebration':
      intensity += 0.3
      break
    default:
      intensity += 0.1
  }

  // 根据情感调整
  switch (emotion) {
    case 'excited':
    case 'angry':
    case 'triumphant':
      intensity += 0.3
      break
    case 'confident':
      intensity += 0.2
      break
    case 'dramatic':
      intensity += 0.25
      break
    case 'worried':
    case 'gracious':
      intensity -= 0.1
      break
  }

  // 根据竞价金额调整
  if (bidAmount) {
    if (bidAmount > 300) intensity += 0.2
    else if (bidAmount > 200) intensity += 0.1
    else if (bidAmount < 100) intensity -= 0.1
  }

  return Math.max(0.1, Math.min(1.0, intensity))
}

// 获取推荐配置
export function getRecommendedConfig(phase: string, userPreference?: string): VisualEffectConfig {
  const sceneConfig = SCENE_SPECIFIC_CONFIGS[phase as keyof typeof SCENE_SPECIFIC_CONFIGS]

  if (userPreference && VISUAL_EFFECT_PRESETS.find(p => p.id === userPreference)) {
    return VISUAL_EFFECT_PRESETS.find(p => p.id === userPreference)!
  }

  if (sceneConfig) {
    const recommendedId = sceneConfig.recommendedPresets[0]
    return VISUAL_EFFECT_PRESETS.find(p => p.id === recommendedId) || VISUAL_EFFECT_PRESETS[0]
  }

  return VISUAL_EFFECT_PRESETS.find(p => p.id === 'all')!
}

// 效果性能检查
export function checkPerformanceOptimization(): {
  canUseFullEffects: boolean
  recommendedPreset: string
  reasons: string[]
} {
  const reasons: string[] = []
  let canUseFullEffects = true
  let recommendedPreset = 'all'

  // 检查设备性能
  if (typeof window !== 'undefined') {
    // 检查设备内存
    const memory = (navigator as any).deviceMemory
    if (memory && memory < 4) {
      canUseFullEffects = false
      recommendedPreset = 'minimal'
      reasons.push('设备内存较低，建议使用简约模式')
    }

    // 检查网络连接
    const connection = (navigator as any).connection
    if (connection && connection.effectiveType &&
        ['slow-2g', '2g', '3g'].includes(connection.effectiveType)) {
      canUseFullEffects = false
      recommendedPreset = 'glow'
      reasons.push('网络连接较慢，建议使用轻量效果')
    }

    // 检查电池状态
    if ('getBattery' in navigator) {
      navigator.getBattery().then((battery: any) => {
        if (battery.level < 0.2 && !battery.charging) {
          canUseFullEffects = false
          recommendedPreset = 'minimal'
          reasons.push('设备电量较低，建议使用节能模式')
        }
      }).catch(() => {
        // 忽略电池API错误
      })
    }
  }

  return {
    canUseFullEffects,
    recommendedPreset,
    reasons
  }
}

export default {
  VISUAL_EFFECT_PRESETS,
  SCENE_SPECIFIC_CONFIGS,
  calculateDynamicIntensity,
  getRecommendedConfig,
  checkPerformanceOptimization
}