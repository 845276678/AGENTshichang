'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout';
import { useRequireAuth } from '@/hooks/useAuth';
import { ProfileInformation } from '@/components/dashboard/profile/ProfileInformation';
import { AccountSettings } from '@/components/dashboard/profile/AccountSettings';
import { SecuritySettings } from '@/components/dashboard/profile/SecuritySettings';
import { SubscriptionBilling } from '@/components/dashboard/profile/SubscriptionBilling';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Settings,
  Shield,
  CreditCard,
  ArrowLeft,
  Edit,
  Star,
  Trophy,
  Target,
  Calendar
} from 'lucide-react';

type TabType = 'profile' | 'account' | 'security' | 'billing';

export default function ProfilePage() {
  const auth = useRequireAuth();
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  if (!auth.isAuthenticated || !auth.user) {
    return null; // useRequireAuth will handle redirect
  }

  const { user } = auth;

  const tabs = [
    {
      id: 'profile' as TabType,
      label: '个人信息',
      icon: User,
      description: '管理您的个人资料和公开信息'
    },
    {
      id: 'account' as TabType,
      label: '账户设置',
      icon: Settings,
      description: '通知偏好和隐私设置'
    },
    {
      id: 'security' as TabType,
      label: '安全设置',
      icon: Shield,
      description: '密码和双重验证'
    },
    {
      id: 'billing' as TabType,
      label: '账单订阅',
      icon: CreditCard,
      description: '订阅计划和付费历史'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileInformation />;
      case 'account':
        return <AccountSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'billing':
        return <SubscriptionBilling />;
      default:
        return <ProfileInformation />;
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="max-w-6xl mx-auto">
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

            {/* Profile Header Card */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 dark:from-blue-950/50 dark:to-purple-950/50 dark:border-blue-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-r from-primary to-agent-500 flex items-center justify-center">
                    <User className="h-10 w-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-bold">
                        {user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email}
                      </h1>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {user.role === 'ADMIN' ? '管理员' : user.role === 'MODERATOR' ? '版主' : '普通用户'}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">
                      @{user.username || user.email?.split('@')[0]}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        加入于 {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '未知'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        积分: {user.credits || 0}
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        已分享创意: 0
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab('profile')}
                      className="gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      编辑资料
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1"
            >
              <Card>
                <CardContent className="p-4">
                  <nav className="space-y-2">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;

                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                            isActive
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'hover:bg-accent hover:text-accent-foreground'
                          }`}
                        >
                          <Icon className="h-5 w-5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{tab.label}</div>
                            <div className={`text-xs mt-0.5 ${
                              isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                            }`}>
                              {tab.description}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </nav>
                </CardContent>
              </Card>
            </motion.div>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-3"
            >
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {renderTabContent()}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}