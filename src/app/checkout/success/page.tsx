'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Layout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle,
  Download,
  ExternalLink,
  Star,
  ArrowRight,
  User,
  Calendar,
  CreditCard,
  Mail,
  FileText,
  Settings,
  Zap,
  ShoppingBag
} from 'lucide-react'

// Generate a random order number
const generateOrderNumber = () => {
  return `AI-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
}

// Mock purchased agents data (in a real app, this would come from the server)
const mockPurchasedAgents = [
  {
    id: '1',
    name: 'CodeMaster Pro',
    description: 'Advanced AI coding assistant that helps you write, debug, and optimize code.',
    price: 29,
    category: 'Development',
    accessUrl: '/agents/1/access',
    setupGuideUrl: '/agents/1/setup',
    documentationUrl: '/agents/1/docs'
  },
  {
    id: '2',
    name: 'DesignWiz',
    description: 'Creative AI that generates stunning graphics and design assets.',
    price: 0,
    category: 'Creative',
    accessUrl: '/agents/2/access',
    setupGuideUrl: '/agents/2/setup',
    documentationUrl: '/agents/2/docs'
  }
]

const AgentAccessCard = ({ agent }: { agent: any }) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-agent-500/20 flex items-center justify-center border">
            <Zap className="w-7 h-7 text-primary" />
          </div>
          
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                {agent.name}
              </h3>
              <p className="text-muted-foreground text-sm">{agent.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">{agent.category}</Badge>
                <span className="text-sm font-medium">
                  {agent.price === 0 ? 'Free' : `$${agent.price}/month`}
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button size="sm" asChild>
                <Link href={agent.accessUrl}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Launch Agent
                </Link>
              </Button>
              
              <Button size="sm" variant="outline" asChild>
                <Link href={agent.setupGuideUrl}>
                  <Settings className="w-4 h-4 mr-2" />
                  Setup Guide
                </Link>
              </Button>
              
              <Button size="sm" variant="outline" asChild>
                <Link href={agent.documentationUrl}>
                  <FileText className="w-4 h-4 mr-2" />
                  Documentation
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const NextSteps = () => {
  const nextSteps = [
    {
      icon: Mail,
      title: 'Check Your Email',
      description: 'You\'ll receive a confirmation email with your purchase details and access information.',
      action: null
    },
    {
      icon: Settings,
      title: 'Set Up Your Agents',
      description: 'Follow our setup guides to integrate your new agents into your workflow.',
      action: { text: 'View Setup Guides', href: '/docs/setup' }
    },
    {
      icon: User,
      title: 'Manage Your Account',
      description: 'Access your dashboard to manage subscriptions and view usage analytics.',
      action: { text: 'Go to Dashboard', href: '/dashboard' }
    }
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Next Steps</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {nextSteps.map((step, index) => (
          <Card key={index} className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <step.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{step.description}</p>
              {step.action && (
                <Button size="sm" variant="outline" asChild>
                  <Link href={step.action.href}>{step.action.text}</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

const RecommendedAgents = () => {
  const recommendedAgents = [
    {
      id: 'rec-1',
      name: 'DataProcessor Pro',
      description: 'Advanced data processing and analysis agent',
      price: 19,
      category: 'Analysis',
      rating: 4.7,
      downloads: 2300
    },
    {
      id: 'rec-2', 
      name: 'WriteAssist AI',
      description: 'Intelligent writing and content creation assistant',
      price: 15,
      category: 'Creative',
      rating: 4.5,
      downloads: 5400
    },
    {
      id: 'rec-3',
      name: 'TaskManager Bot',
      description: 'Automated task scheduling and management system',
      price: 0,
      category: 'Productivity',
      rating: 4.8,
      downloads: 1800
    }
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">You Might Also Like</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {recommendedAgents.map((agent) => (
          <Card key={agent.id} className="group cursor-pointer hover:shadow-lg transition-all duration-300">
            <Link href={`/agents/${agent.id}`}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-agent-500/20 flex items-center justify-center border">
                    <ShoppingBag className="w-6 h-6 text-primary" />
                  </div>
                  
                  <div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {agent.name}
                    </h3>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {agent.category}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {agent.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{agent.rating}</span>
                    </div>
                    
                    <div className="text-right">
                      {agent.price === 0 ? (
                        <span className="text-sm font-medium text-green-600">Free</span>
                      ) : (
                        <div className="text-sm">
                          <span className="font-bold">${agent.price}</span>
                          <span className="text-muted-foreground">/month</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  const [orderNumber] = useState(() => generateOrderNumber())
  const [orderDate] = useState(() => new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }))

  return (
    <Layout>
      <div className="container py-12">
        {/* Success Header */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-4xl font-bold mb-4">Order Completed Successfully!</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Thank you for your purchase. Your AI agents are ready to use and have been added to your account.
          </p>
          
          <div className="flex items-center justify-center gap-8 mt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Order #{orderNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{orderDate}</span>
            </div>
          </div>
        </motion.div>

        {/* Order Summary */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-12"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-4">Items Purchased</h3>
                  <div className="space-y-3">
                    {mockPurchasedAgents.map((agent) => (
                      <div key={agent.id} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{agent.name}</div>
                          <div className="text-sm text-muted-foreground">{agent.category}</div>
                        </div>
                        <div className="font-medium">
                          {agent.price === 0 ? 'Free' : `$${agent.price}/month`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-4">Payment Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>$29.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Processing Fee:</span>
                      <span>$2.99</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Total Paid:</span>
                      <span>$31.99</span>
                    </div>
                    <div className="text-green-600 text-xs mt-2">
                      Payment completed successfully
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Access Your Agents */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6">Access Your Agents</h2>
          <div className="space-y-4">
            {mockPurchasedAgents.map((agent) => (
              <AgentAccessCard key={agent.id} agent={agent} />
            ))}
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mb-12"
        >
          <NextSteps />
        </motion.div>

        {/* Recommended Agents */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mb-12"
        >
          <RecommendedAgents />
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-center"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/dashboard">
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            
            <Button size="lg" variant="outline" asChild>
              <Link href="/agents">
                Browse More Agents
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </Layout>
  )
}