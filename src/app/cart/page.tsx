'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Layout } from '@/components/layout'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui'
import { 
  ShoppingCart, 
  Minus, 
  Plus, 
  X, 
  ArrowRight, 
  ShoppingBag,
  Star,
  User,
  CheckCircle
} from 'lucide-react'


const CartItemCard = ({ item }: { item: any }) => {
  const { updateQuantity, removeFromCart } = useCart()

  return (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Agent Thumbnail */}
          <div className="w-full md:w-32 h-32 rounded-lg bg-gradient-to-br from-primary/10 to-agent-500/10 flex items-center justify-center border">
            <ShoppingBag className="w-8 h-8 text-primary" />
          </div>
          
          {/* Agent Details */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div>
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <Badge variant="outline" className="mt-1">{item.category}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{item.author.name}</span>
                  {item.author.verified && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
              </div>
            </div>
            
            <p className="text-muted-foreground text-sm line-clamp-2">
              {item.description}
            </p>
            
            <div className="flex flex-wrap gap-1">
              {item.tags.slice(0, 3).map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Price and Controls */}
          <div className="flex flex-col items-end gap-4 min-w-[120px]">
            <button
              onClick={() => removeFromCart(item.id)}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="text-right">
              {item.price === 0 ? (
                <div className="text-lg font-bold text-green-600">Free</div>
              ) : (
                <>
                  <div className="text-lg font-bold">${item.price}</div>
                  <div className="text-sm text-muted-foreground">/month</div>
                </>
              )}
            </div>
            
            {/* Quantity Controls */}
            <div className="flex items-center gap-2 border rounded-md">
              <button
                onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                className="p-1 hover:bg-accent rounded-l-md transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 min-w-[40px] text-center">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="p-1 hover:bg-accent rounded-r-md transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="text-right">
              <div className="font-medium">
                Total: ${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const EmptyCartState = () => {
  return (
    <div className="text-center py-16">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="space-y-6"
      >
        <div className="w-24 h-24 mx-auto rounded-full bg-muted flex items-center justify-center">
          <ShoppingCart className="w-12 h-12 text-muted-foreground" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Your cart is empty</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Discover amazing AI agents to add to your cart and start automating your workflows.
          </p>
        </div>
        
        <Button size="lg" asChild>
          <Link href="/agents">
            Browse Agents
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </Button>
      </motion.div>
    </div>
  )
}

const CartSummary = ({ items, totalPrice }: { items: any[], totalPrice: number }) => {
  const freeItems = items.filter(item => item.price === 0)
  // const paidItems = items.filter(item => item.price > 0) // Unused variable
  
  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Items ({items.length})</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          
          {freeItems.length > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Free items ({freeItems.length})</span>
              <span>$0.00</span>
            </div>
          )}
          
          <div className="border-t pt-2">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}/month</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Button className="w-full" size="lg" asChild>
            <Link href="/checkout">
              Proceed to Checkout
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          
          <Button variant="outline" className="w-full" asChild>
            <Link href="/agents">Continue Shopping</Link>
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p>• Free 7-day trial for all paid agents</p>
          <p>• Cancel anytime</p>
          <p>• Secure payment processing</p>
        </div>
      </CardContent>
    </Card>
  )
}

const RecommendedAgents = () => {
  // Mock recommended agents based on cart
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
      price: 0,
      category: 'Creative',
      rating: 4.5,
      downloads: 5400
    },
    {
      id: 'rec-3',
      name: 'TaskManager Bot',
      description: 'Automated task scheduling and management system',
      price: 15,
      category: 'Productivity',
      rating: 4.8,
      downloads: 1800
    }
  ]

  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold mb-6">Recommended for you</h2>
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

export default function CartPage() {
  const { items, totalPrice, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container py-8">
          <EmptyCartState />
          <RecommendedAgents />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
            <p className="text-muted-foreground">
              {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => {
              if (confirm('Are you sure you want to clear your cart?')) {
                clearCart()
              }
            }}
            className="self-start md:self-center"
          >
            Clear Cart
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <CartItemCard key={item.id} item={item} />
            ))}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <CartSummary items={items} totalPrice={totalPrice} />
          </div>
        </div>

        {/* Recommended Agents */}
        <RecommendedAgents />
      </div>
    </Layout>
  )
}