'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Layout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import DocumentGeneration from '@/components/collaboration/DocumentGeneration'
import {
  CheckCircle,
  Star,
  TrendingUp,
  Users,
  Brain,
  FileText,
  Award,
  Sparkles,
  Zap,
  Clock
} from 'lucide-react'

interface CollaborationResult {
  ideaId: string
  agentId: string
  ideaTitle: string
  agentName: string
  originalDescription: string
  enhancedTitle: string
  enhancedDescription: string
  finalScore: number
  collaborationCost: number
  improvements: string[]
  marketAnalysis: {
    targetMarket: string
    marketSize: string
    competitiveAdvantage: string[]
  }
  implementationSuggestions: string[]
}

function CollaborationResultContent() {
  const searchParams = useSearchParams()
  const [showDocumentGeneration, setShowDocumentGeneration] = useState(false)
  const [collaborationResult, setCollaborationResult] = useState<CollaborationResult | null>(null)

  useEffect(() => {
    // 模拟从URL参数或API获取协作结果
    const mockResult: CollaborationResult = {
      ideaId: searchParams.get('ideaId') || 'idea-123',
      agentId: searchParams.get('agentId') || 'agent-healthgpt',
      ideaTitle: '智能健康管理平台',
      agentName: 'HealthGPT',
      originalDescription: '基于AI的个性化健康管理和疾病预防平台',
      enhancedTitle: 'SmartHealth - AI驱动的个人健康管理生态平台',
      enhancedDescription: '革命性的AI健康管理平台，集成可穿戴设备数据、医疗记录和生活方式信息，提供个性化健康评估、疾病风险预测和精准干预建议的一站式健康管理解决方案。',
      finalScore: 88,
      collaborationCost: 250,
      improvements: [
        '明确了目标用户群体：注重健康的中高收入人群',
        '完善了技术架构：AI算法 + 大数据分析 + 云计算',
        '优化了商业模式：订阅制 + 增值服务 + 数据授权',
        '增强了差异化优势：专业医疗团队 + AI预测算法',
        '制定了实施路线图：MVP → 市场验证 → 规模化扩张'
      ],
      marketAnalysis: {
        targetMarket: '25-45岁中高收入人群，约2000万潜在用户',
        marketSize: '健康管理市场规模¥1200亿，年增长率28.7%',
        competitiveAdvantage: [
          'AI算法准确率达87%，行业领先',
          '专业医疗团队背书，权威可信',
          '个性化程度高，用户粘性强',
          '数据积累形成护城河'
        ]
      },
      implementationSuggestions: [
        '第一阶段：开发MVP版本，专注核心功能',
        '第二阶段：与医院合作，获取真实医疗数据',
        '第三阶段：引入可穿戴设备，扩大数据来源',
        '第四阶段：开发企业版，进入B端市场'
      ]
    }

    setCollaborationResult(mockResult)
  }, [searchParams])

  if (!collaborationResult) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">加载协作结果中...</p>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 协作完成横幅 */}
        <Card className="mb-8 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl text-green-800">🎉 协作完成！</CardTitle>
                <CardDescription className="text-green-700 text-lg">
                  {collaborationResult.agentName} 已成功优化您的创意，提升评分至 {collaborationResult.finalScore} 分
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm text-green-600">协作成本</div>
                <div className="text-2xl font-bold text-green-800">{collaborationResult.collaborationCost} 积分</div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 左侧：协作结果详情 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 创意对比 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  创意优化对比
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">原始创意</Badge>
                  </div>
                  <div className="text-lg font-medium mb-2">{collaborationResult.ideaTitle}</div>
                  <p className="text-muted-foreground">{collaborationResult.originalDescription}</p>
                </div>

                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-purple-200 to-green-200"></div>
                  <div className="absolute left-3 top-1/2 w-3 h-3 bg-purple-600 rounded-full transform -translate-y-1/2"></div>
                  <div className="ml-8">
                    <TrendingUp className="w-6 h-6 text-purple-600 mb-2" />
                    <p className="text-sm text-purple-600 font-medium">AI优化升级</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="default" className="bg-green-600">优化后创意</Badge>
                    <Badge variant="outline" className="border-green-600 text-green-600">评分 {collaborationResult.finalScore}</Badge>
                  </div>
                  <div className="text-lg font-medium mb-2">{collaborationResult.enhancedTitle}</div>
                  <p className="text-muted-foreground">{collaborationResult.enhancedDescription}</p>
                </div>
              </CardContent>
            </Card>

            {/* 关键改进点 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  关键改进点
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {collaborationResult.improvements.map((improvement, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-yellow-600">{index + 1}</span>
                      </div>
                      <p className="text-sm">{improvement}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 市场分析 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  市场分析
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">目标市场</h4>
                  <p className="text-sm text-muted-foreground">{collaborationResult.marketAnalysis.targetMarket}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">市场规模</h4>
                  <p className="text-sm text-muted-foreground">{collaborationResult.marketAnalysis.marketSize}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">竞争优势</h4>
                  <div className="space-y-2">
                    {collaborationResult.marketAnalysis.competitiveAdvantage.map((advantage, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">{advantage}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 实施建议 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  实施路线图
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {collaborationResult.implementationSuggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-green-600">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{suggestion}</p>
                        {index < collaborationResult.implementationSuggestions.length - 1 && (
                          <div className="w-px h-4 bg-green-200 ml-4 mt-2"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：行动面板 */}
          <div className="space-y-6">
            {/* 评分展示 */}
            <Card>
              <CardHeader className="text-center">
                <CardTitle>创意评分</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-gray-200"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${collaborationResult.finalScore * 2.51} 251`}
                      className="text-green-600"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-green-600">{collaborationResult.finalScore}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">优秀创意，具有很高的商业价值</p>
              </CardContent>
            </Card>

            {/* 专业文档生成 */}
            <Card className="border-2 border-dashed border-primary/20">
              <CardHeader className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>生成专业文档</CardTitle>
                <CardDescription>
                  将协作结果转化为完整的商业实施方案
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!showDocumentGeneration ? (
                  <Button
                    onClick={() => setShowDocumentGeneration(true)}
                    className="w-full"
                    size="lg"
                  >
                    <Brain className="w-5 h-5 mr-2" />
                    开始生成文档包
                  </Button>
                ) : (
                  <p className="text-center text-sm text-muted-foreground">
                    文档生成组件已加载
                  </p>
                )}
              </CardContent>
            </Card>

            {/* 其他操作 */}
            <Card>
              <CardHeader>
                <CardTitle>下一步操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full">
                  <Users className="w-4 h-4 mr-2" />
                  分享给朋友
                </Button>
                <Button variant="outline" className="w-full">
                  <Award className="w-4 h-4 mr-2" />
                  申请孵化支持
                </Button>
                <Button variant="outline" className="w-full">
                  <Star className="w-4 h-4 mr-2" />
                  收藏到我的创意库
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 文档生成组件 */}
        {showDocumentGeneration && (
          <div className="mt-8">
            <DocumentGeneration
              ideaId={collaborationResult.ideaId}
              agentId={collaborationResult.agentId}
              ideaTitle={collaborationResult.ideaTitle}
              agentName={collaborationResult.agentName}
              collaborationResult={{
                enhancedTitle: collaborationResult.enhancedTitle,
                finalScore: collaborationResult.finalScore,
                collaborationCost: collaborationResult.collaborationCost
              }}
            />
          </div>
        )}
      </div>
    </Layout>
  )
}

export default function CollaborationResultPage() {
  return (
    <Suspense fallback={
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">页面加载中...</p>
            </div>
          </div>
        </div>
      </Layout>
    }>
      <CollaborationResultContent />
    </Suspense>
  )
}