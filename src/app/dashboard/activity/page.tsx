'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { ActivityTimeline } from '@/components/dashboard/activity/ActivityTimeline'
import { UsageAnalytics } from '@/components/dashboard/activity/UsageAnalytics'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar,
  Download,
  Filter,
  BarChart3,
  Activity,
  Search
} from 'lucide-react'

const activityTypes = [
  { id: 'all', label: 'All Activity', color: 'default' },
  { id: 'purchases', label: 'Purchases', color: 'success' },
  { id: 'views', label: 'Agent Views', color: 'primary' },
  { id: 'reviews', label: 'Reviews', color: 'warning' },
  { id: 'account', label: 'Account Changes', color: 'secondary' }
]

export default function ActivityPage() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [showAnalytics, setShowAnalytics] = useState(false)

  // Set default date range to last 30 days
  useEffect(() => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 30)
    
    setDateRange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    })
  }, [])

  const handleExportData = () => {
    // TODO: Implement data export functionality
    console.log('Exporting activity data...')
  }

  // const filteredActivityTypes = activeFilter === 'all' 
    ? activityTypes.slice(1) // Exclude 'all' option
    : activityTypes.filter(type => type.id === activeFilter)

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Activity Timeline</h1>
              <p className="text-muted-foreground">
                Track your account activity and usage patterns
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant={showAnalytics ? "default" : "outline"}
                onClick={() => setShowAnalytics(!showAnalytics)}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {showAnalytics ? 'Show Timeline' : 'Show Analytics'}
              </Button>
              <Button variant="outline" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
              <CardDescription>
                Filter your activity by type, date range, or search terms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search activity..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Activity Type Filter */}
              <div>
                <label className="text-sm font-medium mb-3 block">Activity Type</label>
                <div className="flex flex-wrap gap-2">
                  {activityTypes.map((type) => (
                    <Button
                      key={type.id}
                      variant={activeFilter === type.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveFilter(type.id)}
                      className="h-8"
                    >
                      <Activity className="h-3 w-3 mr-1" />
                      {type.label}
                      {type.id !== 'all' && (
                        <Badge 
                          variant="secondary" 
                          className="ml-2 h-4 px-1.5 text-xs"
                        >
                          {Math.floor(Math.random() * 50) + 1}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Start Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">End Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Active Filters Summary */}
              {(activeFilter !== 'all' || searchQuery || dateRange.start || dateRange.end) && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                  <span className="text-sm text-muted-foreground">Active filters:</span>
                  {activeFilter !== 'all' && (
                    <Badge variant="secondary" className="h-6">
                      Type: {activityTypes.find(t => t.id === activeFilter)?.label}
                    </Badge>
                  )}
                  {searchQuery && (
                    <Badge variant="secondary" className="h-6">
                      Search: "{searchQuery}"
                    </Badge>
                  )}
                  {(dateRange.start || dateRange.end) && (
                    <Badge variant="secondary" className="h-6">
                      Date: {dateRange.start || 'Start'} - {dateRange.end || 'End'}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setActiveFilter('all')
                      setSearchQuery('')
                      setDateRange({ start: '', end: '' })
                    }}
                    className="h-6 px-2 text-xs"
                  >
                    Clear all
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Main Content */}
          {showAnalytics ? (
            <UsageAnalytics
              activityFilter={activeFilter}
              searchQuery={searchQuery}
              dateRange={dateRange}
            />
          ) : (
            <ActivityTimeline
              activityFilter={activeFilter}
              searchQuery={searchQuery}
              dateRange={dateRange}
            />
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}