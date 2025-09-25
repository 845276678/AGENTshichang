'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge, AnimatedSection } from '@/components/ui'
import { AgentCard } from '@/components/ui/agent-card'
import {
  Search,
  SlidersHorizontal,
  Star,
  TrendingUp,
  Grid3X3,
  List,
  ChevronDown,
  X,
  Sparkles,
  Zap
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { 
  mockAgents, 
  categories, 
  priceRanges, 
  sortOptions,
  featuredAgents,
  trendingAgents 
} from '@/lib/agents-mock-data'

type FilterState = {
  search: string
  categories: string[]
  priceRanges: string[]
  minRating: number
  sortBy: string
  viewMode: 'grid' | 'list'
}

const ITEMS_PER_PAGE = 12

const AgentsBrowsePage = () => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    categories: [],
    priceRanges: [],
    minRating: 0,
    sortBy: 'popular',
    viewMode: 'grid'
  })
  
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Filter and sort agents
  const filteredAgents = useMemo(() => {
    let filtered = [...mockAgents]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(agent => 
        agent.name.toLowerCase().includes(searchLower) ||
        agent.description.toLowerCase().includes(searchLower) ||
        agent.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        agent.category.toLowerCase().includes(searchLower)
      )
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(agent => 
        filters.categories.includes(agent.category.toLowerCase())
      )
    }

    // Price range filter
    if (filters.priceRanges.length > 0) {
      filtered = filtered.filter(agent => {
        return filters.priceRanges.some(rangeId => {
          const range = priceRanges.find(r => r.id === rangeId)
          if (!range) {return false}
          return agent.price >= range.min && agent.price <= range.max
        })
      })
    }

    // Rating filter
    if (filters.minRating > 0) {
      filtered = filtered.filter(agent => agent.rating >= filters.minRating)
    }

    // Sort
    switch (filters.sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.downloads - a.downloads)
        break
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'downloads':
        filtered.sort((a, b) => b.downloads - a.downloads)
        break
      default:
        break
    }

    return filtered
  }, [filters])

  // Pagination
  const totalPages = Math.ceil(filteredAgents.length / ITEMS_PER_PAGE)
  const paginatedAgents = filteredAgents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const toggleCategory = (categoryId: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }))
  }

  const togglePriceRange = (rangeId: string) => {
    setFilters(prev => ({
      ...prev,
      priceRanges: prev.priceRanges.includes(rangeId)
        ? prev.priceRanges.filter(id => id !== rangeId)
        : [...prev.priceRanges, rangeId]
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      search: '',
      categories: [],
      priceRanges: [],
      minRating: 0,
      sortBy: 'popular',
      viewMode: filters.viewMode
    })
  }

  const activeFilterCount = filters.categories.length + filters.priceRanges.length + 
    (filters.minRating > 0 ? 1 : 0) + (filters.search ? 1 : 0)

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-background via-background to-primary/5 py-16 lg:py-20">
        <div className="container">
          <AnimatedSection>
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">
                <Sparkles className="w-4 h-4 mr-2" />
                Browse AI Agents
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Discover Powerful AI Agents
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Explore our marketplace of {mockAgents.length}+ AI agents. Find the perfect automation solution 
                for your workflow, from development tools to creative assistants.
              </p>
            </div>
          </AnimatedSection>

          {/* Featured & Trending Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <AnimatedSection delay={0.1}>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-agent-500/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-agent-500/20 flex items-center justify-center">
                      <Star className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Featured Agents</h3>
                      <p className="text-sm text-muted-foreground">Editor's picks and premium tools</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{featuredAgents.length}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFilters(prev => ({ ...prev, sortBy: 'popular' }))
                        // Show featured agents logic here
                      }}
                    >
                      View All
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-agent-500/5 to-purple-500/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-agent-500/20 to-purple-500/20 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-agent-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Trending Now</h3>
                      <p className="text-sm text-muted-foreground">Most popular this week</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{trendingAgents.length}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Show trending agents logic here
                      }}
                    >
                      Explore
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Search and Filters Section */}
      <section className="py-8 border-b bg-secondary/20">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search agents by name, category, or tags..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-10 pr-4 py-3 text-base"
              />
              {filters.search && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => updateFilter('search', '')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>

              {/* View Mode Toggle */}
              <div className="flex rounded-lg border overflow-hidden">
                <Button
                  variant={filters.viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => updateFilter('viewMode', 'grid')}
                  className="rounded-none border-none"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={filters.viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => updateFilter('viewMode', 'list')}
                  className="rounded-none border-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={filters.sortBy}
                  onChange={(e) => updateFilter('sortBy', e.target.value)}
                  className="appearance-none bg-background border border-border rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-6 overflow-hidden"
              >
                <div className="bg-background rounded-lg border p-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Categories */}
                    <div>
                      <h3 className="font-semibold mb-3">Categories</h3>
                      <div className="space-y-2">
                        {categories.map(categoryItem => (
                          <label key={categoryItem.id} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.categories.includes(categoryItem.id)}
                              onChange={() => toggleCategory(categoryItem.id)}
                              className="rounded border-border"
                            />
                            <span className="text-sm">{categoryItem.name}</span>
                            <span className="text-xs text-muted-foreground ml-auto">
                              {categoryItem.count}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div>
                      <h3 className="font-semibold mb-3">Price Range</h3>
                      <div className="space-y-2">
                        {priceRanges.map(range => (
                          <label key={range.id} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.priceRanges.includes(range.id)}
                              onChange={() => togglePriceRange(range.id)}
                              className="rounded border-border"
                            />
                            <span className="text-sm">{range.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Rating */}
                    <div>
                      <h3 className="font-semibold mb-3">Minimum Rating</h3>
                      <div className="space-y-2">
                        {[4, 3, 2, 1].map(rating => (
                          <label key={rating} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="rating"
                              checked={filters.minRating === rating}
                              onChange={() => updateFilter('minRating', rating)}
                              className="rounded-full border-border"
                            />
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">{rating}+ stars</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      {filteredAgents.length} agents found
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={clearAllFilters}>
                        Clear All
                      </Button>
                      <Button size="sm" onClick={() => setShowFilters(false)}>
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Filters */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {filters.search && (
                <Badge variant="secondary" className="gap-1">
                  Search: "{filters.search}"
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilter('search', '')}
                  />
                </Badge>
              )}
              {filters.categories.map(catId => {
                const category = categories.find(c => c.id === catId)
                return category ? (
                  <Badge key={catId} variant="secondary" className="gap-1">
                    {category.name}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => toggleCategory(catId)}
                    />
                  </Badge>
                ) : null
              })}
              {filters.priceRanges.map(rangeId => {
                const range = priceRanges.find(r => r.id === rangeId)
                return range ? (
                  <Badge key={rangeId} variant="secondary" className="gap-1">
                    {range.label}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => togglePriceRange(rangeId)}
                    />
                  </Badge>
                ) : null
              })}
              {filters.minRating > 0 && (
                <Badge variant="secondary" className="gap-1">
                  {filters.minRating}+ stars
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilter('minRating', 0)}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12">
        <div className="container">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {filters.search ? `Search Results` : 'All Agents'}
              </h2>
              <p className="text-muted-foreground">
                Showing {paginatedAgents.length} of {filteredAgents.length} agents
                {currentPage > 1 && ` (Page ${currentPage} of ${totalPages})`}
              </p>
            </div>
          </div>

          {/* Results Grid */}
          {filteredAgents.length === 0 ? (
            <div className="text-center py-16">
              <Zap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No agents found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <Button onClick={clearAllFilters}>
                Clear All Filters
              </Button>
            </div>
          ) : (
            <>
              <div className={
                filters.viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }>
                {paginatedAgents.map((agent, index) => (
                  <AnimatedSection key={agent.id} delay={index * 0.05}>
                    <AgentCard 
                      agent={agent}
                      variant={filters.viewMode === 'list' ? 'compact' : 'default'}
                    />
                  </AnimatedSection>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 2 && page <= currentPage + 2)
                      ) {
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        )
                      } else if (
                        page === currentPage - 3 ||
                        page === currentPage + 3
                      ) {
                        return <span key={page} className="px-2">...</span>
                      }
                      return null
                    })}
                  </div>

                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </Layout>
  )
}

export default AgentsBrowsePage