import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import EnhancedAIPersonaStage from './EnhancedAIPersonaStage'
import { AI_PERSONAS, type AIMessage } from '@/lib/ai-persona-system'

interface SpeakingState {
  personaId: string
  intensity: number // 0-1
  duration: number // 毫秒
  timestamp: number
}

interface SceneManagerProps {
  messages: AIMessage[]
  currentBids: Record<string, number>
  activeSpeaker?: string
  onSupportPersona: (personaId: string) => void
  effectStyle?: 'spotlight' | 'glow' | 'pulse' | 'soundwave' | 'all'
  enableDimming?: boolean // 是否启用非活跃Agent变暗
  enableFocusMode?: boolean // 是否启用聚焦模式
}

// 说话状态管理Hook
function useSpeakingManager(messages: AIMessage[], activeSpeaker?: string) {
  const [speakingStates, setSpeakingStates] = useState<Record<string, SpeakingState>>({})
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState<number>(0)

  useEffect(() => {
    if (messages.length === 0) return

    const latestMessage = messages[messages.length - 1]

    // 检查是否有新消息
    if (latestMessage.timestamp.getTime() > lastMessageTimestamp) {
      setLastMessageTimestamp(latestMessage.timestamp.getTime())

      // 设置说话状态
      const speakingDuration = calculateSpeakingDuration(latestMessage.content)
      const intensity = calculateSpeakingIntensity(latestMessage)

      setSpeakingStates(prev => ({
        ...prev,
        [latestMessage.personaId]: {
          personaId: latestMessage.personaId,
          intensity,
          duration: speakingDuration,
          timestamp: Date.now()
        }
      }))

      // 自动清除说话状态
      setTimeout(() => {
        setSpeakingStates(prev => {
          const newStates = { ...prev }
          delete newStates[latestMessage.personaId]
          return newStates
        })
      }, speakingDuration)
    }
  }, [messages, lastMessageTimestamp])

  // 计算说话持续时间（基于内容长度）
  const calculateSpeakingDuration = (content: string): number => {
    const baseTime = 2000 // 基础2秒
    const extraTime = Math.min(content.length * 50, 8000) // 每字符50ms，最多8秒
    return baseTime + extraTime
  }

  // 计算说话强度（基于消息类型和情感）
  const calculateSpeakingIntensity = (message: AIMessage): number => {
    let intensity = 0.5 // 基础强度

    // 根据消息类型调整
    switch (message.type) {
      case 'bid':
        intensity = 0.9 // 竞价时强度最高
        break
      case 'reaction':
        intensity = 0.7
        break
      case 'speech':
        intensity = 0.6
        break
      default:
        intensity = 0.5
    }

    // 根据情感调整
    switch (message.emotion) {
      case 'excited':
      case 'angry':
        intensity += 0.2
        break
      case 'confident':
        intensity += 0.1
        break
      case 'worried':
        intensity -= 0.1
        break
    }

    return Math.max(0.2, Math.min(1.0, intensity))
  }

  return {
    speakingStates,
    isSpeaking: (personaId: string) => speakingStates[personaId] !== undefined,
    getSpeakingIntensity: (personaId: string) => speakingStates[personaId]?.intensity || 0
  }
}

export default function AIPersonaSceneManager({
  messages,
  currentBids,
  activeSpeaker,
  onSupportPersona,
  effectStyle = 'all',
  enableDimming = true,
  enableFocusMode = true
}: SceneManagerProps) {
  const { speakingStates, isSpeaking, getSpeakingIntensity } = useSpeakingManager(messages, activeSpeaker)

  // 检查是否有任何Agent在说话
  const hasAnySpeaking = Object.keys(speakingStates).length > 0
  const currentSpeaker = hasAnySpeaking ? Object.keys(speakingStates)[0] : activeSpeaker

  // 场景容器变体
  const sceneVariants = {
    normal: {
      filter: 'brightness(1) contrast(1)',
      transition: { duration: 0.5 }
    },
    focusMode: {
      filter: 'brightness(1.1) contrast(1.1)',
      transition: { duration: 0.3 }
    }
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 relative"
      variants={sceneVariants}
      animate={hasAnySpeaking && enableFocusMode ? 'focusMode' : 'normal'}
    >
      {/* 聚焦背景效果 */}
      {hasAnySpeaking && enableFocusMode && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.1) 100%)',
            borderRadius: '12px'
          }}
        />
      )}

      {AI_PERSONAS.map((persona, index) => {
        const isCurrentSpeaking = isSpeaking(persona.id)
        const isCurrentActive = activeSpeaker === persona.id
        const speakingIntensity = getSpeakingIntensity(persona.id)

        // 计算相对位置用于动画
        const shouldDim = enableDimming && hasAnySpeaking && !isCurrentSpeaking && !isCurrentActive

        return (
          <motion.div
            key={persona.id}
            className="relative"
            layout
            animate={{
              opacity: shouldDim ? 0.4 : 1,
              scale: shouldDim ? 0.95 : 1,
              zIndex: isCurrentSpeaking ? 10 : isCurrentActive ? 5 : 1
            }}
            transition={{
              duration: 0.4,
              ease: 'easeInOut',
              delay: shouldDim ? index * 0.05 : 0
            }}
          >
            {/* 聚光灯效果 */}
            {isCurrentSpeaking && enableFocusMode && (
              <motion.div
                className="absolute -inset-8 pointer-events-none"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                style={{
                  background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                  filter: 'blur(20px)',
                  zIndex: -1
                }}
              />
            )}

            <EnhancedAIPersonaStage
              persona={persona}
              isActive={isCurrentActive}
              isSpeaking={isCurrentSpeaking}
              currentBid={currentBids[persona.id] || Math.floor(Math.random() * 200) + 50}
              messages={messages.filter(msg => msg.personaId === persona.id)}
              onSupport={() => onSupportPersona(persona.id)}
              speakingIntensity={speakingIntensity}
              effectStyle={effectStyle}
            />

            {/* 说话时的额外装饰 */}
            {isCurrentSpeaking && (
              <motion.div
                className="absolute -inset-2 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* 四角光点 */}
                {[
                  { top: '0%', left: '0%' },
                  { top: '0%', right: '0%' },
                  { bottom: '0%', left: '0%' },
                  { bottom: '0%', right: '0%' }
                ].map((position, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-purple-400 rounded-full"
                    style={position}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: 'easeInOut'
                    }}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        )
      })}

      {/* 场景状态指示器 */}
      <AnimatePresence>
        {hasAnySpeaking && (
          <motion.div
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
          >
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
              <motion.div
                className="w-2 h-2 bg-green-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-sm font-medium">
                {AI_PERSONAS.find(p => p.id === currentSpeaker)?.name} 正在发言
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}