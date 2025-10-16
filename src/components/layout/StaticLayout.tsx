/**
 * 静态布局组件 (不包含认证逻辑)
 * 用于公开页面，如工作坊列表页面
 */

import React from 'react'
import { cn } from '@/lib/utils'
import { StaticHeader } from './StaticHeader'

interface StaticLayoutProps {
  children: React.ReactNode
  className?: string
  showHeader?: boolean
}

export function StaticLayout({
  children,
  className,
  showHeader = true
}: StaticLayoutProps) {
  return (
    <div className={cn('min-h-screen flex flex-col', className)}>
      {showHeader && <StaticHeader />}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}

export default StaticLayout