'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Layout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  AlertCircle,
  CreditCard,
  RefreshCcw,
  MessageCircle,
  ArrowLeft,
  Phone,
  Mail,
  ExternalLink,
  Shield,
  Clock,
  HelpCircle
} from 'lucide-react'

const CommonIssues = () => {
  const issues = [
    {
      issue: 'Insufficient Funds',
      solution: 'Please check your account balance or try a different payment method.',
      icon: CreditCard
    },
    {
      issue: 'Expired Card',
      solution: 'Update your card information with a valid expiration date.',
      icon: Clock
    },
    {
      issue: 'Security Hold',
      solution: 'Contact your bank to authorize the transaction.',
      icon: Shield
    },
    {
      issue: 'Network Timeout',
      solution: 'Check your internet connection and try again.',
      icon: RefreshCcw
    }
  ]

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Common Issues & Solutions</h3>
      <div className="grid md:grid-cols-2 gap-4">
        {issues.map((item, index) => (
          <Card key={index} className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <div className="font-medium text-sm">{item.issue}</div>
                  <div className="text-sm text-muted-foreground mt-1">{item.solution}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

const ContactSupport = () => {
  const supportOptions = [
    {
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      icon: MessageCircle,
      action: 'Start Chat',
      href: '/support/chat',
      available: true
    },
    {
      title: 'Email Support',
      description: 'Send us a detailed message about your issue',
      icon: Mail,
      action: 'Send Email',
      href: 'mailto:support@aiagentmarket.com',
      available: true
    },
    {
      title: 'Phone Support',
      description: 'Speak directly with our support team',
      icon: Phone,
      action: 'Call Now',
      href: 'tel:+1-555-0123',
      available: false,
      availableTime: 'Mon-Fri, 9 AM - 6 PM PST'
    }
  ]

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Need Help? Contact Support</h3>
      <div className="grid md:grid-cols-3 gap-4">
        {supportOptions.map((option, index) => (
          <Card key={index} className={`text-center ${!option.available ? 'opacity-60' : ''}`}>
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <option.icon className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">{option.title}</h4>
              <p className="text-sm text-muted-foreground mb-4">{option.description}</p>
              {option.available ? (
                <Button size="sm" variant="outline" asChild>
                  <Link href={option.href}>
                    {option.action}
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Link>
                </Button>
              ) : (
                <div className="text-xs text-muted-foreground">
                  Available: {option.availableTime}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

const TroubleshootingSteps = () => {
  const steps = [
    'Verify your payment information is correct',
    'Check if your card has sufficient funds',
    'Ensure your billing address matches your card',
    'Try using a different payment method',
    'Contact your bank if the issue persists'
  ]

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Troubleshooting Steps</h3>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {index + 1}
                </div>
                <div className="text-sm">{step}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function CheckoutFailedPage() {
  return (
    <Layout>
      <div className="container py-12">
        {/* Failed Header */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          
          <h1 className="text-4xl font-bold mb-4">Payment Failed</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We weren't able to process your payment. Don't worry - your items are still saved in your cart.
          </p>
        </motion.div>

        {/* Error Details */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-12"
        >
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                Payment Error Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div><strong>Error Code:</strong> PAYMENT_DECLINED</div>
                <div><strong>Transaction ID:</strong> TXN_{Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
                <div><strong>Timestamp:</strong> {new Date().toLocaleString()}</div>
                <div className="text-muted-foreground">
                  Your payment was declined by your financial institution. This is usually a temporary issue that can be resolved quickly.
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/checkout">
                <RefreshCcw className="w-4 h-4 mr-2" />
                Try Again
              </Link>
            </Button>
            
            <Button size="lg" variant="outline" asChild>
              <Link href="/cart">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Cart
              </Link>
            </Button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Troubleshooting */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-8"
          >
            <TroubleshootingSteps />
            <CommonIssues />
          </motion.div>

          {/* Right Column - Support */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="space-y-8"
          >
            <ContactSupport />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-1">Why was my payment declined?</h4>
                  <p className="text-sm text-muted-foreground">
                    Payment declines can happen for various reasons including insufficient funds, expired cards, or security holds by your bank.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-1">Will I be charged multiple times if I retry?</h4>
                  <p className="text-sm text-muted-foreground">
                    No, you'll only be charged when a payment is successfully processed. Failed attempts don't result in charges.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-1">How long should I wait before trying again?</h4>
                  <p className="text-sm text-muted-foreground">
                    You can retry immediately. If the issue persists, wait 15-30 minutes or contact your bank.
                  </p>
                </div>
                
                <Button size="sm" variant="outline" asChild className="w-full mt-4">
                  <Link href="/support/faq">
                    View All FAQs
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Security Notice */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-12"
        >
          <Card className="bg-blue-50/50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Your Information is Secure</h3>
                  <p className="text-sm text-blue-800">
                    Your payment information is encrypted and protected. We use industry-standard security measures 
                    to keep your data safe. Failed payments don't compromise your security in any way.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  )
}