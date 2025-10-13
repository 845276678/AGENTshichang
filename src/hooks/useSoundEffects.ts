import { useCallback, useRef, useEffect, useState } from 'react'
import { SoundPlayer, type SoundType } from '@/lib/sound-generator'

/**
 * 音效类型（保持向后兼容）
 */
export type SoundEffect = SoundType

/**
 * 音效管理 Hook
 *
 * 功能：
 * - 支持文件和生成音效双重模式
 * - 预加载音效
 * - 播放指定音效
 * - 控制音量
 * - 静音模式
 */
export function useSoundEffects(enabled: boolean = false, volume: number = 0.5) {
  const audioCache = useRef<Map<SoundEffect, HTMLAudioElement>>(new Map())
  const soundPlayer = useRef<SoundPlayer>(new SoundPlayer(enabled, volume))
  const [fallbackToGenerator, setFallbackToGenerator] = useState(false)

  // 初始化音效播放器
  useEffect(() => {
    soundPlayer.current.setEnabled(enabled)
    soundPlayer.current.setVolume(volume)

    // 预加载常用音效
    if (enabled) {
      soundPlayer.current.preloadAll().catch(() => {
        console.log('🔊 使用Web Audio API生成音效')
      })
    }
  }, [enabled, volume])

  /**
   * 预加载音效文件（支持MP3文件和生成音效）
   */
  const preloadSound = useCallback(async (soundName: SoundEffect) => {
    if (audioCache.current.has(soundName)) {
      return
    }

    try {
      // 首先尝试加载MP3文件
      const audio = new Audio(`/sounds/${soundName}.mp3`)
      audio.volume = volume
      audio.preload = 'auto'

      // 检查文件是否存在
      await new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', resolve, { once: true })
        audio.addEventListener('error', reject, { once: true })
        audio.load()
      })

      audioCache.current.set(soundName, audio)
      console.log(`🔊 音效文件预加载成功: ${soundName}`)
    } catch (error) {
      console.log(`🔊 音效文件不存在，使用生成音效: ${soundName}`)
      setFallbackToGenerator(true)

      // 预加载生成音效
      await soundPlayer.current.preloadSound(soundName)
    }
  }, [volume])

  /**
   * 播放音效（自动选择最佳播放方式）
   */
  const playSound = useCallback(async (soundName: SoundEffect) => {
    if (!enabled) {
      console.log(`🔇 音效已禁用: ${soundName}`)
      return
    }

    try {
      // 优先使用MP3文件
      let audio = audioCache.current.get(soundName)

      if (!audio && !fallbackToGenerator) {
        // 尝试动态加载MP3文件
        try {
          audio = new Audio(`/sounds/${soundName}.mp3`)
          audio.volume = volume
          audioCache.current.set(soundName, audio)

          // 重置播放位置并播放
          audio.currentTime = 0
          await audio.play()
          return
        } catch (fileError) {
          console.log(`🔊 MP3文件播放失败，切换到生成音效: ${soundName}`)
          setFallbackToGenerator(true)
        }
      }

      // 使用MP3文件播放
      if (audio) {
        audio.currentTime = 0
        await audio.play()
        return
      }

      // 回退到生成音效
      await soundPlayer.current.playSound(soundName)

    } catch (error) {
      console.warn(`🔇 音效播放错误: ${soundName}`, error)
    }
  }, [enabled, volume, fallbackToGenerator])

  /**
   * 更新音量
   */
  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume))

    // 更新MP3文件音量
    audioCache.current.forEach((audio) => {
      audio.volume = clampedVolume
    })

    // 更新生成音效音量
    soundPlayer.current.setVolume(clampedVolume)
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

  /**
   * 启用/禁用音效
   */
  const setEnabled = useCallback((isEnabled: boolean) => {
    soundPlayer.current.setEnabled(isEnabled)
  }, [])

  return {
    playSound,
    preloadSound,
    setVolume,
    setEnabled,
    stopAll,
    isUsingGenerator: fallbackToGenerator
  }
}
