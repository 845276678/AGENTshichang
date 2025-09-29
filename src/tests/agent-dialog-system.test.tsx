/**
 * AI Agent对话框系统 - 综合测试套件
 * 包含功能测试、性能测试、响应式测试
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// 导入待测试的组件和Hook
import { AgentDialogPanel, BiddingPhase, type AgentState } from '@/components/bidding/AgentDialogPanel'
import { useAgentStates, PhasePermissionManager } from '@/hooks/useAgentStates'
import { AgentStateManager } from '@/services/AgentStateManager'
import { AgentStateMessageBuffer } from '@/services/AgentStateMessageBuffer'
import { AI_PERSONAS } from '@/lib/ai-persona-system'

// Mock modules are handled in setup.ts file

describe('AgentDialogPanel组件测试', () => {
  const mockAgent = AI_PERSONAS[0]
  const mockState: AgentState = {
    id: mockAgent.id,
    phase: 'idle',
    emotion: 'neutral',
    confidence: 0.5,
    lastActivity: new Date(),
    speakingIntensity: 0.8,
    isSupported: false
  }

  const defaultProps = {
    agent: mockAgent,
    state: mockState,
    isActive: false,
    currentPhase: BiddingPhase.IDEA_INPUT,
    onSupport: vi.fn(),
    currentBid: undefined
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('应该正确渲染Agent基本信息', () => {
    render(<AgentDialogPanel {...defaultProps} />)

    expect(screen.getByText(mockAgent.name)).toBeInTheDocument()
    expect(screen.getByText(mockAgent.specialty)).toBeInTheDocument()
    expect(screen.getByAltText(mockAgent.name)).toBeInTheDocument()
  })

  test('应该正确显示Agent状态', () => {
    const speakingState = { ...mockState, phase: 'speaking' as const }
    render(<AgentDialogPanel {...defaultProps} state={speakingState} />)

    expect(screen.getByText('发言中')).toBeInTheDocument()
  })

  test('应该正确显示0出价', () => {
    render(<AgentDialogPanel
      {...defaultProps}
      currentPhase={BiddingPhase.AGENT_BIDDING}
      currentBid={0}
    />)

    expect(screen.getByText('¥')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('尚无溢价')).toBeInTheDocument()
  })

  test('应该正确显示非0出价', () => {
    render(<AgentDialogPanel
      {...defaultProps}
      currentPhase={BiddingPhase.AGENT_BIDDING}
      currentBid={150}
    />)

    expect(screen.getByText('¥')).toBeInTheDocument()
    expect(screen.getByText('150')).toBeInTheDocument()
    expect(screen.queryByText('尚无溢价')).not.toBeInTheDocument()
  })

  test('应该在USER_SUPPLEMENT阶段显示支持按钮', () => {
    render(<AgentDialogPanel
      {...defaultProps}
      currentPhase={BiddingPhase.USER_SUPPLEMENT}
    />)

    expect(screen.getByText('支持')).toBeInTheDocument()
  })

  test('支持按钮点击应该触发回调', async () => {
    const user = userEvent.setup()
    const mockOnSupport = vi.fn()

    render(<AgentDialogPanel
      {...defaultProps}
      currentPhase={BiddingPhase.USER_SUPPLEMENT}
      onSupport={mockOnSupport}
    />)

    await user.click(screen.getByText('支持'))
    expect(mockOnSupport).toHaveBeenCalledTimes(1)
  })

  test('已支持状态应该正确显示', () => {
    const supportedState = { ...mockState, isSupported: true }
    render(<AgentDialogPanel
      {...defaultProps}
      state={supportedState}
      currentPhase={BiddingPhase.USER_SUPPLEMENT}
    />)

    expect(screen.getByText('已支持')).toBeInTheDocument()
  })
})

describe('useAgentStates Hook测试', () => {
  test('应该正确初始化Agent状态', () => {
    const { result } = renderHook(() => useAgentStates({
      currentPhase: BiddingPhase.IDEA_INPUT
    }))

    expect(result.current.agentStates).toBeDefined()
    expect(Object.keys(result.current.agentStates)).toHaveLength(AI_PERSONAS.length)
  })

  test('应该正确管理阶段权限', () => {
    const { result } = renderHook(() => useAgentStates({
      currentPhase: BiddingPhase.USER_SUPPLEMENT
    }))

    expect(result.current.currentPermissions.userSupplementAllowed).toBe(true)
    expect(result.current.currentPermissions.maxSupplementCount).toBe(3)
  })

  test('应该正确处理Agent支持', () => {
    const { result } = renderHook(() => useAgentStates({
      currentPhase: BiddingPhase.USER_SUPPLEMENT
    }))

    act(() => {
      result.current.supportAgent('tech-pioneer-alex')
    })

    expect(result.current.supportedAgents.has('tech-pioneer-alex')).toBe(true)
    expect(result.current.supplementCount).toBe(1)
  })

  test('应该限制最大支持次数', () => {
    const { result } = renderHook(() => useAgentStates({
      currentPhase: BiddingPhase.USER_SUPPLEMENT
    }))

    // 支持3次（最大限制）
    act(() => {
      result.current.supportAgent('tech-pioneer-alex')
      result.current.supportAgent('business-tycoon-wang')
      result.current.supportAgent('artistic-lin')
    })

    expect(result.current.supplementCount).toBe(3)
    expect(result.current.canSupport('trend-master-allen')).toBe(false)
  })
})

describe('PhasePermissionManager测试', () => {
  test('应该正确返回阶段权限', () => {
    const ideaInputPermissions = PhasePermissionManager.getPermissions(BiddingPhase.IDEA_INPUT)
    expect(ideaInputPermissions.canUserInput).toBe(true)
    expect(ideaInputPermissions.showBiddingStatus).toBe(false)

    const biddingPermissions = PhasePermissionManager.getPermissions(BiddingPhase.AGENT_BIDDING)
    expect(biddingPermissions.canUserInput).toBe(false)
    expect(biddingPermissions.showBiddingStatus).toBe(true)
  })

  test('应该正确检查用户输入权限', () => {
    expect(PhasePermissionManager.canUserInput(BiddingPhase.IDEA_INPUT)).toBe(true)
    expect(PhasePermissionManager.canUserInput(BiddingPhase.AGENT_BIDDING)).toBe(false)
  })

  test('应该正确返回阶段描述', () => {
    const description = PhasePermissionManager.getPhaseDescription(BiddingPhase.AGENT_BIDDING)
    expect(description).toContain('竞价阶段')
  })
})

describe('AgentStateManager测试', () => {
  let manager: AgentStateManager

  beforeEach(() => {
    manager = new AgentStateManager()
  })

  afterEach(() => {
    manager.dispose()
  })

  test('应该正确创建默认状态', () => {
    const state = manager.createDefaultState('tech-pioneer-alex')

    expect(state.id).toBe('tech-pioneer-alex')
    expect(state.phase).toBe('idle')
    expect(state.emotion).toBe('neutral')
    expect(state.confidence).toBe(0)
  })

  test('应该正确更新Agent状态', () => {
    const initialState = manager.createDefaultState('tech-pioneer-alex')
    const updatedState = manager.updateState('tech-pioneer-alex', {
      phase: 'speaking',
      emotion: 'excited',
      confidence: 0.8
    })

    expect(updatedState.phase).toBe('speaking')
    expect(updatedState.emotion).toBe('excited')
    expect(updatedState.confidence).toBe(0.8)
  })

  test('应该正确验证状态更新', () => {
    const invalidUpdate = {
      confidence: 1.5, // 超出范围
      phase: 'invalid' as any
    }

    expect(() => {
      manager.updateState('tech-pioneer-alex', invalidUpdate)
    }).not.toThrow() // 应该静默过滤无效值
  })
})

describe('AgentStateMessageBuffer性能测试', () => {
  let buffer: AgentStateMessageBuffer
  let messages: any[] = []

  beforeEach(() => {
    messages = []
    buffer = new AgentStateMessageBuffer({
      maxBufferSize: 10,
      flushInterval: 50,
      batchSize: 5
    }, {
      onFlush: async (msgs) => {
        messages.push(...msgs)
      }
    })
  })

  afterEach(() => {
    buffer.stop()
  })

  test('应该正确缓冲和批处理消息', async () => {
    const testMessages = Array.from({ length: 15 }, (_, i) => ({
      type: 'agent_thinking' as const,
      personaId: `agent-${i % 3}`,
      payload: { phase: 'thinking' as const }
    }))

    testMessages.forEach(msg => buffer.addMessage(msg))

    await waitFor(() => {
      expect(messages.length).toBeGreaterThan(0)
    }, { timeout: 200 })

    expect(messages.length).toBe(15)
  })

  test('应该正确处理消息优先级', async () => {
    const lowPriorityMsg = {
      type: 'agent_thinking' as const,
      personaId: 'agent-1',
      payload: { phase: 'thinking' as const }
    }

    const highPriorityMsg = {
      type: 'agent_bidding' as const,
      personaId: 'agent-2',
      payload: { phase: 'bidding' as const, bidAmount: 100 }
    }

    buffer.addMessage(lowPriorityMsg)
    buffer.addMessage(highPriorityMsg)

    // 高优先级消息应该立即处理
    await waitFor(() => {
      expect(messages).toContainEqual(expect.objectContaining({
        type: 'agent_bidding'
      }))
    })
  })

  test('应该正确去重相同Agent的消息', () => {
    // 添加多个相同Agent的消息
    for (let i = 0; i < 5; i++) {
      buffer.addMessage({
        type: 'agent_thinking',
        personaId: 'agent-1',
        payload: { phase: 'thinking', message: `message-${i}` }
      })
    }

    const status = buffer.getStatus()
    expect(status.bufferSize).toBeLessThanOrEqual(3) // 最多保留3条
  })
})

describe('响应式设计测试', () => {
  const resizeWindow = (width: number, height: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    })
    window.dispatchEvent(new Event('resize'))
  }

  test('应该在移动端正确显示', () => {
    resizeWindow(375, 667) // iPhone SE尺寸

    render(<AgentDialogPanel {...{
      agent: AI_PERSONAS[0],
      state: {
        id: 'test',
        phase: 'idle' as const,
        emotion: 'neutral' as const,
        confidence: 0.5,
        lastActivity: new Date(),
        speakingIntensity: 0.8,
        isSupported: false
      },
      isActive: false,
      currentPhase: BiddingPhase.IDEA_INPUT,
      onSupport: vi.fn()
    }} />)

    // 在小屏幕上，面板应该存在（样式通过CSS控制）
    expect(screen.getByText(AI_PERSONAS[0].name)).toBeInTheDocument()
  })

  test('应该在平板尺寸正确显示', () => {
    resizeWindow(768, 1024) // iPad尺寸

    render(<AgentDialogPanel {...{
      agent: AI_PERSONAS[0],
      state: {
        id: 'test',
        phase: 'speaking' as const,
        emotion: 'excited' as const,
        confidence: 0.8,
        lastActivity: new Date(),
        speakingIntensity: 0.9,
        isSupported: false
      },
      isActive: true,
      currentPhase: BiddingPhase.AGENT_DISCUSSION,
      onSupport: vi.fn(),
      currentBid: 150
    }} />)

    expect(screen.getByText('发言中')).toBeInTheDocument()
  })
})

describe('性能基准测试', () => {
  test('AgentDialogPanel渲染性能', () => {
    const startTime = performance.now()

    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<AgentDialogPanel {...{
        agent: AI_PERSONAS[i % AI_PERSONAS.length],
        state: {
          id: `test-${i}`,
          phase: 'speaking' as const,
          emotion: 'excited' as const,
          confidence: Math.random(),
          lastActivity: new Date(),
          speakingIntensity: Math.random(),
          isSupported: false,
          currentMessage: `测试消息 ${i}`
        },
        isActive: i % 2 === 0,
        currentPhase: BiddingPhase.AGENT_BIDDING,
        onSupport: vi.fn(),
        currentBid: Math.floor(Math.random() * 200)
      }} />)

      unmount()
    }

    const endTime = performance.now()
    const averageRenderTime = (endTime - startTime) / 100

    // 平均渲染时间应该小于5毫秒
    expect(averageRenderTime).toBeLessThan(5)
  })

  test('状态管理器批量操作性能', () => {
    const manager = new AgentStateManager()
    const startTime = performance.now()

    // 批量状态更新
    const updates = Array.from({ length: 1000 }, (_, i) => ({
      agentId: `agent-${i % 5}`,
      updates: {
        phase: 'speaking' as const,
        emotion: 'excited' as const,
        confidence: Math.random()
      }
    }))

    manager.batchUpdateStates(updates)

    const endTime = performance.now()
    const processingTime = endTime - startTime

    // 批量处理时间应该小于50毫秒
    expect(processingTime).toBeLessThan(50)

    manager.dispose()
  })
})

// 集成测试
describe('系统集成测试', () => {
  test('完整的Agent状态更新流程', async () => {
    const { result } = renderHook(() => useAgentStates({
      currentPhase: BiddingPhase.AGENT_BIDDING
    }))

    // 模拟WebSocket消息
    act(() => {
      result.current.handleWebSocketMessage({
        type: 'agent_speaking',
        personaId: 'tech-pioneer-alex',
        payload: {
          message: '这是一个很有前景的创意！',
          emotion: 'excited',
          confidence: 0.9
        }
      })
    })

    // 验证状态更新
    expect(result.current.agentStates['tech-pioneer-alex'].currentMessage)
      .toBe('这是一个很有前景的创意！')
    expect(result.current.agentStates['tech-pioneer-alex'].emotion)
      .toBe('excited')
  })

  test('阶段切换应该正确更新权限', () => {
    const { result, rerender } = renderHook(
      ({ phase }) => useAgentStates({ currentPhase: phase }),
      { initialProps: { phase: BiddingPhase.IDEA_INPUT } }
    )

    // 初始阶段权限
    expect(result.current.currentPermissions.canUserInput).toBe(true)
    expect(result.current.currentPermissions.userSupplementAllowed).toBe(false)

    // 切换到补充阶段
    rerender({ phase: BiddingPhase.USER_SUPPLEMENT })

    expect(result.current.currentPermissions.canUserInput).toBe(true)
    expect(result.current.currentPermissions.userSupplementAllowed).toBe(true)
  })
})

export default {
  // 导出测试工具函数
  createMockAgent: (overrides = {}) => ({
    ...AI_PERSONAS[0],
    ...overrides
  }),

  createMockState: (overrides = {}): AgentState => ({
    id: 'test-agent',
    phase: 'idle',
    emotion: 'neutral',
    confidence: 0.5,
    lastActivity: new Date(),
    speakingIntensity: 0.8,
    isSupported: false,
    ...overrides
  })
}