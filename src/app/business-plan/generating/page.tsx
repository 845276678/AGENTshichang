'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Loader2, CheckCircle, XCircle, FileText, Sparkles } from 'lucide-react'
import { tokenStorage } from '@/lib/token-storage'

function GeneratingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // 读取来源参数
  const source = searchParams.get('source') || 'direct-generation'

  const [status, setStatus] = useState<'preparing' | 'generating' | 'success' | 'error'>('preparing')
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [error, setError] = useState('')
  const [sessionId, setSessionId] = useState('')

  useEffect(() => {
    const generateBusinessPlan = async () => {
      try {
        const ideaId = searchParams.get('ideaId')
        // source 参数已在组件级别定义

        // 优先从 sessionStorage 读取数据
        const biddingDataStr = sessionStorage.getItem('biddingData')
        const storedIdeaId = sessionStorage.getItem('biddingIdeaId')
        const storedIdeaContent = sessionStorage.getItem('biddingIdeaContent')

        // 如果 sessionStorage 中没有数据,尝试从 URL 参数获取(向后兼容)
        const ideaContent = storedIdeaContent || searchParams.get('ideaContent')
        const biddingData = biddingDataStr
          ? JSON.parse(biddingDataStr)
          : (searchParams.get('biddingData') ? JSON.parse(searchParams.get('biddingData')!) : null)

        if (!biddingData) {
          throw new Error('缺少竞价数据,请重新进行AI竞价')
        }

        const finalIdeaId = ideaId || storedIdeaId || biddingData.ideaId

        // 步骤1: 准备数据
        setCurrentStep('正在准备竞价数据...')
        setProgress(10)
        await new Promise(resolve => setTimeout(resolve, 500))

        // 步骤2: 调用API
        setStatus('generating')
        setCurrentStep('正在调用AI生成商业计划...')
        setProgress(30)

        const token = tokenStorage.getAccessToken()
        if (!token) {
          throw new Error('未找到认证令牌，请先登录')
        }

        const response = await fetch('/api/business-plan-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ideaId: finalIdeaId,
            ideaContent: ideaContent || biddingData.ideaContent,
            ...biddingData
          })
        })

        setProgress(60)
        setCurrentStep('正在处理AI响应...')

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData?.error || `API调用失败: ${response.status}`)
        }

        const result = await response.json()
        setProgress(90)
        setCurrentStep('商业计划已生成，正在跳转...')

        if (!result.sessionId) {
          throw new Error('服务器未返回会话ID')
        }

        setSessionId(result.sessionId)
        setStatus('success')
        setProgress(100)
        setCurrentStep('生成成功！')

        // 清理 sessionStorage 数据
        sessionStorage.removeItem('biddingData')
        sessionStorage.removeItem('biddingIdeaId')
        sessionStorage.removeItem('biddingIdeaContent')

        // 等待2秒后跳转
        setTimeout(() => {
          router.push(`/business-plan?sessionId=${result.sessionId}&source=${source}`)
        }, 2000)

      } catch (err) {
        console.error('生成失败:', err)
        setStatus('error')
        setError(err instanceof Error ? err.message : '生成失败，请重试')
        setProgress(0)
      }
    }

    generateBusinessPlan()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            {status === 'preparing' || status === 'generating' ? (
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            ) : status === 'success' ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
              <XCircle className="w-8 h-8 text-red-600" />
            )}
            <CardTitle className="text-2xl">
              {status === 'success' ? '生成成功！' : status === 'error' ? '生成失败' : 'AI创意实现建议中'}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 进度条 */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{currentStep}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* 状态说明 */}
          {status === 'preparing' || status === 'generating' ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-900 font-medium mb-1">
                    AI正在分析您的创意
                  </p>
                  <p className="text-sm text-blue-700">
                    基于专家评估和竞价结果，我们正在为您生成个性化的创意实现建议。这通常需要30-60秒，请稍候...
                  </p>
                </div>
              </div>
            </div>
          ) : status === 'success' ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm text-green-900 font-medium mb-1">
                    创意实现建议已生成
                  </p>
                  <p className="text-sm text-green-700">
                    正在为您跳转到商业计划页面，您可以在那里查看完整的分析报告...
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm text-red-900 font-medium mb-1">
                    生成失败
                  </p>
                  <p className="text-sm text-red-700">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 生成步骤说明 */}
          {(status === 'preparing' || status === 'generating') && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className={`p-4 rounded-lg ${progress >= 10 ? 'bg-blue-100 border-2 border-blue-300' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${progress >= 10 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    1
                  </div>
                  <span className="text-sm font-medium">准备数据</span>
                </div>
                <p className="text-xs text-gray-600">整理竞价结果和专家评论</p>
              </div>

              <div className={`p-4 rounded-lg ${progress >= 30 ? 'bg-blue-100 border-2 border-blue-300' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${progress >= 30 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    2
                  </div>
                  <span className="text-sm font-medium">AI分析</span>
                </div>
                <p className="text-xs text-gray-600">生成个性化商业计划</p>
              </div>

              <div className={`p-4 rounded-lg ${progress >= 90 ? 'bg-blue-100 border-2 border-blue-300' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${progress >= 90 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    3
                  </div>
                  <span className="text-sm font-medium">完成</span>
                </div>
                <p className="text-xs text-gray-600">准备跳转到报告页面</p>
              </div>
            </div>
          )}

          {/* 错误时的操作按钮 */}
          {status === 'error' && (
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => router.back()}>
                返回
              </Button>
              <Button onClick={() => window.location.reload()}>
                重试
              </Button>
            </div>
          )}

          {/* 成功时显示sessionId */}
          {status === 'success' && sessionId && (
            <div className="flex justify-center">
              <Button
                onClick={() => router.push(`/business-plan?sessionId=${sessionId}&source=${source}`)}
                className="gap-2"
              >
                <FileText className="w-4 h-4" />
                立即查看商业计划
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function BusinessPlanGeneratingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    }>
      <GeneratingContent />
    </Suspense>
  )
}
