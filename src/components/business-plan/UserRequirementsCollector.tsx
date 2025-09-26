'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Target,
  Users,
  Building,
  AlertCircle,
  Clock,
  Brain,
  CheckCircle,
  Sparkles,
  TrendingUp,
  Zap,
  RotateCcw,
  Plus,
  X,
  Star,
  ArrowRight,
  ArrowLeft
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

// 类型定义
interface RequirementOption {
  id: string
  label: string
  description: string
  weight: number
  relatedStages: string[]
  aiPromptHint: string
}

interface RequirementCategory {
  id: string
  name: string
  description: string
  icon: React.ElementType
  options: RequirementOption[]
  allowCustom: boolean
  multiple: boolean
}

interface UserRequirements {
  selectedOptions: Record<string, string[]>
  customRequirements: Record<string, string>
  priorityWeights: Record<string, number>
  additionalContext: string
  expectedOutcomes: string[]
  timeConstraints: {
    deadline?: Date
    urgency: 'low' | 'medium' | 'high'
  }
}

interface RequirementAnalysis {
  understanding: {
    coreInterests: string[]
    userProfile: string
    experienceLevel: string
    mainConcerns: string[]
  }
  ideaFit: {
    matchScore: number
    strengths: string[]
    challenges: string[]
    recommendations: string[]
  }
  customizedOutline: {
    sections: Array<{
      stageId: string
      title: string
      description: string
      priority: 'high' | 'medium' | 'low'
      estimatedPages: number
      focusPoints: string[]
    }>
    totalPages: number
    estimatedTime: number
  }
  suggestions: Array<{
    type: 'enhancement' | 'adjustment' | 'warning'
    description: string
    priority: number
  }>
  estimatedTimeAdjustment: number
}

// 预设需求分类配置
const REQUIREMENT_CATEGORIES: RequirementCategory[] = [
  {
    id: 'business_focus',
    name: '商业关注重点',
    description: '您最希望在商业计划书中突出哪些方面？',
    icon: Target,
    allowCustom: true,
    multiple: true,
    options: [
      {
        id: 'market_opportunity',
        label: '市场机会分析',
        description: '深度分析市场规模、增长趋势和机会点',
        weight: 3,
        relatedStages: ['market_research', 'business_model'],
        aiPromptHint: '重点关注市场机会识别和量化分析'
      },
      {
        id: 'competitive_advantage',
        label: '竞争优势构建',
        description: '详细阐述产品/服务的核心竞争力',
        weight: 3,
        relatedStages: ['concept_analysis', 'market_research'],
        aiPromptHint: '深入分析差异化优势和护城河'
      },
      {
        id: 'revenue_model',
        label: '盈利模式设计',
        description: '清晰的收入来源和商业模式规划',
        weight: 3,
        relatedStages: ['business_model', 'financial_model'],
        aiPromptHint: '详细设计可持续的盈利路径'
      },
      {
        id: 'technology_innovation',
        label: '技术创新亮点',
        description: '突出技术方案的先进性和可行性',
        weight: 3,
        relatedStages: ['tech_architecture', 'concept_analysis'],
        aiPromptHint: '强调技术创新点和实现路径'
      },
      {
        id: 'team_capability',
        label: '团队能力展示',
        description: '突出团队的专业能力和执行力',
        weight: 2,
        relatedStages: ['implementation_plan', 'investor_pitch'],
        aiPromptHint: '重点展示团队优势和能力匹配度'
      },
      {
        id: 'scalability_potential',
        label: '可扩展性潜力',
        description: '展现业务的成长空间和扩张能力',
        weight: 2,
        relatedStages: ['business_model', 'financial_model'],
        aiPromptHint: '强调业务扩展性和增长潜力'
      }
    ]
  },
  {
    id: 'target_audience',
    name: '目标受众',
    description: '这份商业计划书主要面向哪些人群？',
    icon: Users,
    allowCustom: true,
    multiple: false,
    options: [
      {
        id: 'investors_vc',
        label: '风险投资人',
        description: '重点关注投资回报、市场规模、团队能力',
        weight: 3,
        relatedStages: ['investor_pitch', 'financial_model', 'market_research'],
        aiPromptHint: '采用投资人视角，强调ROI和可扩展性'
      },
      {
        id: 'angel_investors',
        label: '天使投资人',
        description: '注重创新性、早期可行性验证',
        weight: 2,
        relatedStages: ['concept_analysis', 'implementation_plan'],
        aiPromptHint: '突出创新概念和早期执行计划'
      },
      {
        id: 'strategic_partners',
        label: '战略合作伙伴',
        description: '展示合作价值、互补优势',
        weight: 2,
        relatedStages: ['business_model', 'implementation_plan'],
        aiPromptHint: '强调合作共赢和资源互补'
      },
      {
        id: 'internal_team',
        label: '内部团队',
        description: '详细的执行计划和资源配置',
        weight: 2,
        relatedStages: ['implementation_plan', 'tech_architecture'],
        aiPromptHint: '提供详细的执行指导和操作手册'
      },
      {
        id: 'government_agencies',
        label: '政府机构',
        description: '重点展示社会价值和合规性',
        weight: 2,
        relatedStages: ['legal_compliance', 'concept_analysis'],
        aiPromptHint: '强调社会效益和政策符合度'
      }
    ]
  },
  {
    id: 'industry_focus',
    name: '行业特色',
    description: '希望在计划书中如何体现行业特点？',
    icon: Building,
    allowCustom: true,
    multiple: true,
    options: [
      {
        id: 'regulatory_compliance',
        label: '合规性要求',
        description: '详细的法律法规遵循和风险控制',
        weight: 3,
        relatedStages: ['legal_compliance'],
        aiPromptHint: '重点关注行业合规和风险管控'
      },
      {
        id: 'industry_trends',
        label: '行业趋势分析',
        description: '深入分析行业发展方向和趋势',
        weight: 2,
        relatedStages: ['market_research', 'concept_analysis'],
        aiPromptHint: '结合行业发展趋势进行分析'
      },
      {
        id: 'ecosystem_position',
        label: '生态位定位',
        description: '在产业链中的位置和价值创造',
        weight: 2,
        relatedStages: ['business_model', 'market_research'],
        aiPromptHint: '分析产业链价值和生态定位'
      },
      {
        id: 'digital_transformation',
        label: '数字化转型',
        description: '突出数字化创新和转型价值',
        weight: 2,
        relatedStages: ['tech_architecture', 'business_model'],
        aiPromptHint: '强调数字化优势和转型意义'
      }
    ]
  },
  {
    id: 'resource_constraints',
    name: '资源约束',
    description: '当前面临的主要资源限制是什么？',
    icon: AlertCircle,
    allowCustom: true,
    multiple: true,
    options: [
      {
        id: 'funding_limited',
        label: '资金有限',
        description: '需要详细的资金使用计划和融资策略',
        weight: 3,
        relatedStages: ['financial_model', 'investor_pitch'],
        aiPromptHint: '重点规划资金使用效率和融资方案'
      },
      {
        id: 'team_building',
        label: '团队组建',
        description: '需要明确的人才需求和团队建设计划',
        weight: 2,
        relatedStages: ['implementation_plan'],
        aiPromptHint: '详细规划团队建设和人才获取策略'
      },
      {
        id: 'technology_gap',
        label: '技术差距',
        description: '需要技术开发路径和能力建设方案',
        weight: 2,
        relatedStages: ['tech_architecture', 'implementation_plan'],
        aiPromptHint: '提供技术能力建设和开发路线图'
      },
      {
        id: 'market_access',
        label: '市场准入',
        description: '需要市场拓展和渠道建设策略',
        weight: 2,
        relatedStages: ['market_research', 'business_model'],
        aiPromptHint: '重点规划市场进入和渠道策略'
      }
    ]
  },
  {
    id: 'timeline_priority',
    name: '时间优先级',
    description: '希望商业计划书重点关注哪个时间段？',
    icon: Clock,
    allowCustom: false,
    multiple: false,
    options: [
      {
        id: 'immediate_launch',
        label: '立即启动（3-6个月）',
        description: '专注于快速启动和早期验证',
        weight: 3,
        relatedStages: ['implementation_plan', 'concept_analysis'],
        aiPromptHint: '关注快速MVP开发和市场验证'
      },
      {
        id: 'medium_term',
        label: '中期发展（1-2年）',
        description: '平衡发展计划和可持续性',
        weight: 2,
        relatedStages: ['business_model', 'financial_model'],
        aiPromptHint: '平衡短期执行和中期发展规划'
      },
      {
        id: 'long_term_vision',
        label: '长期愿景（3-5年）',
        description: '重点关注战略规划和规模化',
        weight: 2,
        relatedStages: ['market_research', 'investor_pitch'],
        aiPromptHint: '强调长期战略和规模化路径'
      }
    ]
  }
]

interface UserRequirementsCollectorProps {
  ideaData: {
    id: string
    title: string
    description: string
    category: string
    tags: string[]
  }
  onRequirementsSubmit: (requirements: UserRequirements, analysis: RequirementAnalysis) => void
  onSkip: () => void
}

export const UserRequirementsCollector: React.FC<UserRequirementsCollectorProps> = ({
  ideaData,
  onRequirementsSubmit,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [requirements, setRequirements] = useState<UserRequirements>({
    selectedOptions: {},
    customRequirements: {},
    priorityWeights: {},
    additionalContext: '',
    expectedOutcomes: [],
    timeConstraints: { urgency: 'medium' }
  })

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<RequirementAnalysis | null>(null)

  // 更新需求数据
  const updateRequirements = (categoryId: string, options: string[], customText: string = '') => {
    setRequirements(prev => ({
      ...prev,
      selectedOptions: { ...prev.selectedOptions, [categoryId]: options },
      customRequirements: { ...prev.customRequirements, [categoryId]: customText }
    }))
  }

  // AI分析需求
  const handleAnalyzeRequirements = async () => {
    setIsAnalyzing(true)

    // 模拟AI分析过程
    await new Promise(resolve => setTimeout(resolve, 3000))

    // 生成模拟分析结果
    const mockAnalysis: RequirementAnalysis = {
      understanding: {
        coreInterests: [
          '市场机会识别和规模化潜力',
          '技术创新的商业化路径',
          '投资回报和融资策略'
        ],
        userProfile: '技术背景的创业者，具有一定商业经验',
        experienceLevel: '中级',
        mainConcerns: ['资金效率', '市场竞争', '技术可行性']
      },
      ideaFit: {
        matchScore: 0.85,
        strengths: ['创新性强', '市场需求明确', '技术壁垒适中'],
        challenges: ['竞争激烈', '资金需求较大', '团队需要完善'],
        recommendations: ['重点突出差异化优势', '详化财务模型', '强化团队介绍']
      },
      customizedOutline: {
        sections: [
          {
            stageId: 'concept_analysis',
            title: '创意概念与创新价值',
            description: '重点突出技术创新点和差异化优势',
            priority: 'high',
            estimatedPages: 8,
            focusPoints: ['技术创新', '差异化优势', '问题解决价值']
          },
          {
            stageId: 'market_research',
            title: '市场机会与竞争分析',
            description: '深度分析目标市场规模和竞争态势',
            priority: 'high',
            estimatedPages: 12,
            focusPoints: ['市场规模', '增长趋势', '竞争分析', '市场机会']
          }
          // 其他章节...
        ],
        totalPages: 45,
        estimatedTime: 52
      },
      suggestions: [
        {
          type: 'enhancement',
          description: '建议增加技术实现的详细路线图，增强投资人信心',
          priority: 1
        },
        {
          type: 'adjustment',
          description: '财务模型建议采用多种场景分析，展示不同情况下的表现',
          priority: 2
        }
      ],
      estimatedTimeAdjustment: 52
    }

    setAnalysisResult(mockAnalysis)
    setIsAnalyzing(false)
  }

  const currentCategory = REQUIREMENT_CATEGORIES[currentStep]
  const isLastStep = currentStep === REQUIREMENT_CATEGORIES.length - 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-2 border-primary/20 mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl mb-2">需求定制化分析</CardTitle>
                <CardDescription className="text-base">
                  为 "<span className="font-medium text-primary">{ideaData.title}</span>" 定制最符合您期望的商业计划书
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {currentStep + 1}/{REQUIREMENT_CATEGORIES.length + 1}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={(currentStep / REQUIREMENT_CATEGORIES.length) * 100} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              通过回答几个简单问题，我们将为您生成最贴合需求的商业计划书
            </p>
          </CardContent>
        </Card>

        <AnimatePresence mode="wait">
          {!isAnalyzing && !analysisResult && (
            <RequirementCategoryStep
              key={currentStep}
              category={currentCategory}
              selectedOptions={requirements.selectedOptions[currentCategory.id] || []}
              customInput={requirements.customRequirements[currentCategory.id] || ''}
              onUpdate={(options, custom) => updateRequirements(currentCategory.id, options, custom)}
            />
          )}

          {isAnalyzing && (
            <RequirementsAnalysisStep
              key="analyzing"
              ideaData={ideaData}
              requirements={requirements}
              onComplete={setAnalysisResult}
            />
          )}

          {analysisResult && (
            <AnalysisResultsStep
              key="results"
              analysisResult={analysisResult}
              ideaData={ideaData}
              onConfirm={() => onRequirementsSubmit(requirements, analysisResult)}
              onRevise={() => {
                setAnalysisResult(null)
                setCurrentStep(0)
              }}
            />
          )}
        </AnimatePresence>

        {/* 控制按钮 */}
        {!isAnalyzing && !analysisResult && (
          <div className="flex justify-between pt-8">
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="outline" onClick={() => setCurrentStep(prev => prev - 1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  上一步
                </Button>
              )}
              <Button variant="ghost" onClick={onSkip}>
                跳过定制，使用默认设置
              </Button>
            </div>

            <div className="flex gap-2">
              {!isLastStep && (
                <Button onClick={() => setCurrentStep(prev => prev + 1)}>
                  下一步
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
              {isLastStep && (
                <Button onClick={handleAnalyzeRequirements} size="lg">
                  <Brain className="w-4 h-4 mr-2" />
                  AI分析需求
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 需求分类步骤组件
const RequirementCategoryStep: React.FC<{
  category: RequirementCategory
  selectedOptions: string[]
  customInput: string
  onUpdate: (options: string[], custom: string) => void
}> = ({ category, selectedOptions, customInput, onUpdate }) => {
  const [priorities, setPriorities] = useState<Record<string, number>>({})

  const handleOptionToggle = (optionId: string) => {
    if (category.multiple) {
      const newOptions = selectedOptions.includes(optionId)
        ? selectedOptions.filter(id => id !== optionId)
        : [...selectedOptions, optionId]
      onUpdate(newOptions, customInput)
    } else {
      onUpdate([optionId], customInput)
    }
  }

  const IconComponent = category.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <IconComponent className="w-5 h-5 text-primary" />
            </div>
            {category.name}
          </CardTitle>
          <CardDescription className="text-base">
            {category.description}
            {category.multiple && (
              <Badge variant="secondary" className="ml-2 text-xs">可多选</Badge>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 预设选项 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {category.options.map(option => {
              const isSelected = selectedOptions.includes(option.id)

              return (
                <motion.div
                  key={option.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'hover:border-gray-300 hover:shadow-sm'
                    }`}
                    onClick={() => handleOptionToggle(option.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => {}}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">{option.label}</h4>
                            <div className="flex items-center gap-1">
                              {[...Array(option.weight)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 text-yellow-500 fill-current" />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {option.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {option.relatedStages.slice(0, 2).map(stage => (
                              <Badge key={stage} variant="outline" className="text-xs">
                                {stage}
                              </Badge>
                            ))}
                            {option.relatedStages.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{option.relatedStages.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {/* 自定义输入 */}
          {category.allowCustom && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" />
                <Label className="font-medium">补充说明或其他需求</Label>
              </div>
              <Textarea
                placeholder={`请描述您在${category.name}方面的特殊需求或期望...`}
                value={customInput}
                onChange={(e) => onUpdate(selectedOptions, e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          )}

          {/* 选中项的重要性调节 */}
          {selectedOptions.length > 1 && category.multiple && (
            <div className="space-y-4 p-4 bg-secondary/30 rounded-lg">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                调整重要性优先级
              </h4>
              {selectedOptions.map(optionId => {
                const option = category.options.find(o => o.id === optionId)
                if (!option) return null

                return (
                  <div key={optionId} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{option.label}</span>
                      <Badge variant="outline" className="text-xs">
                        {priorities[optionId] || 50}%
                      </Badge>
                    </div>
                    <Slider
                      value={[priorities[optionId] || 50]}
                      onValueChange={(value) => setPriorities(prev => ({
                        ...prev,
                        [optionId]: value[0]
                      }))}
                      max={100}
                      step={10}
                      className="w-full"
                    />
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// AI分析步骤组件
const RequirementsAnalysisStep: React.FC<{
  ideaData: any
  requirements: UserRequirements
  onComplete: (result: RequirementAnalysis) => void
}> = ({ ideaData, requirements, onComplete }) => {
  const [progress, setProgress] = useState(0)
  const [currentTask, setCurrentTask] = useState('正在理解您的需求...')

  const analysisSteps = [
    { task: '正在理解您的需求...', duration: 1000 },
    { task: '分析创意与需求的匹配度...', duration: 1500 },
    { task: '生成个性化大纲...', duration: 1000 },
    { task: '优化生成策略...', duration: 800 },
    { task: '完成分析报告...', duration: 700 }
  ]

  React.useEffect(() => {
    let currentStep = 0
    let accumulatedTime = 0

    const runAnalysis = () => {
      if (currentStep < analysisSteps.length) {
        const step = analysisSteps[currentStep]
        setCurrentTask(step.task)

        setTimeout(() => {
          accumulatedTime += step.duration
          setProgress((accumulatedTime / 5000) * 100)
          currentStep++
          runAnalysis()
        }, step.duration)
      }
    }

    runAnalysis()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Brain className="w-6 h-6 animate-pulse" />
            AI智能分析中
          </CardTitle>
          <CardDescription className="text-blue-700">
            正在基于您的需求和创意特点，生成专属的商业计划书方案
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-800">{currentTask}</span>
              <span className="text-sm text-blue-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3 bg-blue-100" />
          </div>
        </CardContent>
      </Card>

      {/* 需求预览 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">您的需求概览</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">关注重点</h4>
              <div className="space-y-2">
                {Object.entries(requirements.selectedOptions).map(([categoryId, options]) => {
                  const category = REQUIREMENT_CATEGORIES.find(c => c.id === categoryId)
                  return options.map(optionId => {
                    const option = category?.options.find(o => o.id === optionId)
                    return option ? (
                      <Badge key={optionId} variant="secondary" className="mr-2">
                        {option.label}
                      </Badge>
                    ) : null
                  })
                })}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">创意信息</h4>
              <div className="space-y-1 text-sm">
                <div><strong>标题:</strong> {ideaData.title}</div>
                <div><strong>分类:</strong> {ideaData.category}</div>
                <div><strong>描述:</strong> {ideaData.description.substring(0, 100)}...</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// 分析结果步骤组件
const AnalysisResultsStep: React.FC<{
  analysisResult: RequirementAnalysis
  ideaData: any
  onConfirm: () => void
  onRevise: () => void
}> = ({ analysisResult, ideaData, onConfirm, onRevise }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* 成功提示 */}
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-6 h-6" />
            AI需求分析完成
          </CardTitle>
          <CardDescription className="text-green-700">
            基于您的需求，我们为您定制了专属的商业计划书生成方案
          </CardDescription>
        </CardHeader>
      </Card>

      {/* 关键指标 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">
              {Math.round(analysisResult.ideaFit.matchScore * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">需求匹配度</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">
              {analysisResult.estimatedTimeAdjustment}min
            </div>
            <div className="text-sm text-muted-foreground">预计生成时间</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Zap className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">
              {analysisResult.customizedOutline.totalPages}
            </div>
            <div className="text-sm text-muted-foreground">预计总页数</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-600">
              {analysisResult.suggestions.filter(s => s.priority === 1).length}
            </div>
            <div className="text-sm text-muted-foreground">优化建议</div>
          </CardContent>
        </Card>
      </div>

      {/* 需求理解 */}
      <Card>
        <CardHeader>
          <CardTitle>需求理解与分析</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500" />
                核心关注点
              </h4>
              <ul className="space-y-2">
                {analysisResult.understanding.coreInterests.map((interest, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {interest}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                优化建议
              </h4>
              <ul className="space-y-2">
                {analysisResult.suggestions.slice(0, 3).map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Badge variant="outline" className="text-xs mt-0.5 flex-shrink-0">
                      {suggestion.type}
                    </Badge>
                    {suggestion.description}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 定制化大纲 */}
      <Card>
        <CardHeader>
          <CardTitle>定制化章节大纲</CardTitle>
          <CardDescription>根据您的需求调整后的内容重点和结构</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysisResult.customizedOutline.sections.map((section, index) => (
              <div key={section.stageId} className="flex items-start gap-4 p-4 border rounded-lg">
                <Badge className="mt-1">{index + 1}</Badge>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{section.title}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant={section.priority === 'high' ? 'default' : 'secondary'}>
                        {section.priority === 'high' ? '重点' : section.priority === 'medium' ? '标准' : '简化'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {section.estimatedPages}页
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{section.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {section.focusPoints.map((point, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {point}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 确认按钮 */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onRevise}>
          <RotateCcw className="w-4 h-4 mr-2" />
          重新调整需求
        </Button>
        <Button onClick={onConfirm} size="lg" className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          确认并开始生成商业计划书
        </Button>
      </div>
    </motion.div>
  )
}