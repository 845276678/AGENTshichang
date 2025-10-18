'use client'

import React, { useEffect, useState } from 'react'
import { BiddingPhase } from './AgentDialogPanel'

interface BiddingAtmosphereProps {
  currentPhase: BiddingPhase
  isActive: boolean
  intensity?: number // 0-1，用于调整效果强度
  className?: string
}

// 竞价氛围配置
const ATMOSPHERE_CONFIG = {
  intensity: {
    [BiddingPhase.IDEA_INPUT]: 0.1,
    [BiddingPhase.AGENT_WARMUP]: 0.3,      // 温和的预热氛围
    [BiddingPhase.AGENT_DISCUSSION]: 0.6,  // 逐渐升温
    [BiddingPhase.AGENT_BIDDING]: 1.0,     // 最高强度
    [BiddingPhase.USER_SUPPLEMENT]: 0.8,   // 保持紧张感
    [BiddingPhase.RESULT_DISPLAY]: 0.5     // 逐渐平静
  },
  colors: {
    [BiddingPhase.IDEA_INPUT]: { primary: '#6B7280', secondary: '#9CA3AF' },
    [BiddingPhase.AGENT_WARMUP]: { primary: '#8B5CF6', secondary: '#A78BFA' },     // 紫色 - 神秘感
    [BiddingPhase.AGENT_DISCUSSION]: { primary: '#06B6D4', secondary: '#67E8F9' }, // 青色 - 思考感
    [BiddingPhase.AGENT_BIDDING]: { primary: '#F59E0B', secondary: '#FCD34D' },    // 橙色 - 激烈感
    [BiddingPhase.USER_SUPPLEMENT]: { primary: '#10B981', secondary: '#6EE7B7' },  // 绿色 - 希望感
    [BiddingPhase.RESULT_DISPLAY]: { primary: '#6366F1', secondary: '#A5B4FC' }    // 蓝色 - 结果感
  }
}

// 粒子系统组件
const ParticleSystem: React.FC<{
  intensity: number
  colors: { primary: string, secondary: string }
}> = ({ intensity, colors }) => {
  const particleCount = Math.floor(intensity * 20) // 最多20个粒子

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: particleCount }, (_, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-60 animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
            backgroundColor: Math.random() > 0.5 ? colors.primary : colors.secondary,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${1 + Math.random() * 2}s`
          }}
        />
      ))}
    </div>
  )
}

// 动态光照效果
const DynamicLighting: React.FC<{
  intensity: number
  colors: { primary: string, secondary: string }
}> = ({ intensity, colors }) => {
  const [pulsePhase, setPulsePhase] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase(prev => (prev + 1) % 100)
    }, 100)
    return () => clearInterval(interval)
  }, [])

  const lightIntensity = intensity * (0.8 + 0.2 * Math.sin(pulsePhase * 0.1))

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* 中央聚光灯效果 */}
      <div
        className="absolute inset-0 rounded-xl"
        style={{
          background: `radial-gradient(circle at center,
            ${colors.primary}${Math.floor(lightIntensity * 40).toString(16).padStart(2, '0')} 0%,
            ${colors.secondary}${Math.floor(lightIntensity * 20).toString(16).padStart(2, '0')} 50%,
            transparent 100%)`,
          filter: `blur(${lightIntensity * 2}px)`
        }}
      />

      {/* 边缘光晕 */}
      <div
        className="absolute inset-0 rounded-xl"
        style={{
          boxShadow: `inset 0 0 ${intensity * 100}px rgba(255, 255, 255, ${intensity * 0.1}),
                     0 0 ${intensity * 50}px ${colors.primary}${Math.floor(intensity * 60).toString(16).padStart(2, '0')}`
        }}
      />
    </div>
  )
}

// 背景动画效果
const AnimatedBackground: React.FC<{
  phase: BiddingPhase
  intensity: number
  colors: { primary: string, secondary: string }
}> = ({ phase, intensity, colors }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* 渐变背景 */}
      <div
        className="absolute inset-0 opacity-20 transition-all duration-1000"
        style={{
          background: `linear-gradient(135deg,
            ${colors.primary}${Math.floor(intensity * 100).toString(16).padStart(2, '0')} 0%,
            ${colors.secondary}${Math.floor(intensity * 60).toString(16).padStart(2, '0')} 100%)`,
          filter: `saturate(${1 + intensity * 0.5})`
        }}
      />

      {/* 动态纹理 */}
      {phase === BiddingPhase.AGENT_BIDDING && (
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              ${colors.primary}20 0px,
              transparent 2px,
              transparent 10px,
              ${colors.secondary}20 12px
            )`,
            animation: `slide 3s linear infinite`,
            transform: `scale(${1 + intensity * 0.1})`
          }}
        />
      )}
    </div>
  )
}

export const BiddingAtmosphere: React.FC<BiddingAtmosphereProps> = ({
  currentPhase,
  isActive,
  intensity: customIntensity,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false)

  const baseIntensity = ATMOSPHERE_CONFIG.intensity[currentPhase] || 0.1
  const finalIntensity = customIntensity ?? baseIntensity
  const colors = ATMOSPHERE_CONFIG.colors[currentPhase] || ATMOSPHERE_CONFIG.colors[BiddingPhase.IDEA_INPUT]

  useEffect(() => {
    setIsVisible(isActive)
  }, [isActive])

  if (!isVisible || finalIntensity === 0) {
    return null
  }

  return (
    <div className={`bidding-atmosphere relative ${className}`}>
      {/* CSS动画定义 */}
      <style jsx>{`
        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes glow-pulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }

        .bidding-atmosphere {
          transition: all 0.5s ease-in-out;
        }
      `}</style>

      {/* 动态背景 */}
      <AnimatedBackground
        phase={currentPhase}
        intensity={finalIntensity}
        colors={colors}
      />

      {/* 粒子系统 */}
      {finalIntensity > 0.3 && (
        <ParticleSystem
          intensity={finalIntensity}
          colors={colors}
        />
      )}

      {/* 动态光照 */}
      {finalIntensity > 0.5 && (
        <DynamicLighting
          intensity={finalIntensity}
          colors={colors}
        />
      )}

      {/* 脉冲边框效果 */}
      {currentPhase === BiddingPhase.AGENT_BIDDING && finalIntensity > 0.8 && (
        <div
          className="absolute inset-0 rounded-xl border-2 animate-pulse"
          style={{
            borderColor: colors.primary,
            animationDuration: '1s'
          }}
        />
      )}
    </div>
  )
}

export default BiddingAtmosphere