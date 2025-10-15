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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!dailyIdea) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">暂无今日创意</h1>
          <p className="text-gray-600">请稍后重试</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* 页面标题和积分显示 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">每日一创意</h1>
            <p className="text-gray-600 mt-2">每天8点刷新，培养你的创意思维</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-lg">
              <Trophy className="w-5 h-5 text-amber-600" />
              <span className="font-semibold text-amber-700">{userPoints} 积分</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="font-mono text-blue-700">{formatTime(timeToNext)}</span>
            </div>
          </div>
        </div>

        {/* 今日创意卡片 */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{dailyIdea.title}</CardTitle>
                <CardDescription className="text-base">{dailyIdea.description}</CardDescription>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge className={`${getMaturityColor(dailyIdea.maturity)} px-3 py-1`}>
                  {getMaturityLabel(dailyIdea.maturity)}
                </Badge>
                <div className="text-sm text-gray-500">
                  成熟度: {dailyIdea.maturity}%
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Progress value={dailyIdea.maturity} className="h-2" />
            </div>

            {/* 领域标签 */}
            <div className="flex flex-wrap gap-2 mb-6">
              {dailyIdea.domain.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-4 mb-6">
              <Button
                onClick={() => setShowThinkingTools(!showThinkingTools)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                {showThinkingTools ? '隐藏' : '展开'}思考工具
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                收藏
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                分享
              </Button>
            </div>

            {/* 思考工具展开区域 */}
            {showThinkingTools && (
              <div className="border rounded-lg p-6 bg-gray-50 mb-6">
                <h3 className="font-semibold text-lg mb-4">思考引导</h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">引导问题</h4>
                    <ul className="space-y-2">
                      {dailyIdea.guidingQuestions.map((question, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-600 font-medium">•</span>
                          <span className="text-gray-700">{question}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">实施提示</h4>
                    <ul className="space-y-2">
                      {dailyIdea.implementationHints.map((hint, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-600 font-medium">✓</span>
                          <span className="text-gray-700">{hint}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 反馈提交区域 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              分享你的想法
            </CardTitle>
            <CardDescription>
              提供有价值的反馈可获得积分奖励
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasSubmittedToday ? (
              <div className="text-center py-8 text-gray-500">
                <Star className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>今日已提交反馈，明天再来吧！</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 反馈类型选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    反馈类型
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'improvement', label: '改进建议', desc: '如何优化这个创意' },
                      { value: 'implementation', label: '实施方案', desc: '具体落地步骤' },
                      { value: 'market_insight', label: '市场洞察', desc: '市场机会分析' },
                      { value: 'risk_analysis', label: '风险分析', desc: '潜在问题识别' }
                    ].map((type) => (
                      <Button
                        key={type.value}
                        variant={feedbackType === type.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFeedbackType(type.value as UserFeedback['type'])}
                        className="flex flex-col items-start p-3 h-auto"
                      >
                        <span className="font-medium">{type.label}</span>
                        <span className="text-xs opacity-70">{type.desc}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* 反馈内容 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    反馈内容 (最少100字获得积分)
                  </label>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="请详细描述你的想法和建议..."
                    className="min-h-32"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">
                      {feedback.length} / 最少100字
                    </span>
                    <span className="text-sm text-green-600">
                      预计获得: {Math.min(8, Math.floor(feedback.length / 50) + 2)} 积分
                    </span>
                  </div>
                </div>

                {/* 提交按钮 */}
                <Button
                  onClick={submitFeedback}
                  disabled={feedback.length < 100}
                  className="w-full"
                >
                  提交反馈
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}