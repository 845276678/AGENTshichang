import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Lock, CheckCircle, Star } from 'lucide-react';

interface WorkshopRecommendation {
  workshopId: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  recommendationLevel: number;
  reason: string;
  estimatedDuration: number;
  weakDimensions: string[];
}

interface WorkshopRecommendationsProps {
  recommendations: WorkshopRecommendation[];
  unlocked: boolean;
  currentScore: number;
  onEnterWorkshop?: (workshopId: string) => void;
}

/**
 * 工作坊推荐组件
 * 显示个性化的工作坊推荐列表
 */
export function WorkshopRecommendations({
  recommendations,
  unlocked,
  currentScore,
  onEnterWorkshop
}: WorkshopRecommendationsProps) {
  const priorityConfig = {
    high: {
      label: '强烈推荐',
      color: 'bg-red-100 text-red-800 border-red-200'
    },
    medium: {
      label: '推荐',
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    low: {
      label: '可选',
      color: 'bg-gray-100 text-gray-800 border-gray-200'
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">专业工作坊推荐</h3>
        {unlocked ? (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            已解锁
          </Badge>
        ) : (
          <Badge variant="secondary">
            <Lock className="w-3 h-3 mr-1" />
            未解锁 (需5.0分)
          </Badge>
        )}
      </div>

      {!unlocked && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🔒</div>
              <div className="flex-1">
                <p className="font-semibold text-yellow-800 mb-1">
                  工作坊暂未解锁
                </p>
                <p className="text-sm text-yellow-700">
                  距离解锁还需 <span className="font-bold">{(5.0 - currentScore).toFixed(1)}</span> 分
                </p>
                <div className="mt-2">
                  <div className="h-2 bg-yellow-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 transition-all duration-500"
                      style={{ width: `${(currentScore / 5.0) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {recommendations.length === 0 && unlocked && (
          <p className="text-center text-gray-500 py-8">
            暂无工作坊推荐
          </p>
        )}

        {recommendations.map((rec) => (
          <Card
            key={rec.workshopId}
            className={`transition-all ${
              unlocked
                ? 'hover:shadow-lg cursor-pointer border-2'
                : 'opacity-60'
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-base">{rec.title}</CardTitle>
                    <Badge
                      variant="outline"
                      className={priorityConfig[rec.priority].color}
                    >
                      {priorityConfig[rec.priority].label}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{rec.description}</p>
                </div>
                {!unlocked && <Lock className="w-5 h-5 text-gray-400 ml-2" />}
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {/* 推荐星级 */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">推荐度:</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < rec.recommendationLevel
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* 预计时长 */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>预计 {rec.estimatedDuration} 分钟</span>
                </div>

                {/* 推荐原因 */}
                <div className="bg-blue-50 rounded-lg p-3 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600">💡</span>
                    <div className="flex-1">
                      <p className="text-blue-900 font-medium mb-1">推荐原因:</p>
                      <p className="text-blue-800">{rec.reason}</p>
                      {rec.weakDimensions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {rec.weakDimensions.map((dim) => (
                            <Badge
                              key={dim}
                              variant="outline"
                              className="text-xs bg-white"
                            >
                              {getDimensionLabel(dim)}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 进入按钮 */}
                <div className="pt-2">
                  <Button
                    disabled={!unlocked}
                    onClick={() => onEnterWorkshop?.(rec.workshopId)}
                    className="w-full"
                    variant={rec.priority === 'high' ? 'default' : 'outline'}
                  >
                    {unlocked ? '进入工作坊' : '未解锁'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {unlocked && recommendations.length > 0 && (
        <div className="text-center pt-2">
          <p className="text-sm text-gray-500">
            建议按推荐顺序依次参加工作坊，效果更佳
          </p>
        </div>
      )}
    </div>
  );
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
