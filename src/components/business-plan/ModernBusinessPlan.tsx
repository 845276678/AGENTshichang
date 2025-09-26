'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import {
  FileText, Download, Share2, Clock, FileText as Pages, BarChart,
  Sparkles, TrendingUp, Target, Zap, Star, ArrowRight,
  Eye, Bookmark, Filter, Grid, List, Moon, Sun
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { ModernChapterDisplay } from './ModernChapterDisplay'
import { useBusinessPlanGeneration } from '@/stores/useBusinessPlanGeneration'

interface ModernBusinessPlanProps {
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

export const ModernBusinessPlan: React.FC<ModernBusinessPlanProps> = ({
  planData,
  onExport,
  onShare
}) => {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')

  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ container: containerRef })
  const headerOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8])
  const headerScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])

  const toggleChapterExpansion = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters)
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId)
    } else {
      newExpanded.add(chapterId)
    }
    setExpandedChapters(newExpanded)
  }

  const completedChapters = planData.chapters.filter(c => c.completionProgress === 100).length

  // 现代化的统计卡片数据
  const statsData = [
    {
      icon: Pages,
      value: planData.metadata.totalPages,
      label: '核心页数',
      suffix: '页',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/50'
    },
    {
      icon: Clock,
      value: planData.metadata.totalReadingTime,
      label: '阅读时长',
      suffix: '分钟',
      color: 'from-emerald-500 to-green-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/50'
    },
    {
      icon: BarChart,
      value: `${completedChapters}/${planData.chapters.length}`,
      label: '完成章节',
      suffix: '',
      color: 'from-purple-500 to-violet-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950/50'
    },
    {
      icon: TrendingUp,
      value: planData.metadata.completionRate,
      label: '完整度',
      suffix: '%',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950/50'
    }
  ]

  return (
    <div
      ref={containerRef}
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? 'bg-gray-950 text-white'
          : 'bg-gradient-to-br from-slate-50 via-white to-blue-50'
      }`}
    >
      {/* 顶部固定导航栏 */}
      <motion.header
        style={{ opacity: headerOpacity, scale: headerScale }}
        className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/10 bg-white/80 dark:bg-gray-900/80"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg truncate max-w-md">{planData.ideaData.title}</h1>
                <p className="text-sm text-muted-foreground">{planData.ideaData.category}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* 视图切换 */}
              <div className="flex items-center space-x-1 p-1 bg-muted rounded-lg">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8 p-0"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8 p-0"
                >
                  <Grid className="w-4 h-4" />
                </Button>
              </div>

              {/* 工具按钮 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={isBookmarked ? 'text-yellow-500' : ''}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </Button>

              <Button variant="ghost" size="sm" onClick={onShare}>
                <Share2 className="w-4 h-4" />
              </Button>

              {/* 暗色模式切换 */}
              <div className="flex items-center space-x-2">
                <Sun className="w-4 h-4" />
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={setIsDarkMode}
                />
                <Moon className="w-4 h-4" />
              </div>

              {/* 导出按钮组 */}
              <div className="flex items-center space-x-1">
                <Button size="sm" onClick={() => onExport?.('pdf')} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Download className="w-4 h-4 mr-2" />
                  导出
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* 英雄区域 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 py-12"
        >
          <div className="space-y-4">
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium rounded-full">
              <Sparkles className="w-4 h-4 mr-2" />
              AI 生成的商业计划书
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent dark:from-white dark:via-blue-200 dark:to-purple-200">
              {planData.title}
            </h1>

            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {planData.ideaData.description}
            </p>

            <div className="flex items-center justify-center space-x-4">
              <Badge variant="outline" className="px-3 py-1">
                {planData.ideaData.category}
              </Badge>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm text-muted-foreground">
                最后更新: {planData.metadata.lastUpdated.toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* 快速行动按钮 */}
          <div className="flex items-center justify-center space-x-4">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25">
              <Eye className="w-5 h-5 mr-2" />
              开始阅读
            </Button>
            <Button variant="outline" size="lg">
              <Download className="w-5 h-5 mr-2" />
              快速导出
            </Button>
          </div>
        </motion.section>

        {/* 现代化统计卡片 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {statsData.map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group cursor-pointer"
            >
              <Card className={`${stat.bgColor} border-0 shadow-lg hover:shadow-xl transition-all duration-300`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-lg`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                  </div>

                  <div className="space-y-1">
                    <div className="text-2xl font-bold">
                      {stat.value}
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        {stat.suffix}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.section>

        {/* 阅读指南 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1 space-y-3">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                    智能阅读体验
                  </h3>

                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">1</span>
                      </div>
                      <div>
                        <p className="font-medium text-blue-800 dark:text-blue-200">核心速读</p>
                        <p className="text-blue-600 dark:text-blue-300">每章节 1-2 分钟，快速掌握关键信息</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">2</span>
                      </div>
                      <div>
                        <p className="font-medium text-blue-800 dark:text-blue-200">智能展开</p>
                        <p className="text-blue-600 dark:text-blue-300">点击感兴趣的章节查看详细分析</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">3</span>
                      </div>
                      <div>
                        <p className="font-medium text-blue-800 dark:text-blue-200">个性化导航</p>
                        <p className="text-blue-600 dark:text-blue-300">根据角色和需求推荐重点章节</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* 章节控制栏 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 space-x-0 sm:space-x-4"
        >
          <div>
            <h2 className="text-2xl font-bold mb-2">商业计划书内容</h2>
            <p className="text-muted-foreground">
              {planData.chapters.length} 个核心章节 • 约 {planData.metadata.totalReadingTime} 分钟阅读
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* 过滤器 */}
            <div className="flex items-center space-x-1 p-1 bg-muted rounded-lg">
              {['all', 'completed', 'pending'].map((filter) => (
                <Button
                  key={filter}
                  variant={activeFilter === filter ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveFilter(filter)}
                  className="text-xs"
                >
                  {filter === 'all' ? '全部' : filter === 'completed' ? '已完成' : '待完成'}
                </Button>
              ))}
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* 批量操作 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpandedChapters(new Set(planData.chapters.map(c => c.id)))}
            >
              展开全部
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpandedChapters(new Set())}
            >
              收起全部
            </Button>
          </div>
        </motion.section>

        {/* 章节列表 */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-6'}
        >
          <AnimatePresence>
            {planData.chapters.map((chapter, index) => (
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <ModernChapterDisplay
                  chapterData={chapter}
                  isExpanded={expandedChapters.has(chapter.id)}
                  onToggleExpansion={() => toggleChapterExpansion(chapter.id)}
                  viewMode={viewMode}
                  isDarkMode={isDarkMode}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.section>

        {/* 底部行动区 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-center py-12"
        >
          <Card className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 border-0 text-white">
            <CardContent className="p-8">
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <Star className="w-8 h-8 text-yellow-400 mr-2" />
                  <h3 className="text-2xl font-bold">商业计划书已生成完成</h3>
                </div>

                <p className="text-gray-300 max-w-2xl mx-auto">
                  您的 {planData.ideaData.title} 商业计划书已完成 {planData.metadata.completionRate}% 的内容生成。
                  现在可以导出使用，或继续完善详细内容。
                </p>

                <div className="flex items-center justify-center space-x-4 pt-4">
                  <Button size="lg" variant="secondary">
                    <Download className="w-5 h-5 mr-2" />
                    导出 PDF
                  </Button>
                  <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Share2 className="w-5 h-5 mr-2" />
                    分享计划书
                  </Button>
                  {planData.metadata.completionRate < 100 && (
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
                      <Target className="w-5 h-5 mr-2" />
                      完善内容
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>

      {/* 返回顶部按钮 */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white z-40"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <ArrowRight className="w-5 h-5 rotate-[-90deg]" />
      </motion.button>
    </div>
  )
}