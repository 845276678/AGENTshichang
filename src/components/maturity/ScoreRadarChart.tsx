// 创意成熟度雷达图组件
// Spec: CREATIVE_MATURITY_PLAN_ENHANCED.md v4.1 (Task 10)

'use client';

import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import type { DimensionScores } from '@/types/maturity-score';

interface ScoreRadarChartProps {
  dimensions: DimensionScores;
  totalScore: number;
  level: string;
  confidence: number;
}

/**
 * 创意成熟度雷达图组件
 * 展示五维评分的可视化结果
 */
export function ScoreRadarChart({
  dimensions,
  totalScore,
  level,
  confidence
}: ScoreRadarChartProps) {
  // 转换为雷达图数据格式
  const radarData = [
    {
      dimension: '目标客户',
      score: dimensions.targetCustomer.score,
      fullMark: 10,
      status: dimensions.targetCustomer.status
    },
    {
      dimension: '需求场景',
      score: dimensions.demandScenario.score,
      fullMark: 10,
      status: dimensions.demandScenario.status
    },
    {
      dimension: '核心价值',
      score: dimensions.coreValue.score,
      fullMark: 10,
      status: dimensions.coreValue.status
    },
    {
      dimension: '商业模式',
      score: dimensions.businessModel.score,
      fullMark: 10,
      status: dimensions.businessModel.status
    },
    {
      dimension: '可信度',
      score: dimensions.credibility.score,
      fullMark: 10,
      status: dimensions.credibility.status
    }
  ];

  // 根据成熟度等级选择颜色
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'HIGH':
        return '#10b981'; // green-500
      case 'GRAY_HIGH':
        return '#8b5cf6'; // violet-500
      case 'MEDIUM':
        return '#f59e0b'; // amber-500
      case 'GRAY_LOW':
        return '#f97316'; // orange-500
      case 'LOW':
        return '#ef4444'; // red-500
      default:
        return '#6b7280'; // gray-500
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'HIGH':
        return '方案阶段';
      case 'GRAY_HIGH':
        return '方向→方案(灰色区)';
      case 'MEDIUM':
        return '方向阶段';
      case 'GRAY_LOW':
        return '想法→方向(灰色区)';
      case 'LOW':
        return '想法阶段';
      default:
        return level;
    }
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.85) return '高置信度 ✅';
    if (confidence >= 0.70) return '中置信度 ⚠️';
    return '低置信度 ⚠️';
  };

  const levelColor = getLevelColor(level);

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6">
      {/* 标题与总分 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-2xl font-bold text-gray-900">
            创意成熟度评分
          </h3>
          <div className="text-right">
            <div className="text-4xl font-bold" style={{ color: levelColor }}>
              {totalScore.toFixed(1)}
              <span className="text-lg text-gray-500">/10</span>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {getLevelLabel(level)}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-600">
            置信度: <span className="font-semibold">{Math.round(confidence * 100)}%</span>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            confidence >= 0.85
              ? 'bg-green-100 text-green-800'
              : confidence >= 0.70
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-orange-100 text-orange-800'
          }`}>
            {getConfidenceLabel(confidence)}
          </div>
        </div>
      </div>

      {/* 雷达图 */}
      <div className="w-full" style={{ height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: '#374151', fontSize: 14, fontWeight: 500 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 10]}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <Radar
              name="得分"
              dataKey="score"
              stroke={levelColor}
              fill={levelColor}
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                      <p className="font-semibold text-gray-900 mb-1">
                        {data.dimension}
                      </p>
                      <p className="text-lg font-bold" style={{ color: levelColor }}>
                        {data.score.toFixed(1)}/10
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        状态: {getStatusLabel(data.status)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* 维度详情表格 */}
      <div className="mt-6 overflow-hidden border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                维度
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                得分
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {radarData.map((item) => (
              <tr key={item.dimension} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {item.dimension}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center">
                    <div className="flex-1 max-w-xs mr-3">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(item.score / 10) * 100}%`,
                            backgroundColor: levelColor
                          }}
                        />
                      </div>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {item.score.toFixed(1)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={getStatusBadgeClass(item.status)}>
                    {getStatusLabel(item.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 评分说明 */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">评分说明</p>
            <p className="text-blue-700">
              成熟度评分基于AI专家讨论，融合The Mom Test验证原则。
              分数越高表示创意越成熟，准备越充分。
              {confidence < 0.85 && (
                <span className="block mt-1 text-orange-700">
                  ⚠️ 当前置信度偏低，建议补充更多证据或用户验证数据。
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 辅助函数
function getStatusLabel(status: string): string {
  switch (status) {
    case 'CLEAR':
      return '清晰';
    case 'NEEDS_FOCUS':
      return '待聚焦';
    case 'UNCLEAR':
      return '待明确';
    default:
      return status;
  }
}

function getStatusBadgeClass(status: string): string {
  const baseClass = 'px-2 py-1 text-xs font-medium rounded-full';
  switch (status) {
    case 'CLEAR':
      return `${baseClass} bg-green-100 text-green-800`;
    case 'NEEDS_FOCUS':
      return `${baseClass} bg-yellow-100 text-yellow-800`;
    case 'UNCLEAR':
      return `${baseClass} bg-red-100 text-red-800`;
    default:
      return `${baseClass} bg-gray-100 text-gray-800`;
  }
}
