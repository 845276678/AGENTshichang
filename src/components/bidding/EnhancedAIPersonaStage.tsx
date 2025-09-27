'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  MessageCircle,
  Heart,
  Mic,
  Volume2,
  Zap,
  Star,
  Users,
  TrendingUp
} from 'lucide-react'
import Image from 'next/image'
import type { AIMessage } from '@/lib/ai-persona-system'

interface EnhancedAIPersonaStageProps {
  persona: any
  isActive: boolean
  isSpeaking: boolean
  currentBid: number
  messages: AIMessage[]
  onSupport: () => void
  speakingIntensity?: number // 0-1, 说话强度
  effectStyle?: 'spotlight' | 'glow' | 'pulse' | 'soundwave' | 'all'
}

export default function EnhancedAIPersonaStage({
  persona,
  isActive,
  isSpeaking,
  currentBid,
  messages,
  onSupport,
  speakingIntensity = 0.8,
  effectStyle = 'all'
}: EnhancedAIPersonaStageProps) {
  const [soundWaves, setSoundWaves] = useState<number[]>([])

  const latestMessage = messages
    .filter(msg => msg.personaId === persona.id)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]

  // 生成声波效果数据
  useEffect(() => {
    if (isSpeaking) {
      const interval = setInterval(() => {
        setSoundWaves(prev => [
          ...prev.slice(-8),
          Math.random() * speakingIntensity
        ])
      }, 100)
      return () => clearInterval(interval)
    } else {
      setSoundWaves([])
    }
  }, [isSpeaking, speakingIntensity])

  // 聚光灯效果变体
  const spotlightVariants = {
    inactive: {
      opacity: isSpeaking ? 0.3 : 1,
      scale: 1,
      filter: isSpeaking ? 'brightness(0.4) saturate(0.5)' : 'brightness(1) saturate(1)',
      transition: { duration: 0.5, ease: 'easeInOut' }
    },
    active: {
      opacity: 1,
      scale: 1.05,
      filter: 'brightness(1.2) saturate(1.3)',
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    speaking: {
      opacity: 1,
      scale: 1.08,
      filter: 'brightness(1.4) saturate(1.5)',
      transition: { duration: 0.2, ease: 'easeOut' }
    }
  }

  // 发光效果
  const glowEffect = isSpeaking ? {
    boxShadow: `
      0 0 20px rgba(147, 51, 234, 0.6),
      0 0 40px rgba(147, 51, 234, 0.4),
      0 0 60px rgba(147, 51, 234, 0.2),
      inset 0 0 20px rgba(147, 51, 234, 0.1)
    `,
    borderColor: 'rgb(147, 51, 234)'
  } : {}

  // 获取当前状态
  const getCurrentState = () => {
    if (isSpeaking) return 'speaking'
    if (isActive) return 'active'
    return 'inactive'
  }

  return (
    <motion.div
      className="relative"
      variants={effectStyle === 'spotlight' || effectStyle === 'all' ? spotlightVariants : {}}
      animate={getCurrentState()}
      layout
    >
      {/* 背景光圈效果 */}
      {(effectStyle === 'glow' || effectStyle === 'all') && isSpeaking && (
        <motion.div
          className="absolute inset-0 rounded-lg"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          style={{
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.3) 0%, transparent 70%)',
            filter: 'blur(10px)',
            zIndex: -1
          }}
        />
      )}

      {/* 声波效果 */}
      {(effectStyle === 'soundwave' || effectStyle === 'all') && isSpeaking && (
        <div className="absolute -inset-4 flex items-center justify-center pointer-events-none">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute border-2 border-purple-400 rounded-lg opacity-30"
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{
                scale: [1, 1.2, 1.4, 1.6][i],
                opacity: [0.6, 0.4, 0.2, 0][i]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeOut'
              }}
              style={{
                width: '100%',
                height: '100%'
              }}
            />
          ))}
        </div>
      )}

      <Card
        className={`
          transition-all duration-300 cursor-pointer relative overflow-hidden
          ${isSpeaking
            ? 'ring-4 ring-purple-500 shadow-2xl bg-gradient-to-br from-purple-50 to-blue-50 border-purple-300'
            : isActive
            ? 'ring-2 ring-purple-300 shadow-xl bg-gradient-to-br from-purple-25 to-blue-25 border-purple-200'
            : 'hover:shadow-lg hover:scale-102 bg-white border-gray-200'
          }
        `}
        style={effectStyle === 'glow' || effectStyle === 'all' ? glowEffect : {}}
      >
        {/* 动态背景粒子 */}
        {isSpeaking && (effectStyle === 'all') && (
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-purple-400 rounded-full"
                initial={{
                  x: Math.random() * 100 + '%',
                  y: Math.random() * 100 + '%',
                  opacity: 0
                }}
                animate={{
                  y: [Math.random() * 100 + '%', '0%'],
                  opacity: [0, 0.6, 0],
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: 'easeOut'
                }}
              />
            ))}
          </div>
        )}

        <CardContent className="p-6 text-center relative">
          {/* 角色头像区域 */}
          <motion.div
            className="relative mx-auto mb-4"
            animate={isSpeaking ? {
              scale: [1, 1.1, 1],
              rotate: [0, 2, -2, 0]
            } : isActive ? { scale: [1, 1.05, 1] } : { scale: 1 }}
            transition={{
              duration: isSpeaking ? 1.5 : 3,
              repeat: isSpeaking ? Infinity : 0,
              ease: 'easeInOut'
            }}
          >
            {/* 头像外圈效果 */}
            <div className="relative">
              {/* 脉冲圈层 */}
              {(effectStyle === 'pulse' || effectStyle === 'all') && isSpeaking && (
                <>
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute inset-0 rounded-full border-2 border-purple-400"
                      initial={{ scale: 1, opacity: 0.8 }}
                      animate={{
                        scale: [1, 1.3, 1.6],
                        opacity: [0.8, 0.4, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.4,
                        ease: 'easeOut'
                      }}
                      style={{
                        width: '88px',
                        height: '88px',
                        left: '-4px',
                        top: '-4px'
                      }}
                    />
                  ))}
                </>
              )}

              {/* 头像容器 */}
              <div className={`
                w-20 h-20 rounded-full relative overflow-hidden mx-auto
                ${isSpeaking
                  ? 'ring-4 ring-purple-500 shadow-lg'
                  : isActive
                  ? 'ring-2 ring-purple-300'
                  : 'ring-1 ring-gray-200'
                }
              `}>
                <Image
                  src={persona.avatar}
                  alt={persona.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />

                {/* 头像覆盖光效 */}
                {isSpeaking && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0, 0.3, 0],
                      background: [
                        'linear-gradient(45deg, transparent, rgba(147, 51, 234, 0.3))',
                        'linear-gradient(90deg, transparent, rgba(147, 51, 234, 0.5))',
                        'linear-gradient(135deg, transparent, rgba(147, 51, 234, 0.3))'
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  />
                )}
              </div>
            </div>

            {/* 状态指示器 */}
            <AnimatePresence>
              {isSpeaking && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -top-1 -right-1"
                >
                  <div className="relative">
                    {/* 声波可视化 */}
                    <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg">
                      <Volume2 className="w-4 h-4 text-white" />
                    </div>

                    {/* 小型声波效果 */}
                    <div className="absolute -inset-1 flex items-center justify-center">
                      {soundWaves.slice(-3).map((intensity, i) => (
                        <motion.div
                          key={i}
                          className="absolute border border-green-400 rounded-full"
                          animate={{
                            scale: [0.8, 1.2 + intensity * 0.5],
                            opacity: [0.7, 0]
                          }}
                          transition={{
                            duration: 1,
                            ease: 'easeOut'
                          }}
                          style={{
                            width: `${24 + i * 8}px`,
                            height: `${24 + i * 8}px`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {isActive && !isSpeaking && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-lg"
                >
                  <Star className="w-3 h-3 text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* 角色信息 */}
          <motion.div
            animate={isSpeaking ? { y: [0, -2, 0] } : {}}
            transition={{ duration: 2, repeat: isSpeaking ? Infinity : 0 }}
          >
            <h3 className={`font-bold text-lg mb-1 transition-colors ${
              isSpeaking ? 'text-purple-700' : isActive ? 'text-purple-600' : 'text-gray-800'
            }`}>
              {persona.name}
            </h3>
            <p className="text-sm text-gray-600 mb-1">{persona.specialty}</p>
            <div className="text-xs text-purple-600 mb-3 font-medium">
              {persona.personality.slice(0, 2).join(' • ')}
            </div>
          </motion.div>

          {/* 当前竞价 */}
          <motion.div
            className="mb-4"
            animate={isSpeaking ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 1.5, repeat: isSpeaking ? Infinity : 0 }}
          >
            <div className={`text-2xl font-bold mb-1 transition-colors ${
              isSpeaking ? 'text-emerald-600' : 'text-purple-600'
            }`}>
              ¥{(currentBid * 0.01).toFixed(2)}
            </div>
            <Badge
              variant={currentBid > 100 ? "default" : "secondary"}
              className={`text-xs transition-all ${
                isSpeaking ? 'bg-emerald-100 text-emerald-800 animate-pulse' : ''
              }`}
            >
              {isSpeaking ? '正在发言' : currentBid > 100 ? "高价竞争" : "保守出价"}
            </Badge>
          </motion.div>

          {/* 最新对话 */}
          <AnimatePresence mode="wait">
            {latestMessage && (
              <motion.div
                key={latestMessage.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`rounded-lg p-3 mb-4 text-sm text-left transition-all ${
                  isSpeaking
                    ? 'bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200'
                    : 'bg-gray-50'
                }`}
              >
                <div className="line-clamp-3">{latestMessage.content}</div>
                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  {isSpeaking && <Zap className="w-3 h-3 text-purple-500" />}
                  {new Date(latestMessage.timestamp).toLocaleTimeString()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 支持按钮 */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={onSupport}
              variant="outline"
              size="sm"
              className={`w-full transition-all ${
                isSpeaking
                  ? 'border-purple-500 text-purple-600 hover:bg-purple-50 shadow-md'
                  : ''
              }`}
            >
              <Heart className={`w-4 h-4 mr-1 ${isSpeaking ? 'text-pink-500' : ''}`} />
              {isSpeaking ? '立即支持' : '支持'}
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}