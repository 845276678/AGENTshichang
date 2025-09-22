// 生产级用户认证API
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { productionConfig } from '@/config/production'
import { db } from '@/lib/database'
import { redis } from '@/lib/redis'
import { sendSMS } from '@/lib/sms'
import { rateLimit } from '@/lib/rate-limit'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/database'

// NextAuth configuration
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        identifier: { label: 'Email/Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null
        }

        try {
          // Find user by email or username
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: credentials.identifier },
                { username: credentials.identifier }
              ]
            }
          })

          if (!user) {
            return null
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          )

          if (!isPasswordValid) {
            return null
          }

          // Check if user is active
          if (user.status !== 'ACTIVE') {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.username,
            role: user.role
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/register'
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key'
}

// 注册验证schema
const registerSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8).max(50),
  phone: z.string().regex(/^1[3-9]\d{9}$/),
  smsCode: z.string().length(6),
  inviteCode: z.string().optional()
})

// 登录验证schema
const loginSchema = z.object({
  identifier: z.string(), // 支持邮箱/用户名/手机号
  password: z.string(),
  rememberMe: z.boolean().default(false)
})

// 用户注册接口
export async function registerUser(request: NextRequest) {
  try {
    // 限流检查
    const limiter = rateLimit({
      interval: 15 * 60 * 1000, // 15分钟
      uniqueTokenPerInterval: 500,
    })

    await limiter.check(request.ip || 'unknown')

    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // 验证短信验证码
    const smsCodeKey = `sms:${validatedData.phone}`
    const storedCode = await redis.get(smsCodeKey)

    if (!storedCode || storedCode !== validatedData.smsCode) {
      return NextResponse.json(
        { error: '验证码错误或已过期' },
        { status: 400 }
      )
    }

    // 检查用户是否已存在
    const existingUser = await db.execute(`
      SELECT id FROM users
      WHERE email = ? OR username = ? OR phone = ?
    `, [validatedData.email, validatedData.username, validatedData.phone])

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: '用户已存在' },
        { status: 409 }
      )
    }

    // 密码加密
    const passwordHash = await bcrypt.hash(
      validatedData.password,
      productionConfig.security.bcryptRounds
    )

    // 创建用户
    const result = await db.execute(`
      INSERT INTO users (username, email, password_hash, phone, credits, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      validatedData.username,
      validatedData.email,
      passwordHash,
      validatedData.phone,
      1000, // 新用户赠送1000积分
      'active'
    ])

    const userId = result.insertId

    // 生成JWT token
    const token = jwt.sign(
      { userId, username: validatedData.username },
      productionConfig.security.jwtSecret,
      { expiresIn: productionConfig.security.jwtExpiresIn }
    )

    // 创建用户会话
    await db.execute(`
      INSERT INTO user_sessions (id, user_id, ip_address, user_agent, expires_at)
      VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))
    `, [
      token,
      userId,
      request.ip || '',
      request.headers.get('user-agent') || ''
    ])

    // 删除验证码
    await redis.del(smsCodeKey)

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        username: validatedData.username,
        email: validatedData.email,
        credits: 1000
      },
      token
    })

  } catch (error) {
    console.error('Registration error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '输入数据格式错误', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    )
  }
}

// 用户登录接口
export async function loginUser(request: NextRequest) {
  try {
    await rateLimit({ interval: 15 * 60 * 1000, uniqueTokenPerInterval: 500 })
      .check(request.ip || 'unknown')

    const body = await request.json()
    const validatedData = loginSchema.parse(body)

    // 查找用户（支持邮箱/用户名/手机号登录）
    const user = await db.execute(`
      SELECT id, username, email, password_hash, credits, level, status
      FROM users
      WHERE email = ? OR username = ? OR phone = ?
      LIMIT 1
    `, [validatedData.identifier, validatedData.identifier, validatedData.identifier])

    if (user.length === 0) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    const userData = user[0]

    // 检查用户状态
    if (userData.status !== 'active') {
      return NextResponse.json(
        { error: '账户已被禁用，请联系客服' },
        { status: 403 }
      )
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(
      validatedData.password,
      userData.password_hash
    )

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: '密码错误' },
        { status: 401 }
      )
    }

    // 生成JWT token
    const expiresIn = validatedData.rememberMe ? '30d' : '7d'
    const token = jwt.sign(
      { userId: userData.id, username: userData.username },
      productionConfig.security.jwtSecret,
      { expiresIn }
    )

    // 创建用户会话
    await db.execute(`
      INSERT INTO user_sessions (id, user_id, ip_address, user_agent, expires_at)
      VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? DAY))
    `, [
      token,
      userData.id,
      request.ip || '',
      request.headers.get('user-agent') || '',
      validatedData.rememberMe ? 30 : 7
    ])

    // 更新最后登录时间
    await db.execute(`
      UPDATE users SET updated_at = NOW() WHERE id = ?
    `, [userData.id])

    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        credits: userData.credits,
        level: userData.level
      },
      token
    })

  } catch (error) {
    console.error('Login error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '输入数据格式错误' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '登录失败，请稍后重试' },
      { status: 500 }
    )
  }
}

// 发送短信验证码
export async function sendVerificationCode(request: NextRequest) {
  try {
    await rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 100 })
      .check(request.ip || 'unknown')

    const body = await request.json()
    const { phone, type } = body

    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: '手机号格式不正确' },
        { status: 400 }
      )
    }

    // 生成6位验证码
    const code = Math.random().toString().slice(2, 8)

    // 存储验证码到Redis（5分钟过期）
    const smsCodeKey = `sms:${phone}`
    await redis.setex(smsCodeKey, 300, code)

    // 发送短信
    const templateCode = type === 'register'
      ? productionConfig.sms.templateCode.register
      : productionConfig.sms.templateCode.login

    await sendSMS({
      phoneNumber: phone,
      templateCode,
      templateParam: { code }
    })

    return NextResponse.json({
      success: true,
      message: '验证码已发送'
    })

  } catch (error) {
    console.error('SMS sending error:', error)
    return NextResponse.json(
      { error: '验证码发送失败' },
      { status: 500 }
    )
  }
}

// 验证JWT token中间件
export async function verifyToken(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json(
      { error: '未提供认证token' },
      { status: 401 }
    )
  }

  try {
    // 验证JWT
    const decoded = jwt.verify(token, productionConfig.security.jwtSecret) as {
      userId: number
      username: string
    }

    // 检查会话是否存在
    const session = await db.execute(`
      SELECT user_id FROM user_sessions
      WHERE id = ? AND expires_at > NOW()
    `, [token])

    if (session.length === 0) {
      return NextResponse.json(
        { error: 'token已过期' },
        { status: 401 }
      )
    }

    // 获取用户信息
    const user = await db.execute(`
      SELECT id, username, email, credits, level, status
      FROM users WHERE id = ?
    `, [decoded.userId])

    if (user.length === 0 || user[0].status !== 'active') {
      return NextResponse.json(
        { error: '用户不存在或已被禁用' },
        { status: 401 }
      )
    }

    return {
      success: true,
      user: user[0]
    }

  } catch (error) {
    return NextResponse.json(
      { error: 'token无效' },
      { status: 401 }
    )
  }
}