'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/Header'
import {
  LayoutDashboard,
  User,
  Bot,
  Activity,
  Settings,
  Menu,
  X,
  ChevronRight,
  Home,
  Search
} from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const sidebarItems = [
  {
    href: '/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
    description: 'Overview and statistics'
  },
  {
    href: '/dashboard/agents',
    icon: Bot,
    label: 'My Agents',
    description: 'Purchased and created agents'
  },
  {
    href: '/dashboard/activity',
    icon: Activity,
    label: 'Activity',
    description: 'Recent activity and usage'
  },
  {
    href: '/dashboard/profile',
    icon: User,
    label: 'Profile',
    description: 'Profile and account settings'
  }
]

const quickActions = [
  {
    href: '/agents',
    icon: Search,
    label: 'Browse Agents',
    description: 'Discover new AI agents'
  },
  {
    href: '/agents/create',
    icon: Bot,
    label: 'Create Agent',
    description: 'Build your own agent'
  },
  {
    href: '/',
    icon: Home,
    label: 'Marketplace',
    description: 'Return to homepage'
  }
]

const Sidebar = ({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) => {
  const pathname = usePathname()
  const { user } = useAuth()

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* User Profile Section */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-agent-500 flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">
              {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.username || user?.email}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                {...(onClose && { onClick: onClose })}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-all hover:bg-accent",
                  isActive 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{item.label}</div>
                  <div className={cn(
                    "text-xs mt-0.5",
                    isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                  )}>
                    {item.description}
                  </div>
                </div>
                <ChevronRight className={cn(
                  "h-4 w-4 shrink-0 transition-transform",
                  isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                )} />
              </Link>
            )
          })}
        </div>

        <div className="pt-6">
          <div className="px-3 mb-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Quick Actions
            </h3>
          </div>
          <div className="space-y-1">
            {quickActions.map((action) => {
              const Icon = action.icon
              
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  {...(onClose && { onClick: onClose })}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{action.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {action.description}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <Link
          href="/settings"
          {...(onClose && { onClick: onClose })}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </Link>
      </div>
    </div>
  )

  // Mobile sidebar
  if (isOpen !== undefined) {
    return (
      <AnimatePresence mode="wait">
        {isOpen && [
          <motion.div
            key="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 z-40 lg:hidden"
            onClick={onClose}
          />,
          <motion.div
            key="sidebar-content"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed left-0 top-0 h-full w-72 bg-background border-r z-50 lg:hidden"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold">Dashboard</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {sidebarContent}
          </motion.div>
        ]}
      </AnimatePresence>
    )
  }

  // Desktop sidebar
  return (
    <div className="hidden lg:block w-72 border-r bg-background">
      <div className="h-16 border-b flex items-center px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gradient-to-r from-primary to-agent-500 rounded-lg flex items-center justify-center">
            <div className="h-4 w-4 bg-white rounded-sm" />
          </div>
          <span className="font-bold text-lg">Dashboard</span>
        </Link>
      </div>
      {sidebarContent}
    </div>
  )
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Header - only shown on mobile */}
      <div className="lg:hidden">
        <Header />
      </div>

      <div className="flex min-h-screen lg:min-h-screen">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Mobile Sidebar */}
        <Sidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Mobile Header Bar */}
          <div className="lg:hidden border-b p-4 flex items-center justify-between bg-background">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <span className="font-semibold">Dashboard</span>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>

          {/* Content Area */}
          <main className="flex-1">
            <div className="container max-w-7xl mx-auto p-6 pb-16">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
