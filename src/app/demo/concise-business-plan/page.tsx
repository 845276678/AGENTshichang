'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui'
import { ConciseChaptersList } from '@/components/business-plan/ConciseChapterView'
import { useBusinessPlanGeneration } from '@/stores/useBusinessPlanGeneration'
import { Play, FileText, Download, Eye } from 'lucide-react'

// 模拟数据用于演示
const mockIdeaData = {
  id: 'demo-idea-001',
  title: 'AI智能学习助手',
  description: '基于大语言模型的个性化学习辅导系统，为学生提供24/7智能答疑和个性化学习路径规划',
  category: '教育科技',
  tags: ['AI', '教育', 'SaaS', '个性化学习'],
  submittedBy: 'demo@example.com'
}

export default function ConciseBusinessPlanDemo() {
  const {
    stages,
    setIdeaData,
    startGeneration,
    isGenerating,
    overallProgress,
    selectedVersions
  } = useBusinessPlanGeneration()

  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set())

  useEffect(() => {
    setIdeaData(mockIdeaData)
  }, [setIdeaData])

  const handleToggleChapter = (stageId: string) => {
    const newExpanded = new Set(expandedChapters)
    if (newExpanded.has(stageId)) {
      newExpanded.delete(stageId)
    } else {
      newExpanded.add(stageId)
    }
    setExpandedChapters(newExpanded)
  }

  const handleStartGeneration = async () => {
    try {
      await startGeneration()
    } catch (error) {
      console.error('Generation failed:', error)
    }
  }

  // 获取有版本的章节
  const completedVersions = stages
    .filter(stage => stage.versions.length > 0)
    .map(stage => {
      const versionId = selectedVersions[stage.id] || stage.versions[0]?.id
      return stage.versions.find(v => v.id === versionId) || stage.versions[0]
    })
    .filter(Boolean)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto p-6">
        {/* 页面头部 */}
        <Card className="mb-8 border-primary/20 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl mb-2">
                  简化版商业计划书演示
                </CardTitle>
                <p className="text-muted-foreground">
                  体验新的一页一章节设计，核心内容一目了然，支持按需展开详细分析
                </p>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                DEMO
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h3 className="font-medium text-base">演示创意</h3>
                <div className="space-y-1 text-sm">
                  <div><strong>项目：</strong>{mockIdeaData.title}</div>
                  <div><strong>领域：</strong>{mockIdeaData.category}</div>
                  <div className="flex gap-1 flex-wrap">
                    {mockIdeaData.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-base">生成进度</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>整体进度</span>
                    <span>{Math.round(overallProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    已完成 {completedVersions.length} / {stages.length} 个章节
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-base">操作控制</h3>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={handleStartGeneration}
                    disabled={isGenerating}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    {isGenerating ? '生成中...' : '开始生成'}
                  </Button>
                  {completedVersions.length > 0 && (
                    <>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        预览
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        导出
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 功能特性说明 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">简化版特性</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-medium">一页一章节</h4>
                <p className="text-sm text-muted-foreground">
                  每个章节控制在500-650字，核心内容清晰呈现
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
                  <Eye className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-medium">可视化元素</h4>
                <p className="text-sm text-muted-foreground">
                  关键指标卡片、图表元素，信息一目了然
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto">
                  <Download className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-medium">按需展开</h4>
                <p className="text-sm text-muted-foreground">
                  支持展开查看详细分析，灵活控制信息深度
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 章节展示 */}
        {completedVersions.length > 0 ? (
          <ConciseChaptersList
            versions={completedVersions}
            expandedChapters={expandedChapters}
            onToggleChapter={handleToggleChapter}
            showOverview={true}
          />
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">还没有生成的章节</h3>
              <p className="text-muted-foreground mb-6">
                点击"开始生成"按钮，体验AI智能生成简化版商业计划书
              </p>
              <Button onClick={handleStartGeneration} disabled={isGenerating}>
                <Play className="w-4 h-4 mr-2" />
                {isGenerating ? '正在生成...' : '开始生成演示'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 生成状态显示 */}
        {isGenerating && (
          <Card className="mt-6 border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-blue-900">正在生成商业计划书...</h4>
                  <p className="text-sm text-blue-700">
                    AI正在分析您的创意并生成个性化的商业计划书内容
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(overallProgress)}%
                  </div>
                  <div className="text-xs text-blue-600">
                    预计还需 {Math.max(0, Math.round((100 - overallProgress) * 0.5))}分钟
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 底部信息 */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            这是商业计划书简化版功能的演示页面。在实际使用中，用户可以先进行需求收集，
            然后AI会根据个人需求生成定制化的简化版商业计划书。
          </p>
        </div>
      </div>
    </div>
  )
}