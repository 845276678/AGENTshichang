'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface SpeakingIndicatorProps {
  intensity?: number
  show?: boolean
}

export const SpeakingIndicator = ({
  intensity = 0.8,
  show = true
}: SpeakingIndicatorProps) => {
  if (!show) return null

  return (
    <div className="absolute inset-0 flex items-center justify-center gap-0.5">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-0.5 h-4 bg-emerald-400 rounded-full"
          animate={{
            scaleY: [1, intensity * 2.2, 1],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* 说话光环 */}
      <div className="absolute inset-0 bg-emerald-400 bg-opacity-15 rounded-full animate-pulse" />
    </div>
  )
}

interface ThinkingIndicatorProps {
  duration?: number
  show?: boolean
}

export const ThinkingIndicator = ({
  duration = 3,
  show = true
}: ThinkingIndicatorProps) => {
  if (!show) return null

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* 思考气泡 */}
      <motion.div
        className="text-base"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ repeat: Infinity, duration: 1.8 }}
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
      >
        💭
      </motion.div>

      {/* 思考进度环 */}
      <svg
        className="absolute w-full h-full"
        viewBox="0 0 32 32"
        style={{ transform: 'rotate(-90deg)' }}
      >
        <circle
          cx="16"
          cy="16"
          r="13"
          fill="none"
          stroke="#6366F1"
          strokeWidth="1.5"
          strokeDasharray="82"
          strokeDashoffset="82"
          opacity="0.3"
        >
          <animate
            attributeName="stroke-dashoffset"
            values="82;0;82"
            dur={`${duration}s`}
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>
  )
}

interface BiddingIndicatorProps {
  show?: boolean
  amount?: number
}

export const BiddingIndicator = ({
  show = true,
  amount = 0
}: BiddingIndicatorProps) => {
  if (!show) return null

  const isZeroBid = amount === 0
  const intensity = isZeroBid ? 0.3 : 1

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* 金币旋转动画 */}
      <motion.div
        className="text-base"
        animate={{ rotateY: [0, 180, 360] }}
        transition={{
          repeat: Infinity,
          duration: 2,
          ease: "linear"
        }}
        style={{
          filter: `drop-shadow(0 2px 8px rgba(245, 158, 11, ${intensity * 0.4}))`,
          opacity: isZeroBid ? 0.6 : 1
        }}
      >
        💰
      </motion.div>

      {/* 竞价光环 */}
      <div className="absolute w-full h-full">
        <motion.div
          className="w-full h-full border-2 border-transparent rounded-full"
          style={{
            borderTopColor: isZeroBid ? '#D1D5DB' : '#F59E0B',
            borderRightColor: isZeroBid ? '#D1D5DB' : '#F59E0B',
            opacity: intensity
          }}
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "linear"
          }}
        />
      </div>
    </div>
  )
}

interface WaitingIndicatorProps {
  show?: boolean
}

export const WaitingIndicator = ({ show = true }: WaitingIndicatorProps) => {
  if (!show) return null

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* 等待光点 */}
      <motion.div
        className="w-2 h-2 bg-slate-400 rounded-full"
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.4, 0.8, 0.4]
        }}
        transition={{
          repeat: Infinity,
          duration: 2,
          ease: "easeInOut"
        }}
      />
    </div>
  )
}