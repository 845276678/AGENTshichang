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
  const source = searchParams.get('source') // 来源：marketplace 或其他
  const winningBid = searchParams.get('winningBid')
  const winner = searchParams.get('winner')

  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: Boolean(reportId),
    progress: 0,
    stage: source === 'marketplace' ? '正在处理竞价结果...' : '正在载入数据...'
  })
  const [guide, setGuide] = useState<LandingCoachGuide | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadReportData = async (targetReportId: string) => {
    try {
      setError(null)
      setGuide(null)

      if (source === 'marketplace') {
        // 来自marketplace的特殊处理流程
        setLoadingState({
          isLoading: true,
          progress: 15,
          stage: '正在分析竞价讨论内容...'
        })

        // 模拟分析竞价讨论
        await new Promise(resolve => setTimeout(resolve, 2000))

        setLoadingState({
          isLoading: true,
          progress: 35,
          stage: `正在整合${winner}的专业建议...`
        })

        // 模拟整合AI专家建议
        await new Promise(resolve => setTimeout(resolve, 2000))

        setLoadingState({
          isLoading: true,
          progress: 60,
          stage: '正在生成市场分析报告...'
        })

        // 模拟生成市场分析
        await new Promise(resolve => setTimeout(resolve, 1500))

        setLoadingState({
          isLoading: true,
          progress: 80,
          stage: '正在完善商业模式设计...'
        })

        // 模拟完善商业模式
        await new Promise(resolve => setTimeout(resolve, 1500))

        setLoadingState({
          isLoading: true,
          progress: 95,
          stage: '正在生成落地执行计划...'
        })

        // 模拟生成执行计划
        await new Promise(resolve => setTimeout(resolve, 1000))

        // 生成模拟的guide数据
        const mockGuide: LandingCoachGuide = {
          metadata: {
            ideaTitle: ideaTitle || '智能家居语音控制系统',
            reportId: targetReportId,
            generatedAt: new Date().toISOString(),
            source: 'marketplace',
            winningBid: winningBid ? parseInt(winningBid) : 350,
            winner: winner || '商业大亨老王'
          },
          executiveSummary: {
            vision: `基于AI竞价专家${winner}的建议，${ideaTitle}定位为下一代智能家居控制中心`,
            keyInsights: [
              '语音交互技术已达到商业化应用门槛',
              '智能家居市场正处于快速增长期',
              '用户对隐私保护要求日益提高',
              '生态系统整合是核心竞争优势'
            ],
            successFactors: [
              '技术先进性和稳定性',
              '隐私保护机制',
              '设备兼容性',
              '用户体验优化'
            ]
          },
          marketAnalysis: {
            targetMarket: {
              size: '预计2024年全球智能家居市场规模达到4000亿人民币',
              growth: '年复合增长率约25%',
              segments: ['高端家庭用户', '科技爱好者', '智慧社区']
            },
            competitors: [
              { name: 'Amazon Alexa', strength: '市场领先地位', weakness: '隐私争议' },
              { name: 'Google Assistant', strength: 'AI技术优势', weakness: '生态封闭' },
              { name: '小爱同学', strength: '本土化优势', weakness: '技术相对落后' }
            ],
            opportunities: [
              '国产替代需求增长',
              '隐私保护成为差异化优势',
              '物联网设备普及率提升'
            ]
          },
          businessModel: {
            revenueStreams: [
              '硬件设备销售',
              '软件服务订阅',
              '第三方设备接入费用',
              '数据分析服务'
            ],
            costStructure: [
              '研发成本：40%',
              '制造成本：25%',
              '营销成本：20%',
              '运营成本：15%'
            ],
            keyMetrics: [
              '月活跃用户数',
              '设备连接数量',
              '语音识别准确率',
              '用户满意度'
            ]
          },
          implementation: {
            phases: [
              {
                phase: '第一阶段：MVP开发',
                duration: '6个月',
                objectives: ['核心语音识别功能', '基础设备控制', '隐私保护机制'],
                resources: '研发团队15人，预算300万'
              },
              {
                phase: '第二阶段：产品完善',
                duration: '4个月',
                objectives: ['扩展设备支持', '用户界面优化', '云端服务部署'],
                resources: '团队扩展至25人，预算200万'
              },
              {
                phase: '第三阶段：市场推广',
                duration: '6个月',
                objectives: ['渠道建设', '品牌推广', '用户获取'],
                resources: '营销团队10人，预算500万'
              }
            ],
            risks: [
              { risk: '技术风险', mitigation: '与科研院所合作，建立技术壁垒' },
              { risk: '市场风险', mitigation: '多元化产品线，降低单一市场依赖' },
              { risk: '竞争风险', mitigation: '专注差异化特性，建立用户粘性' }
            ]
          }
        }

        setGuide(mockGuide)
        setLoadingState({
          isLoading: false,
          progress: 100,
          stage: '商业计划书生成完成！'
        })
      } else {
        // 原有的报告数据载入流程
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
      }
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
                {source === 'marketplace' ? 'AI 正在生成商业计划书' : 'AI 正在整理报告'}
              </CardTitle>
              <CardDescription>
                {source === 'marketplace'
                  ? `基于竞价结果为《${ideaTitle}》生成专业商业计划`
                  : (ideaTitle ? `正在为《${ideaTitle}》生成创意落地指南` : '正在准备创意落地指南')
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
