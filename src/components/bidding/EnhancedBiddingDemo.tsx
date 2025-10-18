'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  TrendingUp,
  MessageSquare,
  Brain,
  DollarSign,
  Users,
  Lightbulb,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Play,
  Pause
} from 'lucide-react'
import { AI_PERSONAS } from '@/lib/ai-persona-enhanced'
import {
  calculateDynamicBid,
  calculateAllBiddingStrategies,
  analyzeSupplementQuality,
  type BiddingContext,
  type BiddingStrategy
} from '@/lib/bidding/enhanced-bidding-strategy'
import {
  generateDebateMessages,
  generateDebateSummary,
  type DebateMessage
} from '@/lib/bidding/ai-debate-system'

interface EnhancedBiddingDemoProps {
  ideaContent: string
  userSupplements: Array<{
    category: string
    content: string
    timestamp: Date
  }>
  className?: string
}

export const EnhancedBiddingDemo: React.FC<EnhancedBiddingDemoProps> = ({
  ideaContent,
  userSupplements = [],
  className = ''
}) => {
  const [strategies, setStrategies] = useState<Record<string, BiddingStrategy>>({})
  const [debateMessages, setDebateMessages] = useState<DebateMessage[]>([])
  const [isCalculating, setIsCalculating] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [animatedBids, setAnimatedBids] = useState<Record<string, number>>({})
  const [currentRound, setCurrentRound] = useState(0)
  const [isDebating, setIsDebating] = useState(false)

  // 模拟竞价上下文
  const biddingContext: BiddingContext = {
    ideaContent,
    userSupplements,
    currentBids: animatedBids,
    aiMessages: [],
    phase: 'bidding'
  }

  // 计算增强出价策略
  const calculateStrategies = async () => {
    setIsCalculating(true)

    // 模拟计算延迟，增加真实感
    await new Promise(resolve => setTimeout(resolve, 1500))

    const newStrategies = calculateAllBiddingStrategies(AI_PERSONAS, biddingContext)
    setStrategies(newStrategies)

    // 动画显示出价结果
    animateBidding(newStrategies)

    setIsCalculating(false)
  }

  // 动画展示出价过程
  const animateBidding = (strategies: Record<string, BiddingStrategy>) => {
    setAnimatedBids({})

    const personas = Object.keys(strategies)
    personas.forEach((personaId, index) => {
      setTimeout(() => {
        setAnimatedBids(prev => ({
          ...prev,
          [personaId]: strategies[personaId].finalBid
        }))
      }, index * 300)
    })
  }

  // 生成AI辩论
  const generateDebate = async () => {
    setIsDebating(true)
    setDebateMessages([])

    // 模拟逐条生成辩论消息
    const messages = generateDebateMessages(AI_PERSONAS, ideaContent, 2)

    for (let i = 0; i < messages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000))
      setDebateMessages(prev => [...prev, messages[i]])
    }

    setIsDebating(false)
  }

  // 获取出价排名
  const sortedStrategies = Object.values(strategies).sort((a, b) => b.finalBid - a.finalBid)

  // 计算补充内容质量
  const supplementQuality = analyzeSupplementQuality(userSupplements)

  return (
    <div className={`enhanced-bidding-demo space-y-6 ${className}`}>
      {/* 控制面板 */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-600" />
            增强AI竞价系统演示
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={calculateStrategies}
              disabled={isCalculating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isCalculating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  计算中...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4 mr-2" />
                  计算智能出价
                </>
              )}
            </Button>

            <Button
              onClick={generateDebate}
              disabled={isDebating || !ideaContent}
              variant="outline"
              className="border-green-500 text-green-600 hover:bg-green-50"
            >
              {isDebating ? (
                <>
                  <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin mr-2" />
                  辩论中...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  AI专家辩论
                </>
              )}
            </Button>

            <Button
              onClick={() => setShowDetails(!showDetails)}
              variant="ghost"
            >
              {showDetails ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" />
                  隐藏详情
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  显示详情
                </>
              )}
            </Button>
          </div>

          {/* 补充内容质量指示器 */}
          {userSupplements.length > 0 && (
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">用户补充内容质量</span>
                <span className="text-sm font-bold text-blue-600">
                  {(supplementQuality * 100).toFixed(0)}%
                </span>
              </div>
              <Progress value={supplementQuality * 100} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                质量越高，AI专家出价越积极
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 智能出价结果 */}
      {sortedStrategies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              智能出价排行榜
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sortedStrategies.map((strategy, index) => {
                const persona = AI_PERSONAS.find(p => p.id === strategy.personaId)
                const animatedBid = animatedBids[strategy.personaId] || 0

                return (
                  <div
                    key={strategy.personaId}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border transition-all duration-300 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant={index === 0 ? "default" : "outline"}>
                        #{index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{persona?.name || strategy.personaId}</p>
                        <p className="text-sm text-gray-600">{persona?.specialty}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        ¥{animatedBid.toFixed(1)}
                      </div>
                      {showDetails && (
                        <div className="text-xs text-gray-500 space-y-1 mt-2">
                          <div>用户补充: +{strategy.adjustmentFactors.userSupplement}</div>
                          <div>竞争调整: +{strategy.adjustmentFactors.competitorBids}</div>
                          <div>信心度: +{strategy.adjustmentFactors.confidence}</div>
                          <div>市场趋势: +{strategy.adjustmentFactors.marketTrend}</div>
                          <div>个性调整: {strategy.adjustmentFactors.personalityBonus >= 0 ? '+' : ''}{strategy.adjustmentFactors.personalityBonus}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {showDetails && sortedStrategies.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-3">出价策略分析</h4>
                <div className="space-y-2 text-sm text-blue-700">
                  {sortedStrategies[0].reasoning.map((reason, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI专家辩论 */}
      {(debateMessages.length > 0 || isDebating) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              AI专家辩论
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {debateMessages.map((message, index) => {
                const persona = AI_PERSONAS.find(p => p.id === message.personaId)

                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 p-4 rounded-lg border transition-all duration-300 ${
                      message.emotion === 'confident' ? 'bg-green-50 border-green-200' :
                      message.emotion === 'skeptical' ? 'bg-yellow-50 border-yellow-200' :
                      message.emotion === 'aggressive' ? 'bg-red-50 border-red-200' :
                      'bg-gray-50 border-gray-200'
                    }`}
                    style={{
                      animation: `slideIn 0.5s ease-out ${index * 0.1}s both`
                    }}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                      {persona?.name.charAt(0) || 'A'}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{persona?.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {message.type === 'debate' ? '观点' :
                           message.type === 'counter' ? '反驳' : '补充'}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {message.timestamp.toLocaleTimeString('zh-CN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-gray-700">{message.content}</p>
                    </div>
                  </div>
                )
              })}

              {isDebating && (
                <div className="flex items-center justify-center p-4">
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <span className="ml-2">AI专家正在思考...</span>
                  </div>
                </div>
              )}
            </div>

            {debateMessages.length > 0 && (
              <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                <h5 className="font-medium text-purple-800 mb-2">辩论摘要</h5>
                <p className="text-sm text-purple-700">
                  {generateDebateSummary(debateMessages)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* CSS 动画 */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default EnhancedBiddingDemo