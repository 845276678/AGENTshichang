'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Clock, 
  ShoppingCart, 
  Eye, 
  Star, 
  User, 
  Activity,
  Calendar,
  Filter
} from 'lucide-react'

interface ActivityTimelineProps {
  activityFilter: string
  searchQuery: string
  dateRange: { start: string; end: string }
}

const mockActivities = [
  {
    id: '1',
    type: 'purchase',
    title: 'Purchased Content Writer Pro',
    description: 'Successfully purchased premium AI writing assistant for $29.99',
    timestamp: '2024-01-15T14:30:00Z',
    icon: ShoppingCart,
    color: 'success',
    metadata: { agentName: 'Content Writer Pro', amount: '$29.99' }
  },
  {
    id: '2',
    type: 'usage',
    title: 'Used Code Assistant',
    description: 'Generated 45 lines of React code and 3 unit tests',
    timestamp: '2024-01-15T10:15:00Z',
    icon: Activity,
    color: 'primary',
    metadata: { agentName: 'Code Assistant', duration: '2h 15m' }
  },
  {
    id: '3',
    type: 'review',
    title: 'Reviewed Data Analyzer',
    description: 'Left a 5-star review: "Excellent tool for data visualization and insights"',
    timestamp: '2024-01-14T16:45:00Z',
    icon: Star,
    color: 'warning',
    metadata: { agentName: 'Data Analyzer', rating: 5 }
  },
  {
    id: '4',
    type: 'view',
    title: 'Viewed Social Media Manager',
    description: 'Explored features, pricing, and read 12 user reviews',
    timestamp: '2024-01-13T09:20:00Z',
    icon: Eye,
    color: 'secondary',
    metadata: { agentName: 'Social Media Manager', duration: '8m' }
  },
  {
    id: '5',
    type: 'account',
    title: 'Updated Profile',
    description: 'Modified profile picture, bio, and added GitHub link',
    timestamp: '2024-01-12T11:30:00Z',
    icon: User,
    color: 'primary',
    metadata: {}
  }
]

export function ActivityTimeline({ activityFilter, searchQuery, dateRange }: ActivityTimelineProps) {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {return 'Just now'}
    if (diffInHours < 24) {return `${diffInHours} hours ago`}
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) {return `${diffInDays} days ago`}
    
    return date.toLocaleDateString()
  }

  const filteredActivities = mockActivities.filter(activity => {
    const matchesFilter = activityFilter === 'all' || activity.type === activityFilter
    const matchesSearch = !searchQuery || 
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    // TODO: Implement date range filtering
    return matchesFilter && matchesSearch
  })

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'purchase': return 'success'
      case 'usage': return 'primary'
      case 'review': return 'warning'
      case 'view': return 'secondary'
      case 'account': return 'primary'
      default: return 'secondary'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'purchase': return 'Purchase'
      case 'usage': return 'Usage'
      case 'review': return 'Review'
      case 'view': return 'View'
      case 'account': return 'Account'
      default: return type
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Activity Timeline
        </CardTitle>
        <CardDescription>
          {filteredActivities.length} activities found
          {activityFilter !== 'all' && ` • Filtered by ${getTypeLabel(activityFilter)}`}
          {searchQuery && ` • Search: "${searchQuery}"`}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {filteredActivities.length > 0 ? (
          <div className="space-y-6">
            {filteredActivities.map((activity, index) => {
              const Icon = activity.icon
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative flex gap-4 pb-6 last:pb-0"
                >
                  {/* Timeline line */}
                  {index < filteredActivities.length - 1 && (
                    <div className="absolute left-6 top-12 bottom-0 w-px bg-border" />
                  )}
                  
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-${activity.color}-50 dark:bg-${activity.color}-900/20 flex items-center justify-center border-2 border-background shadow-sm`}>
                    <Icon className={`h-5 w-5 text-${activity.color}-600`} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-semibold text-sm">{activity.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {activity.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant={getTypeColor(activity.type) as any} className="text-xs">
                          {getTypeLabel(activity.type)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Metadata */}
                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {activity.metadata.agentName && (
                          <Badge variant="outline" className="text-xs">
                            {activity.metadata.agentName}
                          </Badge>
                        )}
                        {activity.metadata.amount && (
                          <Badge variant="secondary" className="text-xs">
                            {activity.metadata.amount}
                          </Badge>
                        )}
                        {activity.metadata.duration && (
                          <Badge variant="secondary" className="text-xs">
                            {activity.metadata.duration}
                          </Badge>
                        )}
                        {activity.metadata.rating && (
                          <Badge variant="warning" className="text-xs">
                            {activity.metadata.rating} ⭐
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">No activity found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery || activityFilter !== 'all' || dateRange.start || dateRange.end
                ? "Try adjusting your filters to see more activities"
                : "Start using agents to see your activity timeline here"
              }
            </p>
            {(!searchQuery && activityFilter === 'all' && !dateRange.start && !dateRange.end) && (
              <Button>
                Browse Agents
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}