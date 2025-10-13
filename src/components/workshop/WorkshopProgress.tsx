/**
 * 工作坊进度组件
 *
 * 提供工作坊进度的可视化显示和管理功能：
 * - 进度条和百分比显示
 * - 步骤完成状态
 * - 保存状态和时间戳
 * - 快速跳转功能
 */

'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  CheckCircle,
  Circle,
  Clock,
  Save,
  Loader2,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Trophy,
  Target,
  Calendar,
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { type WorkshopSession } from '@/hooks/useWorkshopSession'

// 组件Props接口
export interface WorkshopProgressProps {
  session: WorkshopSession
  isLoading?: boolean
  isSaving?: boolean
  hasUnsavedChanges?: boolean
  lastSaveAt?: Date | null
  onStepClick?: (step: number) => void
  onSaveSession?: () => Promise<boolean>
  onResetProgress?: () => void
  onResumeSession?: () => void
  className?: string
}

// 工作坊配置
const WORKSHOP_CONFIG = {
  'demand-validation': {
    title: '需求验证实验室',
    icon: Target,
    color: 'blue',
    steps: [
      { id: 1, title: '目标客户定义', description: '明确目标用户群体' },
      { id: 2, title: '需求场景描述', description: '详细描述使用场景' },
      { id: 3, title: '价值验证', description: '确定核心价值主张' },
      { id: 4, title: '验证计划', description: '制定验证实施计划' }
    ]
  },
  'mvp-builder': {
    title: 'MVP构建工作坊',
    icon: Play,
    color: 'green',
    steps: [
      { id: 1, title: '核心功能定义', description: '确定必须功能' },
      { id: 2, title: '用户故事创建', description: '编写用户故事' },
      { id: 3, title: '技术方案设计', description: '选择技术栈' },
      { id: 4, title: '原型设计', description: '创建交互原型' }
    ]
  },
  'growth-hacking': {
    title: '增长黑客训练营',
    icon: Trophy,
    color: 'purple',
    steps: [
      { id: 1, title: '增长目标设定', description: '定义北极星指标' },
      { id: 2, title: 'AARRR漏斗分析', description: '分析用户旅程' },
      { id: 3, title: '实验设计', description: '设计增长实验' }
    ]
  },
  'profit-model': {
    title: '商业模式设计',
    icon: Calendar,
    color: 'orange',
    steps: [
      { id: 1, title: '商业模式画布', description: '构建业务画布' },
      { id: 2, title: '财务模型构建', description: '建立收益模型' },
      { id: 3, title: '盈利路径规划', description: '规划盈利策略' }
    ]
  }
}

// 获取状态颜色类
function getStatusColor(status: string, color: string) {
  const colorMap = {
    'IN_PROGRESS': `text-${color}-600 bg-${color}-50`,
    'COMPLETED': 'text-green-600 bg-green-50',
    'ABANDONED': 'text-gray-500 bg-gray-50'
  }
  return colorMap[status as keyof typeof colorMap] || colorMap.IN_PROGRESS
}

// 格式化时间显示
function formatLastSave(date: Date | null): string {
  if (!date) return '从未保存'

  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  return `${days}天前`
}

export default function WorkshopProgress({
  session,
  isLoading = false,
  isSaving = false,
  hasUnsavedChanges = false,
  lastSaveAt,
  onStepClick,
  onSaveSession,
  onResetProgress,
  onResumeSession,
  className = ''
}: WorkshopProgressProps) {
  const [expanded, setExpanded] = useState(false)

  // 获取工作坊配置
  const config = WORKSHOP_CONFIG[session.workshopId]
  const IconComponent = config.icon
  const colorClass = config.color

  // 处理步骤点击
  const handleStepClick = (step: number) => {
    if (onStepClick && !isLoading) {
      onStepClick(step)
    }
  }

  // 处理保存
  const handleSave = async () => {
    if (onSaveSession && !isSaving) {
      await onSaveSession()
    }
  }

  return (
    <Card className={cn('workshop-progress', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg bg-${colorClass}-100 flex items-center justify-center`}>
              <IconComponent className={`w-5 h-5 text-${colorClass}-600`} />
            </div>
            <div>
              <CardTitle className="text-lg">{config.title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className={getStatusColor(session.status, colorClass)}
                >
                  {session.status === 'IN_PROGRESS' ? '进行中' :
                   session.status === 'COMPLETED' ? '已完成' : '已暂停'}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  第 {session.currentStep} 步
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 保存状态 */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>保存中...</span>
                </>
              ) : hasUnsavedChanges ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>未保存</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-green-500" />
                  <span>{formatLastSave(lastSaveAt)}</span>
                </>
              )}
            </div>

            {/* 操作按钮 */}
            {hasUnsavedChanges && (
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className={`bg-${colorClass}-500 hover:bg-${colorClass}-600`}
              >
                {isSaving ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <Save className="w-3 h-3 mr-1" />
                )}
                保存
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 总体进度 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">总体进度</span>
            <div className="flex items-center gap-2">
              <span className={`font-semibold text-${colorClass}-600`}>
                {session.progress}%
              </span>
              {session.status === 'COMPLETED' && (
                <Trophy className="w-4 h-4 text-yellow-500" />
              )}
            </div>
          </div>
          <Progress
            value={session.progress}
            className="h-2"
            color={colorClass}
          />
        </div>

        {/* 步骤列表 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">步骤进展</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="text-xs h-6 px-2"
            >
              {expanded ? '收起' : '展开'}
            </Button>
          </div>

          <div className={cn(
            'space-y-2 transition-all duration-200',
            expanded ? 'max-h-none' : 'max-h-32 overflow-hidden'
          )}>
            {config.steps.map((step, index) => {
              const isCompleted = session.completedSteps.includes(step.id)
              const isCurrent = session.currentStep === step.id
              const isClickable = onStepClick && !isLoading

              return (
                <div
                  key={step.id}
                  onClick={() => isClickable && handleStepClick(step.id)}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border transition-all duration-200',
                    isCompleted ? 'bg-green-50 border-green-200' :
                    isCurrent ? `bg-${colorClass}-50 border-${colorClass}-200` :
                    'bg-gray-50 border-gray-200',
                    isClickable && 'cursor-pointer hover:shadow-sm'
                  )}
                >
                  {/* 步骤状态图标 */}
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : isCurrent ? (
                      <div className={`w-5 h-5 rounded-full border-2 border-${colorClass}-500 bg-${colorClass}-500 flex items-center justify-center`}>
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>

                  {/* 步骤信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'font-medium text-sm',
                        isCompleted ? 'text-green-700' :
                        isCurrent ? `text-${colorClass}-700` :
                        'text-gray-600'
                      )}>
                        {step.title}
                      </span>
                      {isCurrent && (
                        <Badge variant="secondary" className="text-xs">
                          当前
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {step.description}
                    </p>
                  </div>

                  {/* 步骤编号 */}
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                    isCompleted ? 'bg-green-500 text-white' :
                    isCurrent ? `bg-${colorClass}-500 text-white` :
                    'bg-gray-300 text-gray-600'
                  )}>
                    {step.id}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 会话信息 */}
        <Separator />
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <User className="w-3 h-3" />
            <span>用户: {session.userId}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            <span>创建: {new Date(session.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* 操作按钮组 */}
        {(onResetProgress || onResumeSession) && (
          <>
            <Separator />
            <div className="flex gap-2">
              {session.status === 'ABANDONED' && onResumeSession && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onResumeSession}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <Play className="w-3 h-3 mr-1" />
                  恢复工作坊
                </Button>
              )}
              {session.status === 'IN_PROGRESS' && onResetProgress && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onResetProgress}
                  disabled={isLoading}
                  className="flex-1 text-red-600 hover:text-red-700"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  重置进度
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}