// AI 角色人设配置和对话系统
export interface AIPersona {
  id: string;
  name: string;
  avatar: string;
  personality: string[];
  specialty: string;
  catchPhrase: string;
  primaryModel: string;
  backupModel: string;
  triggerKeywords: string[];
  voiceStyle: 'calm' | 'excited' | 'analytical' | 'emotional' | 'authoritative';
  biddingStyle: 'conservative' | 'aggressive' | 'strategic' | 'emotional' | 'analytical';
}

export const AI_PERSONAS: AIPersona[] = [
  {
    id: 'tech-pioneer-alex',
    name: '科技先锋艾克斯',
    avatar: '🤖',  // 使用emoji避免图片加载问题
    personality: ['理性', '技术控', '逻辑思维', '创新导向'],
    specialty: '架构评估、算法优化、技术可行性分析',
    catchPhrase: '让数据说话，用技术改变世界！',
    primaryModel: 'deepseek',
    backupModel: 'zhipu',
    triggerKeywords: ['技术', '架构', '算法', '数据', '代码', '系统'],
    voiceStyle: 'analytical',
    biddingStyle: 'analytical'
  },
  {
    id: 'business-tycoon-wang',
    name: '商业大亨老王',
    avatar: '💼',  // 使用emoji避免图片加载问题
    personality: ['结果导向', '商业敏锐', '决策果断', '盈利至上'],
    specialty: '盈利模型、风险评估、商业策略',
    catchPhrase: '商场如战场，只有赢家才能生存！',
    primaryModel: 'qwen',
    backupModel: 'zhipu',
    triggerKeywords: ['盈利', 'ROI', '现金流', '商业', '市场', '竞争'],
    voiceStyle: 'authoritative',
    biddingStyle: 'aggressive'
  },
  {
    id: 'artistic-lin',
    name: '文艺少女小琳',
    avatar: '🎨',  // 使用emoji避免图片加载问题
    personality: ['情感共鸣', '用户导向', '审美敏感', '人文关怀'],
    specialty: '用户体验、品牌故事、情感价值',
    catchPhrase: '好的创意要触动人心，让生活更美好~',
    primaryModel: 'zhipu',
    backupModel: 'moonshot',
    triggerKeywords: ['用户感受', '品牌', '体验', '美感', '情感', '故事'],
    voiceStyle: 'emotional',
    biddingStyle: 'emotional'
  },
  {
    id: 'trend-master-allen',
    name: '趋势达人阿伦',
    avatar: '📈',  // 使用emoji避免图片加载问题
    personality: ['营销天才', '社交达人', '热点嗅觉', '传播专家'],
    specialty: '传播策略、热点预测、社交营销',
    catchPhrase: '抓住风口，让创意火遍全网！',
    primaryModel: 'qwen',
    backupModel: 'deepseek',
    triggerKeywords: ['热点', '传播', '营销', '社交', '流量', '病毒'],
    voiceStyle: 'excited',
    biddingStyle: 'strategic'
  },
  {
    id: 'scholar-li',
    name: '学者教授李博',
    avatar: '👨‍🏫',  // 使用emoji避免图片加载问题
    personality: ['严谨权威', '理论深厚', '逻辑缜密', '学术专业'],
    specialty: '理论支撑、系统分析、学术验证',
    catchPhrase: '理论指导实践，学术成就未来。',
    primaryModel: 'deepseek',
    backupModel: 'zhipu',
    triggerKeywords: ['理论', '研究', '实验', '学术', '分析', '验证'],
    voiceStyle: 'calm',
    biddingStyle: 'conservative'
  }
];

// 对话阶段配置
export interface DiscussionPhase {
  phase: 'warmup' | 'discussion' | 'bidding' | 'prediction' | 'result';
  duration: number; // 分钟
  description: string;
  userActions: string[];
}

export const DISCUSSION_PHASES: DiscussionPhase[] = [
  {
    phase: 'warmup',
    duration: 2,
    description: '预热阶段 - AI们初步了解您的创意',
    userActions: ['观看AI介绍', '点赞支持', '预设期望价格']
  },
  {
    phase: 'discussion',
    duration: 12,
    description: '创意讨论阶段 - 与AI们深度交流',
    userActions: ['回答AI提问', '补充创意细节', '选择讨论方向']
  },
  {
    phase: 'bidding',
    duration: 20,
    description: '竞价舞台阶段 - AI们激烈竞价',
    userActions: ['观看竞价表演', '支持喜欢的AI', '心理战互动']
  },
  {
    phase: 'prediction',
    duration: 4,
    description: '预测互动阶段 - 猜测最终价格',
    userActions: ['价格预测', '下注支持', '情绪打分']
  },
  {
    phase: 'result',
    duration: 5,
    description: '结果与奖励阶段 - 揭晓结果获得奖励',
    userActions: ['查看结果', '领取奖励', '分享成果']
  }
];

// AI 对话消息类型
export interface AIMessage {
  id: string;
  personaId: string;
  phase: string;
  round: number;
  type: 'speech' | 'reaction' | 'bid' | 'thinking' | 'celebration';
  content: string;
  emotion: 'neutral' | 'excited' | 'confident' | 'worried' | 'angry' | 'happy';
  bidValue?: number;
  timestamp: Date;
  cost?: number;
  tokens?: number;
}

// 竞价事件类型
export interface BiddingEvent {
  id: string;
  type: 'bid_placed' | 'reaction' | 'psychological_warfare' | 'price_jump' | 'alliance' | 'betrayal';
  personaId: string;
  targetPersonaId?: string;
  content: string;
  bidValue?: number;
  emotion: string;
  timestamp: Date;
  userReactions?: {
    likes: number;
    surprises: number;
    supports: number;
  };
}

// 用户互动选项
export interface UserInteraction {
  type: 'reaction' | 'support' | 'question' | 'prediction';
  target?: string; // personaId
  content: string;
  value?: number;
  emotion?: string;
}

// 会话成本控制
export interface CostController {
  sessionBudget: number; // ¥0.40
  currentCost: number;
  apiCallCount: number;
  templateFallbackThreshold: number; // ¥0.20
  emergencyShutdownThreshold: number; // ¥0.35
  costPerPhase: Record<string, number>;
}

// AI 调度策略
export interface AIScheduleStrategy {
  phase: string;
  realApiRatio: number; // 真实API调用比例
  templateRatio: number; // 模板脚本比例
  priority: 'drama' | 'cost' | 'engagement';
  personaWeights: Record<string, number>;
}

export const PHASE_STRATEGIES: Record<string, AIScheduleStrategy> = {
  warmup: {
    phase: 'warmup',
    realApiRatio: 0.3,
    templateRatio: 0.7,
    priority: 'cost',
    personaWeights: {
      'tech-pioneer-alex': 0.2,
      'business-tycoon-wang': 0.2,
      'artistic-lin': 0.2,
      'trend-master-allen': 0.2,
      'scholar-li': 0.2
    }
  },
  discussion: {
    phase: 'discussion',
    realApiRatio: 0.6,
    templateRatio: 0.4,
    priority: 'engagement',
    personaWeights: {
      'tech-pioneer-alex': 0.25,
      'business-tycoon-wang': 0.2,
      'artistic-lin': 0.25,
      'trend-master-allen': 0.15,
      'scholar-li': 0.15
    }
  },
  bidding: {
    phase: 'bidding',
    realApiRatio: 0.8,
    templateRatio: 0.2,
    priority: 'drama',
    personaWeights: {
      'tech-pioneer-alex': 0.2,
      'business-tycoon-wang': 0.3,
      'artistic-lin': 0.2,
      'trend-master-allen': 0.2,
      'scholar-li': 0.1
    }
  },
  prediction: {
    phase: 'prediction',
    realApiRatio: 0.4,
    templateRatio: 0.6,
    priority: 'engagement',
    personaWeights: {
      'tech-pioneer-alex': 0.15,
      'business-tycoon-wang': 0.25,
      'artistic-lin': 0.2,
      'trend-master-allen': 0.25,
      'scholar-li': 0.15
    }
  },
  result: {
    phase: 'result',
    realApiRatio: 0.3,
    templateRatio: 0.7,
    priority: 'cost',
    personaWeights: {
      'tech-pioneer-alex': 0.2,
      'business-tycoon-wang': 0.2,
      'artistic-lin': 0.2,
      'trend-master-allen': 0.2,
      'scholar-li': 0.2
    }
  }
};

// 预设对话模板库
export const DIALOGUE_TEMPLATES = {
  warmup: {
    'tech-pioneer-alex': [
      '从技术角度看，这个创意的可实现性很有趣...',
      '我注意到这里有一些算法优化的空间...',
      '技术栈的选择将决定这个项目的成败...'
    ],
    'business-tycoon-wang': [
      '市场前景如何？我需要看到明确的盈利模式...',
      '这个想法不错，但商业化路径在哪里？',
      '投资回报率是我最关心的问题...'
    ]
    // ... 其他角色的模板
  },
  discussion: {
    // 讨论阶段模板
  },
  bidding: {
    // 竞价阶段模板
  }
  // ... 其他阶段
};

export default {
  AI_PERSONAS,
  DISCUSSION_PHASES,
  PHASE_STRATEGIES,
  DIALOGUE_TEMPLATES
};