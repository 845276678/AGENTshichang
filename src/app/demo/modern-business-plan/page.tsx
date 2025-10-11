'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ModernBusinessPlan } from '@/components/business-plan/ModernBusinessPlan'
import { useBusinessPlanGeneration } from '@/stores/useBusinessPlanGeneration'
import {
  Play, FileText, Download, Eye, Sparkles, Zap,
  Target, Palette, Smartphone, Gauge
} from 'lucide-react'

// 模拟数据用于演示
const mockIdeaData = {
  id: 'demo-idea-001',
  title: 'AI智能学习助手',
  description: '基于大语言模型的个性化学习辅导系统，为学生提供24/7智能答疑和个性化学习路径规划，革新传统教育模式',
  category: '教育科技',
  tags: ['AI', '教育', 'SaaS', '个性化学习'],
  submittedBy: 'demo@example.com'
}

export default function ModernBusinessPlanDemo() {
  const {
    isGenerating,
    progress,
    startGeneration,
    stopGeneration,
    setProgress
  } = useBusinessPlanGeneration()

  const [showModernView, setShowModernView] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)

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
      }, 300)
    } catch (error) {
      console.error('Generation failed:', error)
      stopGeneration()
    }
  }

  // 模拟完成的章节数据
  const mockCompletedVersions = hasGenerated ? [
    {
      id: 'market-analysis',
      title: '市场分析与机会',
      completionProgress: 100,
      coreContent: {
        summary: 'AI教育市场正在快速增长，个性化学习需求强烈。随着人工智能技术的成熟和在线教育的普及，个性化智能学习助手成为了教育科技领域的重要发展方向。',
        keyPoints: [
          '全球AI教育市场规模超过500亿人民币，预计2025年将达到1000亿',
          '年复合增长率保持在30%以上，显示强劲的发展势头',
          '技术成熟度已达到商业化应用水平，用户接受度持续提升',
          '个性化学习需求迫切，传统教育模式难以满足差异化需求'
        ],
        visualData: {
          metrics: [
            { label: '市场规模', value: '500亿+', trend: 'up' },
            { label: '年增长率', value: '30%', trend: 'up' },
            { label: '技术成熟度', value: '8.5/10', trend: 'up' },
            { label: '用户满意度', value: '85%', trend: 'stable' }
          ]
        },
        actionItems: [
          '深入调研目标用户群体的具体学习痛点和需求',
          '分析主要竞争对手的产品定位和差异化策略',
          '确定产品的核心竞争优势和差异化价值主张',
          '建立用户反馈收集机制，持续优化产品方向'
        ]
      },
      expandedContent: {
        fullAnalysis: '中国AI教育市场正经历快速发展期。根据艾瑞咨询数据，2023年在线教育市场规模已达5000亿人民币，其中AI教育相关产品占比约10%。主要驱动因素包括：1）政策支持：国家大力推进教育信息化和智能化；2）技术进步：大语言模型、自然语言处理等技术日趋成熟；3）用户需求：个性化学习需求日益增长，传统标准化教育模式面临挑战。\n\n竞争格局方面，目前市场主要由大型互联网公司（如百度、腾讯、阿里）和专业教育公司（如好未来、新东方）主导。但在细分的AI学习助手领域，仍有较大的创新空间和差异化机会。\n\n用户画像分析显示，核心目标群体为K12学生及其家长，特别是一二线城市的中产家庭。这些用户对教育投入意愿强，对新技术接受度高，愿意为优质的个性化学习服务付费。',
        detailedSections: [
          {
            title: '市场规模与增长趋势',
            content: '全球AI教育市场预计将从2023年的37亿美元增长到2030年的208亿美元，复合年增长率为27.7%。中国作为最大的教育市场之一，AI教育细分领域增长尤为迅速。'
          },
          {
            title: '技术发展与应用现状',
            content: '当前AI教育技术主要应用于智能题库、个性化推荐、智能批改等场景。随着GPT等大语言模型的发展，AI学习助手的交互能力和理解能力显著提升。'
          },
          {
            title: '用户需求与行为分析',
            content: '调研显示，75%的家长希望孩子能获得更个性化的学习指导，68%的学生对AI学习助手持积极态度。主要需求包括：24/7可用性、个性化答疑、学习路径规划等。'
          }
        ],
        references: ['艾瑞咨询《2023年中国AI教育行业研究报告》', 'IDC《全球AI教育市场预测2023-2028》', '德勤《教育科技发展趋势报告》']
      },
      readingTime: {
        core: 3,
        expanded: 8
      }
    },
    {
      id: 'product-strategy',
      title: '产品策略与技术实现',
      completionProgress: 100,
      coreContent: {
        summary: '打造24/7智能学习助手，基于大语言模型提供个性化辅导。产品将采用模块化架构，支持多学科、多年级的学习需求，通过智能对话、学习路径规划、进度追踪等核心功能，为学生提供全方位的学习支持。',
        keyPoints: [
          '基于GPT-4等大语言模型，支持自然语言对话和智能答疑',
          '个性化学习路径规划，根据学生能力和进度动态调整',
          '多维度学习数据分析，提供详细的学习报告和建议',
          '跨平台支持，覆盖Web、移动端和微信小程序'
        ],
        visualData: {
          metrics: [
            { label: '核心功能模块', value: '8个', trend: 'up' },
            { label: '平均响应时间', value: '<2秒', trend: 'up' },
            { label: '答疑准确率', value: '92%', trend: 'up' },
            { label: '用户留存率', value: '78%', trend: 'up' }
          ]
        },
        actionItems: [
          '完成MVP核心功能开发，优先实现智能问答和学习规划',
          '建立用户测试体系，收集真实使用反馈进行产品迭代',
          '优化AI模型性能，提升答疑准确性和响应速度',
          '设计用户界面，确保学习体验友好且符合教育场景'
        ]
      },
      expandedContent: {
        fullAnalysis: '产品核心架构基于云原生设计，采用微服务架构确保系统的可扩展性和稳定性。前端采用React/Vue技术栈，后端使用Node.js/Python，数据库选择MongoDB/PostgreSQL混合方案。\n\nAI能力方面，将整合多个大语言模型API，包括GPT-4、文心一言、通义千问等，通过智能路由选择最适合的模型处理不同类型的问题。同时建立知识图谱和题库系统，增强答疑的准确性和专业性。\n\n产品功能规划分为三个阶段：1）MVP阶段：智能问答、基础学习规划；2）增强阶段：个性化推荐、学习报告、家长端；3）完善阶段：多人协作、直播课程、AI老师。',
        detailedSections: [
          {
            title: '技术架构设计',
            content: '采用云原生微服务架构，确保高可用性和可扩展性。前端使用React构建响应式界面，后端采用Node.js提供API服务，AI能力通过专门的Python服务提供。'
          },
          {
            title: 'AI能力建设',
            content: '集成多个大语言模型，建立领域专业知识库，开发智能问答、学习路径规划、个性化推荐等核心AI功能。预计AI模型准确率可达到92%以上。'
          },
          {
            title: '用户体验设计',
            content: '采用对话式交互，简化学习流程。支持语音输入，图片识别等多模态交互方式。界面设计考虑不同年龄段学生的使用习惯。'
          }
        ],
        references: ['《AI教育产品技术白皮书》', '《大语言模型教育应用指南》', '《用户体验设计最佳实践》']
      },
      readingTime: {
        core: 4,
        expanded: 10
      }
    },
    {
      id: 'business-model',
      title: '商业模式与收入规划',
      completionProgress: 100,
      coreContent: {
        summary: '采用SaaS订阅制为主、增值服务为辅的混合商业模式。提供基础版（免费）、标准版（199元/月）、高级版（399元/月）三个服务层级，满足不同用户需求。通过B2C直销和B2B2C合作两种渠道，预计第三年可实现盈利。',
        keyPoints: [
          '免费+付费订阅模式，降低用户试用门槛',
          '多层级定价策略，满足不同经济能力用户需求',
          'B2C和B2B2C双渠道策略，快速扩大用户规模',
          '增值服务包括一对一辅导、专属学习计划等'
        ],
        visualData: {
          metrics: [
            { label: '月度ARPU', value: '¥199', trend: 'up' },
            { label: '用户续费率', value: '75%', trend: 'up' },
            { label: 'LTV/CAC比值', value: '3.5x', trend: 'up' },
            { label: '预期盈利时间', value: '36个月', trend: 'stable' }
          ]
        },
        actionItems: [
          '完善定价策略，通过A/B测试优化各版本功能配置',
          '建立分销渠道合作体系，与学校、培训机构建立合作',
          '开发增值服务产品，提升用户粘性和客单价',
          '建立用户运营体系，提高续费率和推荐率'
        ]
      },
      expandedContent: {
        fullAnalysis: '商业模式设计基于教育SaaS的最佳实践，结合AI教育产品的特点。收入结构分为三部分：1）订阅收入（70%）：主要来自月度和年度订阅用户；2）增值服务（20%）：包括一对一辅导、定制化学习方案等；3）企业服务（10%）：为学校和培训机构提供定制化解决方案。\n\n成本结构主要包括：技术研发（40%）、市场营销（30%）、运营支持（20%）、基础设施（10%）。预计在用户规模达到10万付费用户时实现收支平衡。\n\n竞争策略方面，将通过差异化定位和优质服务建立竞争壁垒。重点关注产品质量、用户体验和服务响应速度，而非单纯的价格竞争。',
        detailedSections: [
          {
            title: '定价策略详解',
            content: '基础版免费提供基本问答功能，每日限制10次；标准版199元/月，提供无限问答和基础学习规划；高级版399元/月，增加个性化辅导和详细学习报告。'
          },
          {
            title: '市场推广计划',
            content: '采用内容营销+社交媒体+合作推广的组合策略。前期通过免费版吸引用户，中期通过优质内容建立品牌认知，后期通过口碑传播实现用户增长。'
          },
          {
            title: '财务预测模型',
            content: '预计第一年获得1万付费用户，第二年达到5万，第三年达到15万。月度流失率控制在8%以下，年度续费率达到75%以上。'
          }
        ],
        references: ['《SaaS商业模式设计指南》', '《教育行业付费意愿研究报告》', '《AI产品定价策略分析》']
      },
      readingTime: {
        core: 4,
        expanded: 12
      }
    }
  ] : []

  const completedVersions = mockCompletedVersions
  const overallProgress = progress
  const stages = [
    { id: 'stage-1', name: '市场分析', status: hasGenerated ? 'completed' : 'pending', progress: hasGenerated ? 100 : 0 },
    { id: 'stage-2', name: '产品策略', status: hasGenerated ? 'completed' : 'pending', progress: hasGenerated ? 100 : 0 },
    { id: 'stage-3', name: '商业模式', status: hasGenerated ? 'completed' : 'pending', progress: hasGenerated ? 100 : 0 },
    { id: 'stage-4', name: '运营计划', status: 'pending', progress: 0 },
    { id: 'stage-5', name: '财务规划', status: 'pending', progress: 0 }
  ]

  // 转换数据为现代化格式
  const mockPlanData = {
    title: `${mockIdeaData.title} 商业计划书`,
    ideaData: {
      title: mockIdeaData.title,
      category: mockIdeaData.category,
      description: mockIdeaData.description
    },
    chapters: completedVersions.length > 0 ? completedVersions : [],
    metadata: {
      totalPages: 8,
      totalReadingTime: 16,
      completionRate: Math.round((completedVersions.length / stages.length) * 100),
      lastUpdated: new Date()
    }
  }

  if (showModernView && completedVersions.length > 0) {
    return (
      <ModernBusinessPlan
        planData={mockPlanData}
        onExport={(format) => console.log('Export:', format)}
        onShare={() => console.log('Share')}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* 现代化页面头部 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 space-y-8"
        >
          <div className="space-y-4">
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <Sparkles className="w-4 h-4 mr-2" />
              现代化 UI 设计演示
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              商业计划书
            </h1>

            <h2 className="text-2xl md:text-3xl font-medium text-gray-600">
              现代化设计体验
            </h2>

            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              体验全新的现代化商业计划书界面设计，采用最新的设计语言和交互模式，
              为您带来更加流畅、美观、直观的阅读体验。
            </p>
          </div>

          {/* 特性卡片 */}
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: Palette,
                title: '现代视觉',
                description: '渐变色彩、玻璃拟态、微交互设计',
                color: 'from-pink-500 to-rose-500'
              },
              {
                icon: Zap,
                title: '流畅交互',
                description: '平滑动画、即时响应、手势支持',
                color: 'from-yellow-500 to-orange-500'
              },
              {
                icon: Smartphone,
                title: '响应式设计',
                description: '完美适配所有设备尺寸',
                color: 'from-green-500 to-emerald-500'
              },
              {
                icon: Gauge,
                title: '性能优化',
                description: '快速加载、内存友好、丝般顺滑',
                color: 'from-blue-500 to-cyan-500'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="group"
              >
                <Card className="text-center border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 演示状态卡片 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl mb-2 flex items-center">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mr-3">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    {mockIdeaData.title}
                  </CardTitle>
                  <p className="text-muted-foreground">
                    {mockIdeaData.description}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {mockIdeaData.category}
                  </Badge>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {mockIdeaData.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* 生成进度 */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">生成进度</h3>
                  <span className="text-2xl font-bold text-blue-600">
                    {Math.round(overallProgress)}%
                  </span>
                </div>

                <div className="relative">
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                      style={{ width: `${overallProgress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>已完成 {completedVersions.length} / {stages.length} 章节</span>
                    <span>
                      {overallProgress === 100 ? '生成完成' : `预计还需 ${Math.max(0, Math.round((100 - overallProgress) * 0.3))}分钟`}
                    </span>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex flex-col sm:flex-row gap-4">
                {completedVersions.length === 0 ? (
                  <Button
                    onClick={handleStartGeneration}
                    disabled={isGenerating}
                    size="lg"
                    className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    {isGenerating ? '正在生成...' : '开始生成演示'}
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => setShowModernView(true)}
                      size="lg"
                      className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25"
                    >
                      <Eye className="w-5 h-5 mr-2" />
                      体验现代化界面
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-12"
                      onClick={handleStartGeneration}
                      disabled={isGenerating}
                    >
                      <FileText className="w-5 h-5 mr-2" />
                      重新生成
                    </Button>
                  </>
                )}
              </div>

              {/* 设计亮点 */}
              {completedVersions.length > 0 && (
                <div className="pt-6 border-t border-gray-200">
                  <h4 className="font-semibold mb-4 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
                    现代化设计亮点
                  </h4>

                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                        <Palette className="w-4 h-4 text-white" />
                      </div>
                      <h5 className="font-medium">视觉设计</h5>
                      <p className="text-muted-foreground">
                        玻璃拟态效果、渐变背景、现代卡片设计
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      <h5 className="font-medium">交互体验</h5>
                      <p className="text-muted-foreground">
                        流畅动画、微交互、悬浮效果、手势操作
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                        <Target className="w-4 h-4 text-white" />
                      </div>
                      <h5 className="font-medium">功能升级</h5>
                      <p className="text-muted-foreground">
                        智能导航、暗黑模式、视图切换、快捷操作
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.section>

        {/* 生成状态指示器 */}
        {isGenerating && (
          <motion.section
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 w-80">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                  </motion.div>

                  <div className="flex-1">
                    <p className="font-medium text-gray-900">AI 正在生成内容</p>
                    <p className="text-sm text-muted-foreground">
                      {Math.round(overallProgress)}% 完成
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>
        )}

        {/* 底部说明 */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center pt-16 pb-8"
        >
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            这是商业计划书现代化界面设计的演示页面。新的设计采用了最新的 UI/UX 趋势，
            包括玻璃拟态效果、流畅动画、智能交互等现代设计元素，为用户带来更加优雅和高效的使用体验。
          </p>
        </motion.section>
      </div>
    </div>
  )
}