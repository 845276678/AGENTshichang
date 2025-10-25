'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  Code,
  Sparkles,
  Copy,
  Download,
  Play,
  RefreshCw,
  FileText,
  Lightbulb,
  ArrowRight
} from 'lucide-react'

interface MVPBuilderConversationalProps {
  ideaId?: string
  userId: string
}

interface MVPPrompt {
  ideaContent: string
  mvpSuggestions: string
  technicalStack: string[]
  coreFeatures: string[]
  implementationSteps: string[]
}

export default function MVPBuilderConversational({
  ideaId,
  userId
}: MVPBuilderConversationalProps) {
  // 状态管理
  const [mvpPrompt, setMvpPrompt] = useState<MVPPrompt | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userInput, setUserInput] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
  }>>([])

  const codeEditorRef = useRef<HTMLTextAreaElement>(null)

  // 从 sessionStorage 加载竞价数据
  useEffect(() => {
    const loadBiddingData = async () => {
      try {
        setIsLoading(true)

        // 尝试从 sessionStorage 获取竞价数据
        const biddingData = sessionStorage.getItem('biddingData')
        const ideaContent = sessionStorage.getItem('biddingIdeaContent')

        if (biddingData && ideaContent) {
          const data = JSON.parse(biddingData)

          // 构建 MVP 提示词
          const prompt: MVPPrompt = {
            ideaContent: ideaContent,
            mvpSuggestions: extractMVPSuggestions(data),
            technicalStack: extractTechnicalStack(data),
            coreFeatures: extractCoreFeatures(data),
            implementationSteps: extractImplementationSteps(data)
          }

          setMvpPrompt(prompt)

          // 添加欢迎消息
          setConversationHistory([{
            role: 'assistant',
            content: `你好！我是您的MVP构建助手。基于您的创意"${ideaContent.substring(0, 50)}..."和AI专家团队的评估，我已经准备好帮助您快速实现MVP原型。\n\n请告诉我您想要实现哪个核心功能，或者让我为您生成完整的项目框架？`,
            timestamp: new Date()
          }])
        } else {
          // 没有竞价数据，使用默认提示
          setConversationHistory([{
            role: 'assistant',
            content: '欢迎使用MVP构建工作坊！请先完成创意竞价，然后再进入此工作坊获得最佳体验。\n\n您也可以直接描述您的创意，我会帮您构建MVP原型。',
            timestamp: new Date()
          }])
        }
      } catch (error) {
        console.error('加载竞价数据失败:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadBiddingData()
  }, [ideaId])

  // 从竞价数据中提取 MVP 建议
  const extractMVPSuggestions = (data: any): string => {
    if (data.expertDiscussions && data.expertDiscussions.length > 0) {
      // 找到关于 MVP 的讨论
      const mvpDiscussions = data.expertDiscussions.filter((d: any) =>
        d.content.toLowerCase().includes('mvp') ||
        d.content.toLowerCase().includes('最小可行产品')
      )

      if (mvpDiscussions.length > 0) {
        return mvpDiscussions.map((d: any) => d.content).join('\n\n')
      }
    }

    return '基于AI专家评估，建议从核心功能开始构建，快速验证市场需求。'
  }

  const extractTechnicalStack = (data: any): string[] => {
    // 默认技术栈
    return ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Prisma']
  }

  const extractCoreFeatures = (data: any): string[] => {
    // 从讨论中提取核心功能
    return [
      '用户注册和登录',
      '核心业务功能',
      '数据展示界面',
      '基础交互功能'
    ]
  }

  const extractImplementationSteps = (data: any): string[] => {
    return [
      '第1步：项目初始化 - 设置 Next.js 项目和基础配置',
      '第2步：UI框架 - 使用 Tailwind CSS 构建基础布局',
      '第3步：核心功能 - 实现主要业务逻辑',
      '第4步：数据层 - 配置数据库和API',
      '第5步：测试部署 - 本地测试和云端部署'
    ]
  }

  // 生成代码
  const handleGenerateCode = async () => {
    if (!userInput.trim()) return

    setIsGenerating(true)

    try {
      // 添加用户消息到对话历史
      const userMessage = {
        role: 'user' as const,
        content: userInput,
        timestamp: new Date()
      }
      setConversationHistory(prev => [...prev, userMessage])

      // 调用 AI 生成代码
      const response = await fetch('/api/mvp/generate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ideaContent: mvpPrompt?.ideaContent || '',
          userRequest: userInput,
          technicalStack: mvpPrompt?.technicalStack || [],
          conversationHistory
        })
      })

      if (!response.ok) {
        throw new Error('代码生成失败')
      }

      const result = await response.json()

      // 更新生成的代码
      setGeneratedCode(result.code || '')

      // 添加 AI 回复到对话历史
      const assistantMessage = {
        role: 'assistant' as const,
        content: result.explanation || '代码已生成，请查看右侧编辑器。',
        timestamp: new Date()
      }
      setConversationHistory(prev => [...prev, assistantMessage])

      // 清空输入
      setUserInput('')
    } catch (error) {
      console.error('代码生成错误:', error)

      // 如果API失败，显示示例代码
      const exampleCode = generateExampleCode(userInput)
      setGeneratedCode(exampleCode)

      setConversationHistory(prev => [...prev, {
        role: 'assistant',
        content: '已为您生成示例代码，您可以根据需要进行调整。',
        timestamp: new Date()
      }])
    } finally {
      setIsGenerating(false)
    }
  }

  // 生成示例代码（当API不可用时）
  const generateExampleCode = (request: string): string => {
    return `// ${request}
// 基于 Next.js + TypeScript 的 MVP 实现

'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function MVPComponent() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  const handleAction = async () => {
    setLoading(true)
    try {
      // TODO: 实现您的核心业务逻辑
      const response = await fetch('/api/your-endpoint')
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('操作失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>MVP 核心功能</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleAction}
            disabled={loading}
          >
            {loading ? '处理中...' : '执行操作'}
          </Button>

          {/* 数据展示区域 */}
          <div className="mt-4">
            {data.length > 0 && (
              <div>数据加载成功</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
`
  }

  // 复制代码
  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode)
  }

  // 下载代码
  const handleDownloadCode = () => {
    const blob = new Blob([generatedCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mvp-component.tsx'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">加载MVP构建环境...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 顶部标题栏 */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <Code className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">MVP 构建工作坊</h1>
              <p className="text-sm text-gray-500">聊天式前端代码生成器</p>
            </div>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            AI 辅助
          </Badge>
        </div>
      </div>

      {/* 主要内容区域 - 左右分栏 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧：MVP提示词和对话 */}
        <div className="w-1/2 border-r border-gray-200 flex flex-col bg-white">
          {/* MVP 提示词展示 */}
          {mvpPrompt && (
            <div className="p-4 border-b border-gray-200 bg-blue-50">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">AI专家团队的MVP建议</h3>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-gray-700 mb-1">创意内容：</p>
                  <p className="text-gray-600">{mvpPrompt.ideaContent.substring(0, 200)}...</p>
                </div>

                <div>
                  <p className="font-medium text-gray-700 mb-1">推荐技术栈：</p>
                  <div className="flex flex-wrap gap-1">
                    {mvpPrompt.technicalStack.map((tech, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="font-medium text-gray-700 mb-1">核心功能：</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {mvpPrompt.coreFeatures.slice(0, 3).map((feature, i) => (
                      <li key={i}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 对话历史 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {conversationHistory.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                </div>
              </div>
            )}
          </div>

          {/* 输入区域 */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <Textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="描述您想要实现的功能，例如：创建一个用户登录页面..."
                className="flex-1 min-h-[80px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleGenerateCode()
                  }
                }}
              />
              <Button
                onClick={handleGenerateCode}
                disabled={isGenerating || !userInput.trim()}
                className="self-end"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              按 Enter 发送，Shift + Enter 换行
            </p>
          </div>
        </div>

        {/* 右侧：代码编辑器 */}
        <div className="w-1/2 flex flex-col bg-gray-900">
          {/* 编辑器工具栏 */}
          <div className="bg-gray-800 border-b border-gray-700 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">mvp-component.tsx</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopyCode}
                disabled={!generatedCode}
                className="text-gray-300 hover:text-white"
              >
                <Copy className="w-4 h-4 mr-1" />
                复制
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDownloadCode}
                disabled={!generatedCode}
                className="text-gray-300 hover:text-white"
              >
                <Download className="w-4 h-4 mr-1" />
                下载
              </Button>
            </div>
          </div>

          {/* 代码编辑器 */}
          <div className="flex-1 overflow-auto">
            <Textarea
              ref={codeEditorRef}
              value={generatedCode}
              onChange={(e) => setGeneratedCode(e.target.value)}
              placeholder="生成的代码将显示在这里..."
              className="w-full h-full bg-gray-900 text-gray-100 font-mono text-sm p-4 border-none resize-none rounded-none focus:ring-0"
              style={{
                fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace'
              }}
            />
          </div>

          {/* 底部提示 */}
          {!generatedCode && (
            <div className="p-8 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">在左侧描述您的需求</p>
              <p className="text-xs mt-1">AI将为您生成对应的前端代码</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
