'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layout } from '@/components/layout'
import { useAuth } from '@/contexts/AuthContext'
import { useSubmissionLimit } from '@/hooks/useSubmissionLimit'
import { SubmissionStatus } from '@/components/submission/SubmissionStatus'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Lightbulb,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
  ArrowRight,
  Brain,
  Rocket,
  Target,
  Star,
  Heart,
  Coffee,
  Palette,
  BookOpen,
  Gamepad2,
  Atom,
  TreePine,
  Puzzle,
  Coins,
  CheckCircle,
  MessageCircle
} from 'lucide-react'

export default function SubmitIdeaPage() {
  const { user, isAuthenticated } = useAuth()
  const {
    canSubmitIdea,
    hasFreeSlotsAvailable,
    nextSubmissionCost,
    remainingFreeSubmissions
  } = useSubmissionLimit()

  // 基础表单状态
  const [idea, setIdea] = useState('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [ideaScore, setIdeaScore] = useState(0)

  // 竞价系统状态
  const [currentPhase, setCurrentPhase] = useState<'input' | 'bidding' | 'discussion' | 'completed'>('input')
  const [biddingActive, setBiddingActive] = useState(false)
  const [activeAgent, setActiveAgent] = useState(0)
  const [agents, setAgents] = useState([])
  const [highestBid, setHighestBid] = useState(0)
  const [leadingAgent, setLeadingAgent] = useState<string | null>(null)

  // 讨论系统状态
  const [discussionRound, setDiscussionRound] = useState(0)
  const [maxDiscussionRounds] = useState(3)
  const [discussionMessages, setDiscussionMessages] = useState<any[]>([])
  const [userMessage, setUserMessage] = useState('')
  const [isDiscussing, setIsDiscussing] = useState(false)

  // 提交状态
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [submissionResult, setSubmissionResult] = useState<{
    cost: number;
    isFree: boolean;
    earnedCredits: number;
    ideaId: string;
  } | null>(null)

  // 创意评分算法
  useEffect(() => {
    const calculateScore = () => {
      let score = 0
      if (title.length > 5) {score += 20}
      if (idea.length > 100) {score += 30}
      if (idea.length > 300) {score += 20}
      if (idea.length > 500) {score += 20} // 替代分类加分
      if (idea.includes('创新') || idea.includes('独特')) {score += 10}
      return Math.min(score, 100)
    }
    setIdeaScore(calculateScore())
  }, [title, idea])

  // AI投资者轮换 - 只在输入阶段使用
  useEffect(() => {
    if (currentPhase !== 'input') return

    const interval = setInterval(() => {
      setActiveAgent((prev) => (prev + 1) % agentReactions.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [currentPhase])

  // 初始化Agents状态
  useEffect(() => {
    const initializedAgents = agentReactions.map(agent => ({
      ...agent,
      currentBid: 0,
      confidence: Math.min(ideaScore * (Math.random() * 0.2 + 0.8), 95)
    }))
    setAgents(initializedAgents)
  }, [ideaScore])

  // 启动竞价流程
  const startBidding = () => {
    if (!title || !idea || idea.length < 50) {
      alert('请完整填写创意标题和详细描述（至少50字）后再启动竞价')
      return
    }

    setCurrentPhase('bidding')
    setBiddingActive(true)

    // 模拟实时竞价过程
    simulateRealTimeBidding()
  }

  // 模拟实时竞价
  const simulateRealTimeBidding = async () => {
    const biddingRounds = 8 // 8轮竞价
    const baseDelay = 800

    for (let round = 0; round < biddingRounds; round++) {
      await new Promise(resolve => setTimeout(resolve, baseDelay + Math.random() * 400))

      // 每轮随机选择几个Agent出价
      const activeAgentsCount = Math.floor(Math.random() * 3) + 2 // 2-4个Agent参与
      const participatingAgents = [...agentReactions]
        .sort(() => 0.5 - Math.random())
        .slice(0, activeAgentsCount)

      const newAgents = [...agents]
      let roundHighestBid = highestBid
      let roundLeadingAgent = leadingAgent

      participatingAgents.forEach(agent => {
        const agentIndex = agentReactions.findIndex(a => a.id === agent.id)
        const currentBid = calculateAgentBid(agent, ideaScore, round)

        newAgents[agentIndex] = {
          ...newAgents[agentIndex],
          currentBid,
          confidence: Math.min(currentBid / 10, 95)
        }

        if (currentBid > roundHighestBid) {
          roundHighestBid = currentBid
          roundLeadingAgent = agent.id
        }
      })

      setAgents(newAgents)
      setHighestBid(roundHighestBid)
      setLeadingAgent(roundLeadingAgent)
    }

    // 竞价结束
    setTimeout(() => {
      setBiddingActive(false)
      setCurrentPhase('discussion')
    }, 1500)
  }

  // 计算Agent出价
  const calculateAgentBid = (agent: any, score: number, round: number) => {
    const baseScore = score

    // 根据创意内容分析专业领域匹配度
    const specialtyMultipliers = {
      business: idea.includes('商业') || idea.includes('盈利') || idea.includes('市场') ? 1.3 : 1.0,
      artistic: idea.includes('艺术') || idea.includes('创作') || idea.includes('设计') ? 1.3 : 1.0,
      tech: idea.includes('技术') || idea.includes('科技') || idea.includes('AI') || idea.includes('软件') ? 1.3 : 1.0,
      trend: idea.includes('社交') || idea.includes('流行') || idea.includes('网红') || idea.includes('营销') ? 1.3 : 1.0,
      academic: idea.includes('研究') || idea.includes('教育') || idea.includes('学术') || idea.includes('理论') ? 1.3 : 1.0,
    }

    const specialtyBonus = specialtyMultipliers[agent.specialty] || 1.0
    const roundMultiplier = 1 + (round * 0.05) // 每轮递增5%
    const randomFactor = 0.8 + Math.random() * 0.4 // 0.8-1.2的随机因子

    return Math.round(baseScore * specialtyBonus * roundMultiplier * randomFactor * 8) // 转换为积分
  }

  // 开始讨论
  const startDiscussion = async (message: string) => {
    if (!message.trim()) return

    setIsDiscussing(true)
    const newRound = discussionRound + 1

    // 添加用户消息
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: message.trim(),
      round: newRound,
      timestamp: new Date()
    }

    setDiscussionMessages(prev => [...prev, userMsg])
    setUserMessage('')

    try {
      // 调用AI进行讨论回复
      const leadingAgentData = agentReactions.find(a => a.id === leadingAgent)
      const response = await generateAIResponse(message, leadingAgentData, newRound)

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        agentId: leadingAgent,
        agentName: leadingAgentData?.name,
        content: response.content,
        suggestions: response.suggestions,
        round: newRound,
        timestamp: new Date()
      }

      setDiscussionMessages(prev => [...prev, aiMsg])
      setDiscussionRound(newRound)

      // 检查是否完成讨论
      if (newRound >= maxDiscussionRounds) {
        setTimeout(() => {
          setCurrentPhase('completed')
        }, 1000)
      }
    } catch (error) {
      console.error('Discussion failed:', error)
      alert('讨论失败，请重试')
    } finally {
      setIsDiscussing(false)
    }
  }

  // 生成AI回复
  const generateAIResponse = async (userMessage: string, agent: any, round: number) => {
    // 这里应该调用真实的AI服务
    // 现在先返回模拟回复
    const responses = {
      wang: [
        "从商业角度看，这个创意的盈利模式需要进一步明确。建议考虑订阅制或者freemium模式。",
        "市场定位很重要，我们需要找到明确的目标用户群体。你觉得主要面向B端还是C端？",
        "不错的想法！我建议做个简单的MVP来验证市场需求，这样可以降低初期投资风险。"
      ],
      lin: [
        "这个创意很有想象力！我觉得可以在视觉设计上加入更多情感元素，让用户产生共鸣。",
        "从美学角度来说，界面的配色和布局可以更加注重用户的情感体验。",
        "很棒的创意！建议加入一些互动性的元素，让用户在使用过程中感受到乐趣。"
      ],
      alex: [
        "技术实现上这个想法是可行的。我建议使用云原生架构来确保可扩展性。",
        "从技术角度看，我们可以考虑使用AI来优化用户体验，比如智能推荐算法。",
        "不错的技术思路！建议在架构设计时考虑微服务模式，这样便于后期维护和扩展。"
      ],
      allen: [
        "这个创意很有传播潜力！建议在社交媒体上制造话题，可能会成为爆款。",
        "从营销角度看，我们需要找到这个创意的独特卖点，让它在众多产品中脱颖而出。",
        "很有市场前景！建议结合当前的热点趋势，比如短视频、直播等形式来推广。"
      ],
      li: [
        "从学术角度分析，这个创意的理论基础需要更加扎实。建议参考相关的研究文献。",
        "理论框架很重要，我建议构建一个完整的概念模型来支撑这个创意。",
        "不错的想法！但需要更严谨的逻辑论证，建议从第一性原理开始推导。"
      ]
    }

    const agentResponses = responses[agent?.id] || responses.alex
    const randomResponse = agentResponses[Math.floor(Math.random() * agentResponses.length)]

    return {
      content: randomResponse,
      suggestions: [
        "进一步细化实现方案",
        "考虑用户反馈机制",
        "评估技术可行性",
        "制定推广策略"
      ].slice(0, 2) // 随机返回2个建议
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated) {
      alert('请先登录后再提交创意')
      return
    }

    const userCredits = user?.credits || 0
    const submissionCheck = canSubmitIdea(userCredits)

    if (!submissionCheck.canSubmit) {
      alert(submissionCheck.reason || '无法提交创意')
      return
    }

    // 确认付费提交
    if (!submissionCheck.isFree) {
      const confirmPay = confirm(
        `提交此创意需要消耗 ${submissionCheck.cost} 积分，确认继续吗？\n\n` +
        `当前积分：${userCredits}\n` +
        `提交后剩余：${userCredits - submissionCheck.cost} 积分`
      )
      if (!confirmPay) {
        return
      }
    }

    setIsSubmitting(true)
    setCurrentStep(1)

    // 模拟AI评估过程
    const steps = [
      { delay: 500, step: 1, message: '正在分析创意内容...' },
      { delay: 1500, step: 2, message: 'AI投资者正在评估...' },
      { delay: 2500, step: 3, message: '计算市场潜力...' },
      { delay: 3500, step: 4, message: '生成评估报告...' }
    ]

    for (const { delay, step } of steps) {
      setTimeout(() => setCurrentStep(step), delay)
    }

    setTimeout(async () => {
      try {
        // 真实API调用
        const response = await fetch('/api/ideas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title,
            description: idea,
            category
          })
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(data.error || '提交失败')
        }

        setSubmissionResult(data.submissionResult)
        setIsSubmitting(false)
        setShowSuccess(true)
      } catch (error) {
        console.error('提交失败:', error)
        setIsSubmitting(false)
        alert('提交失败，请稍后重试: ' + (error instanceof Error ? error.message : '未知错误'))
      }
    }, 4000)
  }

  const categories = [
    { name: '科技创新', icon: Atom, color: 'from-blue-500 to-cyan-500', desc: '前沿技术与创新应用' },
    { name: '文艺创作', icon: Palette, color: 'from-purple-500 to-pink-500', desc: '艺术创作与文化表达' },
    { name: '商业策略', icon: Target, color: 'from-green-500 to-emerald-500', desc: '商业模式与策略创新' },
    { name: '生活创意', icon: Heart, color: 'from-red-500 to-orange-500', desc: '日常生活改善方案' },
    { name: '教育方案', icon: BookOpen, color: 'from-indigo-500 to-blue-500', desc: '教育创新与学习方法' },
    { name: '娱乐内容', icon: Gamepad2, color: 'from-yellow-500 to-amber-500', desc: '娱乐体验与内容创作' },
    { name: '社会公益', icon: TreePine, color: 'from-green-600 to-teal-500', desc: '社会责任与公益创新' },
    { name: '其他', icon: Puzzle, color: 'from-gray-500 to-slate-500', desc: '不拘一格的奇思妙想' }
  ]

  const agentReactions = [
    {
      id: 'wang',
      name: '商人老王',
      avatar: '💼',
      specialty: 'business',
      description: '商业价值专家',
      expertise: ['ROI分析', '盈利模式', '风险控制'],
      reaction: ideaScore > 80 ? '商业价值极高！' : ideaScore > 50 ? '市场潜力不错' : '商业模式待完善',
      mood: ideaScore > 80 ? 'money' : ideaScore > 50 ? 'interested' : 'skeptical',
      currentBid: 0,
      confidence: Math.min(ideaScore * 0.9, 95) // 商业敏感度95%
    },
    {
      id: 'lin',
      name: '文艺小琳',
      avatar: '🎨',
      specialty: 'artistic',
      description: '情感创意专家',
      expertise: ['美感设计', '情感共鸣', '故事创作'],
      reaction: ideaScore > 60 ? '充满创意的想法！' : ideaScore > 30 ? '可以更有创意些' : '需要更多灵感',
      mood: ideaScore > 60 ? 'love' : ideaScore > 30 ? 'curious' : 'waiting',
      currentBid: 0,
      confidence: Math.min(ideaScore * 0.95, 95) // 艺术审美力95%
    },
    {
      id: 'alex',
      name: '科技艾克斯',
      avatar: '🤖',
      specialty: 'tech',
      description: '技术创新专家',
      expertise: ['技术架构', '创新设计', '性能优化'],
      reaction: ideaScore > 70 ? '技术实现很有前景！' : ideaScore > 40 ? '需要更多技术细节' : '继续完善技术方案',
      mood: ideaScore > 70 ? 'excited' : ideaScore > 40 ? 'thinking' : 'waiting',
      currentBid: 0,
      confidence: Math.min(ideaScore * 0.95, 95) // 技术理解力95%
    },
    {
      id: 'allen',
      name: '趋势阿伦',
      avatar: '📈',
      specialty: 'trend',
      description: '市场敏感专家',
      expertise: ['趋势预测', '营销策划', '传播设计'],
      reaction: ideaScore > 75 ? '这会是下一个爆款！' : ideaScore > 45 ? '有传播潜力' : '需要更多市场亮点',
      mood: ideaScore > 75 ? 'trending' : ideaScore > 45 ? 'analyzing' : 'waiting',
      currentBid: 0,
      confidence: Math.min(ideaScore * 0.95, 95) // 市场敏感度95%
    },
    {
      id: 'li',
      name: '教授李博',
      avatar: '🎓',
      specialty: 'academic',
      description: '学术理论专家',
      expertise: ['理论建构', '学术研究', '体系完善'],
      reaction: ideaScore > 65 ? '理论基础很扎实！' : ideaScore > 35 ? '需要更严谨的论证' : '理论深度不够',
      mood: ideaScore > 65 ? 'scholarly' : ideaScore > 35 ? 'pondering' : 'waiting',
      currentBid: 0,
      confidence: Math.min(ideaScore * 0.95, 95) // 理论深度95%
    }
  ]

  const processingSteps = [
    { icon: Brain, label: '内容分析', description: '使用NLP技术分析创意内容' },
    { icon: Users, label: 'AI评估', description: '多个AI投资者独立评估' },
    { icon: TrendingUp, label: '市场分析', description: '分析市场需求和竞争态势' },
    { icon: Sparkles, label: '生成报告', description: '生成详细的评估报告' }
  ]

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* 动态背景装饰 */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
            animate={{
              x: [0, 30, 0],
              y: [0, -30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-1/2 -left-4 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
            animate={{
              x: [0, -20, 0],
              y: [0, 20, 0],
              scale: [1, 0.9, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="container py-12 relative">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full border border-blue-200/50 mb-6"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Lightbulb className="w-5 h-5 text-amber-500" />
              </motion.div>
              <span className="font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                创意提交工坊
              </span>
              <Sparkles className="w-4 h-4 text-purple-500" />
            </motion.div>

            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              释放你的创意能量
            </motion.h1>

            <motion.p
              className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              在这个充满魔力的创意工坊中，每一个想法都可能改变世界。
              <br />
              让AI投资者发现你的创意价值，获得丰厚奖励！
            </motion.p>

            {/* 创意评分指示器 */}
            <motion.div
              className="mt-8 inline-flex items-center gap-4 px-6 py-3 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                <span className="font-medium text-slate-700">创意评分</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${ideaScore}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                <motion.span
                  className="font-bold text-lg"
                  key={ideaScore}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {ideaScore}
                </motion.span>
              </div>
            </motion.div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* 主要提交表单 */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <motion.div
                      className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Sparkles className="w-6 h-6 text-white" />
                    </motion.div>
                    创意详情表单
                  </CardTitle>
                  <CardDescription className="text-base text-slate-600">
                    详细描述你的创意想法，我们的AI将为你提供专业评估和改造建议
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-8">
                  <AnimatePresence>
                    {!showSuccess ? (
                      <motion.form
                        onSubmit={handleSubmit}
                        className="space-y-8"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* 创意标题 */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1, duration: 0.5 }}
                        >
                          <Label htmlFor="title" className="text-base font-medium mb-3 block">
                            创意标题 ✨
                          </Label>
                          <motion.div
                            whileFocus={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Input
                              id="title"
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              placeholder="为你的创意起一个充满魅力的标题..."
                              className="text-lg p-4 border-2 border-slate-200 focus:border-purple-400 rounded-xl transition-all duration-300"
                              required
                            />
                          </motion.div>
                        </motion.div>

                        {/* 创意分类 - 可视化选择 */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.2, duration: 0.5 }}
                        >
                          <Label className="text-base font-medium mb-4 block">
                            选择创意分类 🎯
                          </Label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {categories.map((cat, index) => {
                              const Icon = cat.icon
                              const isSelected = category === cat.name
                              return (
                                <motion.div
                                  key={cat.name}
                                  className={`relative cursor-pointer p-4 rounded-2xl border-2 transition-all duration-300 ${
                                    isSelected
                                      ? 'border-purple-400 bg-gradient-to-br ' + cat.color + ' text-white shadow-lg'
                                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                                  }`}
                                  onClick={() => setCategory(cat.name)}
                                  whileHover={{ scale: 1.05, y: -2 }}
                                  whileTap={{ scale: 0.95 }}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 1.3 + index * 0.1, duration: 0.4 }}
                                >
                                  <div className="text-center">
                                    <Icon className={`w-8 h-8 mx-auto mb-2 ${isSelected ? 'text-white' : 'text-slate-600'}`} />
                                    <div className={`font-medium text-sm ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                                      {cat.name}
                                    </div>
                                    <div className={`text-xs mt-1 ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                                      {cat.desc}
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <motion.div
                                      className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center"
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <Zap className="w-4 h-4 text-purple-500" />
                                    </motion.div>
                                  )}
                                </motion.div>
                              )
                            })}
                          </div>
                        </motion.div>

                        {/* 创意描述 */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.5, duration: 0.5 }}
                        >
                          <Label htmlFor="idea" className="text-base font-medium mb-3 block">
                            创意详细描述 🚀
                          </Label>
                          <motion.div
                            whileFocus={{ scale: 1.01 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Textarea
                              id="idea"
                              value={idea}
                              onChange={(e) => setIdea(e.target.value)}
                              placeholder="🌟 让你的创意在这里闪闪发光！

💡 创意灵感来源
🎯 核心概念和独特价值
👥 目标用户群体
🏆 预期效果和影响
🛠️ 初步实现想法

字数越详细，AI评估越精准！让每一个字都传递你的热情～"
                              className="min-h-[300px] text-base p-6 border-2 border-slate-200 focus:border-purple-400 rounded-2xl resize-none transition-all duration-300"
                              required
                            />
                          </motion.div>

                          <motion.div
                            className="flex justify-between items-center mt-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.7, duration: 0.4 }}
                          >
                            <div className="text-sm text-slate-500">
                              当前字数: <span className="font-medium text-purple-600">{idea.length}</span> / 建议200字以上
                            </div>
                            <div className="flex items-center gap-2">
                              {idea.length > 200 && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="flex items-center gap-1 text-green-600 text-sm"
                                >
                                  <Heart className="w-4 h-4" />
                                  <span>很棒！</span>
                                </motion.div>
                              )}
                            </div>
                          </motion.div>
                        </motion.div>

                        {/* 提交按钮 - 根据阶段显示不同按钮 */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.8, duration: 0.5 }}
                        >
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {currentPhase === 'input' && (
                              <Button
                                type="button"
                                size="lg"
                                onClick={startBidding}
                                className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                                disabled={
                                  !title ||
                                  !category ||
                                  idea.length < 50 ||
                                  !isAuthenticated ||
                                  !canSubmitIdea(user?.credits || 0).canSubmit
                                }
                              >
                                <div className="flex items-center gap-3">
                                  <Rocket className="w-5 h-5" />
                                  <span>启动AI竞价</span>
                                  <ArrowRight className="w-5 h-5" />
                                </div>
                              </Button>
                            )}

                            {currentPhase === 'bidding' && (
                              <Button
                                type="button"
                                size="lg"
                                disabled
                                className="w-full h-14 text-lg bg-gradient-to-r from-orange-600 to-red-600 rounded-xl shadow-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  >
                                    <Brain className="w-5 h-5" />
                                  </motion.div>
                                  <span>AI竞价进行中...</span>
                                </div>
                              </Button>
                            )}

                            {currentPhase === 'discussion' && discussionRound < maxDiscussionRounds && (
                              <Button
                                type="button"
                                size="lg"
                                className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                              >
                                <div className="flex items-center gap-3">
                                  <MessageCircle className="w-5 h-5" />
                                  <span>与AI专家讨论 ({discussionRound}/{maxDiscussionRounds})</span>
                                </div>
                              </Button>
                            )}

                            {(currentPhase === 'completed' || discussionRound >= maxDiscussionRounds) && (
                              <Button
                                type="submit"
                                size="lg"
                                className="w-full h-14 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                                disabled={isSubmitting}
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
                                      <span>提交中...</span>
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="w-5 h-5" />
                                      <span>确认提交创意</span>
                                      <Coins className="w-5 h-5" />
                                    </>
                                  )}
                                </div>
                              </Button>
                            )}
                          </motion.div>
                        </motion.div>
                      </motion.form>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="text-center py-12"
                      >
                        <motion.div
                          animate={{
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="text-8xl mb-6"
                        >
                          🎉
                        </motion.div>
                        <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
                          创意提交成功！
                        </h3>
                        <p className="text-lg text-slate-600 mb-6">
                          你的创意已经进入AI评估阶段，很快就会有投资者为你的想法竞价！
                        </p>

                        {/* 提交结果详情 */}
                        {submissionResult && (
                          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/50">
                            <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500" />
                              提交详情
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-slate-600">提交方式:</span>
                                <Badge variant={submissionResult.isFree ? "default" : "secondary"}>
                                  {submissionResult.isFree ? '免费提交' : '付费提交'}
                                </Badge>
                              </div>
                              {!submissionResult.isFree && (
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-600">消耗积分:</span>
                                  <span className="font-semibold text-red-600">
                                    -{submissionResult.cost} 积分
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-between items-center">
                                <span className="text-slate-600">奖励积分:</span>
                                <span className="font-semibold text-green-600">
                                  +{submissionResult.earnedCredits} 积分
                                </span>
                              </div>
                              <div className="pt-2 border-t border-slate-200">
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-600">净收益:</span>
                                  <span className={`font-bold ${
                                    submissionResult.earnedCredits - submissionResult.cost >= 0
                                      ? 'text-green-600'
                                      : 'text-red-600'
                                  }`}>
                                    {submissionResult.earnedCredits - submissionResult.cost >= 0 ? '+' : ''}
                                    {submissionResult.earnedCredits - submissionResult.cost} 积分
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <Button
                          onClick={() => submissionResult && (window.location.href = `/ideas/${submissionResult.ideaId}/discussion`)}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          开始AI讨论
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* AI处理进度指示器 */}
                  <AnimatePresence>
                    {isSubmitting && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-200/50"
                      >
                        <h4 className="font-semibold text-lg mb-4 text-center">AI处理进度</h4>
                        <div className="space-y-4">
                          {processingSteps.map((step, index) => {
                            const Icon = step.icon
                            const isActive = currentStep === index + 1
                            const isCompleted = currentStep > index + 1

                            return (
                              <motion.div
                                key={index}
                                className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-500 ${
                                  isActive ? 'bg-white shadow-md' : isCompleted ? 'bg-green-50' : 'bg-transparent'
                                }`}
                                initial={{ opacity: 0.5 }}
                                animate={{
                                  opacity: isActive || isCompleted ? 1 : 0.5,
                                  scale: isActive ? 1.02 : 1
                                }}
                              >
                                <div className={`p-2 rounded-lg ${
                                  isCompleted ? 'bg-green-500' : isActive ? 'bg-purple-500' : 'bg-slate-300'
                                }`}>
                                  {isActive && (
                                    <motion.div
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    >
                                      <Icon className="w-5 h-5 text-white" />
                                    </motion.div>
                                  )}
                                  {!isActive && <Icon className="w-5 h-5 text-white" />}
                                </div>
                                <div>
                                  <div className="font-medium">{step.label}</div>
                                  <div className="text-sm text-slate-600">{step.description}</div>
                                </div>
                              </motion.div>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>

            {/* 侧边栏 */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              {/* 提交状态组件 */}
              <SubmissionStatus />

              {/* AI投资者实时反应 */}
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Users className="w-5 h-5 text-purple-500" />
                    </motion.div>
                    AI投资者实时反应
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeAgent}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.4 }}
                      className="bg-gradient-to-r from-slate-50 to-blue-50 p-4 rounded-xl"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <motion.div
                          className="text-3xl"
                          animate={{
                            scale: agentReactions[activeAgent]?.mood === 'excited' ? [1, 1.2, 1] : 1,
                            rotate: agentReactions[activeAgent]?.mood === 'thinking' ? [0, 5, -5, 0] : 0
                          }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          {agentReactions[activeAgent]?.avatar}
                        </motion.div>
                        <div>
                          <div className="font-medium">{agentReactions[activeAgent]?.name}</div>
                          <Badge
                            variant={agentReactions[activeAgent]?.mood === 'excited' ? 'success' : 'outline'}
                            className="text-xs"
                          >
                            {agentReactions[activeAgent]?.mood === 'excited' ? '兴奋' :
                             agentReactions[activeAgent]?.mood === 'thinking' ? '思考中' : '等待'}
                          </Badge>
                        </div>
                      </div>
                      <motion.div
                        className="text-sm bg-white p-3 rounded-lg shadow-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        "{agentReactions[activeAgent]?.reaction}"
                      </motion.div>
                    </motion.div>
                  </AnimatePresence>

                  <div className="mt-4 text-center">
                    <div className="flex justify-center gap-2">
                      {agentReactions.map((_, index) => (
                        <motion.div
                          key={index}
                          className={`w-2 h-2 rounded-full ${
                            index === activeAgent ? 'bg-purple-500' : 'bg-slate-300'
                          }`}
                          animate={{
                            scale: index === activeAgent ? [1, 1.5, 1] : 1
                          }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">AI实时反馈</div>
                  </div>
                </CardContent>
              </Card>

              {/* 提交流程 */}
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    创意变现流程
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { step: 1, title: '提交创意', desc: '详细描述你的想法', icon: Lightbulb, color: 'blue' },
                    { step: 2, title: 'AI评估竞价', desc: '多个AI投资者实时评估', icon: Brain, color: 'purple' },
                    { step: 3, title: '获得积分', desc: '根据评估结果获得奖励', icon: Star, color: 'amber' },
                    { step: 4, title: '改造升级', desc: 'AI改造成完整方案', icon: Rocket, color: 'green' }
                  ].map((item, index) => {
                    const Icon = item.icon
                    return (
                      <motion.div
                        key={item.step}
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.2 + index * 0.1, duration: 0.5 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                      >
                        <motion.div
                          className={`w-8 h-8 rounded-full bg-gradient-to-br from-${item.color}-400 to-${item.color}-600 text-white text-sm flex items-center justify-center font-bold shadow-lg`}
                          whileHover={{ scale: 1.1, rotate: 360 }}
                          transition={{ duration: 0.3 }}
                        >
                          {item.step}
                        </motion.div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {item.title}
                          </div>
                          <div className="text-sm text-slate-600">{item.desc}</div>
                        </div>
                      </motion.div>
                    )
                  })}
                </CardContent>
              </Card>

              {/* 积分奖励系统 */}
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
                    { action: '提交创意', reward: '+10积分', icon: '📝' },
                    { action: 'AI竞价成功', reward: '+50-500积分', icon: '💰' },
                    { action: '高质量创意', reward: '额外奖励', icon: '🏆' },
                    { action: '病毒式传播', reward: '分红奖励', icon: '🚀' }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.4 + index * 0.1, duration: 0.4 }}
                      whileHover={{ scale: 1.02, shadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-sm">{item.action}</span>
                      </div>
                      <span className="font-medium text-amber-600">{item.reward}</span>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              {/* 创意小贴士 */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coffee className="w-5 h-5 text-green-600" />
                    创意小贴士
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <motion.div
                    className="flex items-start gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.6, duration: 0.5 }}
                  >
                    <span className="text-green-600">💡</span>
                    <span>具体的问题描述比抽象概念更容易获得高分</span>
                  </motion.div>
                  <motion.div
                    className="flex items-start gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.7, duration: 0.5 }}
                  >
                    <span className="text-blue-600">🎯</span>
                    <span>明确的目标用户群体能提高商业价值评估</span>
                  </motion.div>
                  <motion.div
                    className="flex items-start gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.8, duration: 0.5 }}
                  >
                    <span className="text-purple-600">✨</span>
                    <span>创新性和可行性并重的创意最受欢迎</span>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  )
}