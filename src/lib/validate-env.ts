// 环境变量验证模块
// 在应用启动时验证必需的环境变量

interface ValidationResult {
  valid: boolean
  missing: string[]
  warnings: string[]
}

// 必需的环境变量
const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'JWT_SECRET',
  'NEXTAUTH_SECRET',
] as const

// AI服务环境变量（至少需要一个）
const AI_SERVICE_VARS = [
  'DEEPSEEK_API_KEY',
  'ZHIPU_API_KEY',
  'DASHSCOPE_API_KEY',
] as const

// 推荐配置的环境变量
const RECOMMENDED_ENV_VARS = [
  'NEXT_PUBLIC_WS_HOST',
  'BUSINESS_PLAN_SESSION_TTL_HOURS',
  'BUSINESS_PLAN_CREDIT_COST',
] as const

/**
 * 验证环境变量配置
 */
export function validateEnvironment(): ValidationResult {
  const missing: string[] = []
  const warnings: string[] = []

  // 检查必需变量
  for (const varName of REQUIRED_ENV_VARS) {
    if (!process.env[varName]) {
      missing.push(varName)
    }
  }

  // 检查 AI 服务密钥（至少需要一个）
  const hasAnyAIService = AI_SERVICE_VARS.some(varName => !!process.env[varName])
  if (!hasAnyAIService) {
    missing.push('至少一个AI服务API密钥 (DEEPSEEK_API_KEY, ZHIPU_API_KEY, 或 DASHSCOPE_API_KEY)')
  }

  // 检查推荐变量
  for (const varName of RECOMMENDED_ENV_VARS) {
    if (!process.env[varName]) {
      warnings.push(`建议配置 ${varName}`)
    }
  }

  // 检查JWT密钥强度
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    warnings.push('JWT_SECRET 长度应至少32位以确保安全')
  }

  if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
    warnings.push('NEXTAUTH_SECRET 长度应至少32位以确保安全')
  }

  // 生产环境额外检查
  if (process.env.NODE_ENV === 'production') {
    // 检查数据库URL是否使用SSL
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('sslmode=require')) {
      warnings.push('生产环境建议数据库连接使用SSL (sslmode=require)')
    }

    // 检查是否配置了WebSocket host
    if (!process.env.NEXT_PUBLIC_WS_HOST) {
      warnings.push('生产环境建议明确配置 NEXT_PUBLIC_WS_HOST')
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings
  }
}

/**
 * 验证AI服务配置
 */
export function validateAIServices(): {
  deepseek: boolean
  zhipu: boolean
  qwen: boolean
  available: number
} {
  return {
    deepseek: !!process.env.DEEPSEEK_API_KEY,
    zhipu: !!process.env.ZHIPU_API_KEY,
    qwen: !!process.env.DASHSCOPE_API_KEY,
    available: [
      process.env.DEEPSEEK_API_KEY,
      process.env.ZHIPU_API_KEY,
      process.env.DASHSCOPE_API_KEY
    ].filter(Boolean).length
  }
}

/**
 * 打印验证结果到控制台
 */
export function printValidationResult(result: ValidationResult): void {
  if (result.valid) {
    console.log('✅ Environment validation passed')
  } else {
    console.error('❌ Environment validation failed')
    console.error('Missing required environment variables:')
    result.missing.forEach(varName => {
      console.error(`  - ${varName}`)
    })
  }

  if (result.warnings.length > 0) {
    console.warn('⚠️  Environment warnings:')
    result.warnings.forEach(warning => {
      console.warn(`  - ${warning}`)
    })
  }

  // 打印AI服务状态
  const aiStatus = validateAIServices()
  console.log(`\n🤖 AI Services Status: ${aiStatus.available}/3 configured`)
  console.log(`  - DeepSeek: ${aiStatus.deepseek ? '✅' : '❌'}`)
  console.log(`  - 智谱GLM: ${aiStatus.zhipu ? '✅' : '❌'}`)
  console.log(`  - 通义千问: ${aiStatus.qwen ? '✅' : '❌'}`)
}

/**
 * 验证并在失败时抛出错误（用于启动时检查）
 */
export function validateOrThrow(): void {
  const result = validateEnvironment()
  printValidationResult(result)

  if (!result.valid) {
    throw new Error(
      `Environment validation failed. Missing: ${result.missing.join(', ')}`
    )
  }

  const aiStatus = validateAIServices()
  if (aiStatus.available === 0) {
    throw new Error(
      'No AI services configured. Please set at least one of: DEEPSEEK_API_KEY, ZHIPU_API_KEY, DASHSCOPE_API_KEY'
    )
  }

  console.log('✅ All environment checks passed\n')
}
