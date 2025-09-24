'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  DollarSign,
  Clock,
  Target,
  Lightbulb,
  ArrowRight,
  BarChart3,
  PieChart
} from 'lucide-react'

interface InsightItem {
  id: string
  title: string
  description: string
  value: string
  change: {
    value: string
    isPositive: boolean
  }
  icon: React.ElementType
  color: string
}

interface Recommendation {
  id: string
  title: string
  description: string
  category: string
  priority: 'high' | 'medium' | 'low'
  action: {
    label: string
    href: string
  }
}

// Mock insights data
const insights: InsightItem[] = [
  {
    id: '1',
    title: 'Most Used Category',
    description: 'Your go-to agent type',
    value: 'Creative',
    change: { value: '+23%', isPositive: true },
    icon: PieChart,
    color: 'primary'
  },
  {
    id: '2',
    title: 'Monthly Spending',
    description: 'Total spent this month',
    value: '$89.97',
    change: { value: '-12%', isPositive: false },
    icon: DollarSign,
    color: 'success'
  },
  {
    id: '3',
    title: 'Usage Time',
    description: 'Hours saved this month',
    value: '156h',
    change: { value: '+34%', isPositive: true },
    icon: Clock,
    color: 'warning'
  }
]

// Mock recommendations
const recommendations: Recommendation[] = [
  {
    id: '1',
    title: 'Try Business Analytics Agent',
    description: 'Based on your usage of Data Analyzer, you might like advanced business analytics tools',
    category: 'Business',
    priority: 'high',
    action: {
      label: 'Explore Now',
      href: '/agents/business-analytics'
    }
  },
  {
    id: '2',
    title: 'Upgrade to Premium Plan',
    description: 'Get unlimited access to all agents and priority support',
    category: 'Subscription',
    priority: 'medium',
    action: {
      label: 'View Plans',
      href: '/dashboard/billing'
    }
  },
  {
    id: '3',
    title: 'Complete Your Profile',
    description: 'Add more information to get better agent recommendations',
    category: 'Profile',
    priority: 'low',
    action: {
      label: 'Update Profile',
      href: '/dashboard/profile'
    }
  }
]

const InsightCard = ({ insight, index }: { insight: InsightItem; index: number }) => {
  const Icon = insight.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-lg bg-${insight.color}-50 text-${insight.color}-600 dark:bg-${insight.color}-900/20`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className={`text-xs font-medium ${insight.change.isPositive ? 'text-success-600' : 'text-error-600'}`}>
              {insight.change.value}
            </div>
          </div>
          
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">{insight.value}</h3>
            <p className="text-sm font-medium text-foreground">{insight.title}</p>
            <p className="text-xs text-muted-foreground">{insight.description}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const RecommendationItem = ({ recommendation, index }: { recommendation: Recommendation; index: number }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error'
      case 'medium': return 'warning'
      case 'low': return 'success'
      default: return 'secondary'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors group"
    >
      <div className="p-2 rounded-lg bg-primary/10 shrink-0">
        <Lightbulb className="h-4 w-4 text-primary" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
            {recommendation.title}
          </h4>
          <Badge 
            variant={getPriorityColor(recommendation.priority) as any} 
            className="text-xs capitalize shrink-0"
          >
            {recommendation.priority}
          </Badge>
        </div>
        
        <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
          {recommendation.description}
        </p>
        
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {recommendation.category}
          </Badge>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 text-xs px-2"
            asChild
          >
            <Link href={recommendation.action.href}>
              {recommendation.action.label}
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

export function QuickStatsInsights() {
  // Mock usage pattern data
  const usagePatterns = {
    mostActiveDay: 'Tuesday',
    peakHour: '2 PM',
    streakDays: 15,
    efficiency: 94
  }

  const categoryUsage = [
    { name: 'Creative', value: 45, color: 'primary' },
    { name: 'Development', value: 30, color: 'success' },
    { name: 'Business', value: 15, color: 'warning' },
    { name: 'Other', value: 10, color: 'secondary' }
  ]

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Quick Stats
          </CardTitle>
          <CardDescription>
            Key insights about your agent usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {insights.map((insight, index) => (
              <InsightCard key={insight.id} insight={insight} index={index} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Usage Patterns
          </CardTitle>
          <CardDescription>
            Your activity patterns and trends
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Activity Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-accent/50">
              <div className="text-lg font-bold text-primary">{usagePatterns.mostActiveDay}</div>
              <div className="text-xs text-muted-foreground">Most Active Day</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-accent/50">
              <div className="text-lg font-bold text-primary">{usagePatterns.peakHour}</div>
              <div className="text-xs text-muted-foreground">Peak Hour</div>
            </div>
          </div>

          {/* Streak and Efficiency */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Usage Streak</span>
                <span className="text-sm text-muted-foreground">{usagePatterns.streakDays} days</span>
              </div>
              <Progress value={(usagePatterns.streakDays / 30) * 100} className="h-2" />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Efficiency Score</span>
                <span className="text-sm text-muted-foreground">{usagePatterns.efficiency}%</span>
              </div>
              <Progress value={usagePatterns.efficiency} className="h-2" />
            </div>
          </div>

          {/* Category Breakdown */}
          <div>
            <h4 className="text-sm font-medium mb-3">Category Usage</h4>
            <div className="space-y-2">
              {categoryUsage.map((category) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-${category.color}-500`} />
                    <span className="text-sm">{category.name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">{category.value}%</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Recommendations
          </CardTitle>
          <CardDescription>
            Personalized suggestions based on your usage
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-1">
            {recommendations.map((recommendation, index) => (
              <RecommendationItem 
                key={recommendation.id} 
                recommendation={recommendation} 
                index={index}
              />
            ))}
          </div>
          
          <div className="p-4 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              asChild
            >
              <Link href="/dashboard/activity">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Detailed Analytics
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}