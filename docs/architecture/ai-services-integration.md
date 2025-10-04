# AI 服务集成手册（2025-Q4）

> 当前生产环境仅集成 **DeepSeek**、**智谱 GLM**、**通义千问（DashScope）** 三家国内模型服务。

## 1. 服务对比
| 服务 | AIProvider | 典型用途 | SDK/文档 |
|------|--------------|----------|----------|
| DeepSeek | DEEPSEEK | 竞价 persona（Alex、Ivan）、商业计划场景分析、商业模式/Investor Pitch | [https://platform.deepseek.com/docs](https://platform.deepseek.com/docs) |
| 智谱 GLM | ZHIPU | 竞价备份模型、MVP/实施/风险阶段、中文结构化长文输出 | [https://open.bigmodel.cn/dev/api](https://open.bigmodel.cn/dev/api) |
| 通义千问 DashScope | ALI | 市场调研、运营执行、财务规划、竞价营销 persona | [https://help.aliyun.com/dashscope/](https://help.aliyun.com/dashscope/) |

## 2. 密钥申请与配额
### DeepSeek
1. 访问 [https://platform.deepseek.com/](https://platform.deepseek.com/) 注册账号。
2. 完成企业/个人实名认证后在 **API Keys** 菜单创建密钥。
3. 控制台支持额度预充与按量计费（deepseek-chat 约 0.014 元/1K tokens，实际以官网为准）。
4. 将密钥写入环境变量 DEEPSEEK_API_KEY。

### 智谱 GLM（BigModel）
1. 登录 [https://open.bigmodel.cn/](https://open.bigmodel.cn/)，创建应用。
2. 复制平台提供的 API Key。
3. 现用模型 glm-4，按量计费，约 0.01 元/1K tokens。
4. 在部署环境设置 ZHIPU_API_KEY。

### 通义千问（DashScope）
1. 进入 [https://dashscope.aliyun.com/](https://dashscope.aliyun.com/) 创建 DashScope 服务。
2. 控制台生成 API Key。
3. 模型 qwen-plus / qwen-max 计费约 0.008~0.012 元/1K tokens。
4. 在环境变量中配置 DASHSCOPE_API_KEY（代码中别名 ALI）。

## 3. 环境变量速查
| 变量 | 说明 | 默认 |
|------|------|------|
| DEEPSEEK_API_KEY | DeepSeek 密钥 | 无（必须配置） |
| ZHIPU_API_KEY | 智谱 GLM 密钥 | 无（必须配置） |
| DASHSCOPE_API_KEY | 通义千问密钥 | 无（必须配置） |
| AI_SERVICE_TIMEOUT_MS | AI 调用超时（毫秒） | 30000 |
| AI_SERVICE_RETRY | 失败重试次数 | 2 |
| AI_COST_TRACKING | 是否记录成本 | 	rue |

## 4. 代码结构
- src/lib/ai-services/index.ts 定义 AIServiceFactory，内部注册 AliTongyiService、ZhipuGLMService、DeepSeekService 三个实现，并暴露健康检查、负载均衡功能。
- src/lib/ai-service-manager.ts 使用 AI_SERVICE_CONFIG 将 persona 映射到具体 provider。
- 商业计划模块（stage-content-generator.ts、practical-stage-generator.ts）通过 AIServiceFactory.getService() 选择模型，无需改动。

`	s
import { AIServiceFactory, AIProvider } from '@/lib/ai-services'

const service = AIServiceFactory.getService(AIProvider.DEEPSEEK)
const result = await service.chat(prompt, { temperature: 0.7, maxTokens: 2048 })
`

## 5. 调用策略建议
- **竞价流程**：DeepSeek 为技术/战略专家首选，智谱作为备份，通义用于营销类 persona。
- **商业计划**：
  - DeepSeek 处理需要推理与综合判断的阶段（场景落地、商业模式、投资材料）。
  - 通义负责市场、运营、财务等需要数据汇总的部分。
  - 智谱提供结构化长文本输出，如实施路线、风险合规。
- 利用 AIServiceFactory.getBalancedService() 在成本与稳定性之间做动态选择。

## 6. 监控与限速
- 建议在调用前后埋点 provider、promptTokens、completionTokens，存入 i_usage_stats 表。
- 三家服务均有 QPS 限制，可在 AIServiceManager 的 RateLimiter 中按需调整：DeepSeek 100 RPM，智谱 60 RPM，通义 80 RPM。
- 若触发限速或超时，AIServiceManager 会将 provider 标记为不可用 5 分钟，期间自动降级到其它服务。

## 7. 常见问题
- **401/403**：检查密钥是否过期、是否绑定公网 IP；通义千问需在控制台开启 API 调用权限。
- **响应为空**：三个服务在命中敏感词时会直接返回空内容，捕获后需要提示用户修改输入。
- **成本监控**：推荐每天导出 i_usage_stats，结合 costPerCall 粗算费用，必要时走官方控制台核对账单。

