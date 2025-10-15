'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import {
  Search,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  PlusCircle,
  ChevronDown,
  ShoppingCart,
  Gift,
  Lightbulb,
  GitBranch,
  Zap
} from 'lucide-react'

interface HeaderProps {
  className?: string
}

const SearchBar = ({ className }: { className?: string }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/marketplace/search?q=${encodeURIComponent(searchQuery.trim())}`
    } else {
      window.location.href = '/marketplace'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e)
    }
  }

  return (
    <div className={cn('relative', className)}>
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search creative ideas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)} // Delay to allow click on suggestions
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full rounded-full border border-border bg-background/50 py-2 pl-10 pr-4 text-sm",
            "placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
            "transition-all duration-200",
            isFocused && "border-primary bg-background"
          )}
        />
      </form>
      
      {/* Quick search suggestions */}
      <AnimatePresence mode="wait">
        {isFocused && (
          <motion.div
            key="search-suggestions"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-1 w-full rounded-lg border bg-background/95 backdrop-blur-sm shadow-lg z-50"
          >
            <div className="p-2">
              {searchQuery ? (
                <div className="space-y-1">
                  <button
                    onClick={() => handleSearch({ preventDefault: () => {} } as any)}
                    className="w-full text-left px-3 py-2 hover:bg-accent rounded-sm text-sm flex items-center gap-2"
                  >
                    <Search className="h-4 w-4 text-muted-foreground" />
                    Search for "{searchQuery}"
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground px-3 py-1">Popular searches:</p>
                  {['创意', '科技', '文艺', '商业'].map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setSearchQuery(term)
                        window.location.href = `/marketplace/search?q=${encodeURIComponent(term)}`
                      }}
                      className="w-full text-left px-3 py-1 hover:bg-accent rounded-sm text-sm text-muted-foreground"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const CartButton = () => {
  const { totalItems } = useCart()

  return (
    <Link href="/cart">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
      >
        <ShoppingCart className="h-4 w-4" />
        {totalItems > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs text-white flex items-center justify-center font-medium"
          >
            {totalItems > 99 ? '99+' : totalItems}
          </motion.span>
        )}
      </Button>
    </Link>
  )
}

const UserMenu = () => {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    setIsOpen(false)
  }

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MODERATOR'

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border p-1.5 pr-3 hover:bg-accent/50 transition-colors"
      >
        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-agent-500 flex items-center justify-center">
          <User className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-medium hidden sm:block">
          {user?.name || user?.email}
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            key="user-menu"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 rounded-md border bg-background/95 backdrop-blur-sm shadow-lg z-50"
          >
            <div className="p-1">
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User className="h-4 w-4" />
                个人中心
              </Link>
              <Link
                href="/checkin"
                className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Gift className="h-4 w-4" />
                每日签到
              </Link>
              <Link
                href="/daily-idea"
                className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Lightbulb className="h-4 w-4" />
                每日一创意
              </Link>
              <Link
                href="/idea-growth-tree"
                className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <GitBranch className="h-4 w-4" />
                创意生长树
              </Link>
              <Link
                href="/pressure-test"
                className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Zap className="h-4 w-4" />
                创意压力台
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User className="h-4 w-4" />
                Dashboard
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  Admin Panel
                </Link>
              )}
              <Link
                href="/marketplace"
                className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <PlusCircle className="h-4 w-4" />
                创意竞价
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              <hr className="my-1" />
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const MobileMenu = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { isAuthenticated, user } = useAuth()
  const { totalItems } = useCart()

  return (
    <AnimatePresence mode="wait">
      {isOpen && [
        <motion.div
            key="mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />,
        <motion.div
            key="mobile-menu"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-80 border-l bg-background/95 backdrop-blur-sm z-50"
          >
            <div className="flex h-14 items-center justify-between border-b px-4">
              <span className="font-semibold">Menu</span>
              <button
                onClick={onClose}
                className="rounded-sm p-1 hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <SearchBar />
              
              <nav className="space-y-2">
                <Link
                  href="/marketplace"
                  className="block rounded-sm px-3 py-2 text-sm hover:bg-accent transition-colors"
                  onClick={onClose}
                >
                  创意竞价
                </Link>
                <Link
                  href="/daily-idea"
                  className="block rounded-sm px-3 py-2 text-sm hover:bg-accent transition-colors"
                  onClick={onClose}
                >
                  每日一创意
                </Link>
                <Link
                  href="/idea-growth-tree"
                  className="block rounded-sm px-3 py-2 text-sm hover:bg-accent transition-colors"
                  onClick={onClose}
                >
                  创意生长树
                </Link>
                <Link
                  href="/pressure-test"
                  className="block rounded-sm px-3 py-2 text-sm hover:bg-accent transition-colors"
                  onClick={onClose}
                >
                  创意压力台
                </Link>
                <Link
                  href="/business-plan"
                  className="block rounded-sm px-3 py-2 text-sm hover:bg-accent transition-colors"
                  onClick={onClose}
                >
                  创意实现建议
                </Link>
                <Link
                  href="/workshops"
                  className="block rounded-sm px-3 py-2 text-sm hover:bg-accent transition-colors"
                  onClick={onClose}
                >
                  专业工作坊
                </Link>
                <Link
                  href="/solo-company"
                  className="block rounded-sm px-3 py-2 text-sm hover:bg-accent transition-colors"
                  onClick={onClose}
                >
                  一人公司
                </Link>
                <Link
                  href="/categories"
                  className="block rounded-sm px-3 py-2 text-sm hover:bg-accent transition-colors"
                  onClick={onClose}
                >
                  创意分类
                </Link>
                <Link
                  href="/agent-center"
                  className="block rounded-sm px-3 py-2 text-sm hover:bg-accent transition-colors"
                  onClick={onClose}
                >
                  Agent能力中心
                </Link>
                <Link
                  href="/cart"
                  className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent transition-colors"
                  onClick={onClose}
                >
                  <ShoppingCart className="h-4 w-4" />
                  创意购物车 {totalItems > 0 && `(${totalItems})`}
                </Link>
                <Link
                  href="/payment"
                  className="block rounded-sm px-3 py-2 text-sm hover:bg-accent transition-colors"
                  onClick={onClose}
                >
                  积分价格
                </Link>
                <Link
                  href="/about"
                  className="block rounded-sm px-3 py-2 text-sm hover:bg-accent transition-colors"
                  onClick={onClose}
                >
                  关于我们
                </Link>
              </nav>

              <hr />

              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-agent-500 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium">
                      {user?.name || user?.email}
                    </span>
                  </div>
                  <Link
                    href="/profile"
                    className="block rounded-sm px-3 py-2 text-sm hover:bg-accent transition-colors"
                    onClick={onClose}
                  >
                    个人中心
                  </Link>
                  <Link
                    href="/checkin"
                    className="block rounded-sm px-3 py-2 text-sm hover:bg-accent transition-colors"
                    onClick={onClose}
                  >
                    每日签到
                  </Link>
                  <Link
                    href="/dashboard"
                    className="block rounded-sm px-3 py-2 text-sm hover:bg-accent transition-colors"
                    onClick={onClose}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/marketplace"
                    className="block rounded-sm px-3 py-2 text-sm hover:bg-accent transition-colors"
                    onClick={onClose}
                  >
                    创意竞价
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link href="/auth/register" onClick={onClose}>
                    <Button className="w-full">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        ]}
    </AnimatePresence>
  )
}

export function Header({ className }: HeaderProps) {
  const { isAuthenticated } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className={cn(
          'sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
          className
        )}
      >
        <div className="container flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="h-8 w-8 bg-gradient-to-r from-primary to-agent-500 rounded-lg flex items-center justify-center"
            >
              <div className="h-4 w-4 bg-white rounded-sm" />
            </motion.div>
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

          {/* Search Bar - Desktop */}
          <SearchBar className="hidden lg:block max-w-md flex-1 mx-6" />

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Search Icon - Mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => window.location.href = '/marketplace/search'}
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Cart Button */}
            <CartButton />

            {/* Auth Section */}
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/auth/register">
                  <Button>
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  )
}