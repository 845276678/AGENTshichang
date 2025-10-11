import React from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Settings,
  Search,
  Compass,
  Calendar,
  DollarSign,
  Target,
  TrendingUp,
  Users,
  Lightbulb,
  CheckCircle
} from 'lucide-react'

import type { PersonalizedRecommendations, IdeaCharacteristics } from '@/types/business-plan'

interface RealtimeRecommendationDisplayProps {
  ideaCharacteristics: IdeaCharacteristics
  personalizedRecommendations: PersonalizedRecommendations
  isAnalyzing?: boolean
}

export function RealtimeRecommendationDisplay({
  ideaCharacteristics,
  personalizedRecommendations,
  isAnalyzing = false
}: RealtimeRecommendationDisplayProps) {

  if (isAnalyzing) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* 创意特征总览 */}
      <Card className="border-2 border-blue-100 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Target className="w-5 h-5" />
            创意特征分析
          </CardTitle>
          <CardDescription className="text-blue-700">
            系统已识别您的创意特征，将据此生成个性化推荐
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <span className="text-xs text-muted-foreground">行业分类</span>
              <Badge variant="secondary">{ideaCharacteristics.category}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <span className="text-xs text-muted-foreground">技术复杂度</span>
              <Badge variant={
                ideaCharacteristics.technicalComplexity === '高' ? 'destructive' :
                ideaCharacteristics.technicalComplexity === '中' ? 'default' :
                'secondary'
              }>
                {ideaCharacteristics.technicalComplexity}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <span className="text-xs text-muted-foreground">资金需求</span>
              <Badge variant="outline">{ideaCharacteristics.fundingRequirement}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <span className="text-xs text-muted-foreground">竞争程度</span>
              <Badge variant="outline">{ideaCharacteristics.competitionLevel}</Badge>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-sm font-medium mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              AI能力需求识别
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(ideaCharacteristics.aiCapabilities).map(([key, value]) =>
                value && (
                  <Badge key={key} variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                    {getAICapabilityLabel(key)}
                  </Badge>
                )
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 个性化推荐网格 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

        {/* AI技术栈推荐 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="w-5 h-5 text-blue-600" />
                AI技术栈推荐
              </CardTitle>
              <CardDescription>
                基于{ideaCharacteristics.category}领域和AI能力需求推荐
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 border rounded-lg bg-green-50 border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    推荐方案
                  </Badge>
                  <span className="text-xs text-green-700">
                    {personalizedRecommendations.techStackRecommendations.beginner.timeline}
                  </span>
                </div>
                <div className="text-sm font-medium mb-1">
                  {personalizedRecommendations.techStackRecommendations.beginner.primary}
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  {personalizedRecommendations.techStackRecommendations.beginner.reason}
                </div>
                <div className="text-xs font-medium text-green-700">
                  预算: {personalizedRecommendations.techStackRecommendations.beginner.cost}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>还有进阶级和专家级方案可选</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 需求发现渠道 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Search className="w-5 h-5 text-purple-600" />
                需求发现渠道
              </CardTitle>
              <CardDescription>
                {ideaCharacteristics.category}行业的精准调研渠道
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">线上</Badge>
                  数字化调研
                </div>
                <div className="space-y-1">
                  {personalizedRecommendations.researchChannels.online.slice(0, 2).map((channel, index) => (
                    <div key={index} className="text-xs p-2 bg-purple-50 rounded border-l-2 border-purple-200">
                      {channel.length > 50 ? `${channel.substring(0, 50)}...` : channel}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">线下</Badge>
                  实地调研
                </div>
                <div className="space-y-1">
                  {personalizedRecommendations.researchChannels.offline.slice(0, 2).map((channel, index) => (
                    <div key={index} className="text-xs p-2 bg-green-50 rounded border-l-2 border-green-200">
                      {channel.length > 50 ? `${channel.substring(0, 50)}...` : channel}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 线下活动推荐 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Compass className="w-5 h-5 text-orange-600" />
                线下活动机会
              </CardTitle>
              <CardDescription>
                {ideaCharacteristics.category}行业相关的调研活动
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {personalizedRecommendations.offlineEvents.nationalEvents.length > 0 && (
                <div className="p-3 border rounded-lg">
                  <div className="text-sm font-medium mb-2">全国性活动</div>
                  {personalizedRecommendations.offlineEvents.nationalEvents.slice(0, 1).map((event, index) => (
                    <div key={index} className="space-y-1">
                      <div className="text-sm font-medium text-orange-700">{event.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {event.time} · {event.location}
                      </div>
                      <div className="text-xs">预算: {event.cost}</div>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <div className="text-sm font-medium mb-2">本地活动</div>
                <div className="flex flex-wrap gap-1">
                  {personalizedRecommendations.offlineEvents.localEvents.slice(0, 3).map((event, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {event.length > 20 ? `${event.substring(0, 20)}...` : event}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 90天计划概览 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5 text-green-600" />
                90天聚焦计划
              </CardTitle>
              <CardDescription>
                基于{ideaCharacteristics.technicalComplexity}技术复杂度定制
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-green-50 rounded border">
                  <Badge className="text-xs">第1个月</Badge>
                  <span className="text-xs font-medium">
                    {personalizedRecommendations.customizedTimeline.month1.focus}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded border">
                  <Badge className="text-xs">第2个月</Badge>
                  <span className="text-xs font-medium">
                    {personalizedRecommendations.customizedTimeline.month2.focus}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-purple-50 rounded border">
                  <Badge className="text-xs">第3个月</Badge>
                  <span className="text-xs font-medium">
                    {personalizedRecommendations.customizedTimeline.month3.focus}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span>聚焦关键90天验证期</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 预算规划 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="w-5 h-5 text-yellow-600" />
                预算规划
              </CardTitle>
              <CardDescription>
                启动资金和运营成本预估
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-yellow-50 rounded border">
                  <span className="text-sm">启动成本</span>
                  <span className="text-sm font-semibold text-yellow-700">
                    ¥{personalizedRecommendations.budgetPlan.startupCosts.total.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded border">
                  <span className="text-sm">月度运营</span>
                  <span className="text-sm font-semibold text-gray-700">
                    ¥{personalizedRecommendations.budgetPlan.monthlyCosts.total.toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-1">成本优化建议</div>
                <div className="text-xs text-muted-foreground">
                  {personalizedRecommendations.budgetPlan.costOptimization?.[0] || '成本优化建议生成中...'}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 团队配置 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-indigo-600" />
                团队配置
              </CardTitle>
              <CardDescription>
                基于AI能力需求的团队建议
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm font-medium mb-2">核心团队</div>
                <div className="flex flex-wrap gap-1">
                  {personalizedRecommendations.teamRecommendations.coreTeam.map((role, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2">专业顾问</div>
                <div className="flex flex-wrap gap-1">
                  {personalizedRecommendations.teamRecommendations.advisorTypes.map((advisor, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {advisor}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="w-3 h-3 text-indigo-500" />
                <span>支持分阶段团队扩展</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </motion.div>
  )
}

// 辅助函数
function getAICapabilityLabel(key: string): string {
  const labels = {
    nlp: '自然语言处理',
    cv: '计算机视觉',
    ml: '机器学习',
    recommendation: '推荐系统',
    generation: '内容生成',
    automation: '自动化'
  }
  return labels[key as keyof typeof labels] || key
}

export default RealtimeRecommendationDisplay