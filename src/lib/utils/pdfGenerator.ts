import ReactPDF from '@react-pdf/renderer'
import type { LandingCoachGuide } from './transformReportToGuide'

/**
 * 生成PDF Buffer
 * 使用简单的文本转PDF方式，避免在服务端使用JSX
 */
export async function generateGuidePDF(guide: LandingCoachGuide): Promise<Buffer> {
  try {
    console.log('📄 开始生成PDF，指南标题:', guide.metadata.ideaTitle)

    // 使用markdown-pdf或其他纯文本转PDF库
    // 由于@react-pdf/renderer需要JSX，这里我们改用更简单的方法
    // 将markdown内容转换为纯文本，然后使用简单的PDF生成

    const { generateGuideMarkdown } = await import('./transformReportToGuide')
    const markdownContent = generateGuideMarkdown(guide)

    console.log('📝 Markdown内容长度:', markdownContent.length)

    // 将markdown转为纯文本（移除markdown语法）
    const plainText = markdownContent
      .replace(/[#*_`>\-\[\]]/g, '')
      .replace(/\n\n+/g, '\n\n')

    // 创建一个基础的PDF文档
    const { Document, Page, Text, View, StyleSheet } = ReactPDF

    const styles = StyleSheet.create({
      page: {
        padding: 40,
        fontSize: 11,
        fontFamily: 'Helvetica',
      },
      text: {
        marginBottom: 5,
        lineHeight: 1.5,
      },
    })

    // 将文本分段
    const lines = plainText.split('\n').filter(line => line.trim())
    const maxLinesPerPage = 50
    const pages = []

    for (let i = 0; i < lines.length; i += maxLinesPerPage) {
      pages.push(lines.slice(i, i + maxLinesPerPage))
    }

    console.log(`📄 分为${pages.length}页，共${lines.length}行`)

    // 使用React.createElement创建PDF文档
    const React = await import('react')

    const pdfDoc = React.createElement(
      Document,
      {},
      ...pages.map((pageLines, pageIdx) =>
        React.createElement(
          Page,
          { key: pageIdx, size: 'A4', style: styles.page },
          React.createElement(
            View,
            {},
            ...pageLines.map((line, lineIdx) =>
              React.createElement(Text, { key: lineIdx, style: styles.text }, line)
            )
          )
        )
      )
    )

    console.log('🔄 开始渲染PDF...')
    const pdfBuffer = await ReactPDF.renderToBuffer(pdfDoc)
    console.log('✅ PDF生成成功，大小:', pdfBuffer.length, 'bytes')

    return Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer)
  } catch (error) {
    console.error('❌ PDF生成失败:', error)
    throw new Error(`PDF生成失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}
