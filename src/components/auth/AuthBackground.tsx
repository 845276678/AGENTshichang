'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface AuthBackgroundProps {
  className?: string;
  showPattern?: boolean;
  showAgentAvatar?: boolean;
}

export const AuthBackground: React.FC<AuthBackgroundProps> = ({
  className,
  showPattern = true,
  showAgentAvatar = true,
}) => {
  return (
    <div
      className={cn(
        'relative flex h-full w-full flex-col items-center justify-center overflow-hidden',
        'bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800',
        className
      )}
    >
      {/* Animated Background Pattern */}
      {showPattern && (
        <>
          {/* Floating Particles */}
          <div className="absolute inset-0">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute h-2 w-2 rounded-full bg-white/10"
                initial={{
                  x: Math.random() * 100 + '%',
                  y: Math.random() * 100 + '%',
                }}
                animate={{
                  x: Math.random() * 100 + '%',
                  y: Math.random() * 100 + '%',
                }}
                transition={{
                  duration: Math.random() * 10 + 10,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'linear',
                }}
              />
            ))}
          </div>

          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg
              width="100%"
              height="100%"
              className="h-full w-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="white"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Animated Blobs */}
          <motion.div
            className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-white/5"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          <motion.div
            className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-white/5"
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </>
      )}

      {/* Content Container */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-8 py-12">
        {/* Agent Avatar */}
        {showAgentAvatar && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: 'easeOut',
              delay: 0.2,
            }}
            className="mb-8 flex items-center justify-center"
          >
            <div className="relative">
              {/* Avatar Container */}
              <motion.div
                className="relative h-32 w-32 overflow-hidden rounded-full bg-white/10 backdrop-blur-sm"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                {/* AI Agent Icon */}
                <div className="flex h-full w-full items-center justify-center">
                  <svg
                    className="h-16 w-16 text-white/80"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9H21ZM19 21H5V3H13V9H19V21Z" />
                  </svg>
                </div>

                {/* Pulsing Ring */}
                <motion.div
                  className="absolute -inset-2 rounded-full border-2 border-white/20"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </motion.div>

              {/* Status Indicator */}
              <motion.div
                className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-400 shadow-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, duration: 0.3 }}
              >
                <div className="flex h-full w-full items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Welcome Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.5,
          }}
          className="text-center"
        >
          <h2 className="mb-4 text-3xl font-bold text-white lg:text-4xl">
            欢迎来到创意交易市场
          </h2>
          <p className="max-w-md text-lg text-white/80 lg:text-xl">
            分享创意想法，让AI竞价师为你的创意竞价
          </p>
        </motion.div>

        {/* Feature Points */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.8,
          }}
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3"
        >
          {[
            {
              icon: '💡',
              title: '创意变现',
              description: '想法即价值',
            },
            {
              icon: '🤖',
              title: 'AI竞价',
              description: '智能评估竞价',
            },
            {
              icon: '🎯',
              title: '精准匹配',
              description: '专业改造升级',
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: 1 + index * 0.1,
              }}
              className="text-center"
            >
              <div className="mb-3 text-3xl">{feature.icon}</div>
              <h3 className="mb-2 font-semibold text-white">{feature.title}</h3>
              <p className="text-sm text-white/70">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Decorative Elements */}
        <div className="absolute bottom-8 left-8 right-8">
          <div className="flex items-center justify-center space-x-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                className="h-2 w-2 rounded-full bg-white/30"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/10" />
    </div>
  );
};