/**
 * 工作坊会话管理Hook
 *
 * 功能包括：
 * - 会话状态管理
 * - 自动保存机制
 * - 进度跟踪
 * - 表单数据持久化
 * - 对话历史管理
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { type WorkshopFormData } from '@/lib/workshop/form-schemas'
import { type AgentMessage } from '@/lib/workshop/agent-prompts'

// 工作坊类型定义
export type WorkshopId = 'demand-validation' | 'mvp-builder' | 'growth-hacking' | 'profit-model'
export type WorkshopStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED'

// 工作坊会话接口
export interface WorkshopSession {
  id: string
  workshopId: WorkshopId
  userId: string
  currentStep: number
  totalSteps?: number
  status: WorkshopStatus
  formData: Partial<WorkshopFormData[WorkshopId]>
  conversationHistory: AgentMessage[]
  progress: number
  completedSteps: number[]
  lastSaveAt?: string
  createdAt: string
  updatedAt: string
}

// Hook配置接口
export interface UseWorkshopSessionProps {
  workshopId: WorkshopId
  userId?: string
  autoSave?: boolean
  saveInterval?: number
  onSessionLoaded?: (session: WorkshopSession) => void
  onProgressChange?: (progress: number) => void
  onStepComplete?: (step: number) => void
  onSessionComplete?: (session: WorkshopSession) => void
}

// Hook状态接口
export interface WorkshopSessionState {
  session: WorkshopSession | null
  isLoading: boolean
  isSaving: boolean
  error: string | null
  hasUnsavedChanges: boolean
  lastSaveAt: Date | null
}

// API响应接口
interface SessionApiResponse {
  success: boolean
  data?: WorkshopSession
  error?: string
}

// 默认会话数据
function createDefaultSession(
  workshopId: WorkshopId,
  userId: string = 'anonymous'
): Omit<WorkshopSession, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    workshopId,
    userId,
    currentStep: 1,
    status: 'IN_PROGRESS' as WorkshopStatus,
    formData: {},
    conversationHistory: [],
    progress: 0,
    completedSteps: []
  }
}

// 计算会话进度（基于表单完整性）
function calculateSessionProgress(
  workshopId: WorkshopId,
  formData: Partial<WorkshopFormData[WorkshopId]>,
  completedSteps: number[]
): number {
  // 获取工作坊步骤配置（这里简化实现）
  const totalSteps = (() => {
    switch (workshopId) {
      case 'demand-validation': return 4
      case 'mvp-builder': return 5
      case 'growth-hacking': return 6
      case 'profit-model': return 4
      default: return 4
    }
  })()

  return Math.round((completedSteps.length / totalSteps) * 100)
}

/**
 * 工作坊会话管理Hook
 *
 * @param props - Hook配置参数
 * @returns 会话状态和管理方法
 */
export function useWorkshopSession({
  workshopId,
  userId = 'anonymous',
  autoSave = true,
  saveInterval = 10000,
  onSessionLoaded,
  onProgressChange,
  onStepComplete,
  onSessionComplete
}: UseWorkshopSessionProps) {
  // 状态管理
  const [state, setState] = useState<WorkshopSessionState>({
    session: null,
    isLoading: true,
    isSaving: false,
    error: null,
    hasUnsavedChanges: false,
    lastSaveAt: null
  })

  // 自动保存定时器
  const autoSaveTimerRef = useRef<NodeJS.Timeout>()
  const lastSaveDataRef = useRef<string>('')
  const hasInitializedRef = useRef(false)

  // 回调引用
  const onSessionLoadedRef = useRef(onSessionLoaded)
  const onProgressChangeRef = useRef(onProgressChange)
  const onStepCompleteRef = useRef(onStepComplete)
  const onSessionCompleteRef = useRef(onSessionComplete)

  // API调用：刷新会话
  const refreshSession = useCallback(async () => {
    try {
      const baseUrl = typeof window !== 'undefined' ? '' : 'http://localhost:3000'
      const apiUrl = `${baseUrl}/api/workshop/session?workshopId=${workshopId}&userId=${userId}`

      // 尝试加载现有会话
      const loadResponse = await fetch(apiUrl)

      if (loadResponse.ok) {
        const loadData: SessionApiResponse = await loadResponse.json()
        if (loadData.success && loadData.data) {
          setState(prev => ({
            ...prev,
            session: loadData.data!,
            isLoading: false,
            error: null,
            lastSaveAt: new Date(loadData.data!.updatedAt)
          }))

          lastSaveDataRef.current = JSON.stringify(loadData.data!.formData)
          onSessionLoadedRef.current?.(loadData.data!)
          return
        }
      }

      // 创建新会话
      const createApiUrl = `${baseUrl}/api/workshop/session`
      const createResponse = await fetch(createApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createDefaultSession(workshopId, userId))
      })

      if (!createResponse.ok) {
        throw new Error(`创建会话失败: ${createResponse.status}`)
      }

      const createData: SessionApiResponse = await createResponse.json()
      if (!createData.success || !createData.data) {
        throw new Error(createData.error || '创建会话返回无效数据')
      }

      setState(prev => ({
        ...prev,
        session: createData.data!,
        isLoading: false,
        error: null,
        lastSaveAt: new Date()
      }))

      lastSaveDataRef.current = JSON.stringify(createData.data!.formData)
      onSessionLoadedRef.current?.(createData.data!)

    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '刷新失败'
      }))
    }
  }, [workshopId, userId])

  // API调用：保存会话
  const saveSession = useCallback(async (
    updatedSession: WorkshopSession
  ): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isSaving: true, error: null }))

      const baseUrl = typeof window !== 'undefined' ? '' : 'http://localhost:3000'
      const saveApiUrl = `${baseUrl}/api/workshop/session/${updatedSession.id}`

      const response = await fetch(saveApiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSession)
      })

      if (!response.ok) {
        throw new Error(`保存失败: ${response.status}`)
      }

      const data: SessionApiResponse = await response.json()
      if (!data.success) {
        throw new Error(data.error || '保存失败')
      }

      setState(prev => ({
        ...prev,
        session: data.data || updatedSession,
        isSaving: false,
        hasUnsavedChanges: false,
        lastSaveAt: new Date()
      }))

      lastSaveDataRef.current = JSON.stringify(updatedSession.formData)
      return true

    } catch (error) {
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: error instanceof Error ? error.message : '保存失败'
      }))
      return false
    }
  }, [])

  // 更新表单数据
  const updateFormData = useCallback((
    newData: Partial<WorkshopFormData[WorkshopId]>
  ) => {
    if (!state.session) return

    const updatedSession: WorkshopSession = {
      ...state.session,
      formData: { ...state.session.formData, ...newData },
      updatedAt: new Date().toISOString()
    }

    setState(prev => ({
      ...prev,
      session: updatedSession,
      hasUnsavedChanges: true
    }))

    // 触发进度变化回调
    const newProgress = calculateSessionProgress(
      workshopId,
      updatedSession.formData,
      updatedSession.completedSteps
    )
    if (newProgress !== state.session.progress) {
      updatedSession.progress = newProgress
      onProgressChangeRef.current?.(newProgress)
    }
  }, [state.session, workshopId])

  // 更新对话历史
  const updateConversationHistory = useCallback((
    newMessages: AgentMessage[]
  ) => {
    if (!state.session) return

    const updatedSession: WorkshopSession = {
      ...state.session,
      conversationHistory: [...state.session.conversationHistory, ...newMessages],
      updatedAt: new Date().toISOString()
    }

    setState(prev => ({
      ...prev,
      session: updatedSession,
      hasUnsavedChanges: true
    }))
  }, [state.session])

  // 完成步骤
  const completeStep = useCallback((stepNumber: number) => {
    if (!state.session) return

    const completedSteps = [...state.session.completedSteps]
    if (!completedSteps.includes(stepNumber)) {
      completedSteps.push(stepNumber)
    }

    const nextStep = Math.min(stepNumber + 1, 4) // 假设最多4步
    const newProgress = calculateSessionProgress(workshopId, state.session.formData, completedSteps)

    const updatedSession: WorkshopSession = {
      ...state.session,
      currentStep: nextStep,
      completedSteps,
      progress: newProgress,
      status: completedSteps.length >= 4 ? 'COMPLETED' : 'IN_PROGRESS',
      updatedAt: new Date().toISOString()
    }

    setState(prev => ({
      ...prev,
      session: updatedSession,
      hasUnsavedChanges: true
    }))

    onStepCompleteRef.current?.(stepNumber)
    onProgressChangeRef.current?.(newProgress)

    if (updatedSession.status === 'COMPLETED') {
      onSessionCompleteRef.current?.(updatedSession)
    }
  }, [state.session, workshopId])

  // 手动保存
  const manualSave = useCallback(async (): Promise<boolean> => {
    if (!state.session || !state.hasUnsavedChanges) return true
    return await saveSession(state.session)
  }, [state.session, state.hasUnsavedChanges, saveSession])

  // 自动保存逻辑
  useEffect(() => {
    if (!autoSave || !state.session || !state.hasUnsavedChanges) return

    const currentDataString = JSON.stringify(state.session.formData)
    if (currentDataString === lastSaveDataRef.current) return

    // 清除之前的定时器
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    // 设置新的自动保存定时器
    autoSaveTimerRef.current = setTimeout(() => {
      if (state.session && state.hasUnsavedChanges) {
        saveSession(state.session)
      }
    }, saveInterval)

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [state.session, state.hasUnsavedChanges, autoSave, saveInterval, saveSession])

  // 更新回调引用
  useEffect(() => {
    onSessionLoadedRef.current = onSessionLoaded
    onProgressChangeRef.current = onProgressChange
    onStepCompleteRef.current = onStepComplete
    onSessionCompleteRef.current = onSessionComplete
  })

  // 初始化：加载会话
  useEffect(() => {
    if (hasInitializedRef.current) return
    hasInitializedRef.current = true

    let isMounted = true

    const initializeSession = async () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      try {
        const baseUrl = typeof window !== 'undefined' ? '' : 'http://localhost:3000'
        const apiUrl = `${baseUrl}/api/workshop/session?workshopId=${workshopId}&userId=${userId}`

        // 尝试加载现有会话
        const loadResponse = await fetch(apiUrl)

        if (loadResponse.ok) {
          const loadData: SessionApiResponse = await loadResponse.json()
          if (loadData.success && loadData.data && isMounted) {
            setState(prev => ({
              ...prev,
              session: loadData.data!,
              isLoading: false,
              lastSaveAt: new Date(loadData.data!.updatedAt)
            }))

            lastSaveDataRef.current = JSON.stringify(loadData.data!.formData)
            onSessionLoadedRef.current?.(loadData.data!)
            return
          }
        }

        // 404或其他错误 - 创建新会话
        const createApiUrl = `${baseUrl}/api/workshop/session`
        const createResponse = await fetch(createApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(createDefaultSession(workshopId, userId))
        })

        if (!createResponse.ok) {
          throw new Error(`创建会话失败: ${createResponse.status}`)
        }

        const createData: SessionApiResponse = await createResponse.json()
        if (!createData.success || !createData.data) {
          throw new Error(createData.error || '创建会话返回无效数据')
        }

        if (isMounted) {
          setState(prev => ({
            ...prev,
            session: createData.data!,
            isLoading: false,
            lastSaveAt: new Date()
          }))

          lastSaveDataRef.current = JSON.stringify(createData.data!.formData)
          onSessionLoadedRef.current?.(createData.data!)
        }

      } catch (error) {
        if (isMounted) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: error instanceof Error ? error.message : '初始化失败'
          }))
        }
      }
    }

    initializeSession()

    return () => {
      isMounted = false
    }
  }, [workshopId, userId])

  // 清理：组件卸载时保存
  useEffect(() => {
    return () => {
      if (state.hasUnsavedChanges && state.session) {
        const baseUrl = typeof window !== 'undefined' ? '' : 'http://localhost:3000'
        const cleanupApiUrl = `${baseUrl}/api/workshop/session/${state.session.id}`

        // 同步保存（组件卸载时）
        navigator.sendBeacon(
          cleanupApiUrl,
          JSON.stringify(state.session)
        )
      }
    }
  })

  return {
    // 状态
    ...state,

    // 方法
    refreshSession,
    updateFormData,
    updateConversationHistory,
    completeStep,
    manualSave,

    // 计算属性
    isInitialized: !state.isLoading && state.session !== null
  }
}

// 导出类型
export type { WorkshopSession, UseWorkshopSessionProps, WorkshopSessionState }