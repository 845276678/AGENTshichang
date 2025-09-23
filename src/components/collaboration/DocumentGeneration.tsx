'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Brain,
  FileText,
  Download,
  _Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  TrendingUp,
  _Users,
  _Shield,
  _Zap
} from 'lucide-react'

interface DocumentGenerationProps {
  ideaId: string
  agentId: string
  ideaTitle: string
  agentName: string
  collaborationResult: {
    enhancedTitle: string
    finalScore: number
    collaborationCost: number
  }
}

interface GenerationProgress {
  packageId: string
  status: 'generating' | 'completed' | 'failed'
  progress: number
  currentStep: string
  estimatedTimeRemaining: number
  generatedDocuments: number
  totalDocuments: number
  downloadUrl?: string
}

export default function DocumentGeneration({
  ideaId,
  agentId,
  ideaTitle,
  agentName,
  collaborationResult
}: DocumentGenerationProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState<GenerationProgress | null>(null)
  const [packageDetails, setPackageDetails] = useState<any>(null)

  const handleStartGeneration = async () => {
    setIsGenerating(true)

    try {
      const response = await fetch('/api/documents/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ideaId,
          agentId,
          templateIds: ['technical-architecture', 'business-plan'],
          customization: {
            targetMarket: '中高端用户群体',
            complexity: 'advanced'
          }
        })
      })

      if (!response.ok) {
        throw new Error('文档生成请求失败')
      }

      const result = await response.json()

      if (result.success) {
        setPackageDetails(result.data)
        // 开始轮询进度
        pollProgress(result.data.packageId)
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('文档生成错误:', error)
      setIsGenerating(false)
    }
  }

  const pollProgress = async (packageId: string) => {
    const poll = async () => {
      try {
        const response = await fetch(`/api/documents/generate?packageId=${packageId}`)
        const result = await response.json()

        if (result.success) {
          setProgress(result.data)

          if (result.data.status === 'completed') {
            setIsGenerating(false)
          } else if (result.data.status === 'failed') {
            setIsGenerating(false)
          } else {
            // 继续轮询
            setTimeout(poll, 2000)
          }
        }
      } catch (error) {
        console.error('进度查询错误:', error)
        setIsGenerating(false)
      }
    }

    poll()
  }

  const handleDownload = async () => {
    if (!progress?.downloadUrl) return

    try {
      const response = await fetch(progress.downloadUrl)
      if (!response.ok) throw new Error('下载失败')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${collaborationResult.enhancedTitle}-文档包.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('下载错误:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* AI文档生成介绍 */}
      <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">AI专业文档生成</CardTitle>
              <CardDescription>
                {agentName} 将为您的创意「{ideaTitle}」生成完整的专业实施文档包
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium">AI深度分析</div>
                <div className="text-sm text-muted-foreground">专业算法驱动</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium">6大核心文档</div>
                <div className="text-sm text-muted-foreground">24页专业内容</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <div>
                <div className="font-medium">商业级品质</div>
                <div className="text-sm text-muted-foreground">可直接实施</div>
              </div>
            </div>
          </div>

          {!isGenerating && !progress && (
            <div className="pt-4">
              <Button
                onClick={handleStartGeneration}
                className="w-full"
                size="lg"
              >
                <Brain className="w-5 h-5 mr-2" />
                开始生成专业文档包
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 文档生成进度 */}
      {isGenerating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              AI正在生成专业文档...
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {progress && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{progress.currentStep}</span>
                    <span>{progress.progress}%</span>
                  </div>
                  <Progress value={progress.progress} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">已生成文档:</span>
                    <span className="ml-2 font-medium">
                      {progress.generatedDocuments}/{progress.totalDocuments}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">预计剩余:</span>
                    <span className="ml-2 font-medium">
                      {progress.estimatedTimeRemaining > 0
                        ? `${Math.ceil(progress.estimatedTimeRemaining / 60)}分钟`
                        : '即将完成'
                      }
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* 生成完成 */}
      {progress?.status === 'completed' && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              文档生成完成！
            </CardTitle>
            <CardDescription className="text-green-700">
              您的专业文档包已准备就绪，可以下载使用
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleDownload} className="w-full" size="lg">
              <Download className="w-5 h-5 mr-2" />
              下载完整文档包 (.zip)
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 文档包详情预览 */}
      {packageDetails && (
        <Card>
          <CardHeader>
            <CardTitle>文档包详情</CardTitle>
            <CardDescription>
              {packageDetails.title}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="deliverables" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="deliverables">交付物</TabsTrigger>
                <TabsTrigger value="summary">概要</TabsTrigger>
                <TabsTrigger value="pricing">定价</TabsTrigger>
                <TabsTrigger value="metadata">元数据</TabsTrigger>
              </TabsList>

              <TabsContent value="deliverables" className="space-y-3">
                {packageDetails.deliverables?.map((doc: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <div className="font-medium">{doc.name}</div>
                      <div className="text-sm text-muted-foreground">{doc.description}</div>
                    </div>
                    <Badge variant="outline">{doc.pages}页</Badge>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="summary" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {packageDetails.summary?.totalPages}
                    </div>
                    <div className="text-sm text-muted-foreground">总页数</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {packageDetails.summary?.complexity}
                    </div>
                    <div className="text-sm text-muted-foreground">复杂度</div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>协作成本:</span>
                    <span>{packageDetails.pricing?.costAnalysis.collaborationCost} 积分</span>
                  </div>
                  <div className="flex justify-between">
                    <span>包装成本:</span>
                    <span>{packageDetails.pricing?.costAnalysis.packagingCost} 积分</span>
                  </div>
                  <div className="flex justify-between">
                    <span>平台费用:</span>
                    <span>{packageDetails.pricing?.costAnalysis.platformFee} 积分</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold text-lg">
                    <span>最终价格:</span>
                    <span className="text-primary">{packageDetails.pricing?.finalPrice} 积分</span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="metadata" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="font-medium">难度等级</div>
                    <Badge variant="outline">{packageDetails.metadata?.difficulty}</Badge>
                  </div>
                  <div>
                    <div className="font-medium">实施周期</div>
                    <div className="text-sm">{packageDetails.metadata?.timeToImplement}</div>
                  </div>
                  <div>
                    <div className="font-medium">预期ROI</div>
                    <div className="text-sm text-green-600">{packageDetails.metadata?.estimatedROI}</div>
                  </div>
                  <div>
                    <div className="font-medium">许可类型</div>
                    <Badge>{packageDetails.metadata?.license}</Badge>
                  </div>
                </div>

                <div>
                  <div className="font-medium mb-2">所需技能</div>
                  <div className="flex flex-wrap gap-1">
                    {packageDetails.metadata?.requiredSkills?.map((skill: string) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* 生成失败 */}
      {progress?.status === 'failed' && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              文档生成失败
            </CardTitle>
            <CardDescription className="text-red-700">
              生成过程中出现了问题，请稍后重试
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleStartGeneration}
              variant="outline"
              className="w-full"
            >
              重新生成
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}