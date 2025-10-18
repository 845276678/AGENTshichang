'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Award,
  Zap,
  BarChart3
} from 'lucide-react'
import { AI_PERSONAS } from '@/lib/ai-persona-enhanced'

interface BidChange {
  personaId: string
  oldBid: number
  newBid: number
  timestamp: Date
  change: number
  changePercent: number
}

interface DynamicBidVisualizationProps {
  currentBids: Record<string, number>
  highestBid: number
  className?: string
  showAnimations?: boolean
  showHistory?: boolean
}

// 出价历史跟踪
const useBidHistory = (currentBids: Record<string, number>) => {
  const [bidHistory, setBidHistory] = useState<BidChange[]>([])
  const [previousBids, setPreviousBids] = useState<Record<string, number>>({})

  useEffect(() => {
    const changes: BidChange[] = []

    Object.entries(currentBids).forEach(([personaId, newBid]) => {
      const oldBid = previousBids[personaId] || 0

      if (newBid !== oldBid && newBid > 0) {
        const change = newBid - oldBid
        const changePercent = oldBid > 0 ? (change / oldBid) * 100 : 100

        changes.push({
          personaId,
          oldBid,
          newBid,
          timestamp: new Date(),
          change,
          changePercent
        })
      }
    })

    if (changes.length > 0) {
      setBidHistory(prev => [...changes, ...prev].slice(0, 20)) // 保留最近20条记录
    }

    setPreviousBids(currentBids)
  }, [currentBids, previousBids])

  return bidHistory
}

// 出价排行榜组件
const BidLeaderboard: React.FC<{
  bids: Record<string, number>
  highestBid: number
  showAnimations: boolean
}> = ({ bids, highestBid, showAnimations }) => {
  const sortedBids = useMemo(() => {
    return Object.entries(bids)
      .filter(([_, bid]) => bid > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([personaId, bid], index) => {
        const persona = AI_PERSONAS.find(p => p.id === personaId)
        return {
          personaId,
          personaName: persona?.name || personaId,
          specialty: persona?.specialty || '',
          bid,
          rank: index + 1,
          isLeader: bid === highestBid
        }
      })
  }, [bids, highestBid])

  return (
    <div className="space-y-2">
      {sortedBids.map((item, index) => {
        const bidPercentage = highestBid > 0 ? (item.bid / highestBid) * 100 : 0

        return (
          <div
            key={item.personaId}
            className={`relative flex items-center gap-3 p-3 rounded-lg border transition-all duration-500 ${
              item.isLeader
                ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 shadow-md'
                : 'bg-white border-gray-200 hover:border-blue-300'
            } ${showAnimations ? 'animate-in slide-in-from-left' : ''}`}
            style={{
              animationDelay: `${index * 0.05}s`,
              animationDuration: '0.5s'
            }}
          >
            {/* 背景进度条 */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-purple-100/50 rounded-lg transition-all duration-1000"
              style={{
                width: `${bidPercentage}%`,
                opacity: 0.3
              }}
            />

            {/* 排名标记 */}
            <div className="relative z-10 flex-shrink-0">
              {item.rank === 1 ? (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-white font-bold shadow-lg">
                  <Award className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-700 font-bold">
                  {item.rank}
                </div>
              )}
            </div>

            {/* 专家信息 */}
            <div className="relative z-10 flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-800 truncate">{item.personaName}</span>
                {item.isLeader && (
                  <Badge variant="default" className="bg-yellow-500 text-white text-xs">
                    领先
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-600 truncate">{item.specialty}</p>
            </div>

            {/* 出价金额 */}
            <div className="relative z-10 text-right flex-shrink-0">
              <div className={`text-lg font-bold ${
                item.isLeader ? 'text-orange-600' : 'text-blue-600'
              }`}>
                ¥{item.bid.toFixed(1)}
              </div>
              <div className="text-xs text-gray-500">
                {bidPercentage.toFixed(0)}%
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// 出价变化历史组件
const BidHistoryTimeline: React.FC<{
  history: BidChange[]
}> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-30" />
        <p className="text-sm">暂无出价变化记录</p>
      </div>
    )
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
      {history.map((change, index) => {
        const persona = AI_PERSONAS.find(p => p.id === change.personaId)
        const isIncrease = change.change > 0

        return (
          <div
            key={`${change.personaId}-${change.timestamp.getTime()}`}
            className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors animate-in fade-in"
            style={{
              animationDelay: `${index * 0.02}s`,
              animationDuration: '0.3s'
            }}
          >
            {/* 变化图标 */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              isIncrease ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {isIncrease ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
            </div>

            {/* 专家信息 */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {persona?.name || change.personaId}
              </p>
              <p className="text-xs text-gray-500">
                {change.timestamp.toLocaleTimeString('zh-CN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </p>
            </div>

            {/* 出价变化 */}
            <div className="text-right flex-shrink-0">
              <div className="text-sm font-semibold text-gray-800">
                ¥{change.oldBid.toFixed(1)} → ¥{change.newBid.toFixed(1)}
              </div>
              <div className={`text-xs font-medium ${
                isIncrease ? 'text-green-600' : 'text-red-600'
              }`}>
                {isIncrease ? '+' : ''}{change.change.toFixed(1)} ({change.changePercent.toFixed(0)}%)
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// 实时统计卡片
const BidStatistics: React.FC<{
  bids: Record<string, number>
  highestBid: number
}> = ({ bids, highestBid }) => {
  const stats = useMemo(() => {
    const bidValues = Object.values(bids).filter(bid => bid > 0)
    const totalBids = bidValues.length
    const averageBid = totalBids > 0
      ? bidValues.reduce((sum, bid) => sum + bid, 0) / totalBids
      : 0
    const totalValue = bidValues.reduce((sum, bid) => sum + bid, 0)

    return {
      totalBids,
      averageBid,
      highestBid,
      totalValue
    }
  }, [bids, highestBid])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-medium text-blue-700">最高出价</span>
        </div>
        <p className="text-2xl font-bold text-blue-900">¥{stats.highestBid.toFixed(1)}</p>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <span className="text-xs font-medium text-green-700">平均出价</span>
        </div>
        <p className="text-2xl font-bold text-green-900">¥{stats.averageBid.toFixed(1)}</p>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-4 h-4 text-purple-600" />
          <span className="text-xs font-medium text-purple-700">参与专家</span>
        </div>
        <p className="text-2xl font-bold text-purple-900">{stats.totalBids}</p>
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-orange-600" />
          <span className="text-xs font-medium text-orange-700">总估值</span>
        </div>
        <p className="text-2xl font-bold text-orange-900">¥{stats.totalValue.toFixed(1)}</p>
      </div>
    </div>
  )
}

// 主组件
export const DynamicBidVisualization: React.FC<DynamicBidVisualizationProps> = ({
  currentBids,
  highestBid,
  className = '',
  showAnimations = true,
  showHistory = true
}) => {
  const bidHistory = useBidHistory(currentBids)
  const hasBids = Object.values(currentBids).some(bid => bid > 0)

  if (!hasBids) {
    return (
      <Card className={`border-2 border-dashed border-gray-300 ${className}`}>
        <CardContent className="p-8 text-center">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">等待AI专家出价中...</h3>
          <p className="text-sm text-gray-500">
            AI专家正在分析您的创意，即将开始竞价
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 实时统计卡片 */}
      <BidStatistics bids={currentBids} highestBid={highestBid} />

      {/* 出价排行榜 */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            实时出价排行榜
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BidLeaderboard
            bids={currentBids}
            highestBid={highestBid}
            showAnimations={showAnimations}
          />
        </CardContent>
      </Card>

      {/* 出价变化历史 */}
      {showHistory && bidHistory.length > 0 && (
        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              出价变化历史
              <Badge variant="outline" className="ml-auto text-xs">
                {bidHistory.length} 条记录
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BidHistoryTimeline history={bidHistory} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default DynamicBidVisualization
