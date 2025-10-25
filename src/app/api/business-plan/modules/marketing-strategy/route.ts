import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface MarketingStrategyRequest {
  ideaDescription: string
  targetUsers: string[]
  budget?: number
  timeframe?: string
  channels?: string[]
}

interface MarketingStrategy {
  channels: {
    digitalChannels: Array<{
      name: string
      strategy: string
      expectedROI: string
      budget: string
    }>
    offlineChannels: Array<{
      name: string
      approach: string
      cost: string
    }>
  }
  contentStrategy: {
    contentTypes: string[]
    frequency: string
    topics: string[]
  }
  budgetAllocation: {
    total: string
    breakdown: Array<{
      category: string
      amount: string
      percentage: string
    }>
  }
  timeline: {
    phases: Array<{
      name: string
      duration: string
      activities: string[]
      kpis: string[]
    }>
  }
  metadata: {
    confidence: number
    generatedAt: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as MarketingStrategyRequest

    if (!body.ideaDescription?.trim()) {
      return NextResponse.json({
        success: false,
        error: "缺少创意描述"
      }, { status: 400 })
    }

    console.log('📢 开始生成推广策略')

    // 使用模拟数据生成策略
    await new Promise(resolve => setTimeout(resolve, 800))

    // 解析或使用默认策略
    const strategy: MarketingStrategy = generateDefaultStrategy(body)

    strategy.metadata = {
      confidence: 0.8,
      generatedAt: new Date().toISOString()
    }

    console.log('✅ 推广策略生成完成')

    return NextResponse.json({
      success: true,
      data: strategy,
      estimatedTime: '4-6分钟',
      moduleType: 'marketing-strategy'
    })

  } catch (error) {
    console.error('❌ 推广策略生成失败:', error)
    return handleApiError(error)
  }
}

function generateDefaultStrategy(body: MarketingStrategyRequest): MarketingStrategy {
  return {
    channels: {
      digitalChannels: [
        {
          name: '社交媒体营销',
          strategy: '微信公众号、抖音、小红书多平台运营',
          expectedROI: '1:3',
          budget: '30%'
        },
        {
          name: '搜索引擎营销',
          strategy: 'SEO优化+百度/Google竞价广告',
          expectedROI: '1:4',
          budget: '25%'
        },
        {
          name: '内容营销',
          strategy: '知乎、B站等平台的专业内容输出',
          expectedROI: '1:5',
          budget: '20%'
        }
      ],
      offlineChannels: [
        {
          name: '线下活动',
          approach: '行业会议、workshop、路演',
          cost: '15%'
        }
      ]
    },
    contentStrategy: {
      contentTypes: ['短视频', '图文教程', '案例分享', '用户故事'],
      frequency: '每周3-5次发布',
      topics: ['行业洞察', '产品功能', '使用技巧', '成功案例']
    },
    budgetAllocation: {
      total: body.budget ? `${body.budget}元` : '10-50万元',
      breakdown: [
        { category: '线上广告', amount: '40%', percentage: '40%' },
        { category: '内容制作', amount: '25%', percentage: '25%' },
        { category: '渠道合作', amount: '20%', percentage: '20%' },
        { category: '线下活动', amount: '15%', percentage: '15%' }
      ]
    },
    timeline: {
      phases: [
        {
          name: '启动期（第1-2月）',
          duration: '2个月',
          activities: ['品牌定位', '渠道搭建', '初期投放'],
          kpis: ['品牌曝光10万+', '新增用户1000+']
        },
        {
          name: '增长期（第3-4月）',
          duration: '2个月',
          activities: ['优化投放', '扩大规模', 'KOL合作'],
          kpis: ['用户增长200%', '转化率提升50%']
        },
        {
          name: '稳定期（第5-6月）',
          duration: '2个月',
          activities: ['口碑营销', '用户裂变', '品牌沉淀'],
          kpis: ['自然流量占比40%', 'NPS≥50']
        }
      ]
    },
    metadata: {
      confidence: 0.8,
      generatedAt: new Date().toISOString()
    }
  }
}

export async function GET(request: NextRequest) {
  const example = generateDefaultStrategy({
    ideaDescription: 'AI智能学习助手',
    targetUsers: ['K12学生', '家长'],
    budget: 200000,
    timeframe: '6个月'
  })

  return NextResponse.json({
    success: true,
    data: example,
    isExample: true
  })
}
