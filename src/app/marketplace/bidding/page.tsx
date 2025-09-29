'use client'

import React, { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'

// 动态导入组件以避免初始化错误
const StageBasedBidding = dynamic(
  () => import('@/components/bidding/StageBasedBidding'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">正在加载AI竞价舞台...</p>
        </div>
      </div>
    )
  }
)

function BiddingPageContent() {
  const searchParams = useSearchParams()
  const ideaId = searchParams?.get('ideaId') || 'demo-idea-001'
  const autoStart = searchParams?.get('autoStart') === '1' || searchParams?.get('autoStart')?.toLowerCase() === 'true'

  return <StageBasedBidding ideaId={ideaId} autoStart={autoStart} />
}

// 重构后的创意竞价页面 - 水平舞台设计，AI中心化
export default function MVPBiddingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">正在初始化页面...</p>
        </div>
      </div>
    }>
      <BiddingPageContent />
    </Suspense>
  )
}