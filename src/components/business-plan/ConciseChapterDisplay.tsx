'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, BarChart3, Users, Target, DollarSign, Calendar, Shield, Rocket, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

interface ConciseChapterProps {
  chapterData: {
    id: string
    title: string
    icon: React.ReactNode
    coreContent: {
      summary: string
      keyPoints: string[]
      visualData?: {
        charts?: any[]
        metrics?: Array<{
          label: string
          value: string | number
          trend?: 'up' | 'down' | 'stable'
        }>
      }
      actionItems: string[]
    }
    expandedContent: {
      fullAnalysis: string
      detailedSections: Array<{
        title: string
        content: string
      }>
      additionalCharts: any[]
      references: string[]
    }
    readingTime: {
      core: number
      expanded: number
    }
    completionProgress: number
  }
  isExpanded: boolean
  onToggleExpansion: () => void
}

const CHAPTER_ICONS: Record<string, React.ReactNode> = {
  concept_analysis: <Target className="w-5 h-5" />,
  market_research: <BarChart3 className="w-5 h-5" />,
  tech_architecture: <Rocket className="w-5 h-5" />,
  business_model: <TrendingUp className="w-5 h-5" />,
  financial_model: <DollarSign className="w-5 h-5" />,
  legal_compliance: <Shield className="w-5 h-5" />,
  implementation_plan: <Calendar className="w-5 h-5" />,
  investor_pitch: <Users className="w-5 h-5" />
}

export const ConciseChapterDisplay: React.FC<ConciseChapterProps> = ({
  chapterData,
  isExpanded,
  onToggleExpansion
}) => {
  return (
    <Card className="mb-6 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              {CHAPTER_ICONS[chapterData.id] || chapterData.icon}
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{chapterData.title}</CardTitle>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <span>{chapterData.readingTime.core}分钟阅读</span>
                <Badge variant="outline" className="text-xs">
                  核心版本
                </Badge>
                {chapterData.completionProgress > 0 && (
                  <div className="flex items-center space-x-2">
                    <Progress value={chapterData.completionProgress} className="w-16 h-2" />
                    <span className="text-xs">{chapterData.completionProgress}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleExpansion}
            className="text-blue-600 hover:text-blue-800"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                收起详情
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                展开详情
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* 核心内容 - 始终显示 */}
        <div className="space-y-4">
          {/* 核心概述 */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-gray-800 leading-relaxed">
              {chapterData.coreContent.summary}
            </p>
          </div>

          {/* 关键要点 */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">🎯 核心要点</h4>
            <div className="grid gap-2">
              {chapterData.coreContent.keyPoints.map((point, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 可视化数据 */}
          {chapterData.coreContent.visualData?.metrics && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">📊 关键指标</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {chapterData.coreContent.visualData.metrics.map((metric, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {metric.value}
                      {metric.trend && (
                        <TrendingUp className={`inline-block w-4 h-4 ml-1 ${
                          metric.trend === 'up' ? 'text-green-500' :
                          metric.trend === 'down' ? 'text-red-500 rotate-180' :
                          'text-gray-400'
                        }`} />
                      )}
                    </div>
                    <p className="text-xs text-gray-600">{metric.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 行动要点 */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">✅ 关键行动</h4>
            <div className="space-y-1">
              {chapterData.coreContent.actionItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 展开内容 */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6"
            >
              <Separator className="mb-6" />

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">📋 详细分析</h3>
                  <Badge variant="secondary" className="text-xs">
                    预计阅读 {chapterData.readingTime.expanded} 分钟
                  </Badge>
                </div>

                {/* 完整分析 */}
                <div className="prose prose-sm max-w-none">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {chapterData.expandedContent.fullAnalysis}
                    </p>
                  </div>
                </div>

                {/* 详细章节 */}
                <div className="space-y-4">
                  {chapterData.expandedContent.detailedSections.map((section, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{section.title}</h4>
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                        {section.content}
                      </p>
                    </div>
                  ))}
                </div>

                {/* 参考资料 */}
                {chapterData.expandedContent.references.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">📚 参考资料</h4>
                    <ul className="space-y-1">
                      {chapterData.expandedContent.references.map((ref, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                          <span className="mr-2">•</span>
                          <span>{ref}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onToggleExpansion}
                  >
                    <ChevronUp className="w-4 h-4 mr-1" />
                    收起详情
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}