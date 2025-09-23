'use client'
import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Layout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge, AnimatedSection } from '@/components/ui'
import { Rating } from '@/components/ui/rating'
import { Agent } from '@/components/ui/agent-card'
import { useCart } from '@/contexts/CartContext'
import {
  ArrowLeft,
  Download,
  Users,
  Calendar,
  Shield,
  Star,
  Play,
  Heart,
  Share2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Zap,
  Sparkles,
  Tag,
  User,
  MessageCircle,
  ShoppingCart,
  TrendingUp
} from 'lucide-react'
import { mockAgents } from '@/lib/agents-mock-data'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

interface Review {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  comment: string
  createdAt: string
  helpful: number
  verified: boolean
}

// Mock reviews data
const mockReviews: Review[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Sarah Johnson',
    rating: 5,
    comment: 'Absolutely fantastic! This agent has transformed my development workflow. The code suggestions are incredibly accurate and have saved me hours of debugging.',
    createdAt: '2024-09-10',
    helpful: 12,
    verified: true
  },
  {
    id: '2',
    userId: '2',
    userName: 'Mike Chen',
    rating: 4,
    comment: 'Great tool overall. The interface is intuitive and the results are consistently good. Would love to see more customization options in future updates.',
    createdAt: '2024-09-08',
    helpful: 8,
    verified: true
  },
  {
    id: '3',
    userId: '3',
    userName: 'Emily Rodriguez',
    rating: 5,
    comment: 'This has been a game-changer for our team. The automation features are exactly what we needed. Highly recommend!',
    createdAt: '2024-09-05',
    helpful: 15,
    verified: false
  }
]

const AgentDetailPage = () => {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { addToCart, items } = useCart()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [reviews] = useState<Review[]>(mockReviews)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [isFavorited, setIsFavorited] = useState(false)
  const [_showDemo] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)

  // Check if agent is already in cart
  const isInCart = agent ? items.some(item => item.id === agent.id) : false

  useEffect(() => {
    if (params?.id) {
      // Simulate loading
      setTimeout(() => {
        const foundAgent = mockAgents.find(a => a.id === params.id)
        setAgent(foundAgent || null)
        setIsLoading(false)
      }, 500)
    }
  }, [params?.id])

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-secondary rounded w-1/4"></div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-secondary rounded"></div>
                <div className="space-y-4">
                  <div className="h-6 bg-secondary rounded w-3/4"></div>
                  <div className="h-4 bg-secondary rounded w-full"></div>
                  <div className="h-4 bg-secondary rounded w-2/3"></div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-32 bg-secondary rounded"></div>
                <div className="h-48 bg-secondary rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!agent) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Agent Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The agent you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push('/agents')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Browse
          </Button>
        </div>
      </Layout>
    )
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    setAddingToCart(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API call
      
      addToCart({
        id: agent.id,
        name: agent.name,
        description: agent.description,
        price: agent.price,
        category: agent.category,
        author: agent.author,
        tags: agent.tags
      })
      
      // Show success feedback (you could add a toast notification here)
    } catch (error) {
      console.error('Failed to add to cart:', error)
    } finally {
      setAddingToCart(false)
    }
  }

  const handlePurchase = () => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    // For direct purchase, add to cart and redirect to checkout
    if (!isInCart) {
      addToCart({
        id: agent.id,
        name: agent.name,
        description: agent.description,
        price: agent.price,
        category: agent.category,
        author: agent.author,
        tags: agent.tags
      })
    }
    router.push('/checkout')
  }

  const handleTryDemo = () => {
    // setShowDemo(true) // Demo functionality not implemented yet
    console.log('Try demo clicked')
  }

  const handleFavorite = () => {
    setIsFavorited(!isFavorited)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const tabContent = {
    overview: (
      <div className="space-y-8">
        {/* Description */}
        <div>
          <h3 className="text-xl font-semibold mb-4">About This Agent</h3>
          <p className="text-muted-foreground leading-relaxed">
            {agent.description} This advanced AI agent provides comprehensive automation 
            solutions with enterprise-grade security and scalability. Built with cutting-edge 
            machine learning algorithms, it adapts to your workflow and continuously improves 
            its performance based on usage patterns.
          </p>
        </div>

        {/* Key Features */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Key Features</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              'Advanced AI algorithms for optimal performance',
              'Real-time processing and instant results',
              'Enterprise-grade security and compliance',
              'Seamless integration with existing tools',
              '24/7 customer support and documentation',
              'Regular updates and feature enhancements'
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Use Cases */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Perfect For</h3>
          <div className="flex flex-wrap gap-2">
            {[
              'Small businesses',
              'Enterprise teams',
              'Individual developers',
              'Marketing agencies',
              'Content creators',
              'Data analysts'
            ].map((useCase) => (
              <Badge key={useCase} variant="outline" className="text-sm">
                {useCase}
              </Badge>
            ))}
          </div>
        </div>

        {/* Technical Specs */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Technical Specifications</h3>
          <div className="bg-secondary/50 rounded-lg p-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">API Rate Limit:</span>
              <span>1000 requests/hour</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Response Time:</span>
              <span>&lt; 500ms average</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Uptime:</span>
              <span>99.9% SLA</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data Processing:</span>
              <span>Up to 10MB per request</span>
            </div>
          </div>
        </div>
      </div>
    ),
    
    demo: (
      <div className="space-y-6">
        <div className="text-center py-12 bg-secondary/20 rounded-lg">
          <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-agent-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="w-12 h-12 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Interactive Demo</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Try out {agent.name} with real examples and see how it can transform your workflow.
          </p>
          <Button size="lg" onClick={handleTryDemo} className="gap-2">
            <Play className="w-4 h-4" />
            Launch Demo
          </Button>
        </div>

        {/* Example Inputs/Outputs */}
        <div>
          <h4 className="font-semibold mb-4">Example Use Cases</h4>
          <div className="space-y-4">
            {[
              {
                input: 'Create a responsive navigation component in React',
                output: 'Generated a complete React navigation component with TypeScript support, responsive design, and accessibility features.'
              },
              {
                input: 'Optimize database query performance',
                output: 'Analyzed query execution plan and provided 3 optimization suggestions that improved performance by 45%.'
              }
            ].map((example, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs font-medium text-green-600 uppercase tracking-wide">Input</span>
                      <p className="text-sm mt-1">{example.input}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">Output</span>
                      <p className="text-sm mt-1 text-muted-foreground">{example.output}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    ),

    reviews: (
      <div className="space-y-6">
        {/* Reviews Summary */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">{agent.rating}</div>
              <Rating value={agent.rating} size="lg" className="mb-2" />
              <p className="text-sm text-muted-foreground">
                Based on {agent.reviewCount} reviews
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h4 className="font-semibold mb-4">Rating Breakdown</h4>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(rating => (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-sm w-4">{rating}</span>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 bg-secondary rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full" 
                        style={{ width: `${Math.random() * 80 + 10}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8">
                      {Math.floor(Math.random() * 50)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Individual Reviews */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Customer Reviews</h4>
            {isAuthenticated && (
              <Button variant="outline" size="sm">
                Write a Review
              </Button>
            )}
          </div>

          {reviews.map(review => (
            <Card key={review.id} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-agent-500/20 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{review.userName}</span>
                      {review.verified && (
                        <Badge variant="outline" className="text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                    <Rating value={review.rating} size="sm" className="mb-3" />
                    <p className="text-sm text-muted-foreground mb-3">
                      {review.comment}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <button className="flex items-center gap-1 hover:text-primary transition-colors">
                        <Heart className="w-3 h-3" />
                        Helpful ({review.helpful})
                      </button>
                      <button className="flex items-center gap-1 hover:text-primary transition-colors">
                        <MessageCircle className="w-3 h-3" />
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="text-center pt-4">
            <Button variant="outline">Load More Reviews</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/agents" className="hover:text-primary transition-colors">
            AI Agents
          </Link>
          <span>/</span>
          <Link href={`/categories/${agent.category.toLowerCase()}`} className="hover:text-primary transition-colors">
            {agent.category}
          </Link>
          <span>/</span>
          <span className="text-foreground">{agent.name}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Agent Header */}
            <AnimatedSection>
              <div className="flex items-start gap-6 mb-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-agent-500/20 flex items-center justify-center border flex-shrink-0">
                  <Zap className="w-10 h-10 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">{agent.name}</h1>
                      <div className="flex items-center gap-4 mb-3">
                        <Badge variant="outline">{agent.category}</Badge>
                        {agent.featured && (
                          <Badge variant="default" className="gap-1">
                            <Star className="w-3 h-3 fill-current" />
                            Featured
                          </Badge>
                        )}
                        {agent.trending && (
                          <Badge variant="secondary" className="gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Trending
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          by {agent.author.name}
                          {agent.author.verified && (
                            <CheckCircle className="w-4 h-4 text-blue-500 ml-1" />
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Updated {formatDate(agent.updatedAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleFavorite}
                        className={isFavorited ? 'text-red-500 border-red-200' : ''}
                      >
                        <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 mb-4">
                    <Rating value={agent.rating} size="sm" showText />
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Download className="w-4 h-4" />
                      {agent.downloads > 1000 ? `${(agent.downloads / 1000).toFixed(1)}k` : agent.downloads} downloads
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      {agent.reviewCount} reviews
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {agent.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs gap-1">
                        <Tag className="w-3 h-3" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Navigation Tabs */}
            <div className="border-b mb-8">
              <nav className="flex gap-8">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'demo', label: 'Demo & Examples' },
                  { id: 'reviews', label: 'Reviews' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-4 text-sm font-medium transition-colors relative ${
                      activeTab === tab.id 
                        ? 'text-primary border-b-2 border-primary' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <AnimatedSection>
              {tabContent[activeTab as keyof typeof tabContent]}
            </AnimatedSection>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <AnimatedSection delay={0.1}>
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-center">
                    {agent.price === 0 ? (
                      <div className="text-3xl font-bold text-green-600">Free</div>
                    ) : (
                      <div>
                        <div className="text-3xl font-bold text-primary">
                          ${agent.price}
                        </div>
                        <div className="text-sm text-muted-foreground">/month</div>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {isInCart ? (
                      <Button 
                        size="lg" 
                        variant="outline"
                        className="w-full gap-2"
                        asChild
                      >
                        <Link href="/cart">
                          <ShoppingCart className="w-4 h-4" />
                          View in Cart
                        </Link>
                      </Button>
                    ) : (
                      <Button 
                        size="lg" 
                        variant="outline"
                        className="w-full gap-2"
                        onClick={handleAddToCart}
                        disabled={addingToCart}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {addingToCart ? 'Adding...' : 'Add to Cart'}
                      </Button>
                    )}
                    
                    <Button 
                      size="lg" 
                      className="w-full gap-2"
                      onClick={handlePurchase}
                    >
                      <Sparkles className="w-4 h-4" />
                      {agent.price === 0 ? 'Install Free' : 'Buy Now'}
                    </Button>
                    
                    <Button 
                      size="lg" 
                      variant="secondary" 
                      className="w-full gap-2"
                      onClick={handleTryDemo}
                    >
                      <Play className="w-4 h-4" />
                      Try Demo
                    </Button>
                  </div>

                  <div className="text-center text-xs text-muted-foreground">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Shield className="w-3 h-3" />
                      30-day money-back guarantee
                    </div>
                    <div>Cancel anytime • No setup fees</div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Quick Stats */}
            <AnimatedSection delay={0.2}>
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {agent.downloads > 1000 ? `${(agent.downloads / 1000).toFixed(1)}k` : agent.downloads}
                      </div>
                      <div className="text-xs text-muted-foreground">Downloads</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">{agent.rating}</div>
                      <div className="text-xs text-muted-foreground">Rating</div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">First released</span>
                      <span>{formatDate(agent.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last updated</span>
                      <span>{formatDate(agent.updatedAt)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Version</span>
                      <span>v2.1.0</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Author Info */}
            <AnimatedSection delay={0.3}>
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">About the Creator</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-agent-500/20 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {agent.author.name}
                        {agent.author.verified && (
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {agent.author.verified ? 'Verified Developer' : 'Developer'}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    Experienced AI developer with 50+ published agents and over 100k downloads across the marketplace.
                  </p>
                  
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <ExternalLink className="w-4 h-4" />
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Support */}
            <AnimatedSection delay={0.4}>
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Contact Support
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Documentation
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Report Issue
                  </Button>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default AgentDetailPage