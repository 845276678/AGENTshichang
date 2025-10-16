/**
 * 工作坊完整仪表板 (性能优化版)
 *
 * 性能优化特性：
 * - 组件懒加载
 * - 条件渲染
 * - 状态优化
 * - 内存管理
 *
 * 集成所有工作坊功能的完整界面：
 * - 工作坊会话管理
 * - 表单填写和验证
 * - 进度跟踪和可视化
 * - AI助手对话
 * - PDF报告生成
 * - 历史记录查看
 */

'use client'

import React, { useState, useEffect, Suspense, lazy } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Play,
  Target,
  Trophy,
  Calendar,
  FileText,
  BarChart3,
  Bot,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

// 导入工作坊组件 - 使用懒加载优化性能
const WorkshopSessionManager = lazy(() => import('@/components/workshop/WorkshopSessionManager'))
const WorkshopProgress = lazy(() => import('@/components/workshop/WorkshopProgress'))
const PDFGenerator = lazy(() => import('@/components/workshop/PDFGenerator'))
const SmartWorkshopGuide = lazy(() => import('@/components/workshop/SmartWorkshopGuide'))
import {
  useWorkshopSession,
  type WorkshopId
} from '@/hooks/useWorkshopSession'

// 工作坊配置
const WORKSHOP_CONFIGS = {
  'demand-validation': {
    title: '需求验证实验室',
    description: '通过科学方法验证您的创意是否解决真实需求',
    icon: Target,
    color: 'blue',
    duration: '30-45分钟',
    difficulty: '入门',
    benefits: [
      '明确目标客户群体',
      '识别核心痛点',
      '设计验证方案',
      '制定行动计划'
    ]
  },
  'mvp-builder': {
    title: 'MVP构建工作坊',
    description: '快速构建最小可行产品，验证核心价值假设，包含中国合规指导',
    icon: Play,
    color: 'green',
    duration: '80-100分钟',
    difficulty: '中级',
    benefits: [
      '明确问题和用户定义',
      'MVP功能规划（MoSCoW）',
      '设计验证策略',
      '制定实施计划',
      '完成中国合规检查'
    ]
  },
  'growth-hacking': {
    title: '增长黑客训练营',
    description: '掌握数据驱动的增长策略和实验方法',
    icon: Trophy,
    color: 'purple',
    duration: '40-55分钟',
    difficulty: '进阶',
    benefits: [
      '设定增长目标',
      'AARRR漏斗分析',
      '设计增长实验',
      '构建增长引擎'
    ]
  },
  'profit-model': {
    title: '商业模式设计',
    description: '构建可持续的商业模式和盈利路径',
    icon: Calendar,
    color: 'orange',
    duration: '50-65分钟',
    difficulty: '高级',
    benefits: [
      '绘制商业画布',
      '设计财务模型',
      '规划盈利路径',
      '识别关键风险'
    ]
  }
}

// 组件Props接口
export interface WorkshopDashboardProps {
  workshopId: WorkshopId
  userId?: string
  onComplete?: (session: any, formData: any) => void
  onExit?: () => void
  className?: string
}

export default function WorkshopDashboard({
  workshopId,
  userId = 'anonymous',
  onComplete,
  onExit,
  className = ''
}: WorkshopDashboardProps) {
  // 工作坊配置
  const config = WORKSHOP_CONFIGS[workshopId]
  const IconComponent = config.icon

  // 状态管理
  const [activeTab, setActiveTab] = useState<'overview' | 'workshop' | 'progress' | 'report'>('overview')
  const [showWelcome, setShowWelcome] = useState(true)

  // 会话管理
  const {
    session,
    isLoading,
    error,
    hasUnsavedChanges,
    saveSession
  } = useWorkshopSession({
    workshopId,
    userId,
    autoSave: true,
    onSessionLoaded: (loadedSession) => {
      console.log(`🎯 工作坊会话已加载:`, loadedSession.id)
      // 如果会话已开始，直接进入工作坊
      if (loadedSession.progress > 0) {
        setShowWelcome(false)
        setActiveTab('workshop')
      }
    },
    onSessionComplete: (completedSession) => {
      console.log(`🎉 工作坊完成:`, completedSession.id)
      setActiveTab('report')
      onComplete?.(completedSession, completedSession.formData)
    }
  })

  // 开始工作坊
  const startWorkshop = () => {
    setShowWelcome(false)
    setActiveTab('workshop')
  }

  // 处理PDF下载
  const handlePDFDownload = (filename: string) => {
    console.log(`📄 PDF报告下载:`, filename)
  }

  // 处理PDF分享
  const handlePDFShare = (shareData: { url: string, filename: string }) => {
    console.log(`📤 PDF报告分享:`, shareData)
  }

  // 加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className={`w-16 h-16 rounded-full bg-${config.color}-100 flex items-center justify-center mx-auto mb-4`}>
            <IconComponent className={`w-8 h-8 text-${config.color}-600 animate-pulse`} />
          </div>
          <h2 className="text-xl font-semibold mb-2">加载工作坊...</h2>
          <p className="text-gray-600">正在准备{config.title}环境</p>
        </div>
      </div>
    )
  }

  // 错误状态
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">加载失败</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              重新加载
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 欢迎界面
  if (showWelcome && session && session.progress === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-white">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center pb-4">
            <div className={`w-20 h-20 rounded-full bg-${config.color}-100 flex items-center justify-center mx-auto mb-4`}>
              <IconComponent className={`w-10 h-10 text-${config.color}-600`} />
            </div>
            <CardTitle className="text-2xl mb-2">{config.title}</CardTitle>
            <p className="text-gray-600 text-lg">{config.description}</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* 工作坊信息 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Clock className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                <p className="text-sm font-medium">预估时长</p>
                <p className="text-xs text-gray-600">{config.duration}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <BarChart3 className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                <p className="text-sm font-medium">难度等级</p>
                <p className="text-xs text-gray-600">{config.difficulty}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Target className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                <p className="text-sm font-medium">完成收益</p>
                <p className="text-xs text-gray-600">专业报告</p>
              </div>
            </div>

            {/* 工作坊收益 */}
            <div>
              <h3 className="font-semibold mb-3">完成这个工作坊您将获得：</h3>
              <ul className="space-y-2">
                {config.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className={`w-4 h-4 text-${config.color}-500 flex-shrink-0`} />
                    <span className="text-sm text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 开始按钮 */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={startWorkshop}
                className={`flex-1 bg-${config.color}-500 hover:bg-${config.color}-600`}
              >
                <Play className="w-4 h-4 mr-2" />
                开始工作坊
              </Button>
              {onExit && (
                <Button variant="outline" onClick={onExit}>
                  返回
                </Button>
              )}
            </div>

            {/* 提示信息 */}
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                工作坊过程中会自动保存您的进度，您可以随时暂停并稍后继续。
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 主界面
  return (
    <div className={`workshop-dashboard min-h-screen bg-gray-50 ${className}`}>
      {/* 头部 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-${config.color}-100 flex items-center justify-center`}>
                <IconComponent className={`w-5 h-5 text-${config.color}-600`} />
              </div>
              <div>
                <h1 className="text-xl font-semibold">{config.title}</h1>
                {session && (
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      进度: {session.progress}%
                    </Badge>
                    {hasUnsavedChanges && (
                      <Badge variant="secondary" className="text-xs">
                        未保存
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <Button size="sm" onClick={() => saveSession()}>
                  保存进度
                </Button>
              )}
              {onExit && (
                <Button variant="outline" size="sm" onClick={onExit}>
                  退出工作坊
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab as any}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="workshop">工作坊</TabsTrigger>
            <TabsTrigger value="progress">进度</TabsTrigger>
            <TabsTrigger
              value="report"
              disabled={!session || session.status !== 'COMPLETED'}
            >
              报告
            </TabsTrigger>
          </TabsList>

          {/* 概览页面 */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>工作坊信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">{config.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">预估时长:</span>
                      <p className="text-gray-600">{config.duration}</p>
                    </div>
                    <div>
                      <span className="font-medium">难度等级:</span>
                      <p className="text-gray-600">{config.difficulty}</p>
                    </div>
                  </div>
                  {session && session.progress > 0 && (
                    <Button
                      onClick={() => setActiveTab('workshop')}
                      className={`w-full bg-${config.color}-500 hover:bg-${config.color}-600`}
                    >
                      继续工作坊
                    </Button>
                  )}
                </CardContent>
              </Card>

              {session && (
                <Suspense fallback={
                  <Card>
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-20 bg-gray-200 rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                }>
                  <WorkshopProgress
                    session={session}
                    hasUnsavedChanges={hasUnsavedChanges}
                    onStepClick={(step) => {
                      setActiveTab('workshop')
                    }}
                  />
                </Suspense>
              )}
            </div>
          </TabsContent>

          {/* 工作坊页面 */}
          <TabsContent value="workshop">
            {session && (
              <>
                {/* 只在MVP工作坊显示智能功能说明 */}
                {workshopId === 'mvp-builder' && (
                  <Suspense fallback={
                    <Card className="mb-6">
                      <CardContent className="p-4">
                        <div className="animate-pulse h-16 bg-gray-200 rounded"></div>
                      </CardContent>
                    </Card>
                  }>
                    <SmartWorkshopGuide workshopType={workshopId} />
                  </Suspense>
                )}

                <Suspense fallback={
                  <Card>
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-4">
                        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-32 bg-gray-200 rounded"></div>
                        <div className="h-32 bg-gray-200 rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                }>
                  <WorkshopSessionManager
                    workshopId={workshopId}
                    userId={userId}
                    onSessionComplete={(completedSession) => {
                      setActiveTab('report')
                      onComplete?.(completedSession, completedSession.formData)
                    }}
                  />
                </Suspense>
              </>
            )}
          </TabsContent>

          {/* 进度页面 */}
          <TabsContent value="progress">
            {session && (
              <Suspense fallback={
                <Card>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              }>
                <WorkshopProgress
                  session={session}
                  hasUnsavedChanges={hasUnsavedChanges}
                  onStepClick={(step) => setActiveTab('workshop')}
                  onSaveSession={() => saveSession()}
                />
              </Suspense>
            )}
          </TabsContent>

          {/* 报告页面 */}
          <TabsContent value="report">
            {session && session.status === 'COMPLETED' && (
              <div className="space-y-6">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    🎉 恭喜您完成了{config.title}！您的成果已准备就绪。
                  </AlertDescription>
                </Alert>

                <Suspense fallback={
                  <Card>
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-4">
                        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-32 bg-gray-200 rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                }>
                  <PDFGenerator
                    session={session}
                    onDownload={handlePDFDownload}
                    onShare={handlePDFShare}
                  />
                </Suspense>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}