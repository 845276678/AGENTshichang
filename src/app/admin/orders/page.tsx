'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui'
import { 
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  RefreshCcw,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  ShoppingCart,
  CreditCard,
  User,
  Calendar,
  TrendingUp,
  TrendingDown,
  FileText,
  Mail,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

// Mock orders data
const mockOrders = [
  {
    id: 'ORD-001',
    orderNumber: 'AI-2024091601',
    customer: {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com'
    },
    items: [
      { id: '1', name: 'CodeMaster Pro', price: 29.99, quantity: 1 },
      { id: '2', name: 'DesignWiz', price: 0, quantity: 1 }
    ],
    totalAmount: 32.98, // including processing fee
    status: 'completed',
    paymentStatus: 'paid',
    paymentMethod: 'credit_card',
    createdAt: '2024-09-16T10:30:00Z',
    processedAt: '2024-09-16T10:31:00Z',
    currency: 'USD'
  },
  {
    id: 'ORD-002',
    orderNumber: 'AI-2024091602',
    customer: {
      id: '2',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@techcorp.com'
    },
    items: [
      { id: '3', name: 'DataAnalyst Pro', price: 49.99, quantity: 2 }
    ],
    totalAmount: 102.97, // including processing fee
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: 'paypal',
    createdAt: '2024-09-16T09:15:00Z',
    processedAt: null,
    currency: 'USD'
  },
  {
    id: 'ORD-003',
    orderNumber: 'AI-2024091603',
    customer: {
      id: '3',
      name: 'Mike Chen',
      email: 'mike.chen@startup.io'
    },
    items: [
      { id: '4', name: 'WriteGenius', price: 19.99, quantity: 1 }
    ],
    totalAmount: 22.98,
    status: 'failed',
    paymentStatus: 'failed',
    paymentMethod: 'credit_card',
    createdAt: '2024-09-16T08:45:00Z',
    processedAt: '2024-09-16T08:46:00Z',
    currency: 'USD'
  },
  {
    id: 'ORD-004',
    orderNumber: 'AI-2024091604',
    customer: {
      id: '4',
      name: 'Emily Rodriguez',
      email: 'emily.r@freelance.com'
    },
    items: [
      { id: '1', name: 'CodeMaster Pro', price: 29.99, quantity: 1 },
      { id: '4', name: 'WriteGenius', price: 19.99, quantity: 1 }
    ],
    totalAmount: 52.97,
    status: 'refunded',
    paymentStatus: 'refunded',
    paymentMethod: 'credit_card',
    createdAt: '2024-09-15T16:20:00Z',
    processedAt: '2024-09-15T16:21:00Z',
    refundedAt: '2024-09-16T14:30:00Z',
    currency: 'USD'
  },
  {
    id: 'ORD-005',
    orderNumber: 'AI-2024091605',
    customer: {
      id: '5',
      name: 'David Kim',
      email: 'david.kim@agency.co'
    },
    items: [
      { id: '2', name: 'DesignWiz', price: 0, quantity: 1 }
    ],
    totalAmount: 0,
    status: 'completed',
    paymentStatus: 'free',
    paymentMethod: 'none',
    createdAt: '2024-09-15T14:10:00Z',
    processedAt: '2024-09-15T14:10:00Z',
    currency: 'USD'
  }
]

const OrderStatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    completed: { color: 'bg-green-100 text-green-800', label: 'Completed', icon: CheckCircle },
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending', icon: Clock },
    failed: { color: 'bg-red-100 text-red-800', label: 'Failed', icon: XCircle },
    refunded: { color: 'bg-blue-100 text-blue-800', label: 'Refunded', icon: RefreshCcw }
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
  const Icon = config.icon

  return (
    <Badge className={`${config.color} flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  )
}

const PaymentStatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    paid: { color: 'bg-green-100 text-green-800', label: 'Paid' },
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
    failed: { color: 'bg-red-100 text-red-800', label: 'Failed' },
    refunded: { color: 'bg-blue-100 text-blue-800', label: 'Refunded' },
    free: { color: 'bg-gray-100 text-gray-800', label: 'Free' }
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending

  return (
    <Badge className={`${config.color} text-xs`}>
      {config.label}
    </Badge>
  )
}

const OrderActionsDropdown = ({ order, onAction }: { 
  order: any, 
  onAction: (action: string, orderId: string) => void 
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const actions = [
    { label: 'View Details', icon: Eye, action: 'view' },
    { label: 'Download Invoice', icon: Download, action: 'invoice' },
    { label: 'Contact Customer', icon: Mail, action: 'contact' },
    ...(order.status === 'pending' ? [
      { label: 'Process Order', icon: CheckCircle, action: 'process' }
    ] : []),
    ...(order.status === 'completed' && order.paymentStatus === 'paid' ? [
      { label: 'Refund Order', icon: RefreshCcw, action: 'refund', destructive: true }
    ] : [])
  ]

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MoreHorizontal className="w-4 h-4" />
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-background border z-20">
            <div className="py-1">
              {actions.map((action) => (
                <button
                  key={action.action}
                  onClick={() => {
                    onAction(action.action, order.id)
                    setIsOpen(false)
                  }}
                  className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent w-full text-left ${
                    action.destructive ? 'text-red-600 hover:text-red-700' : ''
                  }`}
                >
                  <action.icon className="w-4 h-4" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const OrdersTable = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')

  const filteredOrders = mockOrders
    .filter(order => {
      const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
      const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter
      return matchesSearch && matchesStatus && matchesPayment
    })
    .sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a]
      const bValue = b[sortBy as keyof typeof b]
      const modifier = sortOrder === 'asc' ? 1 : -1
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * modifier
      }
      return (Number(aValue) - Number(bValue)) * modifier
    })

  const handleAction = (action: string, orderId: string) => {
    console.log(`${action} order ${orderId}`)
    // Implement action handlers
    switch (action) {
      case 'view':
        // Navigate to order details
        break
      case 'invoice':
        // Download invoice
        break
      case 'contact':
        // Contact customer
        break
      case 'process':
        // Process pending order
        break
      case 'refund':
        if (confirm('Are you sure you want to refund this order?')) {
          // Process refund
        }
        break
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) {return 'N/A'}
    return new Date(dateString).toLocaleString()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>All Orders ({filteredOrders.length})</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <RefreshCcw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search orders or customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
            <option value="free">Free</option>
          </select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-medium">Order</th>
                <th className="text-left p-4 font-medium">Customer</th>
                <th className="text-left p-4 font-medium">Items</th>
                <th className="text-left p-4 font-medium">Amount</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Date</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-accent/50">
                  <td className="p-4">
                    <div>
                      <div className="font-medium">{order.orderNumber}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        {order.paymentMethod.replace('_', ' ')}
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div>
                      <div className="font-medium">{order.customer.name}</div>
                      <div className="text-sm text-muted-foreground">{order.customer.email}</div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-muted-foreground"> × {item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="font-medium">
                      {order.totalAmount === 0 ? 'Free' : `$${order.totalAmount.toFixed(2)}`}
                    </div>
                    <div className="text-sm text-muted-foreground">{order.currency}</div>
                  </td>
                  
                  <td className="p-4">
                    <div className="space-y-2">
                      <OrderStatusBadge status={order.status} />
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="text-sm">
                      <div>Created: {formatDate(order.createdAt)}</div>
                      {order.processedAt && (
                        <div className="text-muted-foreground">
                          Processed: {formatDate(order.processedAt)}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="p-4 text-right">
                    <OrderActionsDropdown order={order} onAction={handleAction} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No orders found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const OrdersStats = () => {
  const totalOrders = mockOrders.length
  const completedOrders = mockOrders.filter(o => o.status === 'completed').length
  const pendingOrders = mockOrders.filter(o => o.status === 'pending').length
  const totalRevenue = mockOrders
    .filter(o => o.status === 'completed' && o.paymentStatus === 'paid')
    .reduce((sum, order) => sum + order.totalAmount, 0)

  // Calculate change percentages (mock data)
  const orderChange = 12.5
  const revenueChange = 8.3
  const pendingChange = -23.1
  const completionRate = (completedOrders / totalOrders) * 100

  const stats = [
    {
      title: 'Total Orders',
      value: totalOrders,
      change: orderChange,
      icon: ShoppingCart,
      color: 'text-blue-600'
    },
    {
      title: 'Total Revenue',
      value: `$${(totalRevenue / 1000).toFixed(1)}k`,
      change: revenueChange,
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Pending Orders',
      value: pendingOrders,
      change: pendingChange,
      icon: Clock,
      color: 'text-yellow-600'
    },
    {
      title: 'Completion Rate',
      value: `${completionRate.toFixed(1)}%`,
      change: 5.2,
      icon: CheckCircle,
      color: 'text-purple-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {stat.change > 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
              )}
              <span className={stat.change > 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(stat.change)}% from last month
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

const RecentOrdersWidget = () => {
  const recentOrders = mockOrders.slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentOrders.map((order) => (
            <div key={order.id} className="flex items-center gap-4 p-3 border rounded-lg">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-agent-500/20 flex items-center justify-center border">
                <ShoppingCart className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium">{order.orderNumber}</div>
                <div className="text-sm text-muted-foreground">
                  {order.customer.name} • {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  {order.totalAmount === 0 ? 'Free' : `$${order.totalAmount.toFixed(2)}`}
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Button variant="outline" size="sm" className="w-full">
            View All Orders
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminOrdersPage() {
  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Orders & Sales</h1>
            <p className="text-muted-foreground">
              Manage orders, payments, and view sales analytics
            </p>
          </div>
        </div>

        <OrdersStats />
        
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <OrdersTable />
          </div>
          <div className="lg:col-span-1">
            <RecentOrdersWidget />
          </div>
        </div>
      </motion.div>
    </AdminLayout>
  )
}