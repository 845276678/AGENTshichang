import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import type { MaturityScoreResult } from '@/types/maturity-score';

interface ImprovementSuggestionsProps {
  assessment: MaturityScoreResult;
}

/**
 * 改进建议组件
 * 显示基于薄弱维度的改进建议
 */
export function ImprovementSuggestions({ assessment }: ImprovementSuggestionsProps) {
  const { weakDimensions, dimensions, validSignals, invalidSignals, totalScore } = assessment;

  // 如果分数很高（>8分），显示祝贺信息
  if (totalScore >= 8.0) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-green-900 mb-2">
                🎉 您的创意已非常成熟！
              </h4>
              <p className="text-sm text-green-800">
                创意质量达到高水平，可以直接参加所有工作坊或生成创意实现建议。
                继续保持这个水平，祝您创业顺利！
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 生成改进建议
  const suggestions = generateSuggestions(assessment);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold">改进建议</h3>
        <Badge variant="secondary">{suggestions.length}条</Badge>
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <Card
            key={index}
            className={`border-l-4 ${getPriorityBorderColor(suggestion.priority)}`}
          >
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityBadgeColor(suggestion.priority)}`}>
                  {suggestion.priority === 'high' ? '高优先级' : suggestion.priority === 'medium' ? '中优先级' : '低优先级'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {getDimensionLabel(suggestion.dimension)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      当前: {suggestion.currentScore.toFixed(1)}/10
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    {suggestion.suggestion}
                  </p>
                  {suggestion.estimatedGain > 0 && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <TrendingUp className="w-3 h-3" />
                      <span>预计提升: +{suggestion.estimatedGain.toFixed(1)}分</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* The Mom Test 提示 */}
      {(invalidSignals.futurePromises > 3 || invalidSignals.generalities > 5) && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-orange-900 mb-1">
                  ⚠️ The Mom Test 提示
                </p>
                <p className="text-orange-800">
                  检测到较多无效信号（未来承诺: {invalidSignals.futurePromises}次，泛泛而谈: {invalidSignals.generalities}次）。
                  建议聚焦于<span className="font-semibold">具体的过去案例</span>和<span className="font-semibold">真实的付费数据</span>。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * 生成改进建议
 */
function generateSuggestions(assessment: MaturityScoreResult) {
  const { weakDimensions, dimensions, validSignals, invalidSignals } = assessment;
  const suggestions: Array<{
    dimension: string;
    currentScore: number;
    priority: 'high' | 'medium' | 'low';
    suggestion: string;
    estimatedGain: number;
  }> = [];

  // 针对每个薄弱维度生成建议
  weakDimensions.forEach((dim) => {
    const dimScore = dimensions[dim as keyof typeof dimensions];

    if (dim === 'targetCustomer') {
      suggestions.push({
        dimension: dim,
        currentScore: dimScore.score,
        priority: 'high',
        suggestion: validSignals.userIntroductions === 0
          ? '补充5-10个真实用户访谈记录，明确细分人群和具体痛点'
          : '进一步细化目标用户画像，包括年龄、职业、收入水平等',
        estimatedGain: 1.5
      });
    }

    if (dim === 'demandScenario') {
      suggestions.push({
        dimension: dim,
        currentScore: dimScore.score,
        priority: 'high',
        suggestion: validSignals.specificPast === 0
          ? '描述具体的使用场景，用"上周"、"上次"等具体时间表达'
          : '量化痛点（如"每周花2小时"），提供更多真实案例',
        estimatedGain: 1.2
      });
    }

    if (dim === 'coreValue') {
      suggestions.push({
        dimension: dim,
        currentScore: dimScore.score,
        priority: 'medium',
        suggestion: validSignals.painPoints === 0
          ? '挖掘更多用户痛点故事（如"丢了客户"、"损失XX元"）'
          : '说明与竞品的具体差异化优势，强化独特价值',
        estimatedGain: 1.0
      });
    }

    if (dim === 'businessModel') {
      suggestions.push({
        dimension: dim,
        currentScore: dimScore.score,
        priority: 'high',
        suggestion: validSignals.realSpending === 0
          ? '验证用户付费意愿，提供真实付费案例或MVP测试数据'
          : '补充更多商业数据（转化率、客单价、获客成本等）',
        estimatedGain: 1.8
      });
    }

    if (dim === 'credibility') {
      suggestions.push({
        dimension: dim,
        currentScore: dimScore.score,
        priority: 'medium',
        suggestion: validSignals.evidence === 0
          ? '提供可验证证据：访谈记录截图、数据截图、产品链接等'
          : '补充更多客观指标（留存率、增长率、用户评价等）',
        estimatedGain: 1.5
      });
    }
  });

  // 按优先级和预期提升排序
  suggestions.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return b.estimatedGain - a.estimatedGain;
  });

  return suggestions;
}

/**
 * 维度标签映射
 */
function getDimensionLabel(dimension: string): string {
  const labels: Record<string, string> = {
    targetCustomer: '目标客户',
    demandScenario: '需求场景',
    coreValue: '核心价值',
    businessModel: '商业模式',
    credibility: '可信度'
  };
  return labels[dimension] || dimension;
}

/**
 * 优先级边框颜色
 */
function getPriorityBorderColor(priority: string): string {
  if (priority === 'high') return 'border-red-500';
  if (priority === 'medium') return 'border-yellow-500';
  return 'border-gray-300';
}

/**
 * 优先级徽章颜色
 */
function getPriorityBadgeColor(priority: string): string {
  if (priority === 'high') return 'bg-red-100 text-red-800';
  if (priority === 'medium') return 'bg-yellow-100 text-yellow-800';
  return 'bg-gray-100 text-gray-800';
}
