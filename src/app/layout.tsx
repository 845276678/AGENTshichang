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
  title: {
    default: 'AI Agent Market - Discover, Deploy, and Monetize AI Agents',
    template: '%s | AI Agent Market'
  },
  description: 'The world\'s largest marketplace for AI agents. Discover powerful AI agents, deploy them instantly, and monetize your own creations.',
  keywords: [
    'AI agents',
    'artificial intelligence',
    'marketplace',
    'automation',
    'AI tools',
    'machine learning'
  ],
  authors: [{ name: 'AI Agent Market Team' }],
  creator: 'AI Agent Market',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://aiagentmarket.com',
    siteName: 'AI Agent Market',
    title: 'AI Agent Market - Discover, Deploy, and Monetize AI Agents',
    description: 'The world\'s largest marketplace for AI agents. Discover powerful AI agents, deploy them instantly, and monetize your own creations.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI Agent Market'
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
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className={`font-sans antialiased ${inter.className}`}>
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