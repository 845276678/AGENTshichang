'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

import {
  Dialog,
  DialogContent,
  _DialogDescription,
  DialogHeader,
  DialogTitle,
  _DialogTrigger,
} from '@/components/ui/dialog'
import {
  CreditCard,
  Smartphone,
  QrCode,
  _Gift,
  Zap,
  Star,
  Crown,
  Diamond,
  Coins,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'

interface PaymentMethod {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  available: boolean
  recommended?: boolean
}

interface CreditPackage {
  id: string
  credits: number
  amount: number
  originalPrice?: number
  bonus?: number
  popular?: boolean
  icon: React.ReactNode
  title: string
  description: string
}

interface CreditPurchaseProps {
  onPaymentCreate: (data: {
    provider: string
    amount: number
    credits: number
    description: string
  }) => Promise<{ success: boolean; payUrl?: string; qrCodeUrl?: string; error?: string }>
  userCredits: number
  isLoading?: boolean
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'alipay',
    name: '支付宝',
    icon: <CreditCard className="w-6 h-6 text-blue-600" />,
    description: '安全便捷的在线支付',
    available: true,
    recommended: true
  },
  {
    id: 'wechat',
    name: '微信支付',
    icon: <Smartphone className="w-6 h-6 text-green-600" />,
    description: '微信扫码或H5支付',
    available: true
  }
]

const creditPackages: CreditPackage[] = [
  {
    id: 'basic',
    credits: 1000,
    amount: 10,
    icon: <Coins className="w-6 h-6" />,
    title: '基础包',
    description: '适合轻度使用'
  },
  {
    id: 'popular',
    credits: 3000,
    amount: 25,
    originalPrice: 30,
    bonus: 300,
    popular: true,
    icon: <Star className="w-6 h-6" />,
    title: '热门包',
    description: '最受欢迎的选择'
  },
  {
    id: 'premium',
    credits: 6000,
    amount: 45,
    originalPrice: 60,
    bonus: 800,
    icon: <Crown className="w-6 h-6" />,
    title: '高级包',
    description: '适合重度使用'
  },
  {
    id: 'ultimate',
    credits: 12000,
    amount: 80,
    originalPrice: 120,
    bonus: 2000,
    icon: <Diamond className="w-6 h-6" />,
    title: '至尊包',
    description: '专业用户首选'
  }
]

export const CreditPurchase: React.FC<CreditPurchaseProps> = ({
  onPaymentCreate,
  userCredits,
  isLoading = false
}) => {
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<string>('alipay')
  const [customAmount, setCustomAmount] = useState<string>('')
  const [showCustom, setShowCustom] = useState<boolean>(false)
  const [paymentResult, setPaymentResult] = useState<{
    success: boolean
    payUrl?: string
    qrCodeUrl?: string
    error?: string
  } | null>(null)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)

  const handlePackageSelect = (pkg: CreditPackage) => {
    setSelectedPackage(pkg)
    setShowCustom(false)
    setCustomAmount('')
  }

  const handleCustomAmount = () => {
    setShowCustom(true)
    setSelectedPackage(null)
  }

  const calculateCustomCredits = (amount: number): number => {
    return Math.floor(amount * 100) // 1元 = 100积分
  }

  const handlePurchase = async () => {
    let amount: number
    let credits: number
    let description: string

    if (selectedPackage) {
      amount = selectedPackage.amount
      credits = selectedPackage.credits
      description = `购买${selectedPackage.title} - ${credits}积分`
    } else if (showCustom && customAmount) {
      amount = parseFloat(customAmount)
      credits = calculateCustomCredits(amount)
      description = `自定义充值 - ${credits}积分`
    } else {
      return
    }

    if (amount <= 0) {
      return
    }

    setIsProcessing(true)

    try {
      const result = await onPaymentCreate({
        provider: selectedMethod,
        amount,
        credits,
        description
      })

      setPaymentResult(result)
    } catch (error) {
      setPaymentResult({
        success: false,
        error: error instanceof Error ? error.message : '支付创建失败'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const isValidPurchase = () => {
    if (selectedPackage) return true
    if (showCustom && customAmount) {
      const amount = parseFloat(customAmount)
      return amount >= 1 && amount <= 10000
    }
    return false
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 当前积分显示 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">当前积分</p>
                <p className="text-2xl font-bold">{userCredits.toLocaleString()}</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => window.location.reload()}>
              刷新余额
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 积分套餐选择 */}
      <Card>
        <CardHeader>
          <CardTitle>选择充值套餐</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {creditPackages.map((pkg) => (
              <motion.div
                key={pkg.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`cursor-pointer border-2 transition-all ${
                    selectedPackage?.id === pkg.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  } ${pkg.popular ? 'ring-2 ring-yellow-400' : ''}`}
                  onClick={() => handlePackageSelect(pkg)}
                >
                  <CardContent className="p-4 text-center space-y-3">
                    {pkg.popular && (
                      <Badge className="bg-yellow-500 text-yellow-900 mb-2">
                        热门推荐
                      </Badge>
                    )}

                    <div className="flex justify-center">
                      {pkg.icon}
                    </div>

                    <div>
                      <h3 className="font-semibold">{pkg.title}</h3>
                      <p className="text-xs text-muted-foreground">{pkg.description}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-lg font-bold">
                        {pkg.credits.toLocaleString()} 积分
                      </p>
                      {pkg.bonus && (
                        <p className="text-xs text-green-600">
                          +{pkg.bonus} 奖励积分
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xl font-bold text-primary">
                        ¥{pkg.amount}
                      </span>
                      {pkg.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          ¥{pkg.originalPrice}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={handleCustomAmount}
              className={showCustom ? 'bg-primary/5 border-primary' : ''}
            >
              自定义金额
            </Button>
          </div>

          {showCustom && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <div>
                <Label htmlFor="custom-amount">自定义充值金额</Label>
                <Input
                  id="custom-amount"
                  type="number"
                  placeholder="请输入金额（1-10000元）"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  min="1"
                  max="10000"
                  step="0.01"
                />
                {customAmount && (
                  <p className="text-sm text-muted-foreground mt-1">
                    将获得 {calculateCustomCredits(parseFloat(customAmount) || 0).toLocaleString()} 积分
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* 支付方式选择 */}
      {isValidPurchase() && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>选择支付方式</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center space-x-3">
                      <RadioGroupItem
                        value={method.id}
                        id={method.id}
                        disabled={!method.available}
                      />
                      <Label
                        htmlFor={method.id}
                        className={`flex items-center gap-3 cursor-pointer ${
                          !method.available ? 'opacity-50' : ''
                        }`}
                      >
                        {method.icon}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{method.name}</span>
                            {method.recommended && (
                              <Badge variant="secondary" className="text-xs">
                                推荐
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {method.description}
                          </p>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* 确认支付按钮 */}
      {isValidPurchase() && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {selectedPackage?.title || '自定义充值'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedPackage
                      ? `${selectedPackage.credits.toLocaleString()} 积分`
                      : customAmount && `${calculateCustomCredits(parseFloat(customAmount)).toLocaleString()} 积分`
                    }
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    ¥{selectedPackage?.amount || parseFloat(customAmount || '0')}
                  </p>
                </div>
              </div>

              <Button
                className="w-full mt-4"
                size="lg"
                onClick={handlePurchase}
                disabled={isProcessing || isLoading}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    创建支付订单...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    立即支付
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* 支付结果对话框 */}
      <Dialog open={!!paymentResult} onOpenChange={() => setPaymentResult(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {paymentResult?.success ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  支付订单已创建
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  支付创建失败
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {paymentResult?.success ? (
            <div className="space-y-4">
              <p>支付订单已创建成功，请完成支付。</p>

              {paymentResult.qrCodeUrl && (
                <div className="text-center">
                  <div className="inline-block p-4 bg-white rounded-lg border">
                    <QrCode className="w-32 h-32 mx-auto" />
                    <p className="text-sm text-muted-foreground mt-2">
                      请使用支付应用扫描二维码
                    </p>
                  </div>
                </div>
              )}

              {paymentResult.payUrl && (
                <div className="text-center">
                  <Button
                    onClick={() => window.open(paymentResult.payUrl, '_blank')}
                    className="w-full"
                  >
                    前往支付页面
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-red-600">
                {paymentResult?.error || '支付创建失败，请稍后重试'}
              </p>
              <Button
                onClick={() => setPaymentResult(null)}
                variant="outline"
                className="w-full"
              >
                关闭
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CreditPurchase