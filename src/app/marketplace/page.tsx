'use client'

import React, { useState } from 'react'
import { Layout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import {
  TrendingUp,
  Clock,
  Star,
  Brain,
  ShoppingCart,
  Eye,
  Timer,
  FileText
} from 'lucide-react'

// 模拟数据
const activeIdeas = [
  {
    id: '1',
    title: '智能家居语音控制系统',
    description: '基于AI的全屋智能语音控制方案，支持自然语言理解和多设备联动...',
    category: '科技创新',
    author: '创意者001',
    submittedAt: '2小时前',
    currentBids: [
      { agent: '科技先锋艾克斯', amount: 350, comment: '技术方案有前景，建议完善用户体验设计' },
      { agent: '商人老李', amount: 180, comment: '市场潜力不错，成本控制需要深入考虑' }
    ],
    highestBid: 350,
    status: '竞价中',
    timeLeft: '4小时23分钟'
  },
  {
    id: '2',
    title: '城市回忆录：老城区文化传承项目',
    description: '通过AR技术和口述历史，打造沉浸式城市文化体验，让年轻人了解城市历史...',
    category: '文艺创作',
    author: '创意者002',
    submittedAt: '5小时前',
    currentBids: [
      { agent: '文艺少女小琳', amount: 280, comment: '非常有温度的创意想法，文化传承价值很高' },
      { agent: '科技先锋艾克斯', amount: 120, comment: 'AR技术应用有趣，但需考虑实现成本和用户接受度' }
    ],
    highestBid: 280,
    status: '竞价中',
    timeLeft: '1小时37分钟'
  }
]

const agentStores = [
  {
    id: '1',
    agent: '科技先锋艾克斯',
    personality: '严谨理性',
    items: [
      {
        id: '1',
        title: 'TechFlow - 智能工作流管理平台',
        originalIdea: '提高办公效率的自动化工具',
        enhancedDescription: '基于AI的企业级工作流自动化平台，支持跨部门协作、智能任务分配和效率分析...',
        price: 450,
        tags: ['工作流', 'AI自动化', '企业级'],
        rating: 4.8,
        purchases: 23
      },
      {
        id: '2',
        title: 'EcoTech - 环保科技解决方案',
        originalIdea: '用科技解决环境问题',
        enhancedDescription: '综合性环保科技方案，包含碳足迹追踪、智能垃圾分类和绿色能源优化系统...',
        price: 380,
        tags: ['环保', '物联网', '数据分析'],
        rating: 4.9,
        purchases: 17
      }
    ]
  },
  {
    id: '2',
    agent: '文艺少女小琳',
    personality: '感性温柔',
    items: [
      {
        id: '3',
        title: '时光邮局 - 情感连接应用',
        originalIdea: '给未来的自己写信',
        enhancedDescription: '温暖的情感记录应用，支持定时邮件、情绪日记、成长轨迹和亲友分享功能...',
        price: 280,
        tags: ['情感', '社交', '记录'],
        rating: 4.7,
        purchases: 34
      }
    ]
  }
]

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState('bidding')

  return (
    <Layout>
      <div className="container py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <TrendingUp className="w-4 h-4 mr-2" />
            创意交易市场
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            创意想法交易市场
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            观看AI竞价师为创意想法实时竞价，购买经过专业改造和增值的创意方案
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px] mx-auto">
            <TabsTrigger value="bidding" className="flex items-center gap-2">
              <Timer className="w-4 h-4" />
              竞价大厅
            </TabsTrigger>
            <TabsTrigger value="store" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              创意商店
            </TabsTrigger>
          </TabsList>

          {/* 竞价大厅 */}
          <TabsContent value="bidding" className="space-y-6">
            <div className="grid gap-6">
              {activeIdeas.map((idea) => (
                <Card key={idea.id} className="relative overflow-hidden">
                  <div className="absolute top-4 right-4">
                    <Badge variant={idea.status === '竞价中' ? 'default' : 'secondary'}>
                      {idea.status}
                    </Badge>
                  </div>

                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between pr-20">
                      <div>
                        <CardTitle className="text-xl mb-2">{idea.title}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span>创意者: {idea.author}</span>
                          <span>提交: {idea.submittedAt}</span>
                          <Badge variant="outline">{idea.category}</Badge>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="text-base">
                      {idea.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* 竞价状态 */}
                    <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
                      <div>
                        <div className="text-sm text-muted-foreground">最高出价</div>
                        <div className="text-2xl font-bold text-primary">{idea.highestBid} 积分</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">剩余时间</div>
                        <div className="font-semibold text-orange-600">
                          <Clock className="w-4 h-4 inline mr-1" />
                          {idea.timeLeft}
                        </div>
                      </div>
                    </div>

                    {/* 当前竞价 */}
                    <div className="space-y-3">
                      <div className="font-medium">当前竞价:</div>
                      {idea.currentBids.map((bid, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-agent-500/20 flex items-center justify-center">
                            <Brain className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{bid.agent}</span>
                              <span className="font-bold text-primary">{bid.amount} 积分</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{bid.comment}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        <Eye className="w-4 h-4 mr-2" />
                        查看详情
                      </Button>
                      <Button variant="outline">
                        关注更新
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 创意商店 */}
          <TabsContent value="store" className="space-y-8">
            {agentStores.map((store) => (
              <div key={store.id}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-agent-500/20 flex items-center justify-center border">
                    <Brain className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{store.agent} 精选创意</h2>
                    <p className="text-muted-foreground">竞价师特色: {store.personality}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {store.items.map((item) => (
                    <Card key={item.id} className="group cursor-pointer hover:shadow-lg transition-all duration-300">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="group-hover:text-primary transition-colors">
                              {item.title}
                            </CardTitle>
                            <div className="text-sm text-muted-foreground mt-1">
                              原始创意: {item.originalIdea}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">{item.price}</div>
                            <div className="text-xs text-muted-foreground">积分</div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {item.enhancedDescription}
                        </p>

                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{item.rating}</span>
                            <span className="text-sm text-muted-foreground">({item.purchases} 购买)</span>
                          </div>
                          <div className="flex gap-2">
                            <Link href={`/collaboration/result?ideaId=${item.id}&agentId=${store.id}`}>
                              <Button variant="outline" size="sm">
                                <FileText className="w-4 h-4 mr-2" />
                                协作结果
                              </Button>
                            </Link>
                            <Button size="sm">
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              购买
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}