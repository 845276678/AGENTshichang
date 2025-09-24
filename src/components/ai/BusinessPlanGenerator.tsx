'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui'
import { Progress } from '@/components/ui/progress'
import {
  Brain,
  TrendingUp,
  Code,
  DollarSign,
  Shield,
  Rocket,
  FileText,
  Download,
  CheckCircle,
  Clock,
  Zap,
  Activity,
  AlertCircle
} from 'lucide-react'

interface AIProvider {
  name: string
  icon: React.ElementType
  color: string
  speciality: string
}

interface GenerationStage {
  id: string
  name: string
  description: string
  aiProvider: AIProvider
  status: 'pending' | 'in_progress' | 'completed' | 'error'
  progress: number
  estimatedTime: string
  insights: string[]
  deliverables: string[]
}

const AI_PROVIDERS: Record<string, AIProvider> = {
  WENXIN: {
    name: '百度文心一言',
    icon: Brain,
    color: 'from-blue-600 to-cyan-500',
    speciality: '商业分析与文案生成'
  },
  QWEN: {
    name: '阿里通义千问',
    icon: Code,
    color: 'from-orange-500 to-red-500',
    speciality: '技术架构与系统设计'
  },
  SPARK: {
    name: '讯飞星火',
    icon: TrendingUp,
    color: 'from-purple-600 to-pink-500',
    speciality: '市场调研与用户分析'
  },
  HUNYUAN: {
    name: '腾讯混元',
    icon: DollarSign,
    color: 'from-green-600 to-emerald-500',
    speciality: '财务建模与投资分析'
  },
  GLM: {
    name: '智谱GLM',
    icon: Shield,
    color: 'from-indigo-600 to-purple-500',
    speciality: '法律合规与知识产权'
  }
}

const INITIAL_STAGES: GenerationStage[] = [
  {
    id: 'concept_analysis',
    name: '创意解析与理解',
    description: '使用NLP技术深度分析创意核心价值',
    aiProvider: AI_PROVIDERS.WENXIN!,
    status: 'pending',
    progress: 0,
    estimatedTime: '3-5分钟',
    insights: [],
    deliverables: ['概念提取报告', '关键词标签', '问题陈述']
  },
  {
    id: 'market_research',
    name: '市场调研与分析',
    description: '全面分析目标市场和竞争环境',
    aiProvider: AI_PROVIDERS.SPARK!,
    status: 'pending',
    progress: 0,
    estimatedTime: '8-12分钟',
    insights: [],
    deliverables: ['市场规模报告', '竞品分析', '用户画像']
  },
  {
    id: 'tech_architecture',
    name: '技术架构设计',
    description: '设计可扩展的技术实现方案',
    aiProvider: AI_PROVIDERS.QWEN!,
    status: 'pending',
    progress: 0,
    estimatedTime: '10-15分钟',
    insights: [],
    deliverables: ['系统架构图', 'API设计', '技术栈选择']
  },
  {
    id: 'business_model',
    name: '商业模式设计',
    description: '构建可持续的盈利模式',
    aiProvider: AI_PROVIDERS.WENXIN!,
    status: 'pending',
    progress: 0,
    estimatedTime: '6-10分钟',
    insights: [],
    deliverables: ['商业模式画布', '收入流设计', '成本结构']
  },
  {
    id: 'financial_model',
    name: '财务建模与预测',
    description: '建立详细的财务预测模型',
    aiProvider: AI_PROVIDERS.HUNYUAN!,
    status: 'pending',
    progress: 0,
    estimatedTime: '12-18分钟',
    insights: [],
    deliverables: ['5年财务预测', '投资回报分析', '估值模型']
  },
  {
    id: 'legal_compliance',
    name: '法律合规分析',
    description: '确保项目符合相关法律法规',
    aiProvider: AI_PROVIDERS.GLM!,
    status: 'pending',
    progress: 0,
    estimatedTime: '8-12分钟',
    insights: [],
    deliverables: ['合规检查表', '知识产权策略', '风险评估']
  },
  {
    id: 'implementation_plan',
    name: '实施计划制定',
    description: '制定详细的项目执行路线图',
    aiProvider: AI_PROVIDERS.QWEN!,
    status: 'pending',
    progress: 0,
    estimatedTime: '6-10分钟',
    insights: [],
    deliverables: ['项目时间表', '团队需求', '里程碑规划']
  },
  {
    id: 'investor_pitch',
    name: '投资推介方案',
    description: '创建专业的投资者演示材料',
    aiProvider: AI_PROVIDERS.WENXIN!,
    status: 'pending',
    progress: 0,
    estimatedTime: '5-8分钟',
    insights: [],
    deliverables: ['BP演示文稿', '投资亮点', '融资计划']
  }
]

interface BusinessPlanGeneratorProps {
  ideaData: {
    title: string
    description: string
    category: string
  }
  onComplete?: (result: any) => void
  onProgress?: (stage: string, progress: number) => void
}

export const BusinessPlanGenerator: React.FC<BusinessPlanGeneratorProps> = ({
  ideaData,
  onComplete,
  onProgress
}) => {
  const [stages, setStages] = useState<GenerationStage[]>(INITIAL_STAGES)
  const [currentStageIndex, setCurrentStageIndex] = useState(-1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [overallProgress, setOverallProgress] = useState(0)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [_estimatedCompletion] = useState<Date | null>(null)

  // 开始生成
  const startGeneration = async () => {
    setIsGenerating(true)
    setStartTime(new Date())
    setCurrentStageIndex(0)

    try {
      // 调用后端API开始生成
      const response = await fetch('/api/generate-business-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaId: 'demo-idea-1',
          ideaData
        })
      })

      if (!response.ok) {
        throw new Error('生成失败')
      }

      // 开始轮询进度
      pollProgress()

    } catch (error) {
      console.error('启动生成失败:', error)
      setIsGenerating(false)
    }
  }

  // 轮询生成进度
  const pollProgress = () => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/generate-business-plan?ideaId=demo-idea-1')
        const { data } = await response.json()

        if (data.status === 'completed') {
          clearInterval(interval)
          setIsGenerating(false)
          onComplete?.(data)
          return
        }

        // 更新进度
        updateStageProgress(data)

      } catch (error) {
        console.error('获取进度失败:', error)
        clearInterval(interval)
        setIsGenerating(false)
      }
    }, 2000)
  }

  // 模拟进度更新
  const updateStageProgress = (progressData: any) => {
    const updatedStages = [...stages]

    // 更新当前阶段
    if (progressData.currentStage && currentStageIndex >= 0) {
      const currentStage = updatedStages[currentStageIndex]
      if (currentStage) {
        currentStage.status = 'in_progress'
        currentStage.progress = progressData.progress || 0

        // 添加洞察
        if (progressData.insights) {
          currentStage.insights = progressData.insights
        }
      }
    }

    // 标记已完成的阶段
    for (let i = 0; i < progressData.completedStages; i++) {
      if (updatedStages[i]) {
        updatedStages[i]!.status = 'completed'
        updatedStages[i]!.progress = 100
      }
    }

    setStages(updatedStages)
    setOverallProgress((progressData.completedStages / INITIAL_STAGES.length) * 100)
    onProgress?.(progressData.currentStage, progressData.progress)
  }

  // 模拟进度（用于演示）
  useEffect(() => {
    if (!isGenerating) {return}

    const simulateProgress = () => {
      const totalDuration = 60000 // 60秒模拟完成
      const stageCount = stages.length
      const stageDuration = totalDuration / stageCount

      let stageIndex = 0

      const stageInterval = setInterval(() => {
        if (stageIndex >= stageCount) {
          clearInterval(stageInterval)
          setIsGenerating(false)
          return
        }

        setCurrentStageIndex(stageIndex)

        const updatedStages = [...stages]

        // 开始当前阶段
        if (updatedStages[stageIndex]) {
          updatedStages[stageIndex]!.status = 'in_progress'
        }

        // 模拟阶段内进度
        let progress = 0
        const progressInterval = setInterval(() => {
          progress += Math.random() * 20

          if (progress >= 100) {
            progress = 100
            if (updatedStages[stageIndex]) {
              updatedStages[stageIndex]!.status = 'completed'
              updatedStages[stageIndex]!.progress = 100

              // 添加模拟洞察
              updatedStages[stageIndex]!.insights = [
                `${updatedStages[stageIndex]!.aiProvider.name} 分析完成`,
                '发现3个关键商业机会',
                '识别核心竞争优势'
              ]
            }

            clearInterval(progressInterval)
            stageIndex++
          } else {
            if (updatedStages[stageIndex]) {
              updatedStages[stageIndex]!.progress = progress
            }
          }

          setStages([...updatedStages])
          setOverallProgress((stageIndex + progress / 100) / stageCount * 100)
        }, 500)

      }, stageDuration)
    }

    const timer = setTimeout(simulateProgress, 1000)
    return () => clearTimeout(timer)
  }, [isGenerating])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'in_progress':
        return <Activity className="w-5 h-5 text-blue-500 animate-spin" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* 总览卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="w-6 h-6 text-primary" />
            AI商业化方案生成器
          </CardTitle>
          <CardDescription>
            基于中国本地AI服务，为您的创意生成完整商业化方案
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 创意信息 */}
            <div className="p-4 bg-secondary/20 rounded-lg">
              <h4 className="font-medium mb-2">当前创意</h4>
              <div className="space-y-1 text-sm">
                <div><strong>标题:</strong> {ideaData.title}</div>
                <div><strong>分类:</strong> {ideaData.category}</div>
                <div><strong>描述:</strong> {ideaData.description.substring(0, 100)}...</div>
              </div>
            </div>

            {/* 总体进度 */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>整体进度</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{startTime ? `开始时间: ${startTime.toLocaleTimeString()}` : '未开始'}</span>
                <span>预计完成: {isGenerating ? '约45-60分钟' : '等待开始'}</span>
              </div>
            </div>

            {/* 开始按钮 */}
            {!isGenerating && currentStageIndex < 0 && (
              <Button onClick={startGeneration} className="w-full" size="lg">
                <Zap className="w-4 h-4 mr-2" />
                开始生成商业化方案
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI服务商展示 */}
      <Card>
        <CardHeader>
          <CardTitle>参与的AI服务商</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(AI_PROVIDERS).map((provider) => {
              const Icon = provider.icon
              return (
                <div key={provider.name} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${provider.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{provider.name}</div>
                    <div className="text-xs text-muted-foreground">{provider.speciality}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 生成阶段 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">生成进度</h3>
        {stages.map((stage, index) => {
          const Icon = stage.aiProvider.icon
          const isActive = index === currentStageIndex

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`transition-all duration-300 ${
                isActive ? 'ring-2 ring-primary shadow-lg' :
                stage.status === 'completed' ? 'bg-green-50 border-green-200' : ''
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(stage.status)}
                      <div>
                        <CardTitle className="text-base">{stage.name}</CardTitle>
                        <CardDescription className="text-sm">{stage.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${stage.aiProvider.color} flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {stage.aiProvider.name}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                {(stage.status === 'in_progress' || stage.status === 'completed') && (
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* 进度条 */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>进度</span>
                          <span>{Math.round(stage.progress)}%</span>
                        </div>
                        <Progress value={stage.progress} className="h-1" />
                      </div>

                      {/* AI洞察 */}
                      {stage.insights.length > 0 && (
                        <div>
                          <h5 className="text-xs font-medium mb-1">AI洞察</h5>
                          <ul className="space-y-1">
                            {stage.insights.map((insight, idx) => (
                              <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
                                <span className="w-1 h-1 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                                {insight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* 交付物 */}
                      {stage.status === 'completed' && (
                        <div>
                          <h5 className="text-xs font-medium mb-1">交付物</h5>
                          <div className="flex flex-wrap gap-1">
                            {stage.deliverables.map((deliverable, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {deliverable}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* 完成后的下载区域 */}
      {!isGenerating && overallProgress === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <CheckCircle className="w-6 h-6" />
                商业化方案生成完成！
              </CardTitle>
              <CardDescription className="text-green-600">
                您的创意已被AI成功转化为完整的商业化方案
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  下载完整方案 (PDF)
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  查看在线版本
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  AI解读报告
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Rocket className="w-4 h-4" />
                  开始执行
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}