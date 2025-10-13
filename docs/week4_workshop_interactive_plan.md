# Week 4 工作计划 - 工作坊交互功能

## 📅 项目信息
- **计划日期**: 2025-01-15
- **版本**: v1.0
- **预计时长**: 5-7天
- **优先级**: 高
- **状态**: 📋 规划中

---

## 🎯 目标概述

在Week 2-3完成的工作坊静态页面基础上，实现完整的交互功能，让用户能够：

1. 与6个AI专家Agent进行互动对话
2. 填写结构化表单并获得实时反馈
3. 跟踪工作坊完成进度
4. 生成专业的PDF学习报告
5. 完善音效和动画体验

---

## 📋 任务清单

### Phase 1: 架构设计 (1天)

#### Task 1.1: 规划工作坊交互架构 ✅ (当前任务)
**时间**: 2小时

**设计内容**:
- 工作坊状态机设计
- AI Agent系统架构
- 表单验证流程
- 进度追踪机制
- 数据持久化方案

**输出文档**:
- 架构设计文档
- 状态流转图
- 数据库Schema更新

#### Task 1.2: 设计AI Agent系统
**时间**: 3小时

**Agent配置**:
- 6个专业领域Agent（从竞价系统复用）
- 对话历史管理
- 上下文理解能力
- 个性化回复生成

**技术栈**:
- OpenAI GPT-4 API
- 对话上下文管理
- Streaming响应

---

### Phase 2: 工作坊表单系统 (2天)

#### Task 2.1: 创建表单组件库
**时间**: 4小时

**组件列表**:
```typescript
// 基础表单组件
- WorkshopInput      // 输入框
- WorkshopTextarea   // 多行文本
- WorkshopSelect     // 下拉选择
- WorkshopRadio      // 单选按钮
- WorkshopCheckbox   // 复选框
- WorkshopSlider     // 滑块（用于评分）
- WorkshopDatePicker // 日期选择
- WorkshopFileUpload // 文件上传

// 复合组件
- CustomerPersonaForm    // 客户画像表单
- ValuePropositionForm   // 价值主张表单
- MVPFeatureForm        // MVP功能表单
- BusinessModelCanvas   // 商业模式画布
```

**表单验证**:
- React Hook Form
- Zod schema验证
- 实时错误提示
- 字段间依赖验证

#### Task 2.2: 实现工作坊具体表单
**时间**: 6小时

**需求验证实验室表单**:
```typescript
interface DemandValidationForm {
  // 第1步：目标客户定义
  targetCustomer: {
    segment: string          // 客户细分
    painPoints: string[]     // 痛点列表
    currentSolution: string  // 当前解决方案
    switchingCost: number    // 切换成本（1-10）
  }

  // 第2步：需求场景描述
  demandScenario: {
    context: string          // 使用场景
    frequency: string        // 使用频率
    urgency: number          // 紧迫性（1-10）
    willingnessToPay: number // 付费意愿（1-10）
  }

  // 第3步：价值验证
  valueProposition: {
    coreValue: string        // 核心价值
    differentiation: string  // 差异化优势
    measurementMetric: string // 衡量指标
  }

  // 第4步：验证计划
  validationPlan: {
    method: string[]         // 验证方法（访谈、问卷、MVP等）
    targetSampleSize: number // 目标样本量
    successCriteria: string  // 成功标准
    timeline: string         // 时间计划
  }
}
```

**MVP构建工作坊表单**:
```typescript
interface MVPBuilderForm {
  // 第1步：核心功能定义
  coreFeatures: {
    mustHave: string[]       // 必须有的功能
    shouldHave: string[]     // 应该有的功能
    couldHave: string[]      // 可以有的功能
    wontHave: string[]       // 不会有的功能（MoSCoW方法）
  }

  // 第2步：用户故事
  userStories: Array<{
    role: string             // 作为...（用户角色）
    goal: string             // 我想要...（目标）
    benefit: string          // 以便...（收益）
    priority: 'high' | 'medium' | 'low'
    estimatedEffort: number  // 工作量估算（1-10）
  }>

  // 第3步：技术方案
  technicalPlan: {
    architecture: string     // 技术架构
    techStack: string[]      // 技术栈
    infrastructure: string   // 基础设施
    thirdPartyServices: string[] // 第三方服务
  }

  // 第4步：原型设计
  prototype: {
    wireframeUrl: string     // 线框图链接
    designPrinciples: string[] // 设计原则
    keyInteractions: string[] // 关键交互
  }
}
```

**增长黑客训练营表单**:
```typescript
interface GrowthHackingForm {
  // 第1步：增长目标
  growthGoals: {
    northStarMetric: string  // 北极星指标
    targetGrowthRate: number // 目标增长率
    timeframe: string        // 时间框架
  }

  // 第2步：AARRR漏斗分析
  aarrr: {
    acquisition: {           // 获取
      channels: string[]
      conversionRate: number
    }
    activation: {            // 激活
      activationTrigger: string
      timeToValue: number
    }
    retention: {             // 留存
      retentionRate: number
      churnReasons: string[]
    }
    revenue: {               // 收入
      monetizationModel: string
      ltv: number
    }
    referral: {              // 推荐
      viralCoefficient: number
      incentiveStructure: string
    }
  }

  // 第3步：实验设计
  experiments: Array<{
    hypothesis: string       // 假设
    testMethod: string       // 测试方法
    successMetric: string    // 成功指标
    duration: number         // 实验时长
  }>
}
```

**商业模式设计表单**:
```typescript
interface ProfitModelForm {
  // 第1步：商业模式画布
  businessModelCanvas: {
    customerSegments: string[]      // 客户细分
    valuePropositions: string[]     // 价值主张
    channels: string[]              // 渠道通路
    customerRelationships: string[] // 客户关系
    revenueStreams: string[]        // 收入来源
    keyResources: string[]          // 核心资源
    keyActivities: string[]         // 关键业务
    keyPartnerships: string[]       // 重要合作
    costStructure: string[]         // 成本结构
  }

  // 第2步：财务模型
  financialModel: {
    pricingStrategy: string  // 定价策略
    unitEconomics: {         // 单位经济
      cac: number            // 客户获取成本
      ltv: number            // 客户生命周期价值
      ltvCacRatio: number    // LTV/CAC比率
    }
    revenueProjection: {     // 收入预测
      year1: number
      year2: number
      year3: number
    }
  }

  // 第3步：盈利路径
  profitability: {
    breakEvenPoint: number   // 盈亏平衡点
    scalingPlan: string      // 规模化计划
    riskFactors: string[]    // 风险因素
  }
}
```

---

### Phase 3: AI Agent交互系统 (2天)

#### Task 3.1: 创建Agent对话组件
**时间**: 4小时

**组件结构**:
```typescript
// src/components/workshop/AgentConversation.tsx
interface AgentConversationProps {
  workshopId: string
  agentId: string
  sessionId: string
  userInput: string
  onAgentReply: (reply: string) => void
}

// Agent消息类型
interface AgentMessage {
  id: string
  agentId: string
  content: string
  timestamp: Date
  type: 'question' | 'feedback' | 'suggestion' | 'validation'
  relatedFormField?: string  // 关联的表单字段
}
```

**对话场景**:
1. **表单验证反馈**: Agent分析用户填写的内容，给出改进建议
2. **启发式提问**: Agent提出问题帮助用户深入思考
3. **案例分享**: Agent分享相关成功/失败案例
4. **知识补充**: Agent提供相关理论知识

#### Task 3.2: 实现Agent智能回复系统
**时间**: 6小时

**API设计**:
```typescript
// POST /api/workshop/agent-chat
interface AgentChatRequest {
  workshopId: string
  agentId: string
  sessionId: string
  userMessage: string
  formContext: Record<string, any>  // 当前表单数据
  conversationHistory: AgentMessage[]
}

interface AgentChatResponse {
  success: boolean
  data: {
    message: string
    suggestions?: string[]
    relatedResources?: Array<{
      title: string
      url: string
      type: 'article' | 'video' | 'tool'
    }>
    nextAction?: {
      type: 'fill_field' | 'review_section' | 'proceed'
      target?: string
    }
  }
}
```

**Prompt Engineering**:
```typescript
const workshopAgentPrompts = {
  'demand-validation': {
    'alex': `你是Alex Chen，产品战略专家。专注于帮助用户进行需求验证...`,
    'sophia': `你是Sophia Rodriguez，用户研究专家。擅长识别真实需求...`,
    // ... 其他agent
  },
  'mvp-builder': {
    // ... MVP工作坊的agent prompts
  }
}
```

**上下文管理**:
- 保留最近10轮对话历史
- 表单数据作为上下文
- Agent个性保持一致性

---

### Phase 4: 进度跟踪系统 (1天)

#### Task 4.1: 创建工作坊会话数据库
**时间**: 2小时

**Prisma Schema**:
```prisma
model WorkshopSession {
  id                String   @id @default(cuid())
  workshopId        String
  userId            String
  assessmentId      String?  @map("assessment_id")

  // 进度追踪
  currentStep       Int      @default(1)
  totalSteps        Int
  completedSteps    Int[]
  progressPercentage Float   @default(0)

  // 表单数据
  formData          Json     @default("{}")

  // Agent对话历史
  conversationHistory Json   @default("[]")

  // 状态
  status            WorkshopStatus @default(IN_PROGRESS)
  startedAt         DateTime @default(now())
  completedAt       DateTime?
  lastActivityAt    DateTime @updatedAt

  // 成果输出
  pdfReportUrl      String?  @map("pdf_report_url")

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([userId])
  @@index([workshopId])
  @@index([assessmentId])
  @@map("workshop_sessions")
}

enum WorkshopStatus {
  IN_PROGRESS
  COMPLETED
  ABANDONED
}
```

**API端点**:
```typescript
// POST /api/workshop/session/create
// GET /api/workshop/session/:id
// PATCH /api/workshop/session/:id/progress
// POST /api/workshop/session/:id/complete
```

#### Task 4.2: 实现进度条和检查点
**时间**: 3小时

**进度组件**:
```typescript
// src/components/workshop/ProgressTracker.tsx
interface ProgressTrackerProps {
  workshopId: string
  totalSteps: number
  currentStep: number
  completedSteps: number[]
  onStepClick: (step: number) => void
}

// 步骤类型
interface WorkshopStep {
  id: number
  title: string
  description: string
  estimatedTime: number  // 分钟
  requiredFields: string[]
  isOptional: boolean
  completionCriteria: (formData: any) => boolean
}
```

**检查点验证**:
- 每个步骤完成前验证必填字段
- Agent审核关键内容
- 用户确认后才能进入下一步

---

### Phase 5: PDF报告生成 (1天)

#### Task 5.1: 设计PDF报告模板
**时间**: 3小时

**报告结构**:
```
┌─────────────────────────────────┐
│ 工作坊学习报告                    │
│                                 │
│ 1. 封面页                        │
│    - 工作坊名称                   │
│    - 完成日期                     │
│    - 用户信息                     │
│    - 完成进度                     │
│                                 │
│ 2. 执行摘要                      │
│    - 关键发现                     │
│    - 核心成果                     │
│    - AI专家评价                   │
│                                 │
│ 3. 详细内容                      │
│    - 各步骤填写内容               │
│    - Agent反馈和建议              │
│    - 图表和可视化                 │
│                                 │
│ 4. 行动计划                      │
│    - 下一步建议                   │
│    - 推荐资源                     │
│    - 后续工作坊推荐               │
│                                 │
│ 5. 附录                         │
│    - 对话历史                     │
│    - 参考资料                     │
└─────────────────────────────────┘
```

**技术实现**:
- 使用 `@react-pdf/renderer`（已安装）
- 服务端渲染PDF
- 存储到云存储（Ali OSS）

#### Task 5.2: 实现PDF生成API
**时间**: 4小时

**API设计**:
```typescript
// POST /api/workshop/report/generate
interface GenerateReportRequest {
  sessionId: string
  workshopId: string
  includeConversations: boolean
  includeCharts: boolean
}

interface GenerateReportResponse {
  success: boolean
  data: {
    reportUrl: string
    fileName: string
    fileSize: number
    generatedAt: string
  }
}
```

**PDF组件示例**:
```typescript
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const WorkshopReport = ({ sessionData }: { sessionData: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* 封面 */}
      <View style={styles.coverSection}>
        <Text style={styles.title}>{sessionData.workshopTitle}</Text>
        <Text style={styles.date}>完成日期: {sessionData.completedAt}</Text>
      </View>

      {/* 执行摘要 */}
      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>执行摘要</Text>
        <Text>{sessionData.summary}</Text>
      </View>

      {/* ... 其他部分 ... */}
    </Page>
  </Document>
)
```

---

### Phase 6: 完善与优化 (1天)

#### Task 6.1: 添加音效文件
**时间**: 1小时

**音效列表**:
```bash
public/sounds/
├── assessment-complete.mp3  # 评估完成（已有文档）
├── score-increment.mp3      # 分数增加（已有文档）
├── workshop-unlock.mp3      # 工作坊解锁（已有文档）
├── dimension-appear.mp3     # 维度显示（已有文档）
├── badge-award.mp3          # 徽章授予（已有文档）
├── level-up.mp3             # 等级提升（已有文档）
├── step-complete.mp3        # 步骤完成（新增）
├── agent-reply.mp3          # Agent回复（新增）
├── form-submit.mp3          # 表单提交（新增）
└── report-generate.mp3      # 报告生成（新增）
```

**获取音效**:
- 使用免版权音效库（Freesound.org, Zapsplat.com）
- 或使用AI生成音效（ElevenLabs, Soundraw）
- 格式：MP3, 128kbps, mono
- 时长：0.5-2秒

#### Task 6.2: 运行完整E2E测试
**时间**: 2小时

**测试命令**:
```bash
# 运行所有浏览器的测试
npm run test:e2e

# 生成测试报告
npx playwright show-report

# 运行性能测试
npm run test:e2e -- --grep "性能测试"

# 运行特定工作坊测试
npm run test:e2e -- --grep "工作坊"
```

**测试覆盖目标**:
- ✅ 11个现有测试全部通过
- 新增工作坊交互测试（5个）
- 新增表单验证测试（3个）
- 新增PDF生成测试（2个）

#### Task 6.3: 创建Week 4完成总结
**时间**: 1小时

**文档内容**:
- 完成任务清单
- 代码统计
- 功能演示截图
- 测试结果报告
- 已知问题和后续优化

---

## 🗂️ 文件结构

```
src/
├── app/
│   └── workshop/
│       └── [id]/
│           ├── page.tsx                      # 工作坊主页面（已创建）
│           └── session/
│               └── [sessionId]/
│                   └── page.tsx              # 工作坊会话页面（新增）
│
├── components/
│   └── workshop/
│       ├── forms/                            # 表单组件（新增）
│       │   ├── WorkshopInput.tsx
│       │   ├── WorkshopTextarea.tsx
│       │   ├── WorkshopSelect.tsx
│       │   ├── CustomerPersonaForm.tsx
│       │   ├── ValuePropositionForm.tsx
│       │   ├── MVPFeatureForm.tsx
│       │   └── BusinessModelCanvas.tsx
│       │
│       ├── AgentConversation.tsx             # Agent对话组件（新增）
│       ├── ProgressTracker.tsx               # 进度追踪（新增）
│       └── WorkshopLayout.tsx                # 布局组件（新增）
│
├── lib/
│   └── workshop/
│       ├── agent-prompts.ts                  # Agent提示词（新增）
│       ├── form-schemas.ts                   # 表单验证Schema（新增）
│       ├── pdf-generator.ts                  # PDF生成器（新增）
│       └── progress-tracker.ts               # 进度管理（新增）
│
├── hooks/
│   ├── useWorkshopSession.ts                 # 会话管理Hook（新增）
│   ├── useWorkshopProgress.ts                # 进度追踪Hook（新增）
│   └── useAgentChat.ts                       # Agent聊天Hook（新增）
│
└── app/api/
    └── workshop/
        ├── session/
        │   ├── create/
        │   │   └── route.ts                  # 创建会话API（新增）
        │   ├── [id]/
        │   │   ├── route.ts                  # 获取会话API（新增）
        │   │   ├── progress/
        │   │   │   └── route.ts              # 更新进度API（新增）
        │   │   └── complete/
        │   │       └── route.ts              # 完成会话API（新增）
        │
        ├── agent-chat/
        │   └── route.ts                      # Agent聊天API（新增）
        │
        └── report/
            └── generate/
                └── route.ts                  # 生成报告API（新增）

prisma/
└── schema.prisma                             # 添加WorkshopSession模型

tests/
└── e2e/
    ├── workshop-interaction.spec.ts          # 工作坊交互测试（新增）
    ├── workshop-forms.spec.ts                # 表单测试（新增）
    └── workshop-report.spec.ts               # 报告测试（新增）

docs/
├── week4_workshop_interactive_plan.md        # Week 4计划（本文件）
├── week4_completion_summary.md               # Week 4总结（待创建）
└── workshop_user_guide.md                    # 用户指南（待创建）

public/
└── sounds/
    ├── step-complete.mp3                     # 新增音效
    ├── agent-reply.mp3                       # 新增音效
    ├── form-submit.mp3                       # 新增音效
    └── report-generate.mp3                   # 新增音效
```

---

## 📊 技术栈

### 前端
- **框架**: Next.js 14 (App Router)
- **UI**: React 18 + TypeScript
- **表单**: React Hook Form + Zod
- **动画**: Framer Motion
- **音效**: use-sound

### 后端
- **API**: Next.js API Routes
- **AI**: OpenAI GPT-4 API
- **数据库**: PostgreSQL + Prisma
- **存储**: Ali OSS
- **PDF**: @react-pdf/renderer

### 测试
- **E2E**: Playwright
- **单元测试**: Jest + React Testing Library

---

## 🎯 成功指标

### 功能完整性
- [ ] 4个工作坊均有完整表单
- [ ] 6个AI Agent能正常对话
- [ ] 进度追踪准确无误
- [ ] PDF报告生成成功
- [ ] 所有音效正常播放

### 性能指标
- [ ] Agent响应时间 < 3秒
- [ ] 表单验证实时响应 < 100ms
- [ ] PDF生成时间 < 5秒
- [ ] 页面加载时间 < 2秒

### 测试覆盖
- [ ] E2E测试通过率 100%
- [ ] 代码覆盖率 > 80%
- [ ] 无严重Bug
- [ ] 所有主流浏览器兼容

### 用户体验
- [ ] 表单填写流畅自然
- [ ] Agent回复有价值
- [ ] 进度可视化清晰
- [ ] PDF报告专业美观

---

## ⚠️ 风险与挑战

### 技术风险
1. **OpenAI API稳定性**
   - 风险：API可能限流或超时
   - 缓解：实现重试机制、降级方案

2. **PDF生成性能**
   - 风险：大型报告生成慢
   - 缓解：异步生成、进度提示

3. **表单状态管理**
   - 风险：复杂表单状态难以维护
   - 缓解：使用React Hook Form统一管理

### 产品风险
1. **Agent回复质量**
   - 风险：AI回复可能不够专业或偏离主题
   - 缓解：精心设计Prompt、人工审核样本

2. **用户完成率**
   - 风险：工作坊太长用户中途放弃
   - 缓解：保存进度、分段完成、激励机制

---

## 📚 参考资源

### 设计参考
- Typeform - 表单交互设计
- Notion - 进度追踪UI
- Miro - 画布式表单

### 技术文档
- React Hook Form: https://react-hook-form.com/
- Zod: https://zod.dev/
- @react-pdf/renderer: https://react-pdf.org/
- OpenAI API: https://platform.openai.com/docs/

### 理论基础
- The Mom Test（需求验证）
- Lean Startup（MVP构建）
- Growth Hacking（增长黑客）
- Business Model Canvas（商业模式）

---

## 🚀 下一步行动

### 立即开始
1. ✅ 创建本规划文档
2. 🔄 设计数据库Schema（WorkshopSession表）
3. 🔄 创建工作坊会话页面
4. 🔄 实现第一个表单组件

### 本周目标
- 完成Phase 1-2（架构设计 + 表单系统）
- 搭建基础的AI Agent对话框架
- 数据库迁移和API端点创建

### 下周目标
- 完成Phase 3-4（Agent系统 + 进度追踪）
- 实现PDF报告生成
- 完成E2E测试

---

**文档版本**: v1.0
**创建日期**: 2025-01-15
**预计完成**: 2025-01-22
**负责人**: Claude Code
**状态**: 📋 规划中

---

## 💡 备注

- 本计划基于Week 2-3已完成的工作坊静态页面
- 优先实现"需求验证实验室"作为完整示例
- 其他3个工作坊可以复用相同架构
- PDF生成可以考虑先做简单版本，后续迭代
- 音效文件可以先用占位符，不影响核心功能开发

**下一步**: 开始Task 1.2 - 设计数据库Schema 🚀
