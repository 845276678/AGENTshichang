'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Users,
  Code,
  Megaphone,
  DollarSign,
  Sparkles,
  Clock,
  Check,
  ArrowRight,
  Lightbulb,
  Loader2,
  Brain,
  TrendingUp,
  Info,
  Download,
  Eye,
  ChevronRight
} from 'lucide-react'
import { analyzeIdea, type IdeaAnalysisResult } from '@/lib/business-plan/idea-analyzer'

interface ModuleCardProps {
  id: string
  title: string
  description: string
  icon: React.ElementType
  color: string
  estimatedTime: string
  difficulty: string
  outputs: string[]
  isSelected: boolean
  onSelect: () => void
  isCompleted?: boolean
  isRecommended?: boolean
}

const ModuleCard: React.FC<ModuleCardProps> = ({
  title,
  description,
  icon: Icon,
  color,
  estimatedTime,
  difficulty,
  outputs,
  isSelected,
  onSelect,
  isCompleted,
  isRecommended
}) => {
  return (
    <Card
      className={`relative cursor-pointer transition-all duration-300 ${
        isSelected
          ? `border-2 ${color} shadow-lg scale-105`
          : 'border hover:shadow-md hover:scale-102'
      } ${isCompleted ? 'bg-green-50 border-green-300' : ''}`}
      onClick={onSelect}
    >
      {isRecommended && !isCompleted && (
        <div className="absolute -top-3 -right-3 bg-yellow-500 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg z-10">
          AI推荐
        </div>
      )}
      {isCompleted && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 z-10">
          <Check className="w-4 h-4" />
        </div>
      )}
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-14 h-14 rounded-xl ${color.replace('border-', 'bg-').replace('500', '100')} flex items-center justify-center`}>
            <Icon className={`w-7 h-7 ${color.replace('border-', 'text-')}`} />
          </div>
          {isSelected && !isCompleted && (
            <Badge className={color.replace('border-', 'bg-')}>已选中</Badge>
          )}
        </div>

        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-gray-600">
              <Clock className="w-4 h-4" />
              {estimatedTime}
            </span>
            <Badge variant="outline">{difficulty}</Badge>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">输出内容:</p>
            <div className="flex flex-wrap gap-1">
              {outputs.map((output, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {output}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface ModuleResult {
  moduleId: string
  data: any
  downloadUrl?: string
  previewUrl?: string
}

export default function ModularBusinessPlanPage() {
  const router = useRouter()
  const [ideaTitle, setIdeaTitle] = useState('')
  const [ideaContent, setIdeaContent] = useState('')
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set())
  const [isGenerating, setIsGenerating] = useState(false)
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set())
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<IdeaAnalysisResult | null>(null)
  const [moduleResults, setModuleResults] = useState<Map<string, ModuleResult>>(new Map())
  const [currentGeneratingModule, setCurrentGeneratingModule] = useState<string>('')

  const modules = [
    {
      id: 'market-analysis',
      title: '需求场景分析',
      description: '深入分析目标市场和用户需求，了解竞争格局',
      icon: Users,
      color: 'border-blue-500',
      estimatedTime: analysisResult?.moduleRelevance.marketAnalysis.estimatedTime || '3-5分钟',
      difficulty: analysisResult?.moduleRelevance.marketAnalysis.priority === 'high' ? '重要' : '一般',
      outputs: ['用户画像', '市场规模', '竞争分析', '需求洞察']
    },
    {
      id: 'mvp-prototype',
      title: 'MVP版本制作',
      description: '生成可交互的HTML前端原型，无需后端开发',
      icon: Code,
      color: 'border-green-500',
      estimatedTime: analysisResult?.moduleRelevance.mvpPrototype.estimatedTime || '5-8分钟',
      difficulty: analysisResult?.moduleRelevance.mvpPrototype.priority === 'high' ? '重要' : '一般',
      outputs: ['HTML代码', 'CSS样式', 'JS交互', '使用文档']
    },
    {
      id: 'marketing-strategy',
      title: '推广策略规划',
      description: '制定全面的营销推广计划和渠道策略',
      icon: Megaphone,
      color: 'border-purple-500',
      estimatedTime: analysisResult?.moduleRelevance.marketingStrategy.estimatedTime || '4-6分钟',
      difficulty: analysisResult?.moduleRelevance.marketingStrategy.priority === 'high' ? '重要' : '一般',
      outputs: ['渠道策略', '内容规划', '预算分配', '执行计划']
    },
    {
      id: 'business-model',
      title: '盈利模式设计',
      description: '设计可持续的商业变现方案和财务预测',
      icon: DollarSign,
      color: 'border-orange-500',
      estimatedTime: analysisResult?.moduleRelevance.businessModel.estimatedTime || '4-6分钟',
      difficulty: analysisResult?.moduleRelevance.businessModel.priority === 'high' ? '重要' : '一般',
      outputs: ['收入模式', '定价策略', '成本结构', '财务预测']
    }
  ]

  // 当分析完成后，自动选择推荐的模块
  useEffect(() => {
    if (analysisResult?.recommendations.suggestedModules) {
      setSelectedModules(new Set(analysisResult.recommendations.suggestedModules))
    }
  }, [analysisResult])

  // 智能分析创意
  const handleAnalyzeIdea = async () => {
    if (!ideaTitle.trim() || !ideaContent.trim()) {
      alert('请先输入创意标题和描述')
      return
    }

    setIsAnalyzing(true)
    try {
      const result = await analyzeIdea(ideaTitle, ideaContent)
      setAnalysisResult(result)
      console.log('✅ 创意分析结果:', result)
    } catch (error) {
      console.error('❌ 分析失败:', error)
      alert('分析失败，请重试')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleModuleSelect = (moduleId: string) => {
    const newSelected = new Set(selectedModules)
    if (newSelected.has(moduleId)) {
      newSelected.delete(moduleId)
    } else {
      newSelected.add(moduleId)
    }
    setSelectedModules(newSelected)
  }

  const handleGenerate = async () => {
    if (!ideaContent.trim()) {
      alert('请先输入您的创意想法')
      return
    }

    if (selectedModules.size === 0) {
      alert('请至少选择一个模块')
      return
    }

    // 重置本次生成的状态，避免沿用旧结果
    setCompletedModules(new Set())
    setModuleResults(new Map())
    setCurrentGeneratingModule('')

    setIsGenerating(true)
    const results = new Map<string, ModuleResult>()
    const failedModules: Array<{ id: string; status: number; message?: string }> = []

    try {
      // 按顺序生成选中的模块
      for (const moduleId of Array.from(selectedModules)) {
        setCurrentGeneratingModule(moduleId)
        console.log(`🔄 正在生成模块: ${moduleId}`)

        // 根据模块类型调用不同的API，使用分析结果中的数据
        let apiUrl = ''
        let requestBody: any = {
          ideaDescription: ideaContent,
          ideaTitle: ideaTitle
        }

        // 使用分析结果增强请求数据
        if (analysisResult) {
          requestBody.targetUsers = analysisResult.characteristics.targetUsers
          requestBody.coreFeatures = analysisResult.characteristics.coreFeatures
          requestBody.industryType = analysisResult.characteristics.industry
          requestBody.businessType = analysisResult.characteristics.businessType
        }

        switch (moduleId) {
          case 'market-analysis':
            apiUrl = '/api/business-plan/modules/market-analysis'
            requestBody.industryCategory = analysisResult?.characteristics.industry || '通用'
            if (analysisResult) {
              requestBody.focusAreas = analysisResult.moduleRelevance.marketAnalysis.suggestedFocus
              requestBody.keyQuestions = analysisResult.moduleRelevance.marketAnalysis.keyQuestions
            }
            break

          case 'mvp-prototype':
            apiUrl = '/api/business-plan/modules/mvp-prototype'
            if (analysisResult) {
              requestBody.targetUsers = analysisResult.characteristics.targetUsers
              requestBody.coreFeatures = analysisResult.moduleRelevance.mvpPrototype.suggestedFeatures
              requestBody.industryType = analysisResult.characteristics.industry
            } else {
              requestBody.targetUsers = ['目标用户']
              requestBody.coreFeatures = ['核心功能1', '核心功能2']
              requestBody.industryType = '通用'
            }
            break

          case 'marketing-strategy':
            apiUrl = '/api/business-plan/modules/marketing-strategy'
            if (analysisResult) {
              requestBody.targetUsers = analysisResult.characteristics.targetUsers
              requestBody.suggestedChannels = analysisResult.moduleRelevance.marketingStrategy.suggestedChannels
            } else {
              requestBody.targetUsers = ['目标用户']
            }
            break

          case 'business-model':
            apiUrl = '/api/business-plan/modules/business-model'
            if (analysisResult) {
              requestBody.targetUsers = analysisResult.characteristics.targetUsers
              requestBody.revenueStreams = analysisResult.moduleRelevance.businessModel.revenueStreams
              requestBody.costStructure = analysisResult.moduleRelevance.businessModel.costStructure
            } else {
              requestBody.targetUsers = ['目标用户']
            }
            break
        }

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        })

        if (response.ok) {
          const result = await response.json()
          results.set(moduleId, {
            moduleId,
            data: result.data,
            downloadUrl: result.data?.downloadUrls?.htmlBundle,
            previewUrl: result.data?.previewUrl
          })
          setCompletedModules(prev => new Set([...prev, moduleId]))
          console.log(`✅ 模块 ${moduleId} 生成完成`)
        } else {
          let errorMessage: string | undefined
          try {
            const errorPayload = await response.json()
            errorMessage = errorPayload?.error
          } catch {
            // ignore json parse error
          }
          failedModules.push({ id: moduleId, status: response.status, message: errorMessage })
          console.error(`❌ 模块 ${moduleId} 生成失败`, {
            status: response.status,
            error: errorMessage
          })
        }

        // 模拟进度
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      setModuleResults(results)

      if (failedModules.length === 0) {
        alert('所有选中的模块已生成完成！')
      } else {
        const failedSummary = failedModules
          .map(module => {
            const moduleName = modules.find(m => m.id === module.id)?.title || module.id
            return `${moduleName}（状态码 ${module.status}${module.message ? `，错误信息：${module.message}` : ''}）`
          })
          .join('\n')
        alert(`部分模块生成失败，请稍后重试：\n${failedSummary}`)
      }
    } catch (error) {
      console.error('❌ 生成失败:', error)
      alert('生成过程中出现错误，请重试')
    } finally {
      setIsGenerating(false)
      setCurrentGeneratingModule('')
    }
  }

  const handleDownloadModule = (moduleId: string) => {
    const result = moduleResults.get(moduleId)
    if (!result) return

    if (moduleId === 'mvp-prototype' && result.data?.prototype) {
      // 下载MVP HTML文件
      const htmlContent = result.data.prototype.htmlCode
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${ideaTitle || '创意项目'}-MVP原型.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } else {
      // 其他模块下载JSON
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${ideaTitle || '创意项目'}-${moduleId}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              模块化商业计划生成
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            AI智能分析您的创意，自动推荐最相关的模块，生成专业的商业计划内容
          </p>
        </div>

        {/* 创意输入区域 */}
        <Card className="mb-8 border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-yellow-500" />
              输入您的创意
            </CardTitle>
            <CardDescription>
              详细描述您的创意，AI将智能分析并推荐最适合的模块
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="ideaTitle" className="text-base font-semibold mb-2 block">
                创意标题 *
              </Label>
              <Input
                id="ideaTitle"
                value={ideaTitle}
                onChange={(e) => setIdeaTitle(e.target.value)}
                placeholder="例如：AI智能学习助手"
                className="text-base"
                disabled={isGenerating || isAnalyzing}
              />
            </div>

            <div>
              <Label htmlFor="ideaContent" className="text-base font-semibold mb-2 block">
                详细描述 *
              </Label>
              <Textarea
                id="ideaContent"
                value={ideaContent}
                onChange={(e) => setIdeaContent(e.target.value)}
                placeholder="例如：一个基于AI的个性化学习助手，能够根据学生的学习习惯和知识掌握程度，自动生成个性化的学习计划和练习题。目标用户是K12学生和家长，核心功能包括智能答疑、学习规划、进度追踪等..."
                className="min-h-[140px] resize-none text-base"
                disabled={isGenerating || isAnalyzing}
              />
              <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                <span>{ideaContent.length} 字符</span>
                <span>建议 100-500 字</span>
              </div>
            </div>

            <Button
              onClick={handleAnalyzeIdea}
              disabled={isAnalyzing || !ideaTitle.trim() || !ideaContent.trim()}
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  AI正在分析您的创意...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5 mr-2" />
                  AI智能分析创意
                  <Sparkles className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* AI分析结果展示 */}
        {analysisResult && (
          <Card className="mb-8 border-2 border-green-300 bg-gradient-to-r from-green-50 to-blue-50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <TrendingUp className="w-6 h-6" />
                AI分析结果
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 创意特征 */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600 mb-1">行业类型</div>
                  <div className="font-semibold text-blue-600">{analysisResult.characteristics.industry}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600 mb-1">商业模式</div>
                  <div className="font-semibold text-purple-600">{analysisResult.characteristics.businessType}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600 mb-1">复杂度</div>
                  <div className="font-semibold text-orange-600 capitalize">{analysisResult.characteristics.complexity}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600 mb-1">目标用户</div>
                  <div className="font-semibold text-green-600">{analysisResult.characteristics.targetUsers.join('、')}</div>
                </div>
              </div>

              {/* AI推荐 */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>AI智能推荐</AlertTitle>
                <AlertDescription className="mt-2 space-y-2">
                  <p className="font-semibold">{analysisResult.recommendations.criticalPath}</p>
                  <div className="space-y-1 text-sm">
                    {analysisResult.recommendations.suggestedOrder.map((order, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <ChevronRight className="w-4 h-4 text-blue-500" />
                        <span>{order}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    预计总时间: {analysisResult.recommendations.totalEstimatedTime}
                  </p>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* 模块选择区域 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">
            选择需要生成的模块
            <span className="text-sm font-normal text-gray-500 ml-2">
              （已选择 {selectedModules.size}/4）
            </span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((module) => (
              <ModuleCard
                key={module.id}
                {...module}
                isSelected={selectedModules.has(module.id)}
                isCompleted={completedModules.has(module.id)}
                isRecommended={analysisResult?.recommendations.suggestedModules.includes(module.id as any)}
                onSelect={() => !isGenerating && handleModuleSelect(module.id)}
              />
            ))}
          </div>
        </div>

        {/* 当前生成状态 */}
        {isGenerating && currentGeneratingModule && (
          <Alert className="mb-6 border-blue-300 bg-blue-50">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>正在生成模块</AlertTitle>
            <AlertDescription>
              当前正在生成: {modules.find(m => m.id === currentGeneratingModule)?.title}
            </AlertDescription>
          </Alert>
        )}

        {/* 操作按钮 */}
        <div className="flex flex-col items-center gap-4">
          <Button
            size="lg"
            onClick={handleGenerate}
            disabled={isGenerating || selectedModules.size === 0 || !ideaContent.trim()}
            className="px-12 h-14 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                正在生成中 ({completedModules.size}/{selectedModules.size})...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                开始生成选中的模块
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>

          {selectedModules.size > 0 && !isGenerating && (
            <p className="text-sm text-gray-600">
              预计耗时: {analysisResult?.recommendations.totalEstimatedTime || `${Array.from(selectedModules).length * 5} 分钟左右`}
            </p>
          )}
        </div>

        {/* 生成结果展示 */}
        {completedModules.size > 0 && (
          <Card className="mt-8 border-2 border-green-300">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
              <CardTitle className="flex items-center gap-2">
                <Check className="w-6 h-6 text-green-600" />
                生成完成的模块
              </CardTitle>
              <CardDescription>
                已完成 {completedModules.size} 个模块，您可以下载或查看详情
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                {Array.from(completedModules).map((moduleId) => {
                  const module = modules.find(m => m.id === moduleId)
                  if (!module) return null

                  return (
                    <Card key={moduleId} className="border-green-200 bg-green-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-10 h-10 rounded-lg ${module.color.replace('border-', 'bg-').replace('500', '100')} flex items-center justify-center`}>
                              <module.icon className={`w-5 h-5 ${module.color.replace('border-', 'text-')}`} />
                            </div>
                            <div>
                              <h4 className="font-semibold">{module.title}</h4>
                              <p className="text-xs text-gray-600">已生成完成</p>
                            </div>
                          </div>
                          <Check className="w-5 h-5 text-green-600" />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadModule(moduleId)}
                            className="flex-1"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            下载
                          </Button>
                          {moduleId === 'mvp-prototype' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const result = moduleResults.get(moduleId)
                                if (result?.data?.prototype) {
                                  // 在新窗口预览
                                  const win = window.open('', '_blank')
                                  if (win) {
                                    win.document.write(result.data.prototype.htmlCode)
                                    win.document.close()
                                  }
                                }
                              }}
                              className="flex-1"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              预览
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push(`/business-plan/workspace?ideaTitle=${encodeURIComponent(ideaTitle)}&ideaDescription=${encodeURIComponent(ideaContent)}`)}
                className="w-full mt-6"
              >
                前往工作台继续编辑
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 使用提示 */}
        <Card className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              使用建议
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5" />
                <span>先使用AI智能分析，系统会自动推荐最相关的模块</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5" />
                <span>可以根据AI推荐调整选择，也可以自由组合模块</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5" />
                <span>MVP原型支持在线预览和下载HTML文件</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5" />
                <span>所有模块的生成结果都可以下载保存</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
