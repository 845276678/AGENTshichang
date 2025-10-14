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
          text: `中国AI教育市场正处于快速发展期，呈现出巨大的增长潜力。根据最新行业数据显示，整体市场规模已突破500亿人民币大关，并保持着年均30%以上的强劲增长势头。

技术成熟度方面，随着GPT-4、文心一言等大语言模型的快速发展，AI在教育领域的应用已从概念验证阶段进入实际商业化部署阶段。用户对个性化学习的需求日益迫切，传统标准化教育模式已难以满足差异化的学习需求。

市场调研显示，一二线城市中产家庭对AI学习助手的接受度达到68%，其中75%的家长表示愿意为优质的个性化学习服务付费。这为AI学习助手产品提供了坚实的市场基础和广阔的发展空间。`,
          wordCount: 180,
          visualElements: {
            metrics: [
              { label: '市场规模', value: '500亿+', color: 'blue' },
              { label: '年增长率', value: '30%', color: 'green' },
              { label: '用户接受度', value: '68%', color: 'purple' },
              { label: '付费意愿', value: '75%', color: 'orange' }
            ]
          },
          actionItems: [
            '深入调研目标用户群体的具体学习需求和痛点',
            '分析主要竞争对手的产品定位和差异化策略',
            '确定产品的核心竞争优势和价值主张'
          ]
        },
        expandableContent: {
          estimatedReadTime: 5,
          sections: [
            {
              title: '市场规模与增长趋势',
              content: `全球AI教育市场预计将从2023年的37亿美元增长到2030年的208亿美元，复合年增长率为27.7%。中国作为全球最大的教育市场之一，AI教育细分领域的增长尤为迅速。

驱动因素包括：
1. 政策支持：国家大力推进教育信息化和智能化发展
2. 技术成熟：大语言模型、自然语言处理等核心技术日趋完善
3. 需求增长：个性化学习需求持续增长，传统教育模式面临转型压力

目前市场主要集中在K12教育领域，占整体AI教育市场的60%以上。成人教育和职业培训领域也显示出强劲的增长潜力。`
            },
            {
              title: '竞争格局分析',
              content: `当前市场主要由大型互联网公司（百度、腾讯、阿里巴巴）和专业教育公司（好未来、新东方、网易有道）主导。但在AI学习助手这一细分领域，仍存在较大的创新空间。

主要竞争优势来源：
- 技术实力：AI模型性能和教育场景适配能力
- 内容质量：教学内容的专业性和个性化程度
- 用户体验：产品易用性和学习效果
- 品牌口碑：用户满意度和推荐率

新进入者可通过垂直细分和差异化定位找到市场机会。`
            }
          ]
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
          text: `AI智能学习助手将基于先进的大语言模型技术，为学生提供全天候的个性化学习支持服务。产品核心围绕三大功能模块展开：智能问答系统、个性化学习规划和学习数据分析。

智能问答系统支持自然语言交互，能够理解学生的问题并提供准确、易懂的解答。个性化学习规划根据学生的学习能力、进度和偏好，动态调整学习路径和内容推荐。

产品将采用云原生架构，支持Web、移动端和小程序多平台访问。通过持续的机器学习优化，系统将不断提升答疑准确性和个性化推荐效果，为每个学生打造专属的AI学习伙伴。`,
          wordCount: 165,
          visualElements: {
            metrics: [
              { label: '响应时间', value: '<2秒', color: 'green' },
              { label: '答疑准确率', value: '92%', color: 'blue' },
              { label: '支持平台', value: '3个', color: 'purple' },
              { label: '功能模块', value: '8个', color: 'orange' }
            ]
          },
          actionItems: [
            '完成MVP核心功能开发和测试',
            '建立用户反馈收集和产品迭代机制',
            '优化AI模型在教育场景下的表现'
          ]
        },
        expandableContent: {
          estimatedReadTime: 6,
          sections: [
            {
              title: '技术架构设计',
              content: `采用云原生微服务架构，确保系统的高可用性和可扩展性。技术栈选择考虑了性能、稳定性和开发效率：

前端技术：
- Web端：React + TypeScript + Vite
- 移动端：React Native + Expo
- 小程序：原生微信小程序

后端技术：
- API服务：Node.js + Express + TypeScript
- AI服务：Python + FastAPI + LangChain
- 数据库：PostgreSQL + Redis + MongoDB

AI能力集成多个大语言模型API，包括GPT-4、文心一言、通义千问等，通过智能路由选择最适合的模型处理不同类型的问题。`
            },
            {
              title: '核心功能详解',
              content: `1. 智能问答系统
- 支持文本、语音、图片等多模态输入
- 涵盖数学、英语、物理、化学等主要学科
- 提供步骤化解答和知识点解释

2. 个性化学习规划
- 基于学习能力评估制定个性化计划
- 动态调整学习节奏和难度
- 推荐最适合的学习资源和练习题

3. 学习数据分析
- 跟踪学习进度和知识掌握情况
- 生成详细的学习报告
- 为家长提供学习状况总览`
            }
          ]
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
          text: `采用"免费试用+付费订阅+增值服务"的三层商业模式，最大化用户价值和商业收益。基础版免费提供核心问答功能，吸引用户试用；标准版199元/月提供完整功能体验；高级版399元/月增加专属服务和高级功能。

收入结构预计为：订阅收入占70%，增值服务占20%，企业合作占10%。通过B2C直销和B2B2C合作双渠道策略，快速扩大用户规模。预计在第36个月实现盈亏平衡，第5年达到年收入1亿元规模。

定价策略充分考虑了用户支付能力和市场竞争情况，通过差异化服务满足不同用户群体的需求，建立可持续的商业模式。`,
          wordCount: 155,
          visualElements: {
            metrics: [
              { label: 'ARPU值', value: '¥199', color: 'green' },
              { label: '续费率', value: '75%', color: 'blue' },
              { label: 'LTV/CAC', value: '3.5x', color: 'purple' },
              { label: '盈利周期', value: '36月', color: 'orange' }
            ]
          },
          actionItems: [
            '完善各版本功能配置和定价策略',
            '建立用户运营体系提升续费率',
            '开发B2B合作渠道和企业解决方案'
          ]
        },
        expandableContent: {
          estimatedReadTime: 7,
          sections: [
            {
              title: '定价策略详解',
              content: `三层定价结构设计：

基础版（免费）：
- 每日10次智能问答
- 基础学习报告
- 社区支持

标准版（¥199/月）：
- 无限次智能问答
- 个性化学习规划
- 详细学习分析
- 优先客服支持

高级版（¥399/月）：
- 标准版全部功能
- 一对一专属辅导
- 家长深度报告
- VIP客服通道
- 定制学习方案

定价参考了市场同类产品和用户调研结果，确保在保持竞争力的同时实现合理的利润率。`
            },
            {
              title: '收入预测模型',
              content: `基于保守估计的用户增长和付费转化率：

第1年：
- 注册用户：5万
- 付费用户：5千（10%转化率）
- 月度收入：100万元

第2年：
- 注册用户：20万
- 付费用户：3万（15%转化率）
- 月度收入：600万元

第3年：
- 注册用户：50万
- 付费用户：10万（20%转化率）
- 月度收入：2000万元

关键假设：月流失率8%，年续费率75%，客户获取成本150元/人。`
            }
          ]
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
                  简化版创意实现建议演示
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
                点击"开始生成"按钮，体验AI智能生成简化版创意实现建议
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
                  <h4 className="font-medium text-blue-900">正在生成创意实现建议...</h4>
                  <p className="text-sm text-blue-700">
                    AI正在分析您的创意并生成个性化的创意实现建议内容
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
            这是创意实现建议简化版功能的演示页面。在实际使用中，用户可以先进行需求收集，
            然后AI会根据个人需求生成定制化的简化版创意实现建议。
          </p>
        </div>
      </div>
    </div>
  )
}