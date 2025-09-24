'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Layout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge, AnimatedSection } from '@/components/ui'

import { Label } from '@/components/ui/label'
import {
  ArrowLeft,
  CreditCard,
  Wallet,
  Shield,
  CheckCircle,
  Download,
  Star,
  Clock,
  Users,
  Brain,
  FileText,
  TrendingUp
} from 'lucide-react'

interface EnhancedIdea {
  id: string
  originalTitle: string
  enhancedTitle: string
  originalAuthor: string
  aiAgent: string
  price: number
  originalPrice: number
  valueIncrease: string
  rating: number
  reviews: number
  purchaseCount: number
  lastUpdated: string
  deliverables: string[]
  highlights: string[]
  preview: {
    businessPlan: number
    technicalSpecs: number
    marketAnalysis: number
    financialModel: number
  }
}

interface UserProfile {
  name: string
  email: string
  balance: number
  avatar: string
  memberLevel: string
  totalPurchases: number
  totalEarnings: number
}

const mockEnhancedIdea: EnhancedIdea = {
  id: '1',
  originalTitle: '智能冰箱食材管理助手',
  enhancedTitle: 'SmartKitchen 家庭智能营养管家生态系统',
  originalAuthor: '张小明',
  aiAgent: 'BizMaster AI',
  price: 3200,
  originalPrice: 380,
  valueIncrease: '8.4倍',
  rating: 4.9,
  reviews: 127,
  purchaseCount: 89,
  lastUpdated: '2小时前',
  deliverables: [
    '120页完整商业计划书',
    '技术实现方案和架构图',
    'UI/UX设计原型 (50+页面)',
    '财务模型和投资预测',
    '市场调研报告 (80页)',
    '知识产权策略',
    '3个月执行路线图',
    '团队招聘计划',
    '投资人BP模板'
  ],
  highlights: [
    '技术可行性：95% ⭐⭐⭐⭐⭐',
    '市场需求度：90% ⭐⭐⭐⭐⭐',
    '盈利潜力：85% ⭐⭐⭐⭐☆',
    '竞争优势：80% ⭐⭐⭐⭐☆',
    '执行难度：70% ⭐⭐⭐☆☆'
  ],
  preview: {
    businessPlan: 95,
    technicalSpecs: 92,
    marketAnalysis: 88,
    financialModel: 90
  }
}

const mockUser: UserProfile = {
  name: '刘总',
  email: 'liu@example.com',
  balance: 5680,
  avatar: '/avatars/liu.jpg',
  memberLevel: '钻石会员',
  totalPurchases: 23,
  totalEarnings: 12450
}

export default function PurchasePage() {
  // const params = useParams()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [purchaseStep, setPurchaseStep] = useState(1) // 1: 确认, 2: 支付, 3: 完成
  const [paymentMethod, setPaymentMethod] = useState('balance')
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const handlePurchase = async () => {
    if (!agreedToTerms) {
      alert('请先同意购买协议')
      return
    }

    if (mockUser.balance < mockEnhancedIdea.price) {
      alert('积分余额不足，请先充值')
      return
    }

    setIsProcessing(true)
    setPurchaseStep(2)

    // 模拟支付处理
    setTimeout(() => {
      setPurchaseStep(3)
      setIsProcessing(false)
    }, 3000)
  }

  const handleDownload = (deliverable: string) => {
    // 模拟下载
    console.log(`下载: ${deliverable}`)
    alert(`开始下载: ${deliverable}`)
  }

  if (purchaseStep === 3) {
    return (
      <Layout>
        <div className="container py-12">
          <AnimatedSection>
            <Card className="max-w-2xl mx-auto">
              <CardHeader className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </motion.div>
                <CardTitle className="text-2xl text-green-600">购买成功！</CardTitle>
                <CardDescription>
                  您已成功购买 {mockEnhancedIdea.enhancedTitle}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 交易详情 */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-3">交易详情</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>商品价格</span>
                      <span>{mockEnhancedIdea.price} 积分</span>
                    </div>
                    <div className="flex justify-between">
                      <span>支付方式</span>
                      <span>积分余额</span>
                    </div>
                    <div className="flex justify-between">
                      <span>交易时间</span>
                      <span>{new Date().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>剩余余额</span>
                      <span className="font-medium">{mockUser.balance - mockEnhancedIdea.price} 积分</span>
                    </div>
                  </div>
                </div>

                {/* 下载列表 */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    可下载内容
                  </h4>
                  <div className="space-y-2">
                    {mockEnhancedIdea.deliverables.map((deliverable, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <span className="text-sm">{deliverable}</span>
                        </div>
                        <Button size="sm" onClick={() => handleDownload(deliverable)}>
                          下载
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 收益分配说明 */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    收益分配
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>原创者 ({mockEnhancedIdea.originalAuthor})</span>
                      <span className="text-green-600">+320 积分 (10%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>AI竞价师 ({mockEnhancedIdea.aiAgent})</span>
                      <span className="text-blue-600">+2,720 积分 (85%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>平台服务费</span>
                      <span className="text-gray-600">160 积分 (5%)</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    className="flex-1"
                    onClick={() => router.push('/marketplace')}
                  >
                    继续购物
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.push('/dashboard')}
                  >
                    查看我的购买
                  </Button>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* 面包屑导航 */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Button variant="ghost" size="sm" asChild>
            <a href="/marketplace" className="flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              返回市场
            </a>
          </Button>
          <span className="text-muted-foreground">/</span>
          <span>购买创意</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧主内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 商品信息 */}
            <AnimatedSection>
              <Card>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <Badge variant="secondary" className="mb-2">创意完善方案</Badge>
                      <CardTitle className="text-xl mb-2">{mockEnhancedIdea.enhancedTitle}</CardTitle>
                      <CardDescription>
                        由 {mockEnhancedIdea.aiAgent} 完善优化，原创意来自 {mockEnhancedIdea.originalAuthor}
                      </CardDescription>
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{mockEnhancedIdea.rating}</span>
                          <span>({mockEnhancedIdea.reviews}评价)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{mockEnhancedIdea.purchaseCount}人购买</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>更新于{mockEnhancedIdea.lastUpdated}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* 价值提升展示 */}
                  <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-muted-foreground">原始竞价</div>
                        <div className="text-lg font-medium">{mockEnhancedIdea.originalPrice} 积分</div>
                      </div>
                      <div className="text-2xl">→</div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">完善后价值</div>
                        <div className="text-2xl font-bold text-primary">{mockEnhancedIdea.price} 积分</div>
                      </div>
                      <div className="text-right">
                        <Badge variant="default" className="bg-green-500">
                          价值提升 {mockEnhancedIdea.valueIncrease}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* 亮点展示 */}
                  <div className="mb-4">
                    <h4 className="font-medium mb-3">项目亮点</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {mockEnhancedIdea.highlights.map((highlight, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span>{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 交付物清单 */}
                  <div>
                    <h4 className="font-medium mb-3">包含内容</h4>
                    <div className="space-y-2">
                      {mockEnhancedIdea.deliverables.map((deliverable, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-secondary/10 rounded text-sm">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <span>{deliverable}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* 支付方式选择 */}
            {purchaseStep === 1 && (
              <AnimatedSection delay={0.1}>
                <Card>
                  <CardHeader>
                    <CardTitle>选择支付方式</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          paymentMethod === 'balance' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setPaymentMethod('balance')}
                      >
                        <div className="flex items-center gap-3">
                          <Wallet className="w-5 h-5 text-blue-500" />
                          <div className="flex-1">
                            <div className="font-medium">积分余额支付</div>
                            <div className="text-sm text-muted-foreground">
                              当前余额: {mockUser.balance} 积分
                              {mockUser.balance < mockEnhancedIdea.price && (
                                <span className="text-red-500 ml-2">余额不足</span>
                              )}
                            </div>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            paymentMethod === 'balance' ? 'border-primary bg-primary' : 'border-gray-300'
                          }`} />
                        </div>
                      </div>

                      <div
                        className={`p-4 border rounded-lg cursor-pointer transition-all opacity-50 ${
                          paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5 text-gray-400" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-400">信用卡支付</div>
                            <div className="text-sm text-gray-400">即将上线</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 购买协议 */}
                    <div className="flex items-start gap-2 pt-4 border-t">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-1"
                      />
                      <Label htmlFor="terms" className="text-sm text-muted-foreground">
                        我已阅读并同意
                        <a href="/terms" className="text-primary hover:underline mx-1">购买协议</a>
                        和
                        <a href="/privacy" className="text-primary hover:underline mx-1">隐私政策</a>
                      </Label>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            )}

            {/* 支付处理中 */}
            {purchaseStep === 2 && (
              <AnimatedSection>
                <Card>
                  <CardContent className="py-12 text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
                    />
                    <h3 className="text-lg font-medium mb-2">正在处理支付...</h3>
                    <p className="text-muted-foreground">请稍候，正在确认您的交易</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            )}
          </div>

          {/* 右侧边栏 */}
          <div className="space-y-6">
            {/* 用户信息 */}
            <AnimatedSection delay={0.2}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">购买账户</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={mockUser.avatar}
                      alt={mockUser.name}
                      className="w-10 h-10 rounded-full"
                      onError={(e) => {
                        e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${mockUser.name}`
                      }}
                    />
                    <div>
                      <div className="font-medium">{mockUser.name}</div>
                      <Badge variant="outline" className="text-xs">{mockUser.memberLevel}</Badge>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>积分余额</span>
                      <span className="font-medium">{mockUser.balance}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>历史购买</span>
                      <span>{mockUser.totalPurchases}次</span>
                    </div>
                    <div className="flex justify-between">
                      <span>总收益</span>
                      <span className="text-green-600">{mockUser.totalEarnings}积分</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* 订单摘要 */}
            <AnimatedSection delay={0.3}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">订单摘要</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>商品价格</span>
                      <span>{mockEnhancedIdea.price} 积分</span>
                    </div>
                    <div className="flex justify-between">
                      <span>平台服务费</span>
                      <span>已包含</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-medium">
                      <span>总计</span>
                      <span className="text-lg text-primary">{mockEnhancedIdea.price} 积分</span>
                    </div>
                  </div>

                  {purchaseStep === 1 && (
                    <Button
                      className="w-full"
                      onClick={handlePurchase}
                      disabled={isProcessing || !agreedToTerms || mockUser.balance < mockEnhancedIdea.price}
                    >
                      {isProcessing ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          处理中...
                        </div>
                      ) : (
                        `确认购买 ${mockEnhancedIdea.price} 积分`
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* 安全保障 */}
            <AnimatedSection delay={0.4}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-500" />
                    安全保障
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>7天无理由退款</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>内容质量保证</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>永久下载权限</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>专业客服支持</span>
                    </div>
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