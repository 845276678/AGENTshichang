/**
 * 一人公司日程规划页面
 *
 * 帮助独立创业者以六大部门视角规划和跟踪日常工作
 * 让个人也能像管理公司一样高效规划时间
 */

'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  Calendar,
  Clock,
  TrendingUp,
  Users,
  Brain,
  Cog,
  DollarSign,
  Heart,
  ChevronLeft,
  ChevronRight,
  Plus,
  MoreHorizontal
} from 'lucide-react'
import SoloCompanyDashboard from '@/components/solo-company/SoloCompanyDashboard'

// 六大部门配置
export const DEPARTMENTS = {
  board: {
    id: 'board',
    name: '董事会',
    description: '战略决策',
    icon: Building2,
    color: 'purple',
    focus: '思考大方向、做重要决策',
    examples: ['制定月度目标', '分析竞争对手', '评估新机会', '风险评估']
  },
  rd: {
    id: 'rd',
    name: '研发部',
    description: '产品创新',
    icon: Brain,
    color: 'blue',
    focus: '产品设计、技术开发',
    examples: ['功能开发', '技术学习', '产品设计', 'Bug修复']
  },
  production: {
    id: 'production',
    name: '生产部',
    description: '执行交付',
    icon: Cog,
    color: 'green',
    focus: '项目执行、任务完成',
    examples: ['完成开发任务', '测试产品', '部署上线', '处理工单']
  },
  marketing: {
    id: 'marketing',
    name: '市场部',
    description: '客户连接',
    icon: TrendingUp,
    color: 'orange',
    focus: '推广营销、客户沟通',
    examples: ['内容创作', '社交媒体', '客户服务', '市场调研']
  },
  finance: {
    id: 'finance',
    name: '财务部',
    description: '资金管理',
    icon: DollarSign,
    color: 'yellow',
    focus: '收支管理、财务规划',
    examples: ['记账报税', '成本分析', '收入统计', '预算规划']
  },
  hr: {
    id: 'hr',
    name: '行政部',
    description: '个人健康',
    icon: Heart,
    color: 'pink',
    focus: '健康管理、个人成长',
    examples: ['运动健身', '学习充电', '休息放松', '反思总结']
  }
} as const

export type DepartmentId = keyof typeof DEPARTMENTS

export default function SoloCompanyPage() {
  const currentDate = new Date()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* 页面头部 - 重新设计 */}
      <div className="relative bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-sm">
        {/* 装饰性背景 */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-indigo-500/5" />
        <div className="absolute top-0 right-0 w-96 h-32 bg-gradient-to-l from-purple-500/10 to-transparent blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/25">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">CEO</span>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent">
                  我的一人公司
                </h1>
                <p className="text-lg text-gray-600 mt-1">像CEO一样规划你的每一天，掌控六大核心部门</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Clock className="w-4 h-4 text-blue-500" />
                  {currentDate.toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long'
                  })}
                </div>
              </div>
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/25 border-0 px-6"
              >
                <Plus className="w-5 h-5 mr-2" />
                新增计划
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 - 优化布局 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <SoloCompanyDashboard />
      </div>
    </div>
  )
}