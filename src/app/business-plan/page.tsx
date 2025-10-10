'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

import { Layout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ArrowLeft,
  ArrowRight,
  Download,
  Share2,
  AlertCircle,
  FileText,
  Brain,
  Loader2,
  XCircle,
  Sparkles,
  Compass,
  ClipboardList,
  BarChart3
} from 'lucide-react'

import LandingCoachDisplay from '@/components/business-plan/LandingCoachDisplay'
import { transformReportToGuide, generateGuideMarkdown, validateReportForGuide } from '@/lib/utils/transformReportToGuide'
import type { LandingCoachGuide } from '@/lib/utils/transformReportToGuide'
import { useAuth } from '@/hooks/useAuth'

interface LoadingState {
  isLoading: boolean
  progress: number
  stage: string
}

export default function BusinessPlanPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { token, isInitialized } = useAuth()

  // 支持新的会话ID参数和旧的报告参数
  const sessionId = searchParams.get('sessionId')
  const reportId = searchParams.get('reportId')
  const ideaTitle = searchParams.get('ideaTitle')
  const source = searchParams.get('source') // 来源：ai-bidding, marketplace 或其他
  const winningBid = searchParams.get('winningBid')
  const winner = searchParams.get('winner')
  const guideCost = searchParams.get('guideCost') // 动态价格

  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: Boolean(sessionId || reportId),
    progress: 0,
    stage: source === 'marketplace' ? '正在处理竞价结果...' : '正在载入数据...'
  })
  const [guide, setGuide] = useState<LandingCoachGuide | null>(null)
  const [error, setError] = useState<string | null>(null)
  const displayIdeaTitle = guide?.metadata?.ideaTitle || ideaTitle || ''

  // 新增：从会话加载数据的函数
  // 新增：从会话加载数据的函数（支持匿名访问新会话）
  const loadSessionData = async (sessionId: string) => {
    try {
      setError(null)
      setGuide(null)

      setLoadingState({
        isLoading: true,
        progress: 15,
        stage: '正在获取竞价摘要...'
      })

      // 构建请求头（如果有token则发送，没有也允许）
      const headers: HeadersInit = token
        ? { Authorization: `Bearer ${token}` }
        : {}

      const response = await fetch(`/api/business-plan-session?sessionId=${sessionId}`, {
        cache: 'no-store',
        headers
      })

      if (response.status === 401) {
        // 如果未认证且会话需要认证，提示登录
        setError('该商业计划需要登录查看，请先登录。')
        setLoadingState({
          isLoading: false,
          progress: 0,
          stage: '需要登录'
        })
        return
      }

      const payload = await response.json()
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || '无法获取商业计划会话数据')
      }

      const report = payload.data?.report

      if (!report?.guide) {
        setLoadingState({
          isLoading: true,
          progress: 60,
          stage: '商业计划生成中，请稍候刷新'
        })
        return
      }

      setGuide(report.guide as LandingCoachGuide)
      setLoadingState({
        isLoading: false,
        progress: 100,
        stage: '商业计划已生成'
      })
    } catch (error) {
      console.error('加载商业计划会话失败:', error)
      setError(error instanceof Error ? error.message : '加载商业计划失败')
      setLoadingState({
        isLoading: false,
        progress: 0,
        stage: '加载失败'
      })
    }
  }

  const loadReportData = async (targetReportId: string) => {
    if (!token) {
      setError('访问该商业计划需要登录，请先登录后重试。')
      setLoadingState({
        isLoading: false,
        progress: 0,
        stage: '等待登录'
      })
      return
    }

    try {
      setError(null)
      setGuide(null)

      setLoadingState({
        isLoading: true,
        progress: 20,
        stage: '正在获取商业计划报告...'
      })

      const response = await fetch(`/api/business-plan-session?reportId=${targetReportId}`, {
        cache: 'no-store',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.status === 401) {
        throw new Error('会话已过期或未登录，请先登录后再查看。')
      }

      const payload = await response.json()
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || '无法获取商业计划报告')
      }

      const report = payload.data?.report
      if (!report?.guide) {
        throw new Error('商业计划报告尚未生成或已被删除')
      }

      setGuide(report.guide as LandingCoachGuide)
      setLoadingState({
        isLoading: false,
        progress: 100,
        stage: '商业计划加载完成'
      })
    } catch (error) {
      console.error('加载商业计划报告失败:', error)
      setError(error instanceof Error ? error.message : '加载商业计划报告失败')
      setLoadingState({
        isLoading: false,
        progress: 0,
        stage: '加载失败'
      })
    }
  }

  useEffect(() => {
    if (!sessionId && !reportId) {
      setGuide(null)
      setError(null)
      setLoadingState({
        isLoading: false,
        progress: 0,
        stage: '等待选择报告'
      })
      return
    }

    // 等待认证初始化完成
    if (!isInitialized) {
      return
    }

    // 如果有sessionId，直接尝试加载（支持匿名访问新会话）
    if (sessionId) {
      void loadSessionData(sessionId)
      return
    }

    // 如果有reportId，需要token才能加载
    if (reportId) {
      if (!token) {
        setGuide(null)
        setLoadingState({
          isLoading: false,
          progress: 0,
          stage: '等待登录'
        })
        setError('访问历史商业计划需要登录，请先登录后重试。')
        return
      }
      void loadReportData(reportId)
    }
  }, [sessionId, reportId, token, isInitialized])

  const handleDownload = async (format: 'pdf' | 'docx' | 'markdown' | 'txt') => {
    if (!guide || (!reportId && !sessionId)) return

    try {
      // TXT和Markdown格式可以直接在前端生成
      if (format === 'txt' || format === 'markdown') {
        const markdownContent = generateGuideMarkdown(guide)
        const content = format === 'txt'
          ? markdownContent.replace(/[#*_`>\-\[\]]/g, '').replace(/\n\n+/g, '\n\n') // 移除Markdown语法
          : markdownContent
        const mimeType = format === 'txt' ? 'text/plain' : 'text/markdown'
        const blob = new Blob([content], { type: mimeType })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${guide.metadata?.ideaTitle || '创意项目'}-落地指南.${format}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        return
      }

      // PDF/DOCX 格式 - 尝试获取token，但不强制要求
      let authToken = token
      if (!authToken && typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('auth_token') || localStorage.getItem('access_token')
          if (stored) {
            authToken = stored
            console.log('从localStorage获取到token')
          }
        } catch (e) {
          console.error('读取localStorage失败:', e)
        }
      }

      console.log('Token状态:', {
        fromHook: token ? '存在' : '不存在',
        fromStorage: authToken ? '存在' : '不存在',
        tokenLength: authToken?.length
      })

      // 构建请求头，如果有token则发送
      const headers: HeadersInit = authToken
        ? { Authorization: `Bearer ${authToken}` }
        : {}

      const response = await fetch(
        `/api/documents/download?${sessionId ? `sessionId=${sessionId}` : `reportId=${reportId}`}&format=${format}&type=guide`,
        { headers }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API错误:', errorData)
        throw new Error(errorData.error || '下载失败')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${guide.metadata?.ideaTitle || '创意项目'}-落地指南.${format === 'pdf' ? 'pdf' : 'docx'}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (downloadError) {
      console.error('下载失败:', downloadError)
      alert(downloadError instanceof Error ? downloadError.message : '下载失败，请稍后重试')
    }
  }

  const handleShare = async () => {
    if (!reportId || !displayIdeaTitle) return

    const shareUrl = (() => {
      try {
        const url = new URL('/business-plan', window.location.origin)
        url.searchParams.set('reportId', reportId)
        if (source) {
          url.searchParams.set('source', source)
        }
        return url.toString()
      } catch {
        return `${window.location.origin}/business-plan?reportId=${reportId}`
      }
    })()

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${displayIdeaTitle || "AI 商业计划"} - 创意落地指南`,
          text: `查看我的创意《${displayIdeaTitle || 'AI商业计划'}》的专业落地指南`,
          url: shareUrl
        })
      } catch {
        // 用户取消分享或浏览器阻止，忽略即可
      }
      return
    }

    try {
      await navigator.clipboard.writeText(shareUrl)
      alert('链接已复制，快去分享吧！')
    } catch {
      alert('复制失败，请手动复制链接')
    }
  }

  const heroTitle = displayIdeaTitle ? `为《${displayIdeaTitle}》生成商业计划书` : 'AI 商业计划生成中心'
  const heroSubtitle = displayIdeaTitle
    ? '系统检测到当前创意，选择合适的方式即可生成完整的商业计划书和落地指南。'
    : '整合调研、竞价与多模型能力，帮助你在几分钟内获得可执行的商业计划书。'

  const featureHighlights = [
    {
      icon: Brain,
      title: '智能适配引擎',
      description: '基于创意特征实时分析，提供AI技术栈推荐、需求发现渠道、线下调研活动等个性化建议。'
    },
    {
      icon: FileText,
      title: '5阶段实战框架',
      description: '目标澄清→市场分析→调研指导→90天计划→商业模式，每阶段基于创意特征量身定制。'
    },
    {
      icon: Share2,
      title: '90天聚焦执行',
      description: '专注关键90天验证期，提供AI技术选型、用户发现、线下活动等具体可操作的实施方案。'
    }
  ]

  const quickStartSteps = [
    {
      title: '导入竞价或调研结果',
      description: '若已完成竞价调研，可直接跳转并基于报告自动生成落地指南与计划书。'
    },
    {
      title: '使用智能生成器',
      description: '进入新版生成流程，回答澄清问题后系统会分阶段完成整份商业计划书。'
    },
    {
      title: '浏览示例与模板',
      description: '先查看现代化商业计划书展示，了解输出风格再开始创作。'
    }
  ]

  // 只有在既没有 reportId 也没有 sessionId 时才显示引导页
  if (!reportId && !sessionId) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-white">
          <div className="container py-12 space-y-10">
            <Card className="relative overflow-hidden border-none bg-gradient-to-r from-blue-600 to-indigo-500 text-white">
              <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.4),_transparent_60%)]" />
              <CardHeader className="relative z-10 space-y-4">
                <Badge variant="secondary" className="w-fit bg-white/20 text-white border-white/30">
                  智能商业计划中心
                </Badge>
                <CardTitle className="text-3xl md:text-4xl font-semibold">
                  {heroTitle}
                </CardTitle>
                <CardDescription className="text-white/80">
                  {heroSubtitle}
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap gap-3">
                  <Button
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-white/90"
                    onClick={() => router.push('/business-plan/intelligent')}
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    智能化生成（推荐）
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white/10 text-white hover:bg-white/20 border-white/40"
                    onClick={() => router.push('/business-plan/v2')}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    标准版生成
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white/10 text-white hover:bg-white/20 border-white/40"
                    onClick={() => router.push('/demo/modern-business-plan')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    查看现代化示例
                  </Button>
                  <Button
                    size="lg"
                    variant="ghost"
                    className="text-white hover:bg-white/15"
                    onClick={() => router.push('/demo/concise-business-plan')}
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    体验精简版输出
                  </Button>
                </div>
                <div className="hidden md:flex items-center gap-2 text-sm text-white/80">
                  <Compass className="w-5 h-5" />
                  <span>支持导入调研报告或直接发起生成</span>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
              <Card>
                <CardHeader>
                  <CardTitle>智能生成优势</CardTitle>
                  <CardDescription>从创意校准到落地执行的全链路支持</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  {featureHighlights.map(({ icon: Icon, title, description }) => (
                    <div key={title} className="rounded-xl border bg-white p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                          <Icon className="h-5 w-5" />
                        </div>
                        <p className="font-medium text-sm">{title}</p>
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="h-full">
                <CardHeader>
                  <CardTitle>快速开始</CardTitle>
                  <CardDescription>选择最适合的入口即可启动流程</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {quickStartSteps.map((step, index) => (
                    <div key={step.title} className="rounded-lg border border-dashed p-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{step.title}</p>
                          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between py-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-50 p-3 text-blue-600">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">已经有调研报告 ID？</p>
                    <p className="text-xs text-muted-foreground">
                      通过竞价或调研流程生成的报告，复制链接中的 reportId 参数后再访问此页面即可查看落地指南。
                    </p>
                  </div>
                </div>
                <Button variant="outline" onClick={() => router.push('/marketplace')}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  前往创意竞价中心
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    )
  }

  if (loadingState.isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
          <Card className="w-96">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-blue-600" />
                {source === 'marketplace' ? 'AI 正在生成商业计划书' : 'AI 正在整理报告'}
              </CardTitle>
              <CardDescription>
                {source === 'marketplace'
                  ? `基于竞价结果为《${displayIdeaTitle}》生成专业商业计划`
                  : (displayIdeaTitle ? `正在为《${displayIdeaTitle}》生成创意落地指南` : '正在准备创意落地指南')
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span className="text-sm text-muted-foreground">{loadingState.stage}</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>生成进度</span>
                  <span>{loadingState.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-blue-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${loadingState.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {source === 'marketplace' && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-xs text-blue-800 font-medium mb-2">生成流程说明：</div>
                  <div className="text-xs text-blue-700 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      <span>分析竞价讨论中的关键信息</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      <span>整合AI专家的专业建议</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      <span>生成市场分析和商业模式</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      <span>制定详细的落地执行计划</span>
                    </div>
                  </div>
                </div>
              )}

              {source === 'marketplace' && winner && (
                <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-xs text-green-700 mb-1">竞价获胜者</div>
                  <div className="text-sm font-semibold text-green-800">{winner}</div>
                  {winningBid && (
                    <div className="text-xs text-green-600">获胜出价：{winningBid} 积分</div>
                  )}
                </div>
              )}

              <div className="text-xs text-muted-foreground text-center">
                {source === 'marketplace'
                  ? 'AI 正在根据竞价结果生成专业的商业计划书和落地指南...'
                  : 'AI 正在解析调研报告、提炼要点并生成执行建议...'
                }
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
          <Card className="w-96">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <XCircle className="w-6 h-6" />
                载入失败
              </CardTitle>
              <CardDescription>
                无法载入创意落地指南
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回上一页
                </Button>
                <Button
                  onClick={() => router.push('/marketplace')}
                  className="w-full"
                >
                  返回市场首页
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  if (guide) {
    return (
      <Layout>
        <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回
                </Button>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">创意落地指南</span>
                  <Badge variant="secondary" className="text-xs">
                    {source === 'marketplace' ? '来自竞价结果' : '来自调研报告'}
                  </Badge>
                  {source === 'marketplace' && winner && (
                    <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                      获胜专家：{winner}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {source === 'marketplace' && winningBid && (
                  <div className="text-sm text-muted-foreground mr-4">
                    竞价金额：<span className="font-semibold text-green-600">{winningBid}积分</span>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload('markdown')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  下载
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  分享
                </Button>
              </div>
            </div>
          </div>
        </div>

        <LandingCoachDisplay
          guide={guide}
          onDownload={handleDownload}
          onShare={handleShare}
        />
      </Layout>
    )
  }

  return null
}






















