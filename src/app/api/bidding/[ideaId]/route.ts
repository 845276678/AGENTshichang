import { NextRequest, NextResponse } from 'next/server';
import { handleRealBiddingWebSocket } from '@/lib/real-ai-websocket-server';

export async function GET(
  request: NextRequest,
  { params }: { params: { ideaId: string } }
) {
  try {
    const { ideaId } = params;

    // 使用真实AI WebSocket服务器
    // 在生产环境中，这里会升级到WebSocket协议
    return handleRealBiddingWebSocket(request, ideaId);
  } catch (error) {
    console.error('Real AI WebSocket connection error:', error);
    return NextResponse.json(
      { error: 'Failed to establish Real AI WebSocket connection' },
      { status: 500 }
    );
  }
}