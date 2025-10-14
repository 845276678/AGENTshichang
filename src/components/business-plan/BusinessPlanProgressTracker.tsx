'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  FileText,
  Eye,
  GitCompare,
  Star,
  ThumbsUp,
  RotateCcw,
  Download,
  Share2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// 类型定义
interface GenerationStage {
  id: string
  name: string
  description: string
  aiProvider: 'DEEPSEEK' | 'ZHIPU' | 'ALI'
  status: 'pending' | 'in_progress' | 'completed' | 'error'
  progress: number
  estimatedTime: string
  startTime?: Date
  completionTime?: Date
  currentStep?: string
  subSteps: Array<{
    name: string
    status: 'pending' | 'in_progress' | 'completed'
    duration?: number
  }>
  aiInsights: string[]
  deliverables: string[]
  versions: ContentVersion[]
}

interface ContentVersion {
  id: string
  version: number
  createdAt: Date
  aiProvider: string
  content: {
    title: string
    summary: string
    fullContent: string
    keyPoints: string[]
  }
  userFeedback?: {
    rating: number
    comments: string
    improvements: string[]
  }
  status: 'draft' | 'reviewed' | 'approved' | 'rejected'
  qualityScore: number
}

interface FeedbackData {
  rating: number
  comments: string
  improvements?: string[]
}

interface BusinessPlanProgressTrackerProps {
  stages: GenerationStage[]
  currentStageIndex: number
  overallProgress: number
  isGenerating: boolean
  onStagePreview: (stageId: string) => void
  onVersionSelect: (stageId: string, versionId: string) => void
  onFeedbackSubmit: (versionId: string, feedback: FeedbackData) => void
}

// AI服务商配置
const AI_PROVIDERS = {
  DEEPSEEK: {
    name: 'DeepSeek',
    color: 'from-blue-600 to-cyan-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50'
  },
  ZHIPU: {
    name: '智谱GLM',
    color: 'from-indigo-600 to-purple-500',
    textColor: 'text-indigo-700',
    bgColor: 'bg-indigo-50'
  },
  ALI: {
    name: '通义千问',
    color: 'from-orange-500 to-red-500',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50'
  }
}

// 主进度跟踪组件
export const BusinessPlanProgressTracker: React.FC<BusinessPlanProgressTrackerProps> = ({
  stages,
  currentStageIndex,
  overallProgress,
  isGenerating,
  onStagePreview,
  onVersionSelect,
  onFeedbackSubmit
}) => {
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null)
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set())

  const currentStage = stages[currentStageIndex]
  const completedStages = stages.filter(s => s.status === 'completed').length

  const toggleStageExpansion = (stageId: string) => {
    const newExpanded = new Set(expandedStages)
    if (newExpanded.has(stageId)) {
      newExpanded.delete(stageId)
    } else {
      newExpanded.add(stageId)
    }
    setExpandedStages(newExpanded)
  }

  return (
    <div className="space-y-6">
      {/* 总体进度卡片 */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>AI创意实现建议生成进度</CardTitle>
                <CardDescription>
                  基于3个AI服务，8个专业阶段生成完整方案
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {completedStages}/{stages.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 主进度条 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">整体进度</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(overallProgress)}%
                </span>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </div>

            {/* 当前状态 */}
            {isGenerating && currentStage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-blue-50 rounded-lg border border-blue-200"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="font-medium text-blue-900">
                    正在生成: {currentStage.name}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-700">
                    {currentStage.currentStep || '准备中...'}
                  </span>
                  <span className="text-blue-600">
                    {currentStage.progress}%
                  </span>
                </div>
                <Progress value={currentStage.progress} className="h-2 mt-2" />
              </motion.div>
            )}

            {/* 预计完成时间 */}
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                {isGenerating ? '生成中...' : completedStages === stages.length ? '已完成' : '等待开始'}
              </span>
              <span>
                预计总用时: 45-60分钟
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 阶段时间轴 */}
      <Card>
        <CardHeader>
          <CardTitle>生成阶段详情</CardTitle>
          <CardDescription>点击阶段查看详细内容和版本</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stages.map((stage, index) => (
              <StageTimelineItem
                key={stage.id}
                stage={stage}
                index={index}
                isActive={index === currentStageIndex}
                isExpanded={expandedStages.has(stage.id)}
                onToggle={() => toggleStageExpansion(stage.id)}
                onPreview={onStagePreview}
                onVersionSelect={onVersionSelect}
                onFeedbackSubmit={onFeedbackSubmit}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 选中阶段的详细内容 */}
      {selectedStageId && (
        <StageDetailPanel
          stage={stages.find(s => s.id === selectedStageId)!}
          onClose={() => setSelectedStageId(null)}
          onVersionSelect={onVersionSelect}
          onFeedbackSubmit={onFeedbackSubmit}
        />
      )}
    </div>
  )
}

// 阶段时间轴项组件
const StageTimelineItem: React.FC<{
  stage: GenerationStage
  index: number
  isActive: boolean
  isExpanded: boolean
  onToggle: () => void
  onPreview: (stageId: string) => void
  onVersionSelect: (stageId: string, versionId: string) => void
  onFeedbackSubmit: (versionId: string, feedback: FeedbackData) => void
}> = ({ stage, index, isActive, isExpanded, onToggle, onPreview, onVersionSelect, onFeedbackSubmit }) => {
  const provider = AI_PROVIDERS[stage.aiProvider]

  const getStatusIcon = () => {
    switch (stage.status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'in_progress':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusBgColor = () => {
    switch (stage.status) {
      case 'completed':
        return 'bg-green-50 border-green-200'
      case 'in_progress':
        return 'bg-blue-50 border-blue-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`border rounded-lg p-4 cursor-pointer transition-all ${
        isActive ? 'ring-2 ring-blue-500 shadow-md' : ''
      } ${getStatusBgColor()}`}
      onClick={onToggle}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* 状态图标 */}
          <div className="flex-shrink-0">
            {getStatusIcon()}
          </div>

          {/* 阶段信息 */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-sm">{stage.name}</h4>
              <Badge
                variant="outline"
                className={`text-xs ${provider.textColor}`}
              >
                {provider.name}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {stage.description}
            </p>
          </div>
        </div>

        {/* 右侧信息 */}
        <div className="flex items-center gap-2">
          {stage.status === 'completed' && stage.versions.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {stage.versions.length} 版本
            </Badge>
          )}

          {stage.status === 'in_progress' && (
            <div className="text-xs text-blue-600">
              {stage.progress}%
            </div>
          )}

          {stage.estimatedTime && (
            <div className="text-xs text-muted-foreground">
              {stage.estimatedTime}
            </div>
          )}
        </div>
      </div>

      {/* 进度条 */}
      {stage.status === 'in_progress' && (
        <div className="mt-3">
          <Progress value={stage.progress} className="h-1" />
          {stage.currentStep && (
            <p className="text-xs text-blue-600 mt-1">{stage.currentStep}</p>
          )}
        </div>
      )}

      {/* 展开内容 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 pt-4 border-t"
          >
            <StageExpandedContent
              stage={stage}
              onPreview={onPreview}
              onVersionSelect={onVersionSelect}
              onFeedbackSubmit={onFeedbackSubmit}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// 阶段展开内容组件
const StageExpandedContent: React.FC<{
  stage: GenerationStage
  onPreview: (stageId: string) => void
  onVersionSelect: (stageId: string, versionId: string) => void
  onFeedbackSubmit: (versionId: string, feedback: FeedbackData) => void
}> = ({ stage, onPreview, onVersionSelect, onFeedbackSubmit }) => {
  return (
    <div className="space-y-4">
      {/* 子步骤进度 */}
      {stage.subSteps && stage.subSteps.length > 0 && (
        <div>
          <h5 className="text-xs font-medium mb-2">执行步骤</h5>
          <div className="space-y-1">
            {stage.subSteps.map((step, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                {step.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                {step.status === 'in_progress' && <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />}
                {step.status === 'pending' && <Clock className="w-3 h-3 text-gray-400" />}
                <span className={step.status === 'completed' ? 'line-through text-muted-foreground' : ''}>
                  {step.name}
                </span>
                {step.duration && (
                  <span className="text-muted-foreground ml-auto">
                    {step.duration}ms
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI实时洞察 */}
      {stage.aiInsights && stage.aiInsights.length > 0 && (
        <div>
          <h5 className="text-xs font-medium mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-yellow-500" />
            AI洞察
          </h5>
          <ul className="space-y-1">
            {stage.aiInsights.map((insight, index) => (
              <li key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                <span className="w-1 h-1 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 版本管理 */}
      {stage.versions && stage.versions.length > 0 && (
        <div>
          <h5 className="text-xs font-medium mb-2">生成版本</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {stage.versions.map((version) => (
              <VersionCard
                key={version.id}
                version={version}
                onSelect={() => onVersionSelect(stage.id, version.id)}
                onFeedback={onFeedbackSubmit}
              />
            ))}
          </div>
        </div>
      )}

      {/* 交付物 */}
      {stage.deliverables && stage.deliverables.length > 0 && (
        <div>
          <h5 className="text-xs font-medium mb-2">预期交付物</h5>
          <div className="flex flex-wrap gap-1">
            {stage.deliverables.map((deliverable, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {deliverable}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-2 pt-2">
        <Button size="sm" variant="outline" onClick={() => onPreview(stage.id)}>
          <Eye className="w-3 h-3 mr-1" />
          预览内容
        </Button>
        {stage.versions.length > 1 && (
          <Button size="sm" variant="outline">
            <GitCompare className="w-3 h-3 mr-1" />
            对比版本
          </Button>
        )}
      </div>
    </div>
  )
}

// 版本卡片组件
const VersionCard: React.FC<{
  version: ContentVersion
  onSelect: () => void
  onFeedback: (versionId: string, feedback: FeedbackData) => void
}> = ({ version, onSelect, onFeedback }) => {
  const [showFeedback, setShowFeedback] = useState(false)

  const getStatusColor = () => {
    switch (version.status) {
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'reviewed':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className={`p-3 border rounded-lg ${getStatusColor()}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-xs">
            V{version.version}
          </Badge>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-2 h-2 ${
                  i < Math.floor(version.qualityScore / 20)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
        <Badge variant="outline" className="text-xs">
          {version.aiProvider}
        </Badge>
      </div>

      <p className="text-xs mb-2 line-clamp-2">
        {version.content.summary}
      </p>

      <div className="flex gap-1">
        <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={onSelect}>
          查看
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 text-xs"
          onClick={() => setShowFeedback(!showFeedback)}
        >
          反馈
        </Button>
      </div>

      {showFeedback && (
        <div className="mt-2 pt-2 border-t">
          <QuickFeedbackForm versionId={version.id} onSubmit={onFeedback} />
        </div>
      )}
    </div>
  )
}

// 快速反馈表单
const QuickFeedbackForm: React.FC<{
  versionId: string
  onSubmit: (versionId: string, feedback: FeedbackData) => void
}> = ({ versionId, onSubmit }) => {
  const [rating, setRating] = useState(0)
  const [comments, setComments] = useState('')

  const handleSubmit = () => {
    onSubmit(versionId, { rating, comments })
    setRating(0)
    setComments('')
  }

  return (
    <div className="space-y-2">
      {/* 评分 */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 cursor-pointer ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
            onClick={() => setRating(star)}
          />
        ))}
      </div>

      {/* 评论 */}
      <Textarea
        placeholder="简短评价..."
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        className="text-xs h-16 resize-none"
      />

      {/* 快速操作 */}
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={handleSubmit}>
          <ThumbsUp className="w-3 h-3 mr-1" />
          通过
        </Button>
        <Button size="sm" variant="ghost" className="h-6 text-xs">
          <RotateCcw className="w-3 h-3 mr-1" />
          重做
        </Button>
      </div>
    </div>
  )
}

// 阶段详情面板组件
const StageDetailPanel: React.FC<{
  stage: GenerationStage
  onClose: () => void
  onVersionSelect: (stageId: string, versionId: string) => void
  onFeedbackSubmit: (versionId: string, feedback: FeedbackData) => void
}> = ({ stage, onClose, onVersionSelect, onFeedbackSubmit }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{stage.name}</h2>
            <Button variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>

          <Tabs defaultValue="content" className="w-full">
            <TabsList>
              <TabsTrigger value="content">内容预览</TabsTrigger>
              <TabsTrigger value="versions">版本管理</TabsTrigger>
              <TabsTrigger value="analytics">数据分析</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="mt-4">
              {/* 内容预览区域 */}
              <div className="space-y-4">
                {stage.versions.map((version) => (
                  <Card key={version.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{version.content.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none">
                        {version.content.fullContent}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="versions" className="mt-4">
              {/* 版本管理区域 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stage.versions.map((version) => (
                  <VersionCard
                    key={version.id}
                    version={version}
                    onSelect={() => onVersionSelect(stage.id, version.id)}
                    onFeedback={onFeedbackSubmit}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-4">
              {/* 数据分析区域 */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>生成统计</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {stage.versions.length}
                        </div>
                        <div className="text-sm text-muted-foreground">生成版本</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {stage.completionTime && stage.startTime ?
                            Math.round((stage.completionTime.getTime() - stage.startTime.getTime()) / 1000)
                            : 0
                          }s
                        </div>
                        <div className="text-sm text-muted-foreground">生成用时</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {stage.versions.reduce((avg, v) => avg + v.qualityScore, 0) / stage.versions.length || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">平均质量分</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {stage.versions.filter(v => v.status === 'approved').length}
                        </div>
                        <div className="text-sm text-muted-foreground">通过版本</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </motion.div>
  )
}