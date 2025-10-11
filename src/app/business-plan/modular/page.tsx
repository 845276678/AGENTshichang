'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Users,
  Code,
  Megaphone,
  DollarSign,
  Sparkles,
  Clock,
  Check,
  ArrowRight,
  Lightbulb,
  Loader2
} from 'lucide-react'

interface ModuleCardProps {
  id: string
  title: string
  description: string
  icon: React.ElementType
  color: string
  estimatedTime: string
  difficulty: string
  outputs: string[]
  isSelected: boolean
  onSelect: () => void
  isCompleted?: boolean
}

const ModuleCard: React.FC<ModuleCardProps> = ({
  title,
  description,
  icon: Icon,
  color,
  estimatedTime,
  difficulty,
  outputs,
  isSelected,
  onSelect,
  isCompleted
}) => {
  return (
    <Card
      className={`relative cursor-pointer transition-all duration-300 ${
        isSelected
          ? `border-2 ${color} shadow-lg scale-105`
          : 'border hover:shadow-md hover:scale-102'
      } ${isCompleted ? 'bg-green-50 border-green-300' : ''}`}
      onClick={onSelect}
    >
      {isCompleted && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
          <Check className="w-4 h-4" />
        </div>
      )}
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-14 h-14 rounded-xl ${color.replace('border-', 'bg-').replace('500', '100')} flex items-center justify-center`}>
            <Icon className={`w-7 h-7 ${color.replace('border-', 'text-')}`} />
          </div>
          {isSelected && !isCompleted && (
            <Badge className={color.replace('border-', 'bg-')}>已选中</Badge>
          )}
        </div>

        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-gray-600">
              <Clock className="w-4 h-4" />
              {estimatedTime}
            </span>
            <Badge variant="outline">{difficulty}</Badge>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">输出内容:</p>
            <div className="flex flex-wrap gap-1">
              {outputs.map((output, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {output}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ModularBusinessPlanPage() {
  const router = useRouter()
  const [ideaContent, setIdeaContent] = useState('')
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set())
  const [isGenerating, setIsGenerating] = useState(false)
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set())

  const modules = [
    {
      id: 'market-analysis',
      title: '需求场景分析',
      description: '深入分析目标市场和用户需求，了解竞争格局',
      icon: Users,
      color: 'border-blue-500',
      estimatedTime: '3-5分钟',
      difficulty: '简单',
      outputs: ['用户画像', '市场规模', '竞争分析', '需求洞察']
    },
    {
      id: 'mvp-prototype',
      title: 'MVP版本制作',
      description: '生成可交互的HTML前端原型，无需后端开发',
      icon: Code,
      color: 'border-green-500',
      estimatedTime: '5-8分钟',
      difficulty: '中等',
      outputs: ['HTML代码', 'CSS样式', 'JS交互', '使用文档']
    },
    {
      id: 'marketing-strategy',
      title: '推广策略规划',
      description: '制定全面的营销推广计划和渠道策略',
      icon: Megaphone,
      color: 'border-purple-500',
      estimatedTime: '4-6分钟',
      difficulty: '中等',
      outputs: ['渠道策略', '内容规划', '预算分配', '执行计划']
    },
    {
      id: 'business-model',
      title: '盈利模式设计',
      description: '设计可持续的商业变现方案和财务预测',
      icon: DollarSign,
      color: 'border-orange-500',
      estimatedTime: '4-6分钟',
      difficulty: '中等',
      outputs: ['收入模式', '定价策略', '成本结构', '财务预测']
    }
  ]

  const handleModuleSelect = (moduleId: string) => {
    const newSelected = new Set(selectedModules)
    if (newSelected.has(moduleId)) {
      newSelected.delete(moduleId)
    } else {
      newSelected.add(moduleId)
    }
    setSelectedModules(newSelected)
  }

  const handleGenerate = async () => {
    if (!ideaContent.trim()) {
      alert('请先输入您的创意想法')
      return
    }

    if (selectedModules.size === 0) {
      alert('请至少选择一个模块')
      return
    }

    setIsGenerating(true)

    try {
      // 按顺序生成选中的模块
      for (const moduleId of Array.from(selectedModules)) {
        console.log(`正在生成模块: ${moduleId}`)

        // 根据模块类型调用不同的API
        let apiUrl = ''
        let requestBody: any = {
          ideaDescription: ideaContent
        }

        switch (moduleId) {
          case 'market-analysis':
            apiUrl = '/api/business-plan/modules/market-analysis'
            requestBody.industryCategory = '通用'
            break
          case 'mvp-prototype':
            apiUrl = '/api/business-plan/modules/mvp-prototype'
            requestBody.targetUsers = ['用户群体1', '用户群体2']
            requestBody.coreFeatures = ['功能1', '功能2', '功能3']
            requestBody.industryType = '互联网'
            break
          case 'marketing-strategy':
            apiUrl = '/api/business-plan/modules/marketing-strategy'
            requestBody.targetUsers = ['用户群体1', '用户群体2']
            break
          case 'business-model':
            apiUrl = '/api/business-plan/modules/business-model'
            requestBody.targetUsers = ['用户群体1', '用户群体2']
            break
        }

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        })

        if (response.ok) {
          setCompletedModules(prev => new Set([...prev, moduleId]))
        }

        // 模拟进度
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

      alert('所有选中的模块已生成完成！')
    } catch (error) {
      console.error('生成失败:', error)
      alert('生成过程中出现错误，请重试')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              模块化商业计划生成
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            选择您需要的模块，按需生成专业的商业计划内容。
            每个模块独立运行，灵活组合使用。
          </p>
        </div>

        {/* 创意输入区域 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              输入您的创意想法
            </CardTitle>
            <CardDescription>
              详细描述您的创意，包括目标用户、核心功能、预期价值等
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={ideaContent}
              onChange={(e) => setIdeaContent(e.target.value)}
              placeholder="例如：一个基于AI的个性化学习助手，能够根据学生的学习习惯和知识掌握程度，自动生成个性化的学习计划和练习题..."
              className="min-h-[120px] resize-none mb-4"
              disabled={isGenerating}
            />
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{ideaContent.length} 字符</span>
              <span>建议 100-500 字</span>
            </div>
          </CardContent>
        </Card>

        {/* 模块选择区域 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">
            选择需要生成的模块
            <span className="text-sm font-normal text-gray-500 ml-2">
              （已选择 {selectedModules.size}/4）
            </span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((module) => (
              <ModuleCard
                key={module.id}
                {...module}
                isSelected={selectedModules.has(module.id)}
                isCompleted={completedModules.has(module.id)}
                onSelect={() => !isGenerating && handleModuleSelect(module.id)}
              />
            ))}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col items-center gap-4">
          <Button
            size="lg"
            onClick={handleGenerate}
            disabled={isGenerating || selectedModules.size === 0 || !ideaContent.trim()}
            className="px-12 h-14 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                正在生成中...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                开始生成选中的模块
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>

          {selectedModules.size > 0 && (
            <p className="text-sm text-gray-600">
              预计耗时: {Array.from(selectedModules).length * 5} 分钟左右
            </p>
          )}

          {completedModules.size > 0 && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/business-plan/workspace')}
              className="px-8"
            >
              查看工作台
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* 使用提示 */}
        <Card className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              使用建议
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5" />
                <span>可以单独使用任何模块，也可以组合使用多个模块</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5" />
                <span>系统会自动保存您的创意信息，便于在不同模块间切换</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5" />
                <span>生成的内容可以在工作台中查看、编辑和导出</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5" />
                <span>MVP原型可以直接下载HTML代码，用于演示和测试</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
