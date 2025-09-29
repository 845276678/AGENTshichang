'use client'

import React, { useState, useEffect } from 'react'
import { AgentDialogPanel, getDefaultAgentState, BiddingPhase, type AgentState } from './AgentDialogPanel'
import { AI_PERSONAS } from '@/lib/ai-persona-system'
import { Button } from '@/components/ui/button'

export const AgentDialogPanelDemo = () => {
  const [currentPhase, setCurrentPhase] = useState<BiddingPhase>(BiddingPhase.IDEA_INPUT)
  const [agentStates, setAgentStates] = useState<Record<string, AgentState>>({})

  // Initialize agent states
  useEffect(() => {
    const initialStates = AI_PERSONAS.reduce((acc, agent) => {
      acc[agent.id] = getDefaultAgentState(agent.id)
      return acc
    }, {} as Record<string, AgentState>)
    setAgentStates(initialStates)
  }, [])

  // Demo message cycling
  useEffect(() => {
    const messages = [
      '这个创意很有潜力，我看到了技术实现的可能性...',
      '从商业角度来说，市场前景非常广阔！',
      '用户体验设计需要更加人性化的考虑。',
      '这个趋势把握得很准，能够抓住市场热点！',
      '从理论角度分析，这个方案有扎实的基础...'
    ]

    const emotions: Array<AgentState['emotion']> = ['excited', 'confident', 'neutral', 'worried']
    const phases: Array<AgentState['phase']> = ['thinking', 'speaking', 'idle', 'bidding', 'waiting']

    const interval = setInterval(() => {
      setAgentStates(prev => {
        const newStates = { ...prev }
        AI_PERSONAS.forEach((agent, index) => {
          if (newStates[agent.id]) {
            newStates[agent.id] = {
              ...newStates[agent.id],
              currentMessage: messages[index],
              emotion: emotions[Math.floor(Math.random() * emotions.length)],
              phase: phases[Math.floor(Math.random() * phases.length)],
              confidence: Math.random(),
              speakingIntensity: 0.3 + Math.random() * 0.7,
              lastActivity: new Date()
            }
          }
        })
        return newStates
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const handleSupport = (agentId: string) => {
    setAgentStates(prev => ({
      ...prev,
      [agentId]: {
        ...prev[agentId],
        isSupported: !prev[agentId].isSupported
      }
    }))
  }

  const getCurrentBid = (agentId: string): number | undefined => {
    if (currentPhase === BiddingPhase.AGENT_BIDDING || currentPhase === BiddingPhase.USER_SUPPLEMENT) {
      // Demo bid values - including 0 bids and high bids for testing animations
      const bids: Record<string, number> = {
        'tech-pioneer-alex': 150,
        'business-tycoon-wang': 0,    // Test 0 bid display
        'artistic-lin': 80,
        'trend-master-allen': 120,
        'scholar-li': 0               // Test another 0 bid
      }
      return bids[agentId]
    }
    return undefined
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Phase Controls */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold mb-4">AgentDialogPanel Demo</h1>
          <div className="flex gap-2 justify-center flex-wrap">
            {Object.values(BiddingPhase).map(phase => (
              <Button
                key={phase}
                variant={currentPhase === phase ? 'default' : 'outline'}
                onClick={() => setCurrentPhase(phase)}
                size="sm"
              >
                {phase.replace('_', ' ')}
              </Button>
            ))}
          </div>
          <p className="mt-2 text-sm text-gray-600">当前阶段: {currentPhase}</p>
        </div>

        {/* Agent Panels Grid */}
        <div className="agents-grid grid grid-cols-5 gap-6 max-w-5xl mx-auto">
          {AI_PERSONAS.map((agent, index) => (
            <AgentDialogPanel
              key={agent.id}
              agent={agent}
              state={agentStates[agent.id] || getDefaultAgentState(agent.id)}
              isActive={index === 1} // Make second agent active for demo
              currentPhase={currentPhase}
              onSupport={() => handleSupport(agent.id)}
              currentBid={getCurrentBid(agent.id)}
              className="w-full"
            />
          ))}
        </div>

        {/* Debug Info */}
        <div className="mt-8 p-4 bg-white rounded-lg shadow">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Current Phase: <span className="font-mono">{currentPhase}</span></div>
            <div>Active Agents: {Object.values(agentStates).filter(state => state.phase !== 'idle').length}</div>
            <div>Speaking: {Object.values(agentStates).filter(state => state.phase === 'speaking').length}</div>
            <div>Zero Bids: {AI_PERSONAS.filter(agent => getCurrentBid(agent.id) === 0).length}</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .agents-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        @media (max-width: 1279px) {
          .agents-grid {
            grid-template-columns: repeat(3, minmax(200px, 1fr));
          }
        }

        @media (max-width: 1023px) {
          .agents-grid {
            grid-template-columns: repeat(3, minmax(180px, 1fr));
            gap: 1rem;
          }
          .agents-grid > :nth-child(4),
          .agents-grid > :nth-child(5) {
            justify-self: center;
          }
        }

        @media (max-width: 767px) {
          .agents-grid {
            grid-template-columns: repeat(2, minmax(160px, 1fr));
            gap: 0.75rem;
          }
          .agents-grid > :last-child {
            grid-column: span 2;
            justify-self: center;
          }
        }
      `}</style>
    </div>
  )
}

export default AgentDialogPanelDemo