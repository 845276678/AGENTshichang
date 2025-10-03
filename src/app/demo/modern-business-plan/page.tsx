'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ModernBusinessPlan } from '@/components/business-plan/ModernBusinessPlan'
import { useBusinessPlanGeneration } from '@/stores/useBusinessPlanGeneration'
import {
  Play, FileText, Download, Eye, Sparkles, Zap,
  Target, Palette, Smartphone, Gauge
} from 'lucide-react'

// 模拟数据用于演示
const mockIdeaData = {
  id: 'demo-idea-001',
  title: 'AI智能学习助手',
  description: '基于大语言模型的个性化学习辅导系统，为学生提供24/7智能答疑和个性化学习路径规划，革新传统教育模式',
  category: '教育科技',
  tags: ['AI', '教育', 'SaaS', '个性化学习'],
  submittedBy: 'demo@example.com'
}

export default function ModernBusinessPlanDemo() {
  const {
    isGenerating,
    progress,
    startGeneration,
    stopGeneration,
    setProgress
  } = useBusinessPlanGeneration()

  const [showModernView, setShowModernView] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)

  const handleStartGeneration = async () => {
    try {
      startGeneration()
      setProgress(0)

      // 模拟生成过程
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            stopGeneration()
            setHasGenerated(true)
            return 100
          }
          return prev + 10
        })
      }, 300)
    } catch (error) {
      console.error('Generation failed:', error)
      stopGeneration()
    }
  }

  // 模拟完成的章节数据
  const mockCompletedVersions = hasGenerated ? [
    {
      id: 'stage-1',
      stageId: 'market-analysis',
      content: {
        title: '市场分析与机会',
        summary: 'AI教育市场正在快速增长，个性化学习需求强烈',
        keyPoints: ['市场规模超过500亿', '年增长率达30%', '技术成熟度高'],
        fullContent: '详细的市场分析内容...'
      }
    },
    {
      id: 'stage-2',
      stageId: 'product-strategy',
      content: {
        title: '产品策略',
        summary: '打造24/7智能学习助手，提供个性化辅导',
        keyPoints: ['核心功能设计', '用户体验优化', '技术架构选型'],
        fullContent: '详细的产品策略内容...'
      }
    },
    {
      id: 'stage-3',
      stageId: 'business-model',
      content: {
        title: '商业模式',
        summary: 'SaaS订阅制+增值服务的混合模式',
        keyPoints: ['订阅收入', '企业服务', '内容授权'],
        fullContent: '详细的商业模式内容...'
      }
    }
  ] : []

  const completedVersions = mockCompletedVersions
  const overallProgress = progress
  const stages = [
    { id: 'stage-1', name: '市场分析', status: hasGenerated ? 'completed' : 'pending', progress: hasGenerated ? 100 : 0 },
    { id: 'stage-2', name: '产品策略', status: hasGenerated ? 'completed' : 'pending', progress: hasGenerated ? 100 : 0 },
    { id: 'stage-3', name: '商业模式', status: hasGenerated ? 'completed' : 'pending', progress: hasGenerated ? 100 : 0 },
    { id: 'stage-4', name: '运营计划', status: 'pending', progress: 0 },
    { id: 'stage-5', name: '财务规划', status: 'pending', progress: 0 }
  ]

  // 转换数据为现代化格式
  const mockPlanData = {
    title: `${mockIdeaData.title} 商业计划书`,
    ideaData: {
      title: mockIdeaData.title,
      category: mockIdeaData.category,
      description: mockIdeaData.description
    },
    chapters: completedVersions.length > 0 ? completedVersions.map((version, index) => ({
      id: version.stageId,
      title: version.content.title,
      completionProgress: stages[index]?.status === 'completed' ? 100 : stages[index]?.progress || 0,
      coreContent: version.content.coreContent || {
        summary: version.content.summary,
        keyPoints: version.content.keyPoints || [],
        visualData: {
          metrics: [
            { label: '可行性评分', value: '8.5/10', trend: 'up' },
            { label: '市场潜力', value: '高', trend: 'up' }
          ]
        },
        actionItems: ['完善核心功能', '市场调研验证', '团队组建']
      },
      expandedContent: version.content.expandableContent || {
        fullAnalysis: version.content.fullContent || '详细分析内容正在生成中...',
        detailedSections: [
          { title: '深度分析', content: '这里包含详细的分析内容和数据支撑。' }
        ],
        references: ['AI技术报告', '行业研究数据', '用户调研结果']
      },
      readingTime: {
        core: 2,
        expanded: 5
      }
    })) : [],
    metadata: {
      totalPages: 8,
      totalReadingTime: 16,
      completionRate: Math.round((completedVersions.length / stages.length) * 100),
      lastUpdated: new Date()
    }
  }

  if (showModernView && completedVersions.length > 0) {
    return (
      <ModernBusinessPlan
        planData={mockPlanData}
        onExport={(format) => console.log('Export:', format)}
        onShare={() => console.log('Share')}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* 现代化页面头部 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 space-y-8"
        >
          <div className="space-y-4">
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <Sparkles className="w-4 h-4 mr-2" />
              现代化 UI 设计演示
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              商业计划书
            </h1>

            <h2 className="text-2xl md:text-3xl font-medium text-gray-600">
              现代化设计体验
            </h2>

            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              体验全新的现代化商业计划书界面设计，采用最新的设计语言和交互模式，
              为您带来更加流畅、美观、直观的阅读体验。
            </p>
          </div>

          {/* 特性卡片 */}
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: Palette,
                title: '现代视觉',
                description: '渐变色彩、玻璃拟态、微交互设计',
                color: 'from-pink-500 to-rose-500'
              },
              {
                icon: Zap,
                title: '流畅交互',
                description: '平滑动画、即时响应、手势支持',
                color: 'from-yellow-500 to-orange-500'
              },
              {
                icon: Smartphone,
                title: '响应式设计',
                description: '完美适配所有设备尺寸',
                color: 'from-green-500 to-emerald-500'
              },
              {
                icon: Gauge,
                title: '性能优化',
                description: '快速加载、内存友好、丝般顺滑',
                color: 'from-blue-500 to-cyan-500'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="group"
              >
                <Card className="text-center border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 演示状态卡片 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl mb-2 flex items-center">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mr-3">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    {mockIdeaData.title}
                  </CardTitle>
                  <p className="text-muted-foreground">
                    {mockIdeaData.description}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {mockIdeaData.category}
                  </Badge>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {mockIdeaData.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* 生成进度 */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">生成进度</h3>
                  <span className="text-2xl font-bold text-blue-600">
                    {Math.round(overallProgress)}%
                  </span>
                </div>

                <div className="relative">
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                      style={{ width: `${overallProgress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>已完成 {completedVersions.length} / {stages.length} 章节</span>
                    <span>
                      {overallProgress === 100 ? '生成完成' : `预计还需 ${Math.max(0, Math.round((100 - overallProgress) * 0.3))}分钟`}
                    </span>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex flex-col sm:flex-row gap-4">
                {completedVersions.length === 0 ? (
                  <Button
                    onClick={handleStartGeneration}
                    disabled={isGenerating}
                    size="lg"
                    className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    {isGenerating ? '正在生成...' : '开始生成演示'}
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => setShowModernView(true)}
                      size="lg"
                      className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25"
                    >
                      <Eye className="w-5 h-5 mr-2" />
                      体验现代化界面
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-12"
                      onClick={handleStartGeneration}
                      disabled={isGenerating}
                    >
                      <FileText className="w-5 h-5 mr-2" />
                      重新生成
                    </Button>
                  </>
                )}
              </div>

              {/* 设计亮点 */}
              {completedVersions.length > 0 && (
                <div className="pt-6 border-t border-gray-200">
                  <h4 className="font-semibold mb-4 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
                    现代化设计亮点
                  </h4>

                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                        <Palette className="w-4 h-4 text-white" />
                      </div>
                      <h5 className="font-medium">视觉设计</h5>
                      <p className="text-muted-foreground">
                        玻璃拟态效果、渐变背景、现代卡片设计
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      <h5 className="font-medium">交互体验</h5>
                      <p className="text-muted-foreground">
                        流畅动画、微交互、悬浮效果、手势操作
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                        <Target className="w-4 h-4 text-white" />
                      </div>
                      <h5 className="font-medium">功能升级</h5>
                      <p className="text-muted-foreground">
                        智能导航、暗黑模式、视图切换、快捷操作
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.section>

        {/* 生成状态指示器 */}
        {isGenerating && (
          <motion.section
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 w-80">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                  </motion.div>

                  <div className="flex-1">
                    <p className="font-medium text-gray-900">AI 正在生成内容</p>
                    <p className="text-sm text-muted-foreground">
                      {Math.round(overallProgress)}% 完成
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>
        )}

        {/* 底部说明 */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center pt-16 pb-8"
        >
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            这是商业计划书现代化界面设计的演示页面。新的设计采用了最新的 UI/UX 趋势，
            包括玻璃拟态效果、流畅动画、智能交互等现代设计元素，为用户带来更加优雅和高效的使用体验。
          </p>
        </motion.section>
      </div>
    </div>
  )
}