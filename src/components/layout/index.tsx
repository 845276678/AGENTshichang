'use client'

import React from 'react'
import { Header } from './Header'
import { Footer } from './footer'
import { CheckInPrompt } from '@/components/checkin/CheckInPrompt'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: React.ReactNode
  className?: string
  showHeader?: boolean
  showFooter?: boolean
}

export function Layout({
  children,
  className,
  showHeader = true,
  showFooter = true
}: LayoutProps) {
  return (
    <div className={cn('min-h-screen flex flex-col', className)}>
      {showHeader && <Header />}
      <main className="flex-1">
        {children}
      </main>
      {showFooter && <Footer />}
      <CheckInPrompt />
    </div>
  )
}

export default Layout