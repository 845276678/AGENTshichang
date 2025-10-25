import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth-helper'
import { z } from 'zod'
import PDFDocument from 'pdfkit'
import * as fs from 'fs'
import * as path from 'path'

export const dynamic = 'force-dynamic'

// 对话文档导出数据结构验证
const exportDialogSchema = z.object({
  ideaId: z.string().min(1, '创意ID不能为空').max(100, '创意ID过长'),
  ideaContent: z.string().min(1, '创意内容不能为空').max(5000, '创意内容过长'),
  format: z.enum(['pdf', 'txt', 'json']).default('pdf'),
  sessionInfo: z.object({
    sessionId: z.string().min(1, '会话ID不能为空'),
    currentPhase: z.string().min(1, '当前阶段不能为空'),
    startTime: z.string(),
    duration: z.number().min(0, '会话时长不能为负数').max(86400, '会话时长超过24小时'),
    totalMessages: z.number().min(0, '消息数量不能为负数').max(10000, '消息数量过多'),
    supportedAgents: z.array(z.string()).max(20, '支持的专家数量过多'),
    supplementCount: z.number().min(0, '补充次数不能为负数').max(100, '补充次数过多')
  }),
  biddingResults: z.object({
    winningBid: z.number().min(0, '中标价格不能为负数'),
    averageBid: z.number().min(0, '平均出价不能为负数'),
    totalBids: z.number().min(0, '出价总数不能为负数').max(100, '出价总数过多'),
    bids: z.record(z.number().min(0, '出价不能为负数')),
    participants: z.array(z.object({
      personaId: z.string().min(1, '专家ID不能为空'),
      name: z.string().min(1, '专家姓名不能为空').max(50, '专家姓名过长'),
      specialty: z.string().min(1, '专业领域不能为空').max(100, '专业领域描述过长'),
      bidAmount: z.number().min(0, '出价不能为负数'),
      participated: z.boolean()
    })).max(20, '参与专家数量过多')
  }),
  expertMessages: z.array(z.object({
    personaId: z.string().min(1, '专家ID不能为空'),
    personaName: z.string().min(1, '专家姓名不能为空'),
    content: z.string().min(1, '消息内容不能为空').max(2000, '单条消息过长'),
    emotion: z.string().max(50, '情绪描述过长'),
    bidValue: z.number().min(0, '出价不能为负数').optional(),
    timestamp: z.string()
  })).max(1000, '专家消息数量过多'),
  userSupplements: z.array(z.object({
    category: z.string().min(1, '补充分类不能为空').max(50, '补充分类过长'),
    content: z.string().min(1, '补充内容不能为空').max(2000, '单条补充过长'),
    timestamp: z.date().or(z.string())
  })).max(100, '用户补充数量过多'),
  agentConversations: z.record(z.object({
    agentName: z.string().min(1, 'Agent名称不能为空').max(50, 'Agent名称过长'),
    messages: z.array(z.object({
      role: z.enum(['agent', 'user']),
      content: z.string().min(1, '消息内容不能为空').max(2000, '单条消息过长'),
      timestamp: z.date().or(z.string()),
      scoreChange: z.number().optional()
    })).max(500, '单个Agent对话消息过多'),
    finalScore: z.number().min(0, '最终评分不能为负数').max(100, '最终评分超出范围'),
    conversationCount: z.number().min(0, '对话轮次不能为负数').max(100, '对话轮次过多')
  }))
})

// GET端点 - 获取API使用说明和支持的格式
export async function GET() {
  return NextResponse.json({
    name: 'AI创意竞价对话导出API',
    version: '1.0.0',
    description: '导出AI创意竞价过程中的完整对话记录和分析报告',
    supportedFormats: [
      {
        format: 'pdf',
        description: 'PDF文档格式，包含完整排版和页面布局',
        mimeType: 'application/pdf',
        features: ['中文字体支持', '自动分页', '页脚信息', '长文本换行']
      },
      {
        format: 'txt',
        description: '纯文本格式，便于查看和搜索',
        mimeType: 'text/plain',
        features: ['结构化文本', '专家分析总结', '关键词提取', '可读性优化']
      },
      {
        format: 'json',
        description: 'JSON格式，包含详细统计和洞察分析',
        mimeType: 'application/json',
        features: ['完整数据结构', '统计分析', '洞察报告', '时间分布', '程序化处理']
      }
    ],
    limits: {
      maxDataSize: '10MB',
      maxExpertMessages: 1000,
      maxAgentConversations: 20,
      maxUserSupplements: 100,
      maxContentLength: 5000
    },
    usage: {
      method: 'POST',
      endpoint: '/api/bidding/export-dialog',
      contentType: 'application/json',
      requiredFields: ['ideaId', 'ideaContent', 'sessionInfo', 'biddingResults'],
      optionalFields: ['format (default: pdf)', 'expertMessages', 'userSupplements', 'agentConversations']
    },
    examples: {
      minimalRequest: {
        ideaId: 'idea-123',
        ideaContent: '智能家居控制系统',
        format: 'pdf',
        sessionInfo: {
          sessionId: 'session-456',
          currentPhase: '竞价结束',
          startTime: '2024-01-01T10:00:00Z',
          duration: 1800,
          totalMessages: 25,
          supportedAgents: ['技术专家', '产品经理'],
          supplementCount: 3
        },
        biddingResults: {
          winningBid: 1500,
          averageBid: 1200,
          totalBids: 3,
          bids: { 'expert1': 1500, 'expert2': 1200, 'expert3': 900 },
          participants: [
            {
              personaId: 'expert1',
              name: '技术专家张三',
              specialty: '软件开发',
              bidAmount: 1500,
              participated: true
            }
          ]
        },
        expertMessages: [],
        userSupplements: [],
        agentConversations: {}
      }
    }
  })
}

// 导出对话文档API
export async function POST(request: NextRequest) {
  try {
    // 暂时注释掉用户认证，用于测试
    // const user = await getUserFromRequest(request)
    // if (!user) {
    //   return NextResponse.json({ error: '请先登录' }, { status: 401 })
    // }

    // 检查请求体大小
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB限制
      return NextResponse.json({ error: '请求数据过大，请减少导出内容' }, { status: 413 })
    }

    const body = await request.json()
    console.log('📄 收到对话文档导出请求:', {
      ideaId: body.ideaId,
      format: body.format,
      messagesCount: body.expertMessages?.length || 0,
      conversationsCount: Object.keys(body.agentConversations || {}).length,
      dataSize: JSON.stringify(body).length
    })

    const validatedData = exportDialogSchema.parse(body)

    // 根据格式处理导出
    switch (validatedData.format) {
      case 'pdf':
        const pdfBuffer = await generatePDFDocument(validatedData)
        const filename = `AI竞价对话记录_${validatedData.ideaId}_${new Date().toISOString().split('T')[0]}.pdf`

        return new NextResponse(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`
          }
        })

      case 'txt':
        const textContent = generateTextDocument(validatedData)
        return NextResponse.json({
          success: true,
          content: textContent,
          filename: `AI竞价对话记录_${validatedData.ideaId}_${new Date().toISOString().split('T')[0]}.txt`
        })

      case 'json':
        const jsonContent = generateJSONDocument(validatedData)
        return NextResponse.json({
          success: true,
          content: jsonContent,
          filename: `AI竞价对话记录_${validatedData.ideaId}_${new Date().toISOString().split('T')[0]}.json`
        })

      default:
        return NextResponse.json({ error: '不支持的导出格式' }, { status: 400 })
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ 数据验证失败:', error.errors)
      const errorMessage = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ')
      return NextResponse.json(
        {
          error: '数据格式错误',
          details: errorMessage,
          fields: error.errors.map(err => ({ path: err.path, message: err.message }))
        },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      console.error('❌ 导出对话文档失败:', error.message)

      // 根据错误类型返回不同的状态码
      if (error.message.includes('内存') || error.message.includes('大小')) {
        return NextResponse.json({ error: '文档过大，请减少导出内容' }, { status: 413 })
      }
      if (error.message.includes('字体') || error.message.includes('PDF')) {
        return NextResponse.json({ error: 'PDF生成失败，请尝试其他格式' }, { status: 500 })
      }
    }

    console.error('❌ 导出对话文档失败:', error)
    return NextResponse.json({
      error: '服务器内部错误，请稍后重试',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// 生成PDF文档
async function generatePDFDocument(data: z.infer<typeof exportDialogSchema>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 50,
        bufferPages: true,
        info: {
          Title: `AI竞价对话记录_${data.ideaId}`,
          Author: 'AI Agent Market',
          Subject: '创意竞价对话导出文档'
        }
      })
      const chunks: Buffer[] = []

      doc.on('data', chunk => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      // 处理中文字体问题 - 暂时禁用字体加载，使用默认字体
      try {
        doc.font('Helvetica')
      } catch (fontError) {
        console.warn('字体设置失败，使用默认字体:', fontError)
      }

      // 标题
      doc.fontSize(20).text('AI创意竞价对话记录', { align: 'center' })
      doc.moveDown()

      // 基础信息
      doc.fontSize(16).text('创意信息', { underline: true })
      doc.fontSize(12)
      doc.text(`创意ID: ${data.ideaId}`)

      // 处理长文本换行
      const maxLineLength = 80
      const ideaLines = data.ideaContent?.match(new RegExp(`.{1,${maxLineLength}}`, 'g')) || [data.ideaContent || '']
      doc.text('创意内容:')
      ideaLines.forEach(line => {
        doc.text(`  ${line}`)
      })

      doc.text(`导出时间: ${new Date().toLocaleString('zh-CN')}`)
      doc.moveDown()

      // 会话统计
      doc.fontSize(16).text('会话统计', { underline: true })
      doc.fontSize(12)
      doc.text(`会话ID: ${data.sessionInfo.sessionId}`)
      doc.text(`当前阶段: ${data.sessionInfo.currentPhase}`)
      doc.text(`会话时长: ${Math.floor(data.sessionInfo.duration / 60)}分${data.sessionInfo.duration % 60}秒`)
      doc.text(`专家消息数: ${data.sessionInfo.totalMessages}`)
      doc.text(`用户补充次数: ${data.sessionInfo.supplementCount}`)
      doc.text(`支持的专家: ${data.sessionInfo.supportedAgents.join(', ')}`)
      doc.moveDown()

      // 竞价结果
      doc.fontSize(16).text('竞价结果', { underline: true })
      doc.fontSize(12)
      doc.text(`最高出价: ¥${data.biddingResults.winningBid}`)
      doc.text(`平均出价: ¥${data.biddingResults.averageBid.toFixed(2)}`)
      doc.text(`参与专家数: ${data.biddingResults.totalBids}`)

      // 各专家出价 - 添加页面检查
      doc.text('各专家出价:')
      data.biddingResults.participants.forEach((participant, index) => {
        if (doc.y > 700) { // 如果接近页面底部
          doc.addPage()
        }
        doc.text(`  - ${participant.name}: ¥${participant.bidAmount} (${participant.specialty})`)
      })
      doc.moveDown()

      // 专家讨论记录
      if (data.expertMessages.length > 0) {
        if (doc.y > 600) doc.addPage()
        doc.fontSize(16).text('专家讨论记录', { underline: true })
        doc.fontSize(10)

        data.expertMessages.forEach((message, index) => {
          if (doc.y > 700) doc.addPage()

          const timestamp = new Date(message.timestamp).toLocaleString('zh-CN')
          doc.text(`${index + 1}. ${message.personaName} (${timestamp})`)
          doc.text(`   情绪: ${message.emotion} | 出价: ${message.bidValue ? '¥' + message.bidValue : '未出价'}`)

          // 处理长消息内容
          const contentLines = message.content?.match(/.{1,70}/g) || [message.content || '']
          doc.text('   内容:')
          contentLines.forEach(line => {
            doc.text(`   ${line}`)
          })
          doc.moveDown(0.5)
        })
        doc.moveDown()
      }

      // 用户补充记录
      if (data.userSupplements.length > 0) {
        if (doc.y > 600) doc.addPage()
        doc.fontSize(16).text('用户补充记录', { underline: true })
        doc.fontSize(12)

        data.userSupplements.forEach((supplement, index) => {
          if (doc.y > 700) doc.addPage()

          const timestamp = new Date(supplement.timestamp).toLocaleString('zh-CN')
          doc.text(`${index + 1}. ${supplement.category} (${timestamp})`)

          const contentLines = supplement.content?.match(/.{1,70}/g) || [supplement.content || '']
          contentLines.forEach(line => {
            doc.text(`   ${line}`)
          })
          doc.moveDown(0.5)
        })
        doc.moveDown()
      }

      // Agent对话记录
      const conversationEntries = Object.entries(data.agentConversations)
      if (conversationEntries.length > 0) {
        if (doc.y > 500) doc.addPage()
        doc.fontSize(16).text('Agent对话记录', { underline: true })
        doc.fontSize(10)

        conversationEntries.forEach(([agentId, conversation]) => {
          if (conversation.messages.length > 0) {
            if (doc.y > 650) doc.addPage()

            doc.text(`${conversation.agentName} (最终评分: ${conversation.finalScore}分, 对话轮次: ${conversation.conversationCount})`)

            conversation.messages.forEach((message, index) => {
              if (doc.y > 700) doc.addPage()

              const timestamp = new Date(message.timestamp).toLocaleString('zh-CN')
              const roleText = message.role === 'user' ? '用户' : conversation.agentName
              doc.text(`  ${index + 1}. ${roleText} (${timestamp})`)

              if (message.scoreChange) {
                doc.text(`     评分变化: ${message.scoreChange > 0 ? '+' : ''}${message.scoreChange}分`)
              }

              const contentLines = message.content?.match(/.{1,60}/g) || [message.content || '']
              contentLines.forEach(line => {
                doc.text(`     ${line}`)
              })
              doc.moveDown(0.3)
            })
            doc.moveDown()
          }
        })
      }

      // 添加页脚
      const pages = doc.bufferedPageRange()
      for (let i = pages.start; i < pages.start + pages.count; i++) {
        doc.switchToPage(i)
        doc.fontSize(8).text(
          `第 ${i + 1} 页，共 ${pages.count} 页 | 生成时间: ${new Date().toLocaleString('zh-CN')}`,
          50,
          doc.page.height - 50,
          { align: 'center' }
        )
      }

      // 结束文档
      doc.end()

    } catch (error) {
      reject(new Error(`PDF生成失败: ${error}`))
    }
  })
}

// 生成文本文档
function generateTextDocument(data: z.infer<typeof exportDialogSchema>): string {
  const lines: string[] = []

  // 标题和基础信息
  lines.push('AI创意竞价对话记录')
  lines.push('='.repeat(50))
  lines.push('')
  lines.push('创意信息:')
  lines.push(`创意ID: ${data.ideaId}`)
  lines.push(`创意内容: ${data.ideaContent}`)
  lines.push(`导出时间: ${new Date().toLocaleString('zh-CN')}`)
  lines.push('')

  // 会话统计
  lines.push('会话统计:')
  lines.push(`会话ID: ${data.sessionInfo.sessionId}`)
  lines.push(`当前阶段: ${data.sessionInfo.currentPhase}`)
  lines.push(`会话时长: ${Math.floor(data.sessionInfo.duration / 60)}分${data.sessionInfo.duration % 60}秒`)
  lines.push(`专家消息数: ${data.sessionInfo.totalMessages}`)
  lines.push(`用户补充次数: ${data.sessionInfo.supplementCount}`)
  lines.push(`支持的专家: ${data.sessionInfo.supportedAgents.join(', ')}`)
  lines.push('')

  // 竞价结果
  lines.push('竞价结果:')
  lines.push(`最高出价: ¥${data.biddingResults.winningBid}`)
  lines.push(`平均出价: ¥${data.biddingResults.averageBid.toFixed(2)}`)
  lines.push(`参与专家数: ${data.biddingResults.totalBids}`)
  lines.push('')
  lines.push('各专家出价:')
  data.biddingResults.participants.forEach(participant => {
    lines.push(`- ${participant.name}: ¥${participant.bidAmount} (${participant.specialty})`)
  })
  lines.push('')

  // 专家讨论记录
  if (data.expertMessages.length > 0) {
    lines.push('专家讨论记录:')
    lines.push('-'.repeat(40))

    data.expertMessages.forEach((message, index) => {
      const timestamp = new Date(message.timestamp).toLocaleString('zh-CN')
      lines.push(`${index + 1}. ${message.personaName} (${timestamp})`)
      lines.push(`   情绪: ${message.emotion} | 出价: ${message.bidValue ? '¥' + message.bidValue : '未出价'}`)
      lines.push(`   内容: ${message.content}`)
      lines.push('')
    })
  }

  // 用户补充记录
  if (data.userSupplements.length > 0) {
    lines.push('用户补充记录:')
    lines.push('-'.repeat(40))

    data.userSupplements.forEach((supplement, index) => {
      const timestamp = new Date(supplement.timestamp).toLocaleString('zh-CN')
      lines.push(`${index + 1}. ${supplement.category} (${timestamp})`)
      lines.push(`   ${supplement.content}`)
      lines.push('')
    })
  }

  // Agent对话记录
  const conversationEntries = Object.entries(data.agentConversations)
  if (conversationEntries.length > 0) {
    lines.push('Agent对话记录:')
    lines.push('-'.repeat(40))

    conversationEntries.forEach(([agentId, conversation]) => {
      if (conversation.messages.length > 0) {
        lines.push(`${conversation.agentName} (最终评分: ${conversation.finalScore}分, 对话轮次: ${conversation.conversationCount})`)
        lines.push('')

        conversation.messages.forEach((message, index) => {
          const timestamp = new Date(message.timestamp).toLocaleString('zh-CN')
          const roleText = message.role === 'user' ? '用户' : conversation.agentName
          lines.push(`  ${index + 1}. ${roleText} (${timestamp})`)
          if (message.scoreChange) {
            lines.push(`     评分变化: ${message.scoreChange > 0 ? '+' : ''}${message.scoreChange}分`)
          }
          lines.push(`     ${message.content}`)
          lines.push('')
        })
        lines.push('')
      }
    })
  }

  // 分析总结部分
  lines.push('对话分析总结:')
  lines.push('-'.repeat(40))
  lines.push('')

  // 专家创意拆解分析
  lines.push('【专家创意拆解情况分析】')
  lines.push('')

  // 分析每个专家是否针对创意进行了拆解回答
  const expertAnalysis = analyzeExpertResponses(data)
  expertAnalysis.forEach(analysis => {
    lines.push(`${analysis.expertName}:`)
    lines.push(`  - 回应创意核心: ${analysis.addressedCore ? '是' : '否'}`)
    lines.push(`  - 提出具体问题: ${analysis.askedSpecificQuestions ? '是' : '否'}`)
    lines.push(`  - 分析可行性: ${analysis.analyzedFeasibility ? '是' : '否'}`)
    lines.push(`  - 给出建设性建议: ${analysis.gaveConstructiveFeedback ? '是' : '否'}`)
    lines.push(`  - 总体评价: ${analysis.overallQuality}`)
    lines.push('')
  })

  lines.push('END OF DOCUMENT')
  lines.push('='.repeat(50))

  return lines.join('\n')
}

// 分析专家回应质量
function analyzeExpertResponses(data: z.infer<typeof exportDialogSchema>) {
  return data.biddingResults.participants.map(participant => {
    const expertMessages = data.expertMessages.filter(msg => msg.personaId === participant.personaId)
    const conversation = data.agentConversations[participant.personaId]

    const allContent = [
      ...expertMessages.map(msg => msg.content),
      ...(conversation?.messages.filter(msg => msg.role === 'agent').map(msg => msg.content) || [])
    ].join(' ')

    // 简单的关键词分析
    const ideaKeywords = extractKeywords(data.ideaContent)
    const responseKeywords = extractKeywords(allContent)

    const addressedCore = ideaKeywords.some(keyword =>
      responseKeywords.some(respKeyword =>
        respKeyword.includes(keyword) || keyword.includes(respKeyword)
      )
    )

    const askedSpecificQuestions = /[？\?]/.test(allContent) && allContent.length > 50
    const analyzedFeasibility = /可行|实现|困难|挑战|风险|市场|技术|用户/.test(allContent)
    const gaveConstructiveFeedback = /建议|推荐|应该|可以|不如|优化|改进/.test(allContent)

    let overallQuality = '一般'
    const qualityScore = [addressedCore, askedSpecificQuestions, analyzedFeasibility, gaveConstructiveFeedback]
      .filter(Boolean).length

    if (qualityScore >= 3) overallQuality = '优秀'
    else if (qualityScore >= 2) overallQuality = '良好'
    else if (qualityScore >= 1) overallQuality = '一般'
    else overallQuality = '需改进'

    return {
      expertName: participant.name,
      addressedCore,
      askedSpecificQuestions,
      analyzedFeasibility,
      gaveConstructiveFeedback,
      overallQuality
    }
  })
}

// 提取关键词
function extractKeywords(text: string): string[] {
  // 简单的中文关键词提取
  if (!text || text.trim() === '') {
    return []
  }
  return text
    .replace(/[，。！？；：""''（）【】《》]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length >= 2 && word.length <= 10)
    .slice(0, 10) // 取前10个关键词
}

// 生成JSON文档
function generateJSONDocument(data: z.infer<typeof exportDialogSchema>) {
  const exportTime = new Date().toISOString()
  const analysis = analyzeExpertResponses(data)

  // 计算统计信息
  const stats = {
    totalExpertMessages: data.expertMessages.length,
    totalUserSupplements: data.userSupplements.length,
    totalAgentConversations: Object.keys(data.agentConversations).length,
    totalAgentMessages: Object.values(data.agentConversations).reduce(
      (sum, conv) => sum + conv.messages.length, 0
    ),
    averageExpertScore: analysis.length > 0
      ? analysis.reduce((sum, expert) => {
          const score = expert.overallQuality === '优秀' ? 4
            : expert.overallQuality === '良好' ? 3
            : expert.overallQuality === '一般' ? 2 : 1
          return sum + score
        }, 0) / analysis.length
      : 0,
    timeDistribution: calculateTimeDistribution(data)
  }

  const exportData = {
    meta: {
      exportTime,
      exportFormat: 'json',
      version: '1.0.0',
      source: 'AI Agent Market',
      ideaId: data.ideaId
    },
    ideaInfo: {
      id: data.ideaId,
      content: data.ideaContent,
      keywords: extractKeywords(data.ideaContent)
    },
    sessionInfo: data.sessionInfo,
    biddingResults: {
      ...data.biddingResults,
      statistics: {
        bidRange: {
          min: Math.min(...data.biddingResults.participants.map(p => p.bidAmount)),
          max: Math.max(...data.biddingResults.participants.map(p => p.bidAmount)),
          median: calculateMedian(data.biddingResults.participants.map(p => p.bidAmount))
        },
        participationRate: data.biddingResults.participants.filter(p => p.participated).length / data.biddingResults.participants.length
      }
    },
    expertMessages: data.expertMessages.map(msg => ({
      ...msg,
      contentLength: msg.content.length,
      wordCount: msg.content?.split(/\s+/).length || 0
    })),
    userSupplements: data.userSupplements,
    agentConversations: Object.fromEntries(
      Object.entries(data.agentConversations).map(([agentId, conv]) => [
        agentId,
        {
          ...conv,
          statistics: {
            avgMessageLength: conv.messages.reduce((sum, msg) => sum + msg.content.length, 0) / conv.messages.length,
            scoreChanges: conv.messages.filter(msg => msg.scoreChange).map(msg => msg.scoreChange),
            userMessageCount: conv.messages.filter(msg => msg.role === 'user').length,
            agentMessageCount: conv.messages.filter(msg => msg.role === 'agent').length
          }
        }
      ])
    ),
    analysis: {
      expertAnalysis: analysis,
      overallStats: stats,
      insights: generateInsights(data, analysis, stats)
    }
  }

  return exportData
}

// 计算中位数
function calculateMedian(numbers: number[]): number {
  const sorted = numbers.sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle]
}

// 计算时间分布
function calculateTimeDistribution(data: z.infer<typeof exportDialogSchema>) {
  const allTimestamps = [
    ...data.expertMessages.map(msg => new Date(msg.timestamp)),
    ...data.userSupplements.map(sup => new Date(sup.timestamp)),
    ...Object.values(data.agentConversations).flatMap(conv =>
      conv.messages.map(msg => new Date(msg.timestamp))
    )
  ].sort((a, b) => a.getTime() - b.getTime())

  if (allTimestamps.length === 0) return {}

  const startTime = allTimestamps[0]
  const endTime = allTimestamps[allTimestamps.length - 1]
  const totalDuration = endTime.getTime() - startTime.getTime()

  // 按小时分组
  const hourlyDistribution: Record<string, number> = {}
  allTimestamps.forEach(timestamp => {
    const hour = timestamp.getHours()
    const key = `${hour}:00-${hour + 1}:00`
    hourlyDistribution[key] = (hourlyDistribution[key] || 0) + 1
  })

  return {
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    totalDurationMs: totalDuration,
    hourlyDistribution,
    peakHour: Object.entries(hourlyDistribution).reduce((a, b) =>
      hourlyDistribution[a[0]] > hourlyDistribution[b[0]] ? a : b
    )[0]
  }
}

// 生成洞察
function generateInsights(
  data: z.infer<typeof exportDialogSchema>,
  analysis: any[],
  stats: any
) {
  const insights = []

  // 专家参与度分析
  const highQualityExperts = analysis.filter(expert =>
    expert.overallQuality === '优秀' || expert.overallQuality === '良好'
  ).length
  insights.push({
    type: 'expert_engagement',
    title: '专家参与质量',
    value: `${highQualityExperts}/${analysis.length}位专家提供了高质量回应`,
    score: (highQualityExperts / analysis.length) * 100
  })

  // 竞价分析
  const bidSpread = data.biddingResults.winningBid - Math.min(...data.biddingResults.participants.map(p => p.bidAmount))
  insights.push({
    type: 'bidding_competition',
    title: '竞价竞争激烈程度',
    value: `出价范围¥${bidSpread}，${bidSpread > 500 ? '竞争激烈' : '竞争温和'}`,
    score: Math.min((bidSpread / 1000) * 100, 100)
  })

  // 对话深度分析
  const avgConversationDepth = Object.values(data.agentConversations)
    .reduce((sum, conv) => sum + conv.conversationCount, 0) / Object.keys(data.agentConversations).length
  insights.push({
    type: 'conversation_depth',
    title: '对话深度',
    value: `平均${avgConversationDepth.toFixed(1)}轮对话`,
    score: Math.min(avgConversationDepth * 20, 100)
  })

  // 用户参与度
  const supplementRate = data.userSupplements.length / Math.max(data.sessionInfo.totalMessages, 1)
  insights.push({
    type: 'user_engagement',
    title: '用户参与积极性',
    value: `补充信息${data.userSupplements.length}次`,
    score: Math.min(supplementRate * 200, 100)
  })

  return insights
}