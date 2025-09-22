'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  CreditCard, 
  Crown, 
  Calendar, 
  DollarSign,
  Download,
  Plus,
  CheckCircle,
  Star,
  MoreHorizontal
} from 'lucide-react'

interface PaymentMethod {
  id: string
  type: 'card' | 'paypal'
  last4?: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
}

interface BillingHistory {
  id: string
  date: string
  amount: string
  description: string
  status: 'paid' | 'pending' | 'failed'
  invoiceUrl: string
}

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: '1',
    type: 'card',
    last4: '4242',
    brand: 'Visa',
    expiryMonth: 12,
    expiryYear: 2025,
    isDefault: true
  },
  {
    id: '2',
    type: 'paypal',
    isDefault: false
  }
]

const mockBillingHistory: BillingHistory[] = [
  {
    id: '1',
    date: '2024-01-15',
    amount: '$29.99',
    description: 'Premium Plan - Monthly',
    status: 'paid',
    invoiceUrl: '#'
  },
  {
    id: '2',
    date: '2023-12-15',
    amount: '$29.99',
    description: 'Premium Plan - Monthly',
    status: 'paid',
    invoiceUrl: '#'
  }
]

export function SubscriptionBilling() {
  const [currentPlan] = useState({
    name: 'Premium',
    price: '$29.99',
    interval: 'month',
    nextBilling: '2024-02-15',
    usage: {
      agents: { used: 12, limit: 50 },
      storage: { used: 2.3, limit: 10 }, // GB
      apiCalls: { used: 8750, limit: 10000 }
    }
  })

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      interval: 'month',
      features: ['5 agents', '1GB storage', '1,000 API calls/month'],
      current: false
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$29.99',
      interval: 'month',
      features: ['50 agents', '10GB storage', '10,000 API calls/month', 'Priority support'],
      current: true,
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$99.99',
      interval: 'month',
      features: ['Unlimited agents', '100GB storage', 'Unlimited API calls', '24/7 support', 'Custom integrations'],
      current: false
    }
  ]

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Current Plan
          </CardTitle>
          <CardDescription>
            Your active subscription and usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary text-primary-foreground rounded-lg">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold">{currentPlan.name} Plan</div>
                <div className="text-sm text-muted-foreground">
                  {currentPlan.price}/{currentPlan.interval}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Next billing</div>
              <div className="font-medium">{currentPlan.nextBilling}</div>
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="space-y-4">
            <h4 className="font-medium">Current Usage</h4>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Agents</span>
                  <span>{currentPlan.usage.agents.used} / {currentPlan.usage.agents.limit}</span>
                </div>
                <Progress value={(currentPlan.usage.agents.used / currentPlan.usage.agents.limit) * 100} />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Storage</span>
                  <span>{currentPlan.usage.storage.used}GB / {currentPlan.usage.storage.limit}GB</span>
                </div>
                <Progress value={(currentPlan.usage.storage.used / currentPlan.usage.storage.limit) * 100} />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>API Calls</span>
                  <span>{currentPlan.usage.apiCalls.used.toLocaleString()} / {currentPlan.usage.apiCalls.limit.toLocaleString()}</span>
                </div>
                <Progress value={(currentPlan.usage.apiCalls.used / currentPlan.usage.apiCalls.limit) * 100} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>
            Choose the plan that best fits your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative p-4 rounded-lg border ${
                  plan.current ? 'border-primary bg-primary/5' : ''
                } ${plan.popular ? 'ring-2 ring-primary' : ''}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
                    <Star className="h-3 w-3 mr-1" />
                    Popular
                  </Badge>
                )}
                
                <div className="text-center mb-4">
                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                  <div className="text-2xl font-bold mt-2">
                    {plan.price}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{plan.interval}
                    </span>
                  </div>
                </div>

                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-success-600" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.current ? "secondary" : "default"}
                  disabled={plan.current}
                >
                  {plan.current ? 'Current Plan' : 'Upgrade'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Methods
              </CardTitle>
              <CardDescription>
                Manage your payment methods
              </CardDescription>
            </div>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Method
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockPaymentMethods.map((method) => (
            <div key={method.id} className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  {method.type === 'card' ? (
                    <>
                      <div className="font-medium">
                        {method.brand} •••• {method.last4}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Expires {method.expiryMonth}/{method.expiryYear}
                      </div>
                    </>
                  ) : (
                    <div className="font-medium">PayPal</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {method.isDefault && (
                  <Badge variant="secondary">Default</Badge>
                )}
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Billing History
              </CardTitle>
              <CardDescription>
                Your recent payments and invoices
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockBillingHistory.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success-50">
                    <DollarSign className="h-4 w-4 text-success-600" />
                  </div>
                  <div>
                    <div className="font-medium">{bill.description}</div>
                    <div className="text-sm text-muted-foreground">{bill.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-medium">{bill.amount}</div>
                    <Badge
                      variant={bill.status === 'paid' ? 'success' : bill.status === 'pending' ? 'warning' : 'destructive'}
                      className="text-xs"
                    >
                      {bill.status}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}