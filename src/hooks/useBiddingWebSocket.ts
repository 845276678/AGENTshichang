import { useState, useEffect, useRef, useCallback } from 'react';
import { AIMessage, BiddingEvent, type AIPersona, AI_PERSONAS, DISCUSSION_PHASES } from '@/lib/ai-persona-system';

export interface BiddingWebSocketData {
  // 连接状态
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error' | 'mock';

  // 实时数据
  currentPhase: 'warmup' | 'discussion' | 'bidding' | 'prediction' | 'result';
  timeRemaining: number;
  viewerCount: number;

  // AI 相关
  aiMessages: AIMessage[];
  activeSpeaker: string | null;
  currentBids: Record<string, number>;
  highestBid: number;
  biddingEvents: BiddingEvent[];

  // 用户互动
  userReactions: Record<string, number>;
  supportedPersona: string | null;
  userPrediction: number | null;

  // 成本控制
  sessionCost: number;
  costThresholdReached: boolean;
}

export interface BiddingWebSocketActions {
  // 用户操作
  sendReaction: (messageId: string, reactionType: string) => void;
  supportPersona: (personaId: string) => void;
  submitPrediction: (prediction: number) => void;
  sendMessage: (content: string) => void;

  // 连接控制
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
}

interface UseBiddingWebSocketOptions {
  ideaId: string;
  userId?: string;
  autoConnect?: boolean;
  reconnectAttempts?: number;
  heartbeatInterval?: number;
  enableMockMode?: boolean; // 启用模拟模式
}

export function useBiddingWebSocket({
  ideaId,
  userId,
  autoConnect = true,
  reconnectAttempts = 5,
  heartbeatInterval = 30000,
  enableMockMode = true // 默认启用模拟模式
}: UseBiddingWebSocketOptions): BiddingWebSocketData & BiddingWebSocketActions {
  // 连接相关状态
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error' | 'mock'>('disconnected');
  const [reconnectCount, setReconnectCount] = useState(0);
  const [isMockMode, setIsMockMode] = useState(false);

  // WebSocket引用和定时器
  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mockTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 竞价相关状态
  const [currentPhase, setCurrentPhase] = useState<'warmup' | 'discussion' | 'bidding' | 'prediction' | 'result'>('warmup');
  const [timeRemaining, setTimeRemaining] = useState(120); // 2分钟默认
  const [viewerCount, setViewerCount] = useState(1);

  // AI 相关状态
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [currentBids, setCurrentBids] = useState<Record<string, number>>({});
  const [highestBid, setHighestBid] = useState(50);
  const [biddingEvents, setBiddingEvents] = useState<BiddingEvent[]>([]);

  // 用户互动状态
  const [userReactions, setUserReactions] = useState<Record<string, number>>({});
  const [supportedPersona, setSupportedPersona] = useState<string | null>(null);
  const [userPrediction, setUserPrediction] = useState<number | null>(null);

  // 成本控制状态
  const [sessionCost, setSessionCost] = useState(0);
  const [costThresholdReached, setCostThresholdReached] = useState(false);

  // WebSocket URL构建
  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const token = localStorage.getItem('auth.access_token');
    return `${protocol}//${host}/api/bidding/${ideaId}?token=${token}&userId=${userId || 'anonymous'}`;
  }, [ideaId, userId]);

  // 发送消息到WebSocket
  const sendMessage = useCallback((data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
      return true;
    }
    return false;
  }, []);

  // 处理WebSocket消息
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'stage.started':
          setCurrentPhase(data.payload.phase);
          setTimeRemaining(data.payload.duration);
          break;

        case 'persona.speech':
          setAiMessages(prev => [...prev.slice(-19), {
            id: data.payload.messageId,
            personaId: data.payload.personaId,
            phase: currentPhase,
            round: data.payload.round || 1,
            type: 'speech',
            content: data.payload.content,
            emotion: data.payload.emotion || 'neutral',
            timestamp: new Date(data.payload.timestamp),
            cost: data.payload.cost,
            tokens: data.payload.tokens
          }]);
          setActiveSpeaker(data.payload.personaId);
          setTimeout(() => setActiveSpeaker(null), 2000);
          break;

        case 'bid.placed':
          setCurrentBids(prev => ({
            ...prev,
            [data.payload.personaId]: data.payload.bidValue
          }));
          setHighestBid(prev => Math.max(prev, data.payload.bidValue));

          // 添加竞价消息
          setAiMessages(prev => [...prev.slice(-19), {
            id: data.payload.messageId,
            personaId: data.payload.personaId,
            phase: currentPhase,
            round: data.payload.round || 1,
            type: 'bid',
            content: data.payload.content || `出价 ${data.payload.bidValue} 积分！`,
            emotion: 'excited',
            bidValue: data.payload.bidValue,
            timestamp: new Date(data.payload.timestamp)
          }]);
          break;

        case 'persona.reaction':
          setBiddingEvents(prev => [...prev.slice(-9), {
            id: data.payload.eventId,
            type: data.payload.reactionType,
            personaId: data.payload.personaId,
            targetPersonaId: data.payload.targetPersonaId,
            content: data.payload.content,
            emotion: data.payload.emotion,
            timestamp: new Date(data.payload.timestamp),
            userReactions: data.payload.userReactions || { likes: 0, surprises: 0, supports: 0 }
          }]);
          break;

        case 'viewer.count':
          setViewerCount(data.payload.count);
          break;

        case 'timer.update':
          setTimeRemaining(data.payload.remaining);
          break;

        case 'cost.update':
          setSessionCost(data.payload.totalCost);
          setCostThresholdReached(data.payload.thresholdReached);
          break;

        case 'stage.ended':
          setCurrentPhase('result');
          // 处理结果数据
          break;

        case 'system.warning':
          console.warn('Bidding System Warning:', data.payload.message);
          break;

        case 'error':
          console.error('Bidding WebSocket Error:', data.payload);
          break;

        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }, [currentPhase]);

  // 启动模拟模式
  const startMockMode = useCallback(() => {
    setIsMockMode(true);
    setConnectionStatus('mock');
    setViewerCount(Math.floor(Math.random() * 50) + 15);

    // 启动阶段计时器
    let phaseTime = 120; // 预热阶段2分钟
    setTimeRemaining(phaseTime);

    const phaseTimer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // 切换阶段
          const phases: typeof currentPhase[] = ['warmup', 'discussion', 'bidding', 'prediction', 'result'];
          const currentIndex = phases.indexOf(currentPhase);

          if (currentIndex < phases.length - 1) {
            const nextPhase = phases[currentIndex + 1];
            setCurrentPhase(nextPhase);

            // 设置下一阶段时长
            const durations = { warmup: 120, discussion: 720, bidding: 1200, prediction: 240, result: 300 };
            const nextDuration = durations[nextPhase];
            setTimeRemaining(nextDuration);
            return nextDuration;
          } else {
            clearInterval(phaseTimer);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    // 启动AI对话生成器
    const dialogueTimer = setInterval(() => {
      if (Math.random() < 0.15) { // 15%概率生成对话
        generateMockDialogue();
      }
    }, 3000);

    mockTimerRef.current = dialogueTimer;

    return () => {
      clearInterval(phaseTimer);
      clearInterval(dialogueTimer);
    };
  }, [currentPhase]);

  // 生成模拟AI对话
  const generateMockDialogue = useCallback(() => {
    const persona = AI_PERSONAS[Math.floor(Math.random() * AI_PERSONAS.length)];

    let content = '';
    let type: AIMessage['type'] = 'speech';
    let bidValue: number | undefined;

    // 根据阶段生成内容
    switch (currentPhase) {
      case 'warmup':
        content = `${persona.catchPhrase} 这个创意很有潜力！`;
        break;
      case 'discussion':
        const questions = [
          '技术实现的可行性如何？',
          '目标用户群体是什么？',
          '商业模式的核心在哪里？',
          '市场竞争如何？'
        ];
        content = questions[Math.floor(Math.random() * questions.length)];
        break;
      case 'bidding':
        if (Math.random() > 0.6) {
          type = 'bid';
          const currentBid = currentBids[persona.id] || 50;
          bidValue = currentBid + Math.floor(Math.random() * 25) + 5;
          setCurrentBids(prev => ({ ...prev, [persona.id]: bidValue! }));
          setHighestBid(prev => Math.max(prev, bidValue!));
          content = `出价 ${bidValue} 积分！我看好这个项目！`;
        } else {
          content = '这个价格还不够体现真正价值！';
        }
        break;
      case 'prediction':
        content = `我预测最终价格会在 ${Math.floor(Math.random() * 100) + 200} 积分左右`;
        break;
      case 'result':
        content = '恭喜！这是一个公平的结果。';
        break;
    }

    const newMessage: AIMessage = {
      id: Date.now().toString() + Math.random(),
      personaId: persona.id,
      phase: currentPhase,
      round: Math.floor(aiMessages.length / 5) + 1,
      type,
      content,
      emotion: type === 'bid' ? 'excited' : 'confident',
      bidValue,
      timestamp: new Date()
    };

    setAiMessages(prev => [...prev.slice(-19), newMessage]);
    setActiveSpeaker(persona.id);
    setTimeout(() => setActiveSpeaker(null), 2500);
  }, [currentPhase, currentBids, aiMessages.length]);

  // 连接WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    if (isMockMode) return;

    setConnectionStatus('connecting');

    // 首先尝试WebSocket连接，失败后启用模拟模式
    if (enableMockMode) {
      console.log('Starting in mock mode for development');
      setTimeout(startMockMode, 1000);
      return;
    }

    try {
      const ws = new WebSocket(getWebSocketUrl());

      ws.onopen = () => {
        setConnectionStatus('connected');
        setReconnectCount(0);

        // 发送初始化消息
        ws.send(JSON.stringify({
          type: 'client.init',
          payload: {
            ideaId,
            userId,
            timestamp: Date.now()
          }
        }));

        // 启动心跳
        if (heartbeatRef.current) clearInterval(heartbeatRef.current);
        heartbeatRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }));
          }
        }, heartbeatInterval);
      };

      ws.onmessage = handleMessage;

      ws.onclose = (event) => {
        setConnectionStatus('disconnected');
        if (heartbeatRef.current) {
          clearInterval(heartbeatRef.current);
          heartbeatRef.current = null;
        }

        // 尝试重连
        if (reconnectCount < reconnectAttempts && !event.wasClean) {
          setReconnectCount(prev => prev + 1);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, Math.min(1000 * Math.pow(2, reconnectCount), 30000)); // 指数退避，最大30秒
        }
      };

      ws.onerror = (error) => {
        setConnectionStatus('error');
        console.error('WebSocket error:', error);
      };

      wsRef.current = ws;
    } catch (error) {
      setConnectionStatus('error');
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [getWebSocketUrl, handleMessage, reconnectCount, reconnectAttempts, heartbeatInterval, ideaId, userId]);

  // 断开连接
  const disconnect = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnect');
      wsRef.current = null;
    }

    setConnectionStatus('disconnected');
  }, []);

  // 重连
  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(connect, 1000);
  }, [disconnect, connect]);

  // 用户操作方法
  const sendReaction = useCallback((messageId: string, reactionType: string) => {
    const success = sendMessage({
      type: 'user.reaction',
      payload: {
        messageId,
        reactionType,
        timestamp: Date.now()
      }
    });

    if (success) {
      setUserReactions(prev => ({
        ...prev,
        [messageId]: (prev[messageId] || 0) + 1
      }));
    }

    return success;
  }, [sendMessage]);

  const supportPersona = useCallback((personaId: string) => {
    const success = sendMessage({
      type: 'user.support',
      payload: {
        personaId,
        timestamp: Date.now()
      }
    });

    if (success) {
      setSupportedPersona(personaId);
    }

    return success;
  }, [sendMessage]);

  const submitPrediction = useCallback((prediction: number) => {
    const success = sendMessage({
      type: 'user.prediction',
      payload: {
        prediction,
        timestamp: Date.now()
      }
    });

    if (success) {
      setUserPrediction(prediction);
    }

    return success;
  }, [sendMessage]);

  const sendUserMessage = useCallback((content: string) => {
    return sendMessage({
      type: 'user.message',
      payload: {
        content,
        timestamp: Date.now()
      }
    });
  }, [sendMessage]);

  // 自动连接
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect]); // 不包含 connect 和 disconnect，避免重复连接

  // 清理定时器
  useEffect(() => {
    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, []);

  return {
    // 数据状态
    isConnected: connectionStatus === 'connected' || connectionStatus === 'mock',
    connectionStatus,
    currentPhase,
    timeRemaining,
    viewerCount,
    aiMessages,
    activeSpeaker,
    currentBids,
    highestBid,
    biddingEvents,
    userReactions,
    supportedPersona,
    userPrediction,
    sessionCost,
    costThresholdReached,

    // 操作方法
    sendReaction,
    supportPersona,
    submitPrediction,
    sendMessage: sendUserMessage,
    connect,
    disconnect,
    reconnect
  };
}