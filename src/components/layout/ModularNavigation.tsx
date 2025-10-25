'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Lightbulb,
  Zap,
  BookOpen,
  Bot,
  ChevronDown,
  TrendingUp,
  Calendar,
  Grid3X3,
  GitBranch,
  Target,
  BarChart3,
  GraduationCap,
  Bookmark,
  Users,
  Building
} from 'lucide-react'

interface NavDropdownProps {
  title: string
  href: string
  icon: React.ReactNode
  description: string
  subPages: Array<{
    title: string
    href: string
    description: string
    icon?: React.ReactNode
  }>
}

const iconMap = {
  TrendingUp,
  Calendar,
  Grid3X3,
  GitBranch,
  Target,
  BarChart3,
  GraduationCap,
  Bookmark,
  Users,
  Building
}

const getSubPageIcon = (title: string) => {
  if (title.includes('竞价')) return <TrendingUp className="w-4 h-4" />
  if (title.includes('每日')) return <Calendar className="w-4 h-4" />
  if (title.includes('分类')) return <Grid3X3 className="w-4 h-4" />
  if (title.includes('生长树')) return <GitBranch className="w-4 h-4" />
  if (title.includes('压力台')) return <Target className="w-4 h-4" />
  if (title.includes('实现建议')) return <BarChart3 className="w-4 h-4" />
  if (title.includes('工作坊')) return <GraduationCap className="w-4 h-4" />
  if (title.includes('知识库')) return <Bookmark className="w-4 h-4" />
  if (title.includes('Agent')) return <Users className="w-4 h-4" />
  if (title.includes('一人公司')) return <Building className="w-4 h-4" />
  return <div className="w-4 h-4" />
}

const NavDropdown: React.FC<NavDropdownProps> = ({ title, href, icon, description, subPages }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <Link
        href={href}
        className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary px-3 py-2 rounded-md hover:bg-accent/50"
      >
        {icon}
        {title}
        <ChevronDown className={cn(
          "w-3 h-3 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </Link>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50"
          >
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center gap-3 mb-2">
                {icon}
                <h3 className="font-semibold text-gray-900">{title}</h3>
              </div>
              <p className="text-sm text-gray-600">{description}</p>
            </div>

            <div className="p-2">
              {subPages.map((subPage, index) => (
                <Link
                  key={index}
                  href={subPage.href}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getSubPageIcon(subPage.title)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {subPage.title}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {subPage.description}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="p-3 border-t border-gray-100 bg-gray-50">
              <Link
                href={href}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                查看全部 {title} 功能
                <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export const ModularNavigation = () => {
  const navigationItems = [
    {
      title: '创意中心',
      href: '/marketplace',
      icon: <Lightbulb className="w-4 h-4" />,
      description: '创意竞价、工作坊和一人公司',
      subPages: [
        {
          title: '创意竞价',
          href: '/marketplace/bidding',
          description: '参与AI创意竞价，获得专业评估'
        },
        {
          title: '专业工作坊',
          href: '/workshops',
          description: '通过工作坊完善和实现创意'
        },
        {
          title: '一人公司',
          href: '/solo-company',
          description: '个人创业全流程助手'
        }
      ]
    },
    {
      title: '创意工具',
      href: '/idea-growth-tree',
      icon: <Zap className="w-4 h-4" />,
      description: '分析和开发创意的专业工具',
      subPages: [
        {
          title: '创意生长树',
          href: '/idea-growth-tree',
          description: '可视化创意发展路径'
        },
        {
          title: '创意压力台',
          href: '/pressure-test',
          description: '压力测试创意可行性'
        },
        {
          title: '创意实现建议',
          href: '/business-plan',
          description: '生成详细的商业计划'
        },
        {
          title: '每日一创意',
          href: '/daily-idea',
          description: '每日精选创意推荐'
        }
      ]
    },
    {
      title: '学习成长',
      href: '/workshops',
      icon: <BookOpen className="w-4 h-4" />,
      description: '知识学习和技能提升',
      subPages: [
        {
          title: '创意分类浏览',
          href: '/categories',
          description: '按分类浏览创意内容'
        },
        {
          title: '知识库收藏夹',
          href: '/knowledge-vault',
          description: '收集和管理知识资源'
        }
      ]
    },
    {
      title: 'AI服务',
      href: '/agent-center',
      icon: <Bot className="w-4 h-4" />,
      description: 'AI智能体和自动化服务',
      subPages: [
        {
          title: 'Agent能力中心',
          href: '/agent-center',
          description: 'AI智能体能力展示'
        }
      ]
    }
  ]

  return (
    <nav className="hidden lg:flex items-center space-x-1">
      {navigationItems.map((item, index) => (
        <NavDropdown
          key={index}
          title={item.title}
          href={item.href}
          icon={item.icon}
          description={item.description}
          subPages={item.subPages}
        />
      ))}
    </nav>
  )
}

export default ModularNavigation