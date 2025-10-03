'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { tokenStorage } from '@/lib/token-storage'

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
  role: string
  isEmailVerified: boolean
  status: string
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isInitialized: boolean
  isAuthenticated: boolean
  error: string | null
}

export interface UseAuthReturn extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUserData: () => Promise<void>
  updateCredits: (amount: number) => Promise<void>
  checkCredits: (required: number) => boolean
  clearError: () => void
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isInitialized: false,
    isAuthenticated: false,
    error: null
  })
  const router = useRouter()

  // 获取存储的认证信息
  const getStoredAuth = useCallback(() => {
    if (typeof window === 'undefined') return null

    try {
      const token = tokenStorage.getAccessToken()
      const user = tokenStorage.getUser()

      if (token && user) {
        return { token, user }
      }
    } catch (error) {
      console.error('Error reading stored auth:', error)
      tokenStorage.clearTokens()
    }

    return null
  }, [])

  // 保存认证信息
  const storeAuth = useCallback((token: string, user: User) => {
    if (typeof window === 'undefined') return

    try {
      tokenStorage.setTokens({ accessToken: token, refreshToken: token })
      tokenStorage.setUser(user)
    } catch (error) {
      console.error('Error storing auth:', error)
    }
  }, [])

  // 清除认证信息
  const clearAuth = useCallback(() => {
    if (typeof window === 'undefined') return
    tokenStorage.clearTokens()
  }, [])

  // 验证token有效性
  const validateToken = useCallback(async (token: string): Promise<User | null> => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json()

      if (!data.success) {
        return null
      }

      return data.data as User
    } catch (error) {
      console.error('Token validation error:', error)
      return null
    }
  }, [])

  // 初始化认证状态
  useEffect(() => {
    const initAuth = async () => {
      const storedAuth = getStoredAuth()

      if (storedAuth) {
        // 验证存储的token是否仍然有效
        const user = await validateToken(storedAuth.token)

        if (user) {
          setState({
            user,
            token: storedAuth.token,
            isLoading: false,
            isInitialized: true,
            isAuthenticated: true,
            error: null
          })

          // 更新存储的用户数据
          storeAuth(storedAuth.token, user)
        } else {
          // Token无效，清除存储的数据
          clearAuth()
          setState({
            user: null,
            token: null,
            isLoading: false,
            isInitialized: true,
            isAuthenticated: false,
            error: null
          })
        }
      } else {
        setState({
          user: null,
          token: null,
          isLoading: false,
          isInitialized: true,
          isAuthenticated: false,
          error: null
        })
      }
    }

    initAuth()
  }, [getStoredAuth, storeAuth, clearAuth, validateToken])

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
        throw new Error(data.message || data.error || '登录失败')
      }

      if (!data.success) {
        throw new Error(data.message || data.error || '登录失败')
      }

      const userData = data.data.user
      const token = data.data.token

      setState({
        user: userData,
        token,
        isLoading: false,
        isInitialized: true,
        isAuthenticated: true,
        error: null
      })

      storeAuth(token, userData)

      console.log('✅ 登录成功:', userData.email)
    } catch (error) {
      console.error('❌ 登录失败:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '登录失败',
        isLoading: false,
        isAuthenticated: false
      }))
      throw error
    }
  }, [storeAuth])

  // 登出
  const logout = useCallback(async () => {
    try {
      // 调用登出API
      if (state.token) {
        await fetch('/api/auth/session', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${state.token}`
          }
        })
      }
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      setState({
        user: null,
        token: null,
        isLoading: false,
        isInitialized: true,
        isAuthenticated: false,
        error: null
      })

      clearAuth()
      router.push('/auth/login')
    }
  }, [state.token, clearAuth, router])

  // 刷新用户数据
  const refreshUserData = useCallback(async () => {
    if (!state.token) return

    try {
      const user = await validateToken(state.token)

      if (user) {
        setState(prev => ({
          ...prev,
          user,
          isAuthenticated: true
        }))

        storeAuth(state.token, user)
      } else {
        // Token无效，执行登出
        await logout()
      }
    } catch (error) {
      console.error('Error refreshing user data:', error)
      // 认证失败时清除状态
      await logout()
    }
  }, [state.token, storeAuth, logout, validateToken])

  // 更新积分
  const updateCredits = useCallback(async (amount: number) => {
    if (!state.user || !state.token) {
      throw new Error('用户未登录')
    }

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
        throw new Error(data.message || data.error || '积分更新失败')
      }

      if (!data.success) {
        throw new Error(data.message || data.error || '积分更新失败')
      }

      // 刷新用户数据获取最新积分
      await refreshUserData()
    } catch (error) {
      console.error('Error updating credits:', error)
      throw error
    }
  }, [state.user, state.token, refreshUserData])

  // 检查积分是否足够
  const checkCredits = useCallback((required: number): boolean => {
    return state.user ? state.user.credits >= required : false
  }, [state.user])

  // 清除错误
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    ...state,
    login,
    logout,
    refreshUserData,
    updateCredits,
    checkCredits,
    clearError
  }
}

export default useAuth