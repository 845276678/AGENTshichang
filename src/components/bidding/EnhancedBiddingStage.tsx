'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  Settings,
  Eye,
  Zap,
  Volume2,
  VolumeX,
  Palette,
  Monitor
} from 'lucide-react'

import AIPersonaSceneManager from './AIPersonaSceneManager'
import {
  VISUAL_EFFECT_PRESETS,
  getRecommendedConfig,
  checkPerformanceOptimization,
  calculateDynamicIntensity,
  type VisualEffectConfig
} from '@/lib/visual-effects-config'
import { AI_PERSONAS, type AIMessage } from '@/lib/ai-persona-system'

interface EnhancedBiddingStageProps {
  ideaId: string
  messages: AIMessage[]
  currentBids: Record<string, number>
  activeSpeaker?: string
  currentPhase: 'warmup' | 'discussion' | 'bidding' | 'prediction' | 'result'
  onSupportPersona: (personaId: string) => void
}

export default function EnhancedBiddingStage({
  ideaId,
  messages,
  currentBids,
  activeSpeaker,
  currentPhase,
  onSupportPersona
}: EnhancedBiddingStageProps) {
  // 视觉效果设置状态
  const [effectConfig, setEffectConfig] = useState<VisualEffectConfig>(() =>
    getRecommendedConfig(currentPhase)
  )
  const [customIntensity, setCustomIntensity] = useState<number>(0.8)
  const [enableSound, setEnableSound] = useState<boolean>(false)
  const [showSettings, setShowSettings] = useState<boolean>(false)
  const [performanceMode, setPerformanceMode] = useState<boolean>(false)

  // 性能检查
  useEffect(() => {
    const perfCheck = checkPerformanceOptimization()
    if (!perfCheck.canUseFullEffects) {
      setPerformanceMode(true)
      const recommendedConfig = VISUAL_EFFECT_PRESETS.find(p => p.id === perfCheck.recommendedPreset)
      if (recommendedConfig) {
        setEffectConfig(recommendedConfig)
      }
    }
  }, [])

  // 根据阶段自动调整效果
  useEffect(() => {
    if (!showSettings) { // 只在用户未手动调整时自动更新
      const newConfig = getRecommendedConfig(currentPhase)
      setEffectConfig(newConfig)
    }
  }, [currentPhase, showSettings])

  // 处理效果预设切换
  const handlePresetChange = (presetId: string) => {
    const preset = VISUAL_EFFECT_PRESETS.find(p => p.id === presetId)
    if (preset) {
      setEffectConfig({
        ...preset,
        animations: {
          ...preset.animations,
          intensity: customIntensity
        }
      })
    }
  }

  // 处理自定义强度调整
  const handleIntensityChange = (value: number[]) => {
    const intensity = value[0]
    setCustomIntensity(intensity)
    setEffectConfig(prev => ({
      ...prev,
      animations: {
        ...prev.animations,
        intensity
      }
    }))
  }

  // 生成当前AI消息的动态强度
  const getDynamicIntensity = (personaId: string): number => {
    const latestMessage = messages
      .filter(msg => msg.personaId === personaId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]

    if (!latestMessage) return effectConfig.animations.intensity

    return calculateDynamicIntensity(
      latestMessage.type,
      latestMessage.emotion,
      latestMessage.bidValue,
      effectConfig.animations.intensity
    )
  }

  return (
    <div className="space-y-6">
      {/* 效果控制面板 */}
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Palette className="w-5 h-5" />
              视觉效果控制台
            </CardTitle>
            <div className="flex items-center gap-2">
              {performanceMode && (
                <Badge variant="secondary" className="text-xs">
                  <Monitor className="w-3 h-3 mr-1" />
                  性能模式
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {showSettings && (
          <CardContent className="space-y-4">
            {/* 效果预设选择 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">效果预设</label>
                <Select
                  value={effectConfig.id}
                  onValueChange={handlePresetChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择效果方案" />
                  </SelectTrigger>
                  <SelectContent>
                    {VISUAL_EFFECT_PRESETS.map((preset) => (
                      <SelectItem key={preset.id} value={preset.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: preset.colors.primary }}
                          />
                          {preset.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {effectConfig.description}
                </p>
              </div>

              {/* 强度调节 */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  效果强度: {Math.round(customIntensity * 100)}%
                </label>
                <Slider
                  value={[customIntensity]}
                  onValueChange={handleIntensityChange}
                  min={0.1}
                  max={1.0}
                  step={0.1}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>柔和</span>
                  <span>强烈</span>
                </div>
              </div>

              {/* 音效控制 */}
              <div>
                <label className="text-sm font-medium mb-2 block">音效设置</label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={enableSound}
                    onCheckedChange={setEnableSound}
                    disabled={!effectConfig.sounds?.enabled}
                  />
                  <span className="text-sm">
                    {enableSound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {effectConfig.sounds?.enabled ? '启用音效' : '当前预设不支持音效'}
                  </span>
                </div>
              </div>
            </div>

            {/* 效果开关 */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3">个性化设置</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(effectConfig.effects).map(([effectName, enabled]) => (
                  <div key={effectName} className="flex items-center gap-2">
                    <Switch
                      checked={enabled}
                      onCheckedChange={(checked) => {
                        setEffectConfig(prev => ({
                          ...prev,
                          effects: {
                            ...prev.effects,
                            [effectName]: checked
                          }
                        }))
                      }}
                      size="sm"
                    />
                    <span className="text-xs">
                      {effectName === 'spotlight' && '聚光灯'}
                      {effectName === 'glow' && '发光'}
                      {effectName === 'pulse' && '脉冲'}
                      {effectName === 'soundwave' && '声波'}
                      {effectName === 'particles' && '粒子'}
                      {effectName === 'avatarAnimation' && '头像动画'}
                      {effectName === 'backgroundShimmer' && '背景闪烁'}
                      {effectName === 'focusMode' && '聚焦模式'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 当前状态显示 */}
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>当前阶段: {currentPhase}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  <span>活跃Speaker: {activeSpeaker ? AI_PERSONAS.find(p => p.id === activeSpeaker)?.name : '无'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>消息数: {messages.length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* AI角色场景管理器 */}
      <motion.div
        key={effectConfig.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <AIPersonaSceneManager
          messages={messages}
          currentBids={currentBids}
          activeSpeaker={activeSpeaker}
          onSupportPersona={onSupportPersona}
          effectStyle={effectConfig.id as any}
          enableDimming={effectConfig.effects.spotlight}
          enableFocusMode={effectConfig.effects.focusMode}
        />
      </motion.div>

      {/* 实时效果预览信息 */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="font-medium">当前效果: {effectConfig.name}</span>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full animate-pulse"
                  style={{ backgroundColor: effectConfig.colors.primary }}
                />
                <span className="text-xs text-muted-foreground">主色调</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>强度: {Math.round(customIntensity * 100)}%</span>
              <span>速度: {effectConfig.animations.speed}x</span>
              {enableSound && <span>🔊 音效已启用</span>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}