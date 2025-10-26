/**
 * 创意完善工作坊 - 主页面
 *
 * 功能：
 * 1. 6个维度渐进式对话引导
 * 2. 实时进度跟踪
 * 3. 对话历史展示
 * 4. AI智能引导
 */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Layout } from '@/components/layout'
import { useAuth } from '@/hooks/useAuth'
import type {
  IdeaRefinementDocumentData,
  ConversationMessage,
  StartRefinementResponse,
  SubmitUserReplyResponse
} from '@/types/idea-refinement'

// 维度配置（与后端保持一致）
const DIMENSIONS = [
  { id: 'targetUser', name: '目标用户画像', icon: '👥', color: 'from-blue-500 to-blue-600' },
  { id: 'businessModel', name: '商业模式', icon: '💰', color: 'from-green-500 to-green-600' },
  { id: 'marketAnalysis', name: '市场分析', icon: '📊', color: 'from-purple-500 to-purple-600' },
  { id: 'competitiveAdvantage', name: '竞争优势', icon: '🚀', color: 'from-orange-500 to-orange-600' },
  { id: 'productDetails', name: '产品详情', icon: '⚙️', color: 'from-pink-500 to-pink-600' },
  { id: 'implementation', name: '实施路径', icon: '🎯', color: 'from-indigo-500 to-indigo-600' }
]

export default function IdeaRefinementWorkshopPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user, isAuthenticated, isInitialized } = useAuth()

  // URL参数
  const documentId = searchParams.get('documentId')
  const ideaTitle = searchParams.get('title')
  const ideaContent = searchParams.get('content')

  // 状态管理
  const [document, setDocument] = useState<IdeaRefinementDocumentData | null>(null)
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([])
  const [currentDimensionIndex, setCurrentDimensionIndex] = useState(0)
  const [currentRound, setCurrentRound] = useState(1)
  const [progress, setProgress] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isCompleted, setIsCompleted] = useState(false) // 新增：完成状态

  // 初始化工作坊
  useEffect(() => {
    const initWorkshop = async () => {
      if (documentId) {
        // 恢复现有会话
        await loadExistingSession(documentId)
      } else if (ideaTitle && ideaContent) {
        // 启动新工作坊
        await startNewWorkshop(ideaTitle, ideaContent)
      } else {
        setError('缺少必要参数')
        setIsInitializing(false)
      }
    }

    initWorkshop()
  }, [])

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversationHistory])

  // 启动新工作坊
  const startNewWorkshop = async (title: string, content: string) => {
    try {
      setIsInitializing(true)

      // 获取用户ID - 如果未登录则使用匿名ID
      const userId = user?.id || `anonymous_${Date.now()}`

      console.log('🎓 启动创意完善工坊:', {
        userId,
        isAuthenticated,
        title
      })

      // 调用启动API
      const response = await fetch('/api/idea-refinement/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ideaTitle: title,
          ideaContent: content
        })
      })

      const data: StartRefinementResponse = await response.json()

      if (data.success) {
        // 更新URL添加documentId
        router.replace(`/workshops/idea-refinement?documentId=${data.documentId}`)

        // 初始化状态
        setConversationHistory([data.initialMessage])
        setCurrentDimensionIndex(0)
        setCurrentRound(1)
        setProgress(0)
      } else {
        setError(data.error || '启动失败')
      }
    } catch (err) {
      console.error('启动工作坊失败:', err)
      setError('网络错误，请重试')
    } finally {
      setIsInitializing(false)
    }
  }

  // 加载现有会话
  const loadExistingSession = async (id: string) => {
    try {
      setIsInitializing(true)

      const response = await fetch(`/api/idea-refinement/session/${id}`)
      const data = await response.json()

      if (data.success) {
        setDocument(data.document)
        setConversationHistory(data.document.conversationHistory)
        setCurrentDimensionIndex(data.document.currentDimension)
        setCurrentRound(data.document.currentRound)
        setProgress(data.document.progress)
      } else {
        setError(data.error || '加载会话失败')
      }
    } catch (err) {
      console.error('加载会话失败:', err)
      setError('网络错误，请重试')
    } finally {
      setIsInitializing(false)
    }
  }

  // 提交用户回复
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userInput.trim() || !documentId) return

    try {
      setIsLoading(true)
      setError(null)

      // 添加用户消息到界面
      const userMsg: ConversationMessage = {
        role: 'user',
        content: userInput,
        timestamp: new Date().toISOString(),
        dimensionId: DIMENSIONS[currentDimensionIndex].id,
        round: currentRound
      }
      setConversationHistory(prev => [...prev, userMsg])
      setUserInput('')

      // 调用对话API
      const response = await fetch('/api/idea-refinement/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          userMessage: userInput
        })
      })

      const data: SubmitUserReplyResponse = await response.json()

      if (data.success) {
        // 添加AI回复
        setConversationHistory(prev => [...prev, data.aiMessage])

        // 更新进度
        setCurrentDimensionIndex(data.progress.currentDimension)
        setCurrentRound(data.progress.currentRound)
        setProgress(data.progress.overallProgress)

        // 如果完成（所有6个维度都完成）
        if (!data.needsMoreInput || data.progress.overallProgress >= 100) {
          setIsCompleted(true)
          console.log('🎉 创意完善工作坊已完成！')
        }
      } else {
        setError(data.error || '提交失败')
      }
    } catch (err) {
      console.error('提交失败:', err)
      setError('网络错误，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 保存进度
  const handleSave = async () => {
    if (!documentId) return

    try {
      await fetch('/api/idea-refinement/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          temporaryInput: userInput
        })
      })

      alert('进度已保存')
    } catch (err) {
      console.error('保存失败:', err)
      alert('保存失败，请重试')
    }
  }

  if (isInitializing) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">正在初始化工作坊...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error && !conversationHistory.length) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">启动失败</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              返回
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  const currentDimension = DIMENSIONS[currentDimensionIndex]
  const completedDimensions = currentDimensionIndex
  const totalDimensions = DIMENSIONS.length

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* 完成界面 */}
          {isCompleted && (
            <div className="bg-white rounded-lg shadow-lg border-2 border-green-500 p-8 mb-6">
              <div className="text-center space-y-6">
                {/* 庆祝图标 */}
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-bounce">
                    <span className="text-4xl">🎉</span>
                  </div>
                </div>

                {/* 完成标题 */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    恭喜！创意完善工作坊已完成
                  </h2>
                  <p className="text-lg text-gray-600">
                    您已成功完成6个维度的深度完善，现在可以进入下一步了！
                  </p>
                </div>

                {/* 完成统计 */}
                <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-blue-600">{DIMENSIONS.length}</div>
                    <div className="text-sm text-gray-600">完成维度</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-purple-600">{conversationHistory.length}</div>
                    <div className="text-sm text-gray-600">对话轮次</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-green-600">100%</div>
                    <div className="text-sm text-gray-600">完成进度</div>
                  </div>
                </div>

                {/* 行动按钮 */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <button
                    onClick={() => {
                      // 跳转到MVP工作坊，传递documentId和创意信息
                      router.push(`/workshops/mvp-builder?documentId=${documentId}&ideaTitle=${encodeURIComponent(ideaTitle || '')}&ideaDescription=${encodeURIComponent(ideaContent || '')}`)
                    }}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <span className="text-xl">🚀</span>
                    进入MVP构建工作坊
                  </button>

                  <button
                    onClick={() => {
                      // 查看完善后的创意文档
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                      setIsCompleted(false)
                    }}
                    className="px-8 py-4 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <span className="text-xl">📄</span>
                    查看完整对话记录
                  </button>
                </div>

                {/* 提示信息 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto text-left">
                  <h3 className="font-semibold text-blue-900 mb-2">💡 接下来您可以：</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 进入MVP构建工作坊，将创意转化为可实现的产品原型</li>
                    <li>• 生成技术实现方案和前端代码</li>
                    <li>• 导出完整的创意完善文档</li>
                    <li>• 继续优化和调整您的创意细节</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 顶部进度栏 */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">创意完善工作坊</h1>
                <p className="text-sm text-gray-600">
                  通过6个维度深度完善您的创意，为成功奠定基础
                </p>
              </div>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                💾 保存进度
              </button>
            </div>

            {/* 维度进度条 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">整体进度</span>
                <span className="font-semibold text-gray-900">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              {/* 维度图标 */}
              <div className="flex items-center justify-between mt-4">
                {DIMENSIONS.map((dim, index) => (
                  <div key={dim.id} className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
                        index < currentDimensionIndex
                          ? 'bg-green-500 text-white'
                          : index === currentDimensionIndex
                          ? `bg-gradient-to-r ${dim.color} text-white`
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {index < currentDimensionIndex ? '✓' : dim.icon}
                    </div>
                    <span className={`text-xs mt-1 ${index === currentDimensionIndex ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                      {dim.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 主要内容区 */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 左侧：当前维度信息 */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
                <div className={`w-16 h-16 bg-gradient-to-r ${currentDimension.color} rounded-2xl flex items-center justify-center text-3xl mb-4`}>
                  {currentDimension.icon}
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {currentDimension.name}
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  第 {currentRound} 轮对话
                </p>

                {/* 已完成维度列表 */}
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">已完成维度</h3>
                  <div className="space-y-2">
                    {DIMENSIONS.slice(0, completedDimensions).map((dim) => (
                      <div key={dim.id} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-green-500">✓</span>
                        <span>{dim.name}</span>
                      </div>
                    ))}
                    {completedDimensions === 0 && (
                      <p className="text-sm text-gray-400">暂无</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧：对话区域 */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm border flex flex-col" style={{ height: 'calc(100vh - 300px)' }}>
                {/* 对话历史 */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {conversationHistory.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-3xl rounded-lg p-4 ${
                          msg.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 text-2xl">
                            {msg.role === 'user' ? '👤' : '🤖'}
                          </div>
                          <div className="flex-1">
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                            <div className={`text-xs mt-2 ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                              {new Date(msg.timestamp).toLocaleTimeString('zh-CN')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-3xl rounded-lg p-4 bg-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">🤖</div>
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* 输入区域 */}
                <div className="border-t p-4">
                  {error && (
                    <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                      {error}
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className="flex gap-3">
                    <textarea
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSubmit(e)
                        }
                      }}
                      placeholder="输入您的回答... (Shift+Enter换行，Enter发送)"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={3}
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !userInput.trim()}
                      className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isLoading ? '发送中...' : '发送 →'}
                    </button>
                  </form>
                  <p className="text-xs text-gray-500 mt-2">
                    提示：请详细描述您的想法，AI会根据您的回答提出更深入的问题
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
