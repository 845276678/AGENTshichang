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

  const [ideaTitle, setIdeaTitle] = useState('')
  const [ideaDescription, setIdeaDescription] = useState('')
  const [userLocation, setUserLocation] = useState('北京')
  const [userBackground, setUserBackground] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [ideaCharacteristics, setIdeaCharacteristics] = useState<IdeaCharacteristics | null>(null)
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<PersonalizedRecommendations | null>(null)

  // 从竞价页面导入创意时自动填充
  useEffect(() => {
    if (ideaTitleParam) {
      setIdeaTitle(decodeURIComponent(ideaTitleParam))
    }
    if (ideaDescParam) {
      setIdeaDescription(decodeURIComponent(ideaDescParam))
    }
  }, [ideaTitleParam, ideaDescParam])

  const handleAnalyze = () => {
    setAnalyzing(true)
    setTimeout(() => {
      setAnalyzing(false)

      // 设置创意特征
      setIdeaCharacteristics({
        category: '教育科技',
        technicalComplexity: '中等',
        fundingRequirement: '中等（5-20万）',
        competitionLevel: '中等',
        aiCapabilities: {
          nlp: true,
          cv: false,
          ml: true,
          recommendation: true,
          generation: false,
          automation: true
        }
      })

      // 设置个性化推荐
      setPersonalizedRecommendations({
        techStackRecommendations: {
          beginner: {
            primary: 'OpenAI API + Python Flask',
            timeline: '1-2个月',
            reason: '快速验证概念，成本低',
            cost: '¥2000-5000/月'
          }
        },
        researchChannels: {
          online: [
            '知乎教育话题社区调研',
            '小红书学习方法内容分析',
            '抖音教育类视频评论挖掘'
          ],
          offline: [
            '北京高校学生访谈',
            '海淀区教育机构实地调研',
            '中关村创业咖啡馆交流'
          ]
        },
        offlineEvents: {
          nationalEvents: [
            {
              name: 'GET教育科技大会',
              time: '每年11月',
              location: '北京',
              cost: '¥2000-3000'
            }
          ],
          localEvents: [
            '北京教育创新沙龙',
            'AI教育技术交流会',
            '创业者周末活动'
          ]
        },
        customizedTimeline: {
          month1: { focus: '用户调研与MVP开发' },
          month2: { focus: '产品迭代与种子用户获取' },
          month3: { focus: '商业模式验证与融资准备' }
        },
        budgetPlan: {
          startupCosts: { total: 50000 },
          monthlyCosts: { total: 15000 },
          costOptimization: ['使用开源工具降低成本', '申请创业补贴', '共享办公空间']
        },
        teamRecommendations: {
          coreTeam: ['全栈开发工程师', '教育产品经理', 'AI算法工程师'],
          advisorTypes: ['教育行业专家', 'AI技术顾问']
        }
      })
    }, 2000)
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
              基于创意特征实时适配的5阶段商业计划框架，提供AI技术栈推荐、需求发现渠道、线下调研活动等个性化指导
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
                  输入您的创意，系统将实时分析特征并生成个性化推荐
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
                        onChange={(e) => setIdeaTitle(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">所在城市</Label>
                      <Input
                        id="location"
                        placeholder="北京"
                        value={userLocation}
                        onChange={(e) => setUserLocation(e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">详细描述</Label>
                    <Textarea
                      id="description"
                      placeholder="描述您的创意要解决什么问题，面向什么用户，如何创造价值..."
                      value={ideaDescription}
                      onChange={(e) => setIdeaDescription(e.target.value)}
                      className="min-h-[120px] w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="background">个人背景（可选）</Label>
                    <Input
                      id="background"
                      placeholder="例如：技术背景、行业经验、可用资源等"
                      value={userBackground}
                      onChange={(e) => setUserBackground(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div className="flex justify-center pt-4">
                    <Button
                      onClick={handleAnalyze}
                      disabled={analyzing || !ideaTitle || !ideaDescription}
                      className="px-8 py-6 text-lg"
                      size="lg"
                    >
                      {analyzing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          分析中...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          开始分析创意
                          <ArrowRight className="ml-2 h-5 w-5" />
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
                      正在实时分析创意特征...
                    </h3>
                    <p className="text-blue-600">
                      AI正在分析您的创意，识别技术需求和市场特征
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