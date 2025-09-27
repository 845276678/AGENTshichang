// 生产环境配置验证工具
// 确保所有必要的环境变量都已正确设置

export interface EnvironmentConfig {
  // 基础配置
  NODE_ENV: string
  PORT: string
  APP_URL: string

  // 数据库
  DATABASE_URL: string

  // 认证
  JWT_SECRET: string
  JWT_REFRESH_SECRET: string
  NEXTAUTH_SECRET: string
  NEXTAUTH_URL: string

  // AI服务
  DEEPSEEK_API_KEY: string
  DEEPSEEK_BASE_URL: string
  ZHIPU_API_KEY: string
  ZHIPU_BASE_URL: string

  // WebSocket
  WS_PORT?: string

  // Redis (可选但推荐)
  REDIS_URL?: string

  // 阿里云OSS (可选)
  ALIYUN_OSS_ACCESS_KEY_ID?: string
  ALIYUN_OSS_ACCESS_KEY_SECRET?: string
  ALIYUN_OSS_BUCKET?: string
  ALIYUN_OSS_REGION?: string
  ALIYUN_OSS_ENDPOINT?: string

  // 邮件服务 (可选)
  SMTP_HOST?: string
  SMTP_PORT?: string
  SMTP_USER?: string
  SMTP_PASS?: string
  FROM_EMAIL?: string

  // 监控 (可选但推荐)
  SENTRY_DSN?: string
  LOG_LEVEL?: string
}

// 必需的环境变量
const REQUIRED_ENV_VARS = [
  'NODE_ENV',
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'DEEPSEEK_API_KEY',
  'DEEPSEEK_BASE_URL',
  'ZHIPU_API_KEY',
  'ZHIPU_BASE_URL'
] as const

// 推荐的环境变量
const RECOMMENDED_ENV_VARS = [
  'WS_PORT',
  'REDIS_URL',
  'SENTRY_DSN',
  'ALIYUN_OSS_ACCESS_KEY_ID',
  'SMTP_HOST'
] as const

// 验证环境配置
export function validateEnvironment(): {
  isValid: boolean
  missing: string[]
  warnings: string[]
  config: Partial<EnvironmentConfig>
} {
  const missing: string[] = []
  const warnings: string[] = []
  const config: Partial<EnvironmentConfig> = {}

  // 检查必需的环境变量
  for (const varName of REQUIRED_ENV_VARS) {
    const value = process.env[varName]
    if (!value) {
      missing.push(varName)
    } else {
      config[varName] = value
    }
  }

  // 检查推荐的环境变量
  for (const varName of RECOMMENDED_ENV_VARS) {
    const value = process.env[varName]
    if (!value) {
      warnings.push(`推荐设置 ${varName} 以获得更好的功能`)
    } else {
      config[varName] = value
    }
  }

  // 特殊验证
  validateSpecialConfigs(config, warnings)

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
    config
  }
}

// 特殊配置验证
function validateSpecialConfigs(config: Partial<EnvironmentConfig>, warnings: string[]) {
  // JWT密钥长度验证
  if (config.JWT_SECRET && config.JWT_SECRET.length < 32) {
    warnings.push('JWT_SECRET 长度应至少32个字符以确保安全性')
  }

  // 数据库URL格式验证
  if (config.DATABASE_URL && !config.DATABASE_URL.startsWith('postgresql://')) {
    warnings.push('DATABASE_URL 应为PostgreSQL连接字符串')
  }

  // 生产环境检查
  if (config.NODE_ENV === 'production') {
    if (config.NEXTAUTH_URL && !config.NEXTAUTH_URL.startsWith('https://')) {
      warnings.push('生产环境中 NEXTAUTH_URL 应使用 HTTPS')
    }

    if (!config.SENTRY_DSN) {
      warnings.push('生产环境强烈推荐配置 SENTRY_DSN 进行错误监控')
    }

    if (!config.REDIS_URL) {
      warnings.push('生产环境强烈推荐配置 REDIS_URL 提升性能')
    }
  }

  // API密钥格式验证
  if (config.DEEPSEEK_API_KEY && !config.DEEPSEEK_API_KEY.startsWith('sk-')) {
    warnings.push('DEEPSEEK_API_KEY 格式可能不正确')
  }
}

// 打印配置状态
export function printConfigStatus() {
  const { isValid, missing, warnings, config } = validateEnvironment()

  console.log('\n🔧 环境配置检查结果:')
  console.log('========================')

  if (isValid) {
    console.log('✅ 所有必需的环境变量都已设置')
  } else {
    console.log('❌ 缺少必需的环境变量:')
    missing.forEach(varName => {
      console.log(`   - ${varName}`)
    })
  }

  if (warnings.length > 0) {
    console.log('\n⚠️  警告和建议:')
    warnings.forEach(warning => {
      console.log(`   - ${warning}`)
    })
  }

  console.log('\n📊 当前配置概览:')
  console.log('========================')
  console.log(`环境: ${config.NODE_ENV || '未设置'}`)
  console.log(`应用URL: ${config.APP_URL || config.NEXTAUTH_URL || '未设置'}`)
  console.log(`数据库: ${config.DATABASE_URL ? '已配置' : '未配置'}`)
  console.log(`JWT密钥: ${config.JWT_SECRET ? '已配置' : '未配置'}`)
  console.log(`AI服务: ${config.DEEPSEEK_API_KEY && config.ZHIPU_API_KEY ? '已配置' : '部分配置'}`)
  console.log(`WebSocket: ${config.WS_PORT ? `端口 ${config.WS_PORT}` : '使用默认端口 8080'}`)
  console.log(`Redis: ${config.REDIS_URL ? '已配置' : '未配置'}`)
  console.log(`文件存储: ${config.ALIYUN_OSS_ACCESS_KEY_ID ? '阿里云OSS' : '本地存储'}`)
  console.log(`邮件服务: ${config.SMTP_HOST ? '已配置' : '未配置'}`)
  console.log(`错误监控: ${config.SENTRY_DSN ? 'Sentry已配置' : '未配置'}`)

  return { isValid, missing, warnings }
}

// 获取配置建议
export function getConfigurationAdvice(): string[] {
  const advice = [
    '🚀 部署建议:',
    '',
    '1. 必需配置:',
    '   - 确保数据库URL正确且可访问',
    '   - 设置强密码的JWT密钥(至少32字符)',
    '   - 配置AI服务API密钥',
    '',
    '2. 性能优化:',
    '   - 配置Redis提升缓存性能',
    '   - 使用CDN加速静态资源',
    '   - 设置合适的WebSocket端口',
    '',
    '3. 安全性:',
    '   - 生产环境必须使用HTTPS',
    '   - 定期轮换API密钥',
    '   - 配置Sentry监控错误',
    '',
    '4. 功能完整性:',
    '   - 配置阿里云OSS支持文件上传',
    '   - 设置邮件服务发送通知',
    '   - 配置支付接口支持充值',
    '',
    '5. 监控和维护:',
    '   - 设置日志级别为info或warn',
    '   - 配置健康检查端点',
    '   - 监控数据库连接池'
  ]

  return advice
}

export default {
  validateEnvironment,
  printConfigStatus,
  getConfigurationAdvice
}