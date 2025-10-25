/**
 * MVP前端可视化工作坊 - 主页面
 *
 * 功能：
 * 1. AI自动生成HTML+CSS代码
 * 2. 实时代码预览（支持桌面/平板/手机切换）
 * 3. 5轮对话优化代码
 * 4. 导出完整HTML文件和产品计划书
 */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Layout } from '@/components/layout'
import type {
  MVPVisualizationSessionData,
  FrontendRequirements,
  GeneratedCode,
  MVPConversationMessage,
  DeviceMode
} from '@/types/mvp-visualization'

// 设备预设
const DEVICE_PRESETS: Record<DeviceMode, { width: number; height: number; label: string; icon: string }> = {
  desktop: { width: 1920, height: 1080, label: '桌面端', icon: '🖥️' },
  tablet: { width: 768, height: 1024, label: '平板', icon: '📱' },
  mobile: { width: 375, height: 812, label: '手机', icon: '📱' }
}

export default function MVPVisualizationWorkshopPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // URL参数
  const sessionId = searchParams.get('sessionId')
  const refinementDocumentId = searchParams.get('refinementDocumentId')

  // 状态管理
  const [session, setSession] = useState<MVPVisualizationSessionData | null>(null)
  const [frontendRequirements, setFrontendRequirements] = useState<FrontendRequirements | null>(null)
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null)
  const [conversationHistory, setConversationHistory] = useState<MVPConversationMessage[]>([])
  const [currentRound, setCurrentRound] = useState(0)
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop')
  const [adjustmentInput, setAdjustmentInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [stage, setStage] = useState<'init' | 'generating' | 'adjusting' | 'completed'>('init')

  // 初始化工作坊
  useEffect(() => {
    const initWorkshop = async () => {
      if (sessionId) {
        // 恢复现有会话
        await loadExistingSession(sessionId)
      } else if (refinementDocumentId) {
        // 从创意完善工作坊启动
        await startFromRefinement(refinementDocumentId)
      } else {
        setError('缺少必要参数')
        setIsInitializing(false)
      }
    }

    initWorkshop()
  }, [])

  // 更新iframe内容
  useEffect(() => {
    if (generatedCode && iframeRef.current) {
      updatePreview()
    }
  }, [generatedCode])

  // 启动工作坊（从创意完善）
  const startFromRefinement = async (docId: string) => {
    try {
      setIsInitializing(true)
      setStage('init')

      // 调用启动API
      const response = await fetch('/api/mvp-visualization/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'current-user-id', // TODO: 从session获取
          refinementDocumentId: docId,
          source: 'refinement-workshop'
        })
      })

      const data = await response.json()

      if (data.success) {
        if (data.needsManualInput) {
          // 需要手动输入frontendRequirements
          setError('需要手动补充前端设计需求')
          setIsInitializing(false)
          return
        }

        // 更新URL
        router.replace(`/workshops/mvp-visualization?sessionId=${data.sessionId}`)

        // 保存状态
        setFrontendRequirements(data.frontendRequirements)
        setConversationHistory(data.initialMessage ? [data.initialMessage] : [])

        // 自动生成初始代码
        await generateInitialCode(data.sessionId, data.frontendRequirements)
      } else {
        setError(data.error || '启动失败')
        setIsInitializing(false)
      }
    } catch (err) {
      console.error('启动工作坊失败:', err)
      setError('网络错误，请重试')
      setIsInitializing(false)
    }
  }

  // 生成初始代码
  const generateInitialCode = async (sid: string, requirements: FrontendRequirements) => {
    try {
      setStage('generating')

      const response = await fetch('/api/mvp-visualization/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sid,
          frontendRequirements: requirements
        })
      })

      const data = await response.json()

      if (data.success) {
        setGeneratedCode(data.code)
        setConversationHistory(prev => [...prev, data.aiMessage])
        setCurrentRound(data.currentRound)
        setStage('adjusting')
      } else {
        setError(data.error || '代码生成失败')
      }
    } catch (err) {
      console.error('代码生成失败:', err)
      setError('网络错误，请重试')
    } finally {
      setIsInitializing(false)
    }
  }

  // 加载现有会话
  const loadExistingSession = async (id: string) => {
    try {
      setIsInitializing(true)

      const response = await fetch(`/api/mvp-visualization/session/${id}`)
      const data = await response.json()

      if (data.success) {
        setSession(data.session)
        setFrontendRequirements(data.session.frontendRequirements)
        setGeneratedCode({
          html: data.session.generatedHTML,
          css: data.session.generatedCSS,
          generatedAt: new Date().toISOString()
        })
        setConversationHistory(data.session.conversationHistory)
        setCurrentRound(data.session.currentRound)
        setStage(data.session.status === 'COMPLETED' ? 'completed' : 'adjusting')
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

  // 更新iframe预览
  const updatePreview = () => {
    if (!iframeRef.current || !generatedCode) return

    const { html, css } = generatedCode
    const fullHTML = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${css}</style>
</head>
<body>
  ${html}
</body>
</html>
    `

    const iframeDoc = iframeRef.current.contentDocument
    if (iframeDoc) {
      iframeDoc.open()
      iframeDoc.write(fullHTML)
      iframeDoc.close()
    }
  }

  // 提交调整请求
  const handleAdjustment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!adjustmentInput.trim() || !sessionId) return

    try {
      setIsLoading(true)
      setError(null)

      // 添加用户消息
      const userMsg: MVPConversationMessage = {
        role: 'user',
        content: adjustmentInput,
        timestamp: new Date().toISOString(),
        round: currentRound,
        type: 'adjustment'
      }
      setConversationHistory(prev => [...prev, userMsg])
      setAdjustmentInput('')

      // 调用调整API
      const response = await fetch('/api/mvp-visualization/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          adjustmentRequest: adjustmentInput
        })
      })

      const data = await response.json()

      if (data.success) {
        setGeneratedCode(data.code)
        setConversationHistory(prev => [...prev, data.aiMessage])
        setCurrentRound(data.currentRound)

        if (!data.canAdjustMore) {
          setStage('completed')
        }
      } else {
        setError(data.error || '调整失败')
      }
    } catch (err) {
      console.error('调整失败:', err)
      setError('网络错误，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 导出代码
  const handleExport = async () => {
    if (!sessionId) return

    try {
      setIsLoading(true)

      const response = await fetch('/api/mvp-visualization/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      })

      const data = await response.json()

      if (data.success) {
        // 下载HTML文件
        downloadFile(data.files.htmlFile.content, data.files.htmlFile.filename)
        // 下载计划书
        downloadFile(data.files.planDocument.content, data.files.planDocument.filename)

        alert('文件已导出！')
      } else {
        setError(data.error || '导出失败')
      }
    } catch (err) {
      console.error('导出失败:', err)
      setError('网络错误，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 下载文件
  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isInitializing) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">
              {stage === 'generating' ? '正在生成代码...' : '正在初始化工作坊...'}
            </p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error && !conversationHistory.length) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">启动失败</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              返回
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  const device = DEVICE_PRESETS[deviceMode]
  const maxRounds = 5
  const canAdjust = currentRound <= maxRounds && stage !== 'completed'

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="container mx-auto px-4 py-6 max-w-[1920px]">
          {/* 顶部工具栏 */}
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">MVP前端可视化工作坊</h1>
              <p className="text-sm text-gray-600">
                实时预览 · 智能调整 · 一键导出
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* 设备切换 */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                {(Object.keys(DEVICE_PRESETS) as DeviceMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setDeviceMode(mode)}
                    className={`px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors ${
                      deviceMode === mode
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span>{DEVICE_PRESETS[mode].icon}</span>
                    <span>{DEVICE_PRESETS[mode].label}</span>
                  </button>
                ))}
              </div>

              {/* 轮次指示 */}
              <div className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg text-sm font-semibold">
                第 {currentRound}/{maxRounds} 轮
              </div>

              {/* 导出按钮 */}
              <button
                onClick={handleExport}
                disabled={!generatedCode || isLoading}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                📥 导出代码
              </button>
            </div>
          </div>

          {/* 主要内容区 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左侧：代码预览 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">实时预览</h2>
                <div className="text-sm text-gray-500">
                  {device.width} × {device.height} px
                </div>
              </div>

              {/* Preview Container */}
              <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '700px' }}>
                {generatedCode ? (
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <div
                      className="bg-white shadow-2xl transition-all duration-300"
                      style={{
                        width: deviceMode === 'desktop' ? '100%' : `${device.width}px`,
                        height: deviceMode === 'desktop' ? '100%' : `${device.height}px`,
                        maxWidth: '100%',
                        maxHeight: '100%'
                      }}
                    >
                      <iframe
                        ref={iframeRef}
                        className="w-full h-full border-0"
                        title="MVP Preview"
                        sandbox="allow-scripts"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🎨</div>
                      <p>代码预览区</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 右侧：对话和调整 */}
            <div className="bg-white rounded-lg shadow-sm border flex flex-col" style={{ height: '782px' }}>
              {/* 对话历史 */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {conversationHistory.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md rounded-lg p-4 ${
                        msg.role === 'user'
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 text-2xl">
                          {msg.role === 'user' ? '👤' : '🎨'}
                        </div>
                        <div className="flex-1">
                          <div className="whitespace-pre-wrap">{msg.content}</div>
                          <div className={`text-xs mt-2 ${msg.role === 'user' ? 'text-purple-100' : 'text-gray-500'}`}>
                            第{msg.round}轮 · {new Date(msg.timestamp).toLocaleTimeString('zh-CN')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-md rounded-lg p-4 bg-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">🎨</div>
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 输入区域 */}
              <div className="border-t p-4">
                {error && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                    {error}
                  </div>
                )}

                {canAdjust ? (
                  <form onSubmit={handleAdjustment} className="flex flex-col gap-3">
                    <textarea
                      value={adjustmentInput}
                      onChange={(e) => setAdjustmentInput(e.target.value)}
                      placeholder="描述您想要的调整... (例如：将按钮改为圆角、增大字体、调整颜色等)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      rows={3}
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !adjustmentInput.trim()}
                      className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? '调整中...' : `提交调整 (剩余 ${maxRounds - currentRound + 1} 轮)`}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-6">
                    <div className="text-4xl mb-3">🎉</div>
                    <p className="text-gray-900 font-semibold mb-2">调整已完成！</p>
                    <p className="text-sm text-gray-600 mb-4">
                      {currentRound > maxRounds
                        ? '已达到最大调整轮次'
                        : '您可以导出代码使用了'}
                    </p>
                    <button
                      onClick={handleExport}
                      disabled={isLoading}
                      className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:opacity-90"
                    >
                      📥 立即导出
                    </button>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-2 text-center">
                  {canAdjust
                    ? '提示：请具体描述您想要的调整，AI会根据您的需求修改代码'
                    : '感谢使用MVP可视化工作坊！'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
