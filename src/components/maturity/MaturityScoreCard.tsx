import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { MaturityScoreResult } from '@/types/maturity-score';

interface MaturityScoreCardProps {
  assessment: MaturityScoreResult;
}

/**
 * 成熟度评分卡 - 主展示组件
 * 显示总分、等级、5个维度详情
 */
export function MaturityScoreCard({ assessment }: MaturityScoreCardProps) {
  const { totalScore, level, dimensions, confidence } = assessment;

  // 等级映射
  const levelConfig = {
    LOW: {
      label: '想法阶段',
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: '💡'
    },
    GRAY_LOW: {
      label: '灰色区（想法→方向）',
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: '🌤️'
    },
    MEDIUM: {
      label: '方向阶段',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: '🎯'
    },
    GRAY_HIGH: {
      label: '灰色区（方向→方案）',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: '🌟'
    },
    HIGH: {
      label: '方案阶段',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: '💎'
    }
  };

  const currentLevel = levelConfig[level];

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>创意成熟度评估</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              基于The Mom Test理论，5维度综合评估
            </p>
          </div>
          <div className={`px-4 py-2 rounded-lg border-2 ${currentLevel.color}`}>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentLevel.icon}</span>
              <div>
                <div className="font-semibold">{currentLevel.label}</div>
                <div className="text-xs opacity-75">置信度: {(confidence * 100).toFixed(0)}%</div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 总分显示 */}
        <div className="text-center py-6">
          <div className="relative inline-block">
            <svg width="160" height="160" viewBox="0 0 160 160">
              {/* 背景圆环 */}
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="12"
              />
              {/* 得分圆环 */}
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke={getScoreColor(totalScore)}
                strokeWidth="12"
                strokeDasharray={`${(totalScore / 10) * 439.6} 439.6`}
                strokeLinecap="round"
                transform="rotate(-90 80 80)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold">{totalScore.toFixed(1)}</span>
              <span className="text-sm text-gray-500">/ 10.0</span>
            </div>
          </div>
        </div>

        {/* 各维度分数 */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm text-gray-700">维度详情</h4>

          <DimensionBar
            label="目标客户"
            score={dimensions.targetCustomer.score}
            status={dimensions.targetCustomer.status}
            weight="20%"
          />

          <DimensionBar
            label="需求场景"
            score={dimensions.demandScenario.score}
            status={dimensions.demandScenario.status}
            weight="20%"
          />

          <DimensionBar
            label="核心价值"
            score={dimensions.coreValue.score}
            status={dimensions.coreValue.status}
            weight="25%"
          />

          <DimensionBar
            label="商业模式"
            score={dimensions.businessModel.score}
            status={dimensions.businessModel.status}
            weight="20%"
          />

          <DimensionBar
            label="可信度"
            score={dimensions.credibility.score}
            status={dimensions.credibility.status}
            weight="15%"
          />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 单个维度评分条
 */
function DimensionBar({
  label,
  score,
  status,
  weight
}: {
  label: string;
  score: number;
  status: 'CLEAR' | 'NEEDS_FOCUS' | 'UNCLEAR';
  weight: string;
}) {
  const statusConfig = {
    CLEAR: { label: '清晰', color: 'bg-green-500' },
    NEEDS_FOCUS: { label: '需关注', color: 'bg-yellow-500' },
    UNCLEAR: { label: '模糊', color: 'bg-red-500' }
  };

  const currentStatus = statusConfig[status];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium">{label}</span>
          <Badge variant="outline" className="text-xs">
            {weight}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{currentStatus.label}</span>
          <span className="font-semibold">{score.toFixed(1)}/10</span>
        </div>
      </div>
      <div className="relative">
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${currentStatus.color} transition-all duration-500`}
            style={{ width: `${(score / 10) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * 根据分数获取颜色
 */
function getScoreColor(score: number): string {
  if (score >= 7.5) return '#10b981'; // green-500
  if (score >= 7.0) return '#3b82f6'; // blue-500
  if (score >= 5.0) return '#f59e0b'; // yellow-500
  if (score >= 4.0) return '#f97316'; // orange-500
  return '#ef4444'; // red-500
}
