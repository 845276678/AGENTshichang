'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import { Layout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AnimatedSection } from '@/components/ui'
import { Progress } from '@/components/ui/progress'
import {
  ArrowLeft,
  Brain,
  Clock,
  CheckCircle,
  AlertCircle,
  Code,
  FileText,
  TrendingUp,
  Users,
  Lightbulb,
  Rocket,
  Target,
  DollarSign,
  Activity,
  Cpu,
  Database,
  Globe,
  Shield,
  Zap,
  Download,
  Eye,
  Play,
  Pause
} from 'lucide-react'

interface AIWorkflowStep {
  id: string
  name: string
  description: string
  status: 'completed' | 'in_progress' | 'pending' | 'error'
  progress: number
  timeSpent: string
  estimatedTime: string
  insights: string[]
  deliverables: string[]
}

interface AIWorkflowStage {
  id: string
  name: string
  icon: React.ElementType
  color: string
  status: 'completed' | 'in_progress' | 'pending'
  progress: number
  steps: AIWorkflowStep[]
  timeSpent: string
  estimatedTime: string
}

const mockWorkflow: AIWorkflowStage[] = [
  {
    id: 'analysis',
    name: '创意解析与理解',
    icon: Brain,
    color: 'from-blue-500 to-cyan-500',
    status: 'completed',
    progress: 100,
    timeSpent: '0.5小时',
    estimatedTime: '0.5小时',
    steps: [
      {
        id: 'nlp_analysis',
        name: 'NLP深度解析',
        description: '使用自然语言处理技术提取创意核心概念',
        status: 'completed',
        progress: 100,
        timeSpent: '10分钟',
        estimatedTime: '10分钟',
        insights: [
          '识别核心问题：食材浪费和管理效率低',
          '目标用户群体：家庭用户和健康意识人群',
          '技术关键词：AI识别、智能提醒、推荐算法'
        ],
        deliverables: ['概念提取报告', '关键词标签化', '问题陈述']
      },
      {
        id: 'structure_reorg',
        name: '结构化重组',
        description: '将模糊想法转化为清晰的问题-解决方案框架',
        status: 'completed',
        progress: 100,
        timeSpent: '15分钟',
        estimatedTime: '15分钟',
        insights: [
          '核心价值主张：减少食材浪费，提升生活质量',
          '解决方案架构：识别→记录→提醒→推荐',
          '创新点：多模态AI识别+个性化推荐'
        ],
        deliverables: ['结构化需求文档', '价值主张画布', '功能模块图']
      }
    ]
  },
  {
    id: 'market_analysis',
    name: '市场验证与分析',
    icon: TrendingUp,
    color: 'from-green-500 to-emerald-500',
    status: 'completed',
    progress: 100,
    timeSpent: '2小时',
    estimatedTime: '2小时',
    steps: [
      {
        id: 'market_research',
        name: '市场调研分析',
        description: '分析目标市场规模、竞争态势和用户需求',
        status: 'completed',
        progress: 100,
        timeSpent: '1小时',
        estimatedTime: '1小时',
        insights: [
          'TAM: 120亿美元（全球智能家居市场）',
          'SAM: 25亿美元（智能厨房细分市场）',
          '竞品分析：发现3个直接竞品，5个间接竞品'
        ],
        deliverables: ['市场规模报告', '竞品分析表', '用户画像']
      },
      {
        id: 'business_model',
        name: '商业模式设计',
        description: '设计可持续的盈利模式和收入流',
        status: 'completed',
        progress: 100,
        timeSpent: '1小时',
        estimatedTime: '1小时',
        insights: [
          '订阅模式：基础版9.9元/月，专业版19.9元/月',
          'B2B2C合作：与冰箱厂商和生鲜电商合作',
          '预计ROI：第3年达到盈亏平衡点'
        ],
        deliverables: ['商业模式画布', '收入预测模型', '定价策略']
      }
    ]
  },
  {
    id: 'technical_design',
    name: '技术架构设计',
    icon: Cpu,
    color: 'from-purple-500 to-pink-500',
    status: 'in_progress',
    progress: 75,
    timeSpent: '4小时',
    estimatedTime: '6小时',
    steps: [
      {
        id: 'system_architecture',
        name: '系统架构设计',
        description: '设计可扩展的技术架构和组件',
        status: 'completed',
        progress: 100,
        timeSpent: '2小时',
        estimatedTime: '2小时',
        insights: [
          '微服务架构：用户服务、识别服务、推荐服务',
          '技术栈：React Native + Node.js + MongoDB',
          '云服务：AWS/阿里云混合架构'
        ],
        deliverables: ['系统架构图', '技术栈选择', 'API设计文档']
      },
      {
        id: 'ai_model_design',
        name: 'AI模型设计',
        description: '设计食材识别和推荐算法模型',
        status: 'in_progress',
        progress: 60,
        timeSpent: '2小时',
        estimatedTime: '4小时',
        insights: [
          '图像识别：使用YOLO v8 + 自定义数据集',
          '推荐算法：协同过滤 + 内容推荐混合',
          '模型训练：需要10万+标注数据'
        ],
        deliverables: ['模型架构文档', '训练数据需求', '性能指标定义']
      }
    ]
  },
  {
    id: 'product_design',
    name: '产品设计优化',
    icon: Lightbulb,
    color: 'from-orange-500 to-red-500',
    status: 'pending',
    progress: 0,
    timeSpent: '0小时',
    estimatedTime: '4小时',
    steps: [
      {
        id: 'ux_design',
        name: 'UX/UI设计',
        description: '设计用户友好的交互界面和体验流程',
        status: 'pending',
        progress: 0,
        timeSpent: '0小时',
        estimatedTime: '2小时',
        insights: [],
        deliverables: ['用户旅程图', '线框图', '交互原型']
      },
      {
        id: 'feature_planning',
        name: '功能规划',
        description: '制定MVP功能范围和产品路线图',
        status: 'pending',
        progress: 0,
        timeSpent: '0小时',
        estimatedTime: '2小时',
        insights: [],
        deliverables: ['功能优先级矩阵', 'MVP定义', '产品路线图']
      }
    ]
  },
  {
    id: 'implementation',
    name: '实施方案规划',
    icon: Rocket,
    color: 'from-yellow-500 to-amber-500',
    status: 'pending',
    progress: 0,
    timeSpent: '0小时',
    estimatedTime: '3小时',
    steps: [
      {
        id: 'project_plan',
        name: '项目执行计划',
        description: '制定详细的项目时间表和里程碑',
        status: 'pending',
        progress: 0,
        timeSpent: '0小时',
        estimatedTime: '1.5小时',
        insights: [],
        deliverables: ['甘特图', '里程碑计划', '资源分配']
      },
      {
        id: 'risk_assessment',
        name: '风险评估',
        description: '识别潜在风险并制定应对策略',
        status: 'pending',
        progress: 0,
        timeSpent: '0小时',
        estimatedTime: '1.5小时',
        insights: [],
        deliverables: ['风险矩阵', '应急预案', '质量保证']
      }
    ]
  }
]

export default function AIWorkbenchPage() {
  // const params = useParams()
  const [currentStage, setCurrentStage] = useState(2)
  const [isPlaying, setIsPlaying] = useState(true)
  const [overallProgress, setOverallProgress] = useState(55)

  useEffect(() => {
    if (isPlaying) {
      const timer = setInterval(() => {
        setOverallProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false)
            return 100
          }
          return prev + Math.random() * 0.5
        })
      }, 2000)

      return () => clearInterval(timer)
    }
  }, [isPlaying])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600'
      case 'in_progress': return 'text-blue-600'
      case 'pending': return 'text-gray-400'
      case 'error': return 'text-red-600'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'in_progress': return <Activity className="w-5 h-5 text-blue-500 animate-pulse" />
      case 'pending': return <Clock className="w-5 h-5 text-gray-400" />
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />
      default: return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* 页头 */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Button variant="ghost" size="sm" asChild>
            <a href="/ideas/1" className="flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              返回创意详情
            </a>
          </Button>
          <span className="text-muted-foreground">/</span>
          <span>AI工作台</span>
        </div>

        {/* 总览卡片 */}
        <AnimatedSection>
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-6 h-6 text-blue-500" />
                    BizMaster AI 正在完善您的创意
                  </CardTitle>
                  <CardDescription className="mt-2">
                    智能冰箱食材管理助手 → SmartKitchen 家庭智能营养管家生态系统
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isPlaying ? '暂停' : '继续'}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    导出报告
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{Math.round(overallProgress)}%</div>
                  <div className="text-sm text-blue-500">总体进度</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">6.5小时</div>
                  <div className="text-sm text-green-500">已投入时间</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">16倍</div>
                  <div className="text-sm text-orange-500">预计增值</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">3,200</div>
                  <div className="text-sm text-purple-500">预估售价</div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>整体完善进度</span>
                  <span>{Math.round(overallProgress)}%</span>
                </div>
                <Progress value={overallProgress} className="h-3" />
              </div>
            </CardHeader>
          </Card>
        </AnimatedSection>

        {/* 工作流程阶段 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {mockWorkflow.map((stage, index) => {
            const Icon = stage.icon
            return (
              <AnimatedSection key={stage.id} delay={index * 0.1}>
                <Card
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    currentStage === index ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setCurrentStage(index)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${stage.color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{stage.name}</div>
                        <div className="flex items-center gap-1 mt-1">
                          {getStatusIcon(stage.status)}
                          <span className={`text-xs ${getStatusColor(stage.status)}`}>
                            {stage.status === 'completed' ? '已完成' :
                             stage.status === 'in_progress' ? '进行中' : '待开始'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>{stage.timeSpent}</span>
                        <span>{stage.progress}%</span>
                      </div>
                      <Progress value={stage.progress} className="h-1" />
                    </div>
                  </CardHeader>
                </Card>
              </AnimatedSection>
            )
          })}
        </div>

        {/* 详细工作流程 */}
        <AnimatedSection delay={0.5}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {React.createElement(mockWorkflow[currentStage].icon, { className: 'w-5 h-5' })}
                {mockWorkflow[currentStage].name}
                <Badge variant="outline" className="ml-auto">
                  {mockWorkflow[currentStage].timeSpent} / {mockWorkflow[currentStage].estimatedTime}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockWorkflow[currentStage].steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border rounded-lg p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(step.status)}
                        <div>
                          <h4 className="font-medium">{step.name}</h4>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{step.progress}%</div>
                        <div className="text-xs text-muted-foreground">{step.timeSpent}</div>
                      </div>
                    </div>

                    <Progress value={step.progress} className="mb-4" />

                    {step.insights.length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                          <Lightbulb className="w-4 h-4 text-yellow-500" />
                          AI洞察
                        </h5>
                        <ul className="space-y-1">
                          {step.insights.map((insight, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                              {insight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {step.deliverables.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                          <FileText className="w-4 h-4 text-blue-500" />
                          交付物
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {step.deliverables.map((deliverable, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {deliverable}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* 实时日志 */}
        <AnimatedSection delay={0.6} className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-500" />
                实时工作日志
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {[
                  { time: '14:23', action: '开始分析目标用户画像', type: 'info' },
                  { time: '14:21', action: '完成竞品分析，发现8个潜在竞品', type: 'success' },
                  { time: '14:18', action: '生成商业模式画布', type: 'success' },
                  { time: '14:15', action: '开始市场规模分析', type: 'info' },
                  { time: '14:10', action: '完成NLP语义分析', type: 'success' },
                  { time: '14:05', action: '开始创意深度解析', type: 'info' }
                ].map((log, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span className="text-muted-foreground font-mono">{log.time}</span>
                    <div className={`w-2 h-2 rounded-full ${
                      log.type === 'success' ? 'bg-green-500' :
                      log.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                    }`} />
                    <span>{log.action}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>
    </Layout>
  )
}