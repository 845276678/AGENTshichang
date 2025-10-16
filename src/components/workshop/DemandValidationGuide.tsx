/**
 * 需求验证工作坊智能指南组件
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

export default function DemandValidationGuide() {
  return (
    <Card className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-600" />
          <CardTitle className="text-lg">🎯 AI增强需求验证实验室</CardTitle>
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
              <li className="flex items-start gap-2">
                <MessageCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span><strong>假设澄清对话</strong> - AI帮你明确需要验证的核心假设，避免验证方向错误</span>
              </li>
              <li className="flex items-start gap-2">
                <Users className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>用户访谈指导</strong> - 实时指导如何设计访谈问题，提高访谈质量</span>
              </li>
              <li className="flex items-start gap-2">
                <Search className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <span><strong>实验设计推荐</strong> - 基于你的情况智能推荐最适合的验证方法</span>
              </li>
              <li className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <span><strong>结果分析助手</strong> - 帮助解读验证数据，得出可行的结论</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-blue-500" />
              使用流程
            </h4>
            <ol className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 text-xs flex items-center justify-center mt-0.5 flex-shrink-0">1</span>
                <span>填写目标客户信息，AI检测假设的清晰度</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 text-xs flex items-center justify-center mt-0.5 flex-shrink-0">2</span>
                <span>AI建议澄清模糊假设，通过对话完善验证重点</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 text-xs flex items-center justify-center mt-0.5 flex-shrink-0">3</span>
                <span>获得用户访谈问题建议和实验设计推荐</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 text-xs flex items-center justify-center mt-0.5 flex-shrink-0">4</span>
                <span>完成验证计划，生成专业的验证报告</span>
              </li>
            </ol>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>专家提示:</strong> 需求验证的关键是明确假设并用最低成本验证。
            AI助手会根据你的客户类型和验证目标，推荐最适合的验证方法和访谈策略！
          </p>
        </div>
      </CardContent>
    </Card>
  )
}