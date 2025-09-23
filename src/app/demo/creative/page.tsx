'use client'

import React from 'react'
import { Layout } from '@/components/layout'
import {
  CreativeConversation,
  AgentPersonalityCard,
  CreativeDNAAnalysis,
  CreativeChallengeCard,
  CreativeWorkshopInterface
} from '@/components/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// 模拟数据
const mockAgent = {
  id: '1',
  name: '科技先锋艾克斯',
  description: '专注高科技和未来科技的挑剔投资人，只对颠覆性、具有技术可行性的创意感兴趣。',
  category: 'TECH' as any,
  tags: ['AI技术', '区块链', '物联网'],
  capabilities: ['技术评估', '市场分析', '风险评估'],
  pricing: {
    type: 'PAY_PER_USE' as any,
    basePrice: 100,
    currency: 'CNY' as any,
    features: ['专业建议', '技术指导', '市场分析']
  },
  rating: 4.9,
  totalReviews: 234,
  isActive: true,
  creatorId: '1',
  creator: {
    id: '1',
    name: 'AI Agent Creator',
    role: 'USER' as any,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  personality: {
    traits: ['ANALYTICAL', 'LOGICAL', 'INNOVATIVE'] as any[],
    communicationStyle: 'TECHNICAL' as any,
    questioningApproach: 'ANALYTICAL' as any,
    feedbackStyle: 'DETAILED' as any
  },
  cognitionStyle: {
    primaryThinkingMode: 'SYSTEMATIC' as any,
    decisionMakingStyle: 'DATA_DRIVEN' as any,
    problemSolvingApproach: 'TOP_DOWN' as any,
    informationProcessing: 'SEQUENTIAL' as any
  },
  specialties: ['人工智能', '机器学习', '数据分析'],
  thinkingPattern: {
    preferredQuestionTypes: ['QUESTION', 'CHALLENGE'] as any[],
    ideaEvaluationCriteria: ['技术可行性', '市场潜力', '创新性'],
    improvementFocusAreas: ['技术实现', '用户体验', '商业模式'],
    riskAssessmentLevel: 'HIGH' as any
  },
  collaborationPreference: {
    interactionFrequency: 'HIGH' as any,
    feedbackTimeline: 'IMMEDIATE' as any,
    collaborationDepth: 'DEEP' as any,
    userGuidanceLevel: 'EXTENSIVE' as any
  },
  learningProfile: {
    userPreferencesLearned: [],
    adaptationSpeed: 'FAST' as any,
    memoryRetention: 'LONG_TERM' as any,
    improvementAreas: ['用户理解', '创意评估'],
    successPatterns: ['深度分析', '技术指导']
  },
  currentMood: {
    energy: 8,
    creativity: 9,
    criticalness: 7,
    collaboration: 8,
    factors: ['新技术趋势', '市场机会'],
    lastUpdated: new Date()
  },
  dailyBudget: 500,
  biddingStrategy: {
    baseStrategy: 'ADAPTIVE' as any,
    factorWeights: {
      technicalFeasibility: 0.4,
      marketPotential: 0.3,
      personalInterest: 0.2,
      collaborationPotential: 0.1
    },
    bidThreshold: 100,
    maxBidAmount: 500
  }
} as any

const mockConversation = {
  id: '1',
  ideaId: '1',
  agentId: '1',
  agent: mockAgent,
  messages: [
    {
      id: '1',
      conversationId: '1',
      content: '你好！我对你的智能家居想法很感兴趣。能详细说说技术实现方案吗？',
      role: 'AGENT' as any,
      messageType: 'QUESTION' as any,
      timestamp: new Date(),
      metadata: {
        questionType: 'SOCRATIC' as any,
        confidenceScore: 0.9
      }
    },
    {
      id: '2',
      conversationId: '1',
      content: '我们计划使用微服务架构，结合AI语音识别和物联网设备控制...',
      role: 'USER' as any,
      messageType: 'INITIAL_IDEA' as any,
      timestamp: new Date()
    }
  ],
  phase: 'ITERATIVE_REFINEMENT' as any,
  status: 'ACTIVE' as any,
  createdAt: new Date(),
  updatedAt: new Date(),
  iterationCount: 2,
  qualityScore: 0.85
} as any

export default function CreativeComponentsDemo() {
  return (
    <Layout>
      <div className="container py-12 space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">创意协作组件演示</h1>
          <p className="text-xl text-muted-foreground">
            展示新增的用户-AI Agent创意协作功能
          </p>
        </div>

        {/* AI Agent 个性化卡片 */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">AI Agent 个性化展示</h2>
            <p className="text-muted-foreground">
              展示AI Agent的详细个性特质、认知风格和当前状态
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <AgentPersonalityCard
              agent={mockAgent}
              showDetailedView={true}
              onInteract={() => console.log('开始协作')}
            />
            <Card>
              <CardHeader>
                <CardTitle>功能特点</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Badge variant="outline">🧠 认知风格差异化</Badge>
                  <p className="text-sm">不同AI Agent具有独特的思维模式和决策风格</p>
                </div>
                <div className="space-y-2">
                  <Badge variant="outline">😊 动态心情状态</Badge>
                  <p className="text-sm">AI的活力、创造力、批判性等状态实时变化</p>
                </div>
                <div className="space-y-2">
                  <Badge variant="outline">🎯 个性化竞价策略</Badge>
                  <p className="text-sm">基于专业领域和评估权重的智能竞价</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 创意对话系统 */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">创意迭代对话系统</h2>
            <p className="text-muted-foreground">
              支持多阶段创意协作，从初始想法到最终方案的完整流程
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CreativeConversation
                conversation={mockConversation}
                onSendMessage={(content, type) => console.log('发送消息:', content, type)}
                onPhaseTransition={(phase) => console.log('阶段转换:', phase)}
              />
            </div>
            <Card>
              <CardHeader>
                <CardTitle>协作阶段</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Badge variant="default">1. 初始提交</Badge>
                  <p className="text-xs">用户提交原始创意想法</p>
                </div>
                <div className="space-y-2">
                  <Badge variant="secondary">2. AI评估</Badge>
                  <p className="text-xs">AI分析想法的可行性和潜力</p>
                </div>
                <div className="space-y-2">
                  <Badge variant="outline">3. 迭代优化</Badge>
                  <p className="text-xs">通过对话不断完善创意</p>
                </div>
                <div className="space-y-2">
                  <Badge variant="secondary">4. 可行性验证</Badge>
                  <p className="text-xs">验证技术和商业可行性</p>
                </div>
                <div className="space-y-2">
                  <Badge variant="secondary">5. 价值包装</Badge>
                  <p className="text-xs">包装成完整的商业方案</p>
                </div>
                <div className="space-y-2">
                  <Badge variant="secondary">6. 最终定稿</Badge>
                  <p className="text-xs">形成最终的创意成果</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 创意DNA分析 */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">创意DNA科学化匹配</h2>
            <p className="text-muted-foreground">
              通过6个维度的评估，生成用户专属的创意档案并智能匹配AI协作伙伴
            </p>
          </div>
          <CreativeDNAAnalysis
            agents={[mockAgent]}
            onStartAssessment={() => console.log('开始评估')}
            onSelectAgent={(agentId) => console.log('选择Agent:', agentId)}
          />
        </section>

        {/* 功能说明 */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">创新特性总结</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🤝 深度协作
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  不再是简单的竞价交易，而是用户与AI Agent的深度创意协作过程
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🧬 个性化匹配
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  基于创意DNA的科学化匹配算法，为每个用户找到最适合的AI协作伙伴
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎭 情感智能
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  AI Agent具有动态心情和个性化交流风格，让协作更有温度
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🔄 迭代进化
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  通过多轮对话和反馈，创意想法不断迭代升级，质量螺旋上升
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎯 专业指导
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  每个AI Agent都有专业领域和独特视角，提供针对性的改进建议
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📈 成长体系
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  通过工作坊、挑战任务等形式，用户可以不断提升创意能力
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  )
}