'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Layout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export default function IdeaDiscussionPage() {
  // const params = useParams()
  const router = useRouter()

  return (
    <Layout>
      <div className="container py-6">
        {/* 面包屑导航 */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回
          </Button>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">创意详情</span>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium">AI 讨论</span>
        </div>

        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI 专家讨论
          </h1>
          <p className="text-muted-foreground mt-2">
            与 AI 专家团队深入讨论您的创意，获得专业的分析和建议
          </p>
        </div>

        {/* 主要内容 */}
        <Card>
          <CardHeader>
            <CardTitle>讨论区域</CardTitle>
            <CardDescription>
              功能正在开发中，敬请期待...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🚧</div>
              <p className="text-muted-foreground mb-4">
                AI 讨论功能正在紧急修复中
              </p>
              <Button onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回创意详情
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}