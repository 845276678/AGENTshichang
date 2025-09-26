/* eslint-disable */
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

// 简化版业务计划生成状态管理
interface BusinessPlanGenerationState {
  isGenerating: boolean
  currentStage: string
  progress: number
  error: string | null
}

interface BusinessPlanGenerationStore extends BusinessPlanGenerationState {
  startGeneration: () => void
  stopGeneration: () => void
  setProgress: (progress: number) => void
  setError: (error: string | null) => void
  setCurrentStage: (stage: string) => void
}

export const useBusinessPlanGeneration = create<BusinessPlanGenerationStore>()(
  subscribeWithSelector((set) => ({
    // 初始状态
    isGenerating: false,
    currentStage: '',
    progress: 0,
    error: null,

    // 动作
    startGeneration: () => set({ isGenerating: true, error: null }),
    stopGeneration: () => set({ isGenerating: false }),
    setProgress: (progress: number) => set({ progress }),
    setError: (error: string | null) => set({ error }),
    setCurrentStage: (stage: string) => set({ currentStage: stage })
  }))
)

export default useBusinessPlanGeneration