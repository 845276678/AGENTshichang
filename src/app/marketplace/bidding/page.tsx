'use client'

import React, { Suspense, lazy } from 'react'
import { useSearchParams } from 'next/navigation'

// 使用React.lazy而不是next/dynamic来避免Next.js特定的问题
const StageBasedBidding = lazy(() =>
  import('@/components/bidding/StageBasedBidding').catch(err => {
    console.error('Failed to load StageBasedBidding:', err)
    // 返回一个fallback组件
    return Promise.resolve({
      default: () => (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="text-red-600 text-lg">⚠️</div>
            <p className="text-gray-600">组件加载失败，请刷新页面重试</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              刷新页面
            </button>
          </div>
        </div>
      )
    })
  })
)

// 简单的loading组件，避免使用Tailwind类名
const LoadingComponent = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    flexDirection: 'column',
    gap: '16px',
    backgroundColor: '#fafafa'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '4px solid #e5e7eb',
      borderTopColor: '#3b82f6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <p style={{ color: '#6b7280', fontSize: '16px' }}>正在加载AI竞价舞台...</p>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
)

function BiddingPageContent() {
  const searchParams = useSearchParams()
  const ideaId = searchParams?.get('ideaId') || 'demo-idea-001'
  const autoStart = searchParams?.get('autoStart') === '1' ||
                    searchParams?.get('autoStart')?.toLowerCase() === 'true'

  return (
    <div suppressHydrationWarning style={{ minHeight: '100vh' }}>
      <StageBasedBidding ideaId={ideaId} autoStart={autoStart} />
    </div>
  )
}

// 重构后的创意竞价页面 - 使用React.lazy减少初始化问题
export default function MVPBiddingPage() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <BiddingPageContent />
    </Suspense>
  )
}