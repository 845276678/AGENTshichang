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
    <div className="min-h-screen bg-gray-50">
      {/* 页面头部 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">我的一人公司</h1>
                <p className="text-gray-600">像CEO一样规划你的每一天</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm">
                <Clock className="w-3 h-3 mr-1" />
                {currentDate.toLocaleDateString('zh-CN', {
                  month: 'long',
                  day: 'numeric',
                  weekday: 'short'
                })}
              </Badge>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                新增计划
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SoloCompanyDashboard />
      </div>
    </div>
  )
}