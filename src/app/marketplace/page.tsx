'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'

import { Layout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Sparkles,
  Brain,
  DollarSign,
  Heart,
  TrendingUp,
  BookOpen,
  Lightbulb,
  Send,
  Rocket
} from 'lucide-react'

// AI 角色配置
const AI_PERSONAS = [
  {
    id: 'alex',
    name: '科技先锋艾克斯',
    avatar: '/avatars/alex.png',
    specialty: '架构评估、算法优化',
    personality: '理性、技术控',
    color: 'bg-blue-500',
    icon: Brain
  },
  {
    id: 'wang',
    name: '商业大亨老王',
    avatar: '/avatars/wang.png',
    specialty: '盈利模型、风险评估',
    personality: '结果导向',
    color: 'bg-green-500',
    icon: DollarSign
  },
  {
    id: 'lin',
    name: '文艺少女小琳',
    avatar: '/avatars/lin.png',
    specialty: '用户体验、品牌故事',
    personality: '情感共鸣',
    color: 'bg-pink-500',
    icon: Heart
  },
  {
    id: 'alan',
    name: '趋势达人阿伦',
    avatar: '/avatars/alan.png',
    specialty: '传播策略、热点预测',
    personality: '营销、社交',
    color: 'bg-purple-500',
    icon: TrendingUp
  },
  {
    id: 'prof',
    name: '学者教授李博',
    avatar: '/avatars/prof.png',
    specialty: '理论支撑、系统分析',
    personality: '严谨权威',
    color: 'bg-amber-500',
    icon: BookOpen
  }
]


export default function MarketplacePage() {

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <MarketplaceLobby />
        </div>
      </div>
    </Layout>
  )
}

// 市场大厅组件 - 重新设计为用户创意提交界面
function MarketplaceLobby() {
  const [ideaTitle, setIdeaTitle] = useState('')
  const [ideaDescription, setIdeaDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAIDiscussion, setShowAIDiscussion] = useState(false)
  const [submittedIdea, setSubmittedIdea] = useState<any>(null)


  const handleSubmitIdea = async () => {
    if (!ideaTitle.trim() || !ideaDescription.trim()) {
      alert('请填写完整的创意信息')
      return
    }

    setIsSubmitting(true)

    // 模拟提交处理
    setTimeout(() => {
      const ideaData = {
        id: 'idea_' + Date.now(),
        title: ideaTitle,
        description: ideaDescription,
        submittedAt: new Date()
      }

      setSubmittedIdea(ideaData)
      setShowAIDiscussion(true)
      setIsSubmitting(false)
    }, 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* 页面标题 */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            AI创意竞价中心
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            分享您的创意，与AI专家深度交流，获得专业评估和丰厚奖励
          </p>
        </motion.div>
      </div>

      {/* AI 专家团队展示 - 修复头像显示 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-12"
      >
        <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-blue-600" />
              五大 AI 专家随时待命
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              {AI_PERSONAS.map((persona, index) => (
                <motion.div
                  key={persona.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center group cursor-pointer"
                >
                  <div className={`w-20 h-20 rounded-full ${persona.color} flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform overflow-hidden border-4 border-white`}>
                    <img
                      src={persona.avatar}
                      alt={persona.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-sm">{persona.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{persona.specialty}</p>
                  <Badge variant="outline" className="mt-2 text-xs">{persona.personality}</Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* 主要创意提交表单 */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <motion.div
                  className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Lightbulb className="w-6 h-6 text-white" />
                </motion.div>
                分享您的创意想法
              </CardTitle>
              <p className="text-base text-muted-foreground">
                详细描述您的创意，AI专家将与您深度交流并进行专业评估
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* 创意标题 */}
              <div>
                <label className="text-base font-medium mb-3 block">
                  创意标题 ✨
                </label>
                <Input
                  value={ideaTitle}
                  onChange={(e) => setIdeaTitle(e.target.value)}
                  placeholder="为您的创意起一个吸引人的标题..."
                  className="text-lg p-4 border-2 border-slate-200 focus:border-purple-400 rounded-xl"
                  disabled={isSubmitting}
                />
              </div>


              {/* 创意描述 */}
              <div>
                <label className="text-base font-medium mb-3 block">
                  创意详细描述 🚀
                </label>
                <textarea
                  value={ideaDescription}
                  onChange={(e) => setIdeaDescription(e.target.value)}
                  placeholder="详细描述您的创意想法：

💡 核心概念和独特价值
🎯 目标用户或应用场景
🏆 预期效果和解决的问题
🛠️ 初步实现思路

字数越详细，AI专家的评估越精准！"
                  className="w-full min-h-[200px] text-base p-6 border-2 border-slate-200 focus:border-purple-400 rounded-2xl resize-none transition-all duration-300"
                  disabled={isSubmitting}
                />
                <div className="flex justify-between items-center mt-3">
                  <div className="text-sm text-muted-foreground">
                    当前字数: <span className="font-medium text-purple-600">{ideaDescription.length}</span> / 建议200字以上
                  </div>
                </div>
              </div>

              {/* 提交按钮 */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleSubmitIdea}
                  disabled={!ideaTitle.trim() || !ideaDescription.trim() || isSubmitting}
                  className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Brain className="w-5 h-5" />
                        </motion.div>
                        <span>正在启动AI评估...</span>
                      </>
                    ) : (
                      <>
                        <Rocket className="w-5 h-5" />
                        <span>开始AI专家评估</span>
                        <Send className="w-5 h-5" />
                      </>
                    )}
                  </div>
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 右侧流程说明 */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          {/* 流程说明 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">🎯 三阶段互动流程</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-4 rounded-lg bg-blue-50">
                  <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-blue-600 mb-2">阶段一：深度讨论</h3>
                  <p className="text-sm text-muted-foreground">与AI专家进行3轮深度问答<br />时长：10-12分钟</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-50">
                  <Gavel className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-green-600 mb-2">阶段二：激烈竞价</h3>
                  <p className="text-sm text-muted-foreground">观看AI角色实时竞价博弈<br />时长：18-22分钟</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-amber-50">
                  <Trophy className="w-8 h-8 text-amber-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-amber-600 mb-2">阶段三：丰厚奖励</h3>
                  <p className="text-sm text-muted-foreground">价格预测获得积分奖励<br />时长：4-6分钟</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 积分奖励说明 */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </motion.div>
                积分奖励系统
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { action: '创意分享', reward: '+10积分', icon: '📝' },
                { action: 'AI竞价成功', reward: '+50-500积分', icon: '💰' },
                { action: '高质量创意', reward: '额外奖励', icon: '🏆' },
                { action: '生成商业计划', reward: '专业指导', icon: '🚀' }
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm">{item.action}</span>
                  </div>
                  <span className="font-medium text-amber-600">{item.reward}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}

// 简化的AI讨论界面组件
function AIDiscussionInterface({ ideaData, onBackToSubmit }: {
  ideaData: any
  onBackToSubmit: () => void
}) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'system',
      content: `🎉 欢迎！您的创意"${ideaData.title}"已成功提交！`,
      timestamp: new Date()
    },
    {
      id: 2,
      type: 'ai',
      persona: 'alex',
      content: '各位专家好！我是艾克斯，从技术角度看，这个创意很有潜力...',
      timestamp: new Date()
    }
  ])
  const [userInput, setUserInput] = useState('')

  const handleSendMessage = () => {
    if (userInput.trim()) {
      const newMessage = {
        id: messages.length + 1,
        type: 'user',
        content: userInput,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, newMessage])
      setUserInput('')

      // 模拟AI回复
      setTimeout(() => {
        const aiReply = {
          id: messages.length + 2,
          type: 'ai',
          persona: 'wang',
          content: '老王认为这个商业价值需要进一步评估...',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, aiReply])
      }, 1500)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* 头部导航 */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBackToSubmit}>
          ← 重新提交创意
        </Button>
        <h1 className="text-2xl font-bold">AI专家深度讨论</h1>
        <div className="text-sm text-muted-foreground">
          创意: {ideaData.title}
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* 讨论区域 */}
        <Card className="lg:col-span-3 h-96 flex flex-col">
          <CardHeader>
            <CardTitle>💬 专家讨论进行中</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : message.type === 'system'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* 消息输入 */}
            <div className="flex gap-2">
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="与AI专家交流您的想法..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage} disabled={!userInput.trim()}>
                发送
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI专家面板 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">参与专家</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {AI_PERSONAS.slice(0, 3).map((persona) => (
              <div key={persona.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/20">
                <div className={`w-8 h-8 rounded-full ${persona.color} flex items-center justify-center overflow-hidden border-2 border-white`}>
                  <img
                    src={persona.avatar}
                    alt={persona.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{persona.name}</h4>
                  <p className="text-xs text-muted-foreground truncate">{persona.specialty}</p>
                </div>
                <Badge variant="outline" className="text-xs">讨论中</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

