'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Clock, Star, Heart, MessageCircle, Share2, Trophy, TrendingUp, Brain, Send, User, Bot } from 'lucide-react';
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

interface DebateMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  aiPersona?: string;
  responseType?: 'agree' | 'disagree' | 'guide' | 'expand';
  followUpQuestions?: string[];
  suggestions?: string[];
}

export default function DailyIdeaPage() {
  const [dailyIdea, setDailyIdea] = useState<DailyIdea | null>(null);
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState<UserFeedback['type']>('improvement');
  const [userPoints, setUserPoints] = useState(0);
  const [timeToNext, setTimeToNext] = useState(0);
  const [showThinkingTools, setShowThinkingTools] = useState(false);
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);
  const [loading, setLoading] = useState(true);

  // 智能辩论相关状态
  const [showDebate, setShowDebate] = useState(false);
  const [debateMessages, setDebateMessages] = useState<DebateMessage[]>([]);
  const [debateInput, setDebateInput] = useState('');
  const [debateLoading, setDebateLoading] = useState(false);

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

  // 智能辩论功能
  const startDebate = async (comment: string) => {
    if (!comment.trim()) {
      toast.error('请输入你的观点');
      return;
    }

    setDebateLoading(true);

    // 添加用户消息
    const userMessage: DebateMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: comment,
      timestamp: new Date()
    };

    setDebateMessages(prev => [...prev, userMessage]);
    setDebateInput('');

    try {
      const response = await fetch('/api/daily-idea/debate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaId: dailyIdea?.id,
          userComment: comment,
          commentType: 'general'
        })
      });

      if (response.ok) {
        const data = await response.json();

        // 添加AI回复
        const aiMessage: DebateMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: data.debate.aiResponse.content,
          timestamp: new Date(),
          aiPersona: data.debate.aiResponse.aiPersona || '创意导师',
          responseType: data.debate.aiResponse.responseType,
          followUpQuestions: data.debate.aiResponse.followUpQuestions,
          suggestions: data.debate.aiResponse.suggestions
        };

        setDebateMessages(prev => [...prev, aiMessage]);

        if (data.debate.pointsEarned > 0) {
          setUserPoints(prev => prev + data.debate.pointsEarned);
          toast.success(`精彩的观点！获得 ${data.debate.pointsEarned} 积分`);
        }
      } else {
        const error = await response.json();
        toast.error(error.message || '辩论失败');
      }
    } catch (error) {
      toast.error('网络错误，请重试');
    } finally {
      setDebateLoading(false);
    }
  };

  const getResponseTypeColor = (type?: string) => {
    switch (type) {
      case 'agree': return 'text-green-600 bg-green-50';
      case 'disagree': return 'text-red-600 bg-red-50';
      case 'guide': return 'text-blue-600 bg-blue-50';
      case 'expand': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getResponseTypeLabel = (type?: string) => {
    switch (type) {
      case 'agree': return '赞同';
      case 'disagree': return '质疑';
      case 'guide': return '引导';
      case 'expand': return '扩展';
      default: return '回应';
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
              <Button
                onClick={() => setShowDebate(!showDebate)}
                variant={showDebate ? 'default' : 'outline'}
                className="flex items-center gap-2"
              >
                <Brain className="w-4 h-4" />
                {showDebate ? '隐藏' : '智能'}辩论
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

            {/* 智能辩论区域 */}
            {showDebate && (
              <div className="border rounded-lg p-6 bg-gradient-to-br from-blue-50 to-purple-50 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-lg">AI智能辩论</h3>
                  <Badge variant="secondary" className="text-xs">
                    与AI进行创意讨论，完善你的想法
                  </Badge>
                </div>

                {/* 对话历史 */}
                <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                  {debateMessages.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p>发表你的观点，开始与AI的智能辩论！</p>
                      <p className="text-sm mt-1">AI会赞同你说得对的，反驳你说得错的，引导你说得不完善的</p>
                    </div>
                  )}

                  {debateMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.type === 'ai' && (
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-blue-600" />
                          </div>
                        </div>
                      )}

                      <div className={`max-w-lg ${message.type === 'user' ? 'order-2' : ''}`}>
                        <div
                          className={`rounded-lg p-3 ${
                            message.type === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border shadow-sm'
                          }`}
                        >
                          {message.type === 'ai' && message.responseType && (
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={`text-xs ${getResponseTypeColor(message.responseType)}`}>
                                {getResponseTypeLabel(message.responseType)}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {message.aiPersona}
                              </span>
                            </div>
                          )}
                          <p className="text-sm">{message.content}</p>
                        </div>

                        {/* AI回复的后续问题和建议 */}
                        {message.type === 'ai' && (message.followUpQuestions || message.suggestions) && (
                          <div className="mt-2 space-y-2">
                            {message.followUpQuestions && message.followUpQuestions.length > 0 && (
                              <div className="bg-blue-50 rounded-lg p-3">
                                <h5 className="text-xs font-medium text-blue-700 mb-1">进一步思考：</h5>
                                <ul className="text-xs text-blue-600 space-y-1">
                                  {message.followUpQuestions.map((question, index) => (
                                    <li key={index} className="flex items-start gap-1">
                                      <span>•</span>
                                      <span>{question}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {message.suggestions && message.suggestions.length > 0 && (
                              <div className="bg-green-50 rounded-lg p-3">
                                <h5 className="text-xs font-medium text-green-700 mb-1">改进建议：</h5>
                                <ul className="text-xs text-green-600 space-y-1">
                                  {message.suggestions.map((suggestion, index) => (
                                    <li key={index} className="flex items-start gap-1">
                                      <span>✓</span>
                                      <span>{suggestion}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="text-xs text-gray-400 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>

                      {message.type === 'user' && (
                        <div className="flex-shrink-0 order-1">
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {debateLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <Bot className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="bg-white border shadow-sm rounded-lg p-3 max-w-lg">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                          <span className="text-sm text-gray-500">AI正在思考中...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 输入区域 */}
                <div className="flex gap-2">
                  <Textarea
                    value={debateInput}
                    onChange={(e) => setDebateInput(e.target.value)}
                    placeholder="分享你对这个创意的看法、质疑或改进建议..."
                    className="flex-1 min-h-16 resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        startDebate(debateInput);
                      }
                    }}
                  />
                  <Button
                    onClick={() => startDebate(debateInput)}
                    disabled={!debateInput.trim() || debateLoading}
                    className="self-end"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

                <div className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                  <span>💡</span>
                  <span>提示：AI会根据你的观点进行赞同、质疑或引导，帮你完善创意。高质量的讨论可获得额外积分！</span>
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
