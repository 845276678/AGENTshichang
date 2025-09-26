# 商业计划书生成前的用户需求分析系统

## 功能概述

在正式开始商业计划书生成前，通过智能化的需求收集和AI分析，确保生成的方案完全契合用户的关注重点和期望。

## 核心流程

```
用户提交创意
    ↓
[需求收集阶段] → 预设选项展示 → 用户选择/自定义 → AI需求分析
    ↓
[需求确认阶段] → 生成个性化大纲 → 用户确认调整 → 最终确定方向
    ↓
[正式生成阶段] → 基于用户需求的定制化生成流程
```

## 1. 用户需求收集系统

### 1.1 预设需求选项分类

```typescript
interface RequirementCategory {
  id: string
  name: string
  description: string
  icon: React.ElementType
  options: RequirementOption[]
  allowCustom: boolean
}

interface RequirementOption {
  id: string
  label: string
  description: string
  weight: number // 影响生成内容的权重
  relatedStages: string[] // 影响哪些生成阶段
  aiPromptHint: string // 给AI的提示
}

// 预设需求分类
const REQUIREMENT_CATEGORIES: RequirementCategory[] = [
  {
    id: 'business_focus',
    name: '商业关注重点',
    description: '您最希望在商业计划书中突出哪些方面？',
    icon: Target,
    allowCustom: true,
    options: [
      {
        id: 'market_opportunity',
        label: '市场机会分析',
        description: '深度分析市场规模、增长趋势和机会点',
        weight: 3,
        relatedStages: ['market_research', 'business_model'],
        aiPromptHint: '重点关注市场机会识别和量化分析'
      },
      {
        id: 'competitive_advantage',
        label: '竞争优势构建',
        description: '详细阐述产品/服务的核心竞争力',
        weight: 3,
        relatedStages: ['concept_analysis', 'market_research'],
        aiPromptHint: '深入分析差异化优势和护城河'
      },
      {
        id: 'revenue_model',
        label: '盈利模式设计',
        description: '清晰的收入来源和商业模式规划',
        weight: 3,
        relatedStages: ['business_model', 'financial_model'],
        aiPromptHint: '详细设计可持续的盈利路径'
      },
      {
        id: 'technology_innovation',
        label: '技术创新亮点',
        description: '突出技术方案的先进性和可行性',
        weight: 3,
        relatedStages: ['tech_architecture', 'concept_analysis'],
        aiPromptHint: '强调技术创新点和实现路径'
      }
    ]
  },
  {
    id: 'target_audience',
    name: '目标受众',
    description: '这份商业计划书主要面向哪些人群？',
    icon: Users,
    allowCustom: true,
    options: [
      {
        id: 'investors_vc',
        label: '风险投资人',
        description: '重点关注投资回报、市场规模、团队能力',
        weight: 3,
        relatedStages: ['investor_pitch', 'financial_model', 'market_research'],
        aiPromptHint: '采用投资人视角，强调ROI和可扩展性'
      },
      {
        id: 'angel_investors',
        label: '天使投资人',
        description: '注重创新性、早期可行性验证',
        weight: 2,
        relatedStages: ['concept_analysis', 'implementation_plan'],
        aiPromptHint: '突出创新概念和早期执行计划'
      },
      {
        id: 'strategic_partners',
        label: '战略合作伙伴',
        description: '展示合作价值、互补优势',
        weight: 2,
        relatedStages: ['business_model', 'implementation_plan'],
        aiPromptHint: '强调合作共赢和资源互补'
      },
      {
        id: 'internal_team',
        label: '内部团队',
        description: '详细的执行计划和资源配置',
        weight: 2,
        relatedStages: ['implementation_plan', 'tech_architecture'],
        aiPromptHint: '提供详细的执行指导和操作手册'
      }
    ]
  },
  {
    id: 'industry_focus',
    name: '行业特色',
    description: '希望在计划书中如何体现行业特点？',
    icon: Building,
    allowCustom: true,
    options: [
      {
        id: 'regulatory_compliance',
        label: '合规性要求',
        description: '详细的法律法规遵循和风险控制',
        weight: 3,
        relatedStages: ['legal_compliance'],
        aiPromptHint: '重点关注行业合规和风险管控'
      },
      {
        id: 'industry_trends',
        label: '行业趋势分析',
        description: '深入分析行业发展方向和趋势',
        weight: 2,
        relatedStages: ['market_research', 'concept_analysis'],
        aiPromptHint: '结合行业发展趋势进行分析'
      },
      {
        id: 'ecosystem_position',
        label: '生态位定位',
        description: '在产业链中的位置和价值创造',
        weight: 2,
        relatedStages: ['business_model', 'market_research'],
        aiPromptHint: '分析产业链价值和生态定位'
      }
    ]
  },
  {
    id: 'resource_constraints',
    name: '资源约束',
    description: '当前面临的主要资源限制是什么？',
    icon: AlertCircle,
    allowCustom: true,
    options: [
      {
        id: 'funding_limited',
        label: '资金有限',
        description: '需要详细的资金使用计划和融资策略',
        weight: 3,
        relatedStages: ['financial_model', 'investor_pitch'],
        aiPromptHint: '重点规划资金使用效率和融资方案'
      },
      {
        id: 'team_building',
        label: '团队组建',
        description: '需要明确的人才需求和团队建设计划',
        weight: 2,
        relatedStages: ['implementation_plan'],
        aiPromptHint: '详细规划团队建设和人才获取策略'
      },
      {
        id: 'technology_gap',
        label: '技术差距',
        description: '需要技术开发路径和能力建设方案',
        weight: 2,
        relatedStages: ['tech_architecture', 'implementation_plan'],
        aiPromptHint: '提供技术能力建设和开发路线图'
      }
    ]
  },
  {
    id: 'timeline_priority',
    name: '时间优先级',
    description: '希望商业计划书重点关注哪个时间段？',
    icon: Clock,
    allowCustom: false,
    options: [
      {
        id: 'immediate_launch',
        label: '立即启动（3-6个月）',
        description: '专注于快速启动和早期验证',
        weight: 3,
        relatedStages: ['implementation_plan', 'concept_analysis'],
        aiPromptHint: '关注快速MVP开发和市场验证'
      },
      {
        id: 'medium_term',
        label: '中期发展（1-2年）',
        description: '平衡发展计划和可持续性',
        weight: 2,
        relatedStages: ['business_model', 'financial_model'],
        aiPromptHint: '平衡短期执行和中期发展规划'
      },
      {
        id: 'long_term_vision',
        label: '长期愿景（3-5年）',
        description: '重点关注战略规划和规模化',
        weight: 2,
        relatedStages: ['market_research', 'investor_pitch'],
        aiPromptHint: '强调长期战略和规模化路径'
      }
    ]
  }
]
```

### 1.2 用户需求收集界面

```typescript
// 需求收集组件接口
interface UserRequirementsCollectorProps {
  ideaData: IdeaData
  onRequirementsSubmit: (requirements: UserRequirements) => void
  onSkip: () => void
}

interface UserRequirements {
  selectedOptions: Record<string, string[]> // categoryId -> optionIds
  customRequirements: Record<string, string> // categoryId -> custom text
  priorityWeights: Record<string, number> // optionId -> weight
  additionalContext: string
  expectedOutcomes: string[]
  timeConstraints: {
    deadline?: Date
    milestones: Array<{
      name: string
      date: Date
      description: string
    }>
  }
}
```

## 2. AI需求分析系统

### 2.1 需求分析处理流程

```typescript
class RequirementAnalysisEngine {
  async analyzeUserRequirements(
    ideaData: IdeaData,
    userRequirements: UserRequirements
  ): Promise<RequirementAnalysis> {

    // 1. 需求理解和分类
    const requirementUnderstanding = await this.understandRequirements(
      userRequirements
    )

    // 2. 与创意数据的匹配分析
    const ideaRequirementMatch = await this.analyzeIdeaRequirementFit(
      ideaData,
      requirementUnderstanding
    )

    // 3. 生成个性化大纲
    const customizedOutline = await this.generateCustomizedOutline(
      ideaData,
      userRequirements,
      ideaRequirementMatch
    )

    // 4. 识别潜在风险和机会
    const riskOpportunityAnalysis = await this.analyzeRisksAndOpportunities(
      ideaData,
      userRequirements
    )

    // 5. 生成优化建议
    const optimizationSuggestions = await this.generateOptimizationSuggestions(
      ideaData,
      userRequirements,
      riskOpportunityAnalysis
    )

    return {
      understanding: requirementUnderstanding,
      ideaFit: ideaRequirementMatch,
      customizedOutline,
      risksAndOpportunities: riskOpportunityAnalysis,
      suggestions: optimizationSuggestions,
      estimatedTimeAdjustment: this.calculateTimeAdjustment(userRequirements),
      recommendedStageWeights: this.calculateStageWeights(userRequirements)
    }
  }

  private async understandRequirements(
    requirements: UserRequirements
  ): Promise<RequirementUnderstanding> {
    const prompt = `
分析用户对商业计划书的具体需求：

选择的重点：${JSON.stringify(requirements.selectedOptions)}
自定义需求：${JSON.stringify(requirements.customRequirements)}
优先级权重：${JSON.stringify(requirements.priorityWeights)}
补充说明：${requirements.additionalContext}

请分析：
1. 用户的核心关注点是什么？
2. 用户的背景和经验水平如何？
3. 用户最看重哪些商业要素？
4. 潜在的需求冲突和平衡点？
5. 建议的内容重点调整方向？

以JSON格式回复分析结果。
    `

    const analysis = await this.aiService.analyze(prompt)
    return this.parseRequirementAnalysis(analysis)
  }

  private async generateCustomizedOutline(
    ideaData: IdeaData,
    requirements: UserRequirements,
    ideaFit: IdeaRequirementMatch
  ): Promise<CustomizedOutline> {
    const prompt = `
基于创意和用户需求，生成个性化的商业计划书大纲：

创意信息：
- 标题：${ideaData.title}
- 描述：${ideaData.description}
- 分类：${ideaData.category}

用户重点关注：${this.formatUserFocus(requirements)}
匹配度分析：${JSON.stringify(ideaFit)}

请生成：
1. 调整后的章节大纲（保持8个核心章节，但调整重点）
2. 每个章节的内容重点和深度建议
3. 特别需要突出的亮点
4. 建议削弱或简化的部分
5. 预计的页面分配和时间分配

以结构化JSON格式回复。
    `

    const outline = await this.aiService.generateOutline(prompt)
    return this.parseCustomizedOutline(outline)
  }
}
```

### 2.2 生成策略调整

```typescript
interface GenerationStrategy {
  stageAdjustments: Array<{
    stageId: string
    weightMultiplier: number // 相对权重调整
    focusAreas: string[] // 该阶段的重点领域
    depthLevel: 'basic' | 'detailed' | 'comprehensive' // 内容深度
    aiInstructions: string // 给AI的特殊指示
  }>

  contentPrioritization: {
    highPriority: string[] // 高优先级内容类型
    mediumPriority: string[]
    lowPriority: string[]
  }

  audienceAdaptation: {
    targetAudience: string
    languageStyle: 'formal' | 'conversational' | 'technical'
    detailLevel: 'executive_summary' | 'detailed' | 'comprehensive'
    emphasizePoints: string[]
  }

  timelineOptimization: {
    totalTimeAdjustment: number // 总时间调整系数
    stageTimeDistribution: Record<string, number> // 各阶段时间分配
  }
}
```

## 3. 用户界面实现

### 3.1 需求收集界面设计

```tsx
const UserRequirementsCollector: React.FC<UserRequirementsCollectorProps> = ({
  ideaData,
  onRequirementsSubmit,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [requirements, setRequirements] = useState<UserRequirements>({
    selectedOptions: {},
    customRequirements: {},
    priorityWeights: {},
    additionalContext: '',
    expectedOutcomes: [],
    timeConstraints: { milestones: [] }
  })

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<RequirementAnalysis | null>(null)

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* 进度指示器 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">需求定制化分析</h2>
          <Badge variant="outline">{currentStep + 1}/6 步骤</Badge>
        </div>
        <Progress value={(currentStep / 5) * 100} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2">
          为了生成最符合您期望的商业计划书，请告诉我们您的具体需求
        </p>
      </div>

      <AnimatePresence mode="wait">
        {currentStep === 0 && (
          <RequirementCategoryStep
            category={REQUIREMENT_CATEGORIES[0]}
            selectedOptions={requirements.selectedOptions[REQUIREMENT_CATEGORIES[0].id] || []}
            customInput={requirements.customRequirements[REQUIREMENT_CATEGORIES[0].id] || ''}
            onUpdate={(options, custom) => updateRequirements(REQUIREMENT_CATEGORIES[0].id, options, custom)}
          />
        )}

        {currentStep === 1 && (
          <RequirementCategoryStep
            category={REQUIREMENT_CATEGORIES[1]}
            selectedOptions={requirements.selectedOptions[REQUIREMENT_CATEGORIES[1].id] || []}
            customInput={requirements.customRequirements[REQUIREMENT_CATEGORIES[1].id] || ''}
            onUpdate={(options, custom) => updateRequirements(REQUIREMENT_CATEGORIES[1].id, options, custom)}
          />
        )}

        {/* 其他步骤... */}

        {currentStep === 5 && !isAnalyzing && !analysisResult && (
          <RequirementsSummaryStep
            ideaData={ideaData}
            requirements={requirements}
            onConfirm={handleAnalyzeRequirements}
            onEdit={(step) => setCurrentStep(step)}
          />
        )}

        {isAnalyzing && (
          <RequirementsAnalysisStep
            ideaData={ideaData}
            requirements={requirements}
            onComplete={setAnalysisResult}
          />
        )}

        {analysisResult && (
          <AnalysisResultsStep
            analysisResult={analysisResult}
            onConfirm={() => onRequirementsSubmit(requirements)}
            onRevise={() => setCurrentStep(0)}
          />
        )}
      </AnimatePresence>

      {/* 控制按钮 */}
      <div className="flex justify-between pt-6 border-t">
        <div className="flex gap-2">
          {currentStep > 0 && !isAnalyzing && (
            <Button variant="outline" onClick={() => setCurrentStep(prev => prev - 1)}>
              上一步
            </Button>
          )}
          <Button variant="ghost" onClick={onSkip}>
            跳过定制，使用默认设置
          </Button>
        </div>

        <div className="flex gap-2">
          {currentStep < 5 && (
            <Button onClick={() => setCurrentStep(prev => prev + 1)}>
              下一步
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
```

### 3.2 AI分析结果展示

```tsx
const AnalysisResultsStep: React.FC<{
  analysisResult: RequirementAnalysis
  onConfirm: () => void
  onRevise: () => void
}> = ({ analysisResult, onConfirm, onRevise }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Brain className="w-5 h-5" />
            AI需求分析完成
          </CardTitle>
          <CardDescription className="text-green-700">
            基于您的需求，我们为您定制了专属的商业计划书生成方案
          </CardDescription>
        </CardHeader>
      </Card>

      {/* 需求理解展示 */}
      <Card>
        <CardHeader>
          <CardTitle>需求理解</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">核心关注点</h4>
              <ul className="space-y-1">
                {analysisResult.understanding.coreInterests.map((interest, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {interest}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">建议调整</h4>
              <ul className="space-y-1">
                {analysisResult.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Sparkles className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    {suggestion.description}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 定制化大纲 */}
      <Card>
        <CardHeader>
          <CardTitle>定制化大纲</CardTitle>
          <CardDescription>根据您的需求调整后的章节重点</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysisResult.customizedOutline.sections.map((section, index) => (
              <div key={section.stageId} className="flex items-start gap-4 p-4 border rounded-lg">
                <Badge className="mt-1">{index + 1}</Badge>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{section.title}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant={section.priority === 'high' ? 'default' : 'secondary'}>
                        {section.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {section.estimatedPages}页
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{section.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {section.focusPoints.map((point, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {point}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 时间和成本预估 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">
              {analysisResult.estimatedTimeAdjustment}min
            </div>
            <div className="text-sm text-muted-foreground">预计生成时间</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">
              {Math.round(analysisResult.ideaFit.matchScore * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">需求匹配度</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Zap className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">
              {analysisResult.customizedOutline.totalPages}
            </div>
            <div className="text-sm text-muted-foreground">预计总页数</div>
          </CardContent>
        </Card>
      </div>

      {/* 确认按钮 */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onRevise}>
          <RotateCcw className="w-4 h-4 mr-2" />
          重新调整需求
        </Button>
        <Button onClick={onConfirm} size="lg" className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          确认并开始生成
        </Button>
      </div>
    </motion.div>
  )
}
```

## 4. 集成到现有系统

### 4.1 状态管理扩展

```typescript
// 扩展现有的状态管理
interface BusinessPlanGenerationState {
  // ... 现有状态 ...

  // 新增需求分析状态
  requirementsCollection: {
    isActive: boolean
    currentStep: number
    userRequirements: UserRequirements | null
    analysisResult: RequirementAnalysis | null
    isAnalyzing: boolean
  }

  // 新增方法
  startRequirementsCollection: () => void
  updateRequirements: (requirements: Partial<UserRequirements>) => void
  analyzeRequirements: () => Promise<RequirementAnalysis>
  applyRequirementsToGeneration: (requirements: UserRequirements, analysis: RequirementAnalysis) => void
}
```

### 4.2 生成流程调整

```typescript
// 调整生成流程，融入用户需求
const executeCustomizedGeneration = async () => {
  const { userRequirements, analysisResult } = get().requirementsCollection

  if (!userRequirements || !analysisResult) {
    // 使用默认生成流程
    return get().executeGeneration()
  }

  // 应用定制化策略
  const strategy = analysisResult.generationStrategy

  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i]
    const stageStrategy = strategy.stageAdjustments.find(s => s.stageId === stage.id)

    if (stageStrategy) {
      // 应用阶段级定制
      await get().executeCustomizedStage(stage.id, stageStrategy)
    } else {
      // 使用默认执行
      await get().executeStage(stage.id)
    }
  }
}
```

## 总结

这个增强功能将显著提升用户体验：

1. **个性化程度**：真正根据用户需求定制内容
2. **AI智能分析**：自动理解和优化用户需求
3. **透明度提升**：让用户了解为什么这样生成
4. **灵活性增强**：支持完全自定义的需求表达
5. **质量保证**：通过需求分析确保结果质量

整个系统既保持了原有的简单易用，又增加了强大的定制化能力。