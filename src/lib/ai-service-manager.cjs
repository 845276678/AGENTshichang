"use strict";
// AI鏈嶅姟绠＄悊鍣?- 缁熶竴绠＄悊DeepSeek銆佹櫤璋盙LM銆侀€氫箟鍗冮棶
// 瀹炵幇璐熻浇鍧囪　銆侀敊璇鐞嗐€佹垚鏈帶鍒?Object.defineProperty(exports, "__esModule", { value: true });
exports.AIServiceManager = exports.SYSTEM_PROMPTS = void 0;
// AI鏈嶅姟閰嶇疆
const AI_SERVICE_CONFIG = {
    deepseek: {
        name: 'deepseek',
        baseURL: 'https://api.deepseek.com',
        model: 'deepseek-chat',
        rateLimit: 100, // requests per minute
        costPerCall: 0.002, // 姣忔璋冪敤鎴愭湰(鍏?
        personas: ['tech-pioneer-alex', 'investment-advisor-ivan'] // 鑹惧厠鏂拰鏉庡崥浣跨敤deepseek
    },
    zhipu: {
        name: 'zhipu',
        baseURL: 'https://open.bigmodel.cn/api/paas/v4',
        model: 'glm-4',
        rateLimit: 60,
        costPerCall: 0.003,
        personas: ['business-guru-beta', 'innovation-mentor-charlie'] // 鑰佺帇鍜屽皬鐞充娇鐢ㄦ櫤璋?    },
    qwen: {
        name: 'qwen',
        baseURL: 'https://dashscope.aliyuncs.com/api/v1',
        model: 'qwen-max',
        rateLimit: 80,
        costPerCall: 0.0025,
        personas: ['market-insight-delta'] // 闃夸鸡浣跨敤閫氫箟鍗冮棶
    }
};
// 绯荤粺鎻愮ず璇嶆ā鏉?- 浣跨敤澧炲己鐗?涓鑹?exports.SYSTEM_PROMPTS = {
    'business-guru-beta': `
浣犳槸鑰佺帇锛?0宀侊紝涓滃寳浜猴紝鐧芥墜璧峰鐨勫晢涓氬ぇ浜紝浠庢憜鍦版憡鍋氬埌涓婂競鍏徃鑰佹澘銆?浣犵殑鐗圭偣锛?- 鑳屾櫙锛氫笢鍖椾汉锛岃崏鏍瑰垱涓氾紝瀹炴垬娲句紒涓氬
- 鍙ｅご绂咃細"鍋氱敓鎰忓氨涓€涓瓧锛氳禋锛?銆?鍝庡憖濡堝憖"銆?灏忕惓浣犲埆鎬绘槸璇楀拰杩滄柟"
- 璇磋瘽椋庢牸锛氫笢鍖楄厰锛岀洿鎺ワ紝鎺ュ湴姘旓紝鐖辩敤澶х櫧璇?- 鍏虫敞鐐癸細鐜伴噾娴併€佺泩鍒╂ā寮忋€佹姇璧勫洖鎶ャ€佹垚鏈帶鍒?- 璇勪及鏍囧噯锛氭竻鏅扮殑鐩堝埄妯″紡銆佷綆鎴愭湰楂樺洖鎶ャ€佺幇閲戞祦蹇€熷洖姝ｃ€佸彲澶嶅埗鍙妯″寲

浣犲鏄撲笌灏忕惓(鐞嗘兂涓讳箟)鍜岃壘鍏嬫柉(鎶€鏈嚦涓?浜х敓鍐茬獊锛屼笌闃夸鸡(钀ラ攢鎬濈淮)鏄洘鍙嬨€?
璇勪及鍒涙剰鏃讹細
1. 棣栧厛鐪嬭兘涓嶈兘璧氶挶锛屽涔呰兘鍥炴湰
2. 璐ㄧ枒杩囦簬鐞嗘兂鍖栫殑鎯虫硶锛?鎯呮€€涓嶈兘褰撻キ鍚冿紒"
3. 寮鸿皟瀹為檯鎿嶄綔锛?鍒暣閭ｄ簺铏氱殑锛屾€庝箞钀藉湴锛?
4. 璇勫垎1-10鍒嗭紝璧氶挶娼滃姏澶х粰楂樺垎锛岀函鐑ч挶缁欎綆鍒?`,
    'tech-pioneer-alex': `
浣犳槸鑹惧厠鏂紝35宀侊紝MIT鍗氬＋锛岀璋峰洖鍥界殑鎶€鏈ぇ鐗涳紝鏈夌偣绀炬亹銆?浣犵殑鐗圭偣锛?- 鑳屾櫙锛歁IT璁＄畻鏈哄崥澹紝鍦ㄨ胺姝屽伐浣滆繃锛屾妧鏈瀬瀹?- 鍙ｅご绂咃細"Talk is cheap, show me the code"銆?Technically speaking..."
- 璇磋瘽椋庢牸锛氫腑鑻卞す鏉傦紝涓撲笟鏈澶氾紝閫昏緫涓ヨ皑锛屼笉鍠勭ぞ浜?- 鍏虫敞鐐癸細鎶€鏈灦鏋勩€佺畻娉曚紭鍖栥€佺郴缁熻璁°€佹妧鏈鍨?- 璇勪及鏍囧噯锛氭湁鎶€鏈垱鏂板拰绐佺牬銆佹妧鏈鍨掗珮銆佺敤鎶€鏈В鍐崇湡闂銆佹灦鏋勪紭闆呭彲鎵╁睍

浣犲鏄撲笌鑰佺帇(鍟嗕笟瀵煎悜)鍜岄樋浼?钀ラ攢涓虹帇)浜х敓鍐茬獊锛屼笌鏉庡崥(瀛︽湳娲?鏄洘鍙嬨€?
璇勪及鍒涙剰鏃讹細
1. 娣卞叆鍒嗘瀽鎶€鏈彲琛屾€у拰澶嶆潅搴?2. 璐ㄧ枒钀ラ攢鐐掍綔锛?闃夸鸡锛宮arketing涓嶈兘cover鎶€鏈痙ebt"
3. 寮鸿皟鎶€鏈繁搴︼細"娌℃湁鎶€鏈姢鍩庢渤鐨勪骇鍝佹病鏈夋湭鏉?
4. 璇勫垎1-10鍒嗭紝鎶€鏈垱鏂版€ч珮缁欓珮鍒嗭紝鎶€鏈惈閲忎綆缁欎綆鍒?`,
    'innovation-mentor-charlie': `
浣犳槸灏忕惓锛?8宀侊紝涓ぎ缇庨櫌姣曚笟锛岀孩鐐硅璁″寰椾富锛岀悊鎯充富涔夎€呫€?浣犵殑鐗圭偣锛?- 鑳屾櫙锛氳壓鏈笘瀹讹紝涓ぎ缇庨櫌瑙嗚浼犺揪涓撲笟锛岃幏杩囧浗闄呰璁″ぇ濂?- 鍙ｅご绂咃細"濂界殑浜у搧瑕佹湁娓╁害锛岃兘鎵撳姩浜哄績"銆?缇庢槸鐢熶骇鍔?
- 璇磋瘽椋庢牸锛氭劅鎬э紝娓╂煍锛屽瘜鏈夎瘲鎰忥紝娉ㄩ噸鎯呮劅琛ㄨ揪
- 鍏虫敞鐐癸細鐢ㄦ埛浣撻獙銆佷骇鍝佺編鎰熴€佸搧鐗屼环鍊笺€佺ぞ浼氭剰涔?- 璇勪及鏍囧噯锛氳В鍐崇湡瀹炵敤鎴风棝鐐广€佽璁′紭闆呬綋楠屾祦鐣呫€佹湁绀句細浠峰€笺€佽兘寮曡捣鎯呮劅鍏遍福

浣犲鏄撲笌鑰佺帇(鍔熷埄涓讳箟)鍜岄樋浼?杩界儹鐐?浜х敓鍐茬獊锛屼笌鏉庡崥(浜烘枃鍏虫€€)鏄洘鍙嬨€?
璇勪及鍒涙剰鏃讹細
1. 寮鸿皟鐢ㄦ埛浣撻獙鍜屾儏鎰熶环鍊?2. 鍙嶉┏鍔熷埄瑙傜偣锛?鑰佺帇浣犲氨鐭ラ亾閽遍挶閽憋紒浜у搧瑕佹湁鐏甸瓊锛?
3. 鍊″璁捐缇庡锛?鐢ㄦ埛浣撻獙鎵嶆槸鏍稿績绔炰簤鍔?
4. 璇勫垎1-10鍒嗭紝鐢ㄦ埛浣撻獙濂戒笖鏈夋俯搴︾粰楂樺垎锛岀函閫愬埄缁欎綆鍒?`,
    'market-insight-delta': `
浣犳槸闃夸鸡锛?0宀侊紝鍓嶅瓧鑺傝烦鍔ㄨ繍钀ョ粡鐞嗭紝鐜板湪鍋氳嚜濯掍綋锛岀櫨涓囩矇涓濆崥涓汇€?浣犵殑鐗圭偣锛?- 鑳屾櫙锛氫紶濯掑ぇ瀛︽瘯涓氾紝鍦ㄥ瓧鑺傝烦鍔ㄥ仛杩囩垎娆捐繍钀ワ紝鐜板湪鏄綉绾?- 鍙ｅご绂咃細"娴侀噺瀵嗙爜琚垜鎵惧埌浜嗭紒"銆?瀹朵汉浠?銆?Z涓栦唬灏卞悆杩欎竴濂?
- 璇磋瘽椋庢牸锛氱綉缁滅敤璇锛岃拷鐑偣锛岃妭濂忓揩锛屾噦骞磋交浜?- 鍏虫敞鐐癸細娴侀噺杩愯惀銆佺垎娆炬墦閫犮€佺梾姣掍紶鎾€佺ぞ浜よ鍙?- 璇勪及鏍囧噯锛氳俯涓儹鐐硅秼鍔裤€佹湁鐥呮瘨浼犳挱娼滃姏銆佺洰鏍囩敤鎴锋槸骞磋交浜恒€佸鏄撳埗閫犺瘽棰?
浣犲鏄撲笌鏉庡崥(瀛︽湳娲?鍜屽皬鐞?鍝佽川娲?浜х敓鍐茬獊锛屼笌鑰佺帇(鍟嗕笟鎬濈淮)鏄洘鍙嬨€?
璇勪及鍒涙剰鏃讹細
1. 鍒嗘瀽娴侀噺娼滃姏鍜屼紶鎾环鍊?2. 寮鸿皟钀ラ攢閲嶈鎬э細"鑹惧厠鏂紝閰掗涔熸€曞贩瀛愭繁锛?
3. 杩介€愮儹鐐癸細"鏉庡崥鏁欐巿锛屽競鍦轰笉绛変汉锛岃蹇紒"
4. 璇勫垎1-10鍒嗭紝鏈夌垎娆炬綔鍔涚粰楂樺垎锛屽お灏忎紬缁欎綆鍒?`,
    'investment-advisor-ivan': `
浣犳槸鏉庡崥锛?5宀侊紝娓呭崕鏁欐巿锛屾í璺ㄧ粡娴庡銆佸績鐞嗗銆佺ぞ浼氬澶氫釜棰嗗煙銆?浣犵殑鐗圭偣锛?- 鑳屾櫙锛氭竻鍗庡ぇ瀛︾粓韬暀鎺堬紝鍝堜經璁块棶瀛﹁€咃紝澶氫釜棰嗗煙涓撳
- 鍙ｅご绂咃細"璁╂垜浠敤瀛︽湳鐨勭溂鍏夌湅闂"銆?鏍规嵁鎴戠殑鐮旂┒..."銆?鍘嗗彶鍛婅瘔鎴戜滑..."
- 璇磋瘽椋庢牸锛氫弗璋紝寮曠粡鎹吀锛岄€昏緫缂滃瘑锛岀埍璁查亾鐞?- 鍏虫敞鐐癸細鐞嗚鍩虹銆侀暱鏈熶环鍊笺€侀闄╄瘎浼般€佸彲鎸佺画鍙戝睍
- 璇勪及鏍囧噯锛氶€昏緫鑷唇璁鸿瘉鍏呭垎銆佹湁鐞嗚鏀拺銆侀闄╁彲鎺с€侀暱鏈熶环鍊兼槑纭?
浣犲鏄撲笌闃夸鸡(鐭)浜х敓鍐茬獊锛屼笌鑹惧厠鏂?涓ヨ皑)鍜屽皬鐞?娣卞害)鏄洘鍙嬨€?
璇勪及鍒涙剰鏃讹細
1. 鐢ㄥ鏈悊璁哄垎鏋愬彲琛屾€?2. 鎻愰啋闀挎湡椋庨櫓锛?闃夸鸡锛屾祦琛屾槸鏆傛椂鐨勶紝瑙勫緥鏄案鎭掔殑"
3. 寮鸿皟娣卞害鎬濊€冿細"瑕侀€忚繃鐜拌薄鐪嬫湰璐?
4. 璇勫垎1-10鍒嗭紝鐞嗚鎵庡疄闀挎湡浠峰€奸珮缁欓珮鍒嗭紝閫昏緫鏈夋紡娲炵粰浣庡垎
`
};
// AI鏈嶅姟绠＄悊鍣ㄧ被
class AIServiceManager {
    constructor() {
        this.providers = new Map();
        this.rateLimiters = new Map();
        this.healthStatus = new Map();
        this.initializeProviders();
    }
    initializeProviders() {
        Object.entries(AI_SERVICE_CONFIG).forEach(([key, config]) => {
            // 鐜鍙橀噺鍚嶆槧灏?            const envKeyMap = {
                'deepseek': 'DEEPSEEK_API_KEY',
                'zhipu': 'ZHIPU_API_KEY',
                'qwen': 'DASHSCOPE_API_KEY' // 閫氫箟鍗冮棶浣跨敤DASHSCOPE_API_KEY
            };
            this.providers.set(key, {
                name: config.name,
                apiKey: process.env[envKeyMap[key]] || process.env[`${key.toUpperCase()}_API_KEY`] || '',
                baseURL: config.baseURL,
                rateLimit: config.rateLimit,
                costPerCall: config.costPerCall
            });
            this.rateLimiters.set(key, new RateLimiter(config.rateLimit));
            this.healthStatus.set(key, true);
        });
    }
    // 璋冪敤鍗曚釜AI鏈嶅姟
    async callSingleService(request) {
        const provider = this.providers.get(request.provider);
        if (!provider) {
            throw new Error(`Unknown AI provider: ${request.provider}`);
        }
        // 妫€鏌ラ€熺巼闄愬埗
        const rateLimiter = this.rateLimiters.get(request.provider);
        if (!rateLimiter.canMakeRequest()) {
            throw new Error(`Rate limit exceeded for ${request.provider}`);
        }
        // 妫€鏌ユ湇鍔″仴搴风姸鎬?        if (!this.healthStatus.get(request.provider)) {
            throw new Error(`Service ${request.provider} is currently unavailable`);
        }
        try {
            const response = await this.makeAPICall(provider, request);
            rateLimiter.recordRequest();
            return response;
        }
        catch (error) {
            console.error(`AI service call failed for ${request.provider}:`, error);
            this.healthStatus.set(request.provider, false);
            // 5鍒嗛挓鍚庨噸鏂版爣璁颁负鍋ュ悍
            setTimeout(() => {
                this.healthStatus.set(request.provider, true);
            }, 5 * 60 * 1000);
            throw error;
        }
    }
    // 璋冪敤澶氫釜AI鏈嶅姟
    async callMultipleServices(providers, context) {
        const requests = providers.map(provider => {
            const persona = this.getPersonaForProvider(provider, context);
            return {
                provider: provider,
                persona,
                context,
                systemPrompt: exports.SYSTEM_PROMPTS[persona],
                temperature: 0.7,
                maxTokens: 500
            };
        });
        const results = await Promise.allSettled(requests.map(request => this.callSingleService(request)));
        const responses = [];
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                responses.push(result.value);
            }
            else {
                console.error(`AI service call failed for ${providers[index]}:`, result.reason);
                // 娣诲姞澶囩敤鍝嶅簲
                responses.push(this.getFallbackResponse(providers[index], context));
            }
        });
        return responses;
    }
    async makeAPICall(provider, request) {
        const startTime = Date.now();
        let response;
        switch (provider.name) {
            case 'deepseek':
                response = await this.callDeepSeek(provider, request);
                break;
            case 'zhipu':
                response = await this.callZhipu(provider, request);
                break;
            case 'qwen':
                response = await this.callQwen(provider, request);
                break;
            default:
                throw new Error(`Unsupported provider: ${provider.name}`);
        }
        return {
            provider: provider.name,
            content: response.content,
            reasoning: response.reasoning,
            confidence: response.confidence || 0.8,
            tokens_used: response.tokens_used || 0,
            cost: provider.costPerCall,
            timestamp: Date.now()
        };
    }
    async callDeepSeek(provider, request) {
        var _a;
        const response = await fetch(`${provider.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${provider.apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: request.systemPrompt
                    },
                    {
                        role: 'user',
                        content: this.buildUserPrompt(request.context)
                    }
                ],
                temperature: request.temperature,
                max_tokens: request.maxTokens
            })
        });
        if (!response.ok) {
            throw new Error(`DeepSeek API error: ${response.statusText}`);
        }
        const data = await response.json();
        return {
            content: data.choices[0].message.content,
            tokens_used: ((_a = data.usage) === null || _a === void 0 ? void 0 : _a.total_tokens) || 0
        };
    }
    async callZhipu(provider, request) {
        var _a;
        const response = await fetch(`${provider.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${provider.apiKey}`
            },
            body: JSON.stringify({
                model: 'glm-4',
                messages: [
                    {
                        role: 'system',
                        content: request.systemPrompt
                    },
                    {
                        role: 'user',
                        content: this.buildUserPrompt(request.context)
                    }
                ],
                temperature: request.temperature,
                max_tokens: request.maxTokens
            })
        });
        if (!response.ok) {
            throw new Error(`Zhipu API error: ${response.statusText}`);
        }
        const data = await response.json();
        return {
            content: data.choices[0].message.content,
            tokens_used: ((_a = data.usage) === null || _a === void 0 ? void 0 : _a.total_tokens) || 0
        };
    }
    async callQwen(provider, request) {
        var _a;
        const response = await fetch(`${provider.baseURL}/services/aigc/text-generation/generation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${provider.apiKey}`
            },
            body: JSON.stringify({
                model: 'qwen-max',
                input: {
                    messages: [
                        {
                            role: 'system',
                            content: request.systemPrompt
                        },
                        {
                            role: 'user',
                            content: this.buildUserPrompt(request.context)
                        }
                    ]
                },
                parameters: {
                    temperature: request.temperature,
                    max_tokens: request.maxTokens
                }
            })
        });
        if (!response.ok) {
            throw new Error(`Qwen API error: ${response.statusText}`);
        }
        const data = await response.json();
        return {
            content: data.output.text,
            tokens_used: ((_a = data.usage) === null || _a === void 0 ? void 0 : _a.total_tokens) || 0
        };
    }
    buildUserPrompt(context) {
        let prompt = `鍒涙剰鍐呭锛?{context.ideaContent}\n`;
        prompt += `褰撳墠闃舵锛?{context.phase}\n`;
        if (context.trigger) {
            prompt += `瑙﹀彂浜嬩欢锛?{context.trigger}\n`;
        }
        if (context.round) {
            prompt += `杞锛?{context.round}\n`;
        }
        if (context.creativityScore) {
            prompt += `鍒涙剰璇勫垎锛?{context.creativityScore}/100\n`;
        }
        if (context.userFeedback) {
            prompt += `鐢ㄦ埛鍙嶉锛?{context.userFeedback}\n`;
        }
        if (context.previousContext && context.previousContext.length > 0) {
            prompt += `涔嬪墠鐨勫璇濓細\n${context.previousContext.join('\n')}\n`;
        }
        if (context.currentBids && Object.keys(context.currentBids).length > 0) {
            prompt += `褰撳墠绔炰环鎯呭喌锛歕n`;
            Object.entries(context.currentBids).forEach(([personaId, bid]) => {
                prompt += `${personaId}: ${bid}鍏僜n`;
            });
        }
        // 鏍规嵁闃舵璋冩暣鎻愮ず
        if (context.phase === 'warmup') {
            prompt += '\n璇风畝鐭粙缁嶄綘鑷繁锛屽苟瀵硅繖涓垱鎰忕粰鍑虹涓€鍗拌薄銆備繚鎸佽鑹茬壒鑹诧紝涓嶈秴杩?50瀛椼€?;
        }
        else if (context.phase === 'discussion') {
            prompt += '\n璇蜂粠浣犵殑涓撲笟瑙掑害娣卞叆鍒嗘瀽杩欎釜鍒涙剰鐨勪紭缂虹偣銆傚彲浠ユ彁鍑洪棶棰樻垨涓庡叾浠栦笓瀹剁殑瑙傜偣杩涜浜掑姩銆?;
        }
        else if (context.phase === 'bidding') {
            prompt += '\n璇风粰鍑轰綘瀵硅繖涓垱鎰忕殑鍏蜂綋绔炰环閲戦锛?0-500鍏冧箣闂达級锛屽苟璇︾粏璇存槑鐞嗙敱銆傛牸寮忥細鎴戝嚭浠稾鍏冿紝鍥犱负...';
        }
        else {
            prompt += '\n璇锋牴鎹綘鐨勪笓涓氳鑹诧紝瀵硅繖涓垱鎰忚繘琛岃瘎浠峰拰鍒嗘瀽銆?;
        }
        return prompt;
    }
    getPersonaForProvider(provider, context) {
        const config = AI_SERVICE_CONFIG[provider];
        if (config && config.personas.length > 0) {
            // 绠€鍗曡疆璇㈤€夋嫨锛屽彲浠ユ牴鎹渶瑕佸疄鐜版洿澶嶆潅鐨勯€夋嫨閫昏緫
            const index = context.round % config.personas.length;
            return config.personas[index];
        }
        return 'tech-pioneer-alex'; // 榛樿瑙掕壊
    }
    getFallbackResponse(provider, context) {
        return {
            provider,
            content: '鎶辨瓑锛屾垜鐜板湪鏈変簺鎶€鏈棶棰橈紝绋嶅悗鍐嶆潵鍒嗘瀽杩欎釜鍒涙剰...',
            confidence: 0.1,
            tokens_used: 0,
            cost: 0,
            timestamp: Date.now()
        };
    }
    // 鑾峰彇鏈嶅姟鍋ュ悍鐘舵€?    getServiceHealth() {
        const health = {};
        this.healthStatus.forEach((status, provider) => {
            health[provider] = status;
        });
        return health;
    }
    // 鑾峰彇褰撳墠鎴愭湰缁熻
    getCurrentCosts() {
        const costs = {};
        this.providers.forEach((provider, name) => {
            costs[name] = provider.costPerCall;
        });
        return costs;
    }
}
exports.AIServiceManager = AIServiceManager;
// 閫熺巼闄愬埗鍣?class RateLimiter {
    constructor(limit) {
        this.requests = [];
        this.limit = limit;
    }
    canMakeRequest() {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        // 娓呯悊杩囨湡鐨勮姹傝褰?        this.requests = this.requests.filter(time => time > oneMinuteAgo);
        return this.requests.length < this.limit;
    }
    recordRequest() {
        this.requests.push(Date.now());
    }
}
exports.default = AIServiceManager;
