'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui'
import {
  TrendingUp,
  Users,
  Zap,
  ShoppingCart,
  DollarSign,
  Download,
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import Link from 'next/link'

// Mock data for the dashboard
const dashboardStats = {
  totalRevenue: {
    current: 24567.89,
    previous: 21234.56,
    change: 15.7
  },
  activeUsers: {
    current: 1247,
    previous: 1189,
    change: 4.9
  },
  totalAgents: {
    current: 234,
    previous: 218,
    change: 7.3
  },
  newRegistrations: {
    current: 89,
    previous: 76,
    change: 17.1
  }
}

const recentActivity = [
  {
    id: '1',
    type: 'user_registration',
    user: 'john.doe@example.com',
    action: 'New user registered',
    timestamp: '2 minutes ago',
    icon: Users,
    color: 'text-green-600'
  },
  {
    id: '2',
    type: 'agent_purchase',
    user: 'sarah.wilson@example.com',
    action: 'Purchased CodeMaster Pro',
    timestamp: '15 minutes ago',
    icon: ShoppingCart,
    color: 'text-blue-600'
  },
  {
    id: '3',
    type: 'agent_submission',
    user: 'dev.team@techcorp.com',
    action: 'Submitted new agent for review',
    timestamp: '1 hour ago',
    icon: Zap,
    color: 'text-purple-600'
  },
  {
    id: '4',
    type: 'support_ticket',
    user: 'mike.chen@startup.io',
    action: 'Created support ticket',
    timestamp: '2 hours ago',
    icon: AlertCircle,
    color: 'text-orange-600'
  }
]

const topPerformingAgents = [
  {
    id: '1',
    name: 'CodeMaster Pro',
    category: 'Development',
    revenue: 5670.00,
    downloads: 234,
    rating: 4.8,
    change: 23.5
  },
  {
    id: '2',
    name: 'DesignWiz',
    category: 'Creative',
    revenue: 0,
    downloads: 892,
    rating: 4.6,
    change: 15.2
  },
  {
    id: '3',
    name: 'DataAnalyst AI',
    category: 'Analysis',
    revenue: 3920.00,
    downloads: 156,
    rating: 4.9,
    change: 8.7
  }
]

const StatCard = ({ title, value, change, icon: Icon, prefix = '', suffix = '' }: {
  title: string
  value: number
  change: number
  icon: React.ElementType
  prefix?: string
  suffix?: string
}) => {
  const isPositive = change > 0
  const formattedValue = prefix + (value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value.toString()) + suffix

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formattedValue}</div>
        <div className="flex items-center text-xs text-muted-foreground mt-1">
          {isPositive ? (
            <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
          ) : (
            <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
          )}
          <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
            {Math.abs(change)}% from last month
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

const RecentActivityCard = () => {
  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <activity.icon className={`h-4 w-4 ${activity.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{activity.action}</p>
                <p className="text-xs text-muted-foreground truncate">{activity.user}</p>
              </div>
              <div className="text-xs text-muted-foreground">
                {activity.timestamp}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Button variant="outline" size="sm" className="w-full">
            View All Activity
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

const TopAgentsCard = () => {
  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle>Top Performing Agents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topPerformingAgents.map((agent, index) => (
            <div key={agent.id} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-agent-500/20 flex items-center justify-center border">
                <span className="text-xs font-bold">{index + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{agent.name}</p>
                  <Badge variant="outline" className="text-xs">{agent.category}</Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {agent.revenue === 0 ? 'Free' : `$${(agent.revenue / 1000).toFixed(1)}k`}
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    {agent.downloads}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {agent.rating}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-xs ${agent.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {agent.change > 0 ? '+' : ''}{agent.change}%
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Button variant="outline" size="sm" className="w-full">
            <Link href="/admin/agents">Manage Agents</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

const QuickActions = () => {
  const actions = [
    {
      title: 'Review Pending Agents',
      description: '3 agents awaiting approval',
      icon: Clock,
      href: '/admin/agents?status=pending',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Handle Support Tickets',
      description: '7 open tickets',
      icon: AlertCircle,
      href: '/admin/support',
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Review User Reports',
      description: '2 user reports',
      icon: Users,
      href: '/admin/users?filter=reported',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Check System Health',
      description: 'All systems operational',
      icon: CheckCircle,
      href: '/admin/system',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors group"
            >
              <div className={`w-10 h-10 rounded-lg ${action.bgColor} flex items-center justify-center`}>
                <action.icon className={`h-5 w-5 ${action.color}`} />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm group-hover:text-primary transition-colors">
                  {action.title}
                </div>
                <div className="text-xs text-muted-foreground">
                  {action.description}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Overview</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening with your marketplace.
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/analytics">
              View Detailed Analytics
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value={dashboardStats.totalRevenue.current}
            previousValue={dashboardStats.totalRevenue.previous}
            change={dashboardStats.totalRevenue.change}
            icon={DollarSign}
            prefix="$"
          />
          <StatCard
            title="Active Users"
            value={dashboardStats.activeUsers.current}
            previousValue={dashboardStats.activeUsers.previous}
            change={dashboardStats.activeUsers.change}
            icon={Users}
          />
          <StatCard
            title="Total Agents"
            value={dashboardStats.totalAgents.current}
            previousValue={dashboardStats.totalAgents.previous}
            change={dashboardStats.totalAgents.change}
            icon={Zap}
          />
          <StatCard
            title="New Registrations"
            value={dashboardStats.newRegistrations.current}
            previousValue={dashboardStats.newRegistrations.previous}
            change={dashboardStats.newRegistrations.change}
            icon={TrendingUp}
          />
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          <RecentActivityCard />
          <TopAgentsCard />
        </div>

        {/* Quick Actions */}
        <QuickActions />
      </motion.div>
    </AdminLayout>
  )
}