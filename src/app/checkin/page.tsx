'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout';
import { useRequireAuth } from '@/hooks/useAuth';
import { DailyCheckIn } from '@/components/checkin/DailyCheckIn';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Gift,
  Calendar,
  Star,
  Trophy,
  Target,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CheckInPage() {
  const auth = useRequireAuth();

  if (!auth.isAuthenticated) {
    return null; // useRequireAuth will handle redirect
  }

  const checkInTips = [
    {
      icon: Calendar,
      title: '每日签到',
      description: '每天签到获得基础积分奖励',
      reward: '10-100积分'
    },
    {
      icon: Star,
      title: '连续签到',
      description: '连续签到获得额外奖励加成',
      reward: '+50%奖励'
    },
    {
      icon: Trophy,
      title: '周完成奖励',
      description: '完成一周签到获得丰厚奖励',
      reward: '100积分'
    },
    {
      icon: Target,
      title: '月度里程碑',
      description: '累计签到达到里程碑解锁特殊奖励',
      reward: '神秘奖励'
    }
  ];

  const recentActivities = [
    { date: '2024-01-20', action: '每日签到', reward: '+15积分' },
    { date: '2024-01-19', action: '每日签到', reward: '+10积分' },
    { date: '2024-01-18', action: '每日签到', reward: '+10积分' },
    { date: '2024-01-17', action: '周完成奖励', reward: '+100积分' },
    { date: '2024-01-17', action: '每日签到', reward: '+10积分' }
  ];

  return (
    <Layout>
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                返回
              </Button>
            </div>

            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
                <Gift className="h-8 w-8 text-primary" />
                每日签到
              </h1>
              <p className="text-muted-foreground">
                每天签到获得积分奖励，连续签到还有额外加成哦！
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左侧主要内容 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 每日签到组件 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <DailyCheckIn />
              </motion.div>

              {/* 签到说明 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-amber-500" />
                      签到奖励说明
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {checkInTips.map((tip, index) => {
                        const Icon = tip.icon;
                        return (
                          <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <Icon className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <h4 className="font-medium mb-1">{tip.title}</h4>
                              <p className="text-sm text-muted-foreground mb-2">{tip.description}</p>
                              <Badge variant="secondary" className="text-xs">
                                {tip.reward}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* 右侧侧边栏 */}
            <div className="space-y-6">
              {/* 最近活动 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Clock className="h-5 w-5" />
                      最近活动
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentActivities.map((activity, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                          <div>
                            <div className="text-sm font-medium">{activity.action}</div>
                            <div className="text-xs text-muted-foreground">{activity.date}</div>
                          </div>
                          <Badge variant="outline" className="text-xs text-green-600">
                            {activity.reward}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* 积分统计 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Trophy className="h-5 w-5 text-amber-500" />
                      积分统计
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {auth.user?.credits || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">当前积分</div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">+135</div>
                          <div className="text-xs text-muted-foreground">本周获得</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">+520</div>
                          <div className="text-xs text-muted-foreground">本月获得</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}