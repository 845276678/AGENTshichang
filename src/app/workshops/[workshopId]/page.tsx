/**
 * 工作坊动态页面
 *
 * 支持的工作坊类型：
 * - demand-validation: 需求验证实验室
 * - mvp-builder: MVP构建工作坊
 * - growth-hacking: 增长黑客训练营
 * - profit-model: 商业模式设计
 */

import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import WorkshopDashboard from '@/components/workshop/WorkshopDashboard'
import { type WorkshopId } from '@/hooks/useWorkshopSession'

// 工作坊配置
const WORKSHOP_CONFIG: Record<WorkshopId, {
  title: string
  description: string
  estimatedTime: string
  difficulty: string
}> = {
  'demand-validation': {
    title: '需求验证实验室',
    description: '通过科学的方法验证您的商业想法是否有市场需求，降低创业风险',
    estimatedTime: '45-60分钟',
    difficulty: '初级'
  },
  'mvp-builder': {
    title: 'MVP构建工作坊',
    description: '从想法到产品原型，学会构建最小可行产品（MVP）的核心方法',
    estimatedTime: '60-90分钟',
    difficulty: '中级'
  },
  'growth-hacking': {
    title: '增长黑客训练营',
    description: '掌握增长黑客的核心策略，快速扩大用户基础和业务规模',
    estimatedTime: '90-120分钟',
    difficulty: '高级'
  },
  'profit-model': {
    title: '商业模式设计',
    description: '构建可持续盈利的商业模式，实现从创意到收益的转化',
    estimatedTime: '120-150分钟',
    difficulty: '高级'
  }
}

interface WorkshopPageProps {
  params: {
    workshopId: string
  }
}

// 生成动态元数据
export async function generateMetadata({
  params
}: WorkshopPageProps): Promise<Metadata> {
  const workshopId = params.workshopId as WorkshopId
  const config = WORKSHOP_CONFIG[workshopId]

  if (!config) {
    return {
      title: '工作坊不存在 - AI智能体市场',
      description: '您访问的工作坊页面不存在'
    }
  }

  return {
    title: `${config.title} - AI智能体市场`,
    description: config.description,
    keywords: ['工作坊', '创业', '商业验证', config.title],
    openGraph: {
      title: config.title,
      description: config.description,
      type: 'website'
    }
  }
}

// 生成静态路径
export async function generateStaticParams() {
  return Object.keys(WORKSHOP_CONFIG).map((workshopId) => ({
    workshopId
  }))
}

export default function WorkshopPage({ params }: WorkshopPageProps) {
  const workshopId = params.workshopId as WorkshopId
  const config = WORKSHOP_CONFIG[workshopId]

  // 如果工作坊不存在，返回404
  if (!config) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <WorkshopDashboard
          workshopId={workshopId}
          userId="test-user-week4"
        />
      </div>
    </div>
  )
}