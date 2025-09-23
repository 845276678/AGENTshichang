'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Layout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge, AnimatedSection } from '@/components/ui'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Search,
  Brain,
  Palette,
  _Target,
  _Heart,
  _BookOpen,
  _Gamepad2,
  _TreePine,
  _Puzzle,
  _TrendingUp,
  _Star,
  _Clock,
  _Users,
  Eye,
  ArrowLeft,
  _Filter,
  _SortAsc,
  Timer
} from 'lucide-react'

interface CategoryPageProps {
  params: {
    id: string
  }
}

// 模拟数据
const categoryData: Record<string, any> = {
  'tech-innovation': {
    name: '科技创新',
    icon: Brain,
    color: 'from-blue-500 to-cyan-500',
    description: '前沿技术与创新应用，探索未来科技的无限可能',
    totalIdeas: 342,
    avgPrice: 450,
    tags: ['AI技术', '区块链', '物联网', '机器学习', '大数据', '云计算', '虚拟现实', '增强现实']
  },
  'creative-arts': {
    name: '文艺创作',
    icon: Palette,
    color: 'from-purple-500 to-pink-500',
    description: '艺术创作与文化表达，用创意点亮生活的美好',
    totalIdeas: 278,
    avgPrice: 320,
    tags: ['诗歌文学', '艺术创作', '情感故事', '文化传承', '音乐创作', '视觉艺术', '表演艺术', '数字艺术']
  }
}

const mockIdeas = [
  {
    id: '1',
    title: '智能家居语音控制系统',
    description: '基于AI的全屋智能语音控制方案，支持自然语言理解和多设备联动，让家变得更智能更便捷...',
    author: '创意者001',
    submittedAt: '2小时前',
    category: '科技创新',
    tags: ['AI技术', '智能家居', '语音识别'],
    currentBids: 5,
    highestBid: 350,
    status: '竞价中',
    timeLeft: '4小时23分钟',
    views: 128
  },
  {
    id: '2',
    title: '城市回忆录：AR历史重现',
    description: '通过AR技术和口述历史，打造沉浸式城市文化体验，让年轻人了解城市历史变迁...',
    author: '创意者002',
    submittedAt: '5小时前',
    category: '文艺创作',
    tags: ['AR技术', '文化传承', '历史教育'],
    currentBids: 4,
    highestBid: 280,
    status: '竞价中',
    timeLeft: '1小时37分钟',
    views: 95
  },
  {
    id: '3',
    title: 'AI辅助个性化学习系统',
    description: '基于学习者特征和认知模式的个性化教育平台，提供定制化学习路径和智能推荐...',
    author: '创意者003',
    submittedAt: '1天前',
    category: '教育方案',
    tags: ['AI教育', '个性化学习', '认知科学'],
    currentBids: 7,
    highestBid: 520,
    status: '已完成',
    timeLeft: '',
    views: 203
  }
]

export default function CategoryDetailPage({ params }: CategoryPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('latest')
  const [filterStatus, setFilterStatus] = useState('all')

  const categoryId = params.id
  const category = categoryData[categoryId] || categoryData['tech-innovation']
  const Icon = category.icon

  const filteredIdeas = mockIdeas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         idea.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'active' && idea.status === '竞价中') ||
                         (filterStatus === 'completed' && idea.status === '已完成')
    return matchesSearch && matchesStatus
  })

  return (
    <Layout>
      <div className="container py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Button variant="ghost" size="sm" asChild>
            <a href="/categories" className="flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              返回分类
            </a>
          </Button>
          <span className="text-muted-foreground">/</span>
          <span>{category.name}</span>
        </div>

        {/* Category Header */}
        <div className="mb-8">
          <div className="flex items-start gap-4 mb-6">
            <motion.div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center`}
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <Icon className="w-8 h-8 text-white" />
            </motion.div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {category.name}
              </h1>
              <p className="text-xl text-muted-foreground mb-4">
                {category.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {category.tags.slice(0, 6).map((tag: string) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
                {category.tags.length > 6 && (
                  <Badge variant="outline">
                    +{category.tags.length - 6}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{category.totalIdeas}</div>
                <div className="text-sm text-muted-foreground">创意总数</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{category.avgPrice}</div>
                <div className="text-sm text-muted-foreground">平均积分</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">24</div>
                <div className="text-sm text-muted-foreground">活跃竞价</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">89%</div>
                <div className="text-sm text-muted-foreground">成功率</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索该分类下的创意..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="latest">最新发布</option>
              <option value="highest-bid">最高出价</option>
              <option value="most-bids">最多竞价</option>
              <option value="ending-soon">即将结束</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">全部状态</option>
              <option value="active">竞价中</option>
              <option value="completed">已完成</option>
            </select>
          </div>
        </div>

        {/* Ideas List */}
        <div className="space-y-6">
          {filteredIdeas.map((idea) => (
            <AnimatedSection key={idea.id}>
              <Card className="hover:shadow-lg transition-all duration-300">
                <div className="absolute top-4 right-4">
                  <Badge variant={idea.status === '竞价中' ? 'default' : 'secondary'}>
                    {idea.status}
                  </Badge>
                </div>

                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between pr-20">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2 hover:text-primary transition-colors cursor-pointer">
                        {idea.title}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <span>创意者: {idea.author}</span>
                        <span>发布: {idea.submittedAt}</span>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{idea.views}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mb-2">
                        {idea.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-base">
                    {idea.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Bidding Info */}
                  <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
                    <div className="flex items-center gap-6">
                      <div>
                        <div className="text-sm text-muted-foreground">当前竞价</div>
                        <div className="text-lg font-bold text-primary">{idea.currentBids} 次</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">最高出价</div>
                        <div className="text-xl font-bold text-primary">{idea.highestBid} 积分</div>
                      </div>
                    </div>
                    {idea.timeLeft && (
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">剩余时间</div>
                        <div className="font-semibold text-orange-600 flex items-center gap-1">
                          <Timer className="w-4 h-4" />
                          {idea.timeLeft}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      查看详情
                    </Button>
                    {idea.status === '竞价中' && (
                      <Button variant="outline">
                        关注竞价
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>

        {/* No Results */}
        {filteredIdeas.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">暂无相关创意</h3>
            <p className="text-muted-foreground mb-4">
              该分类下暂时没有符合条件的创意，尝试调整搜索条件或成为第一个在此分类提交创意的人
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => {
                setSearchQuery('')
                setFilterStatus('all')
              }}>
                清除筛选条件
              </Button>
              <Button asChild>
                <a href="/ideas/submit">
                  提交创意
                </a>
              </Button>
            </div>
          </div>
        )}

        {/* Pagination would go here */}
        <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            <Button variant="outline" disabled>上一页</Button>
            <Button variant="outline" className="bg-primary text-primary-foreground">1</Button>
            <Button variant="outline">2</Button>
            <Button variant="outline">3</Button>
            <Button variant="outline">下一页</Button>
          </div>
        </div>
      </div>
    </Layout>
  )
}