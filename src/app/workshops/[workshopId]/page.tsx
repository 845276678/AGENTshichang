/**
 * 工作坊动态页面 (性能优化版)
 *
 * 性能优化特性：
 * - 懒加载大型组件
 * - 渐进式内容加载
 * - Suspense边界
 * - 代码分割
 *
 * 支持的工作坊类型：
 * - demand-validation: 需求验证实验室
 * - mvp-builder: MVP构建工作坊
 * - growth-hacking: 增长黑客训练营
 * - profit-model: 商业模式设计
 */

'use client'

import React, { Suspense, lazy } from 'react'

import { notFound, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Layout } from '@/components/layout'
import { type WorkshopId } from '@/hooks/useWorkshopSession'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, LogIn, Target, Play, Trophy, Calendar } from 'lucide-react'
import Link from 'next/link'

// 懒加载大型组件 - 实现代码分割
const WorkshopDashboard = lazy(() => import('@/components/workshop/WorkshopDashboard'))
const MVPBuilderConversational = lazy(() => import('@/components/workshop/MVPBuilderConversational'))

// 工作坊配置 - 与 src/app/workshop/[id]/page.tsx 和 src/data/workshops.ts 保持一致
const WORKSHOP_CONFIG: Record<WorkshopId, {
  title: string
  subtitle: string
  description: string
  estimatedTime: string
  difficulty: string
  icon: React.ComponentType<any>
  color: string
}> = {
  'demand-validation': {
    title: '创意完善计划书',
    subtitle: '需求验证实验室',
    description: '通过科学的方法验证您的商业想法是否有市场需求，完善创意细节',
    estimatedTime: '45-60分钟',
    difficulty: '初级',
    icon: Target,
    color: 'blue'
  },
  'mvp-builder': {
    title: 'MVP构建工作坊',
    subtitle: '最小可行产品设计',
    description: '从想法到产品原型，学会构建最小可行产品（MVP）的核心方法',
    estimatedTime: '60-90分钟',
    difficulty: '中级',
    icon: Play,
    color: 'green'
  },
  'growth-hacking': {
    title: '推广工具',
    subtitle: '增长黑客训练营',
    description: '掌握增长策略的核心方法，快速扩大用户基础和业务规模',
    estimatedTime: '90-120分钟',
    difficulty: '高级',
    icon: Trophy,
    color: 'purple'
  },
  'profit-model': {
    title: '盈利平台',
    subtitle: '商业模式设计',
    description: '构建可持续盈利的商业模式，实现从创意到收益的转化',
    estimatedTime: '120-150分钟',
    difficulty: '高级',
    icon: Calendar,
    color: 'orange'
  }
}

// 工作坊加载骨架屏
function WorkshopSkeleton({ config }: { config: typeof WORKSHOP_CONFIG[WorkshopId] }) {
  const Icon = config.icon
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 头部骨架 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg bg-${config.color}-100 flex items-center justify-center`}>
              <Icon className={`w-6 h-6 text-${config.color}-600`} />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{config.title}</h1>
              <p className="text-sm text-gray-500 mb-2">{config.subtitle}</p>
              <p className="text-gray-600">{config.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-sm text-gray-600">加载中...</span>
            </div>
          </div>
        </div>

        {/* 内容骨架 */}
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

interface WorkshopPageProps {
  params: {
    workshopId: string
  }
}

// NOTE: Metadata generation removed because this is now a client component
// Dynamic metadata will be handled at runtime via document.title or similar

// NOTE: generateStaticParams() removed because this is now a client component
// The workshop routes will be handled dynamically

export default function WorkshopPage({ params }: WorkshopPageProps) {
  const workshopId = params.workshopId as WorkshopId
  const config = WORKSHOP_CONFIG[workshopId]
  const { user, isLoading } = useAuth()
  const searchParams = useSearchParams()

  // 获取URL参数
  const ideaTitle = searchParams.get('ideaTitle') || ''
  const ideaDescription = searchParams.get('ideaDescription') || ''
  const ideaId = searchParams.get('ideaId') || ''

  // Set document title dynamically for client-side component
  React.useEffect(() => {
    if (config) {
      document.title = `${config.title} - AI智能体市场`
    } else {
      document.title = '工作坊不存在 - AI智能体市场'
    }
  }, [config])

  // 如果工作坊不存在，返回404
  if (!config) {
    notFound()
  }

  // 所有工作坊使用统一的Dashboard布局
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* 未登录时的提示 - 立即显示 */}
          {!user && !isLoading && (
            <Card className="mb-4">
              <CardContent className="py-3 text-sm text-gray-600">
                当前以游客模式体验。<Link href="/auth/login" className="text-blue-600 underline">登录</Link> 后可云端保存进度。
              </CardContent>
            </Card>
          )}

          {/* 懒加载工作坊主要组件 */}
          <Suspense fallback={<WorkshopSkeleton config={config} />}>
            {workshopId === 'mvp-builder' ? (
              // MVP工作坊使用聊天式生成器
              <MVPBuilderConversational
                ideaId={ideaId}
                userId={user?.id || 'anonymous'}
              />
            ) : (
              // 其他工作坊使用通用Dashboard
              <WorkshopDashboard
                workshopId={workshopId}
                userId={user?.id || 'anonymous'}
              />
            )}
          </Suspense>
        </div>
      </div>
    </Layout>
  )
}