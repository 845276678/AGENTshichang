'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { ProfileInformation } from '@/components/dashboard/profile/ProfileInformation'
import { AccountSettings } from '@/components/dashboard/profile/AccountSettings'
import { SecuritySettings } from '@/components/dashboard/profile/SecuritySettings'
import { SubscriptionBilling } from '@/components/dashboard/profile/SubscriptionBilling'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  User, 
  Settings, 
  Shield, 
  CreditCard,
  ChevronRight
} from 'lucide-react'

const profileSections = [
  {
    id: 'profile',
    title: 'Profile Information',
    description: 'Manage your personal information and profile details',
    icon: User,
    component: ProfileInformation
  },
  {
    id: 'account',
    title: 'Account Settings',
    description: 'Update your account preferences and privacy settings',
    icon: Settings,
    component: AccountSettings
  },
  {
    id: 'security',
    title: 'Security Settings',
    description: 'Password, two-factor authentication, and login history',
    icon: Shield,
    component: SecuritySettings
  },
  {
    id: 'billing',
    title: 'Subscription & Billing',
    description: 'Manage your subscription, payment methods, and billing',
    icon: CreditCard,
    component: SubscriptionBilling
  }
]

export default function ProfilePage() {
  const [activeSection, setActiveSection] = useState('profile')

  const ActiveComponent = profileSections.find(s => s.id === activeSection)?.component || ProfileInformation

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and profile information
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Settings</CardTitle>
                  <CardDescription>
                    Choose a section to configure
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <nav className="space-y-1">
                    {profileSections.map((section) => {
                      const Icon = section.icon
                      return (
                        <Button
                          key={section.id}
                          variant={activeSection === section.id ? "secondary" : "ghost"}
                          className="w-full justify-start h-auto p-4 text-left"
                          onClick={() => setActiveSection(section.id)}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <Icon className="h-4 w-4 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm">
                                {section.title}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1 hidden sm:block">
                                {section.description}
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                          </div>
                        </Button>
                      )
                    })}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <ActiveComponent />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}