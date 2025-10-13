/**
 * 工作坊会话管理Hook
 *
 * 提供工作坊会话的完整状态管理功能：
 * - 会话创建、保存和恢复
 * - 进度跟踪和步骤管理
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

// 会话数据结构
export interface WorkshopSession {
  id: string
  workshopId: WorkshopId
  userId: string
  currentStep: number
  status: WorkshopStatus
  formData: Partial<WorkshopFormData[WorkshopId]>
  conversationHistory: AgentMessage[]
  progress: number
  completedSteps: number[]
  lastSaveAt?: string
  createdAt: string
  updatedAt: string
}

// Hook参数接口
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
  const totalSteps = workshopId === 'demand-validation' ? 4 :
                    workshopId === 'mvp-builder' ? 4 :
                    workshopId === 'growth-hacking' ? 3 : 3

  const stepProgress = completedSteps.length / totalSteps * 100

  // 考虑表单填写完整度
  const formFields = Object.values(formData).filter(value =>
    value !== undefined && value !== null && value !== ''
  ).length

  // 这里可以根据不同工作坊的字段数量来调整
  const totalFields = workshopId === 'demand-validation' ? 8 :
                     workshopId === 'mvp-builder' ? 10 :
                     workshopId === 'growth-hacking' ? 6 : 9

  const formProgress = Math.min(formFields / totalFields * 100, 100)

  // 综合计算进度（步骤权重70%，表单完整度权重30%）
  return Math.round(stepProgress * 0.7 + formProgress * 0.3)
}

export function useWorkshopSession({
  workshopId,
  userId = 'anonymous',
  autoSave = true,
  saveInterval = 10000, // 10秒自动保存
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

  // API调用：重新加载会话
  const refreshSession = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null, session: null }))

    try {
      console.log(`🔄 刷新工作坊会话: ${workshopId}`)

      // 尝试加载现有会话
      const loadResponse = await fetch(
        `/api/workshop/session?workshopId=${workshopId}&userId=${userId}`
      )

      if (loadResponse.ok) {
        const loadData: SessionApiResponse = await loadResponse.json()
        if (loadData.success && loadData.data) {
          console.log(`✅ 刷新现有会话成功: ${loadData.data.id}`)
          setState(prev => ({
            ...prev,
            session: loadData.data!,
            isLoading: false,
            lastSaveAt: new Date(loadData.data!.updatedAt)
          }))

          lastSaveDataRef.current = JSON.stringify(loadData.data!.formData)
          onSessionLoaded?.(loadData.data!)
          return
        }
      }

      // 创建新会话
      const createResponse = await fetch('/api/workshop/session', {
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

      console.log(`✅ 创建新会话成功: ${createData.data.id}`)
      setState(prev => ({
        ...prev,
        session: createData.data!,
        isLoading: false,
        lastSaveAt: new Date()
      }))

      lastSaveDataRef.current = JSON.stringify(createData.data!.formData)
      onSessionLoaded?.(createData.data!)

    } catch (error) {
      console.error('❌ 会话刷新失败:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '刷新失败'
      }))
    }
  }, [workshopId, userId, onSessionLoaded])

  // API调用：保存会话
  const saveSession = useCallback(async (
    sessionData?: Partial<WorkshopSession>
  ): Promise<boolean> => {
    if (!state.session) return false

    setState(prev => ({ ...prev, isSaving: true, error: null }))

    try {
      const updatedSession = sessionData ? { ...state.session, ...sessionData } : state.session

      console.log(`💾 保存会话: ${updatedSession.id}`)

      const response = await fetch(`/api/workshop/session/${updatedSession.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSession)
      })

      if (!response.ok) {
        throw new Error(`保存失败: ${response.status}`)
      }

      const data: SessionApiResponse = await response.json()
      if (!data.success) {
        throw new Error(data.error || '保存返回失败状态')
      }

      setState(prev => ({
        ...prev,
        session: data.data || updatedSession,
        isSaving: false,
        hasUnsavedChanges: false,
        lastSaveAt: new Date()
      }))

      lastSaveDataRef.current = JSON.stringify(updatedSession.formData)
      console.log(`✅ 会话保存成功`)
      return true

    } catch (error) {
      console.error('❌ 保存会话失败:', error)
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: error instanceof Error ? error.message : '保存失败'
      }))
      return false
    }
  }, [state.session])

  // 更新表单数据
  const updateFormData = useCallback((
    newData: Partial<WorkshopFormData[WorkshopId]>
  ): void => {
    if (!state.session) return

    const updatedFormData = { ...state.session.formData, ...newData }
    const newProgress = calculateSessionProgress(
      workshopId,
      updatedFormData,
      state.session.completedSteps
    )

    setState(prev => ({
      ...prev,
      session: prev.session ? {
        ...prev.session,
        formData: updatedFormData,
        progress: newProgress,
        updatedAt: new Date().toISOString()
      } : null,
      hasUnsavedChanges: true
    }))

    // 触发进度变化回调
    if (newProgress !== state.session.progress) {
      onProgressChange?.(newProgress)
    }
  }, [state.session, workshopId, onProgressChange])

  // 更新当前步骤
  const updateCurrentStep = useCallback((step: number): void => {
    if (!state.session) return

    setState(prev => ({
      ...prev,
      session: prev.session ? {
        ...prev.session,
        currentStep: step,
        updatedAt: new Date().toISOString()
      } : null,
      hasUnsavedChanges: true
    }))
  }, [state.session])

  // 标记步骤为完成
  const completeStep = useCallback((step: number): void => {
    if (!state.session || state.session.completedSteps.includes(step)) return

    const newCompletedSteps = [...state.session.completedSteps, step].sort((a, b) => a - b)
    const newProgress = calculateSessionProgress(
      workshopId,
      state.session.formData,
      newCompletedSteps
    )

    setState(prev => ({
      ...prev,
      session: prev.session ? {
        ...prev.session,
        completedSteps: newCompletedSteps,
        progress: newProgress,
        updatedAt: new Date().toISOString()
      } : null,
      hasUnsavedChanges: true
    }))

    onStepComplete?.(step)
    onProgressChange?.(newProgress)
  }, [state.session, workshopId, onStepComplete, onProgressChange])

  // 添加对话消息
  const addConversationMessage = useCallback((message: AgentMessage): void => {
    if (!state.session) return

    const newHistory = [...state.session.conversationHistory, message]

    setState(prev => ({
      ...prev,
      session: prev.session ? {
        ...prev.session,
        conversationHistory: newHistory,
        updatedAt: new Date().toISOString()
      } : null,
      hasUnsavedChanges: true
    }))
  }, [state.session])

  // 完成工作坊
  const completeWorkshop = useCallback(async (): Promise<boolean> => {
    if (!state.session) return false

    const completedSession = {
      ...state.session,
      status: 'COMPLETED' as WorkshopStatus,
      progress: 100,
      updatedAt: new Date().toISOString()
    }

    const success = await saveSession(completedSession)
    if (success) {
      onSessionComplete?.(completedSession)
    }

    return success
  }, [state.session, saveSession, onSessionComplete])

  // 自动保存逻辑
  useEffect(() => {
    if (!autoSave || !state.session || !state.hasUnsavedChanges) return

    const currentDataString = JSON.stringify(state.session.formData)
    if (currentDataString === lastSaveDataRef.current) return

    // 清除现有定时器
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    // 设置新的自动保存定时器
    autoSaveTimerRef.current = setTimeout(() => {
      saveSession()
    }, saveInterval)

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [state.session, state.hasUnsavedChanges, autoSave, saveInterval, saveSession])

  // 初始化：加载会话 (移除依赖项避免无限循环)
  useEffect(() => {
    let isMounted = true

    const initializeSession = async () => {
      if (state.session || state.isLoading) return

      setState(prev => ({ ...prev, isLoading: true, error: null }))

      try {
        console.log(`🔄 初始化工作坊会话: ${workshopId}`)

        // 尝试加载现有会话
        const loadResponse = await fetch(
          `/api/workshop/session?workshopId=${workshopId}&userId=${userId}`
        )

        if (loadResponse.ok) {
          const loadData: SessionApiResponse = await loadResponse.json()
          if (loadData.success && loadData.data && isMounted) {
            console.log(`✅ 加载现有会话成功: ${loadData.data.id}`)
            setState(prev => ({
              ...prev,
              session: loadData.data!,
              isLoading: false,
              lastSaveAt: new Date(loadData.data!.updatedAt)
            }))

            lastSaveDataRef.current = JSON.stringify(loadData.data!.formData)
            onSessionLoaded?.(loadData.data!)
            return
          }
        }

        // 404或其他错误 - 创建新会话
        console.log('📝 创建新的工作坊会话')
        const createResponse = await fetch('/api/workshop/session', {
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
          console.log(`✅ 创建新会话成功: ${createData.data.id}`)
          setState(prev => ({
            ...prev,
            session: createData.data!,
            isLoading: false,
            lastSaveAt: new Date()
          }))

          lastSaveDataRef.current = JSON.stringify(createData.data!.formData)
          onSessionLoaded?.(createData.data!)
        }

      } catch (error) {
        console.error('❌ 会话初始化失败:', error)
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
  }, [workshopId, userId]) // 只依赖于基本参数

  // 清理：组件卸载时保存
  useEffect(() => {
    return () => {
      if (state.hasUnsavedChanges && state.session) {
        // 同步保存（组件卸载时）
        navigator.sendBeacon(
          `/api/workshop/session/${state.session.id}`,
          JSON.stringify(state.session)
        )
      }
    }
  }, [state.hasUnsavedChanges, state.session])

  return {
    // 状态
    ...state,

    // 方法
    saveSession,
    updateFormData,
    updateCurrentStep,
    completeStep,
    addConversationMessage,
    completeWorkshop,
    refreshSession,

    // 计算属性
    isComplete: state.session?.status === 'COMPLETED',
    canProceed: state.session ? state.session.progress >= 25 : false,
    nextRequiredStep: state.session ?
      Math.min(...Array.from({ length: 4 }, (_, i) => i + 1)
        .filter(step => !state.session!.completedSteps.includes(step))) : 1
  }
}

// 导出类型
export type { WorkshopSession, UseWorkshopSessionProps, WorkshopSessionState }