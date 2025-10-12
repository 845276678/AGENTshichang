'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'
import { Layout } from '@/components/layout'
import { BusinessPlanGenerationWorkspace } from '@/components/business-plan/BusinessPlanGenerationWorkspace'

export default function WorkspacePage() {
  const searchParams = useSearchParams()

  // 从URL参数获取创意数据
  const ideaTitle = searchParams.get('ideaTitle') || '未命名创意'
  const ideaDescription = searchParams.get('ideaDescription') || ''
  const ideaCategory = searchParams.get('category') || '通用'

  // 构建创意数据对象
  const ideaData = {
    id: `idea_${Date.now()}`,
    title: ideaTitle,
    description: ideaDescription,
    category: ideaCategory,
    tags: searchParams.get('tags')?.split(',') || [],
    submittedBy: '当前用户'
  }

  return (
    <Layout>
      <BusinessPlanGenerationWorkspace
        ideaData={ideaData}
        onComplete={(plan) => {
          console.log('商业计划生成完成:', plan)
        }}
        onSave={(draft) => {
          console.log('草稿已保存:', draft)
        }}
      />
    </Layout>
  )
}
