'use client'

import React from 'react'
import { Layout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Lightbulb,
  Plus,
  TrendingUp,
  Clock,
  DollarSign,
  ArrowRight,
  Sparkles,
  Target
} from 'lucide-react'

// 模拟创意数据
const sampleIdeas = [
  {
    id: '1',
    title: '智能家居语音控制系统',
    description: '基于AI的全屋智能语音控制方案，支持自然语言理解和多设备联动。',
    category: '科技创新',
    status: '竞价中',
    currentBid: 120,
    bidsCount: 5,
    timeLeft: '2小时23分',
    tags: ['AI', '物联网', '智能家居']
  },
  {
    id: '2',
    title: 'AR试衣间应用',
    description: '使用增强现实技术让用户在家就能试穿各种服装，提升在线购物体验。',
    category: '电商零售',
    status: '已完成',
    finalPrice: 280,
    bidsCount: 8,
    completedTime: '1天前',
    tags: ['AR', '电商', '时尚']
  },
  {
    id: '3',
    title: '健康饮食AI助手',
    description: '个性化的营养建议和餐饮计划，基于用户的健康数据和饮食偏好。',
    category: '健康医疗',
    status: '待竞价',
    estimatedValue: '待评估',
    timeLeft: '即将开始',
    tags: ['健康', 'AI', '营养']
  }
]

const categories = [
  { name: '全部', count: 24, active: true },
  { name: '科技创新', count: 8, active: false },
  { name: '电商零售', count: 6, active: false },
  { name: '健康医疗', count: 4, active: false },
  { name: '教育培训', count: 3, active: false },
  { name: '其他', count: 3, active: false }
]

const IdeaCard = ({ idea }: { idea: typeof sampleIdeas[0] }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case '竞价中': return 'bg-green-100 text-green-800'
      case '已完成': return 'bg-blue-100 text-blue-800'
      case '待竞价': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{idea.title}</CardTitle>
            <CardDescription className="line-clamp-2">
              {idea.description}
            </CardDescription>
          </div>
          <Badge variant="secondary" className={getStatusColor(idea.status)}>
            {idea.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* 标签 */}
          <div className="flex flex-wrap gap-1">
            {idea.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* 竞价信息 */}
          <div className="flex items-center justify-between text-sm">
            {idea.status === '竞价中' && (
              <>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-medium">{idea.currentBid} 积分</span>
                  <span className="text-gray-500">({idea.bidsCount} 出价)</span>
                </div>
                <div className="flex items-center gap-1 text-orange-600">
                  <Clock className="w-4 h-4" />
                  <span>{idea.timeLeft}</span>
                </div>
              </>
            )}

            {idea.status === '已完成' && (
              <>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">{idea.finalPrice} 积分</span>
                  <span className="text-gray-500">最终价格</span>
                </div>
                <div className="text-gray-500">{idea.completedTime}</div>
              </>
            )}

            {idea.status === '待竞价' && (
              <div className="text-gray-500">{idea.estimatedValue}</div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link href={`/ideas/${idea.id}`}>
                查看详情
              </Link>
            </Button>

            {idea.status === '竞价中' && (
              <Button size="sm" className="flex-1">
                立即出价
              </Button>
            )}

            {idea.status === '待竞价' && (
              <Button size="sm" className="flex-1">
                加入竞价
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function IdeasPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* 页面头部 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Lightbulb className="w-8 h-8 text-yellow-500" />
                  创意竞价市场
                </h1>
                <p className="text-gray-600 mt-2">
                  发现优质创意，参与智能竞价，获得专业的商业化建议
                </p>
              </div>

              <Button size="lg" className="hidden md:flex" asChild>
                <Link href="/ideas/submit">
                  <Plus className="w-5 h-5 mr-2" />
                  提交创意
                </Link>
              </Button>
            </div>

            {/* 统计信息 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <Sparkles className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                  <div className="text-2xl font-bold">24</div>
                  <div className="text-sm text-gray-600">活跃创意</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold">8</div>
                  <div className="text-sm text-gray-600">竞价中</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Target className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold">156</div>
                  <div className="text-sm text-gray-600">总出价数</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <DollarSign className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                  <div className="text-2xl font-bold">1.2k</div>
                  <div className="text-sm text-gray-600">积分流通</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 分类筛选 */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Button
                  key={category.name}
                  variant={category.active ? "default" : "outline"}
                  size="sm"
                  className="rounded-full"
                >
                  {category.name}
                  <Badge variant="secondary" className="ml-2">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          {/* 创意列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {sampleIdeas.map(idea => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>

          {/* 快速行动区域 */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-none">
            <CardContent className="p-8 text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-500" />
              <h3 className="text-2xl font-bold mb-2">准备提交您的创意吗？</h3>
              <p className="text-gray-600 mb-6">
                让AI专家为您的创意竞价，获得专业的商业化建议和实现方案
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/ideas/submit">
                    <Plus className="w-5 h-5 mr-2" />
                    提交新创意
                  </Link>
                </Button>

                <Button size="lg" variant="outline" asChild>
                  <Link href="/marketplace">
                    查看成功案例
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 移动端提交按钮 */}
          <div className="md:hidden fixed bottom-6 right-6">
            <Button size="lg" className="rounded-full shadow-lg" asChild>
              <Link href="/ideas/submit">
                <Plus className="w-6 h-6" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  )
}