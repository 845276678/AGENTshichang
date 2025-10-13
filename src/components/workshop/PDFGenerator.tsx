/**
 * PDF报告生成器组件
 *
 * 提供工作坊PDF报告的生成和预览功能：
 * - 报告生成配置
 * - 实时预览
 * - 下载和分享
 * - 生成进度显示
 */

'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  FileText,
  Download,
  Share2,
  Eye,
  Loader2,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { type WorkshopSession } from '@/hooks/useWorkshopSession'

// 组件Props接口
export interface PDFGeneratorProps {
  session: WorkshopSession
  onDownload?: (filename: string) => void
  onShare?: (shareData: { url: string, filename: string }) => void
  className?: string
}

// PDF生成状态
type GenerationStatus = 'idle' | 'generating' | 'success' | 'error'

// 用户配置接口
interface UserProfile {
  name: string
  email?: string
  company?: string
}

// PDF配置接口
interface PDFConfig {
  userProfile: UserProfile
  includeHistory: boolean
  includeConversations: boolean
}

export default function PDFGenerator({
  session,
  onDownload,
  onShare,
  className = ''
}: PDFGeneratorProps) {
  // 状态管理
  const [config, setConfig] = useState<PDFConfig>({
    userProfile: {
      name: '',
      email: '',
      company: ''
    },
    includeHistory: false,
    includeConversations: false
  })

  const [status, setStatus] = useState<GenerationStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [generatedPDF, setGeneratedPDF] = useState<{
    filename: string
    blob: Blob
    url: string
  } | null>(null)

  // 检查是否可以生成PDF
  const canGenerate = session.status === 'COMPLETED' && config.userProfile.name.trim().length > 0

  // 获取工作坊显示名称
  const getWorkshopDisplayName = (workshopId: string): string => {
    const displayNames: Record<string, string> = {
      'demand-validation': '需求验证实验室',
      'mvp-builder': 'MVP构建工作坊',
      'growth-hacking': '增长黑客训练营',
      'profit-model': '商业模式设计'
    }
    return displayNames[workshopId] || workshopId
  }

  // 更新用户配置
  const updateUserProfile = useCallback((field: keyof UserProfile, value: string) => {
    setConfig(prev => ({
      ...prev,
      userProfile: {
        ...prev.userProfile,
        [field]: value
      }
    }))
  }, [])

  // 更新PDF选项
  const updateOption = useCallback((option: keyof Omit<PDFConfig, 'userProfile'>, checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      [option]: checked
    }))
  }, [])

  // 生成PDF
  const generatePDF = useCallback(async () => {
    if (!canGenerate) return

    setStatus('generating')
    setProgress(0)
    setError(null)

    try {
      console.log(`📄 开始生成PDF报告`, {
        sessionId: session.id,
        workshopId: session.workshopId,
        userProfile: config.userProfile
      })

      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      // 调用PDF生成API
      const response = await fetch('/api/workshop/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: session.id,
          userProfile: config.userProfile,
          includeHistory: config.includeHistory
        })
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      // 获取PDF文件
      const blob = await response.blob()
      const filename = getFilenameFromResponse(response) || getDefaultFilename()
      const url = URL.createObjectURL(blob)

      setGeneratedPDF({ filename, blob, url })
      setStatus('success')

      console.log(`✅ PDF生成成功`, {
        filename,
        size: blob.size,
        type: blob.type
      })

    } catch (error) {
      console.error('❌ PDF生成失败:', error)
      setStatus('error')
      setError(error instanceof Error ? error.message : '生成失败')
      setProgress(0)
    }
  }, [session, config, canGenerate])

  // 下载PDF
  const downloadPDF = useCallback(() => {
    if (!generatedPDF) return

    const link = document.createElement('a')
    link.href = generatedPDF.url
    link.download = generatedPDF.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    onDownload?.(generatedPDF.filename)
  }, [generatedPDF, onDownload])

  // 预览PDF
  const previewPDF = useCallback(() => {
    if (!generatedPDF) return

    window.open(generatedPDF.url, '_blank')
  }, [generatedPDF])

  // 分享PDF
  const sharePDF = useCallback(async () => {
    if (!generatedPDF) return

    try {
      if (navigator.share) {
        await navigator.share({
          title: '工作坊完成报告',
          text: `我刚完成了${getWorkshopDisplayName(session.workshopId)}，查看我的报告！`,
          files: [new File([generatedPDF.blob], generatedPDF.filename, { type: 'application/pdf' })]
        })
      } else {
        // 复制链接到剪贴板作为备选方案
        await navigator.clipboard.writeText(generatedPDF.url)
        alert('报告链接已复制到剪贴板')
      }

      onShare?.({ url: generatedPDF.url, filename: generatedPDF.filename })
    } catch (error) {
      console.error('分享失败:', error)
    }
  }, [generatedPDF, session.workshopId, onShare])

  // 重置状态
  const resetGenerator = useCallback(() => {
    setStatus('idle')
    setProgress(0)
    setError(null)
    if (generatedPDF) {
      URL.revokeObjectURL(generatedPDF.url)
      setGeneratedPDF(null)
    }
  }, [generatedPDF])

  // 从响应头获取文件名
  const getFilenameFromResponse = (response: Response): string | null => {
    const contentDisposition = response.headers.get('Content-Disposition')
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[*]?=['"]?([^'";]+)['"]?/)
      return filenameMatch ? decodeURIComponent(filenameMatch[1]) : null
    }
    return null
  }

  // 获取默认文件名
  const getDefaultFilename = (): string => {
    const workshopName = getWorkshopDisplayName(session.workshopId)
    const timestamp = new Date().toISOString().slice(0, 10)
    return `${workshopName}_完成报告_${timestamp}.pdf`
  }

  return (
    <Card className={cn('pdf-generator', className)}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg">生成PDF报告</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              将您的工作坊成果导出为专业PDF报告
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 工作坊信息 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-gray-500" />
              <span>工作坊: {getWorkshopDisplayName(session.workshopId)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span>完成: {new Date(session.updatedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>进度: {session.progress}%</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span>用户: {session.userId}</span>
            </div>
          </div>
        </div>

        {/* 状态检查 */}
        {session.status !== 'COMPLETED' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              工作坊尚未完成，请先完成所有步骤后再生成报告。
            </AlertDescription>
          </Alert>
        )}

        {/* 用户信息配置 */}
        <div className="space-y-4">
          <Label className="text-base font-medium">报告信息设置</Label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">姓名 <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                value={config.userProfile.name}
                onChange={(e) => updateUserProfile('name', e.target.value)}
                placeholder="请输入您的姓名"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                value={config.userProfile.email}
                onChange={(e) => updateUserProfile('email', e.target.value)}
                placeholder="请输入邮箱地址"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="company">公司/组织</Label>
            <Input
              id="company"
              value={config.userProfile.company}
              onChange={(e) => updateUserProfile('company', e.target.value)}
              placeholder="请输入公司或组织名称"
              className="mt-1"
            />
          </div>
        </div>

        <Separator />

        {/* PDF选项配置 */}
        <div className="space-y-4">
          <Label className="text-base font-medium">报告内容选项</Label>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeHistory"
                checked={config.includeHistory}
                onCheckedChange={(checked) => updateOption('includeHistory', checked === true)}
              />
              <Label htmlFor="includeHistory" className="text-sm">
                包含评估历史记录
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeConversations"
                checked={config.includeConversations}
                onCheckedChange={(checked) => updateOption('includeConversations', checked === true)}
                disabled // 暂时禁用，后续版本支持
              />
              <Label htmlFor="includeConversations" className="text-sm text-gray-500">
                包含AI对话记录 (即将支持)
              </Label>
            </div>
          </div>
        </div>

        <Separator />

        {/* 生成进度 */}
        {status === 'generating' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>正在生成PDF报告...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* 错误显示 */}
        {status === 'error' && error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 成功状态 */}
        {status === 'success' && generatedPDF && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              PDF报告生成成功！文件名: {generatedPDF.filename}
            </AlertDescription>
          </Alert>
        )}

        {/* 操作按钮 */}
        <div className="flex flex-wrap gap-3">
          {status === 'idle' || status === 'error' ? (
            <Button
              onClick={generatePDF}
              disabled={!canGenerate || status === 'generating'}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {status === 'generating' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  生成报告
                </>
              )}
            </Button>
          ) : null}

          {status === 'success' && generatedPDF && (
            <>
              <Button onClick={downloadPDF} className="bg-green-500 hover:bg-green-600">
                <Download className="w-4 h-4 mr-2" />
                下载报告
              </Button>
              <Button onClick={previewPDF} variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                预览
              </Button>
              <Button onClick={sharePDF} variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                分享
              </Button>
            </>
          )}

          {status === 'success' && (
            <Button onClick={resetGenerator} variant="ghost">
              重新生成
            </Button>
          )}
        </div>

        {/* 帮助信息 */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <p><strong>温馨提示:</strong></p>
          <ul className="mt-1 space-y-1">
            <li>• 生成的PDF报告包含您的完整工作坊成果和分析</li>
            <li>• 请确保填写准确的个人信息，这将显示在报告中</li>
            <li>• 报告文件可用于商业计划、投资申请或团队分享</li>
            <li>• 如遇到问题，请尝试重新生成或联系技术支持</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}