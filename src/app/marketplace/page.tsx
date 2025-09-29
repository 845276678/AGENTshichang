'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MarketplacePage() {
  const router = useRouter()

  useEffect(() => {
    // 立即重定向到创意竞价页面
    router.replace('/marketplace/bidding')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
        <p className="text-gray-600">正在跳转到创意竞价页面...</p>
      </div>
    </div>
  )
}