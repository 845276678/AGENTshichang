'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FileText,
  Download,
  Eye,
  Share2,
  CheckCircle,
  TrendingUp,
  DollarSign,
  Shield,
  Code,
  Brain,
  Rocket,
  Star,
  Calendar,
  User,
  BarChart3,
  Target,
  Lightbulb,
  Building
} from 'lucide-react'

interface BusinessPlanResultProps {
  params: {
    id: string
  }
}

export default function BusinessPlanResultPage({ params }: BusinessPlanResultProps) {
  const [activeSection, setActiveSection] = useState('overview')

  // 模拟生成结果数据
  const businessPlan = {
    id: params.id,
    title: "智能冰箱食材管理助手",
    category: "生活创意",
    generatedAt: "2024-01-15T10:30:00Z",
    status: "completed",
    overallScore: 8.7,

    // 概览数据
    overview: {
      valueIncrease: "16倍",
      marketSize: "1,200亿元",
      roi: "35%",
      timeline: "18个月",
      fundingNeeded: "800万元"
    },

    // AI分析阶段结果
    stages: [
      {
        id: 'concept_analysis',
        name: '创意解析与理解',
        aiProvider: '百度文心一言',
        status: 'completed',
        score: 8.5,
        keyFindings: [
          '核心痛点：食材浪费率高达30%，管理效率低',
          '目标用户：25-45岁中产家庭，健康意识强',
          '创新点：AI视觉识别+智能推荐算法结合'
        ],
        deliverables: ['概念提取报告', '关键词标签', '问题陈述']
      },
      {
        id: 'market_research',
        name: '市场调研与分析',
        aiProvider: '讯飞星火',
        status: 'completed',
        score: 9.1,
        keyFindings: [
          'TAM: 1,200亿元（智能家居食品管理市场）',
          '发现8个直接竞品，市场竞争激烈但有差异化空间',
          '目标用户付费意愿强，平均可接受价格299元/年'
        ],
        deliverables: ['市场规模报告', '竞品分析', '用户画像']
      },
      {
        id: 'tech_architecture',
        name: '技术架构设计',
        aiProvider: '阿里通义千问',
        status: 'completed',
        score: 8.8,
        keyFindings: [
          '采用微服务架构，支持千万级用户并发',
          '核心技术：计算机视觉+NLP+推荐算法',
          '云服务成本预估：15万元/月（成熟期）'
        ],
        deliverables: ['系统架构图', 'API设计', '技术栈选择']
      },
      {
        id: 'financial_model',
        name: '财务建模与预测',
        aiProvider: '腾讯混元',
        status: 'completed',
        score: 8.9,
        keyFindings: [
          '5年预计收入：2.8亿元，净利润率达25%',
          '投资回报率：35%，回收期：2.5年',
          '融资需求：A轮800万，B轮3000万'
        ],
        deliverables: ['5年财务预测', '投资回报分析', '估值模型']
      },
      {
        id: 'legal_compliance',
        name: '法律合规分析',
        aiProvider: '智谱GLM',
        status: 'completed',
        score: 8.3,
        keyFindings: [
          '需申请2项发明专利，3项实用新型专利',
          '符合《个人信息保护法》要求，无重大合规风险',
          '建议注册5个类别商标，预估费用3万元'
        ],
        deliverables: ['合规检查表', '知识产权策略', '风险评估']
      }
    ],

    // 文档列表
    documents: [
      {
        name: '完整商业计划书',
        type: 'PDF',
        pages: 120,
        size: '12.5MB',
        description: '包含所有分析内容的完整版商业计划书'
      },
      {
        name: '投资者演示文稿',
        type: 'PPT',
        pages: 25,
        size: '8.2MB',
        description: '15分钟路演专用PPT，突出核心亮点'
      },
      {
        name: '技术实现文档',
        type: 'PDF',
        pages: 45,
        size: '6.8MB',
        description: '详细的技术架构和实现方案'
      },
      {
        name: '财务预测模型',
        type: 'Excel',
        pages: 1,
        size: '2.1MB',
        description: '可编辑的5年财务预测Excel模型'
      },
      {
        name: '法律合规指南',
        type: 'PDF',
        pages: 28,
        size: '3.2MB',
        description: '法律风险评估和合规操作指南'
      }
    ]
  }

  const handleDownload = (docType: string) => {
    console.log(`下载 ${docType}`)
    // 实际下载逻辑
  }

  const handleShare = () => {
    console.log('分享商业计划')
    // 分享逻辑
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <Badge variant="default" className="bg-green-100 text-green-800">
                  生成完成
                </Badge>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {businessPlan.title}
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  生成时间：{new Date(businessPlan.generatedAt).toLocaleString('zh-CN')}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  综合评分：{businessPlan.overallScore}/10
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                分享
              </Button>
              <Button onClick={() => handleDownload('all')}>
                <Download className="w-4 h-4 mr-2" />
                下载全部
              </Button>
            </div>
          </div>

          {/* 核心指标概览 */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">{businessPlan.overview.valueIncrease}</div>
                  <div className="text-sm text-muted-foreground">价值提升</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{businessPlan.overview.marketSize}</div>
                  <div className="text-sm text-muted-foreground">市场规模</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <DollarSign className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">{businessPlan.overview.roi}</div>
                  <div className="text-sm text-muted-foreground">投资回报率</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Calendar className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600">{businessPlan.overview.timeline}</div>
                  <div className="text-sm text-muted-foreground">预期时间</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Building className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-indigo-600">{businessPlan.overview.fundingNeeded}</div>
                  <div className="text-sm text-muted-foreground">融资需求</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="overview">总览</TabsTrigger>
            <TabsTrigger value="analysis">分析</TabsTrigger>
            <TabsTrigger value="documents">文档</TabsTrigger>
            <TabsTrigger value="insights">洞察</TabsTrigger>
          </TabsList>

          {/* 总览页签 */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI分析阶段总览 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    AI分析阶段完成情况
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {businessPlan.stages.map((stage) => (
                      <div key={stage.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="font-medium">{stage.name}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">{stage.aiProvider}</div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="font-medium">{stage.score}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 关键成果摘要 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    关键成果摘要
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-medium text-green-800 mb-2">市场机会</h4>
                      <p className="text-sm text-green-700">
                        智能家居食品管理市场规模达1,200亿元，年增长率25%，具有巨大商业潜力
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-800 mb-2">技术可行性</h4>
                      <p className="text-sm text-blue-700">
                        基于成熟的AI视觉识别技术，技术风险可控，预计18个月内可完成产品开发
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="font-medium text-purple-800 mb-2">盈利前景</h4>
                      <p className="text-sm text-purple-700">
                        5年内预计实现2.8亿元收入，净利润率25%，投资回报率35%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 详细分析页签 */}
          <TabsContent value="analysis" className="space-y-6">
            {businessPlan.stages.map((stage) => (
              <Card key={stage.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">✓</span>
                      </div>
                      {stage.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{stage.aiProvider}</Badge>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium">{stage.score}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">关键发现</h4>
                      <ul className="space-y-2">
                        {stage.keyFindings.map((finding, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                            {finding}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">交付物</h4>
                      <div className="flex flex-wrap gap-2">
                        {stage.deliverables.map((deliverable, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {deliverable}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* 文档下载页签 */}
          <TabsContent value="documents" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {businessPlan.documents.map((doc, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{doc.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{doc.type}</span>
                            <span>•</span>
                            <span>{doc.pages > 1 ? `${doc.pages}页` : doc.pages + '个文件'}</span>
                            <span>•</span>
                            <span>{doc.size}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{doc.description}</p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => console.log(`预览 ${doc.name}`)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        预览
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDownload(doc.type)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        下载
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* AI洞察页签 */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>成功关键因素</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm">AI技术优势和专利保护</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-sm">用户体验和产品差异化</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      <span className="text-sm">快速扩张和市场教育</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      <span className="text-sm">合作伙伴和渠道建设</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>风险提示</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <span className="text-sm">大厂进入带来的竞争压力</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      <span className="text-sm">用户隐私数据安全合规</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full" />
                      <span className="text-sm">技术迭代和产品升级成本</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>下一步行动建议</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium">立即行动（1个月内）</h4>
                      <p className="text-sm text-muted-foreground">组建核心团队，启动技术原型开发，申请核心专利</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground text-sm font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium">短期目标（3个月内）</h4>
                      <p className="text-sm text-muted-foreground">完成MVP开发，进行种子用户测试，准备A轮融资材料</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-muted-foreground text-sm font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium">中期规划（6个月内）</h4>
                      <p className="text-sm text-muted-foreground">完成A轮融资，扩大团队规模，启动正式产品开发</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}