'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Layout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge, AnimatedSection } from '@/components/ui'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  TrendingUp,
  DollarSign,
  Eye,
  Heart,
  _Brain,
  Lightbulb,
  Award,
  Users,
  _Calendar,
  Download,
  _Star,
  _Clock,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUpRight,
  _ArrowDownRight,
  Plus,
  Filter,
  Search,
  ExternalLink
} from 'lucide-react'

interface EarningsData {
  period: string
  amount: number
  source: string
  type: 'original' | 'royalty' | 'bonus'
  ideaTitle: string
  status: 'completed' | 'pending'
}

interface IdeaPerformance {
  id: string
  title: string
  category: string
  submittedAt: string
  status: 'bidding' | 'enhancing' | 'selling' | 'completed'
  originalPrice: number
  enhancedPrice: number
  totalEarnings: number
  views: number
  likes: number
  purchases: number
  aiAgent: string
}

interface UserStats {
  totalEarnings: number
  monthlyEarnings: number
  totalIdeas: number
  activeIdeas: number
  successRate: number
  avgValueIncrease: string
  totalViews: number
  totalLikes: number
  memberLevel: string
  nextLevelPoints: number
  currentPoints: number
}

const mockUserStats: UserStats = {
  totalEarnings: 12450,
  monthlyEarnings: 2380,
  totalIdeas: 15,
  activeIdeas: 4,
  successRate: 87.3,
  avgValueIncrease: '6.8倍',
  totalViews: 3420,
  totalLikes: 892,
  memberLevel: '钻石会员',
  nextLevelPoints: 15000,
  currentPoints: 12450
}

const mockEarnings: EarningsData[] = [
  {
    period: '2024-01-15',
    amount: 380,
    source: 'AI竞价',
    type: 'original',
    ideaTitle: '智能冰箱食材管理助手',
    status: 'completed'
  },
  {
    period: '2024-01-16',
    amount: 320,
    source: '销售分成',
    type: 'royalty',
    ideaTitle: '智能冰箱食材管理助手',
    status: 'completed'
  },
  {
    period: '2024-01-14',
    amount: 520,
    source: 'AI竞价',
    type: 'original',
    ideaTitle: 'AI个人健身教练系统',
    status: 'completed'
  },
  {
    period: '2024-01-13',
    amount: 180,
    source: '销售分成',
    type: 'royalty',
    ideaTitle: '智能垃圾分类助手',
    status: 'pending'
  },
  {
    period: '2024-01-12',
    amount: 450,
    source: 'AI竞价',
    type: 'original',
    ideaTitle: '社区邻里互助平台',
    status: 'completed'
  }
]

const mockIdeasPerformance: IdeaPerformance[] = [
  {
    id: '1',
    title: '智能冰箱食材管理助手',
    category: '生活创意',
    submittedAt: '2024-01-15',
    status: 'completed',
    originalPrice: 380,
    enhancedPrice: 3200,
    totalEarnings: 700,
    views: 128,
    likes: 23,
    purchases: 15,
    aiAgent: 'BizMaster AI'
  },
  {
    id: '2',
    title: 'AI个人健身教练系统',
    category: '健康科技',
    submittedAt: '2024-01-14',
    status: 'selling',
    originalPrice: 520,
    enhancedPrice: 4200,
    totalEarnings: 520,
    views: 95,
    likes: 18,
    purchases: 8,
    aiAgent: 'HealthTech AI'
  },
  {
    id: '3',
    title: '智能垃圾分类助手',
    category: '环保科技',
    submittedAt: '2024-01-13',
    status: 'enhancing',
    originalPrice: 280,
    enhancedPrice: 0,
    totalEarnings: 280,
    views: 76,
    likes: 12,
    purchases: 0,
    aiAgent: 'EcoSmart AI'
  },
  {
    id: '4',
    title: '社区邻里互助平台',
    category: '社会公益',
    submittedAt: '2024-01-12',
    status: 'bidding',
    originalPrice: 0,
    enhancedPrice: 0,
    totalEarnings: 0,
    views: 45,
    likes: 8,
    purchases: 0,
    aiAgent: ''
  }
]

export default function EarningsTrackingPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [activeTab, setActiveTab] = useState('overview')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'selling': return 'bg-blue-500'
      case 'enhancing': return 'bg-yellow-500'
      case 'bidding': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '已完成'
      case 'selling': return '销售中'
      case 'enhancing': return '完善中'
      case 'bidding': return '竞价中'
      default: return '未知'
    }
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* 页头 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">创意收益追踪</h1>
            <p className="text-muted-foreground mt-1">追踪您的创意表现和收益情况</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              导出报告
            </Button>
            <Button asChild>
              <a href="/ideas/submit">
                <Plus className="w-4 h-4 mr-2" />
                提交新创意
              </a>
            </Button>
          </div>
        </div>

        {/* 关键指标卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AnimatedSection>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总收益</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockUserStats.totalEarnings.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    +12.5%
                  </span>
                  比上月
                </p>
              </CardContent>
            </Card>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">本月收益</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockUserStats.monthlyEarnings.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    +8.2%
                  </span>
                  比上月
                </p>
              </CardContent>
            </Card>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">创意总数</CardTitle>
                <Lightbulb className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockUserStats.totalIdeas}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-blue-600">{mockUserStats.activeIdeas} 个活跃</span>
                </p>
              </CardContent>
            </Card>
          </AnimatedSection>

          <AnimatedSection delay={0.3}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">成功率</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockUserStats.successRate}%</div>
                <p className="text-xs text-muted-foreground">
                  平均增值 {mockUserStats.avgValueIncrease}
                </p>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>

        {/* 会员等级进度 */}
        <AnimatedSection delay={0.4}>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                会员等级
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Badge variant="default" className="bg-gradient-to-r from-yellow-500 to-orange-500">
                    {mockUserStats.memberLevel}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    当前积分: {mockUserStats.currentPoints.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">下一等级还需</div>
                  <div className="font-bold">
                    {(mockUserStats.nextLevelPoints - mockUserStats.currentPoints).toLocaleString()} 积分
                  </div>
                </div>
              </div>
              <Progress
                value={(mockUserStats.currentPoints / mockUserStats.nextLevelPoints) * 100}
                className="h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>当前等级</span>
                <span>下一等级</span>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* 主要内容区域 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">总览</TabsTrigger>
            <TabsTrigger value="ideas">我的创意</TabsTrigger>
            <TabsTrigger value="earnings">收益明细</TabsTrigger>
            <TabsTrigger value="analytics">数据分析</TabsTrigger>
          </TabsList>

          {/* 总览标签页 */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 最近收益趋势 */}
              <AnimatedSection>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="w-5 h-5 text-blue-500" />
                      收益趋势
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">收益趋势图表</p>
                        <p className="text-xs text-muted-foreground">近30天呈上升趋势</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>

              {/* 创意表现概览 */}
              <AnimatedSection delay={0.1}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-green-500" />
                      创意分布
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { category: '生活创意', count: 5, color: 'bg-blue-500' },
                        { category: '科技创新', count: 4, color: 'bg-green-500' },
                        { category: '社会公益', count: 3, color: 'bg-yellow-500' },
                        { category: '其他', count: 3, color: 'bg-purple-500' }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded ${item.color}`} />
                            <span className="text-sm">{item.category}</span>
                          </div>
                          <span className="text-sm font-medium">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>

            {/* 最新动态 */}
            <AnimatedSection delay={0.2}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-orange-500" />
                    最新动态
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        time: '2小时前',
                        content: 'BizMaster AI 完成了"智能冰箱食材管理助手"的增值优化',
                        type: 'success'
                      },
                      {
                        time: '5小时前',
                        content: '您的创意"AI个人健身教练系统"获得新的购买',
                        type: 'info'
                      },
                      {
                        time: '1天前',
                        content: 'EcoSmart AI 开始完善"智能垃圾分类助手"',
                        type: 'warning'
                      },
                      {
                        time: '2天前',
                        content: '您提交的"社区邻里互助平台"开始竞价',
                        type: 'info'
                      }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          activity.type === 'success' ? 'bg-green-500' :
                          activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm">{activity.content}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          </TabsContent>

          {/* 我的创意标签页 */}
          <TabsContent value="ideas" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <input
                    placeholder="搜索创意..."
                    className="pl-10 pr-4 py-2 border rounded-lg w-64"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  筛选
                </Button>
              </div>
              <Badge variant="secondary">{mockIdeasPerformance.length} 个创意</Badge>
            </div>

            <div className="space-y-4">
              {mockIdeasPerformance.map((idea, index) => (
                <AnimatedSection key={idea.id} delay={index * 0.1}>
                  <Card className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{idea.category}</Badge>
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(idea.status)}`} />
                            <span className="text-sm text-muted-foreground">{getStatusText(idea.status)}</span>
                          </div>
                          <h3 className="font-semibold text-lg mb-2">{idea.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                            <span>提交于 {idea.submittedAt}</span>
                            {idea.aiAgent && (
                              <>
                                <span>•</span>
                                <span>由 {idea.aiAgent} 完善</span>
                              </>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">浏览量</div>
                              <div className="font-medium flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {idea.views}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">点赞数</div>
                              <div className="font-medium flex items-center gap-1">
                                <Heart className="w-4 h-4" />
                                {idea.likes}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">购买量</div>
                              <div className="font-medium flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {idea.purchases}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary mb-1">
                            {idea.totalEarnings.toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">积分收益</div>
                          {idea.enhancedPrice > 0 && (
                            <Badge variant="outline" className="text-xs">
                              增值 {(idea.enhancedPrice / idea.originalPrice).toFixed(1)}倍
                            </Badge>
                          )}
                          <div className="mt-3">
                            <Button variant="outline" size="sm" asChild>
                              <a href={`/ideas/${idea.id}`}>
                                <ExternalLink className="w-3 h-3 mr-1" />
                                查看详情
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              ))}
            </div>
          </TabsContent>

          {/* 收益明细标签页 */}
          <TabsContent value="earnings" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">收益明细</h3>
              <div className="flex gap-2">
                {['7d', '30d', '3m', '1y'].map((period) => (
                  <Button
                    key={period}
                    variant={selectedPeriod === period ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPeriod(period)}
                  >
                    {period === '7d' ? '7天' : period === '30d' ? '30天' : period === '3m' ? '3个月' : '1年'}
                  </Button>
                ))}
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="p-4 text-left">日期</th>
                        <th className="p-4 text-left">创意</th>
                        <th className="p-4 text-left">收益类型</th>
                        <th className="p-4 text-right">金额</th>
                        <th className="p-4 text-center">状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockEarnings.map((earning, index) => (
                        <motion.tr
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-t hover:bg-muted/20"
                        >
                          <td className="p-4">{earning.period}</td>
                          <td className="p-4">{earning.ideaTitle}</td>
                          <td className="p-4">
                            <Badge variant={earning.type === 'original' ? 'default' : 'secondary'}>
                              {earning.source}
                            </Badge>
                          </td>
                          <td className="p-4 text-right font-medium">
                            +{earning.amount.toLocaleString()} 积分
                          </td>
                          <td className="p-4 text-center">
                            <Badge variant={earning.status === 'completed' ? 'default' : 'secondary'}>
                              {earning.status === 'completed' ? '已到账' : '处理中'}
                            </Badge>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 数据分析标签页 */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>月度收益对比</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
                    <div className="text-center">
                      <LineChart className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <p className="text-muted-foreground">月度收益趋势图</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>创意表现分析</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                    <div className="text-center">
                      <PieChart className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                      <p className="text-muted-foreground">创意类别分析</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}