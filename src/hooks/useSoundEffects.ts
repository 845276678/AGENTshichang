import { useCallback, useRef } from 'react'

/**
 * 音效类型
 */
export type SoundEffect =
  | 'assessment-complete'  // 评估完成
  | 'workshop-unlock'      // 工作坊解锁
  | 'button-click'         // 按钮点击
  | 'score-tick'           // 分数滚动
  | 'transition-whoosh'    // 过渡效果

/**
 * 音效管理 Hook
 *
 * 功能：
 * - 预加载音效文件
 * - 播放指定音效
 * - 控制音量
 * - 静音模式
 */
export function useSoundEffects(enabled: boolean = false, volume: number = 0.5) {
  const audioCache = useRef<Map<SoundEffect, HTMLAudioElement>>(new Map())

  /**
   * 预加载音效文件
   */
  const preloadSound = useCallback((soundName: SoundEffect) => {
    if (audioCache.current.has(soundName)) {
      return
    }

    try {
      const audio = new Audio(`/sounds/${soundName}.mp3`)
      audio.volume = volume
      audio.preload = 'auto'
      audioCache.current.set(soundName, audio)
    } catch (error) {
      console.warn(`🔇 无法预加载音效: ${soundName}`, error)
    }
  }, [volume])

  /**
   * 播放音效
   */
  const playSound = useCallback((soundName: SoundEffect) => {
    if (!enabled) {
      console.log(`🔇 音效已禁用: ${soundName}`)
      return
    }

    try {
      let audio = audioCache.current.get(soundName)

      if (!audio) {
        // 如果没有预加载，现在加载
        audio = new Audio(`/sounds/${soundName}.mp3`)
        audio.volume = volume
        audioCache.current.set(soundName, audio)
      }

      // 重置播放位置并播放
      audio.currentTime = 0
      audio.play().catch((error) => {
        console.warn(`🔇 音效播放失败: ${soundName}`, error)
      })
    } catch (error) {
      console.warn(`🔇 音效播放错误: ${soundName}`, error)
    }
  }, [enabled, volume])

  /**
   * 更新音量
   */
  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume))
    audioCache.current.forEach((audio) => {
      audio.volume = clampedVolume
    })
  }, [])

  /**
   * 停止所有音效
   */
  const stopAll = useCallback(() => {
    audioCache.current.forEach((audio) => {
      audio.pause()
      audio.currentTime = 0
    })
  }, [])

  return {
    playSound,
    preloadSound,
    setVolume,
    stopAll
  }
}
