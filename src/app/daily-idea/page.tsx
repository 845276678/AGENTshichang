'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Clock, Star, Heart, MessageCircle, Share2, Trophy, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface DailyIdea {
  id: string;
  title: string;
  description: string;
  maturity: number;
  domain: string[];
  refreshDate: Date;
  guidingQuestions: string[];
  implementationHints: string[];
  timeToNext: number; // 距离下次刷新的秒数
}

interface UserFeedback {
  id: string;
  type: 'improvement' | 'implementation' | 'market_insight' | 'risk_analysis';
  content: string;
  quality: number;
}

export default function DailyIdeaPage() {
  const [dailyIdea, setDailyIdea] = useState&lt;DailyIdea | null&gt;(null);
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState&lt;UserFeedback['type']&gt;('improvement');
  const [userPoints, setUserPoints] = useState(0);
  const [timeToNext, setTimeToNext] = useState(0);
  const [showThinkingTools, setShowThinkingTools] = useState(false);
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayIdea();
    fetchUserPoints();
  }, []);

  useEffect(() => {
    if (dailyIdea) {
      const timer = setInterval(() => {
        setTimeToNext(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [dailyIdea]);

  const fetchTodayIdea = async () => {
    try {
      const response = await fetch('/api/daily-idea/today');
      if (response.ok) {
        const data = await response.json();
        setDailyIdea(data.idea);
        setTimeToNext(data.timeToNext);
        setHasSubmittedToday(data.hasSubmittedToday);
      }
    } catch (error) {
      toast.error('获取今日创意失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPoints = async () => {
    try {
      const response = await fetch('/api/user/points');
      if (response.ok) {
        const data = await response.json();
        setUserPoints(data.points);
      }
    } catch (error) {
      console.error('获取用户积分失败:', error);
    }
  };

  const submitFeedback = async () => {
    if (!feedback.trim()) {
      toast.error('请输入反馈内容');
      return;
    }

    try {
      const response = await fetch('/api/daily-idea/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaId: dailyIdea?.id,
          type: feedbackType,
          content: feedback
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`反馈提交成功！获得 ${data.points} 积分`);
        setFeedback('');
        setHasSubmittedToday(true);
        setUserPoints(prev => prev + data.points);
      } else {
        const error = await response.json();
        toast.error(error.message || '提交失败');
      }
    } catch (error) {
      toast.error('提交失败，请重试');
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getMaturityColor = (maturity: number) => {
    if (maturity < 30) return 'text-red-600 bg-red-50';
    if (maturity < 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getMaturityLabel = (maturity: number) => {
    if (maturity < 30) return '概念期';
    if (maturity < 60) return '发展期';
    return '成熟期';
  };

  if (loading) {
    return (
      &lt;div className="container mx-auto px-4 py-8"&gt;
        &lt;div className="max-w-4xl mx-auto"&gt;
          &lt;div className="animate-pulse"&gt;
            &lt;div className="h-8 bg-gray-200 rounded w-1/3 mb-6"&gt;&lt;/div&gt;
            &lt;div className="h-64 bg-gray-200 rounded mb-4"&gt;&lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    );
  }

  if (!dailyIdea) {
    return (
      &lt;div className="container mx-auto px-4 py-8"&gt;
        &lt;div className="max-w-4xl mx-auto text-center"&gt;
          &lt;h1 className="text-2xl font-bold mb-4"&gt;暂无今日创意&lt;/h1&gt;
          &lt;p className="text-gray-600"&gt;请稍后重试&lt;/p&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    );
  }

  return (
    &lt;div className="container mx-auto px-4 py-8"&gt;
      &lt;div className="max-w-4xl mx-auto"&gt;
        {/* 页面标题和积分显示 */}
        &lt;div className="flex justify-between items-center mb-8"&gt;
          &lt;div&gt;
            &lt;h1 className="text-3xl font-bold text-gray-900"&gt;每日一创意&lt;/h1&gt;
            &lt;p className="text-gray-600 mt-2"&gt;每天8点刷新，培养你的创意思维&lt;/p&gt;
          &lt;/div&gt;
          &lt;div className="flex items-center gap-4"&gt;
            &lt;div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-lg"&gt;
              &lt;Trophy className="w-5 h-5 text-amber-600" /&gt;
              &lt;span className="font-semibold text-amber-700"&gt;{userPoints} 积分&lt;/span&gt;
            &lt;/div&gt;
            &lt;div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg"&gt;
              &lt;Clock className="w-5 h-5 text-blue-600" /&gt;
              &lt;span className="font-mono text-blue-700"&gt;{formatTime(timeToNext)}&lt;/span&gt;
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;

        {/* 今日创意卡片 */}
        &lt;Card className="mb-8 shadow-lg"&gt;
          &lt;CardHeader&gt;
            &lt;div className="flex justify-between items-start"&gt;
              &lt;div className="flex-1"&gt;
                &lt;CardTitle className="text-2xl mb-2"&gt;{dailyIdea.title}&lt;/CardTitle&gt;
                &lt;CardDescription className="text-base"&gt;{dailyIdea.description}&lt;/CardDescription&gt;
              &lt;/div&gt;
              &lt;div className="flex flex-col items-end gap-2"&gt;
                &lt;Badge className={`${getMaturityColor(dailyIdea.maturity)} px-3 py-1`}&gt;
                  {getMaturityLabel(dailyIdea.maturity)}
                &lt;/Badge&gt;
                &lt;div className="text-sm text-gray-500"&gt;
                  成熟度: {dailyIdea.maturity}%
                &lt;/div&gt;
              &lt;/div&gt;
            &lt;/div&gt;
          &lt;/CardHeader&gt;
          &lt;CardContent&gt;
            &lt;div className="mb-4"&gt;
              &lt;Progress value={dailyIdea.maturity} className="h-2" /&gt;
            &lt;/div&gt;

            {/* 领域标签 */}
            &lt;div className="flex flex-wrap gap-2 mb-6"&gt;
              {dailyIdea.domain.map((tag, index) =&gt; (
                &lt;Badge key={index} variant="secondary"&gt;
                  {tag}
                &lt;/Badge&gt;
              ))}
            &lt;/div&gt;

            {/* 操作按钮 */}
            &lt;div className="flex gap-4 mb-6"&gt;
              &lt;Button
                onClick={() =&gt; setShowThinkingTools(!showThinkingTools)}
                variant="outline"
                className="flex items-center gap-2"
              &gt;
                &lt;TrendingUp className="w-4 h-4" /&gt;
                {showThinkingTools ? '隐藏' : '展开'}思考工具
              &lt;/Button&gt;
              &lt;Button variant="outline" className="flex items-center gap-2"&gt;
                &lt;Heart className="w-4 h-4" /&gt;
                收藏
              &lt;/Button&gt;
              &lt;Button variant="outline" className="flex items-center gap-2"&gt;
                &lt;Share2 className="w-4 h-4" /&gt;
                分享
              &lt;/Button&gt;
            &lt;/div&gt;

            {/* 思考工具展开区域 */}
            {showThinkingTools && (
              &lt;div className="border rounded-lg p-6 bg-gray-50 mb-6"&gt;
                &lt;h3 className="font-semibold text-lg mb-4"&gt;思考引导&lt;/h3&gt;

                &lt;div className="grid md:grid-cols-2 gap-6"&gt;
                  &lt;div&gt;
                    &lt;h4 className="font-medium text-gray-900 mb-3"&gt;引导问题&lt;/h4&gt;
                    &lt;ul className="space-y-2"&gt;
                      {dailyIdea.guidingQuestions.map((question, index) =&gt; (
                        &lt;li key={index} className="flex items-start gap-2"&gt;
                          &lt;span className="text-blue-600 font-medium"&gt;•&lt;/span&gt;
                          &lt;span className="text-gray-700"&gt;{question}&lt;/span&gt;
                        &lt;/li&gt;
                      ))}
                    &lt;/ul&gt;
                  &lt;/div&gt;

                  &lt;div&gt;
                    &lt;h4 className="font-medium text-gray-900 mb-3"&gt;实施提示&lt;/h4&gt;
                    &lt;ul className="space-y-2"&gt;
                      {dailyIdea.implementationHints.map((hint, index) =&gt; (
                        &lt;li key={index} className="flex items-start gap-2"&gt;
                          &lt;span className="text-green-600 font-medium"&gt;✓&lt;/span&gt;
                          &lt;span className="text-gray-700"&gt;{hint}&lt;/span&gt;
                        &lt;/li&gt;
                      ))}
                    &lt;/ul&gt;
                  &lt;/div&gt;
                &lt;/div&gt;
              &lt;/div&gt;
            )}
          &lt;/CardContent&gt;
        &lt;/Card&gt;

        {/* 反馈提交区域 */}
        &lt;Card&gt;
          &lt;CardHeader&gt;
            &lt;CardTitle className="flex items-center gap-2"&gt;
              &lt;MessageCircle className="w-5 h-5" /&gt;
              分享你的想法
            &lt;/CardTitle&gt;
            &lt;CardDescription&gt;
              提供有价值的反馈可获得积分奖励
            &lt;/CardDescription&gt;
          &lt;/CardHeader&gt;
          &lt;CardContent&gt;
            {hasSubmittedToday ? (
              &lt;div className="text-center py-8 text-gray-500"&gt;
                &lt;Star className="w-12 h-12 mx-auto mb-3 text-gray-400" /&gt;
                &lt;p&gt;今日已提交反馈，明天再来吧！&lt;/p&gt;
              &lt;/div&gt;
            ) : (
              &lt;div className="space-y-4"&gt;
                {/* 反馈类型选择 */}
                &lt;div&gt;
                  &lt;label className="block text-sm font-medium text-gray-700 mb-2"&gt;
                    反馈类型
                  &lt;/label&gt;
                  &lt;div className="flex flex-wrap gap-2"&gt;
                    {[
                      { value: 'improvement', label: '改进建议', desc: '如何优化这个创意' },
                      { value: 'implementation', label: '实施方案', desc: '具体落地步骤' },
                      { value: 'market_insight', label: '市场洞察', desc: '市场机会分析' },
                      { value: 'risk_analysis', label: '风险分析', desc: '潜在问题识别' }
                    ].map((type) =&gt; (
                      &lt;Button
                        key={type.value}
                        variant={feedbackType === type.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() =&gt; setFeedbackType(type.value as UserFeedback['type'])}
                        className="flex flex-col items-start p-3 h-auto"
                      &gt;
                        &lt;span className="font-medium"&gt;{type.label}&lt;/span&gt;
                        &lt;span className="text-xs opacity-70"&gt;{type.desc}&lt;/span&gt;
                      &lt;/Button&gt;
                    ))}
                  &lt;/div&gt;
                &lt;/div&gt;

                {/* 反馈内容 */}
                &lt;div&gt;
                  &lt;label className="block text-sm font-medium text-gray-700 mb-2"&gt;
                    反馈内容 (最少100字获得积分)
                  &lt;/label&gt;
                  &lt;Textarea
                    value={feedback}
                    onChange={(e) =&gt; setFeedback(e.target.value)}
                    placeholder="请详细描述你的想法和建议..."
                    className="min-h-32"
                  /&gt;
                  &lt;div className="flex justify-between items-center mt-2"&gt;
                    &lt;span className="text-sm text-gray-500"&gt;
                      {feedback.length} / 最少100字
                    &lt;/span&gt;
                    &lt;span className="text-sm text-green-600"&gt;
                      预计获得: {Math.min(8, Math.floor(feedback.length / 50) + 2)} 积分
                    &lt;/span&gt;
                  &lt;/div&gt;
                &lt;/div&gt;

                {/* 提交按钮 */}
                &lt;Button
                  onClick={submitFeedback}
                  disabled={feedback.length &lt; 100}
                  className="w-full"
                &gt;
                  提交反馈
                &lt;/Button&gt;
              &lt;/div&gt;
            )}
          &lt;/CardContent&gt;
        &lt;/Card&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  );
}