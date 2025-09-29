"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DIALOGUE_TEMPLATES = exports.PHASE_STRATEGIES = exports.DISCUSSION_PHASES = exports.AI_PERSONAS = void 0;
exports.AI_PERSONAS = [
    {
        id: 'tech-pioneer-alex',
        name: '科技先锋艾克斯',
        avatar: '/xiaoxiaang/艾克斯.png', // 使用真实头像图片
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
        id: 'business-guru-beta', // 修改为与服务器端匹配的ID
        name: '商业智囊贝塔', // 修改名称，去掉"老王"避免与真实人物关联
        avatar: '/xiaoxiaang/老王.png', // 使用真实头像图片
        personality: ['结果导向', '商业敏锐', '决策果断', '盈利至上'],
        specialty: '盈利模型、风险评估、商业策略',
        catchPhrase: '数据驱动决策，价值创造未来！', // 修改口号，去掉"战场"等激进词汇
        primaryModel: 'qwen',
        backupModel: 'zhipu',
        triggerKeywords: ['盈利', 'ROI', '现金流', '商业', '市场', '竞争'],
        voiceStyle: 'authoritative',
        biddingStyle: 'aggressive'
    },
    {
        id: 'innovation-mentor-charlie', // 修改为与服务器端匹配的ID
        name: '创新导师查理', // 修改名称以匹配服务器端
        avatar: '/xiaoxiaang/小琳.png', // 使用真实头像图片
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
        id: 'market-insight-delta', // 修改为与服务器端匹配的ID
        name: '市场洞察黛拉', // 修改名称以匹配服务器端
        avatar: '/xiaoxiaang/阿伦.png', // 使用真实头像图片
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
        id: 'investment-advisor-ivan', // 修改为与服务器端匹配的ID
        name: '投资顾问伊万', // 修改名称以匹配服务器端
        avatar: '/xiaoxiaang/李博.png', // 使用真实头像图片
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
exports.DISCUSSION_PHASES = [
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
exports.PHASE_STRATEGIES = {
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
exports.DIALOGUE_TEMPLATES = {
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
exports.default = {
    AI_PERSONAS: exports.AI_PERSONAS,
    DISCUSSION_PHASES: exports.DISCUSSION_PHASES,
    PHASE_STRATEGIES: exports.PHASE_STRATEGIES,
    DIALOGUE_TEMPLATES: exports.DIALOGUE_TEMPLATES
};
