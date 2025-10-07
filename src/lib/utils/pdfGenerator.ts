import ReactPDF from '@react-pdf/renderer'
import type { LandingCoachGuide } from './transformReportToGuide'

/**
 * 生成PDF Buffer
 * 使用简单的文本转PDF方式，避免在服务端使用JSX
 */
export async function generateGuidePDF(guide: LandingCoachGuide): Promise<Buffer> {
  // 使用markdown-pdf或其他纯文本转PDF库
  // 由于@react-pdf/renderer需要JSX，这里我们改用更简单的方法
  // 将markdown内容转换为纯文本，然后使用简单的PDF生成

  const { generateGuideMarkdown } = await import('./transformReportToGuide')
  const markdownContent = generateGuideMarkdown(guide)

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
  const lines = plainText.split('\n')
  const maxLinesPerPage = 50
  const pages = []

  for (let i = 0; i < lines.length; i += maxLinesPerPage) {
    pages.push(lines.slice(i, i + maxLinesPerPage))
  }

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

  const pdfStream = await ReactPDF.renderToStream(pdfDoc)

  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = []
    pdfStream.on('data', (chunk: Uint8Array) => chunks.push(chunk))
    pdfStream.on('end', () => resolve(Buffer.concat(chunks)))
    pdfStream.on('error', reject)
  })
}
