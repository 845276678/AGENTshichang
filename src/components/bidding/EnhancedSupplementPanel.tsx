'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Send,
  Lightbulb,
  FileText,
  Users,
  Target,
  DollarSign,
  Calendar,
  Loader2
} from 'lucide-react'

interface EnhancedSupplementPanelProps {
  onSubmitSupplement: (content: string, category: SupplementCategory) => Promise<boolean>
  maxSupplements?: number
  currentSupplementCount?: number
  className?: string
}

export type SupplementCategory =
  | 'background'     // 项目背景
  | 'target_users'   // 目标用户
  | 'features'       // 功能特性
  | 'resources'      // 资源需求
  | 'timeline'       // 时间计划
  | 'budget'         // 预算范围
  | 'other'          // 其他

interface SupplementItem {
  id: string
  category: SupplementCategory
  content: string
  timestamp: Date
}

const CATEGORY_CONFIG: Record<SupplementCategory, {
  icon: React.ComponentType<{ className?: string }>
  label: string
  placeholder: string
  color: string
}> = {
  background: {
    icon: FileText,
    label: '项目背景',
    placeholder: '描述项目的背景、市场现状、为什么要做这个项目...',
    color: 'text-blue-600'
  },
  target_users: {
    icon: Users,
    label: '目标用户',
    placeholder: '描述您的目标用户群体、他们的特征、需求和痛点...',
    color: 'text-green-600'
  },
  features: {
    icon: Target,
    label: '功能特性',
    placeholder: '详细说明核心功能、创新点、技术方案...',
    color: 'text-purple-600'
  },
  resources: {
    icon: Lightbulb,
    label: '资源需求',
    placeholder: '说明需要的团队、技术、合作伙伴等资源...',
    color: 'text-orange-600'
  },
  timeline: {
    icon: Calendar,
    label: '时间计划',
    placeholder: '预期的实施周期、里程碑、各阶段计划...',
    color: 'text-pink-600'
  },
  budget: {
    icon: DollarSign,
    label: '预算范围',
    placeholder: '预期的投入预算、资金使用计划...',
    color: 'text-yellow-600'
  },
  other: {
    icon: Plus,
    label: '其他信息',
    placeholder: '补充其他相关信息...',
    color: 'text-gray-600'
  }
}

export const EnhancedSupplementPanel: React.FC<EnhancedSupplementPanelProps> = ({
  onSubmitSupplement,
  maxSupplements = 5,
  currentSupplementCount = 0,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<SupplementCategory>('background')
  const [content, setContent] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [supplements, setSupplements] = useState<SupplementItem[]>([])

  const handleSubmit = async () => {
    if (!content.trim() || isSending) return

    if (supplements.length >= maxSupplements) {
      alert(`已达到补充上限（${maxSupplements}次）`)
      return
    }

    setIsSending(true)
    try {
      const success = await onSubmitSupplement(content.trim(), selectedCategory)

      if (success) {
        // 添加到历史记录
        const newSupplement: SupplementItem = {
          id: `supp_${Date.now()}`,
          category: selectedCategory,
          content: content.trim(),
          timestamp: new Date()
        }
        setSupplements(prev => [...prev, newSupplement])
        setContent('')

        // 成功后自动折叠
        setTimeout(() => {
          setIsExpanded(false)
        }, 1000)
      }
    } finally {
      setIsSending(false)
    }
  }

  const canSubmit = content.trim().length > 0 && supplements.length < maxSupplements && !isSending
  const config = CATEGORY_CONFIG[selectedCategory]
  const Icon = config.icon

  return (
    <Card className={`border-2 border-purple-200 ${className}`}>
      <CardHeader
        className="cursor-pointer hover:bg-purple-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Plus className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                补充创意详情
                <Badge variant="outline" className="text-xs">
                  {supplements.length} / {maxSupplements}
                </Badge>
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                {isExpanded ? '点击收起' : '点击展开以补充更多信息'}
              </p>
            </div>
          </div>
          <div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* 补充类别选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              选择补充类别
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(Object.keys(CATEGORY_CONFIG) as SupplementCategory[]).map((category) => {
                const catConfig = CATEGORY_CONFIG[category]
                const CatIcon = catConfig.icon
                const isSelected = selectedCategory === category

                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                    }`}
                  >
                    <CatIcon className={`w-5 h-5 ${isSelected ? 'text-purple-600' : 'text-gray-400'}`} />
                    <span className={`text-xs font-medium ${isSelected ? 'text-purple-700' : 'text-gray-600'}`}>
                      {catConfig.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 补充内容输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Icon className={`w-4 h-4 ${config.color}`} />
              {config.label}
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={config.placeholder}
              className="min-h-[120px] resize-none"
              disabled={isSending}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                {content.length > 0
                  ? `已输入 ${content.length} 个字符`
                  : '请详细描述'}
              </p>
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    提交中...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    提交补充 ({supplements.length + 1}/{maxSupplements})
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* 已提交的补充内容历史 */}
          {supplements.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700">已提交的补充：</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {supplements.map((item, index) => {
                  const catConfig = CATEGORY_CONFIG[item.category]
                  const CatIcon = catConfig.icon

                  return (
                    <div
                      key={item.id}
                      className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          补充 {index + 1}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs text-gray-600">
                          <CatIcon className={`w-3 h-3 ${catConfig.color}`} />
                          {catConfig.label}
                        </span>
                        <span className="text-xs text-gray-400 ml-auto">
                          {item.timestamp.toLocaleTimeString('zh-CN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {item.content}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 达到上限提示 */}
          {supplements.length >= maxSupplements && (
            <div className="bg-green-100 text-green-800 p-3 rounded-lg text-sm">
              ✅ 您已完成所有补充，AI专家将基于完整信息给出评估
            </div>
          )}

          {/* 提示信息 */}
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-xs text-blue-700 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              💡 提示：补充的信息会实时同步给所有AI专家，帮助他们更准确地评估您的创意
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export default EnhancedSupplementPanel
