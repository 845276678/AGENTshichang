'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  ShoppingCart, 
  Eye, 
  Star, 
  User, 
  Clock,
  ArrowRight,
  MoreHorizontal
} from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'purchase' | 'view' | 'review' | 'account' | 'usage'
  title: string
  description: string
  timestamp: string
  icon: React.ElementType
  color: string
  metadata?: {
    agentName?: string
    rating?: number
    amount?: string
    hours?: number
  }
}

// Mock activity data
const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'purchase',
    title: 'Purchased Content Writer Pro',
    description: 'Successfully purchased premium AI writing assistant',
    timestamp: '2 hours ago',
    icon: ShoppingCart,
    color: 'success',
    metadata: {
      agentName: 'Content Writer Pro',
      amount: '$29.99'
    }
  },
  {
    id: '2',
    type: 'usage',
    title: 'Used Code Assistant',
    description: 'Generated 45 lines of React code',
    timestamp: '4 hours ago',
    icon: Activity,
    color: 'primary',
    metadata: {
      agentName: 'Code Assistant',
      hours: 2
    }
  },
  {
    id: '3',
    type: 'review',
    title: 'Reviewed Data Analyzer',
    description: 'Left a 5-star review for data analysis tool',
    timestamp: '1 day ago',
    icon: Star,
    color: 'warning',
    metadata: {
      agentName: 'Data Analyzer',
      rating: 5
    }
  },
  {
    id: '4',
    type: 'view',
    title: 'Viewed Social Media Manager',
    description: 'Explored features and pricing options',
    timestamp: '2 days ago',
    icon: Eye,
    color: 'secondary',
    metadata: {
      agentName: 'Social Media Manager'
    }
  },
  {
    id: '5',
    type: 'account',
    title: 'Updated Profile',
    description: 'Modified profile picture and bio information',
    timestamp: '3 days ago',
    icon: User,
    color: 'primary',
    metadata: {}
  },
  {
    id: '6',
    type: 'usage',
    title: 'Used Email Assistant',
    description: 'Generated 12 professional emails',
    timestamp: '4 days ago',
    icon: Activity,
    color: 'primary',
    metadata: {
      agentName: 'Email Assistant',
      hours: 1
    }
  },
  {
    id: '7',
    type: 'purchase',
    title: 'Purchased Language Translator',
    description: 'Added multilingual translation capabilities',
    timestamp: '1 week ago',
    icon: ShoppingCart,
    color: 'success',
    metadata: {
      agentName: 'Language Translator',
      amount: '$19.99'
    }
  }
]

const ActivityItemComponent = ({ activity, index }: { activity: ActivityItem; index: number }) => {
  const Icon = activity.icon

  const getActivityLink = () => {
    switch (activity.type) {
      case 'purchase':
      case 'view':
      case 'usage':
      case 'review':
        return activity.metadata?.agentName ? `/agents/${activity.metadata.agentName.toLowerCase().replace(/\s+/g, '-')}` : '#'
      case 'account':
        return '/dashboard/profile'
      default:
        return '#'
    }
  }

  const renderMetadata = () => {
    if (!activity.metadata) {return null}

    switch (activity.type) {
      case 'purchase':
        return (
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              {activity.metadata.amount}
            </Badge>
            {activity.metadata.agentName && (
              <Badge variant="outline" className="text-xs">
                {activity.metadata.agentName}
              </Badge>
            )}
          </div>
        )
      case 'review':
        return (
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1">
              {[...Array(activity.metadata.rating || 0)].map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-warning-600 text-warning-600" />
              ))}
            </div>
            {activity.metadata.agentName && (
              <Badge variant="outline" className="text-xs">
                {activity.metadata.agentName}
              </Badge>
            )}
          </div>
        )
      case 'usage':
        return (
          <div className="flex items-center gap-2 mt-2">
            {activity.metadata.hours && (
              <Badge variant="secondary" className="text-xs">
                {activity.metadata.hours}h
              </Badge>
            )}
            {activity.metadata.agentName && (
              <Badge variant="outline" className="text-xs">
                {activity.metadata.agentName}
              </Badge>
            )}
          </div>
        )
      case 'view':
        return (
          activity.metadata.agentName && (
            <Badge variant="outline" className="text-xs mt-2">
              {activity.metadata.agentName}
            </Badge>
          )
        )
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-start gap-4 group hover:bg-accent/50 p-3 rounded-lg transition-colors cursor-pointer"
    >
      {/* Icon */}
      <div className={`p-2 rounded-lg bg-${activity.color}-50 text-${activity.color}-600 dark:bg-${activity.color}-900/20 shrink-0`}>
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
              {activity.title}
            </h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {activity.description}
            </p>
            {renderMetadata()}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{activity.timestamp}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function RecentActivityFeed() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest actions and interactions
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="max-h-[400px] overflow-y-auto">
          {mockActivities.length > 0 ? (
            <div className="space-y-1">
              {mockActivities.map((activity, index) => (
                <ActivityItemComponent 
                  key={activity.id} 
                  activity={activity} 
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No recent activity</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start using agents to see your activity here
              </p>
              <Button size="sm" asChild>
                <Link href="/agents">
                  Browse Agents
                </Link>
              </Button>
            </div>
          )}
        </div>
        
        {mockActivities.length > 0 && (
          <div className="p-4 border-t">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full"
              asChild
            >
              <Link href="/dashboard/activity">
                View All Activity
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}