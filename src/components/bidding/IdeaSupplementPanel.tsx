'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, Lightbulb, Send } from 'lucide-react'

interface IdeaSupplementPanelProps {
  evaluationScore: number
  verdict: string
  feedback: string
  requiredInfo: string[]
  onSubmitSupplement: (supplementInfo: string) => Promise<void>
  isSubmitting?: boolean
}

export default function IdeaSupplementPanel({
  evaluationScore,
  verdict,
  feedback,
  requiredInfo,
  onSubmitSupplement,
  isSubmitting = false
}: IdeaSupplementPanelProps) {
  const [supplementText, setSupplementText] = useState('')

  const handleSubmit = async () => {
    if (!supplementText.trim()) return
    await onSubmitSupplement(supplementText)
  }

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'excellent':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'acceptable':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'needs_work':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'reject':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getVerdictText = (verdict: string) => {
    switch (verdict) {
      case 'excellent':
        return '优秀'
      case 'acceptable':
        return '可接受'
      case 'needs_work':
        return '需完善'
      case 'reject':
        return '需大幅改进'
      default:
        return '评估中'
    }
  }

  return (
    <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            <AlertCircle className="h-6 w-6 text-amber-600" />
            创意评估结果
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getVerdictColor(verdict)}>
              {getVerdictText(verdict)}
            </Badge>
            <Badge variant="outline" className="text-lg font-bold">
              {evaluationScore}/100
            </Badge>
          </div>
        </div>
        <CardDescription className="text-base">
          AI专家团队已评估您的创意，建议补充以下信息以提高质量
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 评估反馈 */}
        <div className="bg-white rounded-lg p-4 border border-amber-200">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-600" />
            专家反馈
          </h4>
          <div className="text-sm text-gray-700 whitespace-pre-wrap">
            {feedback}
          </div>
        </div>

        {/* 必需补充的信息 */}
        {requiredInfo && requiredInfo.length > 0 && (
          <div className="bg-white rounded-lg p-4 border border-amber-200">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-amber-600" />
              请补充以下信息
            </h4>
            <ul className="space-y-2">
              {requiredInfo.map((info, index) => (
                <li key={index} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-amber-600 font-bold">{index + 1}.</span>
                  <span>{info}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 补充信息输入框 */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700 block">
            补充您的创意信息
          </label>
          <Textarea
            placeholder="请根据上述反馈补充您的创意信息...\n\n例如：\n- 目标用户：大学生、上班族等\n- 核心功能：提供XX服务，解决XX问题\n- 商业模式：通过XX方式盈利"
            value={supplementText}
            onChange={(e) => setSupplementText(e.target.value)}
            className="min-h-[200px] resize-none text-sm"
            disabled={isSubmitting}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {supplementText.length} 字 (建议至少 50 字)
            </span>
            <Button
              onClick={handleSubmit}
              disabled={!supplementText.trim() || supplementText.length < 10 || isSubmitting}
              size="lg"
              className="bg-amber-600 hover:bg-amber-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  提交中...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  提交补充信息
                </>
              )}
            </Button>
          </div>
        </div>

        {/* 提示信息 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            💡 <strong>提示：</strong>
            补充信息后，AI专家将重新评估您的创意。评分达到60分以上即可进入深度讨论和竞价阶段。
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
