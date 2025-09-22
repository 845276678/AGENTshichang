'use client'

import React from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { DashboardOverview } from '@/components/dashboard/DashboardOverview'
import { MyAgentsSection } from '@/components/dashboard/MyAgentsSection'
import { RecentActivityFeed } from '@/components/dashboard/RecentActivityFeed'
import { QuickStatsInsights } from '@/components/dashboard/QuickStatsInsights'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Dashboard Overview */}
          <DashboardOverview />
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - My Agents */}
            <div className="lg:col-span-2">
              <MyAgentsSection />
            </div>
            
            {/* Right Column - Activity & Stats */}
            <div className="space-y-6">
              <RecentActivityFeed />
              <QuickStatsInsights />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}