'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Layout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AnimatedSection } from '@/components/ui'
import { Input } from '@/components/ui/input'
import {
  Search,
  Sparkles,
  Brain,
  Palette,
  Target,
  Heart,
  BookOpen,
  Gamepad2,
  TreePine,
  Puzzle,
  TrendingUp,
  Users,
  ArrowRight,
  Grid3X3,
  List
} from 'lucide-react'

const categories = [
  {
    id: 'tech-innovation',
    name: '科技创新',
    icon: Brain,
    color: 'from-blue-500 to-cyan-500',
    description: '前沿技术与创新应用',
    ideaCount: 342,
    avgPrice: 450,
    topTags: ['AI技术', '区块链', '物联网', '机器学习'],
    recentIdeas: [
      { title: '智能家居语音控制系统', bidCount: 5, highestBid: 350 },
      { title: 'AI辅助医疗诊断平台', bidCount: 8, highestBid: 520 },
      { title: '区块链供应链追溯', bidCount: 3, highestBid: 280 }
    ]
  },
  {
    id: 'creative-arts',
    name: '文艺创作',
    icon: Palette,
    color: 'from-purple-500 to-pink-500',
    description: '艺术创作与文化表达',
    ideaCount: 278,
    avgPrice: 320,
    topTags: ['诗歌文学', '艺术创作', '情感故事', '文化传承'],
    recentIdeas: [
      { title: '城市回忆录文化传承项目', bidCount: 4, highestBid: 280 },
      { title: '互动式数字艺术展览', bidCount: 6, highestBid: 380 },
      { title: '原创音乐创作平台', bidCount: 7, highestBid: 420 }
    ]
  },
  {
    id: 'business-strategy',
    name: '商业策略',
    icon: Target,
    color: 'from-green-500 to-emerald-500',
    description: '商业模式与策略创新',
    ideaCount: 195,
    avgPrice: 580,
    topTags: ['商业模式', '市场营销', '盈利方案', '运营优化'],
    recentIdeas: [
      { title: '新零售O2O解决方案', bidCount: 9, highestBid: 650 },
      { title: '订阅制服务创新模式', bidCount: 5, highestBid: 480 },
      { title: '社交电商运营策略', bidCount: 6, highestBid: 520 }
    ]
  },
  {
    id: 'life-creativity',
    name: '生活创意',
    icon: Heart,
    color: 'from-red-500 to-orange-500',
    description: '日常生活改善方案',
    ideaCount: 156,
    avgPrice: 280,
    topTags: ['生活方式', '健康养生', '家居设计', '美食文化'],
    recentIdeas: [
      { title: '智能健康管理助手', bidCount: 4, highestBid: 320 },
      { title: '个性化营养搭配方案', bidCount: 3, highestBid: 250 },
      { title: '家庭园艺智能化', bidCount: 5, highestBid: 300 }
    ]
  },
  {
    id: 'education',
    name: '教育方案',
    icon: BookOpen,
    color: 'from-indigo-500 to-blue-500',
    description: '教育创新与学习方法',
    ideaCount: 198,
    avgPrice: 380,
    topTags: ['在线教育', '学习方法', '技能培训', '知识管理'],
    recentIdeas: [
      { title: 'VR沉浸式历史教学', bidCount: 6, highestBid: 450 },
      { title: '个性化学习路径系统', bidCount: 7, highestBid: 520 },
      { title: '技能交换学习平台', bidCount: 4, highestBid: 350 }
    ]
  },
  {
    id: 'entertainment',
    name: '娱乐内容',
    icon: Gamepad2,
    color: 'from-yellow-500 to-amber-500',
    description: '娱乐体验与内容创作',
    ideaCount: 167,
    avgPrice: 350,
    topTags: ['游戏创新', '影视内容', '互动娱乐', '数字媒体'],
    recentIdeas: [
      { title: '多人在线剧本杀平台', bidCount: 8, highestBid: 480 },
      { title: '短视频创作工具', bidCount: 5, highestBid: 380 },
      { title: '虚拟偶像互动系统', bidCount: 6, highestBid: 420 }
    ]
  },
  {
    id: 'social-welfare',
    name: '社会公益',
    icon: TreePine,
    color: 'from-green-600 to-teal-500',
    description: '社会责任与公益创新',
    ideaCount: 89,
    avgPrice: 320,
    topTags: ['环保公益', '社区服务', '助老扶弱', '教育扶贫'],
    recentIdeas: [
      { title: '社区志愿服务匹配平台', bidCount: 3, highestBid: 280 },
      { title: '环保行为激励系统', bidCount: 4, highestBid: 350 },
      { title: '老年人数字助手', bidCount: 5, highestBid: 380 }
    ]
  },
  {
    id: 'other',
    name: '其他创意',
    icon: Puzzle,
    color: 'from-gray-500 to-slate-500',
    description: '不拘一格的奇思妙想',
    ideaCount: 234,
    avgPrice: 290,
    topTags: ['跨界创新', '概念设计', '未来科技', '奇思妙想'],
    recentIdeas: [
      { title: '时间胶囊数字化服务', bidCount: 4, highestBid: 320 },
      { title: '情感AI陪伴机器人', bidCount: 6, highestBid: 450 },
      { title: '梦境记录与分析平台', bidCount: 3, highestBid: 280 }
    ]
  }
]

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [_selectedCategory] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.topTags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <Layout>
      <div className="container py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Sparkles className="w-4 h-4 mr-2" />
            创意分类浏览
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            探索创意分类
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            发现各个领域的创意想法，找到最符合您兴趣和专长的创意方向
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索创意分类、标签或关键词..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {categories.reduce((sum, cat) => sum + cat.ideaCount, 0)}
              </div>
              <div className="text-sm text-muted-foreground">总创意数</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {categories.length}
              </div>
              <div className="text-sm text-muted-foreground">创意分类</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {Math.round(categories.reduce((sum, cat) => sum + cat.avgPrice, 0) / categories.length)}
              </div>
              <div className="text-sm text-muted-foreground">平均积分</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                87.3%
              </div>
              <div className="text-sm text-muted-foreground">成功率</div>
            </CardContent>
          </Card>
        </div>

        {/* Categories Grid/List */}
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {filteredCategories.map((category, index) => {
            const Icon = category.icon
            return (
              <AnimatedSection key={category.id} delay={0.1 + index * 0.05}>
                <Card className="group cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <motion.div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                          whileHover={{ rotate: 5 }}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </motion.div>
                        <div>
                          <CardTitle className="group-hover:text-primary transition-colors">
                            {category.name}
                          </CardTitle>
                          <CardDescription>
                            {category.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {category.ideaCount}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Stats */}
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span>平均 {category.avgPrice} 积分</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span>{category.ideaCount} 个创意</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {category.topTags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {category.topTags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{category.topTags.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Recent Ideas */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium">热门创意</div>
                      {category.recentIdeas.slice(0, 2).map((idea, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs bg-secondary/20 rounded p-2">
                          <span className="flex-1 truncate">{idea.title}</span>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span>{idea.bidCount}竞价</span>
                            <span className="font-medium text-primary">{idea.highestBid}积分</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button className="w-full group" asChild>
                      <a href={`/categories/${category.id}`}>
                        浏览该分类
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </AnimatedSection>
            )
          })}
        </div>

        {/* No Results */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">未找到相关分类</h3>
            <p className="text-muted-foreground mb-4">
              尝试使用不同的关键词搜索，或浏览所有分类
            </p>
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              清除搜索条件
            </Button>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16">
          <Card className="bg-gradient-to-br from-primary/10 via-agent-500/10 to-purple-500/10 border-0">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">没找到合适的分类？</h3>
              <p className="text-muted-foreground mb-6">
                您的创意可能是全新的领域！直接提交您的想法，让AI竞价师来评估其价值
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <a href="/ideas/submit">
                    <Sparkles className="mr-2 h-4 w-4" />
                    提交创意想法
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="/marketplace">
                    浏览竞价市场
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}