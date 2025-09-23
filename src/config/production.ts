// 生产环境配置文件
import { z } from 'zod'

const envSchema = z.object({
  // 数据库配置
  DATABASE_URL: z.string().optional(),
  DATABASE_PASSWORD: z.string().optional(),
  REDIS_URL: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),

  // 阿里云配置
  ALIYUN_ACCESS_KEY_ID: z.string().optional(),
  ALIYUN_ACCESS_KEY_SECRET: z.string().optional(),
  ALIYUN_OSS_BUCKET: z.string().optional(),
  ALIYUN_OSS_REGION: z.string().optional(),

  // AI服务配置
  BAIDU_API_KEY: z.string().optional(),
  BAIDU_SECRET_KEY: z.string().optional(),
  ALIBABA_DASHSCOPE_API_KEY: z.string().optional(),
  IFLYTEK_APP_ID: z.string().optional(),
  IFLYTEK_API_SECRET: z.string().optional(),
  TENCENT_SECRET_ID: z.string().optional(),
  TENCENT_SECRET_KEY: z.string().optional(),
  ZHIPU_API_KEY: z.string().optional(),

  // 短信服务
  ALIYUN_SMS_ACCESS_KEY: z.string().optional(),
  ALIYUN_SMS_SECRET: z.string().optional(),

  // 应用配置
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().optional(),
  JWT_SECRET: z.string().optional(),

  // 环境标识
  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
  PORT: z.string().default('3000'),
})

export const env = envSchema.parse(process.env)

// 生产环境配置
export const productionConfig = {
  // 数据库连接池配置
  database: {
    host: 'rm-xxxx.mysql.rds.aliyuncs.com', // RDS内网地址
    port: 3306,
    user: 'aimarket',
    password: env.DATABASE_PASSWORD || 'default_password',
    database: 'aimarket_prod',
    connectionLimit: 20,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
    charset: 'utf8mb4'
  },

  // Redis配置
  redis: {
    host: 'r-xxxx.redis.rds.aliyuncs.com',
    port: 6379,
    password: env.REDIS_PASSWORD || '',
    db: 0,
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100
  },

  // 阿里云OSS配置
  oss: {
    region: 'oss-cn-hangzhou',
    bucket: 'aimarket-prod',
    accessKeyId: env.ALIYUN_ACCESS_KEY_ID || '',
    accessKeySecret: env.ALIYUN_ACCESS_KEY_SECRET || '',
    secure: true
  },

  // AI服务配置
  aiServices: {
    baidu: {
      apiKey: env.BAIDU_API_KEY || '',
      secretKey: env.BAIDU_SECRET_KEY || '',
      endpoint: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions'
    },
    alibaba: {
      apiKey: env.ALIBABA_DASHSCOPE_API_KEY || '',
      endpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation'
    },
    iflytek: {
      appId: env.IFLYTEK_APP_ID || '',
      apiSecret: env.IFLYTEK_API_SECRET || '',
      endpoint: 'https://spark-api.xf-yun.com/v3.1/chat/completions'
    },
    tencent: {
      secretId: env.TENCENT_SECRET_ID || '',
      secretKey: env.TENCENT_SECRET_KEY || '',
      region: 'ap-beijing',
      endpoint: 'hunyuan.tencentcloudapi.com'
    },
    zhipu: {
      apiKey: env.ZHIPU_API_KEY || '',
      endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
    }
  },

  // 短信服务配置
  sms: {
    accessKeyId: env.ALIYUN_SMS_ACCESS_KEY || '',
    secretAccessKey: env.ALIYUN_SMS_SECRET || '',
    signName: 'AI创意市场',
    templateCode: {
      register: 'SMS_123456789',
      login: 'SMS_123456790',
      resetPassword: 'SMS_123456791'
    }
  },

  // 安全配置
  security: {
    jwtSecret: env.JWT_SECRET || 'default-jwt-secret-for-development',
    jwtExpiresIn: '7d',
    bcryptRounds: 12,
    rateLimitWindow: 15 * 60 * 1000, // 15分钟
    rateLimitMax: 100, // 每15分钟最多100次请求
    sessionTimeout: 7 * 24 * 60 * 60 * 1000 // 7天
  },

  // 业务配置
  business: {
    creditsPerYuan: 100, // 1元=100积分
    platformFeeRate: 0.1, // 10%手续费
    minWithdrawAmount: 1000, // 最低提现1000积分
    maxDailyWithdraw: 10000, // 每日最大提现10000积分
    ideaSubmissionCost: 10, // 提交创意消耗10积分
    businessPlanCost: 500 // 生成商业计划消耗500积分
  }
}

// 监控配置
export const monitoringConfig = {
  // 阿里云ARMS监控
  arms: {
    licenseKey: 'xxx',
    appName: 'aimarket-prod'
  },

  // 日志配置
  logging: {
    level: 'info',
    maxFiles: 10,
    maxSize: '20m'
  }
}