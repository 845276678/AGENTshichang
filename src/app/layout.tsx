import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { CartProvider } from '@/contexts/CartContext'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  metadataBase: new URL('https://aijiayuan.top'),
  title: {
    default: 'AI创意家园 - AI Agent Market - 发现、部署、变现AI智能体',
    template: '%s | AI创意家园'
  },
  description: '全球最大的AI智能体交易平台。发现强大的AI智能体，即时部署，变现您的创意。AI创意竞价、专家评估、商业计划生成一站式服务。',
  keywords: [
    'AI智能体',
    'AI创意竞价',
    'AI专家评估',
    '人工智能',
    '智能体市场',
    'AI工具',
    '机器学习',
    '创意变现',
    '商业计划'
  ],
  authors: [{ name: 'AI创意家园团队' }],
  creator: 'AI创意家园',
  other: {
    'charset': 'utf-8'
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://aijiayuan.top',
    siteName: 'AI创意家园',
    title: 'AI创意家园 - 创意竞价与智能评估平台',
    description: '全球领先的AI创意竞价平台，让AI专家为您的创意进行智能评估和竞价',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI创意家园'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Agent Market',
    description: 'The world\'s largest marketplace for AI agents',
    images: ['/twitter-image.png'],
    creator: '@aiagentmarket'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className={inter.variable}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className={`font-sans antialiased ${inter.className}`} style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif' }}>
        <AuthProvider>
          <CartProvider>
            <div id="root">
              {children}
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}