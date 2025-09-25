// AI创意调研指导工具
// 从"生成报告"转为"指导调研"
'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Layout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Search,
  Database,
  Target,
  ArrowRight,
  CheckCircle,
  Clock,
  DollarSign,
  MessageCircle,
  BookOpen,
  Lightbulb,
  ExternalLink
} from 'lucide-react'

const categories = [
  { id: 'tech', name: '技术产品', icon: '💻' },
  { id: 'lifestyle', name: '生活服务', icon: '🏠' },
  { id: 'education', name: '教育培训', icon: '📚' },
  { id: 'health', name: '健康医疗', icon: '🏥' },
  { id: 'finance', name: '金融服务', icon: '💰' },
  { id: 'entertainment', name: '娱乐社交', icon: '🎮' },
  { id: 'business', name: '企业服务', icon: '🏢' },
  { id: 'retail', name: '零售电商', icon: '🛒' }
]

// AI调研导师团队 - 修正为实际使用的AI服务
const researchExperts = [
  {
    name: '基本盘分析师',
    role: '从身边开始',
    ai: 'DeepSeek',
    icon: '🎯',
    specialty: '帮你找到最容易验证的圈子和用户',
    color: 'bg-blue-500'
  },
  {
    name: '调研方法专家',
    role: '教你怎么调研',
    ai: '智谱GLM',
    icon: '🔍',
    specialty: '提供具体的调研方法和操作步骤',
    color: 'bg-green-500'
  },
  {
    name: '数据源指南',
    role: '告诉你去哪找数据',
    ai: '阿里通义千问',
    icon: '📊',
    specialty: '推荐最佳的免费和付费数据源',
    color: 'bg-purple-500'
  },
  {
    name: 'MVP验证专家',
    role: '教你快速验证',
    ai: 'DeepSeek',
    icon: '⚡',
    specialty: '低成本快速验证核心假设',
    color: 'bg-orange-500'
  },
  {
    name: '商业模式导师',
    role: '指导赚钱方法',
    ai: '智谱GLM',
    icon: '💡',
    specialty: '探索可行的盈利模式和定价策略',
    color: 'bg-red-500'
  }
]

// 示例创意（调整为调研视角）
const sampleIdeas = [
  {
    title: '智能代码审查助手',
    description: '基于AI的代码质量检测和优化建议工具，帮助程序员提高代码质量...',
    category: 'tech',
    targetCircle: '程序员圈子',
    needType: '硬需求'
  },
  {
    title: '社区团购平台',
    description: '邻里间的团购组织平台，降低生活成本，增进社区交流...',
    category: 'lifestyle',
    targetCircle: '社区居民',
    needType: '软需求'
  },
  {
    title: '职场技能训练营',
    description: '针对职场新人的技能提升训练，包含沟通、项目管理等核心技能...',
    category: 'education',
    targetCircle: '职场新人',
    needType: '硬需求'
  }
]

export default function ResearchGuidePage() {
  const [ideaTitle, setIdeaTitle] = useState('')
  const [ideaDescription, setIdeaDescription] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [currentStage, setCurrentStage] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [reportId, setReportId] = useState<string | null>(null)

  // 连接真实API生成调研指导
  const handleGenerate = async () => {
    if (!ideaTitle.trim() || !ideaDescription.trim() || !selectedCategory) {
      alert('请填写完整的创意信息')
      return
    }

    setIsGenerating(true)
    setGenerationProgress(0)

    try {
      const token = localStorage.getItem('auth.access_token')
      if (!token) {
        alert('请先登录')
        return
      }

      // 调用真实的业务计划生成API
      const response = await fetch('/api/generate-business-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ideaData: {
            title: ideaTitle,
            description: ideaDescription,
            category: selectedCategory
          }
        })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || '生成调研指导失败')
      }

      setReportId(result.data.reportId)

      // 轮询检查生成进度
      pollReportProgress(result.data.reportId)

    } catch (error) {
      console.error('Generate research guide failed:', error)
      alert(error instanceof Error ? error.message : '生成调研指导失败')
      setIsGenerating(false)
    }
  }

  // 轮询检查报告生成进度
  const pollReportProgress = async (reportId: string) => {
    const maxAttempts = 30 // 最多轮询5分钟
    let attempts = 0

    const checkProgress = async () => {
      try {
        const token = localStorage.getItem('auth.access_token')
        const response = await fetch(`/api/generate-business-plan?reportId=${reportId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        const result = await response.json()

        if (result.success) {
          setGenerationProgress(result.data.progress)

          // 模拟阶段名称
          const stages = [
            '基本盘分析师正在分析目标圈子...',
            '调研方法专家正在制定调研计划...',
            '数据源指南正在整理数据渠道...',
            'MVP验证专家正在设计验证方案...',
            '商业模式导师正在探索盈利模式...'
          ]

          const stageIndex = Math.floor((result.data.progress / 100) * stages.length)
          if (stages[stageIndex]) {
            setCurrentStage(stages[stageIndex])
          }

          if (result.data.status === 'COMPLETED') {
            setIsGenerating(false)
            setShowResults(true)
            return
          }

          if (result.data.status === 'FAILED') {
            throw new Error('调研指导生成失败')
          }
        }

        attempts++
        if (attempts < maxAttempts) {
          setTimeout(checkProgress, 2000) // 每2秒检查一次
        } else {
          throw new Error('生成超时，请稍后重试')
        }

      } catch (error) {
        console.error('Progress check failed:', error)
        setIsGenerating(false)
        alert(error instanceof Error ? error.message : '检查进度失败')
      }
    }

    checkProgress()
  }

  // 下载调研指导文档
  const downloadResearchGuide = async () => {
    if (!reportId) {
      alert('没有可下载的报告')
      return
    }

    try {
      const token = localStorage.getItem('auth.access_token')
      const response = await fetch(`/api/generate-business-plan?reportId=${reportId}&download=true`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('下载失败')
      }

      const result = await response.json()

      if (result.success && result.data.reportData) {
        // 生成PDF格式的调研指导文档
        generatePDFReport(result.data)
      } else {
        throw new Error('报告数据不完整')
      }

    } catch (error) {
      console.error('Download failed:', error)
      alert(error instanceof Error ? error.message : '下载失败')
    }
  }

  // 生成PDF报告
  const generatePDFReport = (reportData: any) => {
    // 创建HTML内容
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${ideaTitle} - AI调研指导报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #3B82F6; padding-bottom: 20px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #3B82F6; border-left: 4px solid #3B82F6; padding-left: 10px; }
        .insight-list { list-style: none; padding: 0; }
        .insight-list li { margin: 10px 0; padding: 10px; background: #F3F4F6; border-radius: 5px; }
        .week-plan { background: #EFF6FF; padding: 15px; border-radius: 8px; margin: 10px 0; }
        .cost-item { display: flex; justify-content: space-between; padding: 8px; border-bottom: 1px solid #E5E7EB; }
        .total-cost { font-weight: bold; background: #3B82F6; color: white; padding: 10px; border-radius: 5px; }
        .badge { background: #10B981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
        .expert-card { background: #F9FAFB; border: 1px solid #E5E7EB; padding: 15px; margin: 10px 0; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${ideaTitle}</h1>
        <p><strong>AI调研指导报告</strong></p>
        <p>生成时间: ${new Date().toLocaleString('zh-CN')}</p>
    </div>

    <div class="section">
        <h2>🎯 基本盘分析</h2>
        <div class="expert-card">
            <h3>目标圈子: ${mockResearchGuide.basicAnalysis.targetCircle}</h3>
            <p><span class="badge">${mockResearchGuide.basicAnalysis.needType}</span> | 可信度: ${mockResearchGuide.basicAnalysis.confidence}</p>

            <h4>关键洞察:</h4>
            <ul class="insight-list">
                ${mockResearchGuide.basicAnalysis.keyInsights.map(insight => `<li>✓ ${insight}</li>`).join('')}
            </ul>
        </div>
    </div>

    <div class="section">
        <h2>📅 4周调研行动计划</h2>
        ${Object.entries(mockResearchGuide.actionPlan).map(([week, actions], index) => `
            <div class="week-plan">
                <h3>第${index + 1}周行动计划</h3>
                <ol>
                    ${(actions as string[]).map(action => `<li>${action}</li>`).join('')}
                </ol>
            </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>🔍 调研方法指导</h2>
        ${mockResearchGuide.researchMethods.map(method => `
            <div class="expert-card">
                <h3>${method.method} <span class="badge">${method.cost}</span></h3>
                <p><strong>对象:</strong> ${method.target}</p>
                <p><strong>时间:</strong> ${method.timeline}</p>
                ${method.questions ? `
                    <p><strong>关键问题:</strong></p>
                    <ul>${method.questions.map(q => `<li>${q}</li>`).join('')}</ul>
                ` : ''}
            </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>📊 数据源推荐</h2>
        ${mockResearchGuide.dataSources.map(source => `
            <div class="expert-card">
                <h3>${source.name} <span class="badge">${source.type}</span></h3>
                <p>${source.description}</p>
                <p><strong>成本:</strong> ${source.cost}</p>
                <p><strong>网站:</strong> ${source.url}</p>
            </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>💰 商业模式探索</h2>
        <div class="expert-card">
            <h3>推荐盈利模式:</h3>
            <ul>
                ${mockResearchGuide.businessModel.revenueModels.map(model => `<li>${model}</li>`).join('')}
            </ul>

            <h3>定价策略建议:</h3>
            <p><strong>${mockResearchGuide.businessModel.pricingStrategy}</strong></p>

            <h3>测试实验:</h3>
            <ul>
                ${mockResearchGuide.businessModel.experiments.map(exp => `<li>${exp}</li>`).join('')}
            </ul>
        </div>
    </div>

    <div class="section">
        <h2>💵 调研成本预估</h2>
        <div class="cost-item">
            <span>用户访谈</span>
            <span>200元</span>
        </div>
        <div class="cost-item">
            <span>竞品试用</span>
            <span>300元</span>
        </div>
        <div class="cost-item">
            <span>MVP开发</span>
            <span>1000元</span>
        </div>
        <div class="total-cost">
            <span>总计预算: 1500元</span>
        </div>
    </div>

    <div class="section">
        <p style="text-align: center; color: #6B7280; font-style: italic;">
            本报告由AI创意竞价平台生成 | www.aijiayuan.top<br>
            AI专家团队: DeepSeek + 智谱GLM + 阿里通义千问
        </p>
    </div>
</body>
</html>
    `

    // 创建下载链接
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${ideaTitle}_AI调研指导报告_${new Date().toISOString().split('T')[0]}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    alert('调研指导文档已下载！您可以在浏览器中打开查看，或打印成PDF保存。')
  }

  // 模拟调研指导结果
  const mockResearchGuide = {
    basicAnalysis: {
      targetCircle: "程序员和技术团队",
      needType: "硬需求",
      confidence: "高",
      keyInsights: [
        "从身边的技术朋友开始验证",
        "代码质量直接影响项目成败，这是硬需求",
        "你的技术背景是天然优势",
        "信息差：很多人不知道AI能做代码审查"
      ]
    },
    actionPlan: {
      week1: [
        "访谈10个程序员朋友，问他们代码审查的痛点",
        "收集他们现在用什么工具，有什么不满",
        "询问他们是否愿意为AI代码审查付费，愿意付多少"
      ],
      week2: [
        "深度调研GitHub Copilot、SonarQube等竞品",
        "分析竞品的用户评价和抱怨（GitHub、知乎、V2EX）",
        "识别市场空白和差异化机会"
      ],
      week3: [
        "设计并制作MVP原型（可以是简单的在线工具）",
        "用10个真实项目测试AI审查效果",
        "收集用户反馈和改进建议"
      ],
      week4: [
        "测试定价策略：免费试用+订阅模式",
        "计算获客成本和用户价值",
        "准备下一轮验证或种子轮融资"
      ]
    },
    dataSources: [
      {
        type: "免费",
        name: "GitHub开源项目统计",
        description: "分析代码质量工具的使用情况和用户反馈",
        url: "github.com",
        cost: "免费"
      },
      {
        type: "免费",
        name: "StackOverflow开发者调研",
        description: "了解程序员的工具使用习惯和痛点",
        url: "stackoverflow.com",
        cost: "免费"
      },
      {
        type: "付费",
        name: "JetBrains开发者生态报告",
        description: "深入了解开发者工具使用趋势",
        url: "jetbrains.com",
        cost: "部分免费，详细报告需付费"
      }
    ],
    researchMethods: [
      {
        method: "用户访谈",
        target: "10个不同经验的程序员",
        questions: [
          "你现在如何进行代码审查？",
          "最头疼的代码质量问题是什么？",
          "愿意为自动化代码审查工具付多少钱？",
          "你觉得AI能帮你解决什么代码问题？"
        ],
        timeline: "第1周完成",
        cost: "0元（请朋友喝咖啡）"
      },
      {
        method: "竞品分析",
        targets: ["GitHub Copilot", "SonarQube", "CodeClimate", "DeepCode"],
        focus: "价格、功能、用户反馈、市场定位",
        timeline: "第2周完成",
        cost: "200元（购买竞品试用）"
      },
      {
        method: "MVP验证",
        approach: "制作简单的代码审查工具原型",
        testUsers: "20个程序员朋友",
        timeline: "第3周完成",
        cost: "1000元（开发工具和云服务）"
      }
    ],
    businessModel: {
      revenueModels: [
        "免费版 + 付费高级功能",
        "按代码行数收费",
        "团队订阅制",
        "企业级私有部署"
      ],
      pricingStrategy: "免费试用 → 个人版19元/月 → 团队版99元/月",
      experiments: [
        "测试不同价格点的用户接受度",
        "A/B测试免费功能的边界",
        "验证企业客户的付费意愿"
      ]
    }
  }

  const handleSampleSelect = (idea: any) => {
    setIdeaTitle(idea.title)
    setIdeaDescription(idea.description)
    setSelectedCategory(idea.category)
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <div className="container mx-auto px-4 py-8">
          {/* 页面标题 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              AI创意调研指导工具
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
              不生成虚假报告，而是教你如何科学调研
            </p>
            <div className="flex justify-center items-center gap-2 text-sm text-gray-500">
              <span>从身边开始</span>
              <ArrowRight className="w-4 h-4" />
              <span>验证需求</span>
              <ArrowRight className="w-4 h-4" />
              <span>找到数据</span>
              <ArrowRight className="w-4 h-4" />
              <span>快速测试</span>
              <ArrowRight className="w-4 h-4" />
              <span>探索商业模式</span>
            </div>
          </motion.div>

          {!showResults ? (
            <>
              {/* AI调研导师团队展示 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-12"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">🧠 AI调研导师团队</CardTitle>
                    <CardDescription className="text-center">
                      5位专家，教你用最低成本验证创意可行性
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {researchExperts.map((expert, index) => (
                        <motion.div
                          key={expert.name}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="text-center"
                        >
                          <div className={`w-16 h-16 rounded-full ${expert.color} flex items-center justify-center text-2xl mx-auto mb-3`}>
                            {expert.icon}
                          </div>
                          <h3 className="font-semibold text-sm mb-1">{expert.name}</h3>
                          <p className="text-xs text-gray-600 mb-2">{expert.role}</p>
                          <p className="text-xs text-gray-500 mb-2">{expert.specialty}</p>
                          <Badge variant="outline" className="text-xs">{expert.ai}</Badge>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {!isGenerating ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* 左侧：创意输入 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="w-5 h-5" />
                          输入你的创意
                        </CardTitle>
                        <CardDescription>
                          AI专家将为你制定专属的调研行动计划
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <label className="text-sm font-medium mb-2 block">创意标题</label>
                          <Input
                            placeholder="用一句话描述你的创意..."
                            value={ideaTitle}
                            onChange={(e) => setIdeaTitle(e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">详细描述</label>
                          <Textarea
                            placeholder="详细描述你的创意、要解决的问题、目标用户等..."
                            value={ideaDescription}
                            onChange={(e) => setIdeaDescription(e.target.value)}
                            rows={6}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">选择分类</label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {categories.map((category) => (
                              <Button
                                key={category.id}
                                variant={selectedCategory === category.id ? "default" : "outline"}
                                className="h-16 flex flex-col items-center justify-center"
                                onClick={() => setSelectedCategory(category.id)}
                              >
                                <span className="text-2xl mb-1">{category.icon}</span>
                                <span className="text-xs">{category.name}</span>
                              </Button>
                            ))}
                          </div>
                        </div>

                        <Button
                          onClick={handleGenerate}
                          className="w-full"
                          size="lg"
                          disabled={!ideaTitle.trim() || !ideaDescription.trim() || !selectedCategory}
                        >
                          <Search className="w-4 h-4 mr-2" />
                          开始AI调研指导 (500积分)
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* 右侧：示例创意和说明 */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-6"
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="w-5 h-5" />
                          调研示例案例
                        </CardTitle>
                        <CardDescription>
                          点击选择示例创意，快速体验调研指导
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {sampleIdeas.map((idea, index) => (
                          <div
                            key={index}
                            className="p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer"
                            onClick={() => handleSampleSelect(idea)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-medium">{idea.title}</h3>
                              <div className="flex gap-1">
                                <Badge variant="outline">{idea.targetCircle}</Badge>
                                <Badge variant={idea.needType === '硬需求' ? 'default' : 'secondary'}>
                                  {idea.needType}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{idea.description}</p>
                            <div className="flex items-center gap-2">
                              <Search className="w-4 h-4 text-primary" />
                              <span className="text-sm text-primary">点击获取调研指导</span>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5" />
                          你将获得什么
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="text-sm font-medium">基本盘分析</span>
                              <p className="text-xs text-gray-600">从哪个圈子开始验证最容易成功</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="text-sm font-medium">4周行动计划</span>
                              <p className="text-xs text-gray-600">具体的调研步骤和时间安排</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="text-sm font-medium">数据源指南</span>
                              <p className="text-xs text-gray-600">免费和付费数据源的具体获取方法</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="text-sm font-medium">MVP验证方案</span>
                              <p className="text-xs text-gray-600">低成本快速验证的具体方法</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="text-sm font-medium">盈利模式探索</span>
                              <p className="text-xs text-gray-600">可测试的商业模式和定价策略</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              ) : (
                /* 生成进度页面 */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-2xl mx-auto"
                >
                  <Card>
                    <CardHeader className="text-center">
                      <CardTitle className="text-2xl">AI专家团队正在分析你的创意</CardTitle>
                      <CardDescription>
                        多位调研专家正在协同工作，制定专属调研方案...
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-primary mb-2">{generationProgress}%</div>
                        <Progress value={generationProgress} className="h-3" />
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Search className="w-5 h-5 text-blue-500 animate-pulse" />
                          <span className="font-medium">{currentStage}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          预计还需 {Math.max(0, 5 - Math.floor(generationProgress / 20))} 分钟完成
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {researchExperts.map((expert, index) => (
                          <div
                            key={index}
                            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                              generationProgress > index * 20
                                ? 'bg-green-50 border border-green-200'
                                : generationProgress === (index + 1) * 20
                                ? 'bg-blue-50 border border-blue-200'
                                : 'bg-gray-50'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${expert.color}`}>
                              {generationProgress > index * 20 ? (
                                <CheckCircle className="w-4 h-4 text-white" />
                              ) : generationProgress === (index + 1) * 20 ? (
                                <Clock className="w-4 h-4 text-white animate-spin" />
                              ) : (
                                <div className="w-4 h-4 text-white opacity-50">{expert.icon}</div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{expert.name}</div>
                              <div className="text-xs text-muted-foreground">{expert.role}</div>
                            </div>
                            {generationProgress > index * 20 && (
                              <Badge variant="outline" className="text-green-600">
                                已完成
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </>
          ) : (
            /* 调研指导结果展示 */
            <div className="space-y-8">
              {/* 基本盘分析结果 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    基本盘分析 - 从这里开始
                  </CardTitle>
                  <CardDescription>
                    基于你的创意特点，以下是最适合的起始策略
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="mb-4">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          🎯 目标圈子
                          <Badge variant={mockResearchGuide.basicAnalysis.needType === '硬需求' ? 'default' : 'secondary'}>
                            {mockResearchGuide.basicAnalysis.needType}
                          </Badge>
                        </h3>
                        <p className="text-gray-700">{mockResearchGuide.basicAnalysis.targetCircle}</p>
                      </div>

                      <h3 className="font-semibold mb-3">💡 关键洞察</h3>
                      <ul className="space-y-2">
                        {mockResearchGuide.basicAnalysis.keyInsights.map((insight, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2 text-blue-800 flex items-center gap-2">
                        🚀 立即行动
                        <Badge className="bg-blue-600 text-white">可信度: {mockResearchGuide.basicAnalysis.confidence}</Badge>
                      </h3>
                      <p className="text-sm text-blue-700 mb-3">
                        先从身边的程序员朋友开始，这是最容易获得真实反馈的圈子。代码质量是硬需求，成功概率高。
                      </p>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        查看详细行动计划 <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 4周调研行动计划 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    4周调研行动计划
                  </CardTitle>
                  <CardDescription>
                    循序渐进的调研步骤，每周都有明确的目标和产出
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="week1" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="week1">第1周</TabsTrigger>
                      <TabsTrigger value="week2">第2周</TabsTrigger>
                      <TabsTrigger value="week3">第3周</TabsTrigger>
                      <TabsTrigger value="week4">第4周</TabsTrigger>
                    </TabsList>

                    {Object.entries(mockResearchGuide.actionPlan).map(([week, actions]) => (
                      <TabsContent key={week} value={week} className="mt-4">
                        <div className="space-y-3">
                          <div className="text-sm text-gray-600 mb-3">
                            {week === 'week1' && '目标：验证用户需求和痛点'}
                            {week === 'week2' && '目标：了解竞争环境和市场机会'}
                            {week === 'week3' && '目标：制作MVP并收集用户反馈'}
                            {week === 'week4' && '目标：验证商业模式和定价策略'}
                          </div>
                          {(actions as string[]).map((action, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                              <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                                {index + 1}
                              </div>
                              <p className="text-sm text-gray-700">{action}</p>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>

              {/* 调研方法和数据源 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      调研方法指导
                    </CardTitle>
                    <CardDescription>具体的执行方法和操作步骤</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockResearchGuide.researchMethods.map((method, index) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4 bg-blue-50 p-3 rounded">
                          <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                            {method.method}
                            <Badge variant="outline">{method.cost}</Badge>
                          </h3>
                          <div className="text-xs text-gray-600 space-y-1">
                            <p><strong>对象：</strong>{method.target}</p>
                            <p><strong>时间：</strong>{method.timeline}</p>
                            {method.questions && (
                              <div>
                                <strong>关键问题：</strong>
                                <ul className="ml-2 mt-1">
                                  {method.questions.slice(0, 2).map((q, i) => (
                                    <li key={i}>• {q}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      数据源推荐
                    </CardTitle>
                    <CardDescription>免费和付费数据获取渠道</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockResearchGuide.dataSources.map((source, index) => (
                        <div key={index} className="border-l-4 border-green-500 pl-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={source.type === '免费' ? 'secondary' : 'default'} className="text-xs">
                              {source.type}
                            </Badge>
                            <span className="font-semibold text-sm">{source.name}</span>
                            <ExternalLink className="w-3 h-3 text-gray-400" />
                          </div>
                          <p className="text-xs text-gray-600 mb-1">{source.description}</p>
                          <p className="text-xs text-green-600">{source.cost}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 商业模式探索 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    商业模式探索指导
                  </CardTitle>
                  <CardDescription>可测试的盈利模式和定价策略</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">💰 推荐盈利模式</h3>
                      <ul className="space-y-2">
                        {mockResearchGuide.businessModel.revenueModels.map((model, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm">{model}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">🎯 定价策略建议</h3>
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <p className="text-sm text-orange-800 font-medium mb-2">
                          {mockResearchGuide.businessModel.pricingStrategy}
                        </p>
                        <p className="text-xs text-orange-700">
                          先用免费版验证用户价值，再通过高级功能实现付费转化
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 成本预估和下一步 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      调研成本预估
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-sm font-medium">用户访谈</span>
                        <Badge variant="secondary">200元</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm font-medium">竞品试用</span>
                        <Badge variant="secondary">300元</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                        <span className="text-sm font-medium">MVP开发</span>
                        <Badge variant="secondary">1000元</Badge>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">总计</span>
                          <Badge className="bg-blue-600">1500元</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-blue-800">🎯 立即开始</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-blue-700 mb-4 text-sm">
                      你的调研指导方案已生成！立即开始第1周的用户访谈，验证核心假设。
                    </p>
                    <div className="space-y-2">
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={downloadResearchGuide}
                        disabled={!reportId}
                      >
                        下载完整调研指导文档
                      </Button>
                      <Button variant="outline" className="w-full">
                        预约1对1调研指导
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}