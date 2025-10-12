'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  Users,
  Target,
  Zap,
  DollarSign,
  Shield,
  Star,
  Settings
} from 'lucide-react'
import type { CompletenessAnalysis } from '@/lib/business-plan/idea-completeness-analyzer'

interface IdeaEnhancementFlowProps {
  analysis: CompletenessAnalysis
  ideaTitle: string
  ideaDescription: string
  onIdeaUpdate: (title: string, description: string) => void
  onReAnalyze: () => void
  onProceedGeneration: () => void
}

interface EnhancementStep {
  id: string
  dimension: string
  title: string
  icon: React.ElementType
  questions: string[]
  suggestions: string[]
  currentAnswer: string
}

export const IdeaEnhancementFlow: React.FC<IdeaEnhancementFlowProps> = ({
  analysis,
  ideaTitle,
  ideaDescription,
  onIdeaUpdate,
  onReAnalyze,
  onProceedGeneration
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [enhancementMode, setEnhancementMode] = useState<'overview' | 'guided' | 'freeform'>('overview')
  const [updatedDescription, setUpdatedDescription] = useState(ideaDescription)
  const [stepAnswers, setStepAnswers] = useState<Record<string, string>>({})

  // 获取需要改进的维度
  const lowScoreDimensions = Object.entries(analysis.dimensions)
    .filter(([, dim]) => dim.score < 60 && dim.missing.length > 0)
    .sort(([, a], [, b]) => a.score - b.score)

  // 创建改进步骤
  const enhancementSteps: EnhancementStep[] = lowScoreDimensions.map(([key, dim]) => ({
    id: key,
    dimension: getDimensionName(key),
    title: `完善${getDimensionName(key)}`,
    icon: getDimensionIcon(key),
    questions: dim.questions,
    suggestions: dim.suggestions,
    currentAnswer: stepAnswers[key] || ''
  }))

  const currentStep = enhancementSteps[currentStepIndex]

  // 质量等级对应的颜色和描述
  const qualityConfig = {
    high: { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-300', label: '优秀', desc: '信息完整，可生成高质量内容' },
    medium: { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-300', label: '良好', desc: '信息较完整，可生成基础内容' },
    low: { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-300', label: '一般', desc: '信息不足，建议完善后生成' },
    insufficient: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-300', label: '不足', desc: '信息严重不足，需要大幅完善' }
  }

  const config = qualityConfig[analysis.canGenerateQuality]

  const handleStepAnswer = (answer: string) => {
    setStepAnswers(prev => ({
      ...prev,
      [currentStep.id]: answer
    }))
  }

  const handleNextStep = () => {
    if (currentStepIndex < enhancementSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    } else {
      // 完成所有步骤，将答案合并到描述中
      const enhancedDescription = buildEnhancedDescription()
      setUpdatedDescription(enhancedDescription)
      onIdeaUpdate(ideaTitle, enhancedDescription)
    }
  }

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const buildEnhancedDescription = () => {
    let enhanced = updatedDescription

    // 为每个维度添加改进内容
    for (const [dimensionKey, answer] of Object.entries(stepAnswers)) {
      if (answer.trim()) {
        const dimensionName = getDimensionName(dimensionKey)
        enhanced += `\n\n【${dimensionName}补充】${answer}`
      }
    }

    return enhanced
  }

  const handleFreeformUpdate = () => {
    onIdeaUpdate(ideaTitle, updatedDescription)
    onReAnalyze()
  }

  if (enhancementMode === 'overview') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* 分析结果概览 */}
        <Card className={`border-2 ${config.border} ${config.bg}`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${config.color}`}>
              <TrendingUp className="w-6 h-6" />
              创意完整度分析报告
            </CardTitle>
            <CardDescription>
              AI分析了您的创意，以下是详细的完整度评估
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 总体评分 */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-4">
                <div className="text-6xl font-bold text-gray-800">{analysis.overallScore}</div>
                <div className="text-left">
                  <div className="text-2xl font-semibold text-gray-600">/ 100</div>
                  <Badge className={`${config.color} bg-white border-current`}>
                    {config.label}
                  </Badge>
                </div>
              </div>
              <Progress value={analysis.overallScore} className="w-full max-w-md mx-auto h-3" />
              <p className={`text-sm ${config.color} font-medium`}>{config.desc}</p>
            </div>

            {/* 8个维度的详细分析 */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(analysis.dimensions).map(([key, dimension]) => {
                const Icon = getDimensionIcon(key)
                const isLow = dimension.score < 60

                return (
                  <Card key={key} className={`p-4 ${isLow ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-5 h-5 ${isLow ? 'text-orange-600' : 'text-green-600'}`} />
                      <span className="font-semibold text-sm">{getDimensionName(key)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-800">{dimension.score}</span>
                      {isLow ? (
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                    {dimension.missing.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-orange-600">需要完善:</p>
                        <ul className="text-xs text-orange-600 mt-1">
                          {dimension.missing.slice(0, 2).map((item, idx) => (
                            <li key={idx} className="truncate">• {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>

            {/* 改进建议 */}
            {analysis.recommendations.length > 0 && (
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>AI改进建议</AlertTitle>
                <AlertDescription className="mt-2 space-y-2">
                  {analysis.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Badge variant="outline" className="text-xs">
                        {rec.priority === 'high' ? '高优先级' : rec.priority === 'medium' ? '中优先级' : '低优先级'}
                      </Badge>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{rec.dimension}</p>
                        <p className="text-sm text-gray-600">{rec.suggestion}</p>
                      </div>
                    </div>
                  ))}
                </AlertDescription>
              </Alert>
            )}

            {/* 下一步建议 */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                建议的下一步操作
              </h4>
              {analysis.nextSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2 p-3 bg-white rounded-lg border">
                  <span className="text-blue-600 font-semibold text-sm">{idx + 1}</span>
                  <span className="text-sm">{step}</span>
                </div>
              ))}
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              {analysis.canGenerateQuality === 'insufficient' ? (
                <Button
                  onClick={() => setEnhancementMode('guided')}
                  className="flex-1"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  引导式完善创意
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setEnhancementMode('guided')}
                    className="flex-1"
                  >
                    <HelpCircle className="w-4 h-4 mr-2" />
                    引导式完善
                  </Button>
                  <Button
                    onClick={onProceedGeneration}
                    className="flex-1"
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    开始生成模块
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                onClick={() => setEnhancementMode('freeform')}
              >
                <Settings className="w-4 h-4 mr-2" />
                自由编辑
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (enhancementMode === 'guided' && enhancementSteps.length > 0) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        {/* 进度指示器 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">引导式完善 ({currentStepIndex + 1}/{enhancementSteps.length})</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEnhancementMode('overview')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回概览
              </Button>
            </div>
            <Progress value={(currentStepIndex + 1) / enhancementSteps.length * 100} />
          </CardContent>
        </Card>

        {/* 当前步骤 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStepIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 border-blue-300">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center gap-2">
                  <currentStep.icon className="w-6 h-6 text-blue-600" />
                  {currentStep.title}
                </CardTitle>
                <CardDescription>
                  请回答以下问题来完善{currentStep.dimension}信息
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* 问题列表 */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">引导问题:</h4>
                  {currentStep.questions.map((question, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                      <HelpCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                      <span className="text-sm">{question}</span>
                    </div>
                  ))}
                </div>

                {/* 建议 */}
                {currentStep.suggestions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">完善建议:</h4>
                    {currentStep.suggestions.map((suggestion, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2 bg-yellow-50 rounded-lg">
                        <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                        <span className="text-sm">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 回答输入 */}
                <div className="space-y-2">
                  <Label htmlFor="step-answer">您的回答:</Label>
                  <Textarea
                    id="step-answer"
                    placeholder="请详细回答上述问题，帮助我们更好地理解您的创意..."
                    value={stepAnswers[currentStep.id] || ''}
                    onChange={(e) => handleStepAnswer(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>

                {/* 导航按钮 */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={handlePrevStep}
                    disabled={currentStepIndex === 0}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    上一步
                  </Button>
                  <Button
                    onClick={handleNextStep}
                    disabled={!stepAnswers[currentStep.id]?.trim()}
                    className="flex-1"
                  >
                    {currentStepIndex === enhancementSteps.length - 1 ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        完成完善
                      </>
                    ) : (
                      <>
                        下一步
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    )
  }

  if (enhancementMode === 'freeform') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-6 h-6" />
              自由编辑创意描述
            </CardTitle>
            <CardDescription>
              您可以直接编辑创意描述，然后重新分析
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="updated-description">创意描述:</Label>
              <Textarea
                id="updated-description"
                value={updatedDescription}
                onChange={(e) => setUpdatedDescription(e.target.value)}
                className="min-h-[200px]"
                placeholder="请详细描述您的创意..."
              />
              <div className="text-right text-sm text-gray-500">
                {updatedDescription.length} 字符
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setEnhancementMode('overview')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回概览
              </Button>
              <Button
                onClick={handleFreeformUpdate}
                disabled={updatedDescription === ideaDescription}
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                重新分析
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return null
}

function getDimensionName(key: string): string {
  const names: Record<string, string> = {
    targetUsers: '目标用户',
    painPoints: '痛点分析',
    coreFeatures: '核心功能',
    userScenarios: '使用场景',
    businessModel: '商业模式',
    competitors: '竞争分析',
    uniqueValue: '独特价值',
    techRequirements: '技术需求'
  }
  return names[key] || key
}

function getDimensionIcon(key: string): React.ElementType {
  const icons: Record<string, React.ElementType> = {
    targetUsers: Users,
    painPoints: AlertTriangle,
    coreFeatures: Zap,
    userScenarios: Target,
    businessModel: DollarSign,
    competitors: Shield,
    uniqueValue: Star,
    techRequirements: Settings
  }
  return icons[key] || HelpCircle
}