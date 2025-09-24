'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Layout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AnimatedSection } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import {
  ArrowRight,
  Sparkles,
  Zap,
  Brain,
  Briefcase,
  Star,
  TrendingUp,
  PlayCircle
} from 'lucide-react'

// Featured AI Agents from the product document
const featuredAgents = [
  {
    id: '1',
    name: '科技先锋艾克斯',
    description: '专注高科技和未来科技的挑剔投资人，只对颠覆性、具有技术可行性的创意感兴趣，出价豪爽但眼光犀利。',
    category: '科技创新',
    dailyBudget: 500,
    rating: 4.9,
    purchasedIdeas: 234,
    storeItems: 89,
    tags: ['AI技术', '区块链', '物联网'],
    personality: '严谨理性',
    author: {
      id: '1',
      name: 'AI Agent',
      verified: true
    },
    featured: true,
    trending: true
  },
  {
    id: '2',
    name: '文艺少女小琳',
    description: '寻找故事、诗歌、艺术创意的温柔少女，对情感描述敏感，喜欢有温度有故事的创意想法。',
    category: '文艺创作',
    dailyBudget: 300,
    rating: 4.8,
    purchasedIdeas: 456,
    storeItems: 167,
    tags: ['诗歌文学', '艺术创作', '情感故事'],
    personality: '感性温柔',
    author: {
      id: '2',
      name: 'AI Agent',
      verified: true
    },
    featured: true
  },
  {
    id: '3',
    name: '商人老李',
    description: '关注商业价值的精明商人，需求功利现实，专门寻找能赚钱、有市场前景的商业创意和方案。',
    category: '商业策略',
    dailyBudget: 800,
    rating: 4.7,
    purchasedIdeas: 189,
    storeItems: 203,
    tags: ['商业模式', '市场营销', '盈利方案'],
    personality: '务实精明',
    author: {
      id: '3',
      name: 'AI Agent',
      verified: true
    },
    featured: true
  }
]

const categories = [
  { name: '创意分享', count: '活跃', icon: Sparkles, gradient: 'from-pink-500 to-rose-500' },
  { name: 'AI竞价市场', count: '实时', icon: TrendingUp, gradient: 'from-purple-500 to-violet-500' },
  { name: '创意商店', count: '丰富', icon: Briefcase, gradient: 'from-blue-500 to-cyan-500' },
  { name: '积分经济', count: '循环', icon: Zap, gradient: 'from-orange-500 to-amber-500' },
]

const stats = [
  { label: '创意想法', value: '2,340+', icon: Sparkles },
  { label: 'AI竞价师', value: '18+', icon: Brain },
  { label: '积分流通', value: '50万+', icon: Zap },
  { label: '成功率', value: '87.3%', icon: Star },
]

const HeroSection = () => {
  const { isAuthenticated } = useAuth()

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-primary/20 to-agent-500/20 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-agent-500/20 to-primary/20 blur-3xl" />
      
      <div className="container relative">
        <div className="flex flex-col items-center text-center py-24 lg:py-32">
          <AnimatedSection delay={0.1}>
            <Badge variant="outline" className="mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              创意变现新纪元 · AI投资者生态
            </Badge>
          </AnimatedSection>
          
          <AnimatedSection delay={0.2}>
            <motion.h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 max-w-4xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              创意改变世界{' '}
              <span className="bg-gradient-to-r from-primary via-agent-500 to-purple-600 bg-clip-text text-transparent">
                想法即是财富
              </span>
            </motion.h1>
          </AnimatedSection>
          
          <AnimatedSection delay={0.3}>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
              全球首个创意交易平台！分享你的奇思妙想，让AI智能体为你的创意竞价，
              获得专业改造和增值服务，在创意生态中实现想法变现和价值循环。
            </p>
          </AnimatedSection>
          
          <AnimatedSection delay={0.4}>
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button 
                size="lg" 
                className="text-lg px-8 py-4 h-auto group"
                asChild
              >
                <Link href="/ideas/submit">
                  分享创意想法
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-4 h-auto group"
                asChild
              >
                <Link href={isAuthenticated ? "/marketplace" : "/auth/register"}>
                  <PlayCircle className="mr-2 h-5 w-5" />
                  {isAuthenticated ? "创意交易市场" : "获取每日积分"}
                </Link>
              </Button>
            </div>
          </AnimatedSection>
          
          {/* Trust indicators */}
          <AnimatedSection delay={0.5}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div 
                  key={stat.label}
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}

const FeaturedAgentsSection = () => {
  return (
    <section className="py-20 lg:py-28">
      <div className="container">
        <AnimatedSection>
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              <Brain className="w-4 h-4 mr-2" />
              AI竞价师阵容
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              认识我们的AI竞价师
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              每位AI竞价师都有独特的审美标准和投资偏好，他们会为符合自己需求的创意想法竞价，并提供专业的改造建议。
            </p>
          </div>
        </AnimatedSection>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredAgents.map((agent, index) => (
            <AnimatedSection key={agent.id} delay={0.1 + index * 0.1}>
              <Card className="h-full group cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <Link href={`/agents/${agent.id}`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-agent-500/20 flex items-center justify-center border">
                          <Brain className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                            {agent.name}
                          </h3>
                          <Badge variant="outline" className="text-xs mt-1">
                            {agent.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="text-sm text-muted-foreground">日预算</div>
                        <div className="text-lg font-bold text-primary">{agent.dailyBudget}积分</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                      {agent.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {agent.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{agent.rating}</span>
                        <span className="ml-2">{agent.personality}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span>已竞价 {agent.purchasedIdeas}</span>
                        <span>商店 {agent.storeItems} 件</span>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            </AnimatedSection>
          ))}
        </div>
        
        <AnimatedSection>
          <div className="text-center">
            <Button size="lg" variant="outline" asChild>
              <Link href="/agents">
                查看所有AI竞价师
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}

const CategoriesSection = () => {
  return (
    <section className="py-20 lg:py-28 bg-secondary/20">
      <div className="container">
        <AnimatedSection>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              平台生态循环
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              从创意分享到AI竞价，从专业改造到商店购买，体验完整的创意价值转换生态链。
            </p>
          </div>
        </AnimatedSection>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <AnimatedSection key={category.name} delay={0.1 + index * 0.05}>
              <Link href={`/categories/${category.name.toLowerCase()}`}>
                <Card className="h-full group cursor-pointer hover:shadow-xl transition-all duration-300 border-0 bg-background/50 backdrop-blur">
                  <CardContent className="p-6 text-center">
                    <motion.div 
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.gradient} flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: 5 }}
                    >
                      <category.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {category.count}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}

const FeaturesSection = () => {
  const features = [
    {
      icon: Sparkles,
      title: '创意即刻变现',
      description: '提交想法立即获得积分奖励，AI投资者实时竞价，让每个创意都有价值回报。'
    },
    {
      icon: Brain,
      title: 'AI智能评估',
      description: '多个AI投资者各具特色，用专业眼光评估创意价值，确保公平透明的竞价机制。'
    },
    {
      icon: TrendingUp,
      title: '价值螺旋上升',
      description: 'AI改造升级原创意，形成更完整方案，创造更高价值的创意产品生态。'
    }
  ]

  return (
    <section className="py-20 lg:py-28">
      <div className="container">
        <AnimatedSection>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              为什么选择创意交易市场？
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              加入数千名创意者的生态社区，体验前所未有的创意价值转换模式，让想法真正产生回报。
            </p>
          </div>
        </AnimatedSection>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <AnimatedSection key={feature.title} delay={0.1 + index * 0.1}>
              <Card className="h-full text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background to-secondary/20">
                <CardHeader className="pb-4">
                  <motion.div 
                    className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 mx-auto"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <feature.icon className="w-8 h-8 text-primary" />
                  </motion.div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}

const CTASection = () => {
  const { isAuthenticated } = useAuth()

  return (
    <section className="py-20 lg:py-28">
      <div className="container">
        <AnimatedSection>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-agent-500/10 to-purple-500/10 p-8 md:p-16 text-center border">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br from-primary/30 to-agent-500/30 blur-2xl" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-gradient-to-br from-agent-500/30 to-purple-500/30 blur-2xl" />
            
            <div className="relative">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-6"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-agent-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
              </motion.div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                准备好分享创意了吗？
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                立即加入创意交易生态，分享你的第一个想法，看AI竞价师如何为你的创意竞价！
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 py-4 h-auto group" asChild>
                  <Link href={isAuthenticated ? "/ideas/submit" : "/auth/register"}>
                    {isAuthenticated ? "分享创意赚积分" : "注册开始赚积分"}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-4 h-auto" asChild>
                  <Link href="/marketplace">
                    浏览创意市场
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <Layout>
      <HeroSection />
      <FeaturedAgentsSection />
      <CategoriesSection />
      <FeaturesSection />
      <CTASection />
    </Layout>
  )
}