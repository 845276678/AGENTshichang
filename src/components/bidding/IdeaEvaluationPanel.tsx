'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Lightbulb,
  TrendingUp,
  ChevronRight,
  Edit,
  RefreshCw
} from 'lucide-react'
import {
  scoreIdea,
  getScoreLevelColor,
  getScoreLevelText,
  type IdeaScore
} from '@/lib/idea-scoring'

interface IdeaEvaluationPanelProps {
  ideaContent: string
  onIdeaUpdate?: (newContent: string) => void
  onProceedToBidding?: () => void
  onSkipEvaluation?: () => void
  className?: string
}

export const IdeaEvaluationPanel: React.FC<IdeaEvaluationPanelProps> = ({
  ideaContent,
  onIdeaUpdate,
  onProceedToBidding,
  onSkipEvaluation,
  className = ''
}) => {
  const [score, setScore] = useState<IdeaScore | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(ideaContent)
  const [isEvaluating, setIsEvaluating] = useState(false)

  // 初始评估
  useEffect(() => {
    if (ideaContent) {
      evaluateIdea(ideaContent)
    }
  }, [ideaContent])

  const evaluateIdea = (content: string) => {
    setIsEvaluating(true)
    // 模拟评估延迟，让用户感觉AI在认真分析
    setTimeout(() => {
      const newScore = scoreIdea(content)
      setScore(newScore)
      setIsEvaluating(false)
    }, 1000)
  }

  const handleSaveEdit = () => {
    setIsEditing(false)
    onIdeaUpdate?.(editedContent)
    evaluateIdea(editedContent)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedContent(ideaContent)
  }

  const handleReEvaluate = () => {
    evaluateIdea(editedContent)
  }

  if (!score) {
    return (
      <Card className={`w-full max-w-4xl mx-auto ${className}`}>
        <CardContent className="p-8 flex flex-col items-center justify-center">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          <p className="text-lg text-gray-600">正在评估您的创意...</p>
        </CardContent>
      </Card>
    )
  }

  const colors = getScoreLevelColor(score.level)
  const levelText = getScoreLevelText(score.level)

  return (
    <Card className={`w-full max-w-4xl mx-auto border-2 ${colors.border} ${colors.bg} ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className={`w-6 h-6 ${colors.text}`} />
            <CardTitle className="text-xl">创意评估结果</CardTitle>
          </div>
          <Badge className={colors.badge}>
            {levelText}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 总分显示 */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">
                {score.totalScore} <span className="text-lg text-gray-500">/ {score.maxScore}</span>
              </h3>
              <p className="text-sm text-gray-600 mt-1">{score.overallFeedback}</p>
            </div>
            <div className={`w-24 h-24 rounded-full flex items-center justify-center ${colors.bg} border-4 ${colors.border}`}>
              <span className={`text-3xl font-bold ${colors.text}`}>
                {Math.round((score.totalScore / score.maxScore) * 100)}%
              </span>
            </div>
          </div>

          {/* 进度条 */}
          <div className="relative">
            <Progress value={(score.totalScore / score.maxScore) * 100} className="h-3" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span className="text-red-500">60 (合格线)</span>
              <span className="text-blue-500">80 (良好)</span>
              <span className="text-green-500">100</span>
            </div>
          </div>
        </div>

        {/* 各维度评分 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(score.dimensions).map((dimension) => {
            const percentage = (dimension.score / dimension.maxScore) * 100
            const isPassing = percentage >= 60

            return (
              <Card key={dimension.name} className="border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">{dimension.name}</h4>
                    <Badge variant={isPassing ? 'default' : 'destructive'}>
                      {dimension.score}/{dimension.maxScore}
                    </Badge>
                  </div>

                  <Progress value={percentage} className="h-2 mb-2" />

                  <p className="text-sm text-gray-600 mb-2">{dimension.feedback}</p>

                  {dimension.suggestions.length > 0 && (
                    <div className="space-y-1">
                      {dimension.suggestions.map((suggestion, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-gray-500">
                          <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0 text-yellow-500" />
                          <span>{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* 引导式问题 */}
        {score.guidedQuestions.length > 0 && score.needsImprovement && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-blue-600" />
                建议补充以下信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {score.guidedQuestions.map((question, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-gray-700 mt-0.5">{question}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* 创意内容编辑区 */}
        {isEditing ? (
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Edit className="w-5 h-5 text-purple-600" />
                完善您的创意
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[200px] resize-none"
                placeholder="请详细描述您的创意..."
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  已输入 {editedContent.length} 个字符
                  {editedContent.length < 150 && ' (建议至少150字)'}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancelEdit}>
                    取消
                  </Button>
                  <Button onClick={handleSaveEdit} className="bg-purple-600 hover:bg-purple-700">
                    保存并重新评估
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">您的创意内容</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  完善创意
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{ideaContent}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          {score.needsImprovement ? (
            <>
              <Button
                variant="outline"
                onClick={onSkipEvaluation}
                className="flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                直接进入竞价（不推荐）
              </Button>
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                完善创意后继续
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                进一步完善
              </Button>
              <Button
                onClick={onProceedToBidding}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                进入AI竞价
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>

        {/* 提示信息 */}
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-600">
            💡 提示：创意越详细，AI专家团队的评估和方案就越精准。
            {score.needsImprovement && '建议完善创意描述后再进入竞价环节。'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default IdeaEvaluationPanel
