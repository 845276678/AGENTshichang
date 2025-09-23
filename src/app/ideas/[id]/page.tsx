'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams } from 'next/navigation'
import { Layout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge, AnimatedSection } from '@/components/ui'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Brain,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Star,
  TrendingUp,
  Users,
  Zap,
  Timer,
  Award,
  Target,
  Lightbulb,
  Rocket,
  DollarSign,
  Activity
} from 'lucide-react'

interface AIAgent {
  id: string
  name: string
  avatar: string
  expertise: string[]
  currentBid: number
  confidence: number
  status: 'bidding' | 'analyzing' | 'waiting'
  timeLeft: string
  aiType: 'tech' | 'business' | 'design' | 'data'
}

interface IdeaDetail {
  id: string
  title: string
  description: string
  category: string
  author: string
  authorAvatar: string
  submittedAt: string
  tags: string[]
  status: 'bidding' | 'analyzing' | 'completed'
  currentBids: number
  highestBid: number
  timeLeft: string
  views: number
  likes: number
  aiScore: number
  estimatedValue: string
  complexity: number
  marketPotential: number
}

const mockIdea: IdeaDetail = {
  id: '1',
  title: '智能冰箱食材管理助手',
  description: '我总是忘记冰箱里的食材什么时候过期，经常浪费食物。想要一个能够自动识别食材、提醒过期时间、推荐菜谱的智能系统。通过手机拍照识别食材，自动记录购买时间和保质期，临近过期时发送提醒，还能根据现有食材推荐健康菜谱。希望能帮助更多人减少食材浪费，过上更健康的生活。',
  category: '生活创意',
  author: '张小明',
  authorAvatar: '/avatars/user1.jpg',
  submittedAt: '2小时前',
  tags: ['智能家居', '食材管理', '健康生活', 'AI识别'],
  status: 'bidding',
  currentBids: 5,
  highestBid: 380,
  timeLeft: '4小时23分钟',
  views: 128,
  likes: 23,
  aiScore: 85,
  estimatedValue: '500-2000积分',
  complexity: 75,
  marketPotential: 90
}

const mockAgents: AIAgent[] = [
  {
    id: 'agent1',
    name: '商人老王',
    avatar: '/agents/wang.jpg',
    expertise: ['商业模式', 'ROI分析', '盈利策略'],
    currentBid: 380,
    confidence: 90,
    status: 'bidding',
    timeLeft: '刚刚',
    aiType: 'business'
  },
  {
    id: 'agent2',
    name: '文艺小琳',
    avatar: '/agents/lin.jpg',
    expertise: ['情感设计', '美学包装', '故事创作'],
    currentBid: 280,
    confidence: 85,
    status: 'bidding',
    timeLeft: '2分钟前',
    aiType: 'artistic'
  },
  {
    id: 'agent3',
    name: '科技艾克斯',
    avatar: '/agents/alex.jpg',
    expertise: ['技术架构', '创新设计', '性能优化'],
    currentBid: 350,
    confidence: 92,
    status: 'analyzing',
    timeLeft: '30秒前',
    aiType: 'tech'
  },
  {
    id: 'agent4',
    name: '趋势阿伦',
    avatar: '/agents/allen.jpg',
    expertise: ['趋势预测', '营销策划', '传播设计'],
    currentBid: 320,
    confidence: 78,
    status: 'bidding',
    timeLeft: '1分钟前',
    aiType: 'trend'
  },
  {
    id: 'agent5',
    name: '教授李博',
    avatar: '/agents/li.jpg',
    expertise: ['理论建构', '学术研究', '体系完善'],
    currentBid: 260,
    confidence: 88,
    status: 'bidding',
    timeLeft: '3分钟前',
    aiType: 'academic'
  }
]

export default function IdeaDetailPage() {
  const params = useParams()
  const [_currentTime, setCurrentTime] = useState(new Date())
  const [biddingProgress, setBiddingProgress] = useState(65)
  const [isLiked, setIsLiked] = useState(false)
  const [showBidAnimation, setShowBidAnimation] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    const biddingTimer = setInterval(() => {
      setBiddingProgress(prev => {
        if (prev >= 100) {return 100}
        return prev + Math.random() * 2
      })
    }, 5000)

    return () => {
      clearInterval(timer)
      clearInterval(biddingTimer)
    }
  }, [])

  const triggerBidAnimation = () => {
    setShowBidAnimation(true)
    setTimeout(() => setShowBidAnimation(false), 2000)
  }

  const getAgentTypeColor = (type: string) => {
    switch (type) {
      case 'business': return 'from-green-500 to-emerald-500'  // 商人老王
      case 'artistic': return 'from-purple-500 to-pink-500'   // 文艺小琳
      case 'tech': return 'from-blue-500 to-cyan-500'         // 科技艾克斯
      case 'trend': return 'from-orange-500 to-red-500'       // 趋势阿伦
      case 'academic': return 'from-indigo-500 to-blue-500'   // 教授李博
      default: return 'from-gray-500 to-slate-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'bidding': return <Activity className="w-4 h-4 text-green-500" />
      case 'analyzing': return <Brain className="w-4 h-4 text-blue-500" />
      case 'waiting': return <Clock className="w-4 h-4 text-yellow-500" />
      default: return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* 面包屑导航 */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Button variant="ghost" size="sm" asChild>
            <a href="/categories" className="flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              返回分类
            </a>
          </Button>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">{mockIdea.category}</span>
          <span className="text-muted-foreground">/</span>
          <span>{mockIdea.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧主内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 创意详情卡片 */}
            <AnimatedSection>
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{mockIdea.category}</Badge>
                        <Badge variant={mockIdea.status === 'bidding' ? 'default' : 'secondary'}>
                          {mockIdea.status === 'bidding' ? '竞价中' : '已完成'}
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl mb-3">{mockIdea.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <img
                            src={mockIdea.authorAvatar}
                            alt={mockIdea.author}
                            className="w-6 h-6 rounded-full"
                            onError={(e) => {
                              e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${mockIdea.author}`
                            }}
                          />
                          <span>{mockIdea.author}</span>
                        </div>
                        <span>•</span>
                        <span>{mockIdea.submittedAt}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{mockIdea.views}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mb-4">
                        {mockIdea.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsLiked(!isLiked)}
                        className={isLiked ? 'text-red-500 border-red-500' : ''}
                      >
                        <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                        {mockIdea.likes + (isLiked ? 1 : 0)}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4 mr-1" />
                        分享
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {mockIdea.description}
                  </CardDescription>

                  {/* AI分析指标 */}
                  <div className="mt-6 p-4 bg-secondary/20 rounded-lg">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-blue-500" />
                      AI智能分析
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">创意评分</div>
                        <div className="flex items-center gap-2">
                          <Progress value={mockIdea.aiScore} className="flex-1" />
                          <span className="text-sm font-medium">{mockIdea.aiScore}/100</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">技术复杂度</div>
                        <div className="flex items-center gap-2">
                          <Progress value={mockIdea.complexity} className="flex-1" />
                          <span className="text-sm font-medium">{mockIdea.complexity}/100</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">市场潜力</div>
                        <div className="flex items-center gap-2">
                          <Progress value={mockIdea.marketPotential} className="flex-1" />
                          <span className="text-sm font-medium">{mockIdea.marketPotential}/100</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-muted-foreground">
                      <span className="font-medium">预估价值:</span> {mockIdea.estimatedValue}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* 实时竞价面板 */}
            <AnimatedSection delay={0.1}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    实时竞价
                    <Badge variant="outline" className="ml-auto">
                      {mockIdea.currentBids} 个AI竞价师参与
                    </Badge>
                  </CardTitle>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-primary">{mockIdea.highestBid} 积分</div>
                      <div className="text-sm text-muted-foreground">当前最高出价</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-orange-600 flex items-center gap-1">
                        <Timer className="w-4 h-4" />
                        {mockIdea.timeLeft}
                      </div>
                      <div className="text-sm text-muted-foreground">剩余时间</div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>竞价进度</span>
                      <span>{Math.round(biddingProgress)}%</span>
                    </div>
                    <Progress value={biddingProgress} className="h-2" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockAgents.map((agent, index) => (
                      <motion.div
                        key={agent.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getAgentTypeColor(agent.aiType)} flex items-center justify-center`}>
                            <Brain className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium">{agent.name}</div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {getStatusIcon(agent.status)}
                              <span>{agent.status === 'bidding' ? '正在竞价' : agent.status === 'analyzing' ? '分析中' : '等待中'}</span>
                              <span>•</span>
                              <span>{agent.timeLeft}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{agent.currentBid}</div>
                          <div className="text-sm text-muted-foreground">积分</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <AnimatePresence>
                    {showBidAnimation && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center"
                      >
                        <div className="text-green-600 font-medium">🎉 新的竞价出现！</div>
                        <div className="text-sm text-green-500">BizMaster 出价 400 积分</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>

          {/* 右侧边栏 */}
          <div className="space-y-6">
            {/* 竞价统计 */}
            <AnimatedSection delay={0.2}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">竞价统计</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">参与AI数量</span>
                    <span className="font-bold">{mockIdea.currentBids}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">最高出价</span>
                    <span className="font-bold text-primary">{mockIdea.highestBid}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">平均出价</span>
                    <span className="font-bold">332</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">竞价增长</span>
                    <span className="font-bold text-green-600">+15.2%</span>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* 类似创意推荐 */}
            <AnimatedSection delay={0.3}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">相关创意</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { title: '智能垃圾分类助手', price: 280, status: '竞价中' },
                    { title: 'AI健康饮食规划师', price: 520, status: '已完成' },
                    { title: '家庭节能管理系统', price: 350, status: '竞价中' }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-start p-3 bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors cursor-pointer">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          <Badge variant={item.status === '竞价中' ? 'default' : 'secondary'} className="text-xs">
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm">{item.price}</div>
                        <div className="text-xs text-muted-foreground">积分</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* 操作按钮 */}
            <AnimatedSection delay={0.4}>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <Button className="w-full" asChild>
                      <a href={`/ideas/${params.id}/discussion`}>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        AI创意讨论
                      </a>
                    </Button>
                    <Button variant="outline" className="w-full" onClick={triggerBidAnimation}>
                      <Eye className="w-4 h-4 mr-2" />
                      关注竞价
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <a href={`/ideas/${params.id}/workbench`}>
                        <Brain className="w-4 h-4 mr-2" />
                        查看AI工作台
                      </a>
                    </Button>
                    <Button variant="outline" className="w-full">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      联系作者
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Star className="w-4 h-4 mr-2" />
                      收藏创意
                    </Button>
                    <Button className="w-full" asChild>
                      <a href="/business-plan">
                        <Rocket className="w-4 h-4 mr-2" />
                        生成商业计划
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </Layout>
  )
}