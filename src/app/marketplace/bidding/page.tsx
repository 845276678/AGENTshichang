'use client'

import React from 'react'
import CreativeIdeaBidding from '@/components/bidding/CreativeIdeaBidding'
import { useSearchParams } from 'next/navigation'

// 重构后的创意竞价页面 - 提升用户停留时间和娱乐性
export default function MVPBiddingPage() {
  const searchParams = useSearchParams()
  const ideaId = searchParams.get('ideaId') || 'demo-idea-001'

  return <CreativeIdeaBidding ideaId={ideaId} />
}