import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface BusinessModelRequest {
  ideaDescription: string
  targetUsers: string[]
  competitorPricing?: Array<{
    competitor: string
    price: number
  }>
  costStructure?: Array<{
    category: string
    estimatedCost: number
  }>
}

interface BusinessModel {
  revenueStreams: {
    primary: Array<{
      name: string
      description: string
      expectedRevenue: string
    }>
    secondary: Array<{
      name: string
      description: string
      potential: string
    }>
  }
  pricingStrategy: {
    models: Array<{
      tier: string
      price: string
      features: string[]
      targetSegment: string
    }>
    rationale: string
  }
  costStructure: {
    fixed: Array<{
      item: string
      monthlyCost: string
    }>
    variable: Array<{
      item: string
      unitCost: string
    }>
  }
  financialProjections: {
    year1: { revenue: string; profit: string; users: string }
    year2: { revenue: string; profit: string; users: string }
    year3: { revenue: string; profit: string; users: string }
    breakEvenPoint: string
  }
  metadata: {
    confidence: number
    generatedAt: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as BusinessModelRequest

    if (!body.ideaDescription?.trim()) {
      return NextResponse.json({
        success: false,
        error: "缺少创意描述"
      }, { status: 400 })
    }

    console.log('💰 开始生成盈利模式')

    // 使用模拟数据生成模型
    await new Promise(resolve => setTimeout(resolve, 800))

    const model: BusinessModel = generateDefaultModel(body)

    model.metadata = {
      confidence: 0.85,
      generatedAt: new Date().toISOString()
    }

    console.log('✅ 盈利模式生成完成')

    return NextResponse.json({
      success: true,
      data: model,
      estimatedTime: '4-6分钟',
      moduleType: 'business-model'
    })

  } catch (error) {
    console.error('❌ 盈利模式生成失败:', error)
    return handleApiError(error)
  }
}

function generateDefaultModel(body: BusinessModelRequest): BusinessModel {
  return {
    revenueStreams: {
      primary: [
        {
          name: '订阅收入',
          description: '月度/年度订阅服务',
          expectedRevenue: '占总收入70%'
        },
        {
          name: '增值服务',
          description: '高级功能、一对一服务',
          expectedRevenue: '占总收入20%'
        }
      ],
      secondary: [
        {
          name: '企业授权',
          description: 'B2B企业版授权',
          potential: '占总收入10%'
        }
      ]
    },
    pricingStrategy: {
      models: [
        {
          tier: '基础版',
          price: '免费',
          features: ['基础功能', '每日10次使用', '社区支持'],
          targetSegment: '试用用户'
        },
        {
          tier: '标准版',
          price: '¥199/月',
          features: ['无限使用', '高级功能', '优先支持', '数据分析'],
          targetSegment: '个人用户'
        },
        {
          tier: '专业版',
          price: '¥399/月',
          features: ['标准版全部功能', '专属服务', 'API接口', '定制方案'],
          targetSegment: '专业用户/小团队'
        }
      ],
      rationale: '采用免费+付费订阅模式，通过免费版获取用户，通过付费版实现变现'
    },
    costStructure: {
      fixed: [
        { item: '服务器和云服务', monthlyCost: '¥20,000' },
        { item: '团队工资', monthlyCost: '¥150,000' },
        { item: '办公场地', monthlyCost: '¥30,000' },
        { item: '软件和工具', monthlyCost: '¥10,000' }
      ],
      variable: [
        { item: 'AI API调用', unitCost: '¥0.5/次' },
        { item: '客户获取成本', unitCost: '¥150/用户' },
        { item: '客服支持', unitCost: '¥50/用户/年' }
      ]
    },
    financialProjections: {
      year1: {
        revenue: '¥600万',
        profit: '-¥200万（投入期）',
        users: '5,000付费用户'
      },
      year2: {
        revenue: '¥3,600万',
        profit: '¥800万',
        users: '30,000付费用户'
      },
      year3: {
        revenue: '¥1.2亿',
        profit: '¥4,000万',
        users: '100,000付费用户'
      },
      breakEvenPoint: '第18个月（用户数达15,000时）'
    },
    metadata: {
      confidence: 0.85,
      generatedAt: new Date().toISOString()
    }
  }
}

export async function GET(request: NextRequest) {
  const example = generateDefaultModel({
    ideaDescription: 'AI智能学习助手',
    targetUsers: ['K12学生', '家长', '教育机构']
  })

  return NextResponse.json({
    success: true,
    data: example,
    isExample: true
  })
}
