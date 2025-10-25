# 创意完善工作坊 - frontendDesign维度补充方案

> **文档版本**: v1.1
> **创建日期**: 2025-10-25
> **目的**: 解决MVP工作坊与创意完善工作坊的数据衔接问题

---

## 🎯 问题分析

### 当前状况
- **创意完善工作坊**: 6个维度（目标用户、商业模式、市场分析、竞争优势、产品详情、实施路径）
- **MVP工作坊需求**: 需要`refinedDocument.productDetails.frontendDesign`数据
- **衔接断层**: productDetails维度未包含frontendDesign字段

### 影响范围
- MVP工作坊无法从创意完善工作坊获取前端设计数据
- 用户需要在MVP工作坊中手动重新输入前端需求
- 工作坊之间的数据流转不完整

---

## ✅ 解决方案1：在第5维度中嵌入frontendDesign（推荐）

### 修改IdeaRefinementDocument数据结构

```prisma
// prisma/schema.prisma - 无需修改Schema
// refinedDocument字段本身是Json类型,可以灵活扩展

// 扩展后的refinedDocument结构:
{
  "basicInfo": { ... },
  "targetUser": { ... },
  "businessModel": { ... },
  "marketAnalysis": { ... },
  "competitiveAdvantage": { ... },
  "productDetails": {
    "summary": "产品/服务总体描述",
    "coreFeatures": ["功能1", "功能2"],
    "technicalApproach": "技术路线",

    // 🆕 新增前端设计维度
    "frontendDesign": {
      "pageStructure": "页面结构描述（如：顶部导航栏 + 主内容区 + 底部信息）",
      "coreInteractions": [
        "登录注册交互",
        "搜索筛选功能",
        "表单提交流程"
      ],
      "visualStyle": {
        "colorScheme": "配色方案（如：蓝色科技风、绿色清新风）",
        "typography": "字体风格（如：现代简约、商务正式）",
        "layout": "布局方式（如：单栏、双栏、卡片式）"
      },
      "targetDevices": ["桌面端", "移动端"],
      "referenceExamples": "参考案例或网站（如：类似淘宝首页、参考Notion界面）"
    }
  },
  "implementation": { ... }
}
```

### AI对话策略调整

#### 第5维度：产品/服务详情（扩展为6轮对话）

**原有5轮**：核心功能 + 技术路线 + 实施计划
**新增第6轮**：前端UI设计

**第6轮Prompt模板**：
```typescript
export const PRODUCT_DETAILS_ROUND_6_PROMPT = `
你正在引导用户完善【产品/服务详情】维度的【前端UI设计】部分。

**目标**：收集前端界面设计需求，为后续MVP可视化工作坊提供输入数据。

**需要收集的信息**：
1. 页面结构 (Page Structure)
   - 主要有哪些页面？（首页、列表页、详情页等）
   - 每个页面的基本布局？（顶部导航、侧边栏、主内容区）

2. 核心交互 (Core Interactions)
   - 用户需要执行哪些操作？（登录、搜索、提交表单等）
   - 交互流程是什么？（点击按钮 → 弹窗确认 → 提交成功）

3. 视觉风格 (Visual Style)
   - 偏好什么配色？（科技蓝、商务灰、活力橙等）
   - 字体风格？（现代简约、传统正式）
   - 布局方式？（单栏、双栏、卡片式、网格式）

4. 目标设备 (Target Devices)
   - 主要在什么设备使用？（桌面、平板、手机）
   - 是否需要响应式设计？

5. 参考案例 (Reference Examples)
   - 有没有喜欢的网站或应用？
   - 哪些设计元素想要参考？

**引导策略**：
- 提问："您希望产品的前端界面是什么风格？有参考案例吗？"
- 追问："用户在界面上需要完成哪些核心操作？"
- 建议："基于您的描述，我建议采用[XX]布局，配色使用[XX]风格"
- 确认："我总结的前端设计需求是否准确？"
`
```

### 实施步骤

#### Step 1: 更新dimension-templates.ts
```typescript
// src/lib/idea-refinement/dimension-templates.ts

export const DIMENSIONS = [
  {
    id: 'targetUser',
    name: '目标用户画像',
    icon: '👥',
    rounds: 5,
    fields: ['userGroup', 'typicalPersona', 'corePainPoints', 'usageScenarios']
  },
  // ... 其他维度
  {
    id: 'productDetails',
    name: '产品/服务详情',
    icon: '📦',
    rounds: 6, // 🆕 从5轮扩展到6轮
    fields: [
      'summary',
      'coreFeatures',
      'technicalApproach',
      'timeline',
      'resources',
      'frontendDesign' // 🆕 新增字段
    ]
  },
  {
    id: 'implementation',
    name: '实施路径',
    icon: '🚀',
    rounds: 5,
    fields: ['milestones', 'risks', 'resources']
  }
]
```

#### Step 2: 更新AI对话引擎
```typescript
// src/lib/idea-refinement/prompts.ts

export const DIMENSION_PROMPTS = {
  // ... 其他维度

  productDetails: {
    name: '产品/服务详情',
    systemPrompt: `你是创意完善工作坊的AI教练，专门帮助用户细化产品功能和技术实现方案。`,
    round1: `分析产品核心功能，询问最核心的3-5个功能是什么`,
    round2: `追问每个功能的具体实现细节和用户价值`,
    round3: `询问技术路线选择（前端、后端、数据库等）`,
    round4: `询问开发时间表和里程碑规划`,
    round5: `询问所需资源（人力、资金、合作伙伴）`,

    // 🆕 新增第6轮：前端UI设计
    round6: `
引导用户描述产品的前端界面设计需求:

1. 页面结构：主要有哪些页面？每个页面的布局？
2. 核心交互：用户需要执行哪些操作？交互流程？
3. 视觉风格：配色、字体、布局方式的偏好？
4. 目标设备：桌面端还是移动端？响应式设计？
5. 参考案例：有喜欢的网站或应用吗？

示例问题:
- "您希望产品的界面是什么风格？简洁科技风还是丰富多彩型？"
- "用户在首页会看到什么内容？如何引导他们完成核心操作？"
- "有没有特别喜欢的网站设计？比如淘宝、Notion、飞书等？"

收集到信息后，总结为:
- pageStructure: "XX页面布局描述"
- coreInteractions: ["交互1", "交互2"]
- visualStyle: { colorScheme, typography, layout }
- targetDevices: ["桌面端", "移动端"]
- referenceExamples: "参考案例"
`
  }
}
```

#### Step 3: MVP工作坊读取逻辑
```typescript
// src/app/api/workshop/mvp/start/route.ts

export async function POST(request: NextRequest) {
  const { userId, refinementDocumentId, source } = await request.json()

  let frontendRequirements: FrontendDesign | null = null

  if (refinementDocumentId) {
    // 从创意完善文档中读取
    const refinementDoc = await prisma.ideaRefinementDocument.findUnique({
      where: { id: refinementDocumentId }
    })

    if (refinementDoc) {
      const refinedData = refinementDoc.refinedDocument as any

      // 🆕 读取frontendDesign字段
      if (refinedData.productDetails?.frontendDesign) {
        frontendRequirements = refinedData.productDetails.frontendDesign
        console.log('✅ 成功读取frontendDesign数据')
      } else {
        console.warn('⚠️ refinedDocument中缺少frontendDesign，将使用手动输入模式')
      }
    }
  }

  // 如果没有frontendDesign数据，返回null，触发手动输入表单
  return NextResponse.json({
    sessionId: newSession.id,
    frontendRequirements,
    needsManualInput: !frontendRequirements
  })
}
```

---

## ✅ 解决方案2：新增独立的第7维度（备选）

如果不想扩展现有维度，可以增加第7个独立维度。

### 新增维度配置

```typescript
export const DIMENSIONS = [
  // ... 前6个维度
  {
    id: 'frontendDesign',
    name: '前端UI设计',
    icon: '🎨',
    rounds: 5,
    fields: ['pageStructure', 'coreInteractions', 'visualStyle', 'targetDevices', 'referenceExamples'],
    description: '定义产品的前端界面设计需求，为MVP可视化工作坊提供输入'
  }
]
```

### 优缺点对比

| 方案 | 优点 | 缺点 |
|-----|------|------|
| **方案1**: 扩展第5维度 | ✅ 逻辑连贯（产品详情自然包含UI设计）<br>✅ 用户感知流畅<br>✅ 实施简单 | ❌ 第5维度对话轮次较多（6轮） |
| **方案2**: 新增第7维度 | ✅ 独立性强<br>✅ 便于跳过或单独完善 | ❌ 增加整体对话轮次<br>❌ 用户可能觉得太长 |

**推荐**: 方案1（扩展第5维度）

---

## 📊 用户流程优化

### 完整流程图

```
AI竞价 (50积分)
    ↓
创意成熟度评估 (6个维度评分)
    ↓
创意完善工作坊 (免费)
    ├─ 维度1: 目标用户 (5轮)
    ├─ 维度2: 商业模式 (5轮)
    ├─ 维度3: 市场分析 (5轮)
    ├─ 维度4: 竞争优势 (5轮)
    ├─ 维度5: 产品详情 (6轮) 🆕 包含frontendDesign
    └─ 维度6: 实施路径 (5轮)
    ↓
[点击"进入MVP工作坊"]
    ↓
MVP前端可视化工作坊 (免费)
    ├─ 读取refinedDocument.productDetails.frontendDesign ✅
    ├─ AI生成HTML+CSS代码 (5轮对话优化)
    └─ 导出HTML文件 + 更新创意计划书
```

### 数据传递示意图

```
┌──────────────────────────────────────┐
│ 创意完善工作坊                        │
│                                      │
│ refinedDocument.productDetails {     │
│   summary: "产品总体描述",           │
│   coreFeatures: ["功能1", "功能2"],  │
│                                      │
│   // 🆕 第6轮对话收集                │
│   frontendDesign: {                  │
│     pageStructure: "页面布局",       │
│     coreInteractions: ["交互1"],     │
│     visualStyle: { ... },            │
│     targetDevices: ["桌面端"],       │
│     referenceExamples: "参考案例"    │
│   }                                  │
│ }                                    │
└──────────────────────────────────────┘
              ↓ (数据传递)
┌──────────────────────────────────────┐
│ MVP工作坊                             │
│                                      │
│ MVPVisualizationSession {            │
│   refinementDocumentId: "xxx",       │
│   frontendRequirements: {            │
│     // 🎯 直接读取frontendDesign   │
│     pageStructure: "...",            │
│     coreInteractions: [...],         │
│     visualStyle: { ... }             │
│   }                                  │
│ }                                    │
└──────────────────────────────────────┘
```

---

## 🔄 向后兼容处理

### 已有用户的refinedDocument没有frontendDesign怎么办？

```typescript
// src/app/api/workshop/mvp/start/route.ts

if (refinedData.productDetails?.frontendDesign) {
  // 🟢 有frontendDesign，直接使用
  frontendRequirements = refinedData.productDetails.frontendDesign

} else if (refinedData.productDetails) {
  // 🟡 有productDetails但没有frontendDesign
  // 尝试从其他字段推断基本信息
  frontendRequirements = {
    pageStructure: refinedData.productDetails.summary || "待补充",
    coreInteractions: refinedData.productDetails.coreFeatures || [],
    visualStyle: {
      colorScheme: "现代科技风",
      typography: "简洁清晰",
      layout: "单栏布局"
    },
    targetDevices: ["桌面端"],
    referenceExamples: "无"
  }

  console.warn('⚠️ 旧版本数据，使用推断的frontendDesign')

} else {
  // 🔴 完全没有productDetails
  frontendRequirements = null
  console.warn('⚠️ 缺少产品详情数据，需要手动输入')
}
```

---

## 📝 实施清单

### Phase A: 数据结构扩展 (30分钟)

- [ ] 更新`dimension-templates.ts`，将productDetails的rounds从5改为6
- [ ] 更新`prompts.ts`，添加第6轮的Prompt模板
- [ ] 验证Json字段可以存储新增的frontendDesign数据

### Phase B: AI对话逻辑 (1小时)

- [ ] 实现第6轮对话的AI引导逻辑
- [ ] 添加frontendDesign数据提取和验证
- [ ] 测试完整的6轮对话流程

### Phase C: MVP工作坊集成 (30分钟)

- [ ] 更新MVP工作坊的start API读取逻辑
- [ ] 添加向后兼容处理（旧数据推断）
- [ ] 测试数据传递是否正确

### Phase D: 用户体验优化 (30分钟)

- [ ] 在创意完善工作坊UI中高亮显示新增的frontendDesign内容
- [ ] 在进入MVP工作坊前，显示"您已完成前端设计需求"的提示
- [ ] 添加"跳过前端设计"选项（直接手动输入）

**总预计时间**: 2.5小时

---

## ✅ 测试验证

### 测试用例1：完整流程
1. 用户完成AI竞价
2. 进入创意完善工作坊
3. 依次完成6个维度（第5维度包含6轮对话）
4. 点击"进入MVP工作坊"
5. ✅ 验证MVP工作坊成功读取frontendDesign数据

### 测试用例2：旧数据兼容
1. 使用没有frontendDesign的旧版refinedDocument
2. 进入MVP工作坊
3. ✅ 验证系统推断出基本的frontendDesign数据
4. ✅ 用户可以在MVP工作坊中补充修改

### 测试用例3：单独进入MVP
1. 用户未完成创意完善工作坊
2. 直接进入MVP工作坊（消耗10积分）
3. ✅ 验证显示手动输入表单
4. ✅ 用户手动输入frontendRequirements

---

## 🎯 总结

### 核心改动
1. **创意完善工作坊**: 第5维度（产品详情）扩展为6轮对话，新增frontendDesign收集
2. **MVP工作坊**: 读取refinedDocument.productDetails.frontendDesign数据
3. **向后兼容**: 旧数据推断 + 手动输入备选方案

### 数据流转
```
AI竞价结果 → 创意完善工作坊 → refinedDocument.productDetails.frontendDesign
                                               ↓
                                         MVP工作坊使用
```

### 用户体验
- ✅ 无需在MVP工作坊重新描述前端需求
- ✅ 创意完善工作坊一次收集，多次使用
- ✅ 流程自然衔接，数据无缝传递

---

**文档版本**: v1.1
**最后更新**: 2025-10-25
**维护者**: Claude Code
**状态**: 待实施
**优先级**: 高（必须在MVP工作坊实施前完成）
