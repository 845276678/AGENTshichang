/**
 * 工作坊列表页面 (完全静态服务端组件)
 */

import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '专业工作坊 - AI智能体市场',
  description: '通过我们的专业工作坊，将您的创意转化为成功的商业项目',
}

const workshops = [
  {
    id: 'demand-validation',
    title: '需求验证实验室',
    description: '通过科学的方法验证您的商业想法是否有市场需求，降低创业风险',
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 简单的导航栏 */}
      <header className="sticky top-0 z-40 w-full border-b bg-white">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <div className="h-4 w-4 bg-white rounded-sm" />
            </div>
            <span className="font-bold text-lg">创意交易市场</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/marketplace" className="text-sm font-medium hover:text-blue-600">创意竞价</Link>
            <Link href="/workshops" className="text-sm font-medium text-blue-600">专业工作坊</Link>
            <Link href="/about" className="text-sm font-medium hover:text-blue-600">关于我们</Link>
          </nav>

          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* 页面头部 */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                💡
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
                📊
                <span>超过3000+成功案例</span>
              </div>
              <div className="flex items-center gap-2">
                ⏰
                <span>平均完成时间90分钟</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 工作坊列表 */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {workshops.map((workshop) => (
            <div key={workshop.id} className="bg-white rounded-lg border shadow-sm hover:shadow-lg transition-shadow duration-300">
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${workshop.color} rounded-lg flex items-center justify-center`}>
                      <span className="text-white text-lg">🎯</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{workshop.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getDifficultyColor(workshop.difficulty)}`}>
                          {workshop.difficulty}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          ⏰ {workshop.estimatedTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 space-y-4">
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
                  <Link
                    href={`/workshops/${workshop.id}`}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 border border-transparent rounded-md hover:from-blue-600 hover:to-purple-700"
                  >
                    开始工作坊 →
                  </Link>
                </div>
              </div>
            </div>
          ))}
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
            <button className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-md hover:bg-blue-50">
              订阅更新通知
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}