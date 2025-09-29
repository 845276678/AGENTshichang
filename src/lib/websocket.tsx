import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'

interface WebSocketContextType {
  socket: Socket | null
  isConnected: boolean
  sendMessage: (event: string, data: any) => void
  subscribe: (event: string, handler: (data: any) => void) => () => void
}

const WebSocketContext = createContext<WebSocketContextType | null>(null)

interface WebSocketProviderProps {
  children: ReactNode
  sessionId?: string
}

export function WebSocketProvider({ children, sessionId }: WebSocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000', {
      query: { sessionId }
    })

    newSocket.on('connect', () => {
      setIsConnected(true)
      console.log('WebSocket connected:', newSocket.id)
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
      console.log('WebSocket disconnected')
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [sessionId])

  const sendMessage = (event: string, data: any) => {
    if (socket && isConnected) {
      socket.emit(event, data)
    }
  }

  const subscribe = (event: string, handler: (data: any) => void) => {
    if (socket) {
      socket.on(event, handler)
      return () => socket.off(event, handler)
    }
    return () => {}
  }

  return (
    <WebSocketContext.Provider value={{ socket, isConnected, sendMessage, subscribe }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return context
}

// 竞价会话相关的 hooks
export function useBiddingSession(sessionId: string) {
  const { sendMessage, subscribe, isConnected } = useWebSocket()
  const [sessionData, setSessionData] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [bids, setBids] = useState<any[]>([])

  useEffect(() => {
    const unsubscribeSession = subscribe('session:update', (data) => {
      setSessionData(data)
    })

    const unsubscribeMessage = subscribe('message:new', (message) => {
      setMessages(prev => [...prev, message])
    })

    const unsubscribeBid = subscribe('bid:new', (bid) => {
      setBids(prev => [...prev, bid])
    })

    // 加入会话
    if (isConnected) {
      sendMessage('session:join', { sessionId })
    }

    return () => {
      unsubscribeSession()
      unsubscribeMessage()
      unsubscribeBid()
    }
  }, [sessionId, isConnected, sendMessage, subscribe])

  const sendUserMessage = (content: string, round: number) => {
    sendMessage('message:send', {
      sessionId,
      content,
      round,
      type: 'user'
    })
  }

  const submitPrediction = (prediction: number, stakeAmount: number = 10) => {
    sendMessage('prediction:submit', {
      sessionId,
      prediction,
      stakeAmount
    })
  }

  return {
    sessionData,
    messages,
    bids,
    sendUserMessage,
    submitPrediction,
    isConnected
  }
}