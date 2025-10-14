/**
 * Agent能力展示卡片组件
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, TrendingUp, Flame } from 'lucide-react'
import type { Agent, BiddingAgent, WorkshopAgent, AssessmentAgent } from '@/lib/agent-registry'

interface AgentCardProps {
  agent: Agent
  usageStats?: {
    todayCount: number
    trending?: boolean
  }
}

export function AgentCard({ agent, usageStats }: AgentCardProps) {
  // 根据Agent类型确定链接
  const getAgentLink = () => {
    if (agent.module === 'bidding') {
      return '/marketplace'
    } else if (agent.module === 'workshop') {
      return '/workshops'
    } else if (agent.module === 'assessment') {
      return '/maturity'
    }
    return '#'
  }

  // 渲染竞价Agent卡片
  if (agent.module === 'bidding') {
    const biddingAgent = agent as BiddingAgent
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Link href={getAgentLink()}>
          <Card className="h-full group cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{biddingAgent.avatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {biddingAgent.name}
                      </h3>
                      {usageStats?.trending && (
                        <Flame className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {biddingAgent.role}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                {biddingAgent.description}
              </p>

              <div className="flex flex-wrap gap-1 mb-4">
                {biddingAgent.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="mb-4 p-2 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground italic">
                  💬 "{biddingAgent.catchPhrase}"
                </p>
              </div>

              {usageStats && (
                <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-3">
                  <span>今日服务</span>
                  <span className="font-semibold text-primary">{usageStats.todayCount} 次</span>
                </div>
              )}

              <div className="mt-3 flex items-center text-sm text-primary font-medium">
                进入竞价市场
                <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    )
  }

  // 渲染工作坊Agent卡片
  if (agent.module === 'workshop') {
    const workshopAgent = agent as WorkshopAgent
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Link href={getAgentLink()}>
          <Card className="h-full group cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{workshopAgent.avatar}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors mb-1">
                      {workshopAgent.name}
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {workshopAgent.role}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-muted-foreground text-sm mb-4">
                {workshopAgent.description}
              </p>

              <div className="mb-4 space-y-2">
                <div className="text-xs font-medium text-muted-foreground mb-2">擅长工作坊：</div>
                {Object.entries(workshopAgent.expertise).slice(0, 2).map(([key, value]) => (
                  <div key={key} className="text-xs">
                    <span className="text-primary font-medium">• </span>
                    <span className="text-muted-foreground">{value}</span>
                  </div>
                ))}
                {Object.keys(workshopAgent.expertise).length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    + 更多{Object.keys(workshopAgent.expertise).length - 2}个专业领域
                  </div>
                )}
              </div>

              {usageStats && (
                <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-3">
                  <span>今日指导</span>
                  <span className="font-semibold text-primary">{usageStats.todayCount} 次</span>
                </div>
              )}

              <div className="mt-3 flex items-center text-sm text-primary font-medium">
                开始工作坊
                <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    )
  }

  // 渲染评估Agent卡片
  if (agent.module === 'assessment') {
    const assessmentAgent = agent as AssessmentAgent
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Link href={getAgentLink()}>
          <Card className="h-full group cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50/50 to-amber-50/50">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{assessmentAgent.avatar}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors mb-1">
                      {assessmentAgent.name}
                    </h3>
                    <Badge variant="outline" className="text-xs bg-white">
                      {assessmentAgent.role}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-muted-foreground text-sm mb-4">
                {assessmentAgent.description}
              </p>

              <div className="mb-4">
                <div className="text-xs font-medium text-muted-foreground mb-2">评估维度：</div>
                <div className="grid grid-cols-1 gap-1">
                  {assessmentAgent.dimensions.map((dim, idx) => (
                    <div key={idx} className="text-xs flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-muted-foreground">{dim}</span>
                    </div>
                  ))}
                </div>
              </div>

              {usageStats && (
                <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-3">
                  <span>今日评估</span>
                  <span className="font-semibold text-primary">{usageStats.todayCount} 次</span>
                </div>
              )}

              <div className="mt-3 flex items-center text-sm text-primary font-medium">
                开始评估
                <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    )
  }

  return null
}
