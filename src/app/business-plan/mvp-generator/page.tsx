'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Layout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Send,
  Download,
  Eye,
  RefreshCw,
  Loader2,
  Code,
  Sparkles,
  MessageSquare,
  Monitor,
  ArrowLeft,
  Lightbulb,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ChatMessage {
  id: string
  type: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    action?: string
    progress?: number
  }
}

interface MVPVersion {
  id: string
  version: number
  htmlCode: string
  description: string
  timestamp: Date
  changes: string[]
}

export default function MVPGeneratorPage() {
  const searchParams = useSearchParams()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // URL参数
  const initialIdeaTitle = searchParams.get('ideaTitle') || ''
  const initialIdeaDescription = searchParams.get('ideaDescription') || ''

  // 状态管理
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [mvpVersions, setMvpVersions] = useState<MVPVersion[]>([])
  const [currentVersion, setCurrentVersion] = useState<MVPVersion | null>(null)
  const [ideaContext, setIdeaContext] = useState({
    title: initialIdeaTitle,
    description: initialIdeaDescription,
    coreFeatures: [] as string[],
    targetUsers: [] as string[]
  })

  // 初始化
  useEffect(() => {
    if (initialIdeaTitle && initialIdeaDescription) {
      addMessage('system', `欢迎使用MVP实时生成器！🎉

已导入您的创意：
📝 标题：${initialIdeaTitle}
📋 描述：${initialIdeaDescription}

我会帮您逐步构建MVP原型。请告诉我：
1. 您希望重点展示哪3个核心功能？
2. 有什么特殊的交互需求吗？

您也可以直接说"开始生成基础版本"，我会根据现有信息创建初始原型。`)
    } else {
      addMessage('system', `欢迎使用MVP实时生成器！👋

我会帮您创建可交互的HTML原型。请先告诉我：
1. 您的产品创意是什么？
2. 核心功能有哪些？
3. 目标用户是谁？

然后我们可以开始构建MVP！`)
    }
  }, [initialIdeaTitle, initialIdeaDescription])

  // 自动滚动到底部
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const addMessage = (type: ChatMessage['type'], content: string, metadata?: ChatMessage['metadata']) => {
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random()}`,
      type,
      content,
      timestamp: new Date(),
      metadata
    }
    setMessages(prev => [...prev, newMessage])
  }

  const handleSendMessage = async () => {
    if (!currentInput.trim() || isGenerating) return

    const userMessage = currentInput.trim()
    setCurrentInput('')

    // 添加用户消息
    addMessage('user', userMessage)

    // 开始AI处理
    setIsGenerating(true)

    try {
      await processUserMessage(userMessage)
    } catch (error) {
      console.error('处理消息失败:', error)
      addMessage('assistant', '抱歉，处理过程中出现了错误。请重试或调整您的要求。')
    } finally {
      setIsGenerating(false)
    }
  }

  const processUserMessage = async (message: string) => {
    // 分析用户意图
    const intent = analyzeUserIntent(message)

    switch (intent.type) {
      case 'init_idea':
        await handleIdeaInitialization(intent.data)
        break
      case 'generate_mvp':
        await handleMVPGeneration(intent.data)
        break
      case 'modify_feature':
        await handleFeatureModification(intent.data)
        break
      case 'adjust_design':
        await handleDesignAdjustment(intent.data)
        break
      default:
        await handleGeneralRequest(message)
    }
  }

  const analyzeUserIntent = (message: string) => {
    const lowerMessage = message.toLowerCase()

    // 检测创意初始化
    if (lowerMessage.includes('创意') || lowerMessage.includes('产品') || lowerMessage.includes('想法')) {
      return { type: 'init_idea', data: { message } }
    }

    // 检测生成请求
    if (lowerMessage.includes('生成') || lowerMessage.includes('开始') || lowerMessage.includes('制作')) {
      return { type: 'generate_mvp', data: { message } }
    }

    // 检测功能修改
    if (lowerMessage.includes('修改') || lowerMessage.includes('调整') || lowerMessage.includes('改变')) {
      return { type: 'modify_feature', data: { message } }
    }

    // 检测设计调整
    if (lowerMessage.includes('设计') || lowerMessage.includes('样式') || lowerMessage.includes('颜色')) {
      return { type: 'adjust_design', data: { message } }
    }

    return { type: 'general', data: { message } }
  }

  const handleIdeaInitialization = async (data: any) => {
    addMessage('assistant', '正在分析您的创意...', { action: 'analyzing', progress: 20 })

    // 模拟分析过程
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 提取关键信息
    const features = extractFeatures(data.message)
    const users = extractTargetUsers(data.message)

    setIdeaContext(prev => ({
      ...prev,
      coreFeatures: features,
      targetUsers: users
    }))

    addMessage('assistant', `很好！我已经理解了您的创意：

🎯 识别的核心功能：
${features.map((f, i) => `${i + 1}. ${f}`).join('\n')}

👥 目标用户：
${users.join('、')}

现在我们可以开始构建MVP。您希望：
A) 立即生成基础版本
B) 先详细讨论功能设计
C) 自定义特定功能

请选择或告诉我您的想法！`)
  }

  const handleMVPGeneration = async (data: any) => {
    addMessage('assistant', '开始生成MVP原型...', { action: 'generating', progress: 10 })

    try {
      // 构建请求数据
      const requestData = {
        ideaTitle: ideaContext.title,
        ideaDescription: ideaContext.description,
        targetUsers: ideaContext.targetUsers,
        coreFeatures: ideaContext.coreFeatures,
        industryType: '通用',
        userRequirement: data.message
      }

      addMessage('assistant', '正在调用AI生成引擎...', { action: 'generating', progress: 30 })

      // 调用MVP生成API
      const response = await fetch('/api/business-plan/modules/mvp-prototype', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      addMessage('assistant', '正在处理生成结果...', { action: 'generating', progress: 70 })

      if (!response.ok) {
        throw new Error(`API调用失败: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'MVP生成失败')
      }

      addMessage('assistant', '正在优化代码结构...', { action: 'generating', progress: 90 })

      // 创建新版本
      const newVersion: MVPVersion = {
        id: `mvp_${Date.now()}`,
        version: mvpVersions.length + 1,
        htmlCode: result.data.prototype.htmlCode,
        description: `基于"${ideaContext.title}"的MVP原型 v${mvpVersions.length + 1}`,
        timestamp: new Date(),
        changes: ['初始版本生成', '添加核心功能界面', '实现基础交互']
      }

      setMvpVersions(prev => [...prev, newVersion])
      setCurrentVersion(newVersion)

      addMessage('assistant', `🎉 MVP原型生成完成！

✨ 版本信息：
- 版本号：v${newVersion.version}
- 生成时间：${newVersion.timestamp.toLocaleTimeString()}
- 包含功能：${ideaContext.coreFeatures.join('、')}

您可以：
1. 在右侧预览效果
2. 下载HTML文件
3. 继续调整和完善

有什么需要修改的地方吗？`, { action: 'completed', progress: 100 })

    } catch (error) {
      console.error('MVP生成失败:', error)
      addMessage('assistant', `生成过程中遇到了问题：${error instanceof Error ? error.message : '未知错误'}

请尝试：
1. 简化功能需求
2. 提供更具体的描述
3. 重新生成

需要我重新尝试吗？`)
    }
  }

  const handleFeatureModification = async (data: any) => {
    if (!currentVersion) {
      addMessage('assistant', '请先生成一个MVP版本，然后我可以帮您修改功能。')
      return
    }

    addMessage('assistant', '正在分析您的修改需求...', { action: 'modifying', progress: 20 })

    try {
      // 构建修改请求数据
      const requestData = {
        ideaTitle: ideaContext.title,
        ideaDescription: ideaContext.description,
        targetUsers: ideaContext.targetUsers,
        coreFeatures: ideaContext.coreFeatures,
        industryType: '通用',
        userRequirement: data.message,
        modificationContext: {
          currentVersion: currentVersion.version,
          previousHtmlCode: currentVersion.htmlCode,
          modificationRequest: data.message,
          focusOnChanges: true
        }
      }

      addMessage('assistant', '正在根据您的要求重新生成...', { action: 'modifying', progress: 50 })

      // 调用MVP生成API，传入修改上下文
      const response = await fetch('/api/business-plan/modules/mvp-prototype', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        throw new Error(`API调用失败: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'MVP修改失败')
      }

      addMessage('assistant', '正在应用修改...', { action: 'modifying', progress: 80 })

      // 创建修改版本
      const newVersion: MVPVersion = {
        id: `mvp_${Date.now()}`,
        version: mvpVersions.length + 1,
        htmlCode: result.data.prototype.htmlCode,
        description: `${ideaContext.title} - v${mvpVersions.length + 1} (${data.message.slice(0, 30)}...)`,
        timestamp: new Date(),
        changes: [...currentVersion.changes, `用户要求: ${data.message}`]
      }

      setMvpVersions(prev => [...prev, newVersion])
      setCurrentVersion(newVersion)

      addMessage('assistant', `✅ 功能修改完成！

🔄 更新内容：
${data.message}

新版本 v${newVersion.version} 已生成。请在右侧查看效果，还有其他需要调整的吗？`, { action: 'completed', progress: 100 })

    } catch (error) {
      console.error('功能修改失败:', error)
      addMessage('assistant', `修改过程中遇到了问题：${error instanceof Error ? error.message : '未知错误'}

请尝试：
1. 更详细地描述修改需求
2. 简化修改范围
3. 重新尝试

需要我重新尝试吗？`)
    }
  }

  const handleDesignAdjustment = async (data: any) => {
    if (!currentVersion) {
      addMessage('assistant', '请先生成一个MVP版本，然后我可以帮您调整设计。')
      return
    }

    addMessage('assistant', '正在分析设计调整需求...', { action: 'designing', progress: 20 })

    try {
      // 构建设计调整请求数据
      const requestData = {
        ideaTitle: ideaContext.title,
        ideaDescription: ideaContext.description,
        targetUsers: ideaContext.targetUsers,
        coreFeatures: ideaContext.coreFeatures,
        industryType: '通用',
        userRequirement: data.message,
        designContext: {
          currentVersion: currentVersion.version,
          previousHtmlCode: currentVersion.htmlCode,
          designAdjustmentRequest: data.message,
          focusOnDesign: true,
          preserveFunctionality: true
        },
        designPreferences: {
          style: extractDesignStyle(data.message),
          colorScheme: extractColorScheme(data.message)
        }
      }

      addMessage('assistant', '正在应用设计调整...', { action: 'designing', progress: 60 })

      // 调用MVP生成API，传入设计调整上下文
      const response = await fetch('/api/business-plan/modules/mvp-prototype', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        throw new Error(`API调用失败: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'MVP设计调整失败')
      }

      // 创建新版本
      const newVersion: MVPVersion = {
        id: `mvp_${Date.now()}`,
        version: mvpVersions.length + 1,
        htmlCode: result.data.prototype.htmlCode,
        description: `${ideaContext.title} - v${mvpVersions.length + 1} (设计调整)`,
        timestamp: new Date(),
        changes: [...currentVersion.changes, `设计调整: ${data.message}`]
      }

      setMvpVersions(prev => [...prev, newVersion])
      setCurrentVersion(newVersion)

      addMessage('assistant', `🎨 设计调整完成！

✨ 更新内容：
${data.message}

新版本 v${newVersion.version} 已应用设计调整。请在右侧查看效果，如果需要进一步调整，请告诉我！`, { action: 'completed', progress: 100 })

    } catch (error) {
      console.error('设计调整失败:', error)
      addMessage('assistant', `设计调整过程中遇到了问题：${error instanceof Error ? error.message : '未知错误'}

请尝试：
1. 更具体地描述设计要求（如颜色、样式、布局等）
2. 分步进行调整
3. 重新尝试

需要我重新尝试吗？`)
    }
  }

  // 提取设计风格
  const extractDesignStyle = (message: string): string => {
    if (message.includes('现代') || message.includes('简约')) return 'modern'
    if (message.includes('极简') || message.includes('minimalist')) return 'minimalist'
    if (message.includes('企业') || message.includes('正式')) return 'corporate'
    if (message.includes('创意') || message.includes('艺术')) return 'creative'
    return 'modern'
  }

  // 提取配色方案
  const extractColorScheme = (message: string): string => {
    if (message.includes('蓝色') || message.includes('blue')) return 'blue'
    if (message.includes('绿色') || message.includes('green')) return 'green'
    if (message.includes('紫色') || message.includes('purple')) return 'purple'
    if (message.includes('橙色') || message.includes('orange')) return 'orange'
    return 'blue'
  }

  const handleGeneralRequest = async (message: string) => {
    addMessage('assistant', '正在理解您的需求...', { action: 'thinking', progress: 50 })

    await new Promise(resolve => setTimeout(resolve, 1000))

    addMessage('assistant', `我理解您的要求。基于您的消息，我建议：

如果您想要：
- 生成新的MVP → 说"生成MVP"或"开始制作"
- 修改现有功能 → 说"修改XXX功能"
- 调整设计样式 → 说"调整XXX设计"
- 添加新功能 → 说"添加XXX功能"

请告诉我具体想要做什么，我会帮您实现！`)
  }

  // 辅助函数
  const extractFeatures = (message: string): string[] => {
    // 简单的功能提取逻辑
    const features = []
    if (message.includes('搜索') || message.includes('查找')) features.push('搜索功能')
    if (message.includes('登录') || message.includes('注册')) features.push('用户认证')
    if (message.includes('支付') || message.includes('购买')) features.push('支付功能')
    if (message.includes('聊天') || message.includes('消息')) features.push('聊天功能')
    if (message.includes('分析') || message.includes('统计')) features.push('数据分析')

    return features.length > 0 ? features : ['核心功能1', '核心功能2', '核心功能3']
  }

  const extractTargetUsers = (message: string): string[] => {
    const users = []
    if (message.includes('学生') || message.includes('K12')) users.push('学生')
    if (message.includes('家长') || message.includes('父母')) users.push('家长')
    if (message.includes('企业') || message.includes('公司')) users.push('企业用户')
    if (message.includes('白领') || message.includes('上班族')) users.push('白领群体')

    return users.length > 0 ? users : ['目标用户']
  }

  const modifyHtmlCode = (originalCode: string, requirement: string): string => {
    // 简单的代码修改模拟
    let modifiedCode = originalCode

    if (requirement.includes('颜色')) {
      modifiedCode = modifiedCode.replace(/bg-blue-/g, 'bg-green-')
    }

    if (requirement.includes('按钮')) {
      modifiedCode = modifiedCode.replace(/按钮/g, '新按钮')
    }

    return modifiedCode
  }

  const handleDownload = () => {
    if (!currentVersion) return

    const blob = new Blob([currentVersion.htmlCode], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${ideaContext.title || 'MVP原型'}-v${currentVersion.version}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handlePreview = () => {
    if (!currentVersion) return

    const win = window.open('', '_blank')
    if (win) {
      win.document.write(currentVersion.htmlCode)
      win.document.close()
    }
  }

  return (
    <Layout>
      <div className="h-screen flex flex-col bg-gray-50">
        {/* 顶部导航栏 */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
            <div className="flex items-center gap-2">
              <Code className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold">MVP实时生成器</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentVersion && (
              <>
                <Badge variant="outline">
                  v{currentVersion.version}
                </Badge>
                <Button variant="outline" size="sm" onClick={handlePreview}>
                  <Eye className="w-4 h-4 mr-2" />
                  预览
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  下载
                </Button>
              </>
            )}
          </div>
        </div>

        {/* 主内容区域 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 左侧聊天区域 */}
          <div className="w-1/2 flex flex-col border-r">
            {/* 聊天消息区域 */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] rounded-lg p-4 ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : message.type === 'system'
                          ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                          : 'bg-white border shadow-sm'
                      }`}>
                        <div className="flex items-start gap-2">
                          {message.type === 'assistant' && (
                            <Sparkles className="w-4 h-4 text-blue-500 mt-1 shrink-0" />
                          )}
                          {message.type === 'system' && (
                            <Lightbulb className="w-4 h-4 text-yellow-600 mt-1 shrink-0" />
                          )}
                          <div className="flex-1">
                            <pre className="whitespace-pre-wrap text-sm font-sans">
                              {message.content}
                            </pre>
                            {message.metadata?.progress !== undefined && (
                              <div className="mt-2 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${message.metadata.progress}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-xs opacity-70 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isGenerating && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                        <span className="text-sm text-gray-600">AI正在处理中...</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* 输入区域 */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <Input
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder="描述您的需求，比如：生成MVP、修改按钮颜色、添加新功能..."
                  className="flex-1"
                  disabled={isGenerating}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!currentInput.trim() || isGenerating}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                按Enter发送，Shift+Enter换行
              </div>
            </div>
          </div>

          {/* 右侧预览区域 */}
          <div className="w-1/2 flex flex-col">
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-gray-600" />
                  <h2 className="font-semibold">实时预览</h2>
                </div>
                {currentVersion && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>版本 v{currentVersion.version}</span>
                    <span>•</span>
                    <span>{currentVersion.timestamp.toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 bg-white">
              {currentVersion ? (
                <iframe
                  srcDoc={currentVersion.htmlCode}
                  className="w-full h-full border-0"
                  title="MVP预览"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Monitor className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold mb-2">等待生成</h3>
                    <p className="text-sm">
                      在左侧聊天框中描述您的需求<br />
                      我会实时生成MVP原型
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 版本历史 */}
            {mvpVersions.length > 0 && (
              <div className="border-t bg-gray-50 p-4">
                <h3 className="font-semibold text-sm mb-3">版本历史</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {mvpVersions.slice().reverse().map((version) => (
                    <div
                      key={version.id}
                      className={`p-2 rounded cursor-pointer text-sm ${
                        version.id === currentVersion?.id
                          ? 'bg-blue-100 border border-blue-300'
                          : 'bg-white border hover:border-gray-300'
                      }`}
                      onClick={() => setCurrentVersion(version)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">v{version.version}</span>
                        <span className="text-xs text-gray-500">
                          {version.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {version.changes[version.changes.length - 1]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}