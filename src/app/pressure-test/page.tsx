'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import {
  AlertTriangle,
  Zap,
  TrendingDown,
  DollarSign,
  Users,
  Settings,
  Shield,
  Target,
  Timer,
  Award,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface PressureScenario {
  id: string;
  title: string;
  description: string;
  type: 'FUNDING' | 'COMPETITION' | 'MARKET' | 'TECHNICAL' | 'REGULATORY' | 'OPERATIONAL';
  severity: number;
  questions: string[];
  isPersonalized: boolean;
}

interface PressureTestAnswer {
  questionIndex: number;
  answer: string;
  confidence: number;
}

interface TestResult {
  overallScore: number;
  dimensionScores: {
    adaptability: number;
    resilience: number;
    pivotPotential: number;
    resourceEfficiency: number;
    strategicThinking: number;
  };
  recommendations: string[];
  contingencyPlans: string[];
}

export default function PressureTestPage() {
  const [scenarios, setScenarios] = useState&lt;PressureScenario[]&gt;([]);
  const [selectedScenario, setSelectedScenario] = useState&lt;PressureScenario | null&gt;(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState&lt;PressureTestAnswer[]&gt;([]);
  const [testResult, setTestResult] = useState&lt;TestResult | null&gt;(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [currentConfidence, setCurrentConfidence] = useState([70]);
  const [testPhase, setTestPhase] = useState&lt;'selection' | 'testing' | 'results'&gt;('selection');
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState&lt;Date | null&gt;(null);

  useEffect(() => {
    fetchScenarios();
  }, []);

  const fetchScenarios = async () => {
    try {
      const response = await fetch('/api/pressure-test/scenarios');
      if (response.ok) {
        const data = await response.json();
        setScenarios(data.scenarios);
      }
    } catch (error) {
      toast.error('获取压力测试场景失败');
    } finally {
      setLoading(false);
    }
  };

  const startTest = (scenario: PressureScenario) => {
    setSelectedScenario(scenario);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setCurrentAnswer('');
    setCurrentConfidence([70]);
    setTestPhase('testing');
    setStartTime(new Date());
  };

  const nextQuestion = () => {
    if (!currentAnswer.trim()) {
      toast.error('请回答当前问题');
      return;
    }

    const newAnswer: PressureTestAnswer = {
      questionIndex: currentQuestionIndex,
      answer: currentAnswer,
      confidence: currentConfidence[0]
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    if (currentQuestionIndex < (selectedScenario?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentAnswer('');
      setCurrentConfidence([70]);
    } else {
      // 测试完成，提交结果
      submitTest(updatedAnswers);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      const prevAnswer = answers[currentQuestionIndex - 1];
      if (prevAnswer) {
        setCurrentAnswer(prevAnswer.answer);
        setCurrentConfidence([prevAnswer.confidence]);
      }
      // 移除当前答案
      setAnswers(answers.slice(0, currentQuestionIndex));
    }
  };

  const submitTest = async (testAnswers: PressureTestAnswer[]) => {
    if (!selectedScenario || !startTime) return;

    try {
      const completionTime = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);

      const response = await fetch('/api/pressure-test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: selectedScenario.id,
          answers: testAnswers,
          completionTime
        })
      });

      if (response.ok) {
        const result = await response.json();
        setTestResult(result.result);
        setTestPhase('results');
        toast.success('压力测试完成！');
      } else {
        throw new Error('提交失败');
      }
    } catch (error) {
      toast.error('提交测试结果失败');
    }
  };

  const restartTest = () => {
    setSelectedScenario(null);
    setTestResult(null);
    setTestPhase('selection');
    setCurrentQuestionIndex(0);
    setAnswers([]);
  };

  const getScenarioIcon = (type: string) => {
    switch (type) {
      case 'FUNDING': return &lt;DollarSign className="w-6 h-6" /&gt;;
      case 'COMPETITION': return &lt;Users className="w-6 h-6" /&gt;;
      case 'MARKET': return &lt;TrendingDown className="w-6 h-6" /&gt;;
      case 'TECHNICAL': return &lt;Settings className="w-6 h-6" /&gt;;
      case 'REGULATORY': return &lt;Shield className="w-6 h-6" /&gt;;
      case 'OPERATIONAL': return &lt;Target className="w-6 h-6" /&gt;;
      default: return &lt;AlertTriangle className="w-6 h-6" /&gt;;
    }
  };

  const getScenarioColor = (type: string) => {
    switch (type) {
      case 'FUNDING': return 'text-green-600 bg-green-50 border-green-200';
      case 'COMPETITION': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'MARKET': return 'text-red-600 bg-red-50 border-red-200';
      case 'TECHNICAL': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'REGULATORY': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'OPERATIONAL': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityLabel = (severity: number) => {
    switch (severity) {
      case 1: return { label: '轻度', color: 'text-green-600 bg-green-50' };
      case 2: return { label: '中度', color: 'text-yellow-600 bg-yellow-50' };
      case 3: return { label: '重度', color: 'text-red-600 bg-red-50' };
      default: return { label: '未知', color: 'text-gray-600 bg-gray-50' };
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      &lt;div className="container mx-auto px-4 py-8"&gt;
        &lt;div className="animate-pulse"&gt;
          &lt;div className="h-8 bg-gray-200 rounded w-1/3 mb-6"&gt;&lt;/div&gt;
          &lt;div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"&gt;
            {[1, 2, 3].map(i =&gt; (
              &lt;div key={i} className="h-48 bg-gray-200 rounded"&gt;&lt;/div&gt;
            ))}
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    );
  }

  // 场景选择阶段
  if (testPhase === 'selection') {
    return (
      &lt;div className="container mx-auto px-4 py-8"&gt;
        &lt;div className="max-w-6xl mx-auto"&gt;
          &lt;div className="text-center mb-8"&gt;
            &lt;h1 className="text-3xl font-bold text-gray-900 mb-4"&gt;创意压力台&lt;/h1&gt;
            &lt;p className="text-gray-600 text-lg"&gt;
              测试你的创意在不同压力场景下的抗压能力，提前做好应对准备
            &lt;/p&gt;
          &lt;/div&gt;

          &lt;div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"&gt;
            {scenarios.map((scenario) =&gt; {
              const severityInfo = getSeverityLabel(scenario.severity);
              return (
                &lt;Card key={scenario.id} className="hover:shadow-lg transition-shadow cursor-pointer"&gt;
                  &lt;CardHeader&gt;
                    &lt;div className="flex items-center gap-3 mb-2"&gt;
                      &lt;div className={`p-2 rounded-lg ${getScenarioColor(scenario.type)}`}&gt;
                        {getScenarioIcon(scenario.type)}
                      &lt;/div&gt;
                      &lt;div className="flex-1"&gt;
                        &lt;CardTitle className="text-lg"&gt;{scenario.title}&lt;/CardTitle&gt;
                        &lt;div className="flex items-center gap-2 mt-1"&gt;
                          &lt;Badge className={severityInfo.color}&gt;
                            {severityInfo.label}压力
                          &lt;/Badge&gt;
                          {scenario.isPersonalized && (
                            &lt;Badge variant="outline" className="text-purple-600"&gt;
                              个性化
                            &lt;/Badge&gt;
                          )}
                        &lt;/div&gt;
                      &lt;/div&gt;
                    &lt;/div&gt;
                    &lt;CardDescription&gt;{scenario.description}&lt;/CardDescription&gt;
                  &lt;/CardHeader&gt;
                  &lt;CardContent&gt;
                    &lt;div className="space-y-3"&gt;
                      &lt;div className="text-sm text-gray-600"&gt;
                        包含 {scenario.questions.length} 个测试问题
                      &lt;/div&gt;
                      &lt;Button
                        onClick={() =&gt; startTest(scenario)}
                        className="w-full"
                      &gt;
                        &lt;Zap className="w-4 h-4 mr-2" /&gt;
                        开始测试
                      &lt;/Button&gt;
                    &lt;/div&gt;
                  &lt;/CardContent&gt;
                &lt;/Card&gt;
              );
            })}
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    );
  }

  // 测试进行阶段
  if (testPhase === 'testing' && selectedScenario) {
    const progress = ((currentQuestionIndex + 1) / selectedScenario.questions.length) * 100;

    return (
      &lt;div className="container mx-auto px-4 py-8"&gt;
        &lt;div className="max-w-4xl mx-auto"&gt;
          &lt;div className="mb-8"&gt;
            &lt;div className="flex items-center justify-between mb-4"&gt;
              &lt;h1 className="text-2xl font-bold text-gray-900"&gt;{selectedScenario.title}&lt;/h1&gt;
              &lt;Badge className={getSeverityLabel(selectedScenario.severity).color}&gt;
                {getSeverityLabel(selectedScenario.severity).label}压力
              &lt;/Badge&gt;
            &lt;/div&gt;
            &lt;div className="flex items-center gap-4 mb-4"&gt;
              &lt;span className="text-sm text-gray-600"&gt;
                进度: {currentQuestionIndex + 1} / {selectedScenario.questions.length}
              &lt;/span&gt;
              &lt;Progress value={progress} className="flex-1" /&gt;
            &lt;/div&gt;
          &lt;/div&gt;

          &lt;Card&gt;
            &lt;CardHeader&gt;
              &lt;CardTitle className="flex items-center gap-2"&gt;
                &lt;AlertTriangle className="w-5 h-5 text-orange-600" /&gt;
                压力场景问题 {currentQuestionIndex + 1}
              &lt;/CardTitle&gt;
            &lt;/CardHeader&gt;
            &lt;CardContent className="space-y-6"&gt;
              &lt;div className="p-4 bg-orange-50 border border-orange-200 rounded-lg"&gt;
                &lt;p className="text-gray-900 font-medium"&gt;
                  {selectedScenario.questions[currentQuestionIndex]}
                &lt;/p&gt;
              &lt;/div&gt;

              &lt;div&gt;
                &lt;Label className="text-base font-medium"&gt;你的应对方案&lt;/Label&gt;
                &lt;Textarea
                  value={currentAnswer}
                  onChange={(e) =&gt; setCurrentAnswer(e.target.value)}
                  placeholder="详细描述你在这种压力下会如何应对..."
                  className="mt-2 min-h-32"
                /&gt;
              &lt;/div&gt;

              &lt;div&gt;
                &lt;Label className="text-base font-medium"&gt;
                  信心指数: {currentConfidence[0]}%
                &lt;/Label&gt;
                &lt;div className="mt-2 px-4"&gt;
                  &lt;Slider
                    value={currentConfidence}
                    onValueChange={setCurrentConfidence}
                    max={100}
                    min={10}
                    step={5}
                    className="w-full"
                  /&gt;
                &lt;/div&gt;
                &lt;div className="flex justify-between text-xs text-gray-500 mt-1"&gt;
                  &lt;span&gt;完全没信心&lt;/span&gt;
                  &lt;span&gt;非常有信心&lt;/span&gt;
                &lt;/div&gt;
              &lt;/div&gt;

              &lt;div className="flex justify-between"&gt;
                &lt;Button
                  variant="outline"
                  onClick={previousQuestion}
                  disabled={currentQuestionIndex === 0}
                &gt;
                  上一题
                &lt;/Button&gt;
                &lt;Button onClick={nextQuestion}&gt;
                  {currentQuestionIndex === selectedScenario.questions.length - 1 ? '完成测试' : '下一题'}
                &lt;/Button&gt;
              &lt;/div&gt;
            &lt;/CardContent&gt;
          &lt;/Card&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    );
  }

  // 结果展示阶段
  if (testPhase === 'results' && testResult) {
    const radarData = [
      { subject: '适应能力', score: testResult.dimensionScores.adaptability, fullMark: 100 },
      { subject: '抗压韧性', score: testResult.dimensionScores.resilience, fullMark: 100 },
      { subject: '转向潜力', score: testResult.dimensionScores.pivotPotential, fullMark: 100 },
      { subject: '资源效率', score: testResult.dimensionScores.resourceEfficiency, fullMark: 100 },
      { subject: '战略思维', score: testResult.dimensionScores.strategicThinking, fullMark: 100 }
    ];

    return (
      &lt;div className="container mx-auto px-4 py-8"&gt;
        &lt;div className="max-w-6xl mx-auto"&gt;
          &lt;div className="text-center mb-8"&gt;
            &lt;h1 className="text-3xl font-bold text-gray-900 mb-4"&gt;压力测试结果&lt;/h1&gt;
            &lt;div className="flex items-center justify-center gap-2"&gt;
              &lt;Award className="w-8 h-8 text-yellow-600" /&gt;
              &lt;span className={`text-4xl font-bold ${getScoreColor(testResult.overallScore)}`}&gt;
                {testResult.overallScore}分
              &lt;/span&gt;
            &lt;/div&gt;
          &lt;/div&gt;

          &lt;div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"&gt;
            {/* 雷达图 */}
            &lt;Card&gt;
              &lt;CardHeader&gt;
                &lt;CardTitle className="flex items-center gap-2"&gt;
                  &lt;BarChart3 className="w-5 h-5" /&gt;
                  各维度能力分析
                &lt;/CardTitle&gt;
              &lt;/CardHeader&gt;
              &lt;CardContent&gt;
                &lt;div className="h-80"&gt;
                  &lt;ResponsiveContainer width="100%" height="100%"&gt;
                    &lt;RadarChart data={radarData}&gt;
                      &lt;PolarGrid /&gt;
                      &lt;PolarAngleAxis dataKey="subject" /&gt;
                      &lt;PolarRadiusAxis angle={90} domain={[0, 100]} /&gt;
                      &lt;Radar
                        name="得分"
                        dataKey="score"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.2}
                        strokeWidth={2}
                      /&gt;
                    &lt;/RadarChart&gt;
                  &lt;/ResponsiveContainer&gt;
                &lt;/div&gt;
              &lt;/CardContent&gt;
            &lt;/Card&gt;

            {/* 详细分数 */}
            &lt;Card&gt;
              &lt;CardHeader&gt;
                &lt;CardTitle&gt;详细评分&lt;/CardTitle&gt;
              &lt;/CardHeader&gt;
              &lt;CardContent className="space-y-4"&gt;
                {radarData.map((item, index) =&gt; (
                  &lt;div key={index} className="space-y-2"&gt;
                    &lt;div className="flex justify-between items-center"&gt;
                      &lt;span className="font-medium"&gt;{item.subject}&lt;/span&gt;
                      &lt;span className={`font-bold ${getScoreColor(item.score)}`}&gt;
                        {item.score}分
                      &lt;/span&gt;
                    &lt;/div&gt;
                    &lt;Progress value={item.score} className="h-2" /&gt;
                  &lt;/div&gt;
                ))}
              &lt;/CardContent&gt;
            &lt;/Card&gt;
          &lt;/div&gt;

          {/* 改进建议 */}
          &lt;div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"&gt;
            &lt;Card&gt;
              &lt;CardHeader&gt;
                &lt;CardTitle className="flex items-center gap-2"&gt;
                  &lt;Target className="w-5 h-5 text-blue-600" /&gt;
                  改进建议
                &lt;/CardTitle&gt;
              &lt;/CardHeader&gt;
              &lt;CardContent&gt;
                &lt;ul className="space-y-3"&gt;
                  {testResult.recommendations.map((recommendation, index) =&gt; (
                    &lt;li key={index} className="flex items-start gap-2"&gt;
                      &lt;span className="text-blue-600 font-medium"&gt;•&lt;/span&gt;
                      &lt;span className="text-gray-700"&gt;{recommendation}&lt;/span&gt;
                    &lt;/li&gt;
                  ))}
                &lt;/ul&gt;
              &lt;/CardContent&gt;
            &lt;/Card&gt;

            &lt;Card&gt;
              &lt;CardHeader&gt;
                &lt;CardTitle className="flex items-center gap-2"&gt;
                  &lt;Shield className="w-5 h-5 text-green-600" /&gt;
                  应急预案
                &lt;/CardTitle&gt;
              &lt;/CardHeader&gt;
              &lt;CardContent&gt;
                &lt;ul className="space-y-3"&gt;
                  {testResult.contingencyPlans.map((plan, index) =&gt; (
                    &lt;li key={index} className="flex items-start gap-2"&gt;
                      &lt;span className="text-green-600 font-medium"&gt;✓&lt;/span&gt;
                      &lt;span className="text-gray-700"&gt;{plan}&lt;/span&gt;
                    &lt;/li&gt;
                  ))}
                &lt;/ul&gt;
              &lt;/CardContent&gt;
            &lt;/Card&gt;
          &lt;/div&gt;

          &lt;div className="text-center"&gt;
            &lt;Button onClick={restartTest} size="lg"&gt;
              重新测试
            &lt;/Button&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    );
  }

  return null;
}