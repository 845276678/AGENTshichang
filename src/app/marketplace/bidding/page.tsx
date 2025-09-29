'use client'

import React from 'react'
import StageBasedBidding from '@/components/bidding/StageBasedBidding'
import { useSearchParams } from 'next/navigation'

// 重构后的创意竞价页面 - 水平舞台设计，AI中心化
export default function MVPBiddingPage() {
  const searchParams = useSearchParams()
  const ideaId = searchParams.get('ideaId') || 'demo-idea-001'
  const autoStart = searchParams.get('autoStart') === '1' || searchParams.get('autoStart')?.toLowerCase() === 'true'

  return <StageBasedBidding ideaId={ideaId} autoStart={autoStart} />
}