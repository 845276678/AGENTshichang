# MVP前端可视化工作坊 - 完整实施清单

> **文档版本**: v1.0
> **创建日期**: 2025-10-25
> **预计总时长**: 8-12小时
> **优先级**: 高

---

## 📋 总体进度概览

- [ ] **Phase 1**: 数据库和创意完善工作坊前置调整 (1-2小时)
- [ ] **Phase 2**: 核心业务逻辑和Context (1.5-2小时)
- [ ] **Phase 3**: UI组件开发 (2-3小时)
- [ ] **Phase 4**: API路由实现 (1.5-2小时)
- [ ] **Phase 5**: AI集成和Prompt工程 (1-1.5小时)
- [ ] **Phase 6**: 测试和优化 (1-1.5小时)

---

## Phase 1: 数据库和创意完善工作坊前置调整 (1-2小时)

### 1.1 更新Prisma Schema - MVP工作坊数据表
**文件**: `prisma/schema.prisma`
**操作**: 添加新模型

```prisma
model MVPVisualizationSession {
  id                    String   @id @default(cuid())
  userId                String   @map("user_id")
  user                  User     @relation(fields: [userId], references: [id])

  // 关联创意完善文档
  refinementDocumentId  String?  @map("refinement_document_id")
  refinementDocument    IdeaRefinementDocument? @relation(fields: [refinementDocumentId], references: [id])

  // 前端内容（从创意完善文档提取）
  frontendRequirements  Json     @map("frontend_requirements")

  // 可视化生成的代码
  generatedHTML         String   @db.Text @map("generated_html")
  generatedCSS          String   @db.Text @map("generated_css")

  // 对话历史
  conversationHistory   Json[]   @map("conversation_history")
  currentRound          Int      @default(1) @map("current_round")

  // 调整历史
  adjustmentHistory     Json[]   @map("adjustment_history")

  // 积分相关
  creditsDeducted       Int      @default(0) @map("credits_deducted")
  isFromBidding         Boolean  @default(false) @map("is_from_bidding")

  // 最终输出
  finalHTMLFile         String?  @db.Text @map("final_html_file")
  updatedPlanDocument   String?  @db.Text @map("updated_plan_document")

  // 状态
  status                String   @default("IN_PROGRESS") // IN_PROGRESS / COMPLETED / CANCELLED

  // 时间戳
  createdAt             DateTime @default(now()) @map("created_at")
  updatedAt             DateTime @updatedAt @map("updated_at")
  completedAt           DateTime? @map("completed_at")

  @@map("mvp_visualization_sessions")
  @@index([userId])
  @@index([status])
  @@index([refinementDocumentId])
}
```

**任务清单**:
- [ ] 在schema.prisma中添加MVPVisualizationSession模型
- [ ] 在User模型中添加关联: `mvpSessions MVPVisualizationSession[]`
- [ ] 运行 `npx prisma generate` 生成客户端
- [ ] 运行 `npx prisma migrate dev --name add_mvp_visualization_sessions` 创建迁移
- [ ] 验证数据库表创建成功

**预计时间**: 30分钟

---

### 1.2 创意完善工作坊Schema调整 - 增加前端设计维度
**文件**: `prisma/schema.prisma`
**操作**: 更新IdeaRefinementDocument模型

**任务清单**:
- [ ] 确认IdeaRefinementDocument的refinedDocument字段已支持productDetails.frontendDesign子字段
- [ ] 如果已实现创意完善工作坊，验证frontendDesign数据可正常保存和读取
- [ ] 如果未实现创意完善工作坊，记录此依赖项（MVP工作坊需要创意完善工作坊的数据）

**注意**: MVP工作坊依赖创意完善工作坊提供前端设计数据。如果创意完善工作坊未实现，需要：
1. 先实现创意完善工作坊（参考`docs/创意完善工作坊实施清单.md`）
2. 或者在MVP工作坊中增加手动输入前端需求的表单（作为临时方案）

**预计时间**: 30分钟

---

### 1.3 创建TypeScript类型定义
**文件**: `src/types/mvp-visualization.ts`
**操作**: 创建新文件

```typescript
export interface FrontendDesign {
  pageStructure: string
  coreInteractions: string[]
  visualStyle: {
    colorScheme: string
    typography: string
    layout: string
  }
  targetDevices: string[]
  referenceExamples?: string
}

export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
  suggestions?: Suggestion[]
  timestamp: Date
}

export interface Suggestion {
  id: string
  content: string
  applied: boolean
}

export interface CodeGenerationResult {
  html: string
  css: string
  suggestions: Suggestion[]
  cost: number
  tokens: number
}

export interface MVPSessionConfig {
  userId: string
  source: 'standalone' | 'from-bidding'
  refinementDocumentId?: string
}
```

**任务清单**:
- [ ] 创建 `src/types/mvp-visualization.ts` 文件
- [ ] 定义所有必需的TypeScript接口
- [ ] 导出所有类型供其他模块使用

**预计时间**: 20分钟

---

## Phase 2: 核心业务逻辑和Context (1.5-2小时)

### 2.1 创建AI代码生成引擎
**文件**: `src/lib/mvp-visualization/ai-code-generator.ts`
**操作**: 创建新文件

**任务清单**:
- [ ] 创建AICodeGenerator类
- [ ] 实现generateCode主方法
- [ ] 实现buildPrompt方法（根据轮次构建不同Prompt）
- [ ] 实现callDeepSeek方法（优先调用DeepSeek）
- [ ] 实现callDashScope方法（备用AI服务）
- [ ] 实现parseAIResponse方法（解析AI返回的HTML/CSS/建议）
- [ ] 实现validateCode方法（检查代码安全性和体积）
- [ ] 导出aiCodeGenerator单例

**预计时间**: 45分钟

---

### 2.2 创建代码验证器
**文件**: `src/lib/mvp-visualization/code-validator.ts`
**操作**: 创建新文件

```typescript
export const CODE_LIMITS = {
  maxHTMLSize: 500 * 1024,      // HTML最大500KB
  maxCSSSize: 200 * 1024,       // CSS最大200KB
  maxTotalSize: 700 * 1024,     // 总计最大700KB
  maxDOMNodes: 1000,            // 最大DOM节点数
  allowedTags: [
    'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'a', 'button', 'input', 'textarea',
    'img', 'form', 'label', 'header', 'footer', 'nav', 'main',
    'section', 'article', 'aside'
  ]
}

export class CodeValidator {
  checkSecurityIssues(html: string): void {
    // 检查是否包含<script>标签
    if (/<script/i.test(html)) {
      throw new Error('HTML代码不允许包含<script>标签')
    }

    // 检查是否包含on*事件处理器
    if (/on\w+\s*=/i.test(html)) {
      throw new Error('HTML代码不允许包含内联事件处理器')
    }

    // 检查是否包含外部资源加载
    if (/<link\s+[^>]*href\s*=\s*["']https?:\/\//i.test(html)) {
      throw new Error('HTML代码不允许加载外部样式表')
    }
  }

  checkDOMComplexity(html: string): void {
    const tagMatches = html.match(/<[^\/][^>]*>/g)
    const nodeCount = tagMatches ? tagMatches.length : 0

    if (nodeCount > CODE_LIMITS.maxDOMNodes) {
      throw new Error(`DOM节点数过多（${nodeCount} > ${CODE_LIMITS.maxDOMNodes}）`)
    }
  }
}
```

**任务清单**:
- [ ] 创建CodeValidator类
- [ ] 实现checkSecurityIssues方法
- [ ] 实现checkDOMComplexity方法
- [ ] 定义CODE_LIMITS常量
- [ ] 导出验证器

**预计时间**: 20分钟

---

### 2.3 创建Prompt模板
**文件**: `src/lib/mvp-visualization/prompt-templates.ts`
**操作**: 创建新文件

**任务清单**:
- [ ] 定义系统角色Prompt
- [ ] 定义第1轮对话Prompt（初步确认）
- [ ] 定义第2轮对话Prompt（布局调整）
- [ ] 定义第3轮对话Prompt（功能细化）
- [ ] 定义第4轮对话Prompt（视觉优化）
- [ ] 定义第5轮对话Prompt（最终确认）
- [ ] 定义代码生成约束条件
- [ ] 定义输出格式规范

**预计时间**: 30分钟

---

### 2.4 创建Context状态管理
**文件**: `src/contexts/MVPVisualizationContext.tsx`
**操作**: 创建新文件（使用第5轮提供的完整代码）

**任务清单**:
- [ ] 创建Context和Provider
- [ ] 实现所有状态定义
- [ ] 实现initializeSession方法
- [ ] 实现sendMessage方法（包含不满意检测）
- [ ] 实现applySuggestion方法
- [ ] 实现refreshPreview方法
- [ ] 实现saveDraft方法
- [ ] 实现generateOutput方法
- [ ] 实现resetSession方法
- [ ] 实现restartFromBeginning方法
- [ ] 添加自动保存逻辑（每30秒）
- [ ] 创建useMVPVisualization Hook

**预计时间**: 45分钟

---

## Phase 3: UI组件开发 (2-3小时)

### 3.1 重构主页面路由
**文件**: `src/app/business-plan/mvp-generator/page.tsx`
**操作**: 重构现有页面

**任务清单**:
- [ ] 保留现有页面结构（复用路由）
- [ ] 删除或注释旧的MVPBuilderConversational组件
- [ ] 添加MVPVisualizationProvider包裹
- [ ] 导入新的MVPVisualizationWorkshop组件
- [ ] 设置页面元数据
- [ ] 添加懒加载和骨架屏（可选）

**预计时间**: 30分钟

---

### 3.2 创建主容器组件
**文件**: `src/components/workshop/mvp/MVPVisualizationWorkshop.tsx`
**操作**: 创建新文件（使用第5轮提供的代码）

**任务清单**:
- [ ] 实现双栏布局（40%左 + 60%右）
- [ ] 添加会话初始化逻辑
- [ ] 添加加载状态组件
- [ ] 添加错误提示横幅
- [ ] 集成左侧对话面板
- [ ] 集成右侧预览面板
- [ ] 集成底部操作栏
- [ ] 添加响应式设计

**预计时间**: 30分钟

---

### 3.3 创建左侧对话面板
**文件**: `src/components/workshop/mvp/LeftPanel/ConversationPanel.tsx`
**操作**: 创建新文件（使用第5轮提供的代码）

**任务清单**:
- [ ] 实现消息列表容器
- [ ] 添加自动滚动到最新消息
- [ ] 创建用户输入框
- [ ] 添加发送按钮和状态显示
- [ ] 集成建议卡片组件
- [ ] 添加"重新开始"按钮
- [ ] 显示对话轮次和剩余次数
- [ ] 支持Enter发送、Shift+Enter换行

**预计时间**: 40分钟

---

### 3.4 创建消息气泡组件
**文件**: `src/components/workshop/mvp/LeftPanel/MessageBubble.tsx`
**操作**: 创建新文件

```typescript
'use client'

import React from 'react'
import { ConversationMessage } from '@/types/mvp-visualization'
import { Bot, User } from 'lucide-react'

interface MessageBubbleProps {
  message: ConversationMessage
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-blue-500' : 'bg-purple-500'
      }`}>
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>

      <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block max-w-[85%] rounded-lg p-3 ${
          isUser
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  )
}
```

**任务清单**:
- [ ] 创建MessageBubble组件
- [ ] 区分用户和AI消息样式
- [ ] 添加头像图标
- [ ] 显示时间戳
- [ ] 支持多行文本

**预计时间**: 15分钟

---

### 3.5 创建建议卡片组件
**文件**: `src/components/workshop/mvp/LeftPanel/SuggestionCards.tsx`
**操作**: 创建新文件（使用第5轮提供的代码）

**任务清单**:
- [ ] 实现建议列表展示
- [ ] 添加"应用"按钮
- [ ] 显示已应用状态
- [ ] 添加视觉反馈（颜色、图标）

**预计时间**: 20分钟

---

### 3.6 创建右侧预览面板
**文件**: `src/components/workshop/mvp/RightPanel/LivePreviewFrame.tsx`
**操作**: 创建新文件（使用第5轮提供的代码）

**任务清单**:
- [ ] 实现iframe沙箱渲染
- [ ] 合并HTML和CSS代码
- [ ] 添加设备模拟器（桌面/平板/移动）
- [ ] 添加刷新按钮
- [ ] 显示生成中的加载动画
- [ ] 显示空状态提示
- [ ] 添加错误降级UI

**预计时间**: 40分钟

---

### 3.7 创建底部操作栏
**文件**: `src/components/workshop/mvp/BottomActions/RoundProgress.tsx`
**操作**: 创建新文件（使用第5轮提供的代码）

**任务清单**:
- [ ] 实现进度条显示
- [ ] 添加"保存草稿"按钮
- [ ] 添加"取消退出"按钮
- [ ] 添加"生成最终文件"按钮
- [ ] 实现文件下载逻辑（HTML + Markdown）
- [ ] 添加加载状态和禁用逻辑

**预计时间**: 30分钟

---

## Phase 4: API路由实现 (1.5-2小时)

### 4.1 启动会话API
**文件**: `src/app/api/workshop/mvp/start/route.ts`
**方法**: POST
**操作**: 创建新文件

**任务清单**:
- [ ] 验证用户身份
- [ ] 检查并扣除积分（standalone模式）
- [ ] 从refinementDocument提取frontendDesign数据
- [ ] 创建MVPVisualizationSession记录
- [ ] 返回sessionId和前端需求数据

**预计时间**: 25分钟

---

### 4.2 生成代码API
**文件**: `src/app/api/workshop/mvp/generate-code/route.ts`
**方法**: POST
**操作**: 创建新文件

**任务清单**:
- [ ] 验证会话有效性
- [ ] 检查对话轮次限制（最多5次）
- [ ] 调用AICodeGenerator生成代码
- [ ] 更新会话记录（代码、对话历史、轮次）
- [ ] 返回生成的HTML、CSS和建议

**预计时间**: 30分钟

---

### 4.3 保存草稿API
**文件**: `src/app/api/workshop/mvp/save-draft/route.ts`
**方法**: POST
**操作**: 创建新文件

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: '缺少sessionId' }, { status: 400 })
    }

    // 查询会话
    const session = await prisma.mVPVisualizationSession.findUnique({
      where: { id: sessionId }
    })

    if (!session) {
      return NextResponse.json({ error: '会话不存在' }, { status: 404 })
    }

    // 更新updatedAt字段（触发自动保存）
    await prisma.mVPVisualizationSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('保存草稿失败:', error)
    return NextResponse.json(
      { error: '保存失败' },
      { status: 500 }
    )
  }
}
```

**任务清单**:
- [ ] 验证sessionId
- [ ] 查询会话记录
- [ ] 更新updatedAt时间戳
- [ ] 返回成功状态

**预计时间**: 15分钟

---

### 4.4 导出最终文件API
**文件**: `src/app/api/workshop/mvp/export/route.ts`
**方法**: POST
**操作**: 创建新文件

**任务清单**:
- [ ] 验证sessionId
- [ ] 查询会话和关联的refinementDocument
- [ ] 生成完整的HTML文件（包含DOCTYPE和meta标签）
- [ ] 更新创意计划书（整合前端内容）
- [ ] 标记会话为COMPLETED状态
- [ ] 保存finalHTMLFile和updatedPlanDocument
- [ ] 返回文件内容

**预计时间**: 35分钟

---

### 4.5 创建计划书更新逻辑
**文件**: `src/lib/mvp-visualization/plan-document-merger.ts`
**操作**: 创建新文件

```typescript
import { IdeaRefinementDocument } from '@prisma/client'

export async function updatePlanDocument(
  refinementDocument: IdeaRefinementDocument | null,
  generatedCode: { html: string; css: string }
): Promise<string> {
  if (!refinementDocument) {
    return generateStandalonePlanDocument(generatedCode)
  }

  const refinedDoc = refinementDocument.refinedDocument as any

  // 生成Markdown格式的计划书
  const markdown = `# ${refinementDocument.ideaTitle}

## 创意概述
${refinementDocument.ideaContent}

## 目标用户画像
${refinedDoc.targetUsers?.summary || '待完善'}

## 商业模式
${refinedDoc.businessModel?.summary || '待完善'}

## 市场分析
${refinedDoc.marketAnalysis?.summary || '待完善'}

## 竞争优势
${refinedDoc.competitiveAdvantage?.summary || '待完善'}

## 产品/服务详情
${refinedDoc.productDetails?.summary || '待完善'}

### 前端界面设计
以下是通过MVP工作坊生成的前端可视化设计：

**页面结构**: ${refinedDoc.productDetails?.frontendDesign?.pageStructure || '待完善'}

**核心交互**:
${refinedDoc.productDetails?.frontendDesign?.coreInteractions?.map((item: string) => `- ${item}`).join('\n') || '待完善'}

**视觉风格**:
- 色彩方案: ${refinedDoc.productDetails?.frontendDesign?.visualStyle?.colorScheme || '待完善'}
- 字体风格: ${refinedDoc.productDetails?.frontendDesign?.visualStyle?.typography || '待完善'}
- 布局方式: ${refinedDoc.productDetails?.frontendDesign?.visualStyle?.layout || '待完善'}

**目标设备**: ${refinedDoc.productDetails?.frontendDesign?.targetDevices?.join('、') || '待完善'}

**技术实现**:
- 已生成HTML代码: ${generatedCode.html.length} 字符
- 已生成CSS代码: ${generatedCode.css.length} 字符
- 可直接在浏览器中打开查看效果

## 实施路径
${refinedDoc.implementationPath?.summary || '待完善'}

---

*本文档由AI加速器平台自动生成*
*创建时间: ${new Date().toLocaleString('zh-CN')}*
`

  return markdown
}

function generateStandalonePlanDocument(
  generatedCode: { html: string; css: string }
): string {
  return `# MVP前端可视化设计方案

## 设计概述
本文档展示了通过MVP工作坊生成的前端可视化设计。

## 技术实现
- HTML代码: ${generatedCode.html.length} 字符
- CSS代码: ${generatedCode.css.length} 字符

## 使用方式
1. 下载生成的HTML文件
2. 用浏览器打开即可查看效果
3. 可根据实际需求进一步调整代码

---

*本文档由AI加速器平台自动生成*
*创建时间: ${new Date().toLocaleString('zh-CN')}*
`
}
```

**任务清单**:
- [ ] 实现updatePlanDocument函数
- [ ] 读取refinementDocument数据
- [ ] 整合前端设计内容
- [ ] 生成Markdown格式文档
- [ ] 处理数据缺失情况

**预计时间**: 25分钟

---

## Phase 5: AI集成和Prompt工程 (1-1.5小时)

### 5.1 完善Prompt模板
**文件**: `src/lib/mvp-visualization/prompt-templates.ts`
**操作**: 完善详细的Prompt内容

**示例Prompt结构**:
```typescript
export const PROMPT_TEMPLATES = {
  systemRole: `你是MVP前端可视化助手，擅长将用户的产品创意转化为可视化的HTML+CSS界面。

你的任务：
1. 理解用户的前端设计需求
2. 生成简洁、美观、易用的HTML+CSS代码
3. 给出3-5条具体的优化建议
4. 使用简单易懂的语言，避免专业术语

代码生成约束：
- 不使用<script>标签和JavaScript
- 不加载外部资源（图片使用占位符）
- HTML代码不超过500KB
- CSS代码不超过200KB
- DOM节点数不超过1000个
- 只使用语义化HTML5标签

输出格式：
\`\`\`html
<div>...</div>
\`\`\`

\`\`\`css
.container { ... }
\`\`\`

建议：
1. [具体建议内容]
2. [具体建议内容]
3. [具体建议内容]`,

  round1: `现在是第1轮对话（初步确认）。

用户的前端设计需求：
{frontendRequirements}

任务：
1. 用简单的语言复述你理解的界面设计
2. 生成初步的HTML+CSS代码
3. 询问用户是否符合预期
4. 给出3-5条改进建议

语言要求：
- 亲和、易懂，像朋友聊天
- 避免"响应式布局"、"语义化标签"等专业术语
- 用类比方式解释（如"像淘宝首页那样"）

回复示例：
"我理解您想要一个简洁的页面，顶部有导航栏，中间展示主要内容，底部有联系方式。我已经为您生成了初步设计，您可以在右侧预览效果。

建议：
1. 建议将主按钮改为蓝色，更吸引眼球
2. 建议增加一些间距，让页面看起来更舒服
3. 建议添加一个简单的卡片效果，让内容更有层次"`,

  round2: `现在是第2轮对话（布局调整）。

用户反馈：
{userFeedback}

当前代码：
{previousCode}

任务：
1. 总结你做了哪些调整（用通俗语言）
2. 根据反馈调整页面布局
3. 生成更新后的HTML+CSS代码
4. 给出3条针对性建议

注意：
- 如果用户说不清楚需求，主动提供选择题
- 每个调整都要说明原因
- 建议要具体，如"把按钮移到右上角"而非"优化布局"`,

  round3: `现在是第3轮对话（功能细化）。

用户反馈：
{userFeedback}

当前代码：
{previousCode}

任务：
1. 细化核心功能区域（按钮、表单、卡片等）
2. 确保用户能一眼看懂如何操作
3. 生成优化后的HTML+CSS代码
4. 给出3条易用性建议

重点关注：
- 按钮是否醒目
- 表单是否清晰
- 信息是否分层
- 操作流程是否顺畅`,

  round4: `现在是第4轮对话（视觉优化）。

用户反馈：
{userFeedback}

当前代码：
{previousCode}

任务：
1. 优化视觉细节（颜色、字体、间距、阴影）
2. 让界面看起来更专业
3. 生成精致化后的HTML+CSS代码
4. 给出3条视觉优化建议

注意：
- 解释每个调整的目的
- 避免过度设计
- 保持简洁风格`,

  round5: `现在是第5轮对话（最终确认）。

用户反馈：
{userFeedback}

当前代码：
{previousCode}

任务：
1. 根据最后的反馈进行微调
2. 生成最终版本的HTML+CSS代码
3. 总结实现了哪些功能和设计
4. 询问用户是否满意

回复示例：
"我已根据您的反馈做了最后的调整。这个界面实现了：
- 清晰的页面布局
- 醒目的操作按钮
- 舒适的视觉效果

您对这个设计满意吗？如果满意，可以点击'生成最终文件'下载HTML文件和创意计划书。如果还有小调整，请告诉我。"`
}
```

**任务清单**:
- [ ] 完善systemRole Prompt
- [ ] 完善5轮对话的Prompt模板
- [ ] 添加代码生成约束说明
- [ ] 添加输出格式规范
- [ ] 添加语言风格指导
- [ ] 添加示例回复

**预计时间**: 40分钟

---

### 5.2 完善AI代码生成引擎
**文件**: `src/lib/mvp-visualization/ai-code-generator.ts`
**操作**: 完善AI调用逻辑

**任务清单**:
- [ ] 导入AIServiceManager
- [ ] 实现完整的generateCode方法
- [ ] 实现Prompt构建逻辑（替换占位符）
- [ ] 实现DeepSeek调用（优先）
- [ ] 实现DashScope调用（备用）
- [ ] 实现AI响应解析（提取HTML/CSS/建议）
- [ ] 实现代码验证调用
- [ ] 添加错误处理和重试机制
- [ ] 添加成本统计

**预计时间**: 40分钟

---

## Phase 6: 测试和优化 (1-1.5小时)

### 6.1 功能测试
**任务清单**:
- [ ] 测试从创意完善工作坊进入MVP工作坊（带refinementId）
- [ ] 测试单独进入MVP工作坊（无refinementId，需扣10积分）
- [ ] 测试5轮对话流程
- [ ] 测试应用AI建议功能
- [ ] 测试"重新开始"功能（不消耗对话次数）
- [ ] 测试用户连续3次不满意的引导机制
- [ ] 测试设备模拟器切换（桌面/平板/移动）
- [ ] 测试保存草稿功能
- [ ] 测试导出HTML和Markdown文件
- [ ] 测试会话状态持久化

**预计时间**: 40分钟

---

### 6.2 AI质量测试
**任务清单**:
- [ ] 测试AI生成的HTML代码质量
- [ ] 测试AI生成的CSS代码质量
- [ ] 测试AI建议的实用性
- [ ] 测试AI对用户反馈的理解能力
- [ ] 测试DeepSeek失败后切换到DashScope
- [ ] 调整Prompt优化AI回复质量

**预计时间**: 25分钟

---

### 6.3 性能和安全测试
**任务清单**:
- [ ] 测试iframe渲染性能（检查内存占用）
- [ ] 测试代码体积限制（HTML 500KB，CSS 200KB）
- [ ] 测试代码安全性验证（<script>标签、on*事件）
- [ ] 测试大量DOM节点的渲染（限制1000个节点）
- [ ] 优化组件渲染次数（React DevTools）
- [ ] 检查内存泄漏

**预计时间**: 25分钟

---

## 📦 依赖检查

确保以下依赖已安装：

```json
{
  "dependencies": {
    "@prisma/client": "^5.x",
    "prisma": "^5.x",
    "lucide-react": "^0.x",
    "react": "^18.x",
    "next": "^14.x"
  }
}
```

**无需安装新依赖**，使用现有技术栈。

---

## 🚀 部署前检查清单

### 数据库
- [ ] Prisma迁移已应用到生产数据库
- [ ] MVPVisualizationSession表正确创建
- [ ] 数据库索引正确设置
- [ ] 测试数据已清理

### 环境变量
- [ ] DATABASE_URL 已设置
- [ ] DEEPSEEK_API_KEY 已设置
- [ ] DASHSCOPE_API_KEY 已设置（可选，作为备用）
- [ ] 其他必需的环境变量已设置

### 代码质量
- [ ] 没有TypeScript错误
- [ ] 没有ESLint警告
- [ ] 所有console.log已移除或改为debug
- [ ] 敏感信息已移除

### 功能验证
- [ ] 生产环境完整流程测试通过
- [ ] AI代码生成正常工作
- [ ] 数据持久化正常
- [ ] 文件导出功能正常
- [ ] 积分扣除逻辑正确

---

## 📝 开发注意事项

### 代码规范
1. 所有组件使用TypeScript
2. 遵循项目现有的代码风格
3. 添加必要的注释
4. 使用有意义的变量名

### Git提交
1. 每完成一个Phase提交一次
2. 提交信息遵循约定格式
3. 大功能分多次小提交

### 测试策略
1. 边开发边测试（不等到最后）
2. 优先测试核心流程
3. 记录发现的bug

### 性能考虑
1. 避免不必要的重渲染
2. 合理使用useMemo和useCallback
3. iframe代码体积控制在700KB以内

---

## 🎯 里程碑

### Milestone 1: 基础架构完成 (Day 1上午)
- ✅ 数据库Schema
- ✅ TypeScript类型
- ✅ 核心业务逻辑
- ✅ Context状态管理

### Milestone 2: UI组件完成 (Day 1下午)
- ✅ 所有UI组件
- ✅ 双栏布局
- ✅ iframe预览

### Milestone 3: API和AI集成 (Day 2上午)
- ✅ 所有API路由
- ✅ AI代码生成引擎
- ✅ Prompt工程

### Milestone 4: 测试和上线 (Day 2下午)
- ✅ 功能测试
- ✅ 性能优化
- ✅ 部署上线

---

## 🆘 遇到问题时的检查顺序

1. **UI不更新**: 检查Context状态更新、React DevTools
2. **API报错**: 检查网络请求、服务器日志、Prisma查询
3. **AI回复异常**: 检查Prompt模板、API响应、Token限制
4. **iframe不显示**: 检查HTML/CSS代码、srcDoc格式、沙箱配置
5. **积分扣除异常**: 检查source参数、数据库事务、用户余额
6. **性能问题**: 检查iframe代码体积、DOM节点数、渲染次数

---

## 📚 相关文档链接

- [创意完善工作坊实施清单](./创意完善工作坊实施清单.md)
- [Prisma文档](https://www.prisma.io/docs)
- [Next.js文档](https://nextjs.org/docs)
- [DeepSeek API文档](https://platform.deepseek.com/docs)

---

## ⚠️ 重要依赖关系

MVP工作坊依赖创意完善工作坊的数据：

1. **必需数据**: `refinedDocument.productDetails.frontendDesign`
2. **数据来源**: 创意完善工作坊的第4维度（产品/服务详情）
3. **解决方案**:
   - 方案A: 先完成创意完善工作坊（推荐）
   - 方案B: 在MVP工作坊中增加手动输入表单（临时方案）

如果选择方案B，需要增加以下组件：
- `src/components/workshop/mvp/DataExtraction/ManualInputForm.tsx`

---

**最后更新**: 2025-10-25
**维护者**: Claude Code
**预计总开发时间**: 8-12小时
**优先级**: 高
