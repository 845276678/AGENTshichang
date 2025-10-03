'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Bot,
  Play,
  Settings,
  Clock,
  TrendingUp,
  Search,
  Filter,
  MoreHorizontal,
  ExternalLink,
  Heart,
  Activity,
  Star
} from 'lucide-react'

interface Agent {
  id: string
  name: string
  description: string
  category: string
  lastUsed: string
  usageCount: number
  rating: number
  isPremium: boolean
  status: 'active' | 'inactive' | 'error'
  thumbnail: string
}

// Mock data for user's agents
const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'Content Writer Pro',
    description: 'Advanced AI writer for blogs, articles, and marketing copy',
    category: 'Creative',
    lastUsed: '2 hours ago',
    usageCount: 47,
    rating: 4.8,
    isPremium: true,
    status: 'active',
    thumbnail: '/api/placeholder/400/300'
  },
  {
    id: '2',
    name: 'Code Assistant',
    description: 'Smart coding companion for multiple programming languages',
    category: 'Development',
    lastUsed: '1 day ago',
    usageCount: 89,
    rating: 4.9,
    isPremium: true,
    status: 'active',
    thumbnail: '/api/placeholder/400/300'
  },
  {
    id: '3',
    name: 'Data Analyzer',
    description: 'Powerful tool for data analysis and visualization',
    category: 'Business',
    lastUsed: '3 days ago',
    usageCount: 23,
    rating: 4.6,
    isPremium: false,
    status: 'active',
    thumbnail: '/api/placeholder/400/300'
  },
  {
    id: '4',
    name: 'Social Media Manager',
    description: 'Automate your social media posts and engagement',
    category: 'Marketing',
    lastUsed: '1 week ago',
    usageCount: 156,
    rating: 4.7,
    isPremium: true,
    status: 'inactive',
    thumbnail: '/api/placeholder/400/300'
  },
  {
    id: '5',
    name: 'Email Assistant',
    description: 'Smart email composition and management tool',
    category: 'Productivity',
    lastUsed: '2 weeks ago',
    usageCount: 34,
    rating: 4.5,
    isPremium: false,
    status: 'active',
    thumbnail: '/api/placeholder/400/300'
  },
  {
    id: '6',
    name: 'Language Translator',
    description: 'Multi-language translation with context awareness',
    category: 'Utility',
    lastUsed: '1 month ago',
    usageCount: 12,
    rating: 4.4,
    isPremium: false,
    status: 'error',
    thumbnail: '/api/placeholder/400/300'
  }
]

const categories = ['All', 'Creative', 'Development', 'Business', 'Marketing', 'Productivity', 'Utility']

const AgentCard = ({ agent }: { agent: Agent }) => {
  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'active': return 'success'
      case 'inactive': return 'secondary'
      case 'error': return 'destructive'
      default: return 'secondary'
    }
  }

  const getStatusText = (status: Agent['status']) => {
    switch (status) {
      case 'active': return 'Active'
      case 'inactive': return 'Inactive'
      case 'error': return 'Error'
      default: return 'Unknown'
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full group hover:shadow-lg transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base group-hover:text-primary transition-colors">
                  {agent.name}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {agent.category}
                  </Badge>
                  <Badge variant={getStatusColor(agent.status)} className="text-xs">
                    {getStatusText(agent.status)}
                  </Badge>
                  {agent.isPremium && (
                    <Badge variant="secondary" className="text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <CardDescription className="text-sm leading-relaxed">
            {agent.description}
          </CardDescription>
          
          <div className="space-y-3">
            {/* Usage Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-primary">
                  {agent.usageCount}
                </div>
                <div className="text-xs text-muted-foreground">Uses</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-warning-600">
                  {agent.rating}
                </div>
                <div className="text-xs text-muted-foreground">Rating</div>
              </div>
            </div>
            
            {/* Last Used */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Last used {agent.lastUsed}</span>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button 
                size="sm" 
                className="flex-1"
                disabled={agent.status === 'error'}
              >
                <Play className="h-3 w-3 mr-1" />
                Launch
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1"
              >
                <Settings className="h-3 w-3 mr-1" />
                Configure
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs"
              asChild
            >
              <Link href={`/agents/${agent.id}`}>
                <ExternalLink className="h-3 w-3 mr-1" />
                View Details
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function MyAgentsSection() {
  const [agents] = useState<Agent[]>(mockAgents)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState<'lastUsed' | 'usage' | 'rating' | 'name'>('lastUsed')

  // Filter and sort agents
  const filteredAndSortedAgents = useMemo(() => {
    const filtered = agents.filter(agent => {
      const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           agent.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'All' || agent.category === selectedCategory
      return matchesSearch && matchesCategory
    })

    // Sort agents
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'usage':
          return b.usageCount - a.usageCount
        case 'rating':
          return b.rating - a.rating
        case 'lastUsed':
        default:
          // For simplicity, we'll use usage count as proxy for last used ordering
          return b.usageCount - a.usageCount
      }
    })

    return filtered
  }, [agents, searchQuery, selectedCategory, sortBy])

  const totalUsage = agents.reduce((sum, agent) => sum + agent.usageCount, 0)
  const activeAgents = agents.filter(agent => agent.status === 'active').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">My Agents</h2>
          <p className="text-sm text-muted-foreground">
            {activeAgents} active agents • {totalUsage} total uses
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/agents">
              <Search className="h-4 w-4 mr-2" />
              Browse More
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search your agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Category Filter */}
              <div className="flex-1">
                <div className="flex flex-wrap gap-2">
                  {categories.map((categoryName) => (
                    <Button
                      key={categoryName}
                      variant={selectedCategory === categoryName ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(categoryName)}
                      className="h-8"
                    >
                      {categoryName}
                      {categoryName !== 'All' && (
                        <Badge variant="secondary" className="ml-2 h-4 px-1.5 text-xs">
                          {agents.filter(a => a.category === categoryName).length}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Sort */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="text-sm border rounded-md px-2 py-1 bg-background"
                >
                  <option value="lastUsed">Last Used</option>
                  <option value="usage">Most Used</option>
                  <option value="rating">Highest Rated</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agents Grid */}
      {filteredAndSortedAgents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredAndSortedAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No agents found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery || selectedCategory !== 'All'
                ? "Try adjusting your search or filters"
                : "You haven't purchased any agents yet"
              }
            </p>
            {(!searchQuery && selectedCategory === 'All') && (
              <Button asChild>
                <Link href="/agents">
                  <Search className="h-4 w-4 mr-2" />
                  Browse Agents
                </Link>
              </Button>
            )}
            {(searchQuery || selectedCategory !== 'All') && (
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('All')
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold text-primary">{activeAgents}</span>
            </div>
            <p className="text-sm text-muted-foreground">Active Agents</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-success-600" />
              <span className="text-2xl font-bold text-success-600">{totalUsage}</span>
            </div>
            <p className="text-sm text-muted-foreground">Total Uses</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-error-600" />
              <span className="text-2xl font-bold text-error-600">
                {(agents.reduce((sum, agent) => sum + agent.rating, 0) / agents.length).toFixed(1)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Avg. Rating</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}