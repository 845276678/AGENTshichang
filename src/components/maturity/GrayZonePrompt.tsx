// 灰色区提示组件
// Spec: CREATIVE_MATURITY_PLAN_ENHANCED.md v4.1 (Lines 65-78)

'use client';

import React, { useState } from 'react';
import type { MaturityLevel } from '@/types/maturity-score';

interface GrayZonePromptProps {
  level: MaturityLevel;
  totalScore: number;
  onSupplementInfo?: () => void;
  onSkip?: () => void;
  onStartVerification?: () => void;
  onSavePlan?: () => void;
}

/**
 * 灰色区提示组件
 * 在分数处于灰色区(4.0-5.0 或 7.0-7.5)时显示，提示用户可以补充信息或跳过
 */
export function GrayZonePrompt({
  level,
  totalScore,
  onSupplementInfo,
  onSkip,
  onStartVerification,
  onSavePlan
}: GrayZonePromptProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // 只在灰色区显示
  if (level !== 'GRAY_LOW' && level !== 'GRAY_HIGH') {
    return null;
  }

  const isLowGrayZone = level === 'GRAY_LOW';
  const isHighGrayZone = level === 'GRAY_HIGH';

  return (
    <div className="w-full bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg shadow-lg border-2 border-purple-200 overflow-hidden">
      {/* 标题栏 */}
      <div
        className="px-6 py-4 bg-gradient-to-r from-purple-100 to-indigo-100 cursor-pointer flex items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center mr-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-purple-900">
              {isLowGrayZone ? '您的创意介于想法和方向之间' : '您的创意已较成熟'}
            </h3>
            <p className="text-sm text-purple-700">
              当前评分: {totalScore.toFixed(1)}/10 (灰色区)
            </p>
          </div>
        </div>
        <button
          className="text-purple-600 hover:text-purple-800 transition-colors"
          aria-label={isExpanded ? '收起' : '展开'}
        >
          <svg
            className={`w-6 h-6 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* 内容区 */}
      {isExpanded && (
        <div className="px-6 py-5">
          {isLowGrayZone && (
            <GrayLowZoneContent
              totalScore={totalScore}
              onSupplementInfo={onSupplementInfo}
              onSkip={onSkip}
            />
          )}
          {isHighGrayZone && (
            <GrayHighZoneContent
              totalScore={totalScore}
              onStartVerification={onStartVerification}
              onSavePlan={onSavePlan}
            />
          )}
        </div>
      )}
    </div>
  );
}

/**
 * 低分灰色区内容 (4.0-5.0)
 */
function GrayLowZoneContent({
  totalScore,
  onSupplementInfo,
  onSkip
}: {
  totalScore: number;
  onSupplementInfo?: () => void;
  onSkip?: () => void;
}) {
  return (
    <>
      {/* 说明 */}
      <div className="mb-6">
        <div className="flex items-start mb-4">
          <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
            <span className="text-white font-bold">!</span>
          </div>
          <div>
            <p className="text-gray-800 text-base leading-relaxed">
              您的创意评分为 <span className="font-bold text-purple-700">{totalScore.toFixed(1)}/10</span>，
              处于<span className="font-semibold">想法阶段</span>和<span className="font-semibold">方向阶段</span>之间。
            </p>
            <p className="text-gray-700 mt-2 text-sm">
              这表示您的创意有一定基础，但在某些关键维度上还需要进一步明确。
            </p>
          </div>
        </div>

        {/* 补充信息可获得的好处 */}
        <div className="bg-white rounded-lg p-4 mb-4 border border-purple-200">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            补充3个问题后可获得：
          </h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-purple-500 mr-2">✓</span>
              <span>更准确的成熟度评估（可能升级到方向阶段）</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-500 mr-2">✓</span>
              <span>详细的优化建议和行动清单</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-500 mr-2">✓</span>
              <span>初步商业计划书（15-25页）</span>
            </li>
          </ul>
        </div>

        {/* 补差价说明 */}
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="text-sm">
              <p className="font-medium text-amber-900 mb-1">积分说明</p>
              <p className="text-amber-800">
                如补充后评分提升到5分以上，需补差价 <span className="font-bold">150积分</span>
                （总计200积分）。如未提升，不扣除差价。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <button
          onClick={onSupplementInfo}
          className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
        >
          补充信息（免费）
        </button>
        <button
          onClick={onSkip}
          className="px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          暂时跳过
        </button>
      </div>
    </>
  );
}

/**
 * 高分灰色区内容 (7.0-7.5)
 */
function GrayHighZoneContent({
  totalScore,
  onStartVerification,
  onSavePlan
}: {
  totalScore: number;
  onStartVerification?: () => void;
  onSavePlan?: () => void;
}) {
  return (
    <>
      {/* 说明 */}
      <div className="mb-6">
        <div className="flex items-start mb-4">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-gray-800 text-base leading-relaxed">
              恭喜！您的创意评分为 <span className="font-bold text-green-600">{totalScore.toFixed(1)}/10</span>，
              已接近<span className="font-semibold">方案阶段</span>。
            </p>
            <p className="text-gray-700 mt-2 text-sm">
              补充验证数据后，您将获得投资级商业计划书，可直接用于融资路演。
            </p>
          </div>
        </div>

        {/* 验证后可获得的内容 */}
        <div className="bg-white rounded-lg p-4 mb-4 border border-green-200">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            完成验证后可获得：
          </h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span><span className="font-medium">投资级商业计划书</span>（30-50页PDF）</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span><span className="font-medium">详细财务模型</span>（Excel，3年预测）</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span><span className="font-medium">融资路演PPT</span>（15-20页）</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span><span className="font-medium">数据验证报告</span>（标注已验证vs假设）</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span><span className="font-medium">风险评估与应对方案</span></span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span><span className="font-medium">90天行动计划</span></span>
            </li>
          </ul>
        </div>

        {/* 验证说明 */}
        <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">验证流程</p>
              <p className="text-blue-800">
                需填写一次性问卷（10-15分钟），支持草稿保存和分段提交。
                我们将对关键数据进行网上检索验证，确保计划书的可信度。
              </p>
            </div>
          </div>
        </div>

        {/* 补差价说明 */}
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
            <div className="text-sm">
              <p className="font-medium text-amber-900 mb-1">积分说明</p>
              <p className="text-amber-800">
                开始验证需补差价 <span className="font-bold">600积分</span>（总计800积分）。
                验证失败自动退回积分。支持随时保存，稍后继续。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <button
          onClick={onStartVerification}
          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
        >
          开始验证（需补600积分）
        </button>
        <button
          onClick={onSavePlan}
          className="px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          保存当前计划书
        </button>
      </div>
    </>
  );
}
