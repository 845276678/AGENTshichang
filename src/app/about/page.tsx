'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Layout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Target,
  Award,
  Heart,
  Zap,
  Shield,
  Lightbulb,
  Rocket,
  Globe,
  Mail,
  Github,
  Twitter
} from 'lucide-react'

export default function AboutPage() {
  const stats = [
    { label: '注册用户', value: '50,000+', icon: Users },
    { label: 'AI Agent', value: '10,000+', icon: Zap },
    { label: '创意项目', value: '25,000+', icon: Lightbulb },
    { label: '全球覆盖', value: '180+', icon: Globe }
  ]

  const values = [
    {
      icon: <Target className="w-8 h-8" />,
      title: '专注创新',
      description: '我们致力于通过AI技术推动创意产业的发展与变革'
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: '用户至上',
      description: '用户体验是我们产品设计和服务的核心驱动力'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: '安全可靠',
      description: '保护用户数据安全和隐私是我们的首要责任'
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: '质量保证',
      description: '我们确保每个AI Agent都经过严格测试和质量把控'
    }
  ]

  const team = [
    {
      name: '张明',
      role: '创始人 & CEO',
      description: '前阿里巴巴AI实验室负责人，10年AI产品经验',
      avatar: '👨‍💼'
    },
    {
      name: '李雪',
      role: '技术总监',
      description: '前腾讯AI平台架构师，专精大模型技术',
      avatar: '👩‍💻'
    },
    {
      name: '王强',
      role: '产品总监',
      description: '资深产品专家，专注用户体验设计',
      avatar: '👨‍🎨'
    },
    {
      name: '刘华',
      role: '运营总监',
      description: '10年互联网运营经验，擅长社区建设',
      avatar: '👩‍🚀'
    }
  ]

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              关于 AI Agent 市场
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              我们是一个专注于AI Agent创意协作的平台，致力于连接创意人才与先进AI技术，
              共同创造更美好的数字未来。
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <Icon className="w-8 h-8 mx-auto mb-3 text-primary" />
                    <div className="text-2xl font-bold text-primary mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </motion.div>

          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <Rocket className="w-12 h-12 mx-auto text-primary" />
                  <h2 className="text-3xl font-bold">我们的使命</h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    通过构建智能、开放、协作的AI Agent生态系统，
                    让每个人都能轻松获得AI的力量，实现创意梦想，推动社会创新发展。
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Values */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-center">核心价值观</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {values.map((value, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 text-primary">
                        {value.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          {value.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {value.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Team */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-center">核心团队</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="text-4xl mb-4">{member.avatar}</div>
                    <h3 className="text-xl font-semibold mb-1">
                      {member.name}
                    </h3>
                    <Badge variant="secondary" className="mb-3">
                      {member.role}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {member.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-2xl">联系我们</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                  <div className="space-y-2">
                    <Mail className="w-8 h-8 mx-auto text-primary" />
                    <h3 className="font-semibold">邮箱</h3>
                    <p className="text-sm text-muted-foreground">
                      contact@aiagentmarket.com
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Github className="w-8 h-8 mx-auto text-primary" />
                    <h3 className="font-semibold">GitHub</h3>
                    <p className="text-sm text-muted-foreground">
                      @aiagentmarket
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Twitter className="w-8 h-8 mx-auto text-primary" />
                    <h3 className="font-semibold">Twitter</h3>
                    <p className="text-sm text-muted-foreground">
                      @aiagentmarket
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">微信</h3>
                    <div className="flex items-center justify-center">
                      <img
                        src="/wechat-qr.jpg"
                        alt="微信二维码"
                        className="w-36 h-36 object-cover rounded-md border"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      扫码添加微信，遇到问题可直接联系我为您解决
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center text-muted-foreground"
          >
            <p>
              感谢您选择 AI Agent 市场。我们期待与您一起探索AI的无限可能！
            </p>
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}