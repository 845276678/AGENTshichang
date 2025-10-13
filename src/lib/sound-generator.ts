/**
 * 音效生成器工具
 *
 * 使用Web Audio API生成简单的音效
 * 用作开发阶段的音效占位符
 */

export type SoundType =
  // 现有音效
  | 'assessment-complete'
  | 'workshop-unlock'
  | 'button-click'
  | 'score-tick'
  | 'transition-whoosh'
  // 新增工作坊音效
  | 'step-complete'
  | 'form-save'
  | 'agent-message'
  | 'pdf-download'
  | 'workshop-start'

// 音效参数配置
interface SoundConfig {
  type: 'beep' | 'chord' | 'sweep' | 'tick' | 'whoosh' | 'ding'
  frequency: number
  duration: number
  volume: number
  fadeOut?: boolean
}

// 音效配置映射
const SOUND_CONFIGS: Record<SoundType, SoundConfig> = {
  // 评估系统音效
  'assessment-complete': {
    type: 'ding',
    frequency: 800,
    duration: 1.2,
    volume: 0.5,
    fadeOut: true
  },
  'workshop-unlock': {
    type: 'chord',
    frequency: 523, // C5
    duration: 2.0,
    volume: 0.6,
    fadeOut: true
  },
  'button-click': {
    type: 'tick',
    frequency: 1000,
    duration: 0.1,
    volume: 0.3
  },
  'score-tick': {
    type: 'beep',
    frequency: 880,
    duration: 0.05,
    volume: 0.2
  },
  'transition-whoosh': {
    type: 'whoosh',
    frequency: 300,
    duration: 0.8,
    volume: 0.4,
    fadeOut: true
  },

  // 工作坊新音效
  'step-complete': {
    type: 'ding',
    frequency: 659, // E5
    duration: 0.8,
    volume: 0.5,
    fadeOut: true
  },
  'form-save': {
    type: 'beep',
    frequency: 440, // A4
    duration: 0.3,
    volume: 0.3
  },
  'agent-message': {
    type: 'sweep',
    frequency: 600,
    duration: 0.5,
    volume: 0.3,
    fadeOut: true
  },
  'pdf-download': {
    type: 'chord',
    frequency: 698, // F5
    duration: 1.5,
    volume: 0.5,
    fadeOut: true
  },
  'workshop-start': {
    type: 'chord',
    frequency: 587, // D5
    duration: 1.8,
    volume: 0.6,
    fadeOut: true
  }
}

/**
 * 生成音效的核心函数
 */
export function generateSound(soundType: SoundType): Promise<AudioBuffer> {
  return new Promise((resolve, reject) => {
    try {
      const config = SOUND_CONFIGS[soundType]
      const audioContext = new AudioContext()
      const sampleRate = audioContext.sampleRate
      const length = sampleRate * config.duration
      const buffer = audioContext.createBuffer(1, length, sampleRate)
      const data = buffer.getChannelData(0)

      // 根据音效类型生成波形
      for (let i = 0; i < length; i++) {
        const time = i / sampleRate
        const amplitude = config.volume

        let sample = 0

        switch (config.type) {
          case 'beep':
            sample = Math.sin(2 * Math.PI * config.frequency * time) * amplitude
            break

          case 'ding':
            // 带衰减的正弦波
            const decay = Math.exp(-time * 3)
            sample = Math.sin(2 * Math.PI * config.frequency * time) * amplitude * decay
            break

          case 'chord':
            // 三和弦（根音、三度、五度）
            const root = Math.sin(2 * Math.PI * config.frequency * time)
            const third = Math.sin(2 * Math.PI * config.frequency * 1.25 * time)
            const fifth = Math.sin(2 * Math.PI * config.frequency * 1.5 * time)
            const chordDecay = Math.exp(-time * 1.5)
            sample = (root + third * 0.7 + fifth * 0.5) * amplitude * 0.4 * chordDecay
            break

          case 'sweep':
            // 频率扫描
            const sweepFreq = config.frequency + (config.frequency * 0.5 * time / config.duration)
            const sweepDecay = Math.exp(-time * 2)
            sample = Math.sin(2 * Math.PI * sweepFreq * time) * amplitude * sweepDecay
            break

          case 'tick':
            // 短促的脉冲
            if (time < 0.02) {
              sample = Math.sin(2 * Math.PI * config.frequency * time) * amplitude
            } else {
              sample = 0
            }
            break

          case 'whoosh':
            // 噪声扫频
            const noise = (Math.random() - 0.5) * 2
            const whooshFreq = config.frequency * (1 + time / config.duration)
            const whooshFilter = Math.sin(2 * Math.PI * whooshFreq * time)
            const whooshEnv = Math.exp(-time * 2) * (1 - time / config.duration)
            sample = noise * whooshFilter * amplitude * whooshEnv * 0.3
            break
        }

        // 应用淡出效果
        if (config.fadeOut && time > config.duration * 0.7) {
          const fadeProgress = (time - config.duration * 0.7) / (config.duration * 0.3)
          sample *= (1 - fadeProgress)
        }

        data[i] = sample
      }

      resolve(buffer)
      audioContext.close()
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * 创建音效播放器
 */
export class SoundPlayer {
  private audioContext: AudioContext | null = null
  private soundCache: Map<SoundType, AudioBuffer> = new Map()
  private masterVolume = 0.5
  private enabled = false

  constructor(enabled = false, volume = 0.5) {
    this.enabled = enabled
    this.masterVolume = Math.max(0, Math.min(1, volume))

    if (typeof window !== 'undefined' && this.enabled) {
      this.initAudioContext()
    }
  }

  private initAudioContext() {
    try {
      this.audioContext = new AudioContext()
    } catch (error) {
      console.warn('🔇 无法创建AudioContext:', error)
      this.enabled = false
    }
  }

  /**
   * 预加载音效
   */
  async preloadSound(soundType: SoundType): Promise<void> {
    if (!this.enabled || !this.audioContext) return

    if (this.soundCache.has(soundType)) return

    try {
      const buffer = await generateSound(soundType)
      this.soundCache.set(soundType, buffer)
      console.log(`🔊 音效预加载完成: ${soundType}`)
    } catch (error) {
      console.warn(`🔇 音效预加载失败: ${soundType}`, error)
    }
  }

  /**
   * 播放音效
   */
  async playSound(soundType: SoundType): Promise<void> {
    if (!this.enabled || !this.audioContext) {
      console.log(`🔇 音效已禁用: ${soundType}`)
      return
    }

    try {
      // 如果音效未缓存，先生成
      if (!this.soundCache.has(soundType)) {
        await this.preloadSound(soundType)
      }

      const buffer = this.soundCache.get(soundType)
      if (!buffer) return

      // 创建音频节点
      const source = this.audioContext.createBufferSource()
      const gainNode = this.audioContext.createGain()

      source.buffer = buffer
      gainNode.gain.value = this.masterVolume

      // 连接节点
      source.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      // 播放
      source.start()

      console.log(`🔊 播放音效: ${soundType}`)
    } catch (error) {
      console.warn(`🔇 音效播放失败: ${soundType}`, error)
    }
  }

  /**
   * 设置音量
   */
  setVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume))
  }

  /**
   * 启用/禁用音效
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
    if (enabled && !this.audioContext) {
      this.initAudioContext()
    }
  }

  /**
   * 预加载所有音效
   */
  async preloadAll(): Promise<void> {
    if (!this.enabled) return

    const soundTypes = Object.keys(SOUND_CONFIGS) as SoundType[]
    const promises = soundTypes.map(type => this.preloadSound(type))

    try {
      await Promise.all(promises)
      console.log('🔊 所有音效预加载完成')
    } catch (error) {
      console.warn('🔇 音效预加载过程中出现错误:', error)
    }
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.soundCache.clear()
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
  }
}

/**
 * 默认导出：全局音效播放器单例
 */
export const soundPlayer = new SoundPlayer()

/**
 * 便捷方法：播放音效
 */
export const playSound = (soundType: SoundType) => soundPlayer.playSound(soundType)