'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown, ChevronUp, Clock, Eye, Bookmark, Share2,
  TrendingUp, Target, BarChart3, Users, Building, Code,
  DollarSign, Shield, Calendar, Presentation, Star,
  CheckCircle, ArrowRight, Zap, Sparkles, Copy, Download
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

// 现代化图标映射
const MODERN_CHAPTER_ICONS = {
  'concept_analysis': { icon: Target, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  'market_research': { icon: TrendingUp, color: 'from-emerald-500 to-green-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  'tech_architecture': { icon: Code, color: 'from-purple-500 to-violet-500', bg: 'bg-purple-50 dark:bg-purple-950/30' },
  'business_model': { icon: Building, color: 'from-orange-500 to-amber-500', bg: 'bg-orange-50 dark:bg-orange-950/30' },
  'financial_model': { icon: DollarSign, color: 'from-green-500 to-emerald-500', bg: 'bg-green-50 dark:bg-green-950/30' },
  'legal_compliance': { icon: Shield, color: 'from-red-500 to-pink-500', bg: 'bg-red-50 dark:bg-red-950/30' },
  'implementation_plan': { icon: Calendar, color: 'from-indigo-500 to-purple-500', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
  'investor_pitch': { icon: Presentation, color: 'from-pink-500 to-rose-500', bg: 'bg-pink-50 dark:bg-pink-950/30' }
}

interface ModernChapterDisplayProps {
  chapterData: {
    id: string
    title: string
    completionProgress: number
    coreContent: {
      summary: string
      keyPoints: string[]
      visualData?: {
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
      references: string[]
    }
    readingTime: {
      core: number
      expanded: number
    }
  }
  isExpanded: boolean
  onToggleExpansion: () => void
  viewMode: 'grid' | 'list'
  isDarkMode?: boolean
}

export const ModernChapterDisplay: React.FC<ModernChapterDisplayProps> = ({
  chapterData,
  isExpanded,
  onToggleExpansion,
  viewMode,
  isDarkMode = false
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)

  const chapterConfig = MODERN_CHAPTER_ICONS[chapterData.id] || MODERN_CHAPTER_ICONS['concept_analysis']
  const IconComponent = chapterConfig.icon

  const containerVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    hover: { y: -4, scale: 1.02 }
  }

  const expandVariants = {
    collapsed: { height: 0, opacity: 0 },
    expanded: { height: 'auto', opacity: 1 }
  }

  const renderMetricCard = (metric: any, index: number) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.05 }}
      className={`p-4 rounded-2xl ${chapterConfig.bg} border border-white/50 dark:border-gray-800/50 backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">{metric.label}</span>
        {metric.trend && (
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            metric.trend === 'up' ? 'bg-green-100 dark:bg-green-900' :
            metric.trend === 'down' ? 'bg-red-100 dark:bg-red-900' :
            'bg-gray-100 dark:bg-gray-800'
          }`}>
            <TrendingUp className={`w-3 h-3 ${
              metric.trend === 'up' ? 'text-green-600 dark:text-green-400' :
              metric.trend === 'down' ? 'text-red-600 dark:text-red-400 rotate-180' :
              'text-gray-600 dark:text-gray-400'
            }`} />
          </div>
        )}
      </div>
      <div className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
        {metric.value}
      </div>
    </motion.div>
  )

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="group"
    >
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        {/* 章节头部 */}
        <CardHeader className="pb-4 relative overflow-hidden">
          {/* 背景装饰 */}
          <div className={`absolute inset-0 bg-gradient-to-r ${chapterConfig.color} opacity-5`} />
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-full -mr-16 -mt-16" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* 现代化图标 */}
              <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-r ${chapterConfig.color} flex items-center justify-center shadow-lg`}>
                <IconComponent className="w-7 h-7 text-white" />
                {chapterData.completionProgress === 100 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 group-hover:bg-clip-text dark:group-hover:from-white dark:group-hover:to-gray-300 transition-all">
                  {chapterData.title}
                </h3>

                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{chapterData.readingTime.core}分钟阅读</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <Badge variant="outline" className="text-xs px-2 py-1">
                      核心版
                    </Badge>
                  </div>

                  {chapterData.completionProgress > 0 && (
                    <div className="flex items-center space-x-2">
                      <Progress value={chapterData.completionProgress} className="w-20 h-2" />
                      <span className="text-xs font-medium">{chapterData.completionProgress}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 操作按钮组 */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`w-9 h-9 p-0 rounded-xl ${isBookmarked ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950/30' : ''}`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </Button>

              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="w-9 h-9 p-0 rounded-xl"
                >
                  <Share2 className="w-4 h-4" />
                </Button>

                <AnimatePresence>
                  {showShareMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
                      className="absolute right-0 top-12 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-lg border p-2 z-10"
                    >
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <Copy className="w-4 h-4 mr-2" />
                        复制链接
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <Download className="w-4 h-4 mr-2" />
                        导出章节
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 核心摘要 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`p-4 rounded-2xl ${chapterConfig.bg} border border-white/50 dark:border-gray-800/50`}
          >
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {chapterData.coreContent.summary}
              </p>
            </div>
          </motion.div>

          {/* 关键指标 */}
          {chapterData.coreContent.visualData?.metrics && (
            <div className="space-y-3">
              <h4 className="flex items-center text-sm font-semibold text-muted-foreground">
                <BarChart3 className="w-4 h-4 mr-2" />
                关键指标
              </h4>
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2' : 'grid-cols-4'} gap-3`}>
                {chapterData.coreContent.visualData.metrics.map((metric, index) =>
                  renderMetricCard(metric, index)
                )}
              </div>
            </div>
          )}

          {/* 核心要点 */}
          <div className="space-y-3">
            <h4 className="flex items-center text-sm font-semibold text-muted-foreground">
              <Star className="w-4 h-4 mr-2" />
              核心要点
            </h4>
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
              {chapterData.coreContent.keyPoints.map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">{index + 1}</span>
                  </div>
                  <p className="text-sm leading-relaxed">{point}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 行动要点 */}
          <div className="space-y-3">
            <h4 className="flex items-center text-sm font-semibold text-muted-foreground">
              <Zap className="w-4 h-4 mr-2" />
              关键行动
            </h4>
            <div className="space-y-2">
              {chapterData.coreContent.actionItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-3 text-sm group/item"
                >
                  <div className="w-2 h-2 bg-gradient-to-r from-primary to-primary/60 rounded-full group-hover/item:scale-125 transition-transform" />
                  <span className="group-hover/item:text-primary transition-colors">{item}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 展开/收起按钮 */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button
              onClick={onToggleExpansion}
              variant="ghost"
              className="w-full justify-between h-12 text-sm font-medium hover:bg-primary/5 group/expand"
            >
              <span className="flex items-center">
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-2 group-hover/expand:scale-110 transition-transform" />
                    收起详细内容
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2 group-hover/expand:scale-110 transition-transform" />
                    展开详细分析
                  </>
                )}
              </span>

              {!isExpanded && (
                <Badge variant="secondary" className="text-xs">
                  +{chapterData.readingTime.expanded}min
                </Badge>
              )}
            </Button>
          </div>

          {/* 展开的详细内容 */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                variants={expandVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <h4 className="flex items-center text-lg font-semibold">
                      <BarChart3 className="w-5 h-5 mr-2 text-primary" />
                      详细分析内容
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      约{chapterData.readingTime.expanded}分钟
                    </Badge>
                  </div>

                  {/* 完整分析 */}
                  <div className="prose prose-sm max-w-none">
                    <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                      <p className="text-sm leading-relaxed whitespace-pre-line text-gray-700 dark:text-gray-300">
                        {chapterData.expandedContent.fullAnalysis}
                      </p>
                    </div>
                  </div>

                  {/* 详细章节 */}
                  {chapterData.expandedContent.detailedSections.length > 0 && (
                    <div className="space-y-4">
                      <h5 className="font-medium text-muted-foreground">深入分析</h5>
                      {chapterData.expandedContent.detailedSections.map((section, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary/30 transition-colors"
                        >
                          <h6 className="font-semibold text-sm mb-2 text-gray-900 dark:text-white">
                            {section.title}
                          </h6>
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            {section.content}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* 参考资料 */}
                  {chapterData.expandedContent.references.length > 0 && (
                    <div className="space-y-3">
                      <h5 className="font-medium text-muted-foreground">参考资料</h5>
                      <ul className="space-y-2">
                        {chapterData.expandedContent.references.map((ref, index) => (
                          <li key={index} className="flex items-start text-sm text-muted-foreground">
                            <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                            <span>{ref}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 展开内容的操作按钮 */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="h-9">
                        <Download className="w-4 h-4 mr-2" />
                        导出章节
                      </Button>
                      <Button variant="outline" size="sm" className="h-9">
                        <Share2 className="w-4 h-4 mr-2" />
                        分享
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onToggleExpansion}
                      className="h-9"
                    >
                      <ChevronUp className="w-4 h-4 mr-2" />
                      收起内容
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}