/**
 * 创意完善工作坊 - 保存进度API
 *
 * POST /api/idea-refinement/save
 *
 * 功能：
 * 1. 手动保存当前会话进度
 * 2. 支持临时保存对话内容（用户输入但未提交）
 * 3. 允许用户暂停会话并稍后恢复
 * 4. 更新最后活跃时间
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type {
  SaveRefinementProgressRequest,
  SaveRefinementProgressResponse
} from '@/types/idea-refinement'

export const dynamic = 'force-dynamic'


export async function POST(request: NextRequest) {
  try {
    const body: SaveRefinementProgressRequest = await request.json()
    const { documentId, temporaryInput, userNotes } = body

    // 参数验证
    if (!documentId) {
      return NextResponse.json(
        { success: false, error: '缺少文档ID' },
        { status: 400 }
      )
    }

    console.log(`💾 保存工作坊进度 - 文档: ${documentId}`)

    // 获取会话数据
    const document = await prisma.ideaRefinementDocument.findUnique({
      where: { id: documentId }
    })

    if (!document) {
      return NextResponse.json(
        { success: false, error: '会话不存在' },
        { status: 404 }
      )
    }

    // 构建更新数据
    const updateData: any = {
      updatedAt: new Date()
    }

    // 如果有临时输入，保存到metadata
    if (temporaryInput !== undefined) {
      const metadata = (document.metadata as any) || {}
      metadata.temporaryInput = temporaryInput
      metadata.lastSavedAt = new Date().toISOString()
      updateData.metadata = metadata
      console.log('📝 保存临时输入内容')
    }

    // 如果有用户备注，保存到metadata
    if (userNotes !== undefined) {
      const metadata = (document.metadata as any) || {}
      metadata.userNotes = userNotes
      updateData.metadata = metadata
      console.log('📝 保存用户备注')
    }

    // 更新数据库
    await prisma.ideaRefinementDocument.update({
      where: { id: documentId },
      data: updateData
    })

    console.log(`✅ 进度保存成功，最后更新: ${updateData.updatedAt}`)

    // 返回响应
    const response: SaveRefinementProgressResponse = {
      success: true,
      savedAt: updateData.updatedAt.toISOString(),
      message: '进度已保存'
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ 保存工作坊进度失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '保存失败，请重试'
      },
      { status: 500 }
    )
  }
}