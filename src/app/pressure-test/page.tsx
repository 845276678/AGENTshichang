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
  const [scenarios, setScenarios] = useState<PressureScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<PressureScenario | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<PressureTestAnswer[]>([]);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [currentConfidence, setCurrentConfidence] = useState([70]);
  const [testPhase, setTestPhase] = useState<'selection' | 'testing' | 'results'>('selection');
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState<Date | null>(null);

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
      case 'FUNDING': return <DollarSign className="w-6 h-6" />;
      case 'COMPETITION': return <Users className="w-6 h-6" />;
      case 'MARKET': return <TrendingDown className="w-6 h-6" />;
      case 'TECHNICAL': return <Settings className="w-6 h-6" />;
      case 'REGULATORY': return <Shield className="w-6 h-6" />;
      case 'OPERATIONAL': return <Target className="w-6 h-6" />;
      default: return <AlertTriangle className="w-6 h-6" />;
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
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 场景选择阶段
  if (testPhase === 'selection') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">创意压力台</h1>
            <p className="text-gray-600 text-lg">
              测试你的创意在不同压力场景下的抗压能力，提前做好应对准备
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scenarios.map((scenario) => {
              const severityInfo = getSeverityLabel(scenario.severity);
              return (
                <Card key={scenario.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${getScenarioColor(scenario.type)}`}>
                        {getScenarioIcon(scenario.type)}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{scenario.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={severityInfo.color}>
                            {severityInfo.label}压力
                          </Badge>
                          {scenario.isPersonalized && (
                            <Badge variant="outline" className="text-purple-600">
                              个性化
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <CardDescription>{scenario.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">
                        包含 {scenario.questions.length} 个测试问题
                      </div>
                      <Button
                        onClick={() => startTest(scenario)}
                        className="w-full"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        开始测试
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 测试进行阶段
  if (testPhase === 'testing' && selectedScenario) {
    const progress = ((currentQuestionIndex + 1) / selectedScenario.questions.length) * 100;

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{selectedScenario.title}</h1>
              <Badge className={getSeverityLabel(selectedScenario.severity).color}>
                {getSeverityLabel(selectedScenario.severity).label}压力
              </Badge>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm text-gray-600">
                进度: {currentQuestionIndex + 1} / {selectedScenario.questions.length}
              </span>
              <Progress value={progress} className="flex-1" />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                压力场景问题 {currentQuestionIndex + 1}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-gray-900 font-medium">
                  {selectedScenario.questions[currentQuestionIndex]}
                </p>
              </div>

              <div>
                <Label className="text-base font-medium">你的应对方案</Label>
                <Textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="详细描述你在这种压力下会如何应对..."
                  className="mt-2 min-h-32"
                />
              </div>

              <div>
                <Label className="text-base font-medium">
                  信心指数: {currentConfidence[0]}%
                </Label>
                <div className="mt-2 px-4">
                  <Slider
                    value={currentConfidence}
                    onValueChange={setCurrentConfidence}
                    max={100}
                    min={10}
                    step={5}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>完全没信心</span>
                  <span>非常有信心</span>
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={previousQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  上一题
                </Button>
                <Button onClick={nextQuestion}>
                  {currentQuestionIndex === selectedScenario.questions.length - 1 ? '完成测试' : '下一题'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">压力测试结果</h1>
            <div className="flex items-center justify-center gap-2">
              <Award className="w-8 h-8 text-yellow-600" />
              <span className={`text-4xl font-bold ${getScoreColor(testResult.overallScore)}`}>
                {testResult.overallScore}分
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* 雷达图 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  各维度能力分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar
                        name="得分"
                        dataKey="score"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* 详细分数 */}
            <Card>
              <CardHeader>
                <CardTitle>详细评分</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {radarData.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.subject}</span>
                      <span className={`font-bold ${getScoreColor(item.score)}`}>
                        {item.score}分
                      </span>
                    </div>
                    <Progress value={item.score} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* 改进建议 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  改进建议
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {testResult.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 font-medium">•</span>
                      <span className="text-gray-700">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  应急预案
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {testResult.contingencyPlans.map((plan, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-600 font-medium">✓</span>
                      <span className="text-gray-700">{plan}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button onClick={restartTest} size="lg">
              重新测试
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}