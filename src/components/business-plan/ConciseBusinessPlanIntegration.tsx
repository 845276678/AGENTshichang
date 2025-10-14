'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ConciseBusinessPlan } from './ConciseBusinessPlan'
import { useBusinessPlanGeneration } from '@/stores/useBusinessPlanGeneration'

interface ConciseBusinessPlanIntegrationProps {
  ideaData: {
    id: string
    title: string
    description: string
    category: string
    tags: string[]
    submittedBy: string
  }
}

export const ConciseBusinessPlanIntegration: React.FC<ConciseBusinessPlanIntegrationProps> = ({
  ideaData
}) => {
  const { stages, finalPlan, selectedVersions, generateFinalPlan, exportPlan } = useBusinessPlanGeneration()
  const [concisePlanData, setConcisePlanData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 转换 stages 数据为 concise plan 格式
    const convertToConciseFormat = () => {
      const chapters = stages.map((stage, index) => {
        const selectedVersionId = selectedVersions[stage.id]
        const selectedVersion = stage.versions.find(v => v.id === selectedVersionId)
        const latestVersion = stage.versions[stage.versions.length - 1] || null

        const version = selectedVersion || latestVersion

        if (!version) {
          return {
            id: stage.id,
            title: stage.name,
            icon: null,
            completionProgress: stage.status === 'completed' ? 100 : stage.progress,
            coreContent: {
              summary: '内容生成中...',
              keyPoints: ['正在生成核心要点...'],
              visualData: {
                metrics: []
              },
              actionItems: ['等待内容生成完成']
            },
            expandedContent: {
              fullAnalysis: '详细内容生成中...',
              detailedSections: [],
              additionalCharts: [],
              references: []
            },
            readingTime: {
              core: 2,
              expanded: 5
            }
          }
        }

        // 使用新的内容结构
        const coreContent = version.content.coreContent
        const expandableContent = version.content.expandableContent

        return {
          id: stage.id,
          title: stage.name,
          icon: null,
          completionProgress: stage.status === 'completed' ? 100 : stage.progress,
          coreContent: {
            summary: version.content.summary,
            keyPoints: version.content.keyPoints,
            visualData: coreContent ? {
              metrics: coreContent.visualElements.metrics || []
            } : { metrics: [] },
            actionItems: coreContent?.actionItems || []
          },
          expandedContent: {
            fullAnalysis: version.content.fullContent,
            detailedSections: expandableContent?.sections || [],
            additionalCharts: [],
            references: [
              '基于AI分析生成',
              '数据来源：行业研究报告',
              '参考：同类项目案例分析'
            ]
          },
          readingTime: {
            core: Math.ceil((coreContent?.wordCount || 500) / 250), // 假设阅读速度250字/分钟
            expanded: expandableContent?.estimatedReadTime || 5
          }
        }
      })

      const completedChapters = chapters.filter(c => c.completionProgress === 100).length
      const totalReadingTime = chapters.reduce((sum, c) => sum + c.readingTime.core, 0)
      const totalPages = chapters.length * 1 // 每章节1页

      return {
        title: `${ideaData.title} 创意实现建议`,
        ideaData: {
          title: ideaData.title,
          category: ideaData.category,
          description: ideaData.description
        },
        chapters,
        metadata: {
          totalPages,
          totalReadingTime,
          completionRate: Math.round((completedChapters / chapters.length) * 100),
          lastUpdated: new Date()
        }
      }
    }

    const conciseData = convertToConciseFormat()
    setConcisePlanData(conciseData)
    setIsLoading(false)
  }, [stages, selectedVersions, ideaData])

  const handleExport = async (format: 'pdf' | 'docx' | 'html') => {
    try {
      if (!finalPlan) {
        await generateFinalPlan()
      }
      const exportUrl = await exportPlan(format)

      // 触发下载
      const link = document.createElement('a')
      link.href = exportUrl
      link.download = `${ideaData.title}_创意实现建议.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Export failed:', error)
      alert('导出失败，请稍后重试')
    }
  }

  const handleShare = () => {
    // 实现分享功能
    if (navigator.share) {
      navigator.share({
        title: `${ideaData.title} 创意实现建议`,
        text: `查看${ideaData.title}的完整创意实现建议`,
        url: window.location.href
      })
    } else {
      // 备选：复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href)
      alert('链接已复制到剪贴板')
    }
  }

  if (isLoading || !concisePlanData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
        <span className="ml-3 text-gray-600">正在生成简洁版创意实现建议...</span>
      </div>
    )
  }

  return (
    <ConciseBusinessPlan
      planData={concisePlanData}
      onExport={handleExport}
      onShare={handleShare}
    />
  )
}