// JWT认证和中间件系统
import { NextRequest, NextResponse } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import type { User } from '@prisma/client'

// JWT配置
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
)
const JWT_EXPIRES_IN = '7d'
const REFRESH_TOKEN_EXPIRES_IN = '30d'

// JWT载荷接口
export interface JWTPayload {
  userId: string
  email: string
  role: string
  iat: number
  exp: number
}

// API响应接口
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 认证结果接口
export interface AuthResult {
  user: User
  token: string
  refreshToken: string
}

// 生成JWT Token
export async function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET)

  return jwt
}

// 验证JWT Token
export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as JWTPayload
  } catch (error) {
    throw new Error('Invalid or expired token')
  }
}

// 生成刷新令牌
export async function generateRefreshToken(userId: string): Promise<string> {
  const refreshToken = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRES_IN)
    .sign(JWT_SECRET)

  // 存储到数据库
  await prisma.refreshToken.create({
    data: {
      userId,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30天
    }
  })

  return refreshToken
}

// 密码哈希
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// 密码验证
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// 用户注册
export async function registerUser(userData: {
  email: string
  username: string
  password: string
  firstName?: string
  lastName?: string
}): Promise<AuthResult> {
  const { email, username, password, firstName, lastName } = userData

  // 检查用户是否已存在
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { username }
      ]
    }
  })

  if (existingUser) {
    throw new Error(existingUser.email === email ? '邮箱已被注册' : '用户名已被占用')
  }

  // 创建用户
  const hashedPassword = await hashPassword(password)
  const user = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash: hashedPassword,
      firstName,
      lastName,
      credits: 1000, // 注册赠送1000积分
    }
  })

  // 记录注册奖励
  await prisma.creditTransaction.create({
    data: {
      userId: user.id,
      amount: 1000,
      type: 'REGISTER_BONUS',
      description: '注册奖励',
      balanceBefore: 0,
      balanceAfter: 1000
    }
  })

  // 生成令牌
  const token = await generateToken({
    userId: user.id,
    email: user.email,
    role: user.role
  })

  const refreshToken = await generateRefreshToken(user.id)

  return { user, token, refreshToken }
}

// 用户登录
export async function loginUser(email: string, password: string): Promise<AuthResult> {
  // 查找用户
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    throw new Error('用户不存在')
  }

  if (user.status !== 'ACTIVE') {
    throw new Error('账户已被禁用')
  }

  // 验证密码
  const isValidPassword = await verifyPassword(password, user.passwordHash)
  if (!isValidPassword) {
    throw new Error('密码错误')
  }

  // 更新最后登录时间
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  })

  // 生成令牌
  const token = await generateToken({
    userId: user.id,
    email: user.email,
    role: user.role
  })

  const refreshToken = await generateRefreshToken(user.id)

  return { user, token, refreshToken }
}

// 获取当前用户
export async function getCurrentUser(token: string): Promise<User> {
  const payload = await verifyToken(token)

  const user = await prisma.user.findUnique({
    where: { id: payload.userId }
  })

  if (!user) {
    throw new Error('用户不存在')
  }

  if (user.status !== 'ACTIVE') {
    throw new Error('账户已被禁用')
  }

  return user
}

// 更新用户积分
export async function updateUserCredits(
  userId: string,
  amount: number,
  type: string,
  description: string,
  relatedId?: string
): Promise<User> {
  return prisma.$transaction(async (tx) => {
    // 获取当前用户
    const user = await tx.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new Error('用户不存在')
    }

    const newBalance = user.credits + amount

    // 检查余额是否足够（扣费时）
    if (amount < 0 && newBalance < 0) {
      throw new Error('积分余额不足')
    }

    // 更新用户积分
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        credits: newBalance,
        totalSpent: amount < 0 ? user.totalSpent + Math.abs(amount) : user.totalSpent,
        totalEarned: amount > 0 ? user.totalEarned + amount : user.totalEarned
      }
    })

    // 记录交易
    await tx.creditTransaction.create({
      data: {
        userId,
        amount,
        type: type as any,
        description,
        balanceBefore: user.credits,
        balanceAfter: newBalance,
        relatedId
      }
    })

    return updatedUser
  })
}

// API认证中间件
export async function authenticateRequest(request: NextRequest): Promise<User> {
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header')
  }

  const token = authHeader.substring(7)
  return getCurrentUser(token)
}

// API错误处理
export function handleApiError(error: any): NextResponse {
  console.error('API Error:', error)

  if (error.message.includes('用户') || error.message.includes('密码') || error.message.includes('邮箱')) {
    return NextResponse.json(
      { success: false, error: error.message } as ApiResponse,
      { status: 400 }
    )
  }

  if (error.message.includes('token') || error.message.includes('authorization')) {
    return NextResponse.json(
      { success: false, error: '认证失败' } as ApiResponse,
      { status: 401 }
    )
  }

  if (error.message.includes('积分') || error.message.includes('余额')) {
    return NextResponse.json(
      { success: false, error: error.message } as ApiResponse,
      { status: 400 }
    )
  }

  return NextResponse.json(
    { success: false, error: '服务器内部错误' } as ApiResponse,
    { status: 500 }
  )
}

// API成功响应
export function handleApiSuccess<T>(data: T, message?: string): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    message
  } as ApiResponse<T>)
}

// 验证邮箱格式
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 验证密码强度
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 6) {
    return { valid: false, message: '密码至少需要6个字符' }
  }

  if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
    return { valid: false, message: '密码需要包含字母和数字' }
  }

  return { valid: true }
}

// 验证用户名
export function validateUsername(username: string): { valid: boolean; message?: string } {
  if (username.length < 3 || username.length > 20) {
    return { valid: false, message: '用户名长度应为3-20个字符' }
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { valid: false, message: '用户名只能包含字母、数字、下划线和连字符' }
  }

  return { valid: true }
}

export default {
  generateToken,
  verifyToken,
  generateRefreshToken,
  hashPassword,
  verifyPassword,
  registerUser,
  loginUser,
  getCurrentUser,
  updateUserCredits,
  authenticateRequest,
  handleApiError,
  handleApiSuccess,
  validateEmail,
  validatePassword,
  validateUsername
}