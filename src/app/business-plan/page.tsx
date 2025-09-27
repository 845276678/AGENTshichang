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
  Download,
  Share2,
  AlertCircle,
  FileText,
  Brain,
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react'

import LandingCoachDisplay from '@/components/business-plan/LandingCoachDisplay'
import { transformReportToGuide, generateGuideMarkdown, validateReportForGuide } from '@/lib/utils/transformReportToGuide'
import { ResearchReportService } from '@/lib/services/research-report.service'
import type { LandingCoachGuide } from '@/lib/utils/transformReportToGuide'

interface LoadingState {
  isLoading: boolean
  progress: number
  stage: string
}

export default function BusinessPlanPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // URL参数获取
  const reportId = searchParams.get('reportId')
  const ideaTitle = searchParams.get('ideaTitle')

  // 状态管理
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    progress: 0,
    stage: '正在载入数据...'
  })
  const [guide, setGuide] = useState<LandingCoachGuide | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reportData, setReportData] = useState<any>(null)

  // 载入调研报告数据
  const loadReportData = async (reportId: string) => {
    try {
      setLoadingState({
        isLoading: true,
        progress: 20,
        stage: '正在获取调研报告数据...'
      })

      const response = await fetch(`/api/research-reports/${reportId}`)
      if (!response.ok) {
        throw new Error('调研报告不存在或已被删除')
      }

      const report = await response.json()
      setReportData(report)

      setLoadingState({
        isLoading: true,
        progress: 50,
        stage: '正在验证报告数据完整性...'
      })

      // 验证报告数据
      const validation = validateReportForGuide(report)
      if (!validation.isValid) {
        throw new Error(`报告数据不完整：${validation.missingFields.join('、')}`)
      }

      setLoadingState({
        isLoading: true,
        progress: 80,
        stage: '正在生成落地指南...'
      })

      // 转换为落地教练指南
      const coachGuide = transformReportToGuide(report)
      setGuide(coachGuide)

      setLoadingState({
        isLoading: false,
        progress: 100,
        stage: '指南生成完成'
      })

    } catch (error) {
      console.error('载入报告数据失败:', error)
      setError(error instanceof Error ? error.message : '载入失败，请稍后重试')
      setLoadingState({
        isLoading: false,
        progress: 0,
        stage: '载入失败'
      })
    }
  }

  // 页面初始化
  useEffect(() => {
    if (reportId) {
      loadReportData(reportId)
    } else {
      // 如果没有reportId，显示错误状态
      setError('缺少必要的报告ID参数')
      setLoadingState({
        isLoading: false,
        progress: 0,
        stage: '参数错误'
      })
    }
  }, [reportId])

  // 处理下载
  const handleDownload = async (format: 'pdf' | 'docx' | 'markdown') => {
    if (!guide || !reportId) return

    try {
      let downloadUrl = ''

      if (format === 'markdown') {
        // 生成Markdown内容并下载
        const markdownContent = generateGuideMarkdown(guide)
        const blob = new Blob([markdownContent], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${guide.metadata.ideaTitle}-落地指南.md`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        return
      }

      // 调用下载API
      downloadUrl = `/api/documents/download?reportId=${reportId}&format=${format}&type=guide`

      const response = await fetch(downloadUrl)
      if (!response.ok) {
        throw new Error('下载失败')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${guide.metadata.ideaTitle}-落地指南.${format === 'pdf' ? 'pdf' : 'docx'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

    } catch (error) {
      console.error('下载失败:', error)
      alert('下载失败，请稍后重试')
    }
  }

  // 处理分享
  const handleShare = async () => {
    if (!reportId || !ideaTitle) return

    const shareUrl = `${window.location.origin}/business-plan?reportId=${reportId}&ideaTitle=${encodeURIComponent(ideaTitle)}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${ideaTitle} - 创意落地指南`,
          text: `查看我的创意「${ideaTitle}」的专业落地指南`,
          url: shareUrl
        })
      } catch (error) {
        // 用户取消分享，忽略错误
      }
    } else {
      // 降级到复制链接
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('链接已复制到剪贴板')
      }).catch(() => {
        alert('分享失败，请手动复制链接')
      })
    }
  }

  // 加载状态
  if (loadingState.isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
          <Card className="w-96">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-blue-600" />
                AI 落地教练
              </CardTitle>
              <CardDescription>
                {ideaTitle ? `正在为「${ideaTitle}」生成落地指南` : '正在生成创意落地指南'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span className="text-sm text-muted-foreground">{loadingState.stage}</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>完成进度</span>
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
                AI教练正在分析您的调研报告，制定详细的落地方案...
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  // 错误状态
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

  // 成功载入，显示落地指南
  if (guide) {
    return (
      <Layout>
        {/* 顶部导航栏 */}
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

        {/* 落地教练指南显示 */}
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