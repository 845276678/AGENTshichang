'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Target,
  BarChart3,
  TrendingUp,
  Users,
  Building,
  Code,
  DollarSign,
  Shield,
  Calendar,
  Presentation,
  Star,
  CheckCircle,
  ArrowRight,
  Eye,
  Download
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui'
import { Progress } from '@/components/ui/progress'
import type { ContentVersion } from '@/stores/useBusinessPlanGeneration'

// 章节图标映射
const CHAPTER_ICONS = {
  'concept_analysis': Target,
  'market_research': TrendingUp,
  'tech_architecture': Code,
  'business_model': Building,
  'financial_model': DollarSign,
  'legal_compliance': Shield,
  'implementation_plan': Calendar,
  'investor_pitch': Presentation
}

// 章节颜色主题
const CHAPTER_THEMES = {
  'concept_analysis': 'blue',
  'market_research': 'green',
  'tech_architecture': 'purple',
  'business_model': 'orange',
  'financial_model': 'emerald',
  'legal_compliance': 'red',
  'implementation_plan': 'indigo',
  'investor_pitch': 'pink'
}

interface ConciseChapterViewProps {
  version: ContentVersion
  chapterIndex: number
  isExpanded?: boolean
  onToggleExpansion?: () => void
  showActions?: boolean
}

export const ConciseChapterView: React.FC<ConciseChapterViewProps> = ({
  version,
  chapterIndex,
  isExpanded = false,
  onToggleExpansion,
  showActions = true
}) => {
  const [localExpanded, setLocalExpanded] = useState(isExpanded)

  const IconComponent = CHAPTER_ICONS[version.stageId] || Target
  const theme = CHAPTER_THEMES[version.stageId] || 'blue'

  const expanded = onToggleExpansion ? isExpanded : localExpanded
  const handleToggle = onToggleExpansion || (() => setLocalExpanded(!localExpanded))

  const { content } = version
  const { coreContent, expandableContent } = content

  return (
    <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-${theme}-100 rounded-lg flex items-center justify-center`}>
              <IconComponent className={`w-5 h-5 text-${theme}-600`} />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                第{chapterIndex}章: {content.title}
                <Badge variant="outline" className="text-xs">
                  {coreContent.wordCount}字
                </Badge>
              </CardTitle>
              <CardDescription className="text-sm">
                {content.summary}
              </CardDescription>
            </div>
          </div>

          {showActions && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                1-2min
              </Badge>
              <Button variant="ghost" size="sm">
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 核心内容 */}
        <div className="prose prose-sm max-w-none">
          <div className="text-gray-800 leading-relaxed whitespace-pre-line">
            {coreContent.text}
          </div>
        </div>

        {/* 关键指标展示 */}
        {coreContent.visualElements.metrics && coreContent.visualElements.metrics.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {coreContent.visualElements.metrics.map((metric, index) => (
              <div key={index} className={`p-4 bg-${metric.color}-50 rounded-lg text-center`}>
                <div className={`text-2xl font-bold text-${metric.color}-600 mb-1`}>
                  {metric.value}
                </div>
                <div className="text-xs text-gray-600">{metric.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* 核心要点 */}
        {content.keyPoints && content.keyPoints.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              核心要点
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {content.keyPoints.map((point, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{point}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 行动要点 */}
        {coreContent.actionItems && coreContent.actionItems.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-blue-500" />
              行动要点
            </h4>
            <div className="space-y-1">
              {coreContent.actionItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 展开/收起按钮 */}
        <div className="border-t pt-4">
          <Button
            variant="outline"
            onClick={handleToggle}
            className="w-full flex items-center justify-center gap-2"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                收起详细内容
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                展开详细分析 ({expandableContent.estimatedReadTime}分钟阅读)
              </>
            )}
          </Button>
        </div>

        {/* 可展开的详细内容 */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="border-t pt-6 space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <h3 className="font-medium">详细分析内容</h3>
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    约{expandableContent.estimatedReadTime}分钟
                  </Badge>
                </div>

                {expandableContent.sections.map((section, index) => (
                  <div key={index} className="space-y-3">
                    <h4 className="font-medium text-base border-l-2 border-primary pl-3">
                      {section.title}
                    </h4>
                    <div className="prose prose-sm max-w-none pl-5">
                      <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {section.content}
                      </div>
                    </div>

                    {/* 子章节 */}
                    {section.subsections && section.subsections.length > 0 && (
                      <div className="pl-5 space-y-3">
                        {section.subsections.map((subsection, subIndex) => (
                          <div key={subIndex} className="space-y-2">
                            <h5 className="font-medium text-sm text-gray-800">
                              {subsection.title}
                            </h5>
                            <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                              {subsection.content}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* 附件展示 */}
                {content.attachments && content.attachments.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-base">相关附件</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {content.attachments.map((attachment, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <BarChart3 className="w-4 h-4 text-blue-500" />
                            <span className="font-medium text-sm">{attachment.description}</span>
                            <Badge variant="outline" className="text-xs">
                              {attachment.type}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-600">
                            {/* 这里可以展示图表或表格的预览 */}
                            点击查看详细{attachment.type === 'chart' ? '图表' : attachment.type === 'table' ? '表格' : '内容'}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* 展开内容的操作按钮 */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      导出此章节
                    </Button>
                  </div>

                  <Button variant="ghost" size="sm" onClick={handleToggle}>
                    <ChevronUp className="w-4 h-4 mr-2" />
                    收起详细内容
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

// 章节列表视图组件
export const ConciseChaptersList: React.FC<{
  versions: ContentVersion[]
  expandedChapters?: Set<string>
  onToggleChapter?: (stageId: string) => void
  showOverview?: boolean
}> = ({
  versions,
  expandedChapters = new Set(),
  onToggleChapter,
  showOverview = true
}) => {
  const totalWordCount = versions.reduce(
    (sum, version) => sum + (version.content.coreContent?.wordCount || 0),
    0
  )
  const totalReadTime = Math.ceil(totalWordCount / 200) // 假设200字/分钟

  return (
    <div className="space-y-6">
      {/* 概览信息 */}
      {showOverview && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">创意实现建议概览</h2>
                <p className="text-muted-foreground">
                  精简版创意实现建议，核心内容一目了然，支持按需展开详细分析
                </p>
              </div>
              <div className="text-right space-y-1">
                <div className="text-2xl font-bold text-primary">{versions.length}</div>
                <div className="text-sm text-muted-foreground">个章节</div>
                <div className="text-sm text-muted-foreground">
                  约{totalReadTime}分钟阅读
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 章节列表 */}
      <div className="space-y-6">
        {versions.map((version, index) => (
          <ConciseChapterView
            key={version.id}
            version={version}
            chapterIndex={index + 1}
            isExpanded={expandedChapters.has(version.stageId)}
            onToggleExpansion={
              onToggleChapter
                ? () => onToggleChapter(version.stageId)
                : undefined
            }
          />
        ))}
      </div>

      {/* 整体操作按钮 */}
      <div className="flex justify-center gap-4 pt-6 border-t">
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          导出简版PDF
        </Button>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          导出完整版PDF
        </Button>
        <Button>
          <Presentation className="w-4 h-4 mr-2" />
          生成演示文稿
        </Button>
      </div>
    </div>
  )
}