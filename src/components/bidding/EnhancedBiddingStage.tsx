import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
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
  Monitor,
  Wifi,
  WifiOff,
  Clock,
  Users,
  Send,
  MessageSquarePlus
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
import { useBiddingWebSocket } from '@/hooks/useBiddingWebSocket'

interface EnhancedBiddingStageProps {
  ideaId: string
  sessionId?: string | null
  ideaContent?: string
  messages: AIMessage[]
  currentBids: Record<string, number>
  activeSpeaker?: string | null
  currentPhase: 'warmup' | 'discussion' | 'bidding' | 'prediction' | 'result'
  onSupportPersona: (personaId: string) => void
}

export default function EnhancedBiddingStage({
  ideaId,
  sessionId,
  ideaContent,
  onSupportPersona
}: EnhancedBiddingStageProps) {
  // 使用真实的WebSocket连接
  const {
    isConnected,
    connectionStatus,
    currentPhase,
    timeRemaining,
    viewerCount,
    aiMessages,
    activeSpeaker,
    currentBids,
    highestBid,
    supportedPersona,
    supportPersona,
    startBidding,
    reconnect,
    sendSupplement
  } = useBiddingWebSocket({
    ideaId,
    autoConnect: true
  })

  // 视觉效果设置状态
  const [effectConfig, setEffectConfig] = useState<VisualEffectConfig>(() =>
    getRecommendedConfig(currentPhase)
  )
  const [customIntensity, setCustomIntensity] = useState<number>(0.8)
  const [enableSound, setEnableSound] = useState<boolean>(false)
  const [showSettings, setShowSettings] = useState<boolean>(false)
  const [performanceMode, setPerformanceMode] = useState<boolean>(false)

  // 用户补充创意状态
  const [userSupplement, setUserSupplement] = useState('')
  const [supplementHistory, setSupplementHistory] = useState<string[]>([])
  const [isSendingSupplement, setIsSendingSupplement] = useState(false)

  // 提交补充创意
  const handleSubmitSupplement = useCallback(() => {
    if (!userSupplement.trim() || supplementHistory.length >= 3) return

    setIsSendingSupplement(true)
    const success = sendSupplement(userSupplement.trim())

    if (success) {
      setSupplementHistory(prev => [...prev, userSupplement.trim()])
      setUserSupplement('')
    }

    setIsSendingSupplement(false)
  }, [userSupplement, supplementHistory, sendSupplement])


  // 自动启动AI竞价（如果有sessionId和内容）
  useEffect(() => {
    if (sessionId && ideaContent && isConnected && currentPhase === 'warmup') {
      console.log('🎭 Auto-starting AI bidding with sessionId:', sessionId)

      // 延迟启动以确保WebSocket连接稳定
      const startTimer = setTimeout(() => {
        startBidding(ideaContent)
      }, 2000)

      return () => clearTimeout(startTimer)
    }
  }, [sessionId, ideaContent, isConnected, currentPhase, startBidding])

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
    const latestMessage = aiMessages
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

  // 格式化时间显示
  const formatTimeRemaining = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 获取阶段显示名称
  const getPhaseDisplayName = (phase: string): string => {
    const names: Record<string, string> = {
      'warmup': '暖场介绍',
      'discussion': '深度讨论',
      'bidding': '激烈竞价',
      'prediction': '价格预测',
      'result': '结果揭晓'
    }
    return names[phase] || phase
  }

  return (
    <div className="space-y-6">
      {/* 连接状态和实时信息面板 */}
      <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* 连接状态 */}
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <>
                    <Wifi className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-green-700">AI专家已连接</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-5 h-5 text-red-500" />
                    <span className="text-sm font-medium text-red-700">连接中...</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={reconnect}
                      className="ml-2"
                    >
                      重连
                    </Button>
                  </>
                )}
              </div>

              {/* 当前阶段 */}
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium">当前阶段: {getPhaseDisplayName(currentPhase)}</span>
              </div>

              {/* 倒计时 */}
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-medium">
                  剩余时间: {formatTimeRemaining(timeRemaining)}
                </span>
              </div>

              {/* 观众数量 */}
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium">观众: {viewerCount}</span>
              </div>
            </div>

            {/* 最高出价 */}
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                💰 最高出价: {highestBid}元
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                  <span>当前阶段: {getPhaseDisplayName(currentPhase)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  <span>活跃Speaker: {activeSpeaker ? AI_PERSONAS.find(p => p.id === activeSpeaker)?.name : '无'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>消息数: {aiMessages.length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>连接状态: {connectionStatus}</span>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* AI角色场景管理器 - 使用真实数据 */}
      <motion.div
        key={effectConfig.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <AIPersonaSceneManager
          messages={aiMessages}
          currentBids={currentBids}
          activeSpeaker={activeSpeaker}
          onSupportPersona={(personaId) => {
            supportPersona(personaId)
            onSupportPersona(personaId)
          }}
          effectStyle={effectConfig.id as any}
          enableDimming={effectConfig.effects.spotlight}
          enableFocusMode={effectConfig.effects.focusMode}
        />
      </motion.div>

      {/* 用户补充创意区域 - 在prediction阶段显示 */}
      {currentPhase === 'prediction' && (
        <Card className="w-full max-w-4xl mx-auto mt-6 border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquarePlus className="w-6 h-6 text-blue-600" />
                <CardTitle className="text-lg">补充您的创意</CardTitle>
              </div>
              <Badge variant="secondary" className="text-sm">
                {supplementHistory.length} / 3 次
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 提示信息 */}
              <div className="bg-blue-100 text-blue-800 p-3 rounded-lg text-sm">
                <p>💡 根据AI专家的讨论，您可以进一步补充和完善您的创意描述（最多3次）</p>
              </div>

              {/* 历史补充记录 */}
              {supplementHistory.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">已提交的补充：</p>
                  <div className="space-y-2">
                    {supplementHistory.map((item, index) => (
                      <div key={index} className="bg-white p-3 rounded-lg border border-gray-200 text-sm">
                        <span className="font-medium text-gray-600">补充 {index + 1}：</span>
                        <p className="mt-1 text-gray-700">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 输入框和提交按钮 */}
              {supplementHistory.length < 3 && (
                <div className="space-y-3">
                  <Textarea
                    value={userSupplement}
                    onChange={(e) => setUserSupplement(e.target.value)}
                    placeholder="请输入您想要补充的创意细节..."
                    className="min-h-[100px] resize-none"
                    disabled={isSendingSupplement}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={handleSubmitSupplement}
                      disabled={!userSupplement.trim() || isSendingSupplement}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isSendingSupplement ? '发送中...' : '提交补充'}
                    </Button>
                  </div>
                </div>
              )}

              {supplementHistory.length >= 3 && (
                <div className="bg-green-100 text-green-800 p-3 rounded-lg text-sm text-center">
                  ✓ 您已完成3次补充，AI专家正在综合考虑您的意见
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

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
              {supportedPersona && <span>👍 支持: {AI_PERSONAS.find(p => p.id === supportedPersona)?.name}</span>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}