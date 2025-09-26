'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Pause,
  Square,
  RefreshCw,
  Download,
  Share2,
  Settings,
  Eye,
  GitCompare,
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { BusinessPlanProgressTracker } from './BusinessPlanProgressTracker'
import { useBusinessPlanGeneration } from '@/stores/useBusinessPlanGeneration'

interface BusinessPlanGenerationWorkspaceProps {
  ideaData: {
    id: string
    title: string
    description: string
    category: string
    tags: string[]
    submittedBy: string
  }
  onComplete?: (plan: any) => void
  onSave?: (draft: any) => void
}

export const BusinessPlanGenerationWorkspace: React.FC<BusinessPlanGenerationWorkspaceProps> = ({
  ideaData,
  onComplete,
  onSave
}) => {
  const {
    isGenerating,
    isPaused,
    currentStageIndex,
    overallProgress,
    stages,
    errors,
    finalPlan,
    selectedVersions,
    startGeneration,
    pauseGeneration,
    resumeGeneration,
    stopGeneration,
    retryStage,
    selectVersion,
    submitFeedback,
    generateFinalPlan,
    exportPlan,
    saveDraft,
    reset,
    setIdeaData
  } = useBusinessPlanGeneration()

  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'versions' | 'results'>('overview')
  const [exportFormat, setExportFormat] = useState<'pdf' | 'docx' | 'html'>('pdf')

  useEffect(() => {
    setIdeaData(ideaData)
  }, [ideaData, setIdeaData])

  useEffect(() => {
    if (isGenerating && !isPaused) {
      setActiveTab('progress')
    }
    if (finalPlan) {
      setActiveTab('results')
      onComplete?.(finalPlan)
    }
  }, [isGenerating, isPaused, finalPlan, onComplete])

  const handleStartGeneration = async () => {
    try {
      await startGeneration()
    } catch (error) {
      console.error('Generation failed:', error)
    }
  }

  const handleExport = async (format: 'pdf' | 'docx' | 'html') => {
    try {
      const url = await exportPlan(format)
      const link = document.createElement('a')
      link.href = url
      link.download = `${ideaData.title}-business-plan.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const handleSaveDraft = async () => {
    try {
      await saveDraft()
      onSave?.({
        ideaId: ideaData.id,
        progress: overallProgress,
        stages: stages.length,
        completed: stages.filter(s => s.status === 'completed').length
      })
    } catch (error) {
      console.error('Save draft failed:', error)
    }
  }

  const completedStages = stages.filter(s => s.status === 'completed').length
  const hasErrors = errors.filter(e => !e.resolved).length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="container mx-auto py-8">
        {/* 头部控制区 */}
        <Card className="mb-8 border-2 border-primary/20">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl mb-2">AI商业计划书生成器</CardTitle>
                <CardDescription className="text-base">
                  为 "<span className="font-medium text-primary">{ideaData.title}</span>" 生成完整的商业化方案
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={overallProgress === 100 ? 'default' : 'secondary'} className="text-sm px-3 py-1">
                  {Math.round(overallProgress)}% 完成
                </Badge>
                <Badge variant="outline" className="text-sm">
                  {completedStages}/{stages.length} 阶段
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* 创意信息摘要 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-secondary/30 rounded-lg">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">分类</h4>
                <Badge variant="outline">{ideaData.category}</Badge>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">标签</h4>
                <div className="flex flex-wrap gap-1">
                  {ideaData.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                  {ideaData.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">+{ideaData.tags.length - 3}</Badge>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">提交者</h4>
                <span className="text-sm">{ideaData.submittedBy}</span>
              </div>
            </div>

            {/* 错误提示 */}
            {hasErrors && (
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>生成过程中遇到问题</AlertTitle>
                <AlertDescription>
                  {errors.filter(e => !e.resolved).length} 个错误需要处理
                  <Button size="sm" variant="ghost" className="ml-2" onClick={() => setActiveTab('progress')}>
                    查看详情
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* 控制按钮 */}
            <div className="flex items-center gap-4">
              {!isGenerating && !finalPlan && (
                <Button onClick={handleStartGeneration} size="lg" className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  开始生成方案
                </Button>
              )}

              {isGenerating && !isPaused && (
                <Button onClick={pauseGeneration} variant="outline" className="flex items-center gap-2">
                  <Pause className="w-4 h-4" />
                  暂停生成
                </Button>
              )}

              {isGenerating && isPaused && (
                <Button onClick={resumeGeneration} className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  继续生成
                </Button>
              )}

              {isGenerating && (
                <Button onClick={stopGeneration} variant="destructive" className="flex items-center gap-2">
                  <Square className="w-4 h-4" />
                  停止生成
                </Button>
              )}

              {(overallProgress > 0 && !isGenerating) && (
                <Button onClick={handleSaveDraft} variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  保存草稿
                </Button>
              )}

              {overallProgress > 0 && (
                <Button onClick={reset} variant="ghost" className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  重新开始
                </Button>
              )}

              <Button variant="ghost" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 左侧：快速状态面板 */}
          <div className="lg:col-span-1 space-y-6">
            <QuickStatusPanel
              stages={stages}
              currentStageIndex={currentStageIndex}
              isGenerating={isGenerating}
              errors={errors.filter(e => !e.resolved)}
            />

            <AIProviderStatus stages={stages} />

            {finalPlan && (
              <ExportPanel
                onExport={handleExport}
                finalPlan={finalPlan}
              />
            )}
          </div>

          {/* 右侧：主内容 */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">概览</TabsTrigger>
                <TabsTrigger value="progress">
                  生成进度
                  {isGenerating && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse ml-2" />}
                </TabsTrigger>
                <TabsTrigger value="versions">版本管理</TabsTrigger>
                <TabsTrigger value="results">
                  最终结果
                  {finalPlan && <CheckCircle className="w-3 h-3 text-green-500 ml-1" />}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <OverviewPanel ideaData={ideaData} stages={stages} />
              </TabsContent>

              <TabsContent value="progress" className="space-y-6">
                <BusinessPlanProgressTracker
                  stages={stages}
                  currentStageIndex={currentStageIndex}
                  overallProgress={overallProgress}
                  isGenerating={isGenerating}
                  onStagePreview={(stageId) => console.log('Preview stage:', stageId)}
                  onVersionSelect={selectVersion}
                  onFeedbackSubmit={submitFeedback}
                />
              </TabsContent>

              <TabsContent value="versions" className="space-y-6">
                <VersionManagementPanel
                  stages={stages}
                  selectedVersions={selectedVersions}
                  onVersionSelect={selectVersion}
                  onFeedbackSubmit={submitFeedback}
                />
              </TabsContent>

              <TabsContent value="results" className="space-y-6">
                {finalPlan ? (
                  <ResultsPanel
                    finalPlan={finalPlan}
                    onExport={handleExport}
                  />
                ) : (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">等待生成完成</h3>
                    <p className="text-muted-foreground">完整的商业计划书正在生成中...</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

// 快速状态面板组件
const QuickStatusPanel: React.FC<{
  stages: any[]
  currentStageIndex: number
  isGenerating: boolean
  errors: any[]
}> = ({ stages, currentStageIndex, isGenerating, errors }) => {
  const completedStages = stages.filter(s => s.status === 'completed').length
  const currentStage = stages[currentStageIndex]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">生成状态</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">{completedStages}</div>
            <div className="text-xs text-muted-foreground">已完成</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{stages.length - completedStages}</div>
            <div className="text-xs text-muted-foreground">待处理</div>
          </div>
        </div>

        {isGenerating && currentStage && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="font-medium text-sm">当前阶段</span>
            </div>
            <p className="text-xs text-blue-700">{currentStage.name}</p>
          </div>
        )}

        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              {errors.length} 个错误需要处理
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

// AI服务商状态面板
const AIProviderStatus: React.FC<{ stages: any[] }> = ({ stages }) => {
  const providers = ['DEEPSEEK', 'ZHIPU', 'ALI']
  const providerStats = providers.map(provider => ({
    name: provider,
    total: stages.filter(s => s.aiProvider === provider).length,
    completed: stages.filter(s => s.aiProvider === provider && s.status === 'completed').length,
    inProgress: stages.filter(s => s.aiProvider === provider && s.status === 'in_progress').length
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          AI服务商状态
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {providerStats.map(provider => (
          <div key={provider.name} className="flex justify-between items-center p-2 border rounded">
            <div className="text-sm font-medium">{provider.name}</div>
            <div className="flex items-center gap-1 text-xs">
              <Badge variant="secondary">{provider.completed}/{provider.total}</Badge>
              {provider.inProgress > 0 && (
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// 导出面板组件
const ExportPanel: React.FC<{
  onExport: (format: 'pdf' | 'docx' | 'html') => void
  finalPlan: any
}> = ({ onExport, finalPlan }) => {
  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="text-lg text-green-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          方案已完成
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-green-700 mb-3">
          生成于 {finalPlan.createdAt.toLocaleString()}
        </div>

        <Button
          onClick={() => onExport('pdf')}
          className="w-full flex items-center gap-2"
          size="sm"
        >
          <Download className="w-3 h-3" />
          下载 PDF
        </Button>

        <Button
          onClick={() => onExport('docx')}
          variant="outline"
          className="w-full flex items-center gap-2"
          size="sm"
        >
          <Download className="w-3 h-3" />
          下载 Word
        </Button>

        <Button
          variant="ghost"
          className="w-full flex items-center gap-2"
          size="sm"
        >
          <Share2 className="w-3 h-3" />
          分享方案
        </Button>
      </CardContent>
    </Card>
  )
}

// 概览面板组件
const OverviewPanel: React.FC<{
  ideaData: any
  stages: any[]
}> = ({ ideaData, stages }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>创意详情</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">描述</h4>
              <p className="text-sm text-muted-foreground">{ideaData.description}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">生成计划</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stages.map((stage, index) => (
                  <div key={stage.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{stage.name}</div>
                      <div className="text-xs text-muted-foreground">{stage.estimatedTime}</div>
                    </div>
                    <Badge variant="secondary" className="text-xs">{stage.aiProvider}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// 版本管理面板组件
const VersionManagementPanel: React.FC<{
  stages: any[]
  selectedVersions: Record<string, string>
  onVersionSelect: (stageId: string, versionId: string) => void
  onFeedbackSubmit: (versionId: string, feedback: any) => void
}> = ({ stages, selectedVersions, onVersionSelect, onFeedbackSubmit }) => {
  return (
    <div className="space-y-6">
      {stages.filter(s => s.versions.length > 0).map(stage => (
        <Card key={stage.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{stage.name}</span>
              <Badge variant="outline">{stage.versions.length} 版本</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stage.versions.map((version: any) => (
                <div
                  key={version.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedVersions[stage.id] === version.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'hover:border-gray-300'
                  }`}
                  onClick={() => onVersionSelect(stage.id, version.id)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <Badge variant="outline">V{version.version}</Badge>
                    <Badge variant="secondary" className="text-xs">{version.aiProvider}</Badge>
                  </div>
                  <h4 className="font-medium text-sm mb-1">{version.content.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">{version.content.summary}</p>
                  <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
                    <span>质量分: {Math.round(version.qualityScore)}</span>
                    <span>{version.createdAt.toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// 结果面板组件
const ResultsPanel: React.FC<{
  finalPlan: any
  onExport: (format: 'pdf' | 'docx' | 'html') => void
}> = ({ finalPlan, onExport }) => {
  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <CheckCircle className="w-6 h-6" />
            商业计划书生成成功！
          </CardTitle>
          <CardDescription className="text-green-700">
            完整的商业化方案已生成完毕，包含 {finalPlan.sections.length} 个专业章节
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{finalPlan.sections.length}</div>
              <div className="text-sm text-muted-foreground">章节数量</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ¥{finalPlan.metadata.totalCost.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">生成成本</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(finalPlan.metadata.totalTime / 60000)}min
              </div>
              <div className="text-sm text-muted-foreground">用时</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {finalPlan.metadata.aiProviders.length}
              </div>
              <div className="text-sm text-muted-foreground">AI服务</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={() => onExport('pdf')} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              下载 PDF
            </Button>
            <Button onClick={() => onExport('docx')} variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              下载 Word
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              在线预览
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 章节预览 */}
      <Card>
        <CardHeader>
          <CardTitle>方案章节概览</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {finalPlan.sections.map((section: any, index: number) => (
              <div key={section.stageId} className="flex items-center gap-4 p-4 border rounded-lg">
                <Badge className="text-sm">{index + 1}</Badge>
                <div className="flex-1">
                  <h4 className="font-medium">{section.content.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{section.content.summary}</p>
                </div>
                <Button size="sm" variant="ghost">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}