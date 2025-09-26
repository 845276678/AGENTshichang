'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Layout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Lightbulb,
  Sparkles,
  Target,
  TrendingUp,
  Building,
  DollarSign,
  Shield,
  Calendar,
  Presentation,
  Users,
  Brain,
  Zap,
  Clock,
  CheckCircle,
  ArrowRight,
  FileText,
  Download,
  Eye,
  Settings,
  Trophy
} from 'lucide-react'

import { UserRequirementsCollector } from '@/components/business-plan/UserRequirementsCollector'
import { ModernBusinessPlan } from '@/components/business-plan/ModernBusinessPlan'
import { useBusinessPlanGeneration } from '@/stores/useBusinessPlanGeneration'

// 商业计划书生成阶段图标映射
const STAGE_ICONS = {
  concept_analysis: Target,
  market_research: TrendingUp,
  tech_architecture: Building,
  business_model: Building,
  financial_model: DollarSign,
  legal_compliance: Shield,
  implementation_plan: Calendar,
  investor_pitch: Presentation
}

// AI 服务提供商信息
const AI_PROVIDERS = [
  {
    name: 'DeepSeek',
    icon: '🧠',
    specialty: '概念分析与商业模式设计',
    color: 'bg-blue-500'
  },
  {
    name: '智谱GLM',
    icon: '⚡',
    specialty: '技术架构与实施规划',
    color: 'bg-purple-500'
  },
  {
    name: '阿里通义',
    icon: '📊',
    specialty: '市场调研与财务建模',
    color: 'bg-green-500'
  }
]

const categories = [
  { id: 'tech', name: '技术产品', icon: '💻' },
  { id: 'lifestyle', name: '生活服务', icon: '🏠' },
  { id: 'education', name: '教育培训', icon: '📚' },
  { id: 'health', name: '健康医疗', icon: '🏥' },
  { id: 'finance', name: '金融服务', icon: '💰' },
  { id: 'entertainment', name: '娱乐社交', icon: '🎮' },
  { id: 'business', name: '企业服务', icon: '🏢' },
  { id: 'retail', name: '零售电商', icon: '🛒' }
]

export default function BusinessPlanGenerationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // 从URL参数获取创意信息
  const ideaFromParams = React.useMemo(() => {
    const ideaId = searchParams.get('ideaId')
    const title = searchParams.get('title')
    const description = searchParams.get('description')
    const category = searchParams.get('category')

    if (ideaId && title && description && category) {
      return {
        id: ideaId,
        title: decodeURIComponent(title),
        description: decodeURIComponent(description),
        category: decodeURIComponent(category),
        tags: [],
        submittedBy: 'bidding_session'
      }
    }
    return null
  }, [searchParams])
  // 状态管理
  const {
    ideaData,
    setIdeaData,
    requirementsCollection,
    startRequirementsCollection,
    skipRequirementsCollection,
    isGenerating,
    stages,
    overallProgress,
    currentStageIndex,
    startGeneration,
    pauseGeneration,
    resumeGeneration,
    finalPlan,
    reset
  } = useBusinessPlanGeneration()

  const [ideaInput, setIdeaInput] = useState({
    title: '',
    description: '',
    category: ''
  })

  // 如果有来自竞价的创意，预填充数据
  useEffect(() => {
    if (ideaFromParams) {
      setIdeaData(ideaFromParams)
      setCurrentPhase('requirements') // 直接跳到需求收集阶段
      setIdeaInput({
        title: ideaFromParams.title,
        description: ideaFromParams.description,
        category: ideaFromParams.category
      })
    }
  }, [ideaFromParams, setIdeaData])

  const [currentPhase, setCurrentPhase] = useState<'input' | 'requirements' | 'generation' | 'result'>('input')
  const [showModernView, setShowModernView] = useState(false)

  // 处理创意输入提交
  const handleIdeaSubmit = () => {
    if (!ideaInput.title.trim() || !ideaInput.description.trim() || !ideaInput.category) {
      alert('请填写完整的创意信息')
      return
    }

    const newIdeaData = {
      id: `idea-${Date.now()}`,
      title: ideaInput.title,
      description: ideaInput.description,
      category: ideaInput.category,
      tags: [], // 可以后续从描述中提取
      submittedBy: 'current_user'
    }

    setIdeaData(newIdeaData)
    setCurrentPhase('requirements')
  }

  // 处理需求收集完成
  const handleRequirementsComplete = async () => {
    try {
      setCurrentPhase('generation')
      await startGeneration()
      setCurrentPhase('result')
    } catch (error) {
      console.error('Generation failed:', error)
      alert('生成失败，请重试')
    }
  }

  // 跳过需求收集
  const handleSkipRequirements = async () => {
    try {
      skipRequirementsCollection()
      setCurrentPhase('generation')
      await startGeneration()
      setCurrentPhase('result')
    } catch (error) {
      console.error('Generation failed:', error)
      alert('生成失败，请重试')
    }
  }

  // 重置所有状态
  const handleReset = () => {
    reset()
    setCurrentPhase('input')
    setIdeaInput({ title: '', description: '', category: '' })
    setShowModernView(false)
  }

  // 查看现代化界面
  const handleViewModernPlan = () => {
    if (!finalPlan) {
      alert('商业计划书尚未生成完成')
      return
    }
    setShowModernView(true)
  }

  // 转换为现代化界面所需的数据格式
  const modernPlanData = React.useMemo(() => {
    if (!finalPlan || !ideaData) return null

    const completedStages = stages.filter(stage => stage.status === 'completed' && stage.versions.length > 0)

    return {
      title: `${ideaData.title} 商业计划书`,
      ideaData: {
        title: ideaData.title,
        category: ideaData.category,
        description: ideaData.description
      },
      chapters: completedStages.map((stage) => {
        const selectedVersion = stage.versions[0] // 使用第一个版本
        return {
          id: stage.id,
          title: stage.name,
          completionProgress: stage.progress,
          coreContent: selectedVersion?.content.coreContent || {
            summary: selectedVersion?.content.summary || '内容生成中...',
            keyPoints: selectedVersion?.content.keyPoints || [],
            visualData: {
              metrics: [
                { label: '完成度', value: `${stage.progress}%`, trend: 'up' },
                { label: '质量评分', value: selectedVersion?.qualityScore ? `${selectedVersion.qualityScore}/100` : 'N/A', trend: 'stable' }
              ]
            },
            actionItems: selectedVersion?.content.coreContent?.actionItems || ['等待内容生成']
          },
          expandedContent: selectedVersion?.content.expandableContent || {
            fullAnalysis: selectedVersion?.content.fullContent || '详细内容生成中...',
            detailedSections: [],
            references: []
          },
          readingTime: {
            core: 2,
            expanded: selectedVersion?.content.expandableContent?.estimatedReadTime || 5
          }
        }
      }),
      metadata: {
        totalPages: completedStages.length,
        totalReadingTime: completedStages.length * 3,
        completionRate: Math.round(overallProgress),
        lastUpdated: new Date()
      }
    }
  }, [finalPlan, ideaData, stages, overallProgress])

  // 如果在现代化视图中
  if (showModernView && modernPlanData) {
    return (
      <ModernBusinessPlan
        planData={modernPlanData}
        onExport={(format) => console.log('导出格式:', format)}
        onShare={() => console.log('分享计划书')}
      />
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          {/* 页面标题 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              {ideaFromParams ? `基于竞价结果生成商业计划书` : 'AI 商业计划书生成器'}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
              {ideaFromParams
                ? `为您的获胜创意「${ideaFromParams.title}」生成专业的商业计划书`
                : '基于多个 AI 大模型协同工作，为您的创意生成专业的商业计划书'
              }
            </p>

            {ideaFromParams && (
              <div className="mb-6 p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm max-w-3xl mx-auto">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                    <Trophy className="w-3 h-3 mr-1" />
                    来自竞价会话
                  </Badge>
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                    {ideaFromParams.category}
                  </Badge>
                </div>
                <p className="text-gray-700 text-left">
                  {ideaFromParams.description}
                </p>
              </div>
            )}

            {/* 进度指示器 */}
            <div className="flex justify-center items-center space-x-4 mb-8">
              {[
                { key: 'input', label: '创意输入', icon: Lightbulb },
                { key: 'requirements', label: '需求分析', icon: Settings },
                { key: 'generation', label: 'AI生成', icon: Brain },
                { key: 'result', label: '查看结果', icon: FileText }
              ].map((step, index) => {
                const isActive = currentPhase === step.key
                const isCompleted = ['input', 'requirements', 'generation', 'result'].indexOf(currentPhase) > index
                const StepIcon = step.icon

                return (
                  <React.Fragment key={step.key}>
                    <div className={`flex flex-col items-center ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2 ${
                        isActive ? 'border-blue-600 bg-blue-50' :
                        isCompleted ? 'border-green-600 bg-green-50' :
                        'border-gray-300 bg-gray-50'
                      }`}>
                        {isCompleted ? <CheckCircle className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                      </div>
                      <span className="text-sm font-medium">{step.label}</span>
                    </div>
                    {index < 3 && <ArrowRight className="w-4 h-4 text-gray-400 mt-5" />}
                  </React.Fragment>
                )
              })}
            </div>
          </motion.div>

          {/* AI 提供商展示 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-center flex items-center justify-center gap-2">
                  <Sparkles className="w-6 h-6" />
                  AI 专家团队
                </CardTitle>
                <CardDescription className="text-center">
                  三大 AI 模型协同工作，从不同角度分析您的创意
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {AI_PROVIDERS.map((provider, index) => (
                    <motion.div
                      key={provider.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-center"
                    >
                      <div className={`w-16 h-16 rounded-full ${provider.color} flex items-center justify-center text-3xl mx-auto mb-4`}>
                        {provider.icon}
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{provider.name}</h3>
                      <p className="text-sm text-muted-foreground">{provider.specialty}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 主要内容区域 */}
          <AnimatePresence mode="wait">
            {currentPhase === 'input' && (
              <motion.div
                key="input-phase"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="max-w-4xl mx-auto">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-6 h-6 text-yellow-500" />
                      请输入您的创意信息
                    </CardTitle>
                    <CardDescription>
                      详细描述您的创意，AI 将基于这些信息生成专业的商业计划书
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">创意标题 *</label>
                      <Input
                        placeholder="用一句话概括您的创意..."
                        value={ideaInput.title}
                        onChange={(e) => setIdeaInput({...ideaInput, title: e.target.value})}
                        className="text-lg"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">详细描述 *</label>
                      <Textarea
                        placeholder="详细描述您的创意、要解决的问题、目标用户、核心功能等..."
                        value={ideaInput.description}
                        onChange={(e) => setIdeaInput({...ideaInput, description: e.target.value})}
                        rows={6}
                        className="resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">选择分类 *</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {categories.map((categoryItem) => (
                          <Button
                            key={categoryItem.id}
                            variant={ideaInput.category === categoryItem.id ? "default" : "outline"}
                            className="h-20 flex flex-col items-center justify-center transition-all"
                            onClick={() => setIdeaInput({...ideaInput, category: categoryItem.id})}
                          >
                            <span className="text-2xl mb-2">{categoryItem.icon}</span>
                            <span className="text-sm">{categoryItem.name}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-center pt-4">
                      <Button
                        size="lg"
                        onClick={handleIdeaSubmit}
                        disabled={!ideaInput.title.trim() || !ideaInput.description.trim() || !ideaInput.category}
                        className="px-8"
                      >
                        <ArrowRight className="w-5 h-5 mr-2" />
                        下一步：需求分析
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {currentPhase === 'requirements' && (
              <motion.div
                key="requirements-phase"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <UserRequirementsCollector
                  onComplete={handleRequirementsComplete}
                  onSkip={handleSkipRequirements}
                />
              </motion.div>
            )}

            {currentPhase === 'generation' && (
              <motion.div
                key="generation-phase"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="max-w-4xl mx-auto"
              >
                <Card>
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl mb-2">AI 正在生成您的商业计划书</CardTitle>
                    <CardDescription>
                      多个 AI 模型正在协同工作，请稍候...
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* 总体进度 */}
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary mb-2">{Math.round(overallProgress)}%</div>
                      <Progress value={overallProgress} className="h-3 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        预计还需 {Math.max(0, Math.round((100 - overallProgress) * 0.3))} 分钟
                      </p>
                    </div>

                    {/* 阶段进度 */}
                    <div className="space-y-3">
                      {stages.map((stage, index) => {
                        const StageIcon = STAGE_ICONS[stage.id] || Target
                        const isActive = currentStageIndex === index
                        const isCompleted = stage.status === 'completed'
                        const isInProgress = stage.status === 'in_progress'

                        return (
                          <div
                            key={stage.id}
                            className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                              isActive ? 'bg-blue-50 border border-blue-200' :
                              isCompleted ? 'bg-green-50 border border-green-200' :
                              'bg-gray-50'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isCompleted ? 'bg-green-500' :
                              isInProgress ? 'bg-blue-500' :
                              'bg-gray-300'
                            }`}>
                              {isCompleted ? (
                                <CheckCircle className="w-5 h-5 text-white" />
                              ) : isInProgress ? (
                                <Clock className="w-5 h-5 text-white animate-spin" />
                              ) : (
                                <StageIcon className="w-5 h-5 text-white" />
                              )}
                            </div>

                            <div className="flex-1">
                              <h3 className="font-semibold">{stage.name}</h3>
                              <p className="text-sm text-muted-foreground">{stage.description}</p>
                              {stage.currentStep && (
                                <p className="text-xs text-blue-600 mt-1">{stage.currentStep}</p>
                              )}
                            </div>

                            <div className="text-right">
                              {isCompleted ? (
                                <Badge variant="outline" className="text-green-600 border-green-200">已完成</Badge>
                              ) : isInProgress ? (
                                <Badge className="bg-blue-500">进行中</Badge>
                              ) : (
                                <Badge variant="secondary">等待中</Badge>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* 控制按钮 */}
                    <div className="flex justify-center space-x-4 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => isGenerating ? pauseGeneration() : resumeGeneration()}
                        disabled={overallProgress === 100}
                      >
                        {isGenerating ? '暂停生成' : '继续生成'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleReset}
                      >
                        重新开始
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {currentPhase === 'result' && (
              <motion.div
                key="result-phase"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-4xl mx-auto"
              >
                <Card>
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-green-600 mb-2 flex items-center justify-center gap-2">
                      <CheckCircle className="w-7 h-7" />
                      商业计划书生成完成！
                    </CardTitle>
                    <CardDescription>
                      您的 {ideaData?.title} 商业计划书已成功生成
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* 生成结果概览 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{stages.filter(s => s.status === 'completed').length}</div>
                        <div className="text-sm text-blue-600">已完成章节</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{Math.round(overallProgress)}%</div>
                        <div className="text-sm text-green-600">完成度</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {stages.reduce((sum, s) => sum + s.versions.length, 0)}
                        </div>
                        <div className="text-sm text-purple-600">生成版本</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{stages.length * 3}min</div>
                        <div className="text-sm text-orange-600">预计阅读</div>
                      </div>
                    </div>

                    <Separator />

                    {/* 操作按钮 */}
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                          size="lg"
                          onClick={handleViewModernPlan}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          <Eye className="w-5 h-5 mr-2" />
                          查看现代化界面
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => console.log('导出PDF')}
                        >
                          <Download className="w-5 h-5 mr-2" />
                          导出 PDF
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={handleReset}
                        >
                          <Sparkles className="w-5 h-5 mr-2" />
                          生成新计划书
                        </Button>
                      </div>

                      {/* 预览章节列表 */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">生成的章节内容</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {stages.filter(s => s.status === 'completed').map((stage) => {
                              const StageIcon = STAGE_ICONS[stage.id] || Target
                              return (
                                <div key={stage.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                                    <StageIcon className="w-4 h-4 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-medium">{stage.name}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {stage.versions.length} 个版本 • 预计 {stage.estimatedTime} 阅读
                                    </p>
                                  </div>
                                  <Badge className="bg-green-500">已完成</Badge>
                                </div>
                              )
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  )
}