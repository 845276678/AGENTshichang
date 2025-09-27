'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export interface User {
  id: string
  email: string
  username: string
  firstName?: string
  lastName?: string
  avatar?: string
  credits: number
  level: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND'
  totalSpent: number
  totalEarned: number
  guessAccuracy: number
  consecutiveGuesses: number
}

export interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
}

export interface UseAuthReturn extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUserData: () => Promise<void>
  updateCredits: (amount: number) => Promise<void>
  checkCredits: (required: number) => boolean
}

// 模拟用户数据 - 后续替换为真实API调用
const mockUser: User = {
  id: 'user_123',
  email: 'user@example.com',
  username: 'demo_user',
  firstName: '演示',
  lastName: '用户',
  avatar: '/avatars/user.png',
  credits: Math.floor(Math.random() * 5000) + 1000,
  level: 'SILVER',
  totalSpent: 0,
  totalEarned: 0,
  guessAccuracy: 75.5,
  consecutiveGuesses: 3
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    error: null
  })
  const router = useRouter()

  // 获取存储的认证信息
  const getStoredAuth = useCallback(() => {
    if (typeof window === 'undefined') return null

    try {
      const token = localStorage.getItem('auth_token')
      const userStr = localStorage.getItem('user_data')

      if (token && userStr) {
        return {
          token,
          user: JSON.parse(userStr) as User
        }
      }
    } catch (error) {
      console.error('Error reading stored auth:', error)
    }

    return null
  }, [])

  // 保存认证信息
  const storeAuth = useCallback((token: string, user: User) => {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user_data', JSON.stringify(user))
    } catch (error) {
      console.error('Error storing auth:', error)
    }
  }, [])

  // 清除认证信息
  const clearAuth = useCallback(() => {
    if (typeof window === 'undefined') return

    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
  }, [])

  // 初始化认证状态
  useEffect(() => {
    const storedAuth = getStoredAuth()

    if (storedAuth) {
      setState({
        user: storedAuth.user,
        token: storedAuth.token,
        isLoading: false,
        error: null
      })
    } else {
      // 临时：自动使用模拟用户
      const mockToken = 'mock_jwt_token_' + Date.now()
      setState({
        user: mockUser,
        token: mockToken,
        isLoading: false,
        error: null
      })
      storeAuth(mockToken, mockUser)
    }
  }, [getStoredAuth, storeAuth])

  // 登录
  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '登录失败')
      }

      if (!data.success) {
        throw new Error(data.error || '登录失败')
      }

      const userData = data.data.user
      const token = data.data.token

      setState({
        user: userData,
        token,
        isLoading: false,
        error: null
      })

      storeAuth(token, userData)
    } catch (error) {
      console.error('Login error:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '登录失败',
        isLoading: false
      }))
      throw error
    }
  }, [storeAuth])

  // 登出
  const logout = useCallback(() => {
    setState({
      user: null,
      token: null,
      isLoading: false,
      error: null
    })

    clearAuth()
    router.push('/auth/login')
  }, [clearAuth, router])

  // 刷新用户数据
  const refreshUserData = useCallback(async () => {
    if (!state.token) return

    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${state.token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to refresh user data')
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to refresh user data')
      }

      const userData = data.data

      setState(prev => ({
        ...prev,
        user: userData
      }))

      if (userData) {
        storeAuth(state.token, userData)
      }
    } catch (error) {
      console.error('Error refreshing user data:', error)
      // 认证失败时清除状态
      if (error instanceof Error && error.message.includes('认证')) {
        logout()
      }
    }
  }, [state.token, storeAuth])

  // 更新积分
  const updateCredits = useCallback(async (amount: number) => {
    if (!state.user || !state.token) {
      throw new Error('用户未登录')
    }

    // 乐观更新
    const updatedUser = {
      ...state.user,
      credits: state.user.credits + amount,
      totalSpent: amount < 0 ? state.user.totalSpent + Math.abs(amount) : state.user.totalSpent,
      totalEarned: amount > 0 ? state.user.totalEarned + amount : state.user.totalEarned
    }

    setState(prev => ({
      ...prev,
      user: updatedUser
    }))

    storeAuth(state.token, updatedUser)

    try {
      const response = await fetch('/api/user/credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        },
        body: JSON.stringify({
          amount,
          type: amount > 0 ? 'EARN' : 'SPEND',
          description: amount > 0 ? '竞价奖励' : '参与竞价'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        // 回滚乐观更新
        setState(prev => ({
          ...prev,
          user: state.user
        }))
        storeAuth(state.token, state.user)
        throw new Error(data.error || '积分更新失败')
      }

      if (!data.success) {
        // 回滚乐观更新
        setState(prev => ({
          ...prev,
          user: state.user
        }))
        storeAuth(state.token, state.user)
        throw new Error(data.error || '积分更新失败')
      }

      // 获取最新的用户数据
      await refreshUserData()
    } catch (error) {
      console.error('Error updating credits:', error)
      throw error
    }
  }, [state.user, state.token, storeAuth, refreshUserData])

  // 检查积分是否足够
  const checkCredits = useCallback((required: number): boolean => {
    return state.user ? state.user.credits >= required : false
  }, [state.user])

  return {
    ...state,
    login,
    logout,
    refreshUserData,
    updateCredits,
    checkCredits
  }
}

export default useAuth