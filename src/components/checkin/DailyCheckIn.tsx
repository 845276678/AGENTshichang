'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Gift,
  Calendar,
  Coins,
  Star,
  CheckCircle,
  TrendingUp,
  Flame
} from 'lucide-react';

interface DailyReward {
  day: number;
  credits: number;
  bonus?: string;
  claimed: boolean;
}

interface CheckInStats {
  currentStreak: number;
  totalCheckIns: number;
  lastCheckIn: string | null;
  nextRewardMultiplier: number;
}

export function DailyCheckIn() {
  const { isAuthenticated } = useAuth();
  const [rewards, setRewards] = useState<DailyReward[]>([]);
  const [stats, setStats] = useState<CheckInStats>({
    currentStreak: 0,
    totalCheckIns: 0,
    lastCheckIn: null,
    nextRewardMultiplier: 1
  });
  const [canClaimToday, setCanClaimToday] = useState(false);
  const [isClaimingReward, setIsClaimingReward] = useState(false);
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [claimedCredits, setClaimedCredits] = useState(0);

  // 初始化每日奖励数据
  useEffect(() => {
    const initializeRewards = () => {
      const baseRewards = [
        { day: 1, credits: 10, claimed: false },
        { day: 2, credits: 15, claimed: false },
        { day: 3, credits: 20, claimed: false },
        { day: 4, credits: 25, claimed: false },
        { day: 5, credits: 30, claimed: false },
        { day: 6, credits: 40, claimed: false },
        { day: 7, credits: 100, bonus: '周奖励', claimed: false }
      ];

      // 从localStorage获取签到数据
      const savedData = localStorage.getItem('dailyCheckIn');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setStats(parsed.stats);
        setRewards(parsed.rewards || baseRewards);

        // 检查是否可以签到
        const lastCheckIn = parsed.stats.lastCheckIn;
        const today = new Date().toDateString();
        setCanClaimToday(!lastCheckIn || lastCheckIn !== today);
      } else {
        setRewards(baseRewards);
        setCanClaimToday(true);
      }
    };

    if (isAuthenticated) {
      initializeRewards();
    }
  }, [isAuthenticated]);

  // 领取今日奖励
  const claimTodayReward = async () => {
    if (!canClaimToday || isClaimingReward) return;

    setIsClaimingReward(true);

    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));

      const today = new Date().toDateString();
      const currentDay = (stats.currentStreak % 7) + 1;
      const todayReward = rewards.find(r => r.day === currentDay);

      if (todayReward) {
        const creditsToAdd = Math.floor(todayReward.credits * stats.nextRewardMultiplier);

        // 更新奖励状态
        const updatedRewards = rewards.map(r =>
          r.day === currentDay ? { ...r, claimed: true } : r
        );

        // 更新统计数据
        const newStats = {
          currentStreak: stats.currentStreak + 1,
          totalCheckIns: stats.totalCheckIns + 1,
          lastCheckIn: today,
          nextRewardMultiplier: stats.currentStreak >= 6 ? 1.5 : 1
        };

        // 保存到localStorage
        localStorage.setItem('dailyCheckIn', JSON.stringify({
          stats: newStats,
          rewards: updatedRewards
        }));

        // 更新用户积分（模拟）
        const currentUser = JSON.parse(localStorage.getItem('auth.user') || '{}');
        currentUser.credits = (currentUser.credits || 0) + creditsToAdd;
        localStorage.setItem('auth.user', JSON.stringify(currentUser));

        setStats(newStats);
        setRewards(updatedRewards);
        setCanClaimToday(false);
        setClaimedCredits(creditsToAdd);
        setShowRewardAnimation(true);

        // 3秒后隐藏动画
        setTimeout(() => {
          setShowRewardAnimation(false);
        }, 3000);
      }
    } catch (error) {
      console.error('领取奖励失败:', error);
    } finally {
      setIsClaimingReward(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const currentDay = (stats.currentStreak % 7) + 1;
  const todayReward = rewards.find(r => r.day === currentDay);

  return (
    <>
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              每日签到
            </CardTitle>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Flame className="h-3 w-3" />
              连签 {stats.currentStreak} 天
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 今日奖励 */}
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-2">今日奖励</div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Coins className="h-6 w-6 text-amber-500" />
              <span className="text-3xl font-bold text-primary">
                {todayReward ? Math.floor(todayReward.credits * stats.nextRewardMultiplier) : 10}
              </span>
              <span className="text-lg text-muted-foreground">积分</span>
            </div>

            {stats.nextRewardMultiplier > 1 && (
              <Badge variant="outline" className="mb-4">
                <TrendingUp className="h-3 w-3 mr-1" />
                连签奖励 +{((stats.nextRewardMultiplier - 1) * 100).toFixed(0)}%
              </Badge>
            )}

            <Button
              onClick={claimTodayReward}
              disabled={!canClaimToday || isClaimingReward}
              size="lg"
              className="w-full"
            >
              {isClaimingReward ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  领取中...
                </>
              ) : !canClaimToday ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  今日已签到
                </>
              ) : (
                <>
                  <Gift className="h-4 w-4 mr-2" />
                  领取积分
                </>
              )}
            </Button>
          </div>

          {/* 一周奖励预览 */}
          <div>
            <div className="text-sm font-medium mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              本周奖励
            </div>
            <div className="grid grid-cols-7 gap-2">
              {rewards.map((reward) => (
                <div
                  key={reward.day}
                  className={`
                    relative p-2 rounded-lg text-center text-xs border transition-colors
                    ${reward.day === currentDay
                      ? 'border-primary bg-primary/10'
                      : reward.claimed
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50'
                        : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                    }
                  `}
                >
                  <div className="font-medium">第{reward.day}天</div>
                  <div className="text-primary font-bold">{reward.credits}</div>
                  {reward.bonus && (
                    <div className="text-xs text-amber-600">{reward.bonus}</div>
                  )}
                  {reward.claimed && (
                    <CheckCircle className="absolute -top-1 -right-1 h-4 w-4 text-green-500 bg-white rounded-full" />
                  )}
                  {reward.day === currentDay && !reward.claimed && (
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full animate-pulse" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 统计信息 */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.totalCheckIns}</div>
              <div className="text-sm text-muted-foreground">累计签到</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-500">{stats.currentStreak}</div>
              <div className="text-sm text-muted-foreground">连续签到</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 奖励领取动画 */}
      <AnimatePresence mode="wait">
        {showRewardAnimation && (
          <motion.div
            key="reward-animation"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-2xl max-w-sm mx-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="inline-block mb-4"
              >
                <Coins className="h-16 w-16 text-amber-500" />
              </motion.div>

              <h3 className="text-2xl font-bold mb-2">签到成功！</h3>
              <p className="text-muted-foreground mb-4">
                恭喜获得 {claimedCredits} 积分奖励
              </p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex items-center justify-center gap-2 text-primary"
              >
                <Star className="h-5 w-5" />
                <span className="font-medium">连签 {stats.currentStreak} 天</span>
                <Star className="h-5 w-5" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}