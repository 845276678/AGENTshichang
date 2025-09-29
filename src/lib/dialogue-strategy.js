"use strict";
// 混合对话策略系统
// 结合真实AI调用和预设剧本，优化成本和性能
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CostTracker = exports.DialogueDecisionEngine = exports.HYBRID_DIALOGUE_STRATEGY = void 0;
const template_manager_1 = __importDefault(require("./template-manager"));
const ai_service_manager_1 = __importDefault(require("./ai-service-manager"));
// 混合对话策略配置
exports.HYBRID_DIALOGUE_STRATEGY = {
    // 真实AI调用的关键节点
    real_ai_calls: [
        {
            trigger: 'creativity_evaluation',
            phase: 'discussion',
            description: '创意评估分析',
            ai_services: ['deepseek', 'zhipu', 'qwen'],
            priority: 'high',
            cost_weight: 0.6
        },
        {
            trigger: 'improvement_suggestions',
            phase: 'discussion',
            description: '改进建议生成',
            ai_services: ['specific_to_persona'],
            priority: 'high',
            cost_weight: 0.3
        },
        {
            trigger: 'final_bidding_decision',
            phase: 'bidding',
            description: '最终竞价决策',
            ai_services: ['all_personas'],
            priority: 'high',
            cost_weight: 0.8
        },
        {
            trigger: 'creative_enhancement_analysis',
            phase: 'discussion',
            description: '创意完善分析',
            ai_services: ['contextual'],
            priority: 'medium',
            cost_weight: 0.4
        }
    ],
    // 预设剧本的对话场景
    scripted_content: [
        {
            trigger: 'opening_introductions',
            phase: 'warmup',
            description: '开场介绍',
            templates: 'personality_based',
            priority: 'medium'
        },
        {
            trigger: 'personality_interactions',
            phase: 'warmup',
            description: '个性化互动',
            templates: 'interaction_based',
            priority: 'low'
        },
        {
            trigger: 'transition_segments',
            phase: 'all',
            description: '过渡片段',
            templates: 'phase_transition',
            priority: 'low'
        },
        {
            trigger: 'competitive_banter',
            phase: 'bidding',
            description: '竞价互怼',
            templates: 'competitive_dialogue',
            priority: 'medium'
        },
        {
            trigger: 'celebration_sequences',
            phase: 'result',
            description: '庆祝环节',
            templates: 'victory_celebration',
            priority: 'low'
        }
    ],
    // 成本控制配置
    cost_control: {
        daily_budget: 100, // 每日API调用预算(元)
        session_limit: 10, // 单会话最大API调用次数
        user_cooldown: 300, // 用户冷却时间(秒)
        fallback_threshold: 0.9 // 预算使用阈值，超过后使用预设内容
    }
};
// AI服务调用决策引擎
class DialogueDecisionEngine {
    constructor() {
        this.costTracker = new CostTracker();
        this.templateManager = new template_manager_1.default();
        this.aiServiceManager = new ai_service_manager_1.default();
    }
    async generateDialogue(context) {
        const strategy = this.determineStrategy(context);
        switch (strategy.type) {
            case 'real_ai':
                return await this.generateRealAIDialogue(context, strategy);
            case 'scripted':
                return this.generateScriptedDialogue(context, strategy);
            case 'hybrid':
                return await this.generateHybridDialogue(context, strategy);
            default:
                return this.generateFallbackDialogue(context);
        }
    }
    determineStrategy(context) {
        // 检查是否为关键节点
        const isKeyMoment = exports.HYBRID_DIALOGUE_STRATEGY.real_ai_calls.some(call => call.trigger === context.trigger && call.phase === context.phase);
        // 检查成本预算
        const budgetExceeded = this.costTracker.isOverBudget();
        // 检查用户冷却时间
        const inCooldown = this.costTracker.isUserInCooldown(context.userId);
        if (isKeyMoment && !budgetExceeded && !inCooldown) {
            return { type: 'real_ai', trigger: context.trigger, priority: 'high', cost_impact: 0.8 };
        }
        else if (isKeyMoment) {
            // 关键节点但预算限制，使用混合模式
            return { type: 'hybrid', trigger: context.trigger, priority: 'medium', cost_impact: 0.3 };
        }
        else {
            return { type: 'scripted', trigger: context.trigger, priority: 'low', cost_impact: 0 };
        }
    }
    async generateRealAIDialogue(context, strategy) {
        try {
            const aiCall = exports.HYBRID_DIALOGUE_STRATEGY.real_ai_calls.find(call => call.trigger === context.trigger);
            if (!aiCall) {
                return this.generateFallbackDialogue(context);
            }
            // 根据配置调用相应的AI服务
            const responses = await this.aiServiceManager.callMultipleServices(aiCall.ai_services, context);
            // 记录成本
            this.costTracker.recordAPICall(context.userId, aiCall.cost_weight);
            return {
                type: 'real_ai',
                content: this.convertToDialogueContent(responses),
                metadata: {
                    ai_services_used: aiCall.ai_services,
                    cost: aiCall.cost_weight,
                    timestamp: Date.now()
                }
            };
        }
        catch (error) {
            console.error('Real AI dialogue generation failed:', error);
            return this.generateFallbackDialogue(context);
        }
    }
    generateScriptedDialogue(context, strategy) {
        const scriptConfig = exports.HYBRID_DIALOGUE_STRATEGY.scripted_content.find(script => script.trigger === context.trigger);
        if (!scriptConfig) {
            return this.generateFallbackDialogue(context);
        }
        const dialogueContent = this.templateManager.generateFromTemplate(scriptConfig.templates, context);
        return {
            type: 'scripted',
            content: dialogueContent,
            metadata: {
                template_used: scriptConfig.templates,
                cost: 0,
                timestamp: Date.now()
            }
        };
    }
    async generateHybridDialogue(context, strategy) {
        // 混合模式：关键分析用AI，对话装饰用模板
        const keyInsights = await this.generateKeyInsights(context);
        const decorativeDialogue = this.generateScriptedDialogue(context, strategy);
        return {
            type: 'hybrid',
            content: this.mergeContent(keyInsights, decorativeDialogue.content),
            metadata: {
                ai_insights: true,
                template_decoration: true,
                cost: strategy.cost_impact,
                timestamp: Date.now()
            }
        };
    }
    // 添加缺失的方法
    async generateKeyInsights(context) {
        try {
            const responses = await this.aiServiceManager.callMultipleServices(['deepseek'], // 使用一个服务获取关键洞察
            context);
            return this.convertToDialogueContent(responses);
        }
        catch (error) {
            console.error('Failed to generate key insights:', error);
            return [];
        }
    }
    mergeContent(keyInsights, decorativeContent) {
        return [...keyInsights, ...decorativeContent];
    }
    convertToDialogueContent(responses) {
        return responses.map((response, index) => ({
            agentId: `agent-${index}`,
            agentName: response.provider,
            content: response.content,
            emotion: 'neutral',
            animation: 'speaking',
            reasoning: response.reasoning,
            timestamp: response.timestamp
        }));
    }
    generateFallbackDialogue(context) {
        return {
            type: 'scripted',
            content: this.templateManager.getFallbackDialogue(context),
            metadata: {
                fallback: true,
                cost: 0,
                timestamp: Date.now()
            }
        };
    }
}
exports.DialogueDecisionEngine = DialogueDecisionEngine;
// 成本追踪器
class CostTracker {
    constructor() {
        this.dailyUsage = new Map();
        this.userCooldowns = new Map();
        this.sessionCounts = new Map();
    }
    recordAPICall(userId, cost) {
        const today = this.getTodayKey();
        const currentUsage = this.dailyUsage.get(today) || 0;
        this.dailyUsage.set(today, currentUsage + cost);
        const userSessions = this.sessionCounts.get(userId) || 0;
        this.sessionCounts.set(userId, userSessions + 1);
        // 设置用户冷却时间
        this.userCooldowns.set(userId, Date.now() + exports.HYBRID_DIALOGUE_STRATEGY.cost_control.user_cooldown * 1000);
    }
    isOverBudget() {
        const today = this.getTodayKey();
        const usage = this.dailyUsage.get(today) || 0;
        return usage >= exports.HYBRID_DIALOGUE_STRATEGY.cost_control.daily_budget * exports.HYBRID_DIALOGUE_STRATEGY.cost_control.fallback_threshold;
    }
    isUserInCooldown(userId) {
        const cooldownEnd = this.userCooldowns.get(userId) || 0;
        return Date.now() < cooldownEnd;
    }
    getUserSessionCount(userId) {
        return this.sessionCounts.get(userId) || 0;
    }
    getTodayKey() {
        return new Date().toISOString().split('T')[0];
    }
}
exports.CostTracker = CostTracker;
exports.default = DialogueDecisionEngine;
