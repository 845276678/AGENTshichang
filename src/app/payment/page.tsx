'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Layout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import CreditPurchase from '@/components/payment/CreditPurchase'
import PaymentHistory from '@/components/payment/PaymentHistory'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  _Coins,
  CreditCard,
  History,
  Gift,
  Star,
  TrendingUp,
  Zap,
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react'

interface PaymentRecord {
  id: string
  outTradeNo: string
  provider: 'alipay' | 'wechat'
  amount: number
  credits: number
  description: string
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED'
  createdAt: string
  paidAt?: string
  expiredAt: string
}

export default function PaymentPage() {
  const [userCredits] = useState(1250)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null)
  const [_refreshing, setRefreshing] = useState(false)
  const { toast } = useToast()

  const handlePaymentCreate = async (data: {
    provider: string
    amount: number
    credits: number
    description: string
  }) => {
    setIsLoading(true)

    try {
      // 模拟API调用
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('支付创建失败')
      }

      const result = await response.json()

      toast({
        title: '支付订单创建成功',
        description: '请完成支付以获得积分',
      })

      return {
        success: true,
        payUrl: result.data.payUrl,
        qrCodeUrl: result.data.qrCodeUrl
      }
    } catch (error) {
      console.error('Payment creation failed:', error)

      toast({
        title: '支付创建失败',
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'destructive'
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : '支付创建失败'
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      // 刷新用户积分
      await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
      // setUserCredits(newCredits)

      toast({
        title: '刷新成功',
        description: '积分余额已更新',
      })
    } catch (error) {
      toast({
        title: '刷新失败',
        description: '请稍后重试',
        variant: 'destructive'
      })
    } finally {
      setRefreshing(false)
    }
  }

  const handleViewPaymentDetail = (payment: PaymentRecord) => {
    setSelectedPayment(payment)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: PaymentRecord['status']) => {
    const statusConfig = {
      PENDING: { label: '待支付', color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: Clock },
      SUCCESS: { label: '已支付', color: 'text-green-600 bg-green-50 border-green-200', icon: CheckCircle },
      FAILED: { label: '支付失败', color: 'text-red-600 bg-red-50 border-red-200', icon: Clock },
      CANCELLED: { label: '已取消', color: 'text-gray-600 bg-gray-50 border-gray-200', icon: Clock },
      REFUNDED: { label: '已退款', color: 'text-purple-600 bg-purple-50 border-purple-200', icon: RefreshCw }
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <Badge variant="outline" className={`${config.color} border`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* 页面标题 */}
          <div className="text-center space-y-4">
            <motion.h1
              className="text-4xl font-bold"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              积分充值
            </motion.h1>
            <motion.p
              className="text-xl text-muted-foreground"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              为您的创意协作之旅充值能量
            </motion.p>
          </div>

          {/* 积分使用说明 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-1">AI对话消费</h3>
                    <p className="text-sm text-muted-foreground">
                      与AI Agent深度对话，每轮消费10-50积分
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
                      <Star className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold mb-1">创意工作坊</h3>
                    <p className="text-sm text-muted-foreground">
                      参与专业训练课程，提升创意能力
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                      <Gift className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-1">解锁高级功能</h3>
                    <p className="text-sm text-muted-foreground">
                      访问专属AI模型和高级分析工具
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 主要内容标签页 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Tabs defaultValue="purchase" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="purchase" className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  充值积分
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  支付记录
                </TabsTrigger>
              </TabsList>

              <TabsContent value="purchase" className="space-y-6">
                <CreditPurchase
                  onPaymentCreate={handlePaymentCreate}
                  userCredits={userCredits}
                  isLoading={isLoading}
                />
              </TabsContent>

              <TabsContent value="history" className="space-y-6">
                <PaymentHistory
                  onRefresh={handleRefresh}
                  onViewDetail={handleViewPaymentDetail}
                />
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* 积分获取提示 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  其他获取积分的方式
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">完成新手任务</p>
                      <p className="text-sm text-muted-foreground">获得500积分</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Star className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">每日签到</p>
                      <p className="text-sm text-muted-foreground">获得10-50积分</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <Gift className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium">邀请好友</p>
                      <p className="text-sm text-muted-foreground">获得200积分</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 支付详情对话框 */}
        <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>支付详情</DialogTitle>
              <DialogDescription>
                订单号: {selectedPayment?.outTradeNo}
              </DialogDescription>
            </DialogHeader>

            {selectedPayment && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">支付金额</p>
                    <p className="text-lg font-semibold">¥{selectedPayment.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">获得积分</p>
                    <p className="text-lg font-semibold">{selectedPayment.credits.toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">支付状态</p>
                  <div className="mt-1">
                    {getStatusBadge(selectedPayment.status)}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">创建时间</p>
                  <p className="font-medium">{formatDate(selectedPayment.createdAt)}</p>
                </div>

                {selectedPayment.paidAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">支付时间</p>
                    <p className="font-medium">{formatDate(selectedPayment.paidAt)}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground">描述</p>
                  <p className="font-medium">{selectedPayment.description}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  )
}