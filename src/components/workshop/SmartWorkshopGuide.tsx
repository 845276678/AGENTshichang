/**
 * 智能工作坊功能说明组件
 */

'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Brain,
  MessageCircle,
  Sparkles,
  Target,
  CheckCircle,
  ArrowRight,
  Users,
  Search,
  TrendingUp
} from 'lucide-react'

interface SmartWorkshopGuideProps {
  workshopType?: 'mvp-builder' | 'demand-validation'
}

export default function SmartWorkshopGuide({ workshopType = 'mvp-builder' }: SmartWorkshopGuideProps) {
  // MVP工作坊配置
  const mvpConfig = {
    title: '🎯 AI增强MVP工作坊',
    features: [
      {
        icon: MessageCircle,
        color: 'blue',
        title: '智能澄清对话',
        description: 'AI实时分析你的想法，通过对话帮助完善抽象的创意描述'
      },
      {
        icon: Target,
        color: 'green',
        title: '实时理解验证',
        description: '系统会确认是否正确理解你的想法，避免误解'
      },
      {
        icon: CheckCircle,
        color: 'purple',
        title: '动态改进建议',
        description: '基于你的回答，AI提供个性化的完善建议'
      }
    ],
    steps: [
      '正常填写工作坊表单，描述你的创意想法',
      'AI检测到想法需要完善时，会弹出优化建议',
      '点击"AI优化"与智能助手对话，完善你的想法',
      '优化后的想法自动应用到表单，继续工作坊'
    ],
    tip: '如果你的想法还比较抽象或不够具体，AI会主动建议优化。当然，你也可以随时点击"智能澄清"按钮与AI对话，让你的创意更加清晰可行！'
  }

  // 需求验证工作坊配置
  const demandConfig = {
    title: '🎯 AI增强需求验证实验室',
    features: [
      {
        icon: MessageCircle,
        color: 'blue',
        title: '假设澄清对话',
        description: 'AI帮你明确需要验证的核心假设，避免验证方向错误'
      },
      {
        icon: Users,
        color: 'green',
        title: '用户访谈指导',
        description: '实时指导如何设计访谈问题，提高访谈质量'
      },
      {
        icon: Search,
        color: 'purple',
        title: '实验设计推荐',
        description: '基于你的情况智能推荐最适合的验证方法'
      },
      {
        icon: TrendingUp,
        color: 'orange',
        title: '结果分析助手',
        description: '帮助解读验证数据，得出可行的结论'
      }
    ],
    steps: [
      '填写目标客户信息，AI检测假设的清晰度',
      'AI建议澄清模糊假设，通过对话完善验证重点',
      '获得用户访谈问题建议和实验设计推荐',
      '完成验证计划，生成专业的验证报告'
    ],
    tip: '需求验证的关键是明确假设并用最低成本验证。AI助手会根据你的客户类型和验证目标，推荐最适合的验证方法和访谈策略！'
  }

  const config = workshopType === 'demand-validation' ? demandConfig : mvpConfig

  return (
    <Card className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-600" />
          <CardTitle className="text-lg">{config.title}</CardTitle>
          <Badge className="bg-blue-600">NEW</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              新功能亮点
            </h4>
            <ul className="space-y-2 text-sm">
              {config.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <feature.icon className={`w-4 h-4 text-${feature.color}-500 mt-0.5 flex-shrink-0`} />
                  <span><strong>{feature.title}</strong> - {feature.description}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-blue-500" />
              使用流程
            </h4>
            <ol className="space-y-2 text-sm">
              {config.steps.map((step, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 text-xs flex items-center justify-center mt-0.5 flex-shrink-0">{index + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>专家提示:</strong> {config.tip}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}