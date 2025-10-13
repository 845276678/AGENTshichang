'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Clock,
  Target,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react'

// 工作坊类型定义
type WorkshopId = 'demand-validation' | 'mvp-builder' | 'growth-hacking' | 'profit-model'

interface WorkshopMetadata {
  id: WorkshopId
  title: string
  subtitle: string
  description: string
  duration: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  icon: React.ReactNode
  color: string
  objectives: string[]
  prerequisites: string[]
  outcomes: string[]
}

// 工作坊元数据配置
const WORKSHOPS: Record<WorkshopId, WorkshopMetadata> = {
  'demand-validation': {
    id: 'demand-validation',
    title: '需求验证实验室',
    subtitle: 'Demand Validation Lab',
    description: '通过The Mom Test理论和6个AI专家Agent，帮助您深度验证目标客户需求，识别真实痛点，避免伪需求陷阱。',
    duration: '60-90分钟',
    difficulty: 'beginner',
    icon: <Target className="w-8 h-8" />,
    color: 'blue',
    objectives: [
      '明确目标客户画像（年龄、职业、痛点）',
      '识别有效需求信号 vs 无效赞美',
      '收集具体行为证据和付费意愿',
      '验证需求优先级和紧迫性'
    ],
    prerequisites: [
      '已完成创意成熟度评估',
      '目标客户维度分数 < 7.0',
      '至少有初步的用户群体描述'
    ],
    outcomes: [
      '清晰的目标用户画像文档',
      '至少3个真实需求验证案例',
      '用户访谈话术模板',
      '需求优先级矩阵'
    ]
  },
  'mvp-builder': {
    id: 'mvp-builder',
    title: 'MVP构建指挥部',
    subtitle: 'MVP Building Command Center',
    description: '快速定义和构建最小可行产品（MVP），通过精益方法论快速验证核心假设，降低试错成本。',
    duration: '90-120分钟',
    difficulty: 'intermediate',
    icon: <Lightbulb className="w-8 h-8" />,
    color: 'purple',
    objectives: [
      '提炼核心功能（Top 3）',
      '设计MVP原型（低保真 → 高保真）',
      '制定快速验证计划（2周sprint）',
      '定义成功指标（北极星指标）'
    ],
    prerequisites: [
      '核心价值维度分数 < 7.0',
      '已完成需求验证',
      '有基本的产品概念描述'
    ],
    outcomes: [
      'MVP功能清单（PRD文档）',
      '原型设计图（Figma/Sketch）',
      '2周验证计划',
      '成功指标定义（OKR）'
    ]
  },
  'growth-hacking': {
    id: 'growth-hacking',
    title: '增长黑客作战室',
    subtitle: 'Growth Hacking War Room',
    description: '运用增长黑客策略，设计病毒式传播机制，低成本获取种子用户，实现爆发式增长。',
    duration: '75-100分钟',
    difficulty: 'advanced',
    icon: <TrendingUp className="w-8 h-8" />,
    color: 'green',
    objectives: [
      '设计AARRR漏斗（获取、激活、留存、推荐、收入）',
      '制定增长实验计划（A/B测试）',
      '优化用户推荐机制（病毒系数K值）',
      '低成本获客渠道（CAC < LTV）'
    ],
    prerequisites: [
      '已有MVP或Beta版本',
      '至少10个种子用户',
      '有基本的数据埋点'
    ],
    outcomes: [
      '增长模型设计（AARRR漏斗）',
      '10个增长实验方案',
      '病毒式传播机制',
      '30天增长计划'
    ]
  },
  'profit-model': {
    id: 'profit-model',
    title: '盈利模式实验室',
    subtitle: 'Profit Model Laboratory',
    description: '探索和验证商业模式，设计合理的定价策略，构建可持续的收入模型，实现商业闭环。',
    duration: '60-80分钟',
    difficulty: 'intermediate',
    icon: <DollarSign className="w-8 h-8" />,
    color: 'orange',
    objectives: [
      '选择适合的商业模式（SaaS/电商/广告/佣金）',
      '设计定价策略（价值定价 vs 成本定价）',
      '计算单位经济模型（LTV/CAC比率）',
      '规划收入增长路径（从0到1000万）'
    ],
    prerequisites: [
      '商业模式维度分数 < 7.0',
      '有产品原型或概念',
      '了解目标用户付费能力'
    ],
    outcomes: [
      '商业模式画布（BMC）',
      '定价方案（3个tier）',
      '财务预测模型（Excel）',
      '收入增长路线图'
    ]
  }
}

export default function WorkshopPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const workshopId = params.id as WorkshopId
  const assessmentId = searchParams.get('assessment')

  const [workshop, setWorkshop] = useState<WorkshopMetadata | null>(null)
  const [loading, setLoading] = useState(true)
  const [assessmentData, setAssessmentData] = useState<any>(null)

  // 加载工作坊数据
  useEffect(() => {
    if (workshopId && WORKSHOPS[workshopId]) {
      setWorkshop(WORKSHOPS[workshopId])
      setLoading(false)
    } else {
      console.error('Invalid workshop ID:', workshopId)
      setLoading(false)
    }
  }, [workshopId])

  // 加载评估数据（如果有assessmentId）
  useEffect(() => {
    const loadAssessmentData = async () => {
      if (!assessmentId) return

      try {
        // TODO: 从API加载评估数据
        // const response = await fetch(`/api/maturity/assessment/${assessmentId}`)
        // const data = await response.json()
        // setAssessmentData(data)

        console.log('📊 加载评估数据:', assessmentId)
      } catch (error) {
        console.error('加载评估数据失败:', error)
      }
    }

    loadAssessmentData()
  }, [assessmentId])

  // 返回按钮
  const handleGoBack = () => {
    router.back()
  }

  // 开始工作坊
  const handleStartWorkshop = () => {
    console.log('🚀 开始工作坊:', workshopId)
    // TODO: 跳转到工作坊交互页面
    alert('工作坊交互功能开发中...\n\n即将推出：\n- 6个AI专家Agent实时指导\n- 交互式问答和表单\n- 实时生成工作坊报告\n- 个性化改进建议')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载工作坊信息...</p>
        </div>
      </div>
    )
  }

  if (!workshop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">工作坊不存在</h2>
            <p className="text-gray-600 mb-4">
              未找到ID为 "{workshopId}" 的工作坊
            </p>
            <Button onClick={handleGoBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const colorClasses = {
    blue: 'border-blue-500 bg-blue-50',
    purple: 'border-purple-500 bg-purple-50',
    green: 'border-green-500 bg-green-50',
    orange: 'border-orange-500 bg-orange-50'
  }

  const badgeColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* 返回按钮 */}
        <Button
          variant="outline"
          onClick={handleGoBack}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回竞价结果
        </Button>

        {/* 工作坊头部 */}
        <Card className={`border-4 ${colorClasses[workshop.color as keyof typeof colorClasses]}`}>
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              {/* 图标 */}
              <div className={`p-4 rounded-2xl ${workshop.color === 'blue' ? 'bg-blue-200' : workshop.color === 'purple' ? 'bg-purple-200' : workshop.color === 'green' ? 'bg-green-200' : 'bg-orange-200'}`}>
                {workshop.icon}
              </div>

              {/* 标题和描述 */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {workshop.title}
                  </h1>
                  <Badge className={badgeColors[workshop.difficulty]}>
                    {workshop.difficulty === 'beginner' ? '初级' : workshop.difficulty === 'intermediate' ? '中级' : '高级'}
                  </Badge>
                </div>
                <p className="text-lg text-gray-600 mb-4">{workshop.subtitle}</p>
                <p className="text-gray-700 leading-relaxed">{workshop.description}</p>

                <div className="flex items-center gap-6 mt-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">{workshop.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-5 h-5" />
                    <span>6个AI专家指导</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 工作坊目标 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-6 h-6 text-blue-600" />
              学习目标
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {workshop.objectives.map((objective, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{objective}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* 前置条件 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-orange-600" />
              前置条件
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {workshop.prerequisites.map((prerequisite, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-orange-400 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  </div>
                  <span className="text-gray-700">{prerequisite}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* 预期产出 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-600" />
              预期产出
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {workshop.outcomes.map((outcome, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">{outcome}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 评估数据展示（如果有） */}
        {assessmentId && (
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-700" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">基于您的评估结果</h3>
                  <p className="text-sm text-gray-600">此工作坊将针对您的薄弱维度提供个性化指导</p>
                </div>
              </div>
              <p className="text-sm text-blue-800">
                评估ID: {assessmentId}
              </p>
            </CardContent>
          </Card>
        )}

        {/* 开始按钮 */}
        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  准备好开始了吗？
                </h3>
                <p className="text-gray-600">
                  6位AI专家将全程陪伴您完成这次工作坊
                </p>
              </div>
              <Button
                onClick={handleStartWorkshop}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg font-semibold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <Lightbulb className="w-6 h-6 mr-2" />
                开始工作坊
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
