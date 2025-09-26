'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Share2, Clock, Pages, BarChart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ConciseChapterDisplay } from './ConciseChapterDisplay'
import { useBusinessPlanGeneration } from '@/stores/useBusinessPlanGeneration'

interface ConciseBusinessPlanProps {
  planData: {
    title: string
    ideaData: {
      title: string
      category: string
      description: string
    }
    chapters: any[]
    metadata: {
      totalPages: number
      totalReadingTime: number
      completionRate: number
      lastUpdated: Date
    }
  }
  onExport?: (format: 'pdf' | 'docx' | 'html') => void
  onShare?: () => void
}

export const ConciseBusinessPlan: React.FC<ConciseBusinessPlanProps> = ({
  planData,
  onExport,
  onShare
}) => {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'concise' | 'overview'>('concise')

  const toggleChapterExpansion = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters)
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId)
    } else {
      newExpanded.add(chapterId)
    }
    setExpandedChapters(newExpanded)
  }

  const expandAllChapters = () => {
    setExpandedChapters(new Set(planData.chapters.map(c => c.id)))
  }

  const collapseAllChapters = () => {
    setExpandedChapters(new Set())
  }

  const completedChapters = planData.chapters.filter(c => c.completionProgress === 100).length

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* 标题区域 */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-bold text-gray-900">{planData.title}</h1>
          <p className="text-lg text-gray-600">{planData.ideaData.title}</p>
          <Badge variant="outline" className="text-sm">
            {planData.ideaData.category}
          </Badge>
        </motion.div>

        <div className="max-w-2xl mx-auto text-gray-700 text-sm leading-relaxed">
          {planData.ideaData.description}
        </div>
      </div>

      {/* 概览统计 */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Pages className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-2xl font-bold text-gray-900">
                  {planData.metadata.totalPages}
                </span>
              </div>
              <p className="text-sm text-gray-600">总页数</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-2xl font-bold text-gray-900">
                  {planData.metadata.totalReadingTime}
                </span>
              </div>
              <p className="text-sm text-gray-600">分钟阅读</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <BarChart className="w-5 h-5 text-purple-600 mr-2" />
                <span className="text-2xl font-bold text-gray-900">
                  {completedChapters}/{planData.chapters.length}
                </span>
              </div>
              <p className="text-sm text-gray-600">章节完成</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <FileText className="w-5 h-5 text-orange-600 mr-2" />
                <span className="text-2xl font-bold text-gray-900">
                  {planData.metadata.completionRate}%
                </span>
              </div>
              <p className="text-sm text-gray-600">完整度</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 操作栏 */}
      <div className="flex items-center justify-between py-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-gray-900">商业计划书内容</h2>
          <p className="text-sm text-gray-600">
            每章节核心内容已精炼至一页，点击"展开详情"查看完整分析
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={expandAllChapters}
            className="text-sm"
          >
            展开全部
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={collapseAllChapters}
            className="text-sm"
          >
            收起全部
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <Button
            variant="outline"
            size="sm"
            onClick={() => onShare?.()}
            className="text-sm"
          >
            <Share2 className="w-4 h-4 mr-2" />
            分享
          </Button>

          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport?.('pdf')}
              className="text-sm"
            >
              <Download className="w-4 h-4 mr-1" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport?.('docx')}
              className="text-sm"
            >
              Word
            </Button>
          </div>
        </div>
      </div>

      {/* 阅读提示 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            💡
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-blue-900">快速阅读指南</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>核心版本</strong>：每章节约 1-2 分钟，包含最关键的信息和决策要点</li>
              <li>• <strong>详细版本</strong>：点击"展开详情"查看完整分析、数据支撑和实施建议</li>
              <li>• <strong>灵活阅读</strong>：可单独展开感兴趣的章节，无需按顺序阅读</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 章节列表 */}
      <div className="space-y-6">
        {planData.chapters.map((chapter, index) => (
          <motion.div
            key={chapter.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ConciseChapterDisplay
              chapterData={chapter}
              isExpanded={expandedChapters.has(chapter.id)}
              onToggleExpansion={() => toggleChapterExpansion(chapter.id)}
            />
          </motion.div>
        ))}
      </div>

      {/* 底部总结 */}
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">📋 商业计划书生成完成</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              本计划书已完成 {planData.metadata.completionRate}%，包含 {planData.chapters.length} 个核心章节。
              您可以继续完善细节内容，或直接导出使用。
            </p>

            {planData.metadata.completionRate < 100 && (
              <div className="mt-4">
                <Button variant="default" size="sm">
                  继续完善剩余章节
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}