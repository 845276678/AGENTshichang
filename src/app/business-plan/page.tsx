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
  const guideCost = searchParams.get('guideCost') // 动态价格

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
          // AI犀利点评
          aiInsights: {
            overallAssessment: {
              score: 7.8,
              level: '中高潜力项目',
              summary: '这是一个技术驱动的智能家居项目，具备明确的商业价值，但需要在隐私保护和生态建设方面下功夫。',
              keyStrengths: [
                '技术方向符合未来趋势，语音交互已进入成熟期',
                '隐私保护定位差异化明显，能形成竞争壁垒',
                '智能家居市场增长强劲，用户接受度不断提升'
              ],
              criticalChallenges: [
                '技术门槛高，需要顶级AI团队和持续投入',
                '生态建设周期长，需要大量设备厂商合作',
                '竞争激烈，与巨头正面竞争风险极大'
              ]
            },
            sustainabilityAnalysis: {
              longTermViability: '需要建立技术护城河和生态优势',
              persistenceFactors: [
                '核心技术持续创新能力',
                '用户数据和使用习惯的积累',
                '供应链和渠道合作伙伴关系',
                '品牌认知度和用户信任度'
              ],
              riskMitigation: [
                '避免与巨头正面竞争，专注细分市场',
                '重视数据安全和隐私保护，建立信任优势',
                '快速迭代产品，保持技术领先地位'
              ]
            },
            stageAlerts: [
              {
                stage: 'MVP开发',
                timeline: '0-6个月',
                criticalMilestones: [
                  '语音识别准确率达到95%以上',
                  '至少支持20种主流智能设备',
                  '完成隐私保护技术验证'
                ],
                warningSignals: [
                  '技术指标未达预期，需及时调整技术路线',
                  '用户测试反馈不佳，产品体验需大幅优化',
                  '开发进度严重滞后，团队配置需要调整'
                ]
              },
              {
                stage: '市场验证',
                timeline: '6-12个月',
                criticalMilestones: [
                  '获得1000+种子用户认可',
                  '日活跃度保持在60%以上',
                  '完成与3家以上设备厂商合作'
                ],
                warningSignals: [
                  '用户增长停滞，产品市场匹配度存疑',
                  '客户流失率超过30%，用户粘性不足',
                  '合作伙伴响应冷淡，商业模式需要调整'
                ]
              },
              {
                stage: '规模化扩展',
                timeline: '12-24个月',
                criticalMilestones: [
                  '月活用户突破10万',
                  '实现正向现金流',
                  '建立完整的生态系统'
                ],
                warningSignals: [
                  '扩展成本过高，盈利模式不可持续',
                  '技术架构无法支撑用户增长',
                  '竞争对手推出类似产品，优势被削弱'
                ]
              }
            ]
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
          currentSituation: {
            title: "现状认知与方向确认",
            summary: "智能家居语音控制正成为下一个技术风口，隐私保护成为差异化关键。",
            keyInsights: [
              "语音交互技术日趋成熟，准确率已达商用标准",
              "智能家居设备普及率快速提升，为语音控制创造需求",
              "隐私保护成为用户关注焦点，本土化方案更受信任"
            ],
            marketReality: {
              marketSize: "预计2024年全球智能家居市场规模达到4000亿人民币",
              competition: "Amazon Alexa、Google Assistant占据国际市场，小爱同学等本土产品快速发展",
              opportunities: [
                "国产替代需求增长",
                "隐私保护成为差异化优势",
                "物联网设备普及率提升",
                "5G技术推动智能家居升级"
              ],
              challenges: [
                "技术门槛高，需要AI专业团队",
                "生态建设周期长，需要设备厂商配合",
                "与互联网巨头正面竞争",
                "用户习惯迁移成本高"
              ]
            },
            userNeeds: {
              targetUsers: "注重隐私的科技爱好者、高端家庭用户、智慧社区",
              painPoints: [
                "现有产品隐私保护不足",
                "设备兼容性差，无法统一控制",
                "语音识别准确率有待提升",
                "功能单一，智能化程度不高"
              ],
              solutions: [
                "本地化语音处理，数据不上云",
                "开放式接口，支持主流设备品牌",
                "深度学习优化语音识别",
                "AI场景化智能推荐"
              ]
            },
            actionItems: [
              "深入调研目标用户隐私保护需求",
              "评估主流智能设备的接入难度",
              "分析竞品的技术优劣势"
            ]
          },
          mvpDefinition: {
            title: "MVP产品定义与验证计划",
            productConcept: {
              uniqueValue: "国内首个完全本地化的智能家居语音控制中心，零数据上云",
              minimumScope: "支持20种主流设备的语音控制，准确率达95%，响应时间<2秒",
              coreFeatures: [
                "离线语音识别引擎",
                "多设备统一控制接口",
                "隐私保护机制",
                "智能场景推荐",
                "设备状态监控"
              ]
            },
            developmentPlan: {
              phases: [
                {
                  name: "技术验证阶段",
                  duration: "3个月",
                  deliverables: ["语音识别原型", "设备接入demo", "隐私架构设计"],
                  resources: ["AI算法工程师3人", "IoT开发工程师2人", "产品经理1人"]
                },
                {
                  name: "MVP开发阶段",
                  duration: "4个月",
                  deliverables: ["完整产品原型", "用户测试版本", "技术文档"],
                  resources: ["全栈开发团队8人", "UI/UX设计师2人", "测试工程师2人"]
                }
              ],
              techStack: ["Python", "TensorFlow", "React Native", "Node.js", "Docker", "Redis"],
              estimatedCost: "技术验证150万，MVP开发300万，总计450万"
            },
            validationStrategy: {
              hypotheses: [
                "用户对隐私保护的重视程度超过便利性",
                "本地化语音处理技术可以达到云端效果",
                "智能家居设备厂商愿意开放接口"
              ],
              experiments: [
                "用户隐私敏感度调研",
                "语音识别准确率对比测试",
                "设备厂商合作意愿调研"
              ],
              successMetrics: [
                "用户满意度>85%",
                "语音识别准确率>95%",
                "设备响应时间<2秒"
              ],
              timeline: "MVP完成后2个月内完成用户验证"
            },
            actionItems: [
              "搭建技术团队，重点招聘AI算法专家",
              "与潜在设备厂商建立初步合作意向",
              "设计用户验证实验方案"
            ]
          },
          businessExecution: {
            title: "商业化落地与运营策略",
            businessModel: {
              revenueStreams: [
                "硬件设备销售（控制中心硬件）",
                "软件授权费用（设备厂商集成）",
                "增值服务订阅（高级AI功能）",
                "数据分析服务（匿名化使用数据）"
              ],
              costStructure: [
                "研发成本：40%（持续技术投入）",
                "制造成本：25%（硬件生产）",
                "营销成本：20%（市场推广）",
                "运营成本：15%（团队和运维）"
              ],
              pricingStrategy: "硬件499元起，软件授权按设备数量收费，增值服务月费29元",
              scalability: "标准化API接口，可快速适配新设备；云端管理平台，支持大规模部署"
            },
            launchStrategy: {
              phases: [
                {
                  name: "种子用户阶段",
                  timeline: "前3个月",
                  goals: ["获得100个种子用户", "收集产品反馈", "优化用户体验"],
                  tactics: ["科技博主合作", "线下体验活动", "社交媒体推广"]
                },
                {
                  name: "市场扩展阶段",
                  timeline: "3-12个月",
                  goals: ["月活用户1万+", "设备厂商合作", "建立销售渠道"],
                  tactics: ["渠道代理商合作", "电商平台入驻", "技术博览会参展"]
                }
              ],
              marketingChannels: [
                "科技媒体报道",
                "KOL合作推广",
                "线下体验店",
                "电商平台",
                "技术社区"
              ],
              budgetAllocation: [
                "渠道建设：40%",
                "内容营销：30%",
                "广告投放：20%",
                "活动推广：10%"
              ]
            },
            operationalPlan: {
              teamStructure: [
                "CEO/创始人",
                "CTO/技术负责人",
                "产品总监",
                "AI算法团队（5人）",
                "软硬件开发团队（8人）",
                "市场营销团队（3人）",
                "运营支持团队（2人）"
              ],
              processes: [
                "敏捷开发流程，2周迭代周期",
                "用户反馈收集和产品改进机制",
                "设备厂商合作和接入流程",
                "客户支持和售后服务体系"
              ],
              infrastructure: [
                "云端设备管理平台",
                "用户数据分析系统",
                "自动化测试和部署平台",
                "客户服务管理系统"
              ],
              riskManagement: [
                "技术风险：建立技术专家顾问团",
                "市场风险：多元化合作减少依赖",
                "竞争风险：专注差异化优势建设",
                "资金风险：分阶段融资降低压力"
              ]
            },
            actionItems: [
              "制定详细的商业模式画布",
              "启动种子轮融资准备",
              "建立核心团队和顾问团"
            ]
          },
          metadata: {
            ideaTitle: ideaTitle || '智能家居语音控制系统',
            reportId: targetReportId,
            generatedAt: new Date().toISOString(),
            estimatedReadTime: 15,
            implementationTimeframe: "12-18个月",
            confidenceLevel: 78,
            source: 'marketplace',
            winningBid: winningBid ? parseInt(winningBid) : 350,
            winner: winner || '商业大亨老王'
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
