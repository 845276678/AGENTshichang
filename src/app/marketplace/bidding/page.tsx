'use client'

import React, { Suspense, lazy } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'

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

  // 为每个标签页生成唯一的sessionId，解决多标签页数据串联问题
  const [sessionId, setSessionId] = React.useState<string>('')

  React.useEffect(() => {
    // 从URL获取ideaId，如果没有则生成唯一的sessionId
    const urlIdeaId = searchParams?.get('ideaId')

    if (urlIdeaId) {
      // 如果URL有ideaId，使用它
      setSessionId(urlIdeaId)
    } else {
      // 否则为当前标签页生成唯一ID
      // 使用 timestamp + random 确保唯一性
      const uniqueId = `bidding-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      setSessionId(uniqueId)
      console.log('🆔 Generated unique session ID for this tab:', uniqueId)
    }
  }, [searchParams])

  const autoStart = searchParams?.get('autoStart') === '1' ||
                    searchParams?.get('autoStart')?.toLowerCase() === 'true'

  // 等待sessionId生成后再渲染组件
  if (!sessionId) {
    return <LoadingComponent />
  }

  return (
    <div suppressHydrationWarning style={{ minHeight: '100vh' }}>
      <StageBasedBidding ideaId={sessionId} autoStart={autoStart} />
    </div>
  )
}

// 重构后的创意竞价页面 - 使用React.lazy减少初始化问题
export default function MVPBiddingPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<LoadingComponent />}>
        <BiddingPageContent />
      </Suspense>
    </>
  )
}