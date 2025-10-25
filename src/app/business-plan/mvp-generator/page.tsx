/**
 * MVP 生成器独立页面
 *
 * 整页聊天式 MVP 代码生成器
 * - 左侧：AI 对话交互，显示竞价后的 MVP 提示词
 * - 右侧：实时代码编辑器，展示生成的前端代码
 *
 * 功能：
 * - 从竞价结果导入创意和建议
 * - AI 辅助的对话式代码生成
 * - 实时代码预览和编辑
 * - 代码导出和下载
 */

'use client'

import React, { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import MVPBuilderConversational from '@/components/workshop/MVPBuilderConversational'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function MVPGeneratorPage() {
  const { user } = useAuth()
  const router = useRouter()

  // 设置页面标题
  useEffect(() => {
    document.title = 'MVP 代码生成器 - AI创意家园'
  }, [])

  return (
    <div className="h-screen flex flex-col">
      {/* 顶部导航 */}
      <div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/workshops/mvp-builder">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              返回工作坊
            </Button>
          </Link>
          <div className="h-4 w-px bg-gray-300" />
          <h1 className="text-sm font-medium text-gray-700">
            MVP 代码生成器
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <span className="text-sm text-gray-600">
              {user.name || user.email}
            </span>
          ) : (
            <Link href="/auth/login">
              <Button size="sm" variant="outline">
                登录
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* MVP 生成器主界面 */}
      <div className="flex-1 overflow-hidden">
        <MVPBuilderConversational
          userId={user?.id || 'anonymous'}
        />
      </div>
    </div>
  )
}
