'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useSubmissionLimit } from '@/hooks/useSubmissionLimit';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Lightbulb,
  Coins,
  Gift,
  AlertCircle,
  TrendingUp,
  Calendar,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';

interface SubmissionStatusProps {
  className?: string;
  showDetails?: boolean;
}

export function SubmissionStatus({ className, showDetails = true }: SubmissionStatusProps) {
  const { user } = useAuth();
  const {
    isLoading,
    todayStats,
    remainingFreeSubmissions,
    hasFreeSlotsAvailable,
    nextSubmissionCost,
    config,
    canSubmitIdea
  } = useSubmissionLimit();

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            <span className="text-muted-foreground">加载提交状态...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const userCredits = user?.credits || 0;
  const submissionCheck = canSubmitIdea(userCredits);
  const usagePercentage = (todayStats.totalSubmissions / (config.dailyFreeLimit + 5)) * 100; // 假设最多8次

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            今日创意提交
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 免费次数状态 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">免费提交次数</span>
              <Badge variant={hasFreeSlotsAvailable ? "default" : "secondary"}>
                {remainingFreeSubmissions} / {config.dailyFreeLimit}
              </Badge>
            </div>

            <Progress
              value={(config.dailyFreeLimit - remainingFreeSubmissions) / config.dailyFreeLimit * 100}
              className="h-2"
            />

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Gift className="h-3 w-3" />
              {hasFreeSlotsAvailable ? (
                <span>还可以免费提交 {remainingFreeSubmissions} 次创意</span>
              ) : (
                <span>今日免费次数已用完</span>
              )}
            </div>
          </div>

          {/* 下次提交成本 */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Coins className={`h-4 w-4 ${nextSubmissionCost > 0 ? 'text-amber-500' : 'text-green-500'}`} />
              <span className="text-sm font-medium">下次提交</span>
            </div>

            <div className="text-right">
              {nextSubmissionCost > 0 ? (
                <div>
                  <div className="text-sm font-bold text-amber-600">
                    {nextSubmissionCost} 积分
                  </div>
                  <div className="text-xs text-muted-foreground">付费提交</div>
                </div>
              ) : (
                <div>
                  <div className="text-sm font-bold text-green-600">免费</div>
                  <div className="text-xs text-muted-foreground">免费额度</div>
                </div>
              )}
            </div>
          </div>

          {/* 当前积分显示 */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">当前积分</span>
            </div>
            <div className="text-lg font-bold text-primary">
              {userCredits.toLocaleString()}
            </div>
          </div>

          {/* 提交状态和操作按钮 */}
          <div className="space-y-3">
            {!submissionCheck.canSubmit && (
              <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-red-700 dark:text-red-300">
                    无法提交创意
                  </div>
                  <div className="text-xs text-red-600 dark:text-red-400">
                    {submissionCheck.reason}
                  </div>
                </div>
              </div>
            )}

            {!hasFreeSlotsAvailable && userCredits < nextSubmissionCost && (
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/payment">
                  <Coins className="h-4 w-4 mr-2" />
                  充值积分继续提交
                </Link>
              </Button>
            )}
          </div>

          {/* 详细统计 */}
          {showDetails && (
            <div className="pt-4 border-t space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4" />
                今日提交统计
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="space-y-1">
                  <div className="text-lg font-bold text-green-600">
                    {todayStats.freeSubmissions}
                  </div>
                  <div className="text-xs text-muted-foreground">免费提交</div>
                </div>

                <div className="space-y-1">
                  <div className="text-lg font-bold text-amber-600">
                    {todayStats.paidSubmissions}
                  </div>
                  <div className="text-xs text-muted-foreground">付费提交</div>
                </div>

                <div className="space-y-1">
                  <div className="text-lg font-bold text-primary">
                    {todayStats.totalSubmissions}
                  </div>
                  <div className="text-xs text-muted-foreground">总提交</div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground text-center">
                明天 00:00 重置免费次数
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}