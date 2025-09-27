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

interface LoadingState {
  isLoading: boolean
  progress: number
  stage: string
}

export default function BusinessPlanPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const reportId = searchParams.get('reportId')
  const ideaTitle = searchParams.get('ideaTitle')

  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: Boolean(reportId),
    progress: 0,
    stage: '正在载入数据...'
  })
  const [guide, setGuide] = useState<LandingCoachGuide | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadReportData = async (targetReportId: string) => {
    try {
      setError(null)
      setGuide(null)
      setLoadingState({
        isLoading: true,
        progress: 20,
        stage: '正在获取调研报告数据...'
      })

      const response = await fetch(`/api/research-reports/${targetReportId}`)
      if (!response.ok) {
        throw new Error('调研报告不存在或已被删除')
      }

      const report = await response.json()

      setLoadingState({
        isLoading: true,
        progress: 50,
        stage: '正在验证报告数据完整性...'
      })

      const validation = validateReportForGuide(report)
      if (!validation.isValid) {
        throw new Error(`报告数据不完整：${validation.missingFields.join('、')}`)
      }

      setLoadingState({
        isLoading: true,
        progress: 80,
        stage: '正在生成落地指南...'
      })

      const coachGuide = transformReportToGuide(report)
      setGuide(coachGuide)

      setLoadingState({
        isLoading: false,
        progress: 100,
        stage: '指南生成完成'
      })
    } catch (loadError) {
      console.error('载入报告数据失败:', loadError)
      setError(loadError instanceof Error ? loadError.message : '载入失败，请稍后重试')
      setLoadingState({
        isLoading: false,
        progress: 0,
        stage: '载入失败'
      })
    }
  }

  useEffect(() => {
    if (!reportId) {
      setGuide(null)
      setError(null)
      setLoadingState({
        isLoading: false,
        progress: 0,
        stage: '等待选择报告'
      })
      return
    }

    void loadReportData(reportId)
  }, [reportId])

  const handleDownload = async (format: 'pdf' | 'docx' | 'markdown') => {
    if (!guide || !reportId) return

    try {
      if (format === 'markdown') {
        const markdownContent = generateGuideMarkdown(guide)
        const blob = new Blob([markdownContent], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${guide.metadata.ideaTitle}-落地指南.md`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        return
      }

      const response = await fetch(`/api/documents/download?reportId=${reportId}&format=${format}&type=guide`)
      if (!response.ok) {
        throw new Error('下载失败')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${guide.metadata.ideaTitle}-落地指南.${format === 'pdf' ? 'pdf' : 'docx'}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (downloadError) {
      console.error('下载失败:', downloadError)
      alert('下载失败，请稍后重试')
    }
  }

  const handleShare = async () => {
    if (!reportId || !ideaTitle) return

    const shareUrl = `${window.location.origin}/business-plan?reportId=${reportId}&ideaTitle=${encodeURIComponent(ideaTitle)}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${ideaTitle} - 创意落地指南`,
          text: `查看我的创意《${ideaTitle}》的专业落地指南`,
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

  const heroTitle = ideaTitle ? `为《${ideaTitle}》生成商业计划书` : 'AI 商业计划生成中心'
  const heroSubtitle = ideaTitle
    ? '系统检测到当前创意，选择合适的方式即可生成完整的商业计划书和落地指南。'
    : '整合调研、竞价与多模型能力，帮助你在几分钟内获得可执行的商业计划书。'

  const featureHighlights = [
    {
      icon: Brain,
      title: '多模型协同',
      description: 'DeepSeek、通义千问、智谱 GLM 等模型分工协作，覆盖调研、评估与写作全流程。'
    },
    {
      icon: FileText,
      title: '专业结构',
      description: '自动生成市场、财务、执行、风险等核心章节，符合投资人沟通习惯。'
    },
    {
      icon: Share2,
      title: '灵活交付',
      description: '支持 PDF / Word / Markdown 多种格式导出，可在线分享落地指南。'
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

  if (!reportId) {
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
                    onClick={() => router.push('/business-plan/v2')}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    开始生成商业计划书
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
                <Button variant="outline" onClick={() => router.push('/ideas/submit')}>
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
                AI 正在整理报告
              </CardTitle>
              <CardDescription>
                {ideaTitle ? `正在为《${ideaTitle}》生成创意落地指南` : '正在准备创意落地指南'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span className="text-sm text-muted-foreground">{loadingState.stage}</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>当前进度</span>
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

              <div className="text-xs text-muted-foreground text-center">
                AI 正在解析调研报告、提炼要点并生成执行建议...
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
                    来自调研报告
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2">
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
