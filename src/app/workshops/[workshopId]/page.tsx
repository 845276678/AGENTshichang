/**
 * 工作坊动态页面
 *
 * 支持的工作坊类型：
 * - demand-validation: 需求验证实验室
 * - mvp-builder: MVP构建工作坊
 * - growth-hacking: 增长黑客训练营
 * - profit-model: 商业模式设计
 */

'use client'

import React from 'react'

import { notFound } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import WorkshopDashboard from '@/components/workshop/WorkshopDashboard'
import { type WorkshopId } from '@/hooks/useWorkshopSession'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, LogIn } from 'lucide-react'
import Link from 'next/link'

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

// NOTE: Metadata generation removed because this is now a client component
// Dynamic metadata will be handled at runtime via document.title or similar

// NOTE: generateStaticParams() removed because this is now a client component
// The workshop routes will be handled dynamically

export default function WorkshopPage({ params }: WorkshopPageProps) {
  const workshopId = params.workshopId as WorkshopId
  const config = WORKSHOP_CONFIG[workshopId]
  const { user, isLoading } = useAuth()

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

  // 加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">正在验证用户身份...</p>
        </div>
      </div>
    )
  }

  // 未登录状态
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">需要登录</h2>
            <p className="text-gray-600 mb-6">
              请先登录您的账户以访问{config.title}
            </p>
            <div className="space-y-3">
              <Link href="/auth/login">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  立即登录
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="outline" className="w-full">
                  注册新账户
                </Button>
              </Link>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              登录后即可使用所有工作坊功能
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <WorkshopDashboard
          workshopId={workshopId}
          userId={user.id}
        />
      </div>
    </div>
  )
}