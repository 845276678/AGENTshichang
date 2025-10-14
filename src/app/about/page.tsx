'use client'

import React from 'react'
import { Layout } from '@/components/layout'

export default function AboutPage() {
  return (
    <Layout>
      <div className="container py-16">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold">联系我们</h1>
          <p className="text-muted-foreground">如有任何问题，请通过微信与我联系</p>
          <div className="flex items-center justify-center">
            <img
              src="/wechat-qr.jpg"
              alt="微信二维码"
              className="w-56 h-56 object-cover rounded-md border"
            />
          </div>
          <p className="text-sm text-muted-foreground">扫码添加微信，我会尽快为您处理</p>
        </div>
      </div>
    </Layout>
  )
}