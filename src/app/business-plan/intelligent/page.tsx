'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { nanoid } from 'nanoid'

import { Layout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Brain,
  Lightbulb,
  Target,
  Search,
  Calendar,
  DollarSign,
  Users,
  AlertTriangle,
  TrendingUp,
  Zap,
  ChevronRight,
  Clock,
  CheckCircle,
  Loader2,
  Sparkles,
  Compass,
  Rocket,
  BarChart3,
  Settings
} from 'lucide-react'

// Simplified types to avoid rendering issues
type IdeaCharacteristics = {
  category: string
  technicalComplexity: string
  fundingRequirement: string
  competitionLevel: string
  aiCapabilities: { [key: string]: boolean }
}

type PersonalizedRecommendations = {
  techStackRecommendations: any
  researchChannels: any
  offlineEvents: any
  customizedTimeline: any
  budgetPlan: any
  teamRecommendations: any
  riskAssessment: any
  successMetrics: any
  nextStepActions: any
}

type PracticalStageOutput = {
  title: string
  summary: string
  keyInsights: string[]
  nextSteps: string[]
  confidenceBooster: string
}

type IntelligentStageView = {
  id: string
  name: string
  status: 'pending' | 'analyzing' | 'generating' | 'completed'
  progress: number
  estimatedTime: string
  deliverables: string[]
  aiProvider: string
  description: string
  output?: PracticalStageOutput
  adaptedRecommendations?: PersonalizedRecommendations
}

export default function IntelligentBusinessPlanPage() {
  // 基础状态
  const [ideaTitle, setIdeaTitle] = useState('')
  const [ideaDescription, setIdeaDescription] = useState('')
  const [userLocation, setUserLocation] = useState('北京')
  const [userBackground, setUserBackground] = useState('')

  // 智能分析状态
  const [ideaCharacteristics, setIdeaCharacteristics] = useState<IdeaCharacteristics | null>(null)
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<PersonalizedRecommendations | null>(null)
  const [currentStage, setCurrentStage] = useState<string | null>(null)
  const [stages, setStages] = useState<IntelligentStageView[]>([])

  // 控制状态
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string>('')

  return (
    <Layout>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #dbeafe 0%, #ffffff 100%)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 16px' }}>
          {/* 头部介绍 */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
              <Brain style={{ width: '32px', height: '32px', color: '#2563eb' }} />
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                background: 'linear-gradient(to right, #2563eb, #7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: 0
              }}>
                智能化商业计划生成
              </h1>
            </div>
            <p style={{ fontSize: '1.25rem', color: '#6b7280', maxWidth: '768px', margin: '0 auto' }}>
              基于创意特征实时适配的5阶段商业计划框架，提供AI技术栈推荐、需求发现渠道、线下调研活动等个性化指导
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 12px',
                background: '#dbeafe',
                color: '#1e40af',
                border: '1px solid #93c5fd',
                borderRadius: '16px',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                <Zap style={{ width: '16px', height: '16px', marginRight: '4px' }} />
                实时适配
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 12px',
                background: '#dcfce7',
                color: '#166534',
                border: '1px solid #86efac',
                borderRadius: '16px',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                <Target style={{ width: '16px', height: '16px', marginRight: '4px' }} />
                个性化推荐
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 12px',
                background: '#f3e8ff',
                color: '#7c2d12',
                border: '1px solid #c4b5fd',
                borderRadius: '16px',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                <Rocket style={{ width: '16px', height: '16px', marginRight: '4px' }} />
                90天聚焦
              </div>
            </div>
          </div>

          {/* 创意输入区域 */}
          <div style={{
            border: '2px solid #dbeafe',
            background: 'white',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            marginBottom: '32px'
          }}>
            <div style={{
              background: 'linear-gradient(to right, #dbeafe, #e0e7ff)',
              padding: '24px',
              borderTopLeftRadius: '6px',
              borderTopRightRadius: '6px'
            }}>
              <h3 style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#1e3a8a',
                fontSize: '1.5rem',
                fontWeight: '600',
                margin: '0 0 8px 0'
              }}>
                <Lightbulb style={{ width: '20px', height: '20px', color: '#eab308' }} />
                创意信息输入
              </h3>
              <p style={{ color: '#1e40af', margin: 0 }}>
                输入您的创意，系统将实时分析特征并生成个性化推荐
              </p>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    创意标题
                  </label>
                  <input
                    type="text"
                    placeholder="例如：AI智能英语学习助手"
                    value={ideaTitle}
                    onChange={(e) => setIdeaTitle(e.target.value)}
                    style={{
                      width: '100%',
                      border: '2px solid #d1d5db',
                      background: 'white',
                      borderRadius: '6px',
                      padding: '12px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    所在城市
                  </label>
                  <input
                    type="text"
                    placeholder="北京"
                    value={userLocation}
                    onChange={(e) => setUserLocation(e.target.value)}
                    style={{
                      width: '100%',
                      border: '2px solid #d1d5db',
                      background: 'white',
                      borderRadius: '6px',
                      padding: '12px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  详细描述
                </label>
                <textarea
                  placeholder="描述您的创意要解决什么问题，面向什么用户，如何创造价值..."
                  value={ideaDescription}
                  onChange={(e) => setIdeaDescription(e.target.value)}
                  rows={4}
                  style={{
                    width: '100%',
                    border: '2px solid #d1d5db',
                    background: 'white',
                    borderRadius: '6px',
                    padding: '12px',
                    fontSize: '14px',
                    resize: 'none',
                    boxSizing: 'border-box',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ marginTop: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  个人背景（可选）
                </label>
                <input
                  type="text"
                  placeholder="例如：技术背景、行业经验、可用资源等"
                  value={userBackground}
                  onChange={(e) => setUserBackground(e.target.value)}
                  style={{
                    width: '100%',
                    border: '2px solid #d1d5db',
                    background: 'white',
                    borderRadius: '6px',
                    padding: '12px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          </div>

          {/* 测试按钮 */}
          <div style={{ textAlign: 'center' }}>
            <button
              style={{
                background: 'linear-gradient(to right, #2563eb, #7c3aed)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onClick={() => {
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
              }}
            >
              <Sparkles style={{ width: '20px', height: '20px' }} />
              开始分析创意
            </button>
          </div>

          {/* 分析状态 */}
          {analyzing && (
            <div style={{
              marginTop: '32px',
              border: '2px solid #dbeafe',
              background: '#dbeafe',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Loader2 style={{ width: '20px', height: '20px', color: '#2563eb' }} className="animate-spin" />
                <span style={{ fontSize: '0.875rem', color: '#1e40af', fontWeight: '500' }}>
                  正在实时分析创意特征...
                </span>
              </div>
            </div>
          )}

          {/* 分析结果 */}
          {ideaCharacteristics && !analyzing && (
            <div style={{
              marginTop: '32px',
              border: '2px solid #dcfce7',
              background: '#dcfce7',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              borderRadius: '8px'
            }}>
              <div style={{
                background: 'linear-gradient(to right, #dcfce7, #d1fae5)',
                padding: '24px',
                borderTopLeftRadius: '6px',
                borderTopRightRadius: '6px'
              }}>
                <h3 style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#166534',
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  margin: '0 0 8px 0'
                }}>
                  <CheckCircle style={{ width: '20px', height: '20px' }} />
                  创意特征分析完成
                </h3>
                <p style={{ color: '#15803d', margin: 0 }}>
                  系统已识别您的创意特征，将据此生成个性化商业计划
                </p>
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(4, 1fr)' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px',
                    background: 'white',
                    borderRadius: '8px',
                    border: '1px solid #dcfce7'
                  }}>
                    <span style={{
                      fontSize: '0.75rem',
                      background: '#dbeafe',
                      color: '#1e40af',
                      border: '1px solid #93c5fd',
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}>
                      行业
                    </span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                      {ideaCharacteristics.category}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px',
                    background: 'white',
                    borderRadius: '8px',
                    border: '1px solid #dcfce7'
                  }}>
                    <span style={{
                      fontSize: '0.75rem',
                      background: '#fed7aa',
                      color: '#c2410c',
                      border: '1px solid #fdba74',
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}>
                      技术复杂度
                    </span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                      {ideaCharacteristics.technicalComplexity}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px',
                    background: 'white',
                    borderRadius: '8px',
                    border: '1px solid #dcfce7'
                  }}>
                    <span style={{
                      fontSize: '0.75rem',
                      background: '#f3e8ff',
                      color: '#7c2d12',
                      border: '1px solid #c4b5fd',
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}>
                      资金需求
                    </span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                      {ideaCharacteristics.fundingRequirement}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px',
                    background: 'white',
                    borderRadius: '8px',
                    border: '1px solid #dcfce7'
                  }}>
                    <span style={{
                      fontSize: '0.75rem',
                      background: '#fee2e2',
                      color: '#b91c1c',
                      border: '1px solid #fca5a5',
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}>
                      竞争程度
                    </span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                      {ideaCharacteristics.competitionLevel}
                    </span>
                  </div>
                </div>

                <div style={{
                  marginTop: '24px',
                  padding: '16px',
                  background: 'linear-gradient(to right, #fef3c7, #fde68a)',
                  borderRadius: '8px',
                  border: '1px solid #f59e0b'
                }}>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#92400e'
                  }}>
                    <Lightbulb style={{ width: '16px', height: '16px' }} />
                    AI能力需求识别:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {Object.entries(ideaCharacteristics.aiCapabilities).map(([key, value]) =>
                      value && (
                        <span key={key} style={{
                          fontSize: '0.75rem',
                          background: '#fef3c7',
                          color: '#92400e',
                          border: '1px solid #f59e0b',
                          padding: '4px 8px',
                          borderRadius: '12px'
                        }}>
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

// 辅助函数
function getAICapabilityLabel(key: string): string {
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