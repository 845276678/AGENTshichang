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
    isGenerating,
    progress,
    startGeneration,
    stopGeneration,
    setProgress
  } = useBusinessPlanGeneration()

  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set())
  const [hasGenerated, setHasGenerated] = useState(false)

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
      startGeneration()
      setProgress(0)

      // 模拟生成过程
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            stopGeneration()
            setHasGenerated(true)
            return 100
          }
          return prev + 10
        })
      }, 500)
    } catch (error) {
      console.error('Generation failed:', error)
      stopGeneration()
    }
  }

  // 模拟完成的版本数据
  const mockCompletedVersions = hasGenerated ? [
    {
      id: 'stage-1',
      stageId: 'market-analysis',
      content: {
        title: '市场分析与机会',
        summary: 'AI教育市场正在快速增长，个性化学习需求强烈。市场规模超过500亿，年增长率达30%，技术成熟度高。',
        keyPoints: ['市场规模超过500亿人民币', '年增长率保持在30%以上', '技术成熟度已达商用水平', '用户付费意愿强烈'],
        coreContent: {
          summary: 'AI教育市场处于快速增长期，具有巨大潜力',
          keyPoints: ['市场规模大', '增长迅速', '技术成熟'],
          visualData: {
            metrics: [
              { label: '市场规模', value: '500亿+', trend: 'up' },
              { label: '年增长率', value: '30%', trend: 'up' },
              { label: '用户满意度', value: '85%', trend: 'stable' }
            ]
          },
          actionItems: ['深入调研目标用户群体', '分析竞争对手定位', '确定差异化优势']
        },
        expandableContent: {
          fullAnalysis: '中国AI教育市场正经历快速发展期。根据艾瑞咨询数据，2023年在线教育市场规模已达5000亿人民币...',
          detailedSections: [
            { title: '市场规模', content: '详细的市场规模分析...' },
            { title: '竞争态势', content: '主要竞争对手分析...' }
          ],
          references: ['艾瑞咨询报告2023', 'IDC教育科技报告']
        }
      }
    },
    {
      id: 'stage-2',
      stageId: 'product-strategy',
      content: {
        title: '产品策略',
        summary: '打造24/7智能学习助手，提供个性化辅导。核心功能包括智能答疑、学习路径规划、进度追踪等。',
        keyPoints: ['24/7在线答疑服务', '个性化学习路径', '智能进度追踪', '家长实时监控'],
        coreContent: {
          summary: '以AI技术为核心，提供全方位个性化学习服务',
          keyPoints: ['核心功能设计完善', '用户体验优先', '技术架构稳定'],
          visualData: {
            metrics: [
              { label: '核心功能', value: '8个', trend: 'up' },
              { label: '响应时间', value: '<2s', trend: 'up' },
              { label: '准确率', value: '92%', trend: 'up' }
            ]
          },
          actionItems: ['完成MVP功能开发', '用户体验测试', '技术架构优化']
        },
        expandableContent: {
          fullAnalysis: '产品将采用大语言模型作为核心技术，结合知识图谱和学习分析...',
          detailedSections: [
            { title: '核心功能', content: '智能答疑、路径规划等详细说明...' },
            { title: '技术选型', content: 'GPT-4、向量数据库等技术栈...' }
          ],
          references: ['教育AI技术白皮书', '用户需求调研报告']
        }
      }
    },
    {
      id: 'stage-3',
      stageId: 'business-model',
      content: {
        title: '商业模式',
        summary: 'SaaS订阅制+增值服务的混合模式。提供基础版、标准版、高级版三个层级，满足不同用户需求。',
        keyPoints: ['订阅制收入', '增值服务收费', '企业版授权', 'B2B2C模式'],
        coreContent: {
          summary: '多元化收入模式，确保可持续发展',
          keyPoints: ['订阅收入稳定', '增值空间大', '规模效应明显'],
          visualData: {
            metrics: [
              { label: 'ARPU', value: '¥199/月', trend: 'up' },
              { label: '续费率', value: '75%', trend: 'up' },
              { label: 'LTV/CAC', value: '3.5x', trend: 'up' }
            ]
          },
          actionItems: ['完善定价策略', '建立销售渠道', '优化转化漏斗']
        },
        expandableContent: {
          fullAnalysis: '采用三层订阅模式：基础版（¥99/月）、标准版（¥199/月）、高级版（¥399/月）...',
          detailedSections: [
            { title: '定价策略', content: '详细的定价层级说明...' },
            { title: '收入预测', content: '未来三年收入预测模型...' }
          ],
          references: ['SaaS定价策略分析', '教育行业付费意愿研究']
        }
      }
    }
  ] : []

  const completedVersions = mockCompletedVersions
  const overallProgress = progress
  const stages = [
    { id: 'stage-1', name: '市场分析' },
    { id: 'stage-2', name: '产品策略' },
    { id: 'stage-3', name: '商业模式' },
    { id: 'stage-4', name: '运营计划' },
    { id: 'stage-5', name: '财务规划' }
  ]

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