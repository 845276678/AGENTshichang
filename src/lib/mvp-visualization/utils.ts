/**
 * MVP前端可视化工作坊 - 核心工具函数
 *
 * 用途：提供MVP工作坊的核心功能，包括frontendDesign数据读取、代码生成等
 * 关联文档：docs/MVP工作坊-当前稳定版本记录.md
 */

import { prisma } from '@/lib/prisma'
import type {
  FrontendRequirements,
  GeneratedCode,
  MVPVisualizationSessionData
} from '@/types/mvp-visualization'
import type { FrontendDesign, RefinedDocument } from '@/types/idea-refinement'

// ============================================
// 从创意完善文档读取frontendDesign
// ============================================

/**
 * 从创意完善文档中提取frontendDesign数据
 * 对应方案文档中的核心读取逻辑
 *
 * @param refinementDocumentId - 创意完善文档ID
 * @returns FrontendRequirements | null
 */
export async function extractFrontendDesignFromRefinementDocument(
  refinementDocumentId: string
): Promise<FrontendRequirements | null> {
  try {
    // 从数据库读取创意完善文档
    const refinementDoc = await prisma.ideaRefinementDocument.findUnique({
      where: { id: refinementDocumentId },
      select: {
        id: true,
        refinedDocument: true
      }
    })

    if (!refinementDoc) {
      console.warn(`⚠️ 未找到创意完善文档: ${refinementDocumentId}`)
      return null
    }

    const refinedData = refinementDoc.refinedDocument as RefinedDocument

    // 🆕 读取frontendDesign字段（优先级1）
    if (refinedData.productDetails?.frontendDesign) {
      console.log('✅ 成功读取frontendDesign数据（来自第6轮对话）')
      return {
        ...refinedData.productDetails.frontendDesign,
        source: 'refinement-workshop',
        refinementDocumentId
      }
    }

    // 🟡 推断frontendDesign（优先级2：向后兼容）
    if (refinedData.productDetails) {
      console.warn('⚠️ 旧版本数据，使用推断的frontendDesign')
      return inferFrontendDesignFromProductDetails(
        refinedData.productDetails,
        refinementDocumentId
      )
    }

    // 🔴 完全没有产品详情数据
    console.error('❌ refinedDocument缺少productDetails，无法推断frontendDesign')
    return null

  } catch (error) {
    console.error('❌ 读取frontendDesign时发生错误:', error)
    return null
  }
}

/**
 * 推断frontendDesign数据（向后兼容旧版文档）
 * 从产品总体描述和核心功能推断基本的前端需求
 */
export function inferFrontendDesignFromProductDetails(
  productDetails: any,
  refinementDocumentId: string
): FrontendRequirements {
  const summary = productDetails.summary || '产品描述缺失'
  const features = productDetails.coreFeatures || []
  const technicalApproach = productDetails.technicalApproach || ''

  // 根据产品类型推断页面结构
  let pageStructure = '顶部导航栏 + 主内容区 + 底部信息'
  if (summary.includes('平台') || summary.includes('SaaS') || summary.includes('管理系统')) {
    pageStructure = '顶部导航栏 + 左侧菜单 + 主内容区 + 底部信息'
  } else if (summary.includes('电商') || summary.includes('商城')) {
    pageStructure = '顶部导航栏 + 轮播图 + 商品列表 + 底部信息'
  } else if (summary.includes('社交') || summary.includes('社区')) {
    pageStructure = '顶部导航栏 + 左侧侧边栏 + 动态流 + 右侧推荐'
  }

  // 从核心功能推断交互
  const coreInteractions: string[] = []
  features.forEach((feature: string) => {
    if (feature.includes('登录') || feature.includes('注册')) {
      coreInteractions.push('用户登录注册')
    }
    if (feature.includes('搜索') || feature.includes('筛选')) {
      coreInteractions.push('搜索筛选功能')
    }
    if (feature.includes('创建') || feature.includes('发布') || feature.includes('上传')) {
      coreInteractions.push('创建内容表单')
    }
    if (feature.includes('支付') || feature.includes('购买') || feature.includes('订单')) {
      coreInteractions.push('支付下单流程')
    }
    if (feature.includes('评论') || feature.includes('点赞') || feature.includes('分享')) {
      coreInteractions.push('社交互动功能')
    }
  })

  // 如果没有推断出任何交互，使用默认值
  if (coreInteractions.length === 0) {
    coreInteractions.push('用户登录注册', '浏览内容', '基本操作')
  }

  // 根据产品类型推断配色方案
  let colorScheme = '现代科技风（蓝色主调）'
  if (summary.includes('教育') || summary.includes('学习')) {
    colorScheme = '清新活力风（绿色主调）'
  } else if (summary.includes('电商') || summary.includes('购物')) {
    colorScheme = '温暖活力风（橙色主调）'
  } else if (summary.includes('金融') || summary.includes('理财')) {
    colorScheme = '稳重商务风（蓝灰主调）'
  } else if (summary.includes('创意') || summary.includes('设计')) {
    colorScheme = '时尚个性风（多彩渐变）'
  }

  // 根据技术选型推断目标设备
  const targetDevices: string[] = ['桌面端']
  if (technicalApproach.includes('React Native') || technicalApproach.includes('Flutter')) {
    targetDevices.push('移动端（原生App）')
  } else if (technicalApproach.includes('响应式') || technicalApproach.includes('移动')) {
    targetDevices.push('移动端（网页）')
  }

  return {
    pageStructure,
    coreInteractions,
    visualStyle: {
      colorScheme,
      typography: '现代简约',
      layout: summary.includes('平台') || summary.includes('SaaS') ? '双栏布局' : '单栏布局'
    },
    targetDevices,
    referenceExamples: '（自动推断）基于产品类型和功能特点',
    source: 'refinement-workshop',
    refinementDocumentId
  }
}

// ============================================
// 验证frontendRequirements数据完整性
// ============================================

/**
 * 验证frontendRequirements是否完整且合法
 */
export function validateFrontendRequirements(
  requirements: FrontendRequirements
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // 必填字段检查
  if (!requirements.pageStructure || requirements.pageStructure.trim() === '') {
    errors.push('缺少页面结构描述')
  }

  if (!requirements.coreInteractions || requirements.coreInteractions.length === 0) {
    errors.push('缺少核心交互列表')
  }

  if (!requirements.visualStyle) {
    errors.push('缺少视觉风格配置')
  } else {
    if (!requirements.visualStyle.colorScheme) {
      errors.push('缺少配色方案')
    }
    if (!requirements.visualStyle.typography) {
      errors.push('缺少字体风格')
    }
    if (!requirements.visualStyle.layout) {
      errors.push('缺少布局方式')
    }
  }

  if (!requirements.targetDevices || requirements.targetDevices.length === 0) {
    errors.push('缺少目标设备列表')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// ============================================
// 合并HTML和CSS生成单文件
// ============================================

/**
 * 合并HTML和CSS代码，生成可直接在浏览器打开的单文件
 *
 * @param html - HTML代码
 * @param css - CSS代码
 * @param projectTitle - 项目标题（可选）
 * @returns 完整的HTML文件内容
 */
export function mergeCodeToHTMLFile(
  html: string,
  css: string,
  projectTitle?: string
): string {
  const title = projectTitle || 'MVP原型 - 由AI生成'

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${title}">
  <title>${title}</title>
  <style>
    /* 重置样式 */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
    }

    /* 用户自定义样式 */
    ${css}
  </style>
</head>
<body>
  ${html}

  <!-- 基本交互脚本（可选） -->
  <script>
    // 可以在这里添加基本的JavaScript交互逻辑
    console.log('MVP原型已加载，由AI自动生成 - 创意市场平台');
  </script>
</body>
</html>`
}

// ============================================
// 从会话生成创意计划书更新
// ============================================

/**
 * 从MVP可视化会话生成Markdown格式的创意计划书更新
 * 包含前端设计需求、生成的代码、对话摘要等
 *
 * @param session - MVP可视化会话数据
 * @returns Markdown格式的计划书内容
 */
export function generatePlanDocumentFromSession(
  session: MVPVisualizationSessionData
): string {
  const { frontendRequirements, conversationHistory, adjustmentHistory } = session

  const markdown = `# MVP前端可视化工作坊 - 输出报告

> 生成时间：${new Date().toLocaleString('zh-CN')}
> 会话ID：${session.id}
> 用户ID：${session.userId}

---

## 📋 前端设计需求

### 页面结构
${frontendRequirements.pageStructure}

### 核心交互
${frontendRequirements.coreInteractions.map((interaction, i) => `${i + 1}. ${interaction}`).join('\n')}

### 视觉风格
- **配色方案**：${frontendRequirements.visualStyle.colorScheme}
- **字体风格**：${frontendRequirements.visualStyle.typography}
- **布局方式**：${frontendRequirements.visualStyle.layout}

### 目标设备
${frontendRequirements.targetDevices.map(device => `- ${device}`).join('\n')}

### 参考案例
${frontendRequirements.referenceExamples}

---

## 🎨 生成的前端代码

### HTML结构
\`\`\`html
${session.generatedHTML}
\`\`\`

### CSS样式
\`\`\`css
${session.generatedCSS}
\`\`\`

---

## 💬 对话历史摘要

本次工作坊共进行 **${session.currentRound} 轮对话**，完成了从初始代码生成到多次优化调整的完整流程。

${conversationHistory
  .filter(msg => msg.role === 'user')
  .map((msg, i) => `### 第 ${msg.round} 轮对话\n**用户需求**：${msg.content.substring(0, 200)}${msg.content.length > 200 ? '...' : ''}`)
  .join('\n\n')}

---

## 🔧 调整记录

共进行 **${adjustmentHistory.length} 次代码调整**

${adjustmentHistory
  .map((adj, i) => `### 调整 ${i + 1}（第${adj.round}轮）
**用户请求**：${adj.userRequest}
**AI说明**：${adj.aiExplanation}
**调整时间**：${new Date(adj.adjustedAt).toLocaleString('zh-CN')}`)
  .join('\n\n')}

---

## 📊 工作坊统计

- **开始时间**：${new Date(session.createdAt).toLocaleString('zh-CN')}
- **完成时间**：${session.completedAt ? new Date(session.completedAt).toLocaleString('zh-CN') : '进行中'}
- **消耗积分**：${session.creditsDeducted} 积分
- **数据来源**：${session.isFromBidding ? 'AI竞价（免费）' : '独立启动'}
- **会话状态**：${session.status}

---

## 🚀 下一步建议

1. **本地测试**：下载生成的HTML文件，在浏览器中打开测试效果
2. **功能完善**：根据实际需求添加JavaScript交互逻辑
3. **响应式优化**：确保在不同设备上的显示效果
4. **部署上线**：使用Vercel、Netlify等服务一键部署
5. **用户测试**：邀请目标用户试用并收集反馈

---

**生成工具**：创意市场 - MVP前端可视化工作坊
**技术支持**：AI驱动的创意孵化平台
`

  return markdown
}

// ============================================
// 工具函数：格式化代码
// ============================================

/**
 * 简单的HTML格式化（添加缩进）
 */
export function formatHTML(html: string): string {
  // 简单的格式化逻辑，实际项目可以使用prettier
  return html
    .replace(/></g, '>\n<')
    .split('\n')
    .map((line, i) => {
      const indent = '  '.repeat(Math.max(0, line.split('<').length - line.split('>').length))
      return indent + line.trim()
    })
    .join('\n')
}

/**
 * 简单的CSS格式化
 */
export function formatCSS(css: string): string {
  // 简单的格式化逻辑
  return css
    .replace(/\{/g, ' {\n  ')
    .replace(/\}/g, '\n}\n')
    .replace(/;/g, ';\n  ')
    .trim()
}
