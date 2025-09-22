'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface DailySubmissionStats {
  date: string;
  freeSubmissions: number;
  paidSubmissions: number;
  totalSubmissions: number;
}

interface SubmissionLimitConfig {
  dailyFreeLimit: number;
  costPerSubmission: number;
}

interface UseSubmissionLimitReturn {
  // 状态
  isLoading: boolean;
  todayStats: DailySubmissionStats;
  remainingFreeSubmissions: number;
  hasFreeSlotsAvailable: boolean;
  nextSubmissionCost: number;

  // 配置
  config: SubmissionLimitConfig;

  // 方法
  canSubmitIdea: (userCredits: number) => {
    canSubmit: boolean;
    reason?: string;
    cost: number;
    isFree: boolean;
  };
  recordSubmission: (cost: number) => Promise<void>;
  resetDailyCount: () => void;
}

const DEFAULT_CONFIG: SubmissionLimitConfig = {
  dailyFreeLimit: 3,
  costPerSubmission: 50 // 每次付费提交消耗50积分
};

export function useSubmissionLimit(): UseSubmissionLimitReturn {
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [todayStats, setTodayStats] = useState<DailySubmissionStats>({
    date: new Date().toDateString(),
    freeSubmissions: 0,
    paidSubmissions: 0,
    totalSubmissions: 0
  });

  const config = DEFAULT_CONFIG;

  // 初始化今日统计数据
  const initializeTodayStats = useCallback(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    const today = new Date().toDateString();
    const savedStats = localStorage.getItem('dailySubmissionStats');

    if (savedStats) {
      try {
        const parsed: DailySubmissionStats = JSON.parse(savedStats);

        // 如果是新的一天，重置统计
        if (parsed.date !== today) {
          const newStats: DailySubmissionStats = {
            date: today,
            freeSubmissions: 0,
            paidSubmissions: 0,
            totalSubmissions: 0
          };
          setTodayStats(newStats);
          localStorage.setItem('dailySubmissionStats', JSON.stringify(newStats));
        } else {
          setTodayStats(parsed);
        }
      } catch (error) {
        console.error('解析提交统计数据失败:', error);
        // 创建新的统计数据
        const newStats: DailySubmissionStats = {
          date: today,
          freeSubmissions: 0,
          paidSubmissions: 0,
          totalSubmissions: 0
        };
        setTodayStats(newStats);
        localStorage.setItem('dailySubmissionStats', JSON.stringify(newStats));
      }
    } else {
      // 首次使用，创建新的统计数据
      const newStats: DailySubmissionStats = {
        date: today,
        freeSubmissions: 0,
        paidSubmissions: 0,
        totalSubmissions: 0
      };
      setTodayStats(newStats);
      localStorage.setItem('dailySubmissionStats', JSON.stringify(newStats));
    }

    setIsLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    initializeTodayStats();
  }, [initializeTodayStats]);

  // 计算剩余免费次数
  const remainingFreeSubmissions = Math.max(0, config.dailyFreeLimit - todayStats.freeSubmissions);
  const hasFreeSlotsAvailable = remainingFreeSubmissions > 0;
  const nextSubmissionCost = hasFreeSlotsAvailable ? 0 : config.costPerSubmission;

  // 检查是否可以提交创意
  const canSubmitIdea = useCallback((userCredits: number = 0) => {
    if (!isAuthenticated) {
      return {
        canSubmit: false,
        reason: '请先登录',
        cost: 0,
        isFree: false
      };
    }

    // 如果还有免费次数
    if (hasFreeSlotsAvailable) {
      return {
        canSubmit: true,
        cost: 0,
        isFree: true
      };
    }

    // 如果没有免费次数，检查积分是否足够
    if (userCredits >= config.costPerSubmission) {
      return {
        canSubmit: true,
        cost: config.costPerSubmission,
        isFree: false
      };
    }

    return {
      canSubmit: false,
      reason: `积分不足，需要 ${config.costPerSubmission} 积分`,
      cost: config.costPerSubmission,
      isFree: false
    };
  }, [isAuthenticated, hasFreeSlotsAvailable, config.costPerSubmission]);

  // 记录提交
  const recordSubmission = useCallback(async (cost: number) => {
    const today = new Date().toDateString();
    const isFreeSubmission = cost === 0;

    const newStats: DailySubmissionStats = {
      date: today,
      freeSubmissions: todayStats.freeSubmissions + (isFreeSubmission ? 1 : 0),
      paidSubmissions: todayStats.paidSubmissions + (isFreeSubmission ? 0 : 1),
      totalSubmissions: todayStats.totalSubmissions + 1
    };

    setTodayStats(newStats);
    localStorage.setItem('dailySubmissionStats', JSON.stringify(newStats));

    // 如果是付费提交，从用户积分中扣除
    if (!isFreeSubmission && user) {
      const currentUser = JSON.parse(localStorage.getItem('auth.user') || '{}');
      currentUser.credits = Math.max(0, (currentUser.credits || 0) - cost);
      localStorage.setItem('auth.user', JSON.stringify(currentUser));
    }
  }, [todayStats, user]);

  // 重置每日计数（主要用于测试）
  const resetDailyCount = useCallback(() => {
    const today = new Date().toDateString();
    const newStats: DailySubmissionStats = {
      date: today,
      freeSubmissions: 0,
      paidSubmissions: 0,
      totalSubmissions: 0
    };
    setTodayStats(newStats);
    localStorage.setItem('dailySubmissionStats', JSON.stringify(newStats));
  }, []);

  return {
    isLoading,
    todayStats,
    remainingFreeSubmissions,
    hasFreeSlotsAvailable,
    nextSubmissionCost,
    config,
    canSubmitIdea,
    recordSubmission,
    resetDailyCount
  };
}