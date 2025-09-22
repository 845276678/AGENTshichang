import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/lib/auth-middleware'
import JSZip from 'jszip'

export async function GET(request: NextRequest) {
  try {
    // 身份验证
    const authResult = await authenticateToken(request)
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const packageId = searchParams.get('packageId')
    const format = searchParams.get('format') || 'zip' // zip, pdf, docx

    if (!packageId) {
      return NextResponse.json(
        { success: false, message: '缺少packageId参数' },
        { status: 400 }
      )
    }

    console.log(`📥 用户请求下载文档包: ${packageId}, 格式: ${format}`)

    // 模拟从数据库获取文档包数据
    const mockDocumentPackage = {
      id: packageId,
      title: 'SmartHealth - AI驱动的个人健康管理生态平台',
      documents: [
        {
          id: 'doc-technical-architecture',
          title: '技术架构设计文档',
          content: await generateMockTechnicalDoc(),
          pages: 5
        },
        {
          id: 'doc-business-plan',
          title: '商业计划书',
          content: await generateMockBusinessDoc(),
          pages: 5
        },
        {
          id: 'doc-user-experience',
          title: '用户体验设计',
          content: await generateMockUXDoc(),
          pages: 4
        }
      ]
    }

    if (format === 'zip') {
      // 创建ZIP文件
      const zip = new JSZip()

      // 添加文档到ZIP
      mockDocumentPackage.documents.forEach((doc) => {
        zip.file(`${doc.title}.md`, doc.content)
      })

      // 生成ZIP文件
      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })

      return new NextResponse(zipBuffer, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="${mockDocumentPackage.title}.zip"`
        }
      })
    }

    return NextResponse.json({
      success: false,
      message: '不支持的文件格式'
    }, { status: 400 })

  } catch (error) {
    console.error('❌ 文档下载失败:', error)
    return NextResponse.json(
      { success: false, message: '下载失败，请稍后重试' },
      { status: 500 }
    )
  }
}

// 生成模拟技术文档
async function generateMockTechnicalDoc(): string {
  return `# 技术架构设计文档

## 系统概述
SmartHealth是一个基于AI的个人健康管理平台，采用微服务架构设计。

## 核心组件
- 用户管理服务
- 健康数据服务
- AI分析引擎
- 通知服务

## 技术栈
- 前端: React + TypeScript
- 后端: Node.js + Express
- 数据库: PostgreSQL + Redis
- AI/ML: Python + TensorFlow

## 部署架构
采用容器化部署，支持水平扩展和高可用性。

通过完善的技术架构设计，确保系统的高可用性、高性能和高安全性。`
}

// 生成模拟商业计划书
async function generateMockBusinessDoc(): string {
  return `# 商业计划书

## 市场分析
全球健康管理市场规模预计将在2028年达到7800亿美元，年复合增长率达13.2%。

## 产品定位
AI驱动的个人健康管家，提供专业的健康监护和智能建议。

## 商业模式
- 硬件销售
- 订阅服务
- 数据服务
- 合作分成

## 竞争优势
- 先进的AI技术
- 完整的生态系统
- 专业的医疗背景
- 优秀的用户体验

## 财务预测
预计三年内实现盈利，五年内成为行业领导者。

通过科学的商业规划和执行，打造可持续发展的健康管理生态。`
}

// 生成模拟用户体验文档
async function generateMockUXDoc(): string {
  return `# 用户体验设计

## 设计理念
以用户为中心，简洁易用，科技感与温馨感并重。

## 核心功能
- 健康数据展示
- 智能分析报告
- 个性化建议
- 紧急救助

## 界面设计
采用现代化的扁平设计风格，配色方案以蓝色和白色为主。

## 交互设计
- 直观的手势操作
- 语音交互支持
- 智能推荐系统
- 个性化定制

## 可用性测试
通过多轮用户测试，不断优化产品体验，确保用户满意度。

通过以用户为中心的设计方法，创造直观、易用、有价值的健康管理体验。`
}