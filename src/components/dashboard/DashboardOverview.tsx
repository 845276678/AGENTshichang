'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Bot,
  Heart,
  Activity,
  Crown,
  TrendingUp,
  Clock,
  Star,
  ArrowRight,
  Search,
  Plus,
  Settings
} from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  description: string
  icon: React.ElementType
  trend?: {
    value: string
    isPositive: boolean
  }
  color?: string
}

const StatCard = ({ title, value, description, icon: Icon, trend, color = "primary" }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.2 }}
  >
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg bg-${color}-50 text-${color}-600 dark:bg-${color}-900/20`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
        {trend && (
          <div className="flex items-center mt-2">
            <TrendingUp className={`h-3 w-3 mr-1 ${trend.isPositive ? 'text-success-600' : 'text-error-600'} ${trend.isPositive ? '' : 'rotate-180'}`} />
            <span className={`text-xs font-medium ${trend.isPositive ? 'text-success-600' : 'text-error-600'}`}>
              {trend.value}
            </span>
            <span className="text-xs text-muted-foreground ml-1">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
)

const QuickActionCard = ({ 
  title, 
  description, 
  icon: Icon, 
  href, 
  color = "primary" 
}: {
  title: string
  description: string
  icon: React.ElementType
  href: string
  color?: string
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <Link href={href}>
      <Card className="h-full cursor-pointer transition-colors hover:bg-accent/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg bg-${color}-50 text-${color}-600 dark:bg-${color}-900/20`}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">{title}</h3>
              <p className="text-xs text-muted-foreground mb-3">{description}</p>
              <div className="flex items-center text-xs text-primary">
                <span>Get started</span>
                <ArrowRight className="h-3 w-3 ml-1" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  </motion.div>
)

export function DashboardOverview() {
  const { user } = useAuth()
  
  // Mock data - in a real app, this would come from your API
  const stats = [
    {
      title: "Purchased Agents",
      value: "12",
      description: "Active AI agents in your collection",
      icon: Bot,
      trend: { value: "+3", isPositive: true },
      color: "primary"
    },
    {
      title: "Favorite Agents",
      value: "8",
      description: "Agents saved to your favorites",
      icon: Heart,
      color: "error"
    },
    {
      title: "Recent Activity",
      value: "24",
      description: "Actions in the last 30 days",
      icon: Activity,
      trend: { value: "+12%", isPositive: true },
      color: "success"
    },
    {
      title: "Account Status",
      value: "Premium",
      description: "Active premium subscription",
      icon: Crown,
      color: "warning"
    }
  ]

  const quickActions = [
    {
      title: "Browse Agents",
      description: "Discover new AI agents in our marketplace",
      icon: Search,
      href: "/agents",
      color: "primary"
    },
    {
      title: "View Profile",
      description: "Update your profile and account settings",
      icon: Settings,
      href: "/dashboard/profile",
      color: "secondary"
    },
    {
      title: "Create Agent",
      description: "Build and publish your own AI agent",
      icon: Plus,
      href: "/agents/create",
      color: "success"
    }
  ]

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) {return "Good morning"}
    if (hour < 18) {return "Good afternoon"}
    return "Good evening"
  }

  const userName = user?.firstName || user?.username || user?.email?.split('@')[0] || 'there'

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center sm:text-left"
      >
        <h1 className="text-3xl font-bold tracking-tight">
          {getGreeting()}, {userName}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Welcome back to your AI Agent dashboard. Here's what's happening with your account.
        </p>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Quick Actions</h2>
            <p className="text-sm text-muted-foreground">
              Common tasks to get you started
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <QuickActionCard {...action} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Account Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary text-primary-foreground">
                  <Crown className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Premium Account Active</h3>
                  <p className="text-sm text-muted-foreground">
                    You have unlimited access to all features and agents
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">
                  <Star className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/billing">
                    Manage Plan
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Usage Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              This Month's Summary
            </CardTitle>
            <CardDescription>
              Your activity and usage this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center sm:text-left">
                <div className="text-2xl font-bold text-primary">156</div>
                <div className="text-sm text-muted-foreground">Hours saved</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-2xl font-bold text-success-600">$2,340</div>
                <div className="text-sm text-muted-foreground">Cost avoided</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-2xl font-bold text-warning-600">94%</div>
                <div className="text-sm text-muted-foreground">Efficiency gained</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}