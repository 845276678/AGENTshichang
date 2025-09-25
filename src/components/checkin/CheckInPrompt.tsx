'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Gift,
  X,
  Coins
} from 'lucide-react';
import Link from 'next/link';

export function CheckInPrompt() {
  const { isAuthenticated } = useAuth();
  const [canCheckIn, setCanCheckIn] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    // 检查是否可以签到
    const savedData = localStorage.getItem('dailyCheckIn');
    const dismissedKey = `checkInPrompt_${new Date().toDateString()}`;
    const wasAlreadyDismissed = localStorage.getItem(dismissedKey);

    if (wasAlreadyDismissed) {
      setIsDismissed(true);
      return;
    }

    if (savedData) {
      const parsed = JSON.parse(savedData);
      const lastCheckIn = parsed.stats?.lastCheckIn;
      const today = new Date().toDateString();
      const canCheckInToday = !lastCheckIn || lastCheckIn !== today;

      setCanCheckIn(canCheckInToday);
      setIsVisible(canCheckInToday);
    } else {
      // 第一次使用，可以签到
      setCanCheckIn(true);
      setIsVisible(true);
    }
  }, [isAuthenticated]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);

    // 记住今天已经关闭过了
    const dismissedKey = `checkInPrompt_${new Date().toDateString()}`;
    localStorage.setItem(dismissedKey, 'true');
  };

  if (!isAuthenticated || !canCheckIn || isDismissed || !isVisible) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="checkin-prompt"
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        transition={{ duration: 0.3 }}
        className="fixed top-20 right-4 z-40 max-w-sm"
      >
        <div className="bg-gradient-to-r from-primary to-agent-500 text-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <Gift className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-1">每日签到</h4>
                  <p className="text-sm text-white/90 mb-3">
                    今天还没有签到哦！快来领取免费积分吧
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      asChild
                      size="sm"
                      variant="secondary"
                      className="text-primary"
                    >
                      <Link href="/checkin">
                        <Coins className="h-4 w-4 mr-1" />
                        立即签到
                      </Link>
                    </Button>
                    <Badge variant="secondary" className="text-primary text-xs">
                      +10积分
                    </Badge>
                  </div>
                </div>
              </div>

              <button
                onClick={handleDismiss}
                className="text-white/70 hover:text-white transition-colors p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}