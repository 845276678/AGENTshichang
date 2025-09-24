'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Clock, 
  Target,
  Calendar,
  Activity,
  DollarSign
} from 'lucide-react'

interface UsageAnalyticsProps {
  activityFilter: string
  searchQuery: string
  dateRange: { start: string; end: string }
}

const mockAnalytics = {
  totalActivity: 156,
  timeSpent: 42.5, // hours
  favoriteCategory: 'Creative',
  mostUsedAgent: 'Content Writer Pro',
  efficiency: 94,
  costSavings: 2340,
  
  categoryBreakdown: [
    { name: 'Creative', value: 45, count: 67, color: 'primary' },
    { name: 'Development', value: 30, count: 43, color: 'success' },
    { name: 'Business', value: 15, count: 28, color: 'warning' },
    { name: 'Marketing', value: 10, count: 18, color: 'error' }
  ],

  activityByType: [
    { name: 'Agent Usage', count: 89, percentage: 57 },
    { name: 'Browsing', count: 34, percentage: 22 },
    { name: 'Purchases', count: 23, percentage: 15 },
    { name: 'Reviews', count: 10, percentage: 6 }
  ],

  weeklyUsage: [
    { day: 'Mon', hours: 4.2 },
    { day: 'Tue', hours: 8.1 },
    { day: 'Wed', hours: 6.3 },
    { day: 'Thu', hours: 7.8 },
    { day: 'Fri', hours: 5.9 },
    { day: 'Sat', hours: 3.1 },
    { day: 'Sun', hours: 7.1 }
  ],

  topAgents: [
    { name: 'Content Writer Pro', usage: 156, category: 'Creative' },
    { name: 'Code Assistant', usage: 89, category: 'Development' },
    { name: 'Data Analyzer', usage: 67, category: 'Business' },
    { name: 'Social Media Manager', usage: 45, category: 'Marketing' },
    { name: 'Email Assistant', usage: 34, category: 'Productivity' }
  ]
}

export function UsageAnalytics({ activityFilter: _activityFilter, searchQuery: _searchQuery, dateRange: _dateRange }: UsageAnalyticsProps) {
  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'primary' }: {
    title: string
    value: string | number
    subtitle: string
    icon: React.ElementType
    color?: string
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            </div>
            <div className={`p-3 rounded-lg bg-${color}-50 text-${color}-600 dark:bg-${color}-900/20`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Activity"
          value={mockAnalytics.totalActivity}
          subtitle="Actions this month"
          icon={Activity}
          color="primary"
        />
        <StatCard
          title="Time Spent"
          value={`${mockAnalytics.timeSpent}h`}
          subtitle="Using AI agents"
          icon={Clock}
          color="success"
        />
        <StatCard
          title="Efficiency Score"
          value={`${mockAnalytics.efficiency}%`}
          subtitle="Above average"
          icon={Target}
          color="warning"
        />
        <StatCard
          title="Cost Savings"
          value={`$${mockAnalytics.costSavings}`}
          subtitle="Estimated value"
          icon={DollarSign}
          color="error"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Category Usage
            </CardTitle>
            <CardDescription>
              How you use different agent categories
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockAnalytics.categoryBreakdown.map((category) => (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-${category.color}-500`} />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{category.count}</span>
                    <Badge variant="secondary" className="text-xs">
                      {category.value}%
                    </Badge>
                  </div>
                </div>
                <Progress value={category.value} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Activity Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Activity Breakdown
            </CardTitle>
            <CardDescription>
              Types of actions you perform most
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockAnalytics.activityByType.map((activity, index) => (
              <motion.div
                key={activity.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{activity.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{activity.count}</span>
                    <Badge variant="outline" className="text-xs">
                      {activity.percentage}%
                    </Badge>
                  </div>
                </div>
                <Progress value={activity.percentage} />
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Usage Pattern */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Usage Pattern
          </CardTitle>
          <CardDescription>
            Your activity throughout the week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-4">
            {mockAnalytics.weeklyUsage.map((day, index) => {
              const maxHours = Math.max(...mockAnalytics.weeklyUsage.map(d => d.hours))
              const height = (day.hours / maxHours) * 100
              
              return (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="mb-2 h-24 flex items-end justify-center">
                    <div
                      className="w-8 bg-primary rounded-t transition-all duration-300 hover:bg-primary/80"
                      style={{ height: `${height}%`, minHeight: '4px' }}
                    />
                  </div>
                  <div className="text-xs font-medium">{day.day}</div>
                  <div className="text-xs text-muted-foreground">{day.hours}h</div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Agents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Most Used Agents
          </CardTitle>
          <CardDescription>
            Your favorite AI agents ranked by usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAnalytics.topAgents.map((agent, index) => {
              const maxUsage = mockAnalytics.topAgents[0]?.usage || 1
              const percentage = (agent.usage / maxUsage) * 100
              
              return (
                <motion.div
                  key={agent.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground w-4">
                        #{index + 1}
                      </span>
                      <span className="font-medium">{agent.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {agent.category}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {agent.usage} uses
                    </span>
                  </div>
                  <Progress value={percentage} />
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Insights and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
          <CardDescription>
            Patterns and recommendations based on your usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <h4 className="font-semibold text-primary mb-2">Peak Activity</h4>
              <p className="text-sm text-muted-foreground">
                You're most active on Tuesdays around 2 PM. Consider scheduling important tasks during this time.
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-success-50 border border-success-200 dark:bg-success-900/20">
              <h4 className="font-semibold text-success-700 dark:text-success-400 mb-2">Efficiency Boost</h4>
              <p className="text-sm text-muted-foreground">
                Your {mockAnalytics.favoriteCategory} agents have saved you an estimated 45 hours this month.
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-warning-50 border border-warning-200 dark:bg-warning-900/20">
              <h4 className="font-semibold text-warning-700 dark:text-warning-400 mb-2">Opportunity</h4>
              <p className="text-sm text-muted-foreground">
                You might benefit from exploring Business category agents to boost productivity further.
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-secondary/50 border">
              <h4 className="font-semibold mb-2">Usage Streak</h4>
              <p className="text-sm text-muted-foreground">
                You've been consistently active for 15 days straight. Keep up the great work!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}