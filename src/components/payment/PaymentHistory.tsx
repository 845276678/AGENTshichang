'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CreditCard,
  Smartphone,
  Search,
  Download,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye
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

interface PaymentHistoryProps {
  onRefresh?: () => void
  onViewDetail?: (payment: PaymentRecord) => void
}

const statusConfig = {
  PENDING: {
    label: '待支付',
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    icon: Clock
  },
  SUCCESS: {
    label: '已支付',
    color: 'text-green-600 bg-green-50 border-green-200',
    icon: CheckCircle
  },
  FAILED: {
    label: '支付失败',
    color: 'text-red-600 bg-red-50 border-red-200',
    icon: XCircle
  },
  CANCELLED: {
    label: '已取消',
    color: 'text-gray-600 bg-gray-50 border-gray-200',
    icon: XCircle
  },
  REFUNDED: {
    label: '已退款',
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    icon: AlertCircle
  }
}

const providerConfig = {
  alipay: {
    name: '支付宝',
    icon: CreditCard,
    color: 'text-blue-600'
  },
  wechat: {
    name: '微信支付',
    icon: Smartphone,
    color: 'text-green-600'
  }
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  onRefresh,
  onViewDetail
}) => {
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [providerFilter, setProviderFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [hasNext, setHasNext] = useState(false)

  const pageSize = 10

  // 模拟数据加载
  const loadPayments = async (_currentPage: number = 1) => {
    setLoading(true)
    try {
      // 这里应该调用实际的API
      // const response = await fetch(`/api/payments/history?page=${currentPage}&limit=${pageSize}`)
      // const data = await response.json()

      // 模拟数据
      const mockData: PaymentRecord[] = [
        {
          id: '1',
          outTradeNo: 'AI202412210001',
          provider: 'alipay',
          amount: 25,
          credits: 3000,
          description: '购买热门包 - 3000积分',
          status: 'SUCCESS',
          createdAt: '2024-12-21T10:30:00Z',
          paidAt: '2024-12-21T10:32:15Z',
          expiredAt: '2024-12-21T11:00:00Z'
        },
        {
          id: '2',
          outTradeNo: 'AI202412210002',
          provider: 'wechat',
          amount: 10,
          credits: 1000,
          description: '购买基础包 - 1000积分',
          status: 'PENDING',
          createdAt: '2024-12-21T14:15:00Z',
          expiredAt: '2024-12-21T14:45:00Z'
        },
        {
          id: '3',
          outTradeNo: 'AI202412200001',
          provider: 'alipay',
          amount: 45,
          credits: 6000,
          description: '购买高级包 - 6000积分',
          status: 'FAILED',
          createdAt: '2024-12-20T16:20:00Z',
          expiredAt: '2024-12-20T16:50:00Z'
        }
      ]

      setPayments(mockData)
      setTotal(mockData.length)
      setHasNext(false)
    } catch (error) {
      console.error('加载支付记录失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPayments(page)
  }, [page])

  const handleRefresh = () => {
    loadPayments(page)
    onRefresh?.()
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setPage(1)
    // 实际实现中应该调用API进行搜索
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    setPage(1)
    // 实际实现中应该调用API进行过滤
  }

  const handleProviderFilter = (provider: string) => {
    setProviderFilter(provider)
    setPage(1)
    // 实际实现中应该调用API进行过滤
  }

  const handleExport = () => {
    // 导出支付记录的逻辑
    const dataStr = JSON.stringify(payments, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)

    const exportFileDefaultName = `payment_history_${new Date().toISOString().split('T')[0]}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
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

  const StatusBadge: React.FC<{ status: keyof typeof statusConfig }> = ({ status }) => {
    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <Badge variant="outline" className={`${config.color} border`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const ProviderBadge: React.FC<{ provider: keyof typeof providerConfig }> = ({ provider }) => {
    const config = providerConfig[provider]
    const Icon = config.icon

    return (
      <div className={`flex items-center gap-1 ${config.color}`}>
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium">{config.name}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">总支付次数</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">成功支付</p>
                <p className="text-2xl font-bold text-green-600">
                  {payments.filter(p => p.status === 'SUCCESS').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">待支付</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {payments.filter(p => p.status === 'PENDING').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">总金额</p>
                <p className="text-2xl font-bold">
                  ¥{payments
                    .filter(p => p.status === 'SUCCESS')
                    .reduce((sum, p) => sum + p.amount, 0)
                    .toFixed(2)
                  }
                </p>
              </div>
              <Badge variant="outline" className="text-lg font-bold">
                ¥
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选和搜索 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>支付记录</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                刷新
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                导出
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="搜索订单号或描述..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="支付状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="PENDING">待支付</SelectItem>
                <SelectItem value="SUCCESS">已支付</SelectItem>
                <SelectItem value="FAILED">支付失败</SelectItem>
                <SelectItem value="CANCELLED">已取消</SelectItem>
                <SelectItem value="REFUNDED">已退款</SelectItem>
              </SelectContent>
            </Select>

            <Select value={providerFilter} onValueChange={handleProviderFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="支付方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部方式</SelectItem>
                <SelectItem value="alipay">支付宝</SelectItem>
                <SelectItem value="wechat">微信支付</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 支付记录表格 */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>订单号</TableHead>
                  <TableHead>支付方式</TableHead>
                  <TableHead>金额</TableHead>
                  <TableHead>积分</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        加载中...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      暂无支付记录
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <motion.tr
                      key={payment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="hover:bg-muted/50"
                    >
                      <TableCell className="font-mono text-sm">
                        {payment.outTradeNo}
                      </TableCell>
                      <TableCell>
                        <ProviderBadge provider={payment.provider} />
                      </TableCell>
                      <TableCell className="font-semibold">
                        ¥{payment.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {payment.credits.toLocaleString()} 积分
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={payment.status} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(payment.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewDetail?.(payment)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* 分页 */}
          {total > pageSize && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                显示 {(page - 1) * pageSize + 1} 到 {Math.min(page * pageSize, total)} 条，
                共 {total} 条记录
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  上一页
                </Button>

                <span className="text-sm">
                  第 {page} 页
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={!hasNext}
                >
                  下一页
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default PaymentHistory