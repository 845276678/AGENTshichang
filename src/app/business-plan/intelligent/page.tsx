'use client'

import React, { useState } from 'react'
import { Layout } from '@/components/layout'
import {
  Brain,
  Lightbulb,
  Target,
  Zap,
  Rocket,
  Sparkles,
  CheckCircle,
  Loader2
} from 'lucide-react'

type IdeaCharacteristics = {
  category: string
  technicalComplexity: string
  fundingRequirement: string
  competitionLevel: string
  aiCapabilities: { [key: string]: boolean }
}

export default function IntelligentBusinessPlanPage() {
  const [ideaTitle, setIdeaTitle] = useState('')
  const [ideaDescription, setIdeaDescription] = useState('')
  const [userLocation, setUserLocation] = useState('北京')
  const [userBackground, setUserBackground] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [ideaCharacteristics, setIdeaCharacteristics] = useState<IdeaCharacteristics | null>(null)

  const handleAnalyze = () => {
    setAnalyzing(true)
    setTimeout(() => {
      setAnalyzing(false)
      setIdeaCharacteristics({
        category: '教育科技',
        technicalComplexity: '中等',
        fundingRequirement: '中等（5-20万）',
        competitionLevel: '中等',
        aiCapabilities: {
          nlp: true,
          cv: false,
          ml: true,
          recommendation: true,
          generation: false,
          automation: true
        }
      })
    }, 2000)
  }

  const getAICapabilityLabel = (key: string): string => {
    const labels = {
      nlp: '自然语言处理',
      cv: '计算机视觉',
      ml: '机器学习',
      recommendation: '推荐系统',
      generation: '内容生成',
      automation: '自动化'
    }
    return labels[key as keyof typeof labels] || key
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white font-sans">
        <div className="max-w-6xl mx-auto px-4 py-10">
          {/* 头部 */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Brain className="w-10 h-10 text-blue-600" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                智能化商业计划生成
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-6 leading-relaxed">
              基于创意特征实时适配的5阶段商业计划框架，提供AI技术栈推荐、需求发现渠道、线下调研活动等个性化指导
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 border border-blue-200 rounded-full text-sm font-semibold">
                <Zap className="w-4 h-4 mr-2" />
                实时适配
              </div>
              <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 border border-green-200 rounded-full text-sm font-semibold">
                <Target className="w-4 h-4 mr-2" />
                个性化推荐
              </div>
              <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 border border-purple-200 rounded-full text-sm font-semibold">
                <Rocket className="w-4 h-4 mr-2" />
                90天聚焦
              </div>
            </div>
          </div>

          {/* 输入表单 */}
          <div className="bg-white border-2 border-blue-100 rounded-xl shadow-xl mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
              <h3 className="flex items-center gap-3 text-blue-900 text-2xl font-semibold mb-2">
                <Lightbulb className="w-6 h-6 text-yellow-500" />
                创意信息输入
              </h3>
              <p className="text-blue-700 text-base">
                输入您的创意，系统将实时分析特征并生成个性化推荐
              </p>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">创意标题</label>
                  <input
                    type="text"
                    placeholder="例如：AI智能英语学习助手"
                    value={ideaTitle}
                    onChange={(e) => setIdeaTitle(e.target.value)}
                    className="w-full border-2 border-gray-300 bg-white rounded-lg px-4 py-3 text-base focus:border-blue-600 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">所在城市</label>
                  <input
                    type="text"
                    placeholder="北京"
                    value={userLocation}
                    onChange={(e) => setUserLocation(e.target.value)}
                    className="w-full border-2 border-gray-300 bg-white rounded-lg px-4 py-3 text-base focus:border-blue-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">详细描述</label>
                <textarea
                  placeholder="描述您的创意要解决什么问题，面向什么用户，如何创造价值..."
                  value={ideaDescription}
                  onChange={(e) => setIdeaDescription(e.target.value)}
                  rows={4}
                  className="w-full border-2 border-gray-300 bg-white rounded-lg px-4 py-3 text-base focus:border-blue-600 focus:outline-none transition-colors resize-vertical min-h-[120px]"
                />
              </div>

              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-2">个人背景（可选）</label>
                <input
                  type="text"
                  placeholder="例如：技术背景、行业经验、可用资源等"
                  value={userBackground}
                  onChange={(e) => setUserBackground(e.target.value)}
                  className="w-full border-2 border-gray-300 bg-white rounded-lg px-4 py-3 text-base focus:border-blue-600 focus:outline-none transition-colors"
                />
              </div>

              <div className="text-center">
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {analyzing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                  {analyzing ? '分析中...' : '开始分析创意'}
                </button>
              </div>
            </div>
          </div>

          {/* 分析状态 */}
          {analyzing && (
            <div className="bg-blue-50 border-2 border-blue-600 rounded-xl mb-8">
              <div className="p-6 text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                  <span className="text-lg text-blue-800 font-semibold">
                    正在实时分析创意特征...
                  </span>
                </div>
                <p className="text-blue-700">
                  AI正在分析您的创意，识别技术需求和市场特征
                </p>
              </div>
            </div>
          )}

          {/* 分析结果 */}
          {ideaCharacteristics && !analyzing && (
            <div className="bg-green-50 border-2 border-green-500 rounded-xl">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-gray-200">
                <h3 className="flex items-center gap-3 text-green-800 text-2xl font-semibold mb-2">
                  <CheckCircle className="w-6 h-6" />
                  创意特征分析完成
                </h3>
                <p className="text-green-700 text-base">
                  系统已识别您的创意特征，将据此生成个性化商业计划
                </p>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {[
                    { label: '行业', value: ideaCharacteristics.category, bgColor: 'bg-blue-100', textColor: 'text-blue-800', borderColor: 'border-blue-200' },
                    { label: '技术复杂度', value: ideaCharacteristics.technicalComplexity, bgColor: 'bg-orange-100', textColor: 'text-orange-800', borderColor: 'border-orange-200' },
                    { label: '资金需求', value: ideaCharacteristics.fundingRequirement, bgColor: 'bg-purple-100', textColor: 'text-purple-800', borderColor: 'border-purple-200' },
                    { label: '竞争程度', value: ideaCharacteristics.competitionLevel, bgColor: 'bg-red-100', textColor: 'text-red-800', borderColor: 'border-red-200' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <span className={`text-xs ${item.bgColor} ${item.textColor} border ${item.borderColor} px-3 py-1 rounded-full font-semibold`}>
                        {item.label}
                      </span>
                      <span className="text-sm font-semibold text-gray-700">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-5 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                  <div className="text-base font-semibold mb-3 flex items-center gap-2 text-amber-800">
                    <Lightbulb className="w-4 h-4" />
                    AI能力需求识别:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(ideaCharacteristics.aiCapabilities).map(([key, value]) =>
                      value && (
                        <span key={key} className="text-xs bg-yellow-100 text-amber-800 border border-yellow-300 px-3 py-1 rounded-full font-semibold">
                          {getAICapabilityLabel(key)}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}