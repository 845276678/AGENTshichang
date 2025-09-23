'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Layout } from '@/components/layout'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Shield,
  Check,
  User,
  Globe,
  Lock,
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface BillingInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface PaymentInfo {
  cardNumber: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  cardholderName: string
}

const steps = [
  { id: 1, title: 'Review Order', description: 'Confirm your items' },
  { id: 2, title: 'Payment Info', description: 'Enter payment details' },
  { id: 3, title: 'Confirmation', description: 'Complete your order' }
]

const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all',
                  currentStep > step.id
                    ? 'bg-green-500 border-green-500 text-white'
                    : currentStep === step.id
                    ? 'bg-primary border-primary text-white'
                    : 'bg-background border-border text-muted-foreground'
                )}
              >
                {currentStep > step.id ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-semibold">{step.id}</span>
                )}
              </div>
              <div className="mt-2 text-center">
                <div className="text-sm font-medium">{step.title}</div>
                <div className="text-xs text-muted-foreground">{step.description}</div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 bg-border min-w-[50px]" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

const OrderSummary = ({ items, totalPrice }: { items: any[], totalPrice: number }) => {
  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-agent-500/20 flex items-center justify-center border">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.category} • Qty: {item.quantity}
                  </div>
                </div>
              </div>
              <div className="text-sm font-medium">
                {item.price === 0 ? 'Free' : `$${(item.price * item.quantity).toFixed(2)}`}
              </div>
            </div>
          ))}
        </div>
        
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Processing Fee</span>
            <span>${totalPrice > 0 ? '2.99' : '0.00'}</span>
          </div>
          <div className="flex justify-between font-semibold border-t pt-2">
            <span>Total</span>
            <span>${(totalPrice + (totalPrice > 0 ? 2.99 : 0)).toFixed(2)}</span>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground bg-secondary/50 p-3 rounded-md">
          <div className="flex items-center gap-1 mb-1">
            <Shield className="w-3 h-3" />
            <span>Secure checkout with SSL encryption</span>
          </div>
          <div>• 30-day money-back guarantee</div>
          <div>• Cancel anytime</div>
        </div>
      </CardContent>
    </Card>
  )
}

const ReviewOrderStep = ({ items, totalPrice, onNext }: {
  items: any[], 
  totalPrice: number, 
  onNext: () => void 
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Review Your Order</h2>
        <p className="text-muted-foreground">
          Please review your selected items before proceeding to payment
        </p>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-agent-500/20 flex items-center justify-center border">
                  <ShoppingCart className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{item.category}</Badge>
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span className="text-xs text-muted-foreground">{item.author.name}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {item.price === 0 ? 'Free' : `$${item.price}/mo`}
                  </div>
                  <div className="text-sm text-muted-foreground">Qty: {item.quantity}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" asChild>
          <Link href="/cart">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Link>
        </Button>
        <Button onClick={onNext}>
          Continue to Payment
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

const PaymentStep = ({ 
  billingInfo, 
  setBillingInfo, 
  paymentInfo, 
  setPaymentInfo,
  onNext, 
  onBack 
}: {
  billingInfo: BillingInfo
  setBillingInfo: (info: BillingInfo) => void
  paymentInfo: PaymentInfo
  setPaymentInfo: (info: PaymentInfo) => void
  onNext: () => void
  onBack: () => void
}) => {
  const handleBillingChange = (field: keyof BillingInfo, value: string) => {
    setBillingInfo({ ...billingInfo, [field]: value })
  }

  const handlePaymentChange = (field: keyof PaymentInfo, value: string) => {
    setPaymentInfo({ ...paymentInfo, [field]: value })
  }

  const isValid = billingInfo.firstName && billingInfo.lastName && billingInfo.email && 
                  paymentInfo.cardNumber && paymentInfo.expiryMonth && paymentInfo.expiryYear && paymentInfo.cvv

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Payment Information</h2>
        <p className="text-muted-foreground">
          Enter your billing details and payment information
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Billing Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Billing Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">First Name *</label>
                <input
                  type="text"
                  value={billingInfo.firstName}
                  onChange={(e) => handleBillingChange('firstName', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Last Name *</label>
                <input
                  type="text"
                  value={billingInfo.lastName}
                  onChange={(e) => handleBillingChange('lastName', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Doe"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Email Address *</label>
              <input
                type="email"
                value={billingInfo.email}
                onChange={(e) => handleBillingChange('email', e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="john@example.com"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Phone</label>
              <input
                type="tel"
                value={billingInfo.phone}
                onChange={(e) => handleBillingChange('phone', e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Address</label>
              <input
                type="text"
                value={billingInfo.address}
                onChange={(e) => handleBillingChange('address', e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="123 Main St"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">City</label>
                <input
                  type="text"
                  value={billingInfo.city}
                  onChange={(e) => handleBillingChange('city', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="San Francisco"
                />
              </div>
              <div>
                <label className="text-sm font-medium">ZIP Code</label>
                <input
                  type="text"
                  value={billingInfo.zipCode}
                  onChange={(e) => handleBillingChange('zipCode', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="94105"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Cardholder Name *</label>
              <input
                type="text"
                value={paymentInfo.cardholderName}
                onChange={(e) => handlePaymentChange('cardholderName', e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Card Number *</label>
              <input
                type="text"
                value={paymentInfo.cardNumber}
                onChange={(e) => handlePaymentChange('cardNumber', e.target.value.replace(/\D/g, '').slice(0, 16))}
                className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="1234 5678 9012 3456"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Month *</label>
                <select
                  value={paymentInfo.expiryMonth}
                  onChange={(e) => handlePaymentChange('expiryMonth', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">MM</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                      {(i + 1).toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Year *</label>
                <select
                  value={paymentInfo.expiryYear}
                  onChange={(e) => handlePaymentChange('expiryYear', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">YYYY</option>
                  {Array.from({ length: 10 }, (_, i) => (
                    <option key={i} value={new Date().getFullYear() + i}>
                      {new Date().getFullYear() + i}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">CVV *</label>
                <input
                  type="text"
                  value={paymentInfo.cvv}
                  onChange={(e) => handlePaymentChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="123"
                />
              </div>
            </div>
            
            <div className="bg-secondary/50 p-3 rounded-md">
              <div className="flex items-center gap-2 text-sm">
                <Lock className="w-4 h-4 text-green-600" />
                <span>Your payment information is encrypted and secure</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Review
        </Button>
        <Button onClick={onNext} disabled={!isValid}>
          Complete Order
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

const ConfirmationStep = ({ 
  items, 
  totalPrice, 
  billingInfo, 
  onConfirm,
  processing = false 
}: {
  items: any[]
  totalPrice: number
  billingInfo: BillingInfo
  onConfirm: () => void
  processing?: boolean
}) => {
  const finalTotal = totalPrice + (totalPrice > 0 ? 2.99 : 0)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Confirm Your Order</h2>
        <p className="text-muted-foreground">
          Please review all details before completing your purchase
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-muted-foreground">Qty: {item.quantity}</div>
                </div>
                <div className="font-medium">
                  {item.price === 0 ? 'Free' : `$${(item.price * item.quantity).toFixed(2)}`}
                </div>
              </div>
            ))}
            <div className="border-t pt-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              {totalPrice > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Processing Fee:</span>
                  <span>$2.99</span>
                </div>
              )}
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>{billingInfo.firstName} {billingInfo.lastName}</div>
            <div>{billingInfo.email}</div>
            {billingInfo.phone && <div>{billingInfo.phone}</div>}
            {billingInfo.address && (
              <div className="text-sm text-muted-foreground">
                <div>{billingInfo.address}</div>
                {billingInfo.city && billingInfo.zipCode && (
                  <div>{billingInfo.city}, {billingInfo.zipCode}</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button 
          size="lg" 
          onClick={onConfirm}
          disabled={processing}
          className="gap-2"
        >
          {processing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Complete Purchase
            </>
          )}
        </Button>
      </div>

      <div className="text-center text-xs text-muted-foreground">
        By completing this purchase, you agree to our Terms of Service and Privacy Policy
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()
  const { isAuthenticated } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [processing, setProcessing] = useState(false)

  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  })

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: ''
  })

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push('/auth/login')
    return null
  }

  // Redirect if cart is empty
  if (items.length === 0) {
    router.push('/cart')
    return null
  }

  const handleConfirmOrder = async () => {
    setProcessing(true)
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Clear cart and redirect to success page
      clearCart()
      router.push('/checkout/success')
    } catch (error) {
      console.error('Payment failed:', error)
      router.push('/checkout/failed')
    }
  }

  const stepComponents = {
    1: (
      <ReviewOrderStep
        items={items}
        totalPrice={totalPrice}
        onNext={() => setCurrentStep(2)}
      />
    ),
    2: (
      <PaymentStep
        billingInfo={billingInfo}
        setBillingInfo={setBillingInfo}
        paymentInfo={paymentInfo}
        setPaymentInfo={setPaymentInfo}
        onNext={() => setCurrentStep(3)}
        onBack={() => setCurrentStep(1)}
      />
    ),
    3: (
      <ConfirmationStep
        items={items}
        totalPrice={totalPrice}
        billingInfo={billingInfo}
        onConfirm={handleConfirmOrder}
        processing={processing}
      />
    )
  }

  return (
    <Layout>
      <div className="container py-8">
        <StepIndicator currentStep={currentStep} />
        
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {stepComponents[currentStep as keyof typeof stepComponents]}
              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="lg:col-span-1">
            <OrderSummary items={items} totalPrice={totalPrice} />
          </div>
        </div>
      </div>
    </Layout>
  )
}