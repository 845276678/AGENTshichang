'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Layout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Badge, AnimatedSection } from '@/components/ui'
import { AgentCard, Agent } from '@/components/ui/agent-card'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  X, 
  Filter,
  SlidersHorizontal,
  Grid3X3,
  List,
  ChevronDown,
  TrendingUp,
  Clock,
  Zap,
  ArrowLeft
} from 'lucide-react'
import { 
  mockAgents, 
  categories, 
  priceRanges, 
  sortOptions
} from '@/lib/agents-mock-data'
import Link from 'next/link'

const ITEMS_PER_PAGE = 12

const SearchResultsPage = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    categories: [] as string[],
    priceRanges: [] as string[],
    minRating: 0,
    sortBy: 'popular',
    viewMode: 'grid' as 'grid' | 'list'
  })
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  // Get initial search term from URL params
  useEffect(() => {
    const query = searchParams?.get('q') || ''
    setSearchTerm(query)
    
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false)
    }, 300)
  }, [searchParams])

  // Filter and search logic
  const filteredAgents = useMemo(() => {
    let filtered = [...mockAgents]

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(agent => 
        agent.name.toLowerCase().includes(searchLower) ||
        agent.description.toLowerCase().includes(searchLower) ||
        agent.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        agent.category.toLowerCase().includes(searchLower) ||
        agent.author.name.toLowerCase().includes(searchLower)
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
  }, [searchTerm, filters])

  // Pagination
  const totalPages = Math.ceil(filteredAgents.length / ITEMS_PER_PAGE)
  const paginatedAgents = filteredAgents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Reset page when search/filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filters])

  // Update URL with search params
  const updateUrl = (newQuery: string) => {
    const url = new URL(window.location.href)
    if (newQuery) {
      url.searchParams.set('q', newQuery)
    } else {
      url.searchParams.delete('q')
    }
    router.push(url.pathname + url.search)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateUrl(searchTerm)
  }

  const updateFilter = (key: string, value: any) => {
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
      categories: [],
      priceRanges: [],
      minRating: 0,
      sortBy: 'popular',
      viewMode: filters.viewMode
    })
    setSearchTerm('')
    updateUrl('')
  }

  const activeFilterCount = filters.categories.length + filters.priceRanges.length + 
    (filters.minRating > 0 ? 1 : 0)

  // Search suggestions based on current query
  const searchSuggestions = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) {return []}
    
    const suggestions = new Set<string>()
    
    // Add matching agent names
    mockAgents.forEach(agent => {
      if (agent.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        suggestions.add(agent.name)
      }
    })
    
    // Add matching categories
    categories.forEach(category => {
      if (category.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        suggestions.add(category.name)
      }
    })
    
    // Add matching tags
    mockAgents.forEach(agent => {
      agent.tags.forEach(tag => {
        if (tag.toLowerCase().includes(searchTerm.toLowerCase())) {
          suggestions.add(tag)
        }
      })
    })
    
    return Array.from(suggestions).slice(0, 5)
  }, [searchTerm])

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-secondary rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-64 bg-secondary rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Search Header */}
      <section className="bg-gradient-to-br from-background via-background to-primary/5 py-12 border-b">
        <div className="container">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/agents')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Browse
            </Button>
          </div>

          <AnimatedSection>
            <div className="max-w-4xl">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {searchTerm ? (
                  <>
                    Search Results for{' '}
                    <span className="text-primary">"{searchTerm}"</span>
                  </>
                ) : (
                  'Search AI Agents'
                )}
              </h1>
              
              <form onSubmit={handleSearch} className="relative mb-6">
                <div className="relative max-w-2xl">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search agents, categories, or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-12 py-4 text-lg border-2 focus:border-primary"
                  />
                  {searchTerm && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => {
                        setSearchTerm('')
                        updateUrl('')
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Search Suggestions */}
                {searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 max-w-2xl mt-2 bg-background border border-border rounded-lg shadow-lg z-10">
                    <div className="p-2">
                      <div className="text-xs text-muted-foreground mb-2 px-3">Suggestions</div>
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setSearchTerm(suggestion)
                            updateUrl(suggestion)
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-secondary rounded text-sm"
                        >
                          <Search className="w-4 h-4 inline mr-2 text-muted-foreground" />
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </form>

              <div className="flex items-center justify-between">
                <div className="text-muted-foreground">
                  {filteredAgents.length > 0 ? (
                    <>
                      Found <span className="font-semibold text-primary">{filteredAgents.length}</span> agents
                      {searchTerm && ` matching "${searchTerm}"`}
                    </>
                  ) : (
                    <>No results found</>
                  )}
                </div>
                
                {searchTerm && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('')
                      updateUrl('')
                    }}
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Filters and Results */}
      <section className="py-8">
        <div className="container">
          {/* Filter Controls */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              {/* Quick Filter Tags */}
              {searchTerm && (
                <Badge variant="secondary" className="gap-1">
                  Search: "{searchTerm}"
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => {
                      setSearchTerm('')
                      updateUrl('')
                    }}
                  />
                </Badge>
              )}
              
              {/* Popular searches if no current search */}
              {!searchTerm && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Popular:</span>
                  {['Development', 'Creative', 'Free', 'Business'].map(term => (
                    <button
                      key={term}
                      onClick={() => {
                        setSearchTerm(term)
                        updateUrl(term)
                      }}
                      className="text-sm text-primary hover:underline"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Advanced Filters */}
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

              {/* View Mode */}
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

              {/* Sort Options */}
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
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="bg-secondary/20 rounded-lg border p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Categories */}
                  <div>
                    <h3 className="font-semibold mb-3">Categories</h3>
                    <div className="space-y-2">
                      {categories.map(category => (
                        <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.categories.includes(category.id)}
                            onChange={() => toggleCategory(category.id)}
                            className="rounded border-border"
                          />
                          <span className="text-sm">{category.name}</span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {category.count}
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
                          <span className="text-sm">{rating}+ stars</span>
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

          {/* Results */}
          {filteredAgents.length === 0 ? (
            <div className="text-center py-16">
              <Zap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm ? `No results for "${searchTerm}"` : 'No agents found'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchTerm ? (
                  <>
                    Try different keywords, check your spelling, or browse our{' '}
                    <Link href="/agents" className="text-primary hover:underline">
                      full catalog
                    </Link>
                    .
                  </>
                ) : (
                  'Try adjusting your filters to find what you\'re looking for.'
                )}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {searchTerm && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('')
                      updateUrl('')
                    }}
                  >
                    Clear Search
                  </Button>
                )}
                <Button onClick={clearAllFilters}>
                  Clear All Filters
                </Button>
              </div>
              
              {/* Suggested searches */}
              {searchTerm && (
                <div className="mt-8 pt-8 border-t">
                  <h4 className="font-medium mb-4">Try searching for:</h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {['Development Tools', 'Creative AI', 'Business Automation', 'Data Analysis'].map(suggestion => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setSearchTerm(suggestion)
                          updateUrl(suggestion)
                        }}
                        className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-full text-sm transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Results Grid */}
              <div className={
                filters.viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
                  : "space-y-4 mb-8"
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
                <div className="flex justify-center items-center gap-2">
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

export default SearchResultsPage