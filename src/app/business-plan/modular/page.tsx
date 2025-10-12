'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Users,
  Code,
  Megaphone,
  DollarSign,
  Sparkles,
  Clock,
  Check,
  ArrowRight,
  Lightbulb,
  Loader2,
  Brain,
  TrendingUp,
  Info,
  Download,
  Eye,
  ChevronRight,
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  RefreshCw,
  Edit
} from 'lucide-react'
import { analyzeIdea, type IdeaAnalysisResult } from '@/lib/business-plan/idea-analyzer'
import { analyzeIdeaCompleteness, type CompletenessAnalysis } from '@/lib/business-plan/idea-completeness-analyzer'
import { IdeaEnhancementFlow } from '@/components/business-plan/IdeaEnhancementFlow'

interface ModuleCardProps {
  id: string
  title: string
  description: string
  icon: React.ElementType
  color: string
  estimatedTime: string
  difficulty: string
  outputs: string[]
  isSelected: boolean
  onSelect: () => void
  isCompleted?: boolean
  isRecommended?: boolean
}

const ModuleCard: React.FC<ModuleCardProps> = ({
  title,
  description,
  icon: Icon,
  color,
  estimatedTime,
  difficulty,
  outputs,
  isSelected,
  onSelect,
  isCompleted,
  isRecommended
}) => {
  return (
    <Card
      className={`relative cursor-pointer transition-all duration-300 ${
        isSelected
          ? `border-2 ${color} shadow-lg scale-105`
          : 'border hover:shadow-md hover:scale-102'
      } ${isCompleted ? 'bg-green-50 border-green-300' : ''}`}
      onClick={onSelect}
    >
      {isRecommended && !isCompleted && (
        <div className="absolute -top-3 -right-3 bg-yellow-500 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg z-10">
          AI推荐
        </div>
      )}
      {isCompleted && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 z-10">
          <Check className="w-4 h-4" />
        </div>
      )}
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-14 h-14 rounded-xl ${color.replace('border-', 'bg-').replace('500', '100')} flex items-center justify-center`}>
            <Icon className={`w-7 h-7 ${color.replace('border-', 'text-')}`} />
          </div>
          {isSelected && !isCompleted && (
            <Badge className={color.replace('border-', 'bg-')}>已选中</Badge>
          )}
        </div>

        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-gray-600">
              <Clock className="w-4 h-4" />
              {estimatedTime}
            </span>
            <Badge variant="outline">{difficulty}</Badge>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">输出内容:</p>
            <div className="flex flex-wrap gap-1">
              {outputs.map((output, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {output}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface ModuleResult {
  moduleId: string
  data: any
  downloadUrl?: string
  previewUrl?: string
}

interface ModuleFeedback {
  moduleId: string
  rating: number // 1-5 stars
  comment: string
  suggestions: string[]
  isHelpful: boolean | null
}

export default function ModularBusinessPlanPage() {
  const router = useRouter()
  const [ideaTitle, setIdeaTitle] = useState('')
  const [ideaContent, setIdeaContent] = useState('')
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set())
  const [isGenerating, setIsGenerating] = useState(false)
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set())
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<IdeaAnalysisResult | null>(null)
  const [completenessAnalysis, setCompletenessAnalysis] = useState<CompletenessAnalysis | null>(null)
  const [showEnhancementFlow, setShowEnhancementFlow] = useState(false)
  const [moduleResults, setModuleResults] = useState<Map<string, ModuleResult>>(new Map())
  const [currentGeneratingModule, setCurrentGeneratingModule] = useState<string>('')

  // 反馈调整机制相关状态
  const [moduleFeedback, setModuleFeedback] = useState<Map<string, ModuleFeedback>>(new Map())
  const [showFeedbackFor, setShowFeedbackFor] = useState<string | null>(null)
  const [isRegenerating, setIsRegenerating] = useState<Map<string, boolean>>(new Map())

  const modules = [
    {
      id: 'market-analysis',
      title: '需求场景分析',
      description: '深入分析目标市场和用户需求，了解竞争格局',
      icon: Users,
      color: 'border-blue-500',
      estimatedTime: analysisResult?.moduleRelevance.marketAnalysis.estimatedTime || '3-5分钟',
      difficulty: analysisResult?.moduleRelevance.marketAnalysis.priority === 'high' ? '重要' : '一般',
      outputs: ['用户画像', '市场规模', '竞争分析', '需求洞察']
    },
    {
      id: 'mvp-prototype',
      title: 'MVP版本制作',
      description: '生成可交互的HTML前端原型，无需后端开发',
      icon: Code,
      color: 'border-green-500',
      estimatedTime: analysisResult?.moduleRelevance.mvpPrototype.estimatedTime || '5-8分钟',
      difficulty: analysisResult?.moduleRelevance.mvpPrototype.priority === 'high' ? '重要' : '一般',
      outputs: ['HTML代码', 'CSS样式', 'JS交互', '使用文档']
    },
    {
      id: 'marketing-strategy',
      title: '推广策略规划',
      description: '制定全面的营销推广计划和渠道策略',
      icon: Megaphone,
      color: 'border-purple-500',
      estimatedTime: analysisResult?.moduleRelevance.marketingStrategy.estimatedTime || '4-6分钟',
      difficulty: analysisResult?.moduleRelevance.marketingStrategy.priority === 'high' ? '重要' : '一般',
      outputs: ['渠道策略', '内容规划', '预算分配', '执行计划']
    },
    {
      id: 'business-model',
      title: '盈利模式设计',
      description: '设计可持续的商业变现方案和财务预测',
      icon: DollarSign,
      color: 'border-orange-500',
      estimatedTime: analysisResult?.moduleRelevance.businessModel.estimatedTime || '4-6分钟',
      difficulty: analysisResult?.moduleRelevance.businessModel.priority === 'high' ? '重要' : '一般',
      outputs: ['收入模式', '定价策略', '成本结构', '财务预测']
    }
  ]

  // 当分析完成后，自动选择推荐的模块
  useEffect(() => {
    if (analysisResult?.recommendations.suggestedModules) {
      setSelectedModules(new Set(analysisResult.recommendations.suggestedModules))
    }
  }, [analysisResult])

  // 智能分析创意
  const handleAnalyzeIdea = async () => {
    if (!ideaTitle.trim() || !ideaContent.trim()) {
      alert('请先输入创意标题和描述')
      return
    }

    setIsAnalyzing(true)
    try {
      // 并行执行两种分析
      const [basicResult, completenessResult] = await Promise.all([
        analyzeIdea(ideaTitle, ideaContent),
        analyzeIdeaCompleteness(ideaTitle, ideaContent)
      ])

      setAnalysisResult(basicResult)
      setCompletenessAnalysis(completenessResult)

      console.log('✅ 创意分析结果:', basicResult)
      console.log('✅ 完整度分析结果:', completenessResult)

      // 根据完整度决定是否显示完善流程
      if (completenessResult.canGenerateQuality === 'insufficient' || completenessResult.overallScore < 50) {
        setShowEnhancementFlow(true)
      }
    } catch (error) {
      console.error('❌ 分析失败:', error)
      alert('分析失败，请重试')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // 处理创意更新（来自完善流程）
  const handleIdeaUpdate = (title: string, description: string) => {
    setIdeaTitle(title)
    setIdeaContent(description)
  }

  // 重新分析
  const handleReAnalyze = async () => {
    setShowEnhancementFlow(false)
    await handleAnalyzeIdea()
  }

  // 继续生成流程
  const handleProceedGeneration = () => {
    setShowEnhancementFlow(false)
    // 自动选择推荐的模块
    if (analysisResult?.recommendations.suggestedModules) {
      setSelectedModules(new Set(analysisResult.recommendations.suggestedModules))
    }
  }

  const handleModuleSelect = (moduleId: string) => {
    const newSelected = new Set(selectedModules)
    if (newSelected.has(moduleId)) {
      newSelected.delete(moduleId)
    } else {
      newSelected.add(moduleId)
    }
    setSelectedModules(newSelected)
  }

  const handleGenerate = async () => {
    if (!ideaContent.trim()) {
      alert('请先输入您的创意想法')
      return
    }

    if (selectedModules.size === 0) {
      alert('请至少选择一个模块')
      return
    }

    // 重置本次生成的状态，避免沿用旧结果
    setCompletedModules(new Set())
    setModuleResults(new Map())
    setCurrentGeneratingModule('')

    setIsGenerating(true)
    const results = new Map<string, ModuleResult>()
    const failedModules: Array<{ id: string; status: number; message?: string }> = []

    try {
      // 按顺序生成选中的模块
      for (const moduleId of Array.from(selectedModules)) {
        setCurrentGeneratingModule(moduleId)
        console.log(`🔄 正在生成模块: ${moduleId}`)

        // 根据模块类型调用不同的API，使用分析结果中的数据
        let apiUrl = ''
        let requestBody: any = {
          ideaDescription: ideaContent,
          ideaTitle: ideaTitle
        }

        // 使用分析结果增强请求数据
        if (analysisResult) {
          requestBody.targetUsers = analysisResult.characteristics.targetUsers
          requestBody.coreFeatures = analysisResult.characteristics.coreFeatures
          requestBody.industryType = analysisResult.characteristics.industry
          requestBody.businessType = analysisResult.characteristics.businessType
        }

        // 使用完整度分析优化生成质量
        if (completenessAnalysis) {
          requestBody.completenessScore = completenessAnalysis.overallScore
          requestBody.qualityLevel = completenessAnalysis.canGenerateQuality
          requestBody.dimensionScores = Object.fromEntries(
            Object.entries(completenessAnalysis.dimensions).map(([key, dim]) => [key, dim.score])
          )
          requestBody.missingInfo = Object.fromEntries(
            Object.entries(completenessAnalysis.dimensions)
              .filter(([, dim]) => dim.missing.length > 0)
              .map(([key, dim]) => [key, dim.missing])
          )
          requestBody.recommendations = completenessAnalysis.recommendations
          requestBody.generationGuidance = {
            focusAreas: completenessAnalysis.recommendations.map(r => r.dimension),
            avoidGenericContent: completenessAnalysis.overallScore < 70,
            useConservativeApproach: completenessAnalysis.canGenerateQuality === 'low' || completenessAnalysis.canGenerateQuality === 'insufficient'
          }
        }

        switch (moduleId) {
          case 'market-analysis':
            apiUrl = '/api/business-plan/modules/market-analysis'
            requestBody.industryCategory = analysisResult?.characteristics.industry || '通用'
            if (analysisResult) {
              requestBody.focusAreas = analysisResult.moduleRelevance.marketAnalysis.suggestedFocus
              requestBody.keyQuestions = analysisResult.moduleRelevance.marketAnalysis.keyQuestions
            }
            // 针对市场分析的完整度优化
            if (completenessAnalysis) {
              requestBody.targetUserConfidence = completenessAnalysis.dimensions.targetUsers.score
              requestBody.competitorAnalysisDepth = completenessAnalysis.dimensions.competitors.score > 60 ? 'detailed' : 'basic'
              requestBody.marketSizeApproach = completenessAnalysis.dimensions.userScenarios.score > 70 ? 'data-driven' : 'conservative'
            }
            break

          case 'mvp-prototype':
            apiUrl = '/api/business-plan/modules/mvp-prototype'
            if (analysisResult) {
              requestBody.targetUsers = analysisResult.characteristics.targetUsers
              requestBody.coreFeatures = analysisResult.moduleRelevance.mvpPrototype.suggestedFeatures
              requestBody.industryType = analysisResult.characteristics.industry
            } else {
              requestBody.targetUsers = ['目标用户']
              requestBody.coreFeatures = ['核心功能1', '核心功能2']
              requestBody.industryType = '通用'
            }
            // 针对MVP的完整度优化
            if (completenessAnalysis) {
              requestBody.featureComplexity = completenessAnalysis.dimensions.coreFeatures.score > 70 ? 'advanced' : 'basic'
              requestBody.designDetailLevel = completenessAnalysis.dimensions.uniqueValue.score > 60 ? 'detailed' : 'minimal'
              requestBody.interactionDepth = completenessAnalysis.dimensions.userScenarios.score
              requestBody.technicalApproach = completenessAnalysis.dimensions.techRequirements.score > 50 ? 'specific' : 'generic'
            }
            break

          case 'marketing-strategy':
            apiUrl = '/api/business-plan/modules/marketing-strategy'
            if (analysisResult) {
              requestBody.targetUsers = analysisResult.characteristics.targetUsers
              requestBody.suggestedChannels = analysisResult.moduleRelevance.marketingStrategy.suggestedChannels
            } else {
              requestBody.targetUsers = ['目标用户']
            }
            // 针对营销策略的完整度优化
            if (completenessAnalysis) {
              requestBody.audienceSegmentationDepth = completenessAnalysis.dimensions.targetUsers.score > 70 ? 'detailed' : 'basic'
              requestBody.channelSpecificity = completenessAnalysis.dimensions.userScenarios.score
              requestBody.budgetDetailLevel = completenessAnalysis.dimensions.businessModel.score > 60 ? 'specific' : 'general'
              requestBody.competitivePositioning = completenessAnalysis.dimensions.competitors.score > 50
            }
            break

          case 'business-model':
            apiUrl = '/api/business-plan/modules/business-model'
            if (analysisResult) {
              requestBody.targetUsers = analysisResult.characteristics.targetUsers
              requestBody.revenueStreams = analysisResult.moduleRelevance.businessModel.revenueStreams
              requestBody.costStructure = analysisResult.moduleRelevance.businessModel.costStructure
            } else {
              requestBody.targetUsers = ['目标用户']
            }
            // 针对商业模式的完整度优化
            if (completenessAnalysis) {
              requestBody.revenueModelDepth = completenessAnalysis.dimensions.businessModel.score > 70 ? 'detailed' : 'conceptual'
              requestBody.pricingStrategySpecificity = completenessAnalysis.dimensions.uniqueValue.score
              requestBody.financialProjectionLevel = completenessAnalysis.dimensions.businessModel.score > 60 ? 'quantitative' : 'qualitative'
              requestBody.marketValidationApproach = completenessAnalysis.dimensions.competitors.score > 50 ? 'competitive' : 'theoretical'
            }
            break
        }

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        })

        if (response.ok) {
          const result = await response.json()
          results.set(moduleId, {
            moduleId,
            data: result.data,
            downloadUrl: result.data?.downloadUrls?.htmlBundle,
            previewUrl: result.data?.previewUrl
          })
          setCompletedModules(prev => new Set([...prev, moduleId]))
          console.log(`✅ 模块 ${moduleId} 生成完成`)
        } else {
          let errorMessage: string | undefined
          try {
            const errorPayload = await response.json()
            errorMessage = errorPayload?.error
          } catch {
            // ignore json parse error
          }
          failedModules.push({ id: moduleId, status: response.status, message: errorMessage })
          console.error(`❌ 模块 ${moduleId} 生成失败`, {
            status: response.status,
            error: errorMessage
          })
        }

        // 模拟进度
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      setModuleResults(results)

      if (failedModules.length === 0) {
        alert('所有选中的模块已生成完成！')
      } else {
        const failedSummary = failedModules
          .map(module => {
            const moduleName = modules.find(m => m.id === module.id)?.title || module.id
            return `${moduleName}（状态码 ${module.status}${module.message ? `，错误信息：${module.message}` : ''}）`
          })
          .join('\n')
        alert(`部分模块生成失败，请稍后重试：\n${failedSummary}`)
      }
    } catch (error) {
      console.error('❌ 生成失败:', error)
      alert('生成过程中出现错误，请重试')
    } finally {
      setIsGenerating(false)
      setCurrentGeneratingModule('')
    }
  }

  const handleDownloadModule = (moduleId: string) => {
    const result = moduleResults.get(moduleId)
    if (!result) return

    if (moduleId === 'mvp-prototype' && result.data?.prototype) {
      // 下载MVP HTML文件
      const htmlContent = result.data.prototype.htmlCode
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${ideaTitle || '创意项目'}-MVP原型.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } else {
      // 其他模块下载JSON
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${ideaTitle || '创意项目'}-${moduleId}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  // 反馈调整机制相关函数
  const handleModuleFeedback = (moduleId: string, rating: number) => {
    const newFeedback = new Map(moduleFeedback)
    const existing = newFeedback.get(moduleId) || {
      moduleId,
      rating: 0,
      comment: '',
      suggestions: [],
      isHelpful: null
    }

    newFeedback.set(moduleId, { ...existing, rating })
    setModuleFeedback(newFeedback)
  }

  const handleFeedbackComment = (moduleId: string, comment: string) => {
    const newFeedback = new Map(moduleFeedback)
    const existing = newFeedback.get(moduleId) || {
      moduleId,
      rating: 0,
      comment: '',
      suggestions: [],
      isHelpful: null
    }

    newFeedback.set(moduleId, { ...existing, comment })
    setModuleFeedback(newFeedback)
  }

  const handleHelpfulFeedback = (moduleId: string, isHelpful: boolean) => {
    const newFeedback = new Map(moduleFeedback)
    const existing = newFeedback.get(moduleId) || {
      moduleId,
      rating: 0,
      comment: '',
      suggestions: [],
      isHelpful: null
    }

    newFeedback.set(moduleId, { ...existing, isHelpful })
    setModuleFeedback(newFeedback)
  }

  const handleRegenerateModule = async (moduleId: string) => {
    const feedback = moduleFeedback.get(moduleId)
    if (!feedback || !feedback.comment.trim()) {
      alert('请先提供反馈意见，我们将根据您的建议重新生成')
      return
    }

    // 标记正在重新生成
    const newRegenerating = new Map(isRegenerating)
    newRegenerating.set(moduleId, true)
    setIsRegenerating(newRegenerating)

    try {
      // 构建API请求，包含用户反馈
      let apiUrl = ''
      let requestBody: any = {
        ideaDescription: ideaContent,
        ideaTitle: ideaTitle,
        feedback: {
          rating: feedback.rating,
          comment: feedback.comment,
          suggestions: feedback.suggestions,
          regenerationReason: `用户反馈：${feedback.comment}`
        }
      }

      // 使用分析结果增强请求数据
      if (analysisResult) {
        requestBody.targetUsers = analysisResult.characteristics.targetUsers
        requestBody.coreFeatures = analysisResult.characteristics.coreFeatures
        requestBody.industryType = analysisResult.characteristics.industry
        requestBody.businessType = analysisResult.characteristics.businessType
      }

      // 使用完整度分析优化重新生成
      if (completenessAnalysis) {
        requestBody.completenessScore = completenessAnalysis.overallScore
        requestBody.qualityLevel = completenessAnalysis.canGenerateQuality
        requestBody.regenerationContext = {
          originalQuality: completenessAnalysis.canGenerateQuality,
          focusAreas: completenessAnalysis.recommendations.map(r => r.dimension),
          improvementNeeded: true,
          userFeedback: feedback.comment
        }
      }

      // 设置API URL和特定参数
      switch (moduleId) {
        case 'market-analysis':
          apiUrl = '/api/business-plan/modules/market-analysis'
          requestBody.industryCategory = analysisResult?.characteristics.industry || '通用'
          if (analysisResult) {
            requestBody.focusAreas = analysisResult.moduleRelevance.marketAnalysis.suggestedFocus
            requestBody.keyQuestions = analysisResult.moduleRelevance.marketAnalysis.keyQuestions
          }
          break

        case 'mvp-prototype':
          apiUrl = '/api/business-plan/modules/mvp-prototype'
          if (analysisResult) {
            requestBody.targetUsers = analysisResult.characteristics.targetUsers
            requestBody.coreFeatures = analysisResult.moduleRelevance.mvpPrototype.suggestedFeatures
            requestBody.industryType = analysisResult.characteristics.industry
          } else {
            requestBody.targetUsers = ['目标用户']
            requestBody.coreFeatures = ['核心功能1', '核心功能2']
            requestBody.industryType = '通用'
          }
          break

        case 'marketing-strategy':
          apiUrl = '/api/business-plan/modules/marketing-strategy'
          if (analysisResult) {
            requestBody.targetUsers = analysisResult.characteristics.targetUsers
            requestBody.suggestedChannels = analysisResult.moduleRelevance.marketingStrategy.suggestedChannels
          } else {
            requestBody.targetUsers = ['目标用户']
          }
          break

        case 'business-model':
          apiUrl = '/api/business-plan/modules/business-model'
          if (analysisResult) {
            requestBody.targetUsers = analysisResult.characteristics.targetUsers
            requestBody.revenueStreams = analysisResult.moduleRelevance.businessModel.revenueStreams
            requestBody.costStructure = analysisResult.moduleRelevance.businessModel.costStructure
          } else {
            requestBody.targetUsers = ['目标用户']
          }
          break
      }

      console.log(`🔄 重新生成模块: ${moduleId}，基于用户反馈: ${feedback.comment}`)

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      if (response.ok) {
        const result = await response.json()

        // 更新模块结果
        const newResults = new Map(moduleResults)
        newResults.set(moduleId, {
          moduleId,
          data: result.data,
          downloadUrl: result.data?.downloadUrls?.htmlBundle,
          previewUrl: result.data?.previewUrl
        })
        setModuleResults(newResults)

        // 重置反馈状态
        setShowFeedbackFor(null)

        console.log(`✅ 模块 ${moduleId} 重新生成完成`)
        alert('模块已根据您的反馈重新生成完成！')
      } else {
        console.error(`❌ 模块 ${moduleId} 重新生成失败`)
        alert('重新生成失败，请稍后重试')
      }
    } catch (error) {
      console.error('重新生成过程中出现错误:', error)
      alert('重新生成过程中出现错误，请重试')
    } finally {
      // 清除正在重新生成的标记
      const newRegenerating = new Map(isRegenerating)
      newRegenerating.delete(moduleId)
      setIsRegenerating(newRegenerating)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              模块化商业计划生成
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            AI智能分析您的创意，自动推荐最相关的模块，生成专业的商业计划内容
          </p>
        </div>

        {/* 创意输入区域 */}
        <Card className="mb-8 border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-yellow-500" />
              输入您的创意
            </CardTitle>
            <CardDescription>
              详细描述您的创意，AI将智能分析并推荐最适合的模块
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="ideaTitle" className="text-base font-semibold mb-2 block">
                创意标题 *
              </Label>
              <Input
                id="ideaTitle"
                value={ideaTitle}
                onChange={(e) => setIdeaTitle(e.target.value)}
                placeholder="例如：AI智能学习助手"
                className="text-base"
                disabled={isGenerating || isAnalyzing}
              />
            </div>

            <div>
              <Label htmlFor="ideaContent" className="text-base font-semibold mb-2 block">
                详细描述 *
              </Label>
              <Textarea
                id="ideaContent"
                value={ideaContent}
                onChange={(e) => setIdeaContent(e.target.value)}
                placeholder="例如：一个基于AI的个性化学习助手，能够根据学生的学习习惯和知识掌握程度，自动生成个性化的学习计划和练习题。目标用户是K12学生和家长，核心功能包括智能答疑、学习规划、进度追踪等..."
                className="min-h-[140px] resize-none text-base"
                disabled={isGenerating || isAnalyzing}
              />
              <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                <span>{ideaContent.length} 字符</span>
                <span>建议 100-500 字</span>
              </div>
            </div>

            <Button
              onClick={handleAnalyzeIdea}
              disabled={isAnalyzing || !ideaTitle.trim() || !ideaContent.trim()}
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  AI正在分析您的创意...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5 mr-2" />
                  AI智能分析创意
                  <Sparkles className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 创意完善引导流程 */}
        {showEnhancementFlow && completenessAnalysis && (
          <IdeaEnhancementFlow
            analysis={completenessAnalysis}
            ideaTitle={ideaTitle}
            ideaDescription={ideaContent}
            onIdeaUpdate={handleIdeaUpdate}
            onReAnalyze={handleReAnalyze}
            onProceedGeneration={handleProceedGeneration}
          />
        )}

        {/* AI分析结果展示 */}
        {analysisResult && !showEnhancementFlow && (
          <Card className="mb-8 border-2 border-green-300 bg-gradient-to-r from-green-50 to-blue-50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <TrendingUp className="w-6 h-6" />
                AI分析结果
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 创意特征 */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600 mb-1">行业类型</div>
                  <div className="font-semibold text-blue-600">{analysisResult.characteristics.industry}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600 mb-1">商业模式</div>
                  <div className="font-semibold text-purple-600">{analysisResult.characteristics.businessType}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600 mb-1">复杂度</div>
                  <div className="font-semibold text-orange-600 capitalize">{analysisResult.characteristics.complexity}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600 mb-1">目标用户</div>
                  <div className="font-semibold text-green-600">{analysisResult.characteristics.targetUsers.join('、')}</div>
                </div>
              </div>

              {/* AI推荐 */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>AI智能推荐</AlertTitle>
                <AlertDescription className="mt-2 space-y-2">
                  <p className="font-semibold">{analysisResult.recommendations.criticalPath}</p>
                  <div className="space-y-1 text-sm">
                    {analysisResult.recommendations.suggestedOrder.map((order, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <ChevronRight className="w-4 h-4 text-blue-500" />
                        <span>{order}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    预计总时间: {analysisResult.recommendations.totalEstimatedTime}
                  </p>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* 质量提示（当需要完善时显示） */}
        {completenessAnalysis && !showEnhancementFlow && completenessAnalysis.canGenerateQuality !== 'high' && (
          <Alert className="mb-6 border-yellow-300 bg-yellow-50">
            <Info className="h-4 w-4" />
            <AlertTitle>创意完整度分析</AlertTitle>
            <AlertDescription className="mt-2">
              <div className="flex items-center gap-2 mb-2">
                <span>当前完整度得分: </span>
                <Badge variant="outline">{completenessAnalysis.overallScore}/100</Badge>
                <Badge className={
                  completenessAnalysis.canGenerateQuality === 'high' ? 'bg-green-100 text-green-800' :
                  completenessAnalysis.canGenerateQuality === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  completenessAnalysis.canGenerateQuality === 'low' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }>
                  {completenessAnalysis.canGenerateQuality === 'high' ? '优秀' :
                   completenessAnalysis.canGenerateQuality === 'medium' ? '良好' :
                   completenessAnalysis.canGenerateQuality === 'low' ? '一般' : '不足'}
                </Badge>
              </div>
              <p className="text-sm">
                {completenessAnalysis.canGenerateQuality === 'insufficient'
                  ? '创意信息不足，建议先完善再生成内容'
                  : '可以生成基础内容，完善后可获得更高质量的结果'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEnhancementFlow(true)}
                className="mt-2"
              >
                查看详细分析
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* 模块选择区域 */}
        <div className={`mb-8 ${showEnhancementFlow ? 'hidden' : ''}`}>
          <h2 className="text-2xl font-bold mb-6 text-center">
            选择需要生成的模块
            <span className="text-sm font-normal text-gray-500 ml-2">
              （已选择 {selectedModules.size}/4）
            </span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((module) => (
              <ModuleCard
                key={module.id}
                {...module}
                isSelected={selectedModules.has(module.id)}
                isCompleted={completedModules.has(module.id)}
                isRecommended={analysisResult?.recommendations.suggestedModules.includes(module.id as any)}
                onSelect={() => !isGenerating && handleModuleSelect(module.id)}
              />
            ))}
          </div>
        </div>

        {/* 当前生成状态 */}
        {isGenerating && currentGeneratingModule && (
          <Alert className="mb-6 border-blue-300 bg-blue-50">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>正在生成模块</AlertTitle>
            <AlertDescription>
              当前正在生成: {modules.find(m => m.id === currentGeneratingModule)?.title}
            </AlertDescription>
          </Alert>
        )}

        {/* 操作按钮 */}
        <div className={`flex flex-col items-center gap-4 ${showEnhancementFlow ? 'hidden' : ''}`}>
          <Button
            size="lg"
            onClick={handleGenerate}
            disabled={isGenerating || selectedModules.size === 0 || !ideaContent.trim()}
            className="px-12 h-14 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                正在生成中 ({completedModules.size}/{selectedModules.size})...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                开始生成选中的模块
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>

          {selectedModules.size > 0 && !isGenerating && (
            <p className="text-sm text-gray-600">
              预计耗时: {analysisResult?.recommendations.totalEstimatedTime || `${Array.from(selectedModules).length * 5} 分钟左右`}
            </p>
          )}
        </div>

        {/* 生成结果展示 */}
        {completedModules.size > 0 && !showEnhancementFlow && (
          <Card className="mt-8 border-2 border-green-300">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
              <CardTitle className="flex items-center gap-2">
                <Check className="w-6 h-6 text-green-600" />
                生成完成的模块
              </CardTitle>
              <CardDescription>
                已完成 {completedModules.size} 个模块，您可以下载或查看详情
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                {Array.from(completedModules).map((moduleId) => {
                  const module = modules.find(m => m.id === moduleId)
                  if (!module) return null

                  return (
                    <Card key={moduleId} className="border-green-200 bg-green-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-10 h-10 rounded-lg ${module.color.replace('border-', 'bg-').replace('500', '100')} flex items-center justify-center`}>
                              <module.icon className={`w-5 h-5 ${module.color.replace('border-', 'text-')}`} />
                            </div>
                            <div>
                              <h4 className="font-semibold">{module.title}</h4>
                              <p className="text-xs text-gray-600">已生成完成</p>
                            </div>
                          </div>
                          <Check className="w-5 h-5 text-green-600" />
                        </div>

                        {/* 操作按钮 */}
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadModule(moduleId)}
                              className="flex-1"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              下载
                            </Button>
                            {moduleId === 'mvp-prototype' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const result = moduleResults.get(moduleId)
                                  if (result?.data?.prototype) {
                                    // 在新窗口预览
                                    const win = window.open('', '_blank')
                                    if (win) {
                                      win.document.write(result.data.prototype.htmlCode)
                                      win.document.close()
                                    }
                                  }
                                }}
                                className="flex-1"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                预览
                              </Button>
                            )}
                            {moduleId === 'mvp-prototype' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.push(`/business-plan/mvp-generator?ideaTitle=${encodeURIComponent(ideaTitle)}&ideaDescription=${encodeURIComponent(ideaContent)}`)}
                                className="flex-1"
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                实时调整
                              </Button>
                            )}
                          </div>

                          {/* 反馈评分 */}
                          <div className="border-t pt-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">您的评价:</span>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((rating) => (
                                  <button
                                    key={rating}
                                    onClick={() => handleModuleFeedback(moduleId, rating)}
                                    className={`w-5 h-5 ${
                                      (moduleFeedback.get(moduleId)?.rating || 0) >= rating
                                        ? 'text-yellow-400'
                                        : 'text-gray-300'
                                    } hover:text-yellow-400 transition-colors`}
                                  >
                                    <Star className="w-full h-full" fill="currentColor" />
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* 满意度反馈 */}
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">内容是否有用?</span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleHelpfulFeedback(moduleId, true)}
                                  className={`p-1 rounded ${
                                    moduleFeedback.get(moduleId)?.isHelpful === true
                                      ? 'bg-green-100 text-green-600'
                                      : 'bg-gray-100 text-gray-500 hover:bg-green-50'
                                  }`}
                                >
                                  <ThumbsUp className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleHelpfulFeedback(moduleId, false)}
                                  className={`p-1 rounded ${
                                    moduleFeedback.get(moduleId)?.isHelpful === false
                                      ? 'bg-red-100 text-red-600'
                                      : 'bg-gray-100 text-gray-500 hover:bg-red-50'
                                  }`}
                                >
                                  <ThumbsDown className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* 反馈按钮 */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowFeedbackFor(showFeedbackFor === moduleId ? null : moduleId)}
                              className="w-full"
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              {showFeedbackFor === moduleId ? '收起反馈' : '提供反馈建议'}
                            </Button>

                            {/* 反馈输入区域 */}
                            {showFeedbackFor === moduleId && (
                              <div className="mt-3 space-y-3 p-3 bg-gray-50 rounded-lg">
                                <div>
                                  <Label htmlFor={`feedback-${moduleId}`} className="text-sm font-medium">
                                    反馈建议:
                                  </Label>
                                  <Textarea
                                    id={`feedback-${moduleId}`}
                                    placeholder="请告诉我们您对这个模块的具体建议，比如需要调整哪些内容、增加什么功能等..."
                                    value={moduleFeedback.get(moduleId)?.comment || ''}
                                    onChange={(e) => handleFeedbackComment(moduleId, e.target.value)}
                                    className="mt-1 text-sm"
                                    rows={3}
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleRegenerateModule(moduleId)}
                                    disabled={isRegenerating.get(moduleId) || !moduleFeedback.get(moduleId)?.comment?.trim()}
                                    className="flex-1"
                                  >
                                    {isRegenerating.get(moduleId) ? (
                                      <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        重新生成中...
                                      </>
                                    ) : (
                                      <>
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        根据反馈重新生成
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setShowFeedbackFor(null)}
                                  >
                                    取消
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push(`/business-plan/workspace?ideaTitle=${encodeURIComponent(ideaTitle)}&ideaDescription=${encodeURIComponent(ideaContent)}`)}
                className="w-full mt-6"
              >
                前往工作台继续编辑
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 使用提示 */}
        <Card className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              使用建议
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5" />
                <span>先使用AI智能分析，系统会自动推荐最相关的模块</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5" />
                <span>可以根据AI推荐调整选择，也可以自由组合模块</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5" />
                <span>MVP原型支持在线预览和下载HTML文件</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5" />
                <span>所有模块的生成结果都可以下载保存</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
