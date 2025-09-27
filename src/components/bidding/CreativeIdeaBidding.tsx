'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import {
  Users, Clock, Zap, Heart, Smile, Frown, ThumbsUp,
  MessageCircle, TrendingUp, Star, Trophy, Gift,
  Eye, Flame, Target, Brain, Sparkles, FileText, Loader2
} from 'lucide-react';
import { AI_PERSONAS, DISCUSSION_PHASES, type AIPersona, type AIMessage, type BiddingEvent } from '@/lib/ai-persona-system';
import { useBiddingWebSocket } from '@/hooks/useBiddingWebSocket';
import AIPersonaSceneManager from './AIPersonaSceneManager';
import { getRecommendedConfig, calculateDynamicIntensity } from '@/lib/visual-effects-config';

interface CreativeIdeaBiddingProps {
  ideaId: string;
}

// 阶段状态枚举
type PhaseStatus = 'warmup' | 'discussion' | 'bidding' | 'prediction' | 'result';

// 用户参与统计
interface EngagementStats {
  reactions: number;
  messages: number;
  predictions: number;
  totalActions: number;
}

export default function CreativeIdeaBidding({ ideaId }: CreativeIdeaBiddingProps) {
  // 使用WebSocket hook获取实时数据
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
    sendReaction,
    supportPersona,
    submitPrediction
  } = useBiddingWebSocket({
    ideaId,
    autoConnect: true
  });

  // 本地状态
  const [userPrediction, setUserPrediction] = useState<number>(100);
  const [engagementStats, setEngagementStats] = useState<EngagementStats>({
    reactions: 0,
    messages: 0,
    predictions: 0,
    totalActions: 0
  });

  // 生成商业指导书相关状态
  const [isGeneratingGuide, setIsGeneratingGuide] = useState(false);
  const [guideProgress, setGuideProgress] = useState(0);

  // 视觉效果配置
  const [effectConfig, setEffectConfig] = useState(() => getRecommendedConfig(currentPhase));
  const [showEffectControls, setShowEffectControls] = useState(false);
  const [enableEnhancedEffects, setEnableEnhancedEffects] = useState(true);

  // 创意信息
  const [idea] = useState({
    id: ideaId,
    title: "AI智能家居控制系统",
    description: "基于语音识别和机器学习的智能家居集中控制平台",
    category: "智能硬件",
    tags: ["AI", "IoT", "语音识别", "机器学习"]
  });

  // 根据阶段自动调整效果配置
  useEffect(() => {
    if (!showEffectControls) {
      const newConfig = getRecommendedConfig(currentPhase);
      setEffectConfig(newConfig);
    }
  }, [currentPhase, showEffectControls]);

  // 用户互动处理
  const handleReaction = useCallback((messageId: string, reactionType: string) => {
    sendReaction(messageId, reactionType);
    setEngagementStats(prev => ({
      ...prev,
      reactions: prev.reactions + 1,
      totalActions: prev.totalActions + 1
    }));
  }, [sendReaction]);

  const handleSupportPersona = useCallback((personaId: string) => {
    supportPersona(personaId);
    setEngagementStats(prev => ({
      ...prev,
      totalActions: prev.totalActions + 1
    }));
  }, [supportPersona]);

  const handlePredictionSubmit = useCallback(() => {
    submitPrediction(userPrediction);
    setEngagementStats(prev => ({
      ...prev,
      predictions: prev.predictions + 1,
      totalActions: prev.totalActions + 1
    }));
  }, [submitPrediction, userPrediction]);

  // 生成商业指导书处理函数
  const handleGenerateGuide = useCallback(async () => {
    if (isGeneratingGuide) return;

    try {
      setIsGeneratingGuide(true);
      setGuideProgress(0);

      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setGuideProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 500);

      // 调用生成商业计划书API
      const response = await fetch('/api/generate-business-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ideaTitle: idea.title,
          ideaDescription: idea.description,
          category: idea.category,
          tags: idea.tags
        })
      });

      clearInterval(progressInterval);
      setGuideProgress(100);

      if (!response.ok) {
        throw new Error('生成商业指导书失败');
      }

      const result = await response.json();

      // 跳转到商业指导书页面
      if (result.reportId) {
        const guideUrl = `/business-plan?reportId=${result.reportId}&ideaTitle=${encodeURIComponent(idea.title)}`;
        window.open(guideUrl, '_blank');
      } else {
        throw new Error('生成成功但未返回报告ID');
      }

    } catch (error) {
      console.error('生成商业指导书失败:', error);
      alert('生成失败，请稍后重试');
    } finally {
      setIsGeneratingGuide(false);
      setGuideProgress(0);
    }
  }, [isGeneratingGuide, idea]);

  // 格式化时间显示
  const formatTimeRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 获取当前阶段配置
  const getCurrentPhaseConfig = () => {
    return DISCUSSION_PHASES.find(p => p.phase === currentPhase) || DISCUSSION_PHASES[0];
  };

  // 获取阶段进度
  const getPhaseProgress = () => {
    const phaseConfig = getCurrentPhaseConfig();
    const elapsed = phaseConfig.duration * 60 - timeRemaining;
    return Math.min((elapsed / (phaseConfig.duration * 60)) * 100, 100);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* 页面顶部状态栏 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-lg px-3 py-1">
                  <Zap className="w-4 h-4 mr-2" />
                  AI创意竞价直播
                </Badge>
                <Badge variant={isConnected ? 'default' : 'secondary'} className="animate-pulse">
                  {isConnected ? '🔴 LIVE' : '连接中...'}
                </Badge>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">{viewerCount}</span>
                  <span className="text-muted-foreground">人正在观看</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-muted-foreground">当前阶段</div>
                <div className="text-lg font-bold text-primary">
                  {getCurrentPhaseConfig().description}
                </div>
              </div>
            </div>

            {/* 阶段进度条 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{getCurrentPhaseConfig().description}</span>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono font-bold">
                    {formatTimeRemaining(timeRemaining)}
                  </span>
                </div>
              </div>
              <Progress value={getPhaseProgress()} className="h-2" />
            </div>
          </div>

          {/* 创意信息卡片 */}
          <Card className="mb-6 border-2 border-primary/20 bg-gradient-to-r from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2 text-primary">
                    {idea.title}
                  </CardTitle>
                  <p className="text-muted-foreground mb-3">{idea.description}</p>
                  <div className="flex gap-2">
                    {idea.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">当前最高出价</div>
                  <div className="text-3xl font-bold text-green-600">
                    {highestBid} 积分
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {Object.keys(currentBids).length} 位AI参与竞价
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* 视觉效果控制面板 */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Sparkles className="w-4 h-4" />
                      视觉效果
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowEffectControls(!showEffectControls)}
                    >
                      <Target className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">增强效果</span>
                    <Button
                      variant={enableEnhancedEffects ? "default" : "outline"}
                      size="sm"
                      onClick={() => setEnableEnhancedEffects(!enableEnhancedEffects)}
                    >
                      {enableEnhancedEffects ? '开启' : '关闭'}
                    </Button>
                  </div>

                  {enableEnhancedEffects && (
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">
                        当前方案: {effectConfig.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        适用阶段: {getCurrentPhaseConfig().description}
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full animate-pulse"
                          style={{ backgroundColor: effectConfig.colors.primary }}
                        />
                        <span className="text-xs">实时同步</span>
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-3 mt-3">
                    <div className="text-xs text-muted-foreground mb-2">观看统计</div>
                    <div className="flex items-center justify-between text-sm">
                      <span>在线观众</span>
                      <Badge variant="secondary">{viewerCount}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>当前最高</span>
                      <Badge variant="secondary">{highestBid} 积分</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 中间：AI角色舞台 - 使用增强版本 */}
            <div className="lg:col-span-2 space-y-4">
              {enableEnhancedEffects ? (
                <AIPersonaSceneManager
                  messages={aiMessages}
                  currentBids={Object.fromEntries(
                    AI_PERSONAS.map(persona => [
                      persona.id,
                      currentBids[persona.id] || Math.floor(Math.random() * 200) + 50
                    ])
                  )}
                  activeSpeaker={activeSpeaker}
                  onSupportPersona={handleSupportPersona}
                  effectStyle={effectConfig.id as any}
                  enableDimming={effectConfig.effects.spotlight}
                  enableFocusMode={effectConfig.effects.focusMode}
                />
              ) : (
                /* 原版AI角色面板作为回退 */
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      AI 竞价师们
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {AI_PERSONAS.map((persona) => (
                      <motion.div
                        key={persona.id}
                        className={`p-3 rounded-lg border transition-all cursor-pointer ${
                          activeSpeaker === persona.id
                            ? 'border-primary bg-primary/10 shadow-lg scale-105'
                            : supportedPersona === persona.id
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : 'border-border hover:border-primary/50'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleSupportPersona(persona.id)}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-2xl">{persona.avatar}</div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {persona.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {persona.specialty.split('、')[0]}
                            </div>
                          </div>
                          {activeSpeaker === persona.id && (
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            </div>
                          )}
                        </div>

                        {currentBids[persona.id] && (
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">
                              {currentBids[persona.id]} 积分
                            </div>
                            <div className="text-xs text-muted-foreground">最新出价</div>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1 mt-2">
                          {persona.personality.slice(0, 2).map((trait) => (
                            <Badge key={trait} variant="outline" className="text-xs">
                              {trait}
                            </Badge>
                          ))}
                        </div>

                        {supportedPersona === persona.id && (
                          <div className="mt-2 text-center">
                            <Badge variant="default" className="text-xs">
                              <Heart className="w-3 h-3 mr-1" />
                              你支持的AI
                            </Badge>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              )}
              {/* 实时对话区域 */}
              <Card className="h-96 flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    AI 实时对话
                    {currentPhase === 'bidding' && (
                      <Badge variant="destructive" className="animate-bounce">
                        激烈竞价中
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                  <div className="h-full overflow-y-auto space-y-3">
                    <AnimatePresence mode="wait">
                      {aiMessages.slice(-8).map((message) => {
                        const persona = AI_PERSONAS.find(p => p.id === message.personaId);
                        if (!persona) return null;

                        return (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`flex gap-3 p-3 rounded-lg ${
                              message.type === 'bid'
                                ? 'bg-gradient-to-r from-green-100 to-yellow-100 dark:from-green-900/30 dark:to-yellow-900/30 border-2 border-green-300'
                                : 'bg-muted/50'
                            }`}
                          >
                            <div className="text-xl">{persona.avatar}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">
                                  {persona.name}
                                </span>
                                {message.type === 'bid' && (
                                  <Badge variant="destructive" className="text-xs">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    出价 {message.bidValue}
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {message.timestamp.toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="text-sm leading-relaxed">
                                {message.content}
                              </p>

                              {/* 用户互动按钮 */}
                              <div className="flex gap-2 mt-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs"
                                  onClick={() => handleReaction(message.id, 'like')}
                                >
                                  <ThumbsUp className="w-3 h-3 mr-1" />
                                  赞
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs"
                                  onClick={() => handleReaction(message.id, 'support')}
                                >
                                  <Heart className="w-3 h-3 mr-1" />
                                  支持
                                </Button>
                                {message.type === 'bid' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-xs text-orange-600"
                                    onClick={() => handleReaction(message.id, 'surprise')}
                                  >
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    惊喜
                                  </Button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>

              {/* 用户互动面板 */}
              {currentPhase === 'prediction' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      价格预测 - 赢取奖励
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">你预测的最终价格：</span>
                        <span className="font-bold text-lg text-primary">
                          {userPrediction} 积分
                        </span>
                      </div>
                      <Slider
                        value={[userPrediction]}
                        onValueChange={(value) => setUserPrediction(value[0])}
                        min={50}
                        max={500}
                        step={5}
                        className="mb-4"
                      />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>50 积分</span>
                        <span>当前最高: {highestBid}</span>
                        <span>500 积分</span>
                      </div>
                    </div>

                    <Button
                      onClick={handlePredictionSubmit}
                      className="w-full"
                      size="lg"
                    >
                      <Gift className="w-4 h-4 mr-2" />
                      提交预测 (奖励最高 200 积分)
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* 右侧：统计和奖励 */}
            <div className="lg:col-span-1 space-y-4">
              {/* 参与统计 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Flame className="w-4 h-4" />
                    你的参与度
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">互动次数</span>
                    <Badge variant="secondary">
                      {engagementStats.totalActions}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">点赞反应</span>
                    <Badge variant="secondary">
                      {engagementStats.reactions}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">价格预测</span>
                    <Badge variant="secondary">
                      {engagementStats.predictions}
                    </Badge>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="text-xs text-muted-foreground mb-2">
                      参与度等级
                    </div>
                    <Progress
                      value={Math.min(engagementStats.totalActions * 10, 100)}
                      className="h-2"
                    />
                    <div className="text-xs text-center mt-1 text-primary font-medium">
                      {engagementStats.totalActions >= 10 ? '超级参与者' :
                       engagementStats.totalActions >= 5 ? '活跃参与者' : '观众'}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 实时排行榜 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Trophy className="w-4 h-4" />
                    竞价排行榜
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(currentBids)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 5)
                      .map(([personaId, bid], index) => {
                        const persona = AI_PERSONAS.find(p => p.id === personaId);
                        if (!persona) return null;

                        return (
                          <div key={personaId} className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === 0 ? 'bg-yellow-500 text-white' :
                              index === 1 ? 'bg-gray-400 text-white' :
                              index === 2 ? 'bg-amber-600 text-white' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="text-sm">{persona.avatar}</div>
                            <div className="flex-1 text-xs truncate">
                              {persona.name}
                            </div>
                            <div className="text-sm font-bold text-green-600">
                              {bid}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>

              {/* 奖励预览 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4" />
                    潜在奖励
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-center p-3 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg">
                    <div className="text-2xl mb-1">🏆</div>
                    <div className="text-sm font-medium">预测奖励</div>
                    <div className="text-lg font-bold text-orange-600">
                      最高 200 积分
                    </div>
                  </div>
                  <div className="text-center p-2 bg-muted/50 rounded">
                    <div className="text-sm">参与奖励: +10 积分</div>
                  </div>
                  <div className="text-center p-2 bg-muted/50 rounded">
                    <div className="text-sm">活跃奖励: +{engagementStats.totalActions * 2} 积分</div>
                  </div>
                </CardContent>
              </Card>

              {/* 商业指导书生成 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4" />
                    创意落地指南
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center p-3 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                    <div className="text-2xl mb-1">📋</div>
                    <div className="text-sm font-medium mb-2">专业落地方案</div>
                    <div className="text-xs text-muted-foreground mb-3">
                      基于竞价结果生成详细的商业化落地指南
                    </div>

                    {isGeneratingGuide ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 text-blue-600">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">生成中...</span>
                        </div>
                        <Progress value={guideProgress} className="h-2" />
                        <div className="text-xs text-muted-foreground">
                          {Math.round(guideProgress)}% 完成
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={handleGenerateGuide}
                        size="sm"
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        disabled={currentPhase !== 'result'}
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        生成落地指南
                      </Button>
                    )}
                  </div>

                  {currentPhase !== 'result' && (
                    <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                      💡 竞价结束后可生成专业的商业化落地指南
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}