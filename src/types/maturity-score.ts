// 创意成熟度评估系统 - 类型定义
// Spec: CREATIVE_MATURITY_PLAN_ENHANCED.md v4.1

/**
 * AI消息类型 (从现有系统复用)
 */
export interface AIMessage {
  id: string;
  agentName: string;
  agentType: string;
  content: string;
  phase: string;
  timestamp: Date;
}

/**
 * 出价记录 (从现有系统复用)
 */
export interface BidRecord {
  agentName: string;
  amount: number;
  confidence?: number;
}

/**
 * 五维评分结果
 */
export interface DimensionScore {
  score: number;                    // 1-10分
  status: 'CLEAR' | 'NEEDS_FOCUS' | 'UNCLEAR';  // 状态标识
  evidence: string[];               // 专家原话(最多3条)
  confidence: number;               // 该维度的置信度 0-1
}

/**
 * 五个维度的详细评分
 */
export interface DimensionScores {
  targetCustomer: DimensionScore;   // 目标客户 20%
  demandScenario: DimensionScore;   // 需求场景 20%
  coreValue: DimensionScore;        // 核心价值 25%
  businessModel: DimensionScore;    // 商业模式 20%
  credibility: DimensionScore;      // 可信度 15%
}

/**
 * 有效信号统计 (The Mom Test)
 */
export interface ValidSignals {
  specificPast: number;       // 具体的过去("上次"、"上周")
  realSpending: number;       // 真实花费("每月付"、"已付费")
  painPoints: number;         // 痛点故事("丢了客户"、"损失")
  userIntroductions: number;  // 用户介绍("介绍"、"认识")
  evidence: number;           // 可验证证据("截图"、"数据"、"链接")
}

/**
 * 无效信号统计 (The Mom Test)
 */
export interface InvalidSignals {
  compliments: number;        // 赞美次数
  generalities: number;       // 泛泛而谈
  futurePromises: number;     // 未来保证
}

/**
 * 评分原因块
 */
export interface ScoringReason {
  dimension: string;          // 维度名称
  score: number;              // 该维度得分
  status: string;             // 状态
  expertQuotes: string[];     // 专家原话(最多3条)
  machineReason: string;      // 机器提取的理由
}

/**
 * 专家共识统计
 */
export interface ExpertConsensus {
  totalExperts: number;                    // 参与专家数
  supportCount: number;                    // 支持数
  concernCount: number;                    // 质疑数
  neutralCount: number;                    // 中立数
  topConcerns: string[];                   // 主要质疑点(最多5条)
  topPraise: string[];                     // 主要认可点(最多5条)
  consensusLevel: 'HIGH' | 'MEDIUM' | 'LOW';  // 共识度
}

/**
 * 成熟度等级
 */
export type MaturityLevel =
  | 'LOW'        // 1-4分: 想法阶段
  | 'GRAY_LOW'   // 4-5分: 灰色区(想法→方向)
  | 'MEDIUM'     // 5-7分: 方向阶段
  | 'GRAY_HIGH'  // 7-7.5分: 灰色区(方向→方案)
  | 'HIGH';      // 7.5-10分: 方案阶段

/**
 * 评分权重配置
 */
export interface ScoringWeights {
  targetCustomer: number;    // 0.20
  demandScenario: number;    // 0.20
  coreValue: number;         // 0.25
  businessModel: number;     // 0.20
  credibility: number;       // 0.15
}

/**
 * 评分阈值配置
 */
export interface ScoringThresholds {
  lowMax: number;      // 低分上限 (默认4.0)
  midMin: number;      // 中分下限 (默认5.0)
  midMax: number;      // 中分上限 (默认7.0)
  highMin: number;     // 高分下限 (默认7.5)
}

/**
 * 完整评分结果
 */
export interface MaturityScoreResult {
  totalScore: number;                  // 1-10分
  level: MaturityLevel;                // 成熟度等级
  dimensions: DimensionScores;         // 5维详情
  expertConsensus: ExpertConsensus;    // 专家共识
  confidence: number;                  // 整体置信度 0-1
  scoringReasons: ScoringReason[];     // 评分原因块
  validSignals: ValidSignals;          // 有效信号统计
  invalidSignals: InvalidSignals;      // 无效信号统计
  scoringVersion: string;              // 评分版本号
  weakDimensions: string[];            // 薄弱维度列表
}

/**
 * 关键词配置
 */
export interface DimensionKeywords {
  concerns: string[];   // 质疑关键词
  praise: string[];     // 认可关键词
}

/**
 * 权重配置版本信息
 */
export interface WeightConfigVersion {
  id: string;
  version: string;
  isActive: boolean;
  isCanary: boolean;
  canaryPercentage: number;
  weights: ScoringWeights;
  thresholds: ScoringThresholds;
  description?: string;
  calibrationSetSize?: number;
  calibrationAccuracy?: number;
  createdAt: Date;
  updatedAt: Date;
}
