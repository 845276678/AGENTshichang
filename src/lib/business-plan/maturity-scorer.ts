// 创意成熟度评分引擎 - 规则版 v1.0.0
// Spec: CREATIVE_MATURITY_PLAN_ENHANCED.md v4.1 (Lines 84-534)

import type {
  AIMessage,
  BidRecord,
  DimensionScore,
  DimensionScores,
  DimensionKeywords,
  ExpertConsensus,
  InvalidSignals,
  MaturityLevel,
  MaturityScoreResult,
  ScoringReason,
  ScoringThresholds,
  ScoringWeights,
  ValidSignals
} from '@/types/maturity-score';

/**
 * 维度关键词库
 * Spec: Lines 173-195 (CREATIVE_MATURITY_PLAN_ENHANCED.md)
 */
const DIMENSION_KEYWORDS: Record<string, DimensionKeywords> = {
  targetCustomer: {
    concerns: ['目标用户是谁', '客户群体', '谁会用', '太宽泛', '所有人', '不够具体', '哪个细分'],
    praise: ['目标明确', '人群清晰', '定位精准', '细分市场', '画像清晰', '访谈', '真实用户']
  },
  demandScenario: {
    concerns: ['什么场景', '怎么用', '使用场景不清', '需求模糊', '场景太泛', '什么时候用'],
    praise: ['场景清晰', '刚需场景', '高频场景', '痛点明确', '具体场景', '真实案例']
  },
  coreValue: {
    concerns: ['和XX有什么区别', '差异化', '凭什么', '同质化', '竞品优势', '独特在哪'],
    praise: ['独特价值', '差异化明显', '技术壁垒', '创新点', '核心优势', '独家']
  },
  businessModel: {
    concerns: ['怎么赚钱', '商业模式', '盈利方式', '收费模式', '定价依据', '获客成本'],
    praise: ['模式清晰', '订阅制', '可持续', '盈利路径', '已付费', '真实收入', 'ARR', 'GMV']
  },
  credibility: {
    concerns: ['需要验证', '假设', '没有数据', '不确定', '缺少证据', '预计', '应该会'],
    praise: ['有数据', '已验证', 'MVP', '真实用户', '留存率', '增长数据', '截图', '链接']
  }
};

/**
 * The Mom Test 关键词库 (增强版 v2.0)
 * Spec: Lines 143-257 (无效/有效信号识别)
 * 调整: 基于标定测试结果扩充关键词库
 */
const MOM_TEST_KEYWORDS = {
  // 无效信号 - 需要抑制
  invalid: {
    compliments: ['太棒了', '很喜欢', '不错的主意', '有潜力', '很好', '赞', 'love this', 'amazing', 'great idea', 'sounds good'],
    generalities: ['我经常', '我总是', '我绝不', '我将会', '我可能', '大家都', 'everyone', 'always', 'never', 'usually'],
    futurePromises: ['会买', '将会使用', '一定会', '肯定会', '应该会', '打算', 'will buy', 'going to', 'plan to', 'definitely will']
  },
  // 有效信号 - 需要加权
  valid: {
    specificPast: [
      // 中文时间词
      '上次', '上周', '去年', '花了', '最近一次', '昨天', '上个月', '前天', '上季度', '去年底', '上月', '上年', '那时', '当时', '过去',
      // 英文时间词
      'last time', 'last week', 'last year', 'last month', 'yesterday', 'ago', 'previously', 'before', 'earlier',
      // 具体时间表达
      '3个月', '6个月', '12个月', '运行', '已经', '3 months', '6 months', '12 months', 'running for'
    ],
    realSpending: [
      // 付费相关
      '每月付', '每年花', '已经付费', '现在用', '订阅了', '买了', '付了', '花费', '支付', '购买',
      // 收入数据
      '月收入', '年收入', '营收', '销售额', 'MRR', 'ARR', 'revenue', 'income', 'sales',
      // 用户规模
      '付费用户', '订阅用户', 'paying users', 'subscribers', 'customers',
      // 具体金额
      '元/月', '元/年', '$', '¥', 'per month', 'per year', 'annual fee'
    ],
    painPoints: [
      '丢了客户', '损失', '浪费了', '痛苦', '被迫', '不得不', '崩溃了', '亏了', '误差', '低效', '问题',
      'lost client', 'wasted', 'frustrated', 'painful', 'struggling', 'issue', 'problem'
    ],
    introductions: [
      '介绍', '认识', '朋友也有', '可以问', '还有谁', '其他人', '同行', '推荐',
      'introduce', 'referral', 'friend', 'colleague', 'know someone', 'can ask'
    ],
    evidence: [
      // 数据证据
      '截图', '数据', '链接', '报告', '录音', '文件', '合同', '发票',
      'screenshot', 'data', 'link', 'report', 'document', 'contract', 'invoice',
      // 指标数据
      'LTV', 'CAC', 'NPS', '留存率', '增长率', 'retention', 'growth rate', 'churn',
      // 验证方式
      'Google Analytics', 'App Store', '评分', 'rating', 'review', '验证'
    ]
  }
};

/**
 * 成熟度评分器
 */
export class MaturityScorer {
  private weights: ScoringWeights;
  private thresholds: ScoringThresholds;

  constructor(weights: ScoringWeights, thresholds: ScoringThresholds) {
    this.weights = weights;
    this.thresholds = thresholds;
  }

  /**
   * 分析AI专家讨论，计算成熟度评分
   * Spec: Lines 89-138 (核心评分逻辑)
   */
  analyze(aiMessages: AIMessage[], bids: Record<string, number>): MaturityScoreResult {
    // 1. 过滤无效数据 (The Mom Test)
    const { validMessages, invalidSignals } = this.filterInvalidData(aiMessages);

    // 2. 识别有效信号 (The Mom Test)
    const validSignals = this.detectValidSignals(aiMessages);

    // 3. 评估5个维度
    const dimensions: DimensionScores = {
      targetCustomer: this.scoreDimension('targetCustomer', validMessages, validSignals),
      demandScenario: this.scoreDimension('demandScenario', validMessages, validSignals),
      coreValue: this.scoreDimension('coreValue', validMessages, validSignals),
      businessModel: this.scoreDimension('businessModel', validMessages, validSignals),
      credibility: this.scoreDimension('credibility', validMessages, validSignals)
    };

    // 4. 加权平均
    const totalScore = this.calculateWeightedScore(dimensions);

    // 5. 计算置信度
    const confidence = this.calculateConfidence(dimensions, validSignals, invalidSignals);

    // 6. 确定等级
    const level = this.determineLevel(totalScore);

    // 7. 提取专家共识
    const expertConsensus = this.extractExpertConsensus(validMessages, bids);

    // 8. 生成评分原因块
    const scoringReasons = this.generateScoringReasons(dimensions, validSignals, invalidSignals);

    // 9. 识别薄弱维度
    const weakDimensions = this.identifyWeakDimensions(dimensions);

    return {
      totalScore,
      level,
      dimensions,
      expertConsensus,
      confidence,
      scoringReasons,
      validSignals,
      invalidSignals,
      scoringVersion: '1.0.0',
      weakDimensions
    };
  }

  /**
   * 过滤无效数据 (The Mom Test)
   * Spec: Lines 152-196 (无效数据识别与抑制)
   */
  private filterInvalidData(aiMessages: AIMessage[]): {
    validMessages: AIMessage[];
    invalidSignals: InvalidSignals;
  } {
    const validMessages: AIMessage[] = [];
    const invalidSignals: InvalidSignals = {
      compliments: 0,
      generalities: 0,
      futurePromises: 0
    };

    for (const msg of aiMessages) {
      let isInvalid = false;

      // 检测赞美 - 完全过滤
      if (MOM_TEST_KEYWORDS.invalid.compliments.some(kw => msg.content.includes(kw))) {
        invalidSignals.compliments++;
        isInvalid = true;
      }

      // 检测泛泛而谈 - 不完全过滤，但降低置信度
      if (MOM_TEST_KEYWORDS.invalid.generalities.some(kw => msg.content.includes(kw))) {
        invalidSignals.generalities++;
      }

      // 检测未来保证 - 不完全过滤，但降低可信度分数
      if (MOM_TEST_KEYWORDS.invalid.futurePromises.some(kw => msg.content.includes(kw))) {
        invalidSignals.futurePromises++;
      }

      if (!isInvalid) {
        validMessages.push(msg);
      }
    }

    return { validMessages, invalidSignals };
  }

  /**
   * 识别有效信号 (The Mom Test)
   * Spec: Lines 218-257 (有效信号识别)
   */
  private detectValidSignals(aiMessages: AIMessage[]): ValidSignals {
    const validSignals: ValidSignals = {
      specificPast: 0,
      realSpending: 0,
      painPoints: 0,
      userIntroductions: 0,
      evidence: 0
    };

    for (const msg of aiMessages) {
      if (MOM_TEST_KEYWORDS.valid.specificPast.some(kw => msg.content.includes(kw))) {
        validSignals.specificPast++;
      }
      if (MOM_TEST_KEYWORDS.valid.realSpending.some(kw => msg.content.includes(kw))) {
        validSignals.realSpending++;
      }
      if (MOM_TEST_KEYWORDS.valid.painPoints.some(kw => msg.content.includes(kw))) {
        validSignals.painPoints++;
      }
      if (MOM_TEST_KEYWORDS.valid.introductions.some(kw => msg.content.includes(kw))) {
        validSignals.userIntroductions++;
      }
      if (MOM_TEST_KEYWORDS.valid.evidence.some(kw => msg.content.includes(kw))) {
        validSignals.evidence++;
      }
    }

    return validSignals;
  }

  /**
   * 评估单个维度 (规则版 v2.1 - 增强LOW级别识别)
   * Spec: Lines 108-142 (维度评分)
   * 调整: 更激进的低分惩罚机制
   */
  private scoreDimension(
    dimension: string,
    messages: AIMessage[],
    validSignals: ValidSignals
  ): DimensionScore {
    const keywords = DIMENSION_KEYWORDS[dimension];
    if (!keywords) {
      throw new Error(`Unknown dimension: ${dimension}`);
    }

    // 基础分根据消息数量和质量调整 (v2.1增强惩罚)
    let score = messages.length === 0 ? 2 : 5; // 无消息 → 低分起点
    const evidence: string[] = [];

    // 检测专家质疑（降分）
    const concerns = messages.filter(msg =>
      keywords.concerns.some(kw => msg.content.includes(kw))
    );

    // 检测专家认可（加分）
    const praise = messages.filter(msg =>
      keywords.praise.some(kw => msg.content.includes(kw))
    );

    // 边际递减：去重避免刷分
    const uniqueConcerns = this.deduplicateConcerns(concerns);
    const uniquePraise = this.deduplicatePraise(praise);

    // 🆕 v2.1: 如果全是质疑，没有认可 → 基础分降至3分
    if (uniqueConcerns.length > 0 && uniquePraise.length === 0 && messages.length <= 3) {
      score = 3; // 降至3分基础
    }

    // 基础评分调整
    score -= uniqueConcerns.length * 0.8; // 每个疑虑-0.8分
    score += uniquePraise.length * 0.5;   // 每个认可+0.5分

    // The Mom Test 有效信号加成 (Spec: Lines 260-288)
    score = this.applyValidSignalBonus(dimension, score, validSignals);

    // 限制在1-10范围
    score = Math.max(1, Math.min(10, score));

    // 收集证据（最多3条）
    const allEvidence = [...concerns, ...praise];
    evidence.push(...allEvidence.slice(0, 3).map(msg => msg.content));

    // 计算该维度置信度
    const confidence = this.calculateDimensionConfidence(concerns, praise);

    // 确定状态
    const status = this.getDimensionStatus(score);

    return {
      score,
      status,
      evidence,
      confidence
    };
  }

  /**
   * 根据有效信号调整分数 (增强版 v2.0)
   * Spec: Lines 260-288 (有效信号加权影响)
   * 调整: 基于标定测试提高加成系数，更好地奖励HIGH级别样本
   */
  private applyValidSignalBonus(
    dimension: string,
    baseScore: number,
    validSignals: ValidSignals
  ): number {
    let score = baseScore;

    // 商业模式：有真实付费证据 → 加分 (0.5 → 1.5)
    if (dimension === 'businessModel' && validSignals.realSpending > 0) {
      score += Math.min(validSignals.realSpending * 1.5, 3);
    }

    // 可信度：有多个具体过去案例 → 加分 (0.3 → 0.8)
    if (dimension === 'credibility' && validSignals.specificPast > 0) {
      score += Math.min(validSignals.specificPast * 0.8, 2);
    }

    // 核心价值：有痛点故事 → 加分 (0.4 → 0.8)
    if (dimension === 'coreValue' && validSignals.painPoints > 0) {
      score += Math.min(validSignals.painPoints * 0.8, 2);
    }

    // 可信度：有可验证证据 → 大幅加分 (1.0 → 2.0)
    if (dimension === 'credibility' && validSignals.evidence > 0) {
      score += Math.min(validSignals.evidence * 2.0, 4);
    }

    // 目标客户：有用户推荐 → 加分 (新增)
    if (dimension === 'targetCustomer' && validSignals.userIntroductions > 0) {
      score += Math.min(validSignals.userIntroductions * 0.6, 1.5);
    }

    // 需求场景：有具体过去案例 → 加分 (新增)
    if (dimension === 'demandScenario' && validSignals.specificPast > 0) {
      score += Math.min(validSignals.specificPast * 0.5, 1.5);
    }

    return score;
  }

  /**
   * 去重：避免关键词堆砌刷分
   * Spec: Lines 472-519 (防刷分机制)
   */
  private deduplicateConcerns(concerns: AIMessage[]): AIMessage[] {
    const seen = new Set<string>();
    return concerns.filter(msg => {
      const key = this.extractKeyIssue(msg.content);

      // 完全相同
      if (seen.has(key)) return false;

      // 语义近似检测（简化版）
      for (const seenKey of seen) {
        if (this.isSemanticallyClose(key, seenKey)) {
          return false;
        }
      }

      seen.add(key);
      return true;
    });
  }

  private deduplicatePraise(praise: AIMessage[]): AIMessage[] {
    const seen = new Set<string>();
    return praise.filter(msg => {
      const key = this.extractKeyIssue(msg.content);
      if (seen.has(key)) return false;

      for (const seenKey of seen) {
        if (this.isSemanticallyClose(key, seenKey)) {
          return false;
        }
      }

      seen.add(key);
      return true;
    });
  }

  /**
   * 提取关键问题（用于去重）
   */
  private extractKeyIssue(content: string): string {
    // 简化版：提取前50个字符作为key
    // 生产环境可用NLP提取核心关键词
    return content.substring(0, 50).trim().toLowerCase();
  }

  /**
   * 语义近似判断（简化版）
   * Spec: Lines 497-519
   */
  private isSemanticallyClose(str1: string, str2: string): boolean {
    // 1. Levenshtein距离检测
    const distance = this.levenshteinDistance(str1, str2);
    if (distance <= 3) return true;

    // 2. 同义词表匹配
    const synonyms: Record<string, string[]> = {
      '目标用户': ['客户群体', '用户画像', '目标人群'],
      '核心价值': ['差异化', '独特优势', '核心卖点'],
      '商业模式': ['盈利方式', '赚钱方式', '收费模式']
    };

    for (const [base, syns] of Object.entries(synonyms)) {
      if (
        (str1.includes(base) || syns.some(s => str1.includes(s))) &&
        (str2.includes(base) || syns.some(s => str2.includes(s)))
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Levenshtein距离计算
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;
    const dp: number[][] = Array(m + 1)
      .fill(0)
      .map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1;
        }
      }
    }

    return dp[m][n];
  }

  /**
   * 加权平均计算总分
   */
  private calculateWeightedScore(dimensions: DimensionScores): number {
    const score =
      dimensions.targetCustomer.score * this.weights.targetCustomer +
      dimensions.demandScenario.score * this.weights.demandScenario +
      dimensions.coreValue.score * this.weights.coreValue +
      dimensions.businessModel.score * this.weights.businessModel +
      dimensions.credibility.score * this.weights.credibility;

    // 四舍五入到1位小数
    return Math.round(score * 10) / 10;
  }

  /**
   * 计算整体置信度
   * Spec: Lines 298-341 (置信度计算口径)
   */
  private calculateConfidence(
    dimensions: DimensionScores,
    validSignals: ValidSignals,
    invalidSignals: InvalidSignals
  ): number {
    let confidence = 0.9; // 基础置信度

    // 1. 维度证据充分度（最重要）
    const avgEvidenceCount =
      Object.values(dimensions).reduce((sum, dim) => sum + dim.evidence.length, 0) / 5;

    if (avgEvidenceCount < 1) {
      confidence -= 0.2; // 证据太少，降低置信度
    } else if (avgEvidenceCount > 3) {
      confidence += 0.05; // 证据充足，提升置信度
    }

    // 2. 有效信号加成
    const totalValidSignals = Object.values(validSignals).reduce((a, b) => a + b, 0);
    confidence += Math.min(totalValidSignals * 0.02, 0.1); // 每个+0.02，最多+0.1

    // 3. 无效信号惩罚 (The Mom Test)
    if (invalidSignals.futurePromises > 3) {
      confidence -= 0.15; // 太多未来保证，降低置信度
    }
    if (invalidSignals.generalities > 5) {
      confidence -= 0.1; // 太多泛泛而谈，降低置信度
    }

    // 4. 专家意见一致性
    const scoreDifferences = Object.values(dimensions).map(d => d.score);
    const stdDev = this.calculateStdDev(scoreDifferences);
    if (stdDev > 2.5) {
      confidence -= 0.1; // 专家意见分歧大，降低置信度
    }

    // 5. 归一化到 [0.5, 1.0] 区间
    return Math.max(0.5, Math.min(1.0, confidence));
  }

  /**
   * 计算标准差
   */
  private calculateStdDev(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  /**
   * 计算维度置信度
   */
  private calculateDimensionConfidence(concerns: AIMessage[], praise: AIMessage[]): number {
    const totalEvidence = concerns.length + praise.length;
    if (totalEvidence === 0) return 0.5; // 无证据，中等置信度
    if (totalEvidence >= 5) return 0.95; // 证据充分
    return 0.5 + totalEvidence * 0.1; // 线性增长
  }

  /**
   * 确定维度状态
   */
  private getDimensionStatus(score: number): 'CLEAR' | 'NEEDS_FOCUS' | 'UNCLEAR' {
    if (score >= 7) return 'CLEAR';
    if (score >= 5) return 'NEEDS_FOCUS';
    return 'UNCLEAR';
  }

  /**
   * 确定成熟度等级（含灰色区）
   * Spec: Lines 65-68 (分数阈值)
   */
  private determineLevel(score: number): MaturityLevel {
    if (score < this.thresholds.lowMax) return 'LOW';
    if (score < this.thresholds.midMin) return 'GRAY_LOW';
    if (score < this.thresholds.midMax) return 'MEDIUM';
    if (score < this.thresholds.highMin) return 'GRAY_HIGH';
    return 'HIGH';
  }

  /**
   * 提取专家共识
   */
  private extractExpertConsensus(
    messages: AIMessage[],
    bids: Record<string, number>
  ): ExpertConsensus {
    const totalExperts = Object.keys(bids).length;
    let supportCount = 0;
    let concernCount = 0;
    let neutralCount = 0;

    const topConcerns: string[] = [];
    const topPraise: string[] = [];

    // 分析每个专家的观点
    for (const msg of messages) {
      const hasConcern = Object.values(DIMENSION_KEYWORDS).some(kw =>
        kw.concerns.some(c => msg.content.includes(c))
      );

      const hasPraise = Object.values(DIMENSION_KEYWORDS).some(kw =>
        kw.praise.some(p => msg.content.includes(p))
      );

      if (hasConcern) {
        concernCount++;
        if (topConcerns.length < 5) {
          topConcerns.push(msg.content.substring(0, 100));
        }
      } else if (hasPraise) {
        supportCount++;
        if (topPraise.length < 5) {
          topPraise.push(msg.content.substring(0, 100));
        }
      } else {
        neutralCount++;
      }
    }

    // 计算共识度
    const consensusLevel = this.calculateConsensusLevel(supportCount, concernCount, neutralCount);

    return {
      totalExperts,
      supportCount,
      concernCount,
      neutralCount,
      topConcerns,
      topPraise,
      consensusLevel
    };
  }

  private calculateConsensusLevel(
    support: number,
    concern: number,
    neutral: number
  ): 'HIGH' | 'MEDIUM' | 'LOW' {
    const total = support + concern + neutral;
    if (total === 0) return 'LOW';

    const dominantRatio = Math.max(support, concern, neutral) / total;
    if (dominantRatio >= 0.7) return 'HIGH';
    if (dominantRatio >= 0.5) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * 生成评分原因块
   * Spec: Lines 356-417 (评分原因块模板)
   */
  private generateScoringReasons(
    dimensions: DimensionScores,
    validSignals: ValidSignals,
    invalidSignals: InvalidSignals
  ): ScoringReason[] {
    const reasons: ScoringReason[] = [];

    for (const [dimName, dimScore] of Object.entries(dimensions)) {
      const reason: ScoringReason = {
        dimension: dimName,
        score: dimScore.score,
        status: dimScore.status,
        expertQuotes: dimScore.evidence.slice(0, 3),
        machineReason: this.generateMachineReason(dimName, validSignals, invalidSignals)
      };
      reasons.push(reason);
    }

    return reasons;
  }

  /**
   * 生成机器提取理由
   * Spec: Lines 382-417
   */
  private generateMachineReason(
    dimName: string,
    validSignals: ValidSignals,
    invalidSignals: InvalidSignals
  ): string {
    let reason = '';

    if (dimName === 'businessModel') {
      if (validSignals.realSpending > 0) {
        reason = `✅ 检测到 ${validSignals.realSpending} 处真实付费证据，商业模式可信度高`;
      } else if (invalidSignals.futurePromises > 2) {
        reason = `⚠️ 检测到 ${invalidSignals.futurePromises} 处未来承诺，缺少真实付费验证`;
      } else {
        reason = `⚠️ 未检测到真实付费证据，建议补充用户访谈数据`;
      }
    } else if (dimName === 'credibility') {
      if (validSignals.evidence > 0) {
        reason = `✅ 检测到 ${validSignals.evidence} 处可验证证据（截图/数据/链接），可信度高`;
      } else if (validSignals.specificPast > 2) {
        reason = `✅ 检测到 ${validSignals.specificPast} 处具体过去案例，有一定可信度`;
      } else {
        reason = `⚠️ 缺少可验证证据，建议提供具体数据或访谈记录`;
      }
    } else if (dimName === 'targetCustomer') {
      if (validSignals.userIntroductions > 0) {
        reason = `✅ 检测到 ${validSignals.userIntroductions} 处用户介绍，目标客户画像清晰`;
      } else {
        reason = `⚠️ 建议补充5-10个目标用户访谈记录，明确细分人群`;
      }
    } else if (dimName === 'coreValue') {
      if (validSignals.painPoints > 0) {
        reason = `✅ 检测到 ${validSignals.painPoints} 处真实痛点，核心价值明确`;
      } else {
        reason = `⚠️ 建议挖掘更多用户痛点故事，强化差异化价值`;
      }
    } else {
      reason = `基于专家讨论分析生成`;
    }

    return reason;
  }

  /**
   * 识别薄弱维度
   */
  private identifyWeakDimensions(dimensions: DimensionScores): string[] {
    const weak: string[] = [];

    for (const [dimName, dimScore] of Object.entries(dimensions)) {
      if (dimScore.score < 6) {
        // 低于6分视为薄弱
        weak.push(dimName);
      }
    }

    // 按分数从低到高排序
    weak.sort((a, b) => dimensions[a as keyof DimensionScores].score - dimensions[b as keyof DimensionScores].score);

    return weak;
  }
}
