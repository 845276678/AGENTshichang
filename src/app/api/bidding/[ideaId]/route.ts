import { NextRequest, NextResponse } from 'next/server';
import { handleBiddingWebSocket } from '@/lib/websocket-mock-server';

export async function GET(
  request: NextRequest,
  { params }: { params: { ideaId: string } }
) {
  try {
    const { ideaId } = params;

    // 模拟WebSocket握手响应
    // 在生产环境中，这里会升级到WebSocket协议
    return handleBiddingWebSocket(request, ideaId);
  } catch (error) {
    console.error('WebSocket connection error:', error);
    return NextResponse.json(
      { error: 'Failed to establish WebSocket connection' },
      { status: 500 }
    );
  }
}