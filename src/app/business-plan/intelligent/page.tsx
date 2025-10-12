'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Layout } from '@/components/layout'
import { RealtimeRecommendationDisplay } from '@/components/business-plan/RealtimeRecommendationDisplay'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Brain,
  Lightbulb,
  Target,
  Zap,
  Rocket,
  Sparkles,
  CheckCircle,
  Loader2,
  ArrowRight,
  TrendingUp,
  FileCheck
} from 'lucide-react'
import { motion } from 'framer-motion'

// 类型定义
type IdeaCharacteristics = {
  category: string
  technicalComplexity: string
  fundingRequirement: string
  competitionLevel: string
  aiCapabilities: { [key: string]: boolean }
}

type PersonalizedRecommendations = {
  techStackRecommendations: {
    beginner: {
      primary: string
      timeline: string
      reason: string
      cost: string
    }
  }
  researchChannels: {
    online: string[]
    offline: string[]
  }
  offlineEvents: {
    nationalEvents: Array<{
      name: string
      time: string
      location: string
      cost: string
    }>
    localEvents: string[]
  }
  customizedTimeline: {
    month1: { focus: string }
    month2: { focus: string }
    month3: { focus: string }
  }
  budgetPlan: {
    startupCosts: { total: number }
    monthlyCosts: { total: number }
    costOptimization: string[]
  }
  teamRecommendations: {
    coreTeam: string[]
    advisorTypes: string[]
  }
}

export default function IntelligentBusinessPlanPage() {
  const searchParams = useSearchParams()

  // 从URL参数获取创意信息
  const ideaTitleParam = searchParams.get('ideaTitle')
  const ideaDescParam = searchParams.get('ideaDescription')
  const ideaCategoryParam = searchParams.get('category')
  const fromBidding = searchParams.get('from') === 'bidding'
  const source = searchParams.get('source')
  const useSimplifiedFormat = searchParams.get('useSimplifiedFormat') === 'true'

  const [ideaTitle, setIdeaTitle] = useState('')
  const [ideaDescription, setIdeaDescription] = useState('')
  const [userLocation, setUserLocation] = useState('北京')
  const [userBackground, setUserBackground] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [ideaCharacteristics, setIdeaCharacteristics] = useState<IdeaCharacteristics | null>(null)
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<PersonalizedRecommendations | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  // 优化输入处理
  const handleFieldChange = (setter: (value: string) => void) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setter(e.target.value)
    setIsTyping(true)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
    }, 500)
  }

  // 清理定时器
  React.useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  // 从竞价页面导入创意时自动填充
  useEffect(() => {
    if (ideaTitleParam) {
      setIdeaTitle(decodeURIComponent(ideaTitleParam))
    }
    if (ideaDescParam) {
      setIdeaDescription(decodeURIComponent(ideaDescParam))
    }

    // 如果是直接生成模式，自动开始分析
    if (source === 'direct-generation' && useSimplifiedFormat && ideaTitleParam && ideaDescParam) {
      console.log('🚀 检测到直接生成模式，开始自动分析...')
      setTimeout(() => {
        handleAnalyze()
      }, 1000)
    }
  }, [ideaTitleParam, ideaDescParam, source, useSimplifiedFormat])

  const handleAnalyze = async () => {
    setAnalyzing(true)

    if (useSimplifiedFormat) {
      // 直接生成简化版商业计划书
      console.log('🎯 开始生成简化版商业计划书...')

      // 构建BiddingSnapshot数据
      const snapshot = {
        ideaTitle: ideaTitle,
        ideaDescription: ideaDescription,
        ideaId: `direct-${Date.now()}`,
        industry: '通用',
        targetUsers: '待分析',
        expertDiscussion: [],
        finalBids: [],
        userContext: {
          location: userLocation,
          background: userBackground
        }
      }

      // 重定向到商业计划书页面，并开始生成
      const params = new URLSearchParams({
        ideaTitle: ideaTitle,
        ideaDescription: ideaDescription,
        source: 'direct-generation',
        useSimplifiedFormat: 'true',
        autoGenerate: 'true'
      })

      window.location.href = `/business-plan?${params.toString()}`
      return
    }

    // 调用多AI交叉验证分析API进行个性化分析
    try {
      console.log('🔬 调用多AI交叉验证分析API...')

      const response = await fetch('/api/business-plan/intelligent-analysis-verified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaTitle,
          ideaDescription,
          userLocation,
          userBackground
        })
      })

      if (!response.ok) {
        throw new Error(`API调用失败: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'AI分析失败')
      }

      console.log('✅ 多AI交叉验证完成:', result.data)
      console.log('📊 验证报告:', result.data.verification)
      console.log('🎯 共识度:', result.data.metadata.consensusScore + '%')

      // 设置经过验证的AI分析结果
      setIdeaCharacteristics(result.data.verified.characteristics)
      setPersonalizedRecommendations(result.data.verified.recommendations)

    } catch (error) {
      console.error('❌ AI分析失败:', error)
      alert('AI分析失败，请稍后重试')

      // 降级：使用通用模板（保留原来的硬编码逻辑作为后备）
      setIdeaCharacteristics({
        category: '通用',
        technicalComplexity: '中等',
        fundingRequirement: '中等（5-20万）',
        competitionLevel: '中等',
        aiCapabilities: {
          nlp: false,
          cv: false,
          ml: false,
          recommendation: false,
          generation: false,
          automation: false
        }
      })

      setPersonalizedRecommendations({
        techStackRecommendations: {
          beginner: {
            primary: '根据您的创意选择合适的技术栈',
            timeline: '1-3个月',
            reason: '建议咨询技术专家',
            cost: '待评估'
          }
        },
        researchChannels: {
          online: ['行业论坛', '社交媒体', '专业社区'],
          offline: ['用户访谈', '实地调研', '行业活动']
        },
        offlineEvents: {
          nationalEvents: [],
          localEvents: ['本地创业活动', '行业交流会']
        },
        customizedTimeline: {
          month1: { focus: '市场调研与需求验证' },
          month2: { focus: 'MVP开发与测试' },
          month3: { focus: '用户反馈与迭代' }
        },
        budgetPlan: {
          startupCosts: { total: 50000 },
          monthlyCosts: { total: 10000 },
          costOptimization: ['合理控制成本', '寻找免费资源', '申请政策支持']
        },
        teamRecommendations: {
          coreTeam: ['技术负责人', '产品经理', '运营人员'],
          advisorTypes: ['行业专家', '技术顾问']
        }
      })
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* 页面头部 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                智能化商业计划生成
              </h1>
            </div>
            <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto mb-8">
              基于3个AI模型交叉验证的实时适配5阶段商业计划框架，提供AI技术栈推荐、需求发现渠道、线下调研活动等个性化指导
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold flex items-center gap-2">
                <Zap className="w-4 h-4" />
                实时适配
              </div>
              <div className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center gap-2">
                <Target className="w-4 h-4" />
                个性化推荐
              </div>
              <div className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold flex items-center gap-2">
                <Rocket className="w-4 h-4" />
                90天聚焦
              </div>
              <div className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                数据驱动
              </div>
            </div>
          </motion.div>

          {/* 从竞价导入的提示 */}
          {fromBidding && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card className="border-2 border-green-300 bg-green-50">
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <FileCheck className="w-6 h-6 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-900 mb-1">
                        ✅ 已从竞价页面导入创意
                      </h3>
                      <p className="text-sm text-green-700">
                        系统已自动填充您的创意信息,您可以继续编辑或直接开始分析生成个性化商业计划书
                      </p>
                    </div>
                    {ideaCategoryParam && (
                      <Badge className="bg-green-600 text-white">
                        {ideaCategoryParam}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* 输入表单 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="mb-8 border-2 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Lightbulb className="w-6 h-6 text-yellow-500" />
                  创意信息输入
                </CardTitle>
                <CardDescription className="text-base">
                  输入您的创意，DeepSeek、智谱GLM、通义千问将交叉验证并生成可信的个性化推荐
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">创意标题</Label>
                      <Input
                        id="title"
                        placeholder="例如：AI智能英语学习助手"
                        value={ideaTitle}
                        onChange={handleFieldChange(setIdeaTitle)}
                        className="w-full transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={analyzing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">所在城市</Label>
                      <Input
                        id="location"
                        placeholder="北京"
                        value={userLocation}
                        onChange={handleFieldChange(setUserLocation)}
                        className="w-full transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={analyzing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">详细描述</Label>
                    <Textarea
                      id="description"
                      placeholder="描述您的创意要解决什么问题，面向什么用户，如何创造价值..."
                      value={ideaDescription}
                      onChange={handleFieldChange(setIdeaDescription)}
                      className="min-h-[120px] w-full transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={analyzing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="background">个人背景（可选）</Label>
                    <Input
                      id="background"
                      placeholder="例如：技术背景、行业经验、可用资源等"
                      value={userBackground}
                      onChange={handleFieldChange(setUserBackground)}
                      className="w-full transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={analyzing}
                    />
                  </div>

                  <div className="flex justify-center pt-4">
                    {isTyping && (
                      <div className="mb-4 text-center">
                        <span className="text-blue-500 flex items-center gap-2 text-sm animate-pulse">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          正在输入创意信息...
                        </span>
                      </div>
                    )}
                    <Button
                      onClick={handleAnalyze}
                      disabled={analyzing || !ideaTitle || !ideaDescription}
                      className="px-8 py-6 text-lg transition-all duration-300 hover:shadow-lg group"
                      size="lg"
                    >
                      {analyzing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          <span className="animate-pulse">AI正在分析您的创意特征...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                          开始分析创意
                          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 分析中状态 */}
          {analyzing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="mb-8 border-2 border-blue-300 bg-blue-50/50">
                <CardContent className="py-12">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
                    <h3 className="text-xl font-semibold text-blue-800 mb-2">
                      3个AI模型正在交叉验证您的创意...
                    </h3>
                    <p className="text-blue-600">
                      DeepSeek、智谱GLM、通义千问正在并行分析，对比结果以提供可信数据
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* 分析结果展示 */}
          {ideaCharacteristics && personalizedRecommendations && !analyzing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <RealtimeRecommendationDisplay
                ideaCharacteristics={ideaCharacteristics}
                personalizedRecommendations={personalizedRecommendations}
                isAnalyzing={false}
              />
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  )
}