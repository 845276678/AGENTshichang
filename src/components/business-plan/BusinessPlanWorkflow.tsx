'use client'

import React, { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { UserRequirementsCollector } from './UserRequirementsCollector'
import { BusinessPlanGenerationWorkspace } from './BusinessPlanGenerationWorkspace'
import { useBusinessPlanGeneration } from '@/stores/useBusinessPlanGeneration'
import type { UserRequirements, RequirementAnalysis } from '@/stores/useBusinessPlanGeneration'

interface IdeaData {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  submittedBy: string
}

interface BusinessPlan {
  id: string
  title: string
  sections: Array<{
    stageId: string
    content: {
      title: string
      summary: string
      fullContent: string
    }
  }>
  metadata: {
    totalCost: number
    totalTime: number
    aiProviders: string[]
  }
  createdAt: Date
}

interface DraftData {
  ideaId: string
  progress: number
  stages: number
  completed: number
}

interface BusinessPlanWorkflowProps {
  ideaData: IdeaData
  onComplete?: (plan: BusinessPlan) => void
  onSave?: (draft: DraftData) => void
}

export const BusinessPlanWorkflow: React.FC<BusinessPlanWorkflowProps> = ({
  ideaData,
  onComplete,
  onSave
}) => {
  const {
    requirementsCollection,
    startRequirementsCollection,
    applyRequirementsAnalysis,
    skipRequirementsCollection,
    setIdeaData
  } = useBusinessPlanGeneration()

  const [workflowStage, setWorkflowStage] = useState<'requirements' | 'generation'>('requirements')

  useEffect(() => {
    // 设置创意数据并启动需求收集
    setIdeaData(ideaData)

    // 检查是否应该显示需求收集
    if (!requirementsCollection.isActive && workflowStage === 'requirements') {
      startRequirementsCollection()
    }
  }, [ideaData, setIdeaData, startRequirementsCollection, requirementsCollection.isActive, workflowStage])

  const handleRequirementsSubmit = (requirements: UserRequirements, analysis: RequirementAnalysis) => {
    // 应用需求分析结果
    applyRequirementsAnalysis(requirements, analysis)

    // 进入生成阶段
    setWorkflowStage('generation')
  }

  const handleSkipRequirements = () => {
    skipRequirementsCollection()
    setWorkflowStage('generation')
  }

  const handleWorkflowComplete = (plan: BusinessPlan) => {
    onComplete?.(plan)
  }

  const handleSaveDraft = (draft: DraftData) => {
    onSave?.(draft)
  }

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {workflowStage === 'requirements' && (
          <UserRequirementsCollector
            key="requirements"
            ideaData={ideaData}
            onRequirementsSubmit={handleRequirementsSubmit}
            onSkip={handleSkipRequirements}
          />
        )}

        {workflowStage === 'generation' && (
          <BusinessPlanGenerationWorkspace
            key="generation"
            ideaData={ideaData}
            onComplete={handleWorkflowComplete}
            onSave={handleSaveDraft}
          />
        )}
      </AnimatePresence>
    </div>
  )
}