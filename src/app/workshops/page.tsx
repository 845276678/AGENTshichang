/**
 * 工作坊列表页面
 */

'use client'

import React from 'react'
import { Layout } from '@/components/layout'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Target,
  Rocket,
  TrendingUp,
  DollarSign,
  Clock,
  BarChart3,
  ArrowRight,
  Lightbulb
} from 'lucide-react'

const workshops = [
  {
    id: 'demand-validation',
    title: '需求验证实验室',
    description: '通过科学的方法验证您的商业想法是否有市场需求，降低创业风险',
    icon: Target,
    difficulty: '初级',
    estimatedTime: '45-60分钟',
    color: 'bg-blue-500',
    features: [
      '目标客户定义',
      '需求场景分析',
      '价值主张验证',
      '验证计划制定'
    ],
    stats: {
      completions: 1200,
      rating: 4.8
    }
  },
  {
    id: 'mvp-builder',
    title: 'MVP构建工作坊',
    description: '从想法到产品原型，学会构建最小可行产品（MVP）的核心方法',
    icon: Rocket,
    difficulty: '中级',
    estimatedTime: '60-90分钟',
    color: 'bg-green-500',
    features: [
      '核心功能定义',
      '用户故事梳理',
      '技术方案规划',
      'MVP原型设计'
    ],
    stats: {
      completions: 850,
      rating: 4.7
    }
  },
  {
    id: 'growth-hacking',
    title: '增长黑客训练营',
    description: '掌握增长黑客的核心策略，快速扩大用户基础和业务规模',
    icon: TrendingUp,
    difficulty: '高级',
    estimatedTime: '90-120分钟',
    color: 'bg-purple-500',
    features: [
      'AARRR漏斗分析',
      '增长实验设计',
      '渠道策略优化',
      '数据驱动决策'
    ],
    stats: {
      completions: 650,
      rating: 4.9
    }
  },
  {
    id: 'profit-model',
    title: '商业模式设计',
    description: '构建可持续盈利的商业模式，实现从创意到收益的转化',
    icon: DollarSign,
    difficulty: '高级',
    estimatedTime: '120-150分钟',
    color: 'bg-orange-500',
    features: [
      '商业画布设计',
      '收入模式构建',
      '成本结构优化',
      '盈利能力评估'
    ],
    stats: {
      completions: 420,
      rating: 4.6
    }
  }
]

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case '初级': return 'bg-green-100 text-green-800'
    case '中级': return 'bg-yellow-100 text-yellow-800'
    case '高级': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export default function WorkshopsPage() {
  // 设置页面标题
  React.useEffect(() => {
    document.title = '专业工作坊 - AI智能体市场'
  }, [])

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* 页面头部 */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center max-w-3xl mx-auto">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Lightbulb className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                专业工作坊
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                通过我们的专业工作坊，将您的创意转化为成功的商业项目
              </p>
              <div className="flex justify-center gap-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>超过3000+成功案例</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>平均完成时间90分钟</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 工作坊列表 */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {workshops.map((workshop) => {
              const IconComponent = workshop.icon
              return (
                <Card key={workshop.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 ${workshop.color} rounded-lg flex items-center justify-center`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl mb-2">{workshop.title}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getDifficultyColor(workshop.difficulty)}>
                              {workshop.difficulty}
                            </Badge>
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {workshop.estimatedTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-gray-600 leading-relaxed">
                      {workshop.description}
                    </p>

                    {/* 特色功能 */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">核心模块:</h4>
                      <div className="grid grid-cols-2 gap-1">
                        {workshop.features.map((feature, index) => (
                          <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 统计信息 */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{workshop.stats.completions}+ 完成</span>
                        <span>⭐ {workshop.stats.rating}/5.0</span>
                      </div>
                      <Link href={`/workshops/${workshop.id}`}>
                        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                          开始工作坊
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* 更多工作坊提示 */}
          <div className="text-center mt-16">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                更多工作坊即将推出
              </h3>
              <p className="text-gray-600 mb-6">
                我们正在开发更多专业工作坊，涵盖投资分析、团队管理、市场营销等领域
              </p>
              <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                订阅更新通知
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}