'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Layout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageCircle, Heart } from 'lucide-react'

export default function AboutPage() {
  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6 mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              关于我们
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              欢迎来到AI创意竞价平台
            </p>
          </motion.div>

          {/* Contact Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="text-center text-2xl flex items-center justify-center gap-2">
                  <MessageCircle className="w-6 h-6 text-primary" />
                  联系我们
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* WeChat QR Code */}
                <div className="flex flex-col items-center space-y-6">
                  <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-2xl border-4 border-primary/10">
                    <Image
                      src="/wechat-qrcode.jpg"
                      alt="微信二维码"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>

                  <div className="text-center space-y-4 max-w-2xl">
                    <div className="flex items-center justify-center gap-2 text-primary">
                      <Heart className="w-5 h-5" />
                      <h3 className="text-xl font-semibold">欢迎添加我反馈您的建议</h3>
                    </div>

                    <p className="text-lg text-muted-foreground leading-relaxed">
                      同时您若有其他AI方面的问题，而我又恰好能解决，那我可以帮助您
                    </p>

                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-sm text-muted-foreground">
                        扫描上方二维码添加微信，期待与您交流 ✨
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-center text-muted-foreground"
          >
            <p className="text-sm">
              感谢您使用我们的平台，期待听到您的宝贵意见！
            </p>
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}
