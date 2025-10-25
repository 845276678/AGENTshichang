'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Layout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight,
  Sparkles,
  Lightbulb,
  Grid3x3,
  TrendingUp,
  Star,
  Calendar,
  Zap,
  BookOpen,
  Target
} from 'lucide-react'

export default function CreativeToolsPage() {
  const tools = [
    {
      id: 'categories',
      title: '创意分类',
      description: '浏览不同领域的创意想法，寻找灵感和机会。涵盖科技、商业、文化、教育等多个类别。',
      icon: Grid3x3,
      iconBg: 'from-pink-500 to-rose-500',
      features: [
        '多领域分类',
        '热门创意排行',
        '创意搜索功能',
        '收藏与分享'
      ],
      stats: {
        label: '创意分类',
        value: '12+个'
      },
      link: '/categories',
      linkText: '浏览分类',
      badge: '活跃'
    },
    {
      id: 'daily-idea',
      title: '每日一创意',
      description: '每天推荐一个精选创意，拓展思维边界，激发创新灵感。包含详细分析和实施建议。',
      icon: Calendar,
      iconBg: 'from-orange-500 to-amber-500',
      features: [
        '每日精选推荐',
        '专业分析解读',
        '历史创意回顾',
        '创意评价互动'
      ],
      stats: {
        label: '累计推荐',
        value: '365+个'
      },
      link: '/daily-idea',
      linkText: '查看今日创意',
      badge: '每日更新'
    }
  ]

  const additionalFeatures = [
    {
      title: '创意灵感库',
      description: '收集各领域的优秀创意案例',
      icon: Lightbulb,
      comingSoon: true
    },
    {
      title: '趋势分析',
      description: '分析当前热门创意趋势和方向',
      icon: TrendingUp,
      comingSoon: true
    },
    {
      title: '创意评分',
      description: 'AI评估创意的市场潜力和可行性',
      icon: Star,
      comingSoon: true
    },
    {
      title: '协作空间',
      description: '与其他创业者交流和协作创意',
      icon: Target,
      comingSoon: true
    }
  ]

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 py-20">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-primary/20 to-orange-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-pink-500/20 to-primary/20 blur-3xl" />

        <div className="container relative">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              创意工具箱 · 激发无限可能
            </Badge>

            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              探索创意
              <span className="bg-gradient-to-r from-primary via-orange-600 to-pink-600 bg-clip-text text-transparent">
                {' '}发现机会
              </span>
            </motion.h1>

            <motion.p
              className="text-xl text-muted-foreground mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              提供多样化的创意工具和资源，帮助您寻找灵感、分析趋势、评估想法。
            </motion.p>
          </div>
        </div>
      </section>

      {/* Main Tools Section */}
      <section className="py-20">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {tools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <CardHeader className="bg-gradient-to-br from-background to-secondary/20 pb-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tool.iconBg} flex items-center justify-center shadow-lg`}>
                        <tool.icon className="w-7 h-7 text-white" />
                      </div>
                      {tool.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {tool.badge}
                        </Badge>
                      )}
                    </div>

                    <CardTitle className="text-2xl mb-2">{tool.title}</CardTitle>
                    <CardDescription className="text-base">
                      {tool.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-6">
                    {/* Features */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {tool.features.map((feature) => (
                        <div
                          key={feature}
                          className="flex items-center gap-2 text-sm"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="bg-secondary/30 rounded-lg p-4 mb-6">
                      <div className="text-2xl font-bold text-primary mb-1">
                        {tool.stats.value}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {tool.stats.label}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Button size="lg" className="w-full group" asChild>
                      <Link href={tool.link}>
                        {tool.linkText}
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Additional Features */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">更多工具即将上线</h2>
              <p className="text-muted-foreground">
                我们正在开发更多创意工具，敬请期待
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {additionalFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="h-full border-0 shadow-sm hover:shadow-md transition-all duration-300 opacity-75">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-lg bg-secondary/50 flex items-center justify-center mb-3">
                        <feature.icon className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="outline" className="text-xs">
                        敬请期待
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-secondary/20">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              发现您的下一个创业机会
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              使用我们的创意工具，探索无限可能，将想法变为现实。
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="group">
                <Link href="/categories">
                  <Grid3x3 className="mr-2 h-5 w-5" />
                  浏览创意分类
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/daily-idea">
                  <Calendar className="mr-2 h-5 w-5" />
                  查看今日创意
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
