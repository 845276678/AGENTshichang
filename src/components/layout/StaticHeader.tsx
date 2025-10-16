/**
 * 静态导航头部组件 (不包含认证逻辑)
 * 用于不需要认证状态的页面，避免加载问题
 */

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Search, ShoppingCart, User } from 'lucide-react'

interface StaticHeaderProps {
  className?: string
}

export function StaticHeader({ className }: StaticHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-gradient-to-r from-primary to-agent-500 rounded-lg flex items-center justify-center">
            <div className="h-4 w-4 bg-white rounded-sm" />
          </div>
          <span className="font-bold text-lg hidden sm:inline-block">
            创意交易市场
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/marketplace"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            创意竞价
          </Link>
          <Link
            href="/daily-idea"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            每日一创意
          </Link>
          <Link
            href="/idea-growth-tree"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            创意生长树
          </Link>
          <Link
            href="/pressure-test"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            创意压力台
          </Link>
          <Link
            href="/business-plan"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            创意实现建议
          </Link>
          <Link
            href="/workshops"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            专业工作坊
          </Link>
          <Link
            href="/solo-company"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            一人公司
          </Link>
          <Link
            href="/categories"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            创意分类
          </Link>
          <Link
            href="/agent-center"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Agent能力中心
          </Link>
          <Link
            href="/payment"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            积分价格
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            关于我们
          </Link>
        </nav>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Search Icon */}
          <Button
            variant="ghost"
            size="icon"
            asChild
          >
            <Link href="/marketplace/search">
              <Search className="h-4 w-4" />
            </Link>
          </Button>

          {/* Cart Button */}
          <Button
            variant="ghost"
            size="icon"
            asChild
          >
            <Link href="/cart">
              <ShoppingCart className="h-4 w-4" />
            </Link>
          </Button>

          {/* Auth Section - Static */}
          <div className="hidden md:flex items-center space-x-2">
            <Link href="/auth/register">
              <Button>
                Sign Up
              </Button>
            </Link>
          </div>

          {/* Profile Icon - Static */}
          <Button
            variant="ghost"
            size="icon"
            asChild
          >
            <Link href="/profile">
              <User className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}