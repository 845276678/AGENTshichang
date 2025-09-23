'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui'
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Download,
  DollarSign,
  Zap,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'

// Mock agents data for admin management
const mockAgents = [
  {
    id: '1',
    name: 'CodeMaster Pro',
    description: 'Advanced AI coding assistant that helps you write, debug, and optimize code',
    category: 'Development',
    author: {
      id: '1',
      name: 'TechCorp',
      email: 'dev@techcorp.com',
      verified: true
    },
    status: 'approved',
    price: 29.99,
    rating: 4.8,
    reviewCount: 1247,
    downloads: 15420,
    revenue: 45678.50,
    createdAt: '2024-01-15',
    updatedAt: '2024-09-01',
    featured: true,
    trending: true,
    tags: ['Code Generation', 'Debugging', 'Optimization']
  },
  {
    id: '2',
    name: 'DesignWiz AI',
    description: 'Creative AI that generates stunning graphics, logos, and design assets',
    category: 'Creative',
    author: {
      id: '2',
      name: 'CreativeStudio',
      email: 'hello@creativestudio.com',
      verified: true
    },
    status: 'pending',
    price: 0,
    rating: 4.6,
    reviewCount: 892,
    downloads: 8930,
    revenue: 0,
    createdAt: '2024-02-10',
    updatedAt: '2024-08-28',
    featured: false,
    trending: false,
    tags: ['Logo Design', 'Graphics', 'Branding']
  },
  {
    id: '3',
    name: 'DataAnalyst Pro',
    description: 'Powerful analytics agent that processes large datasets and generates insights',
    category: 'Analysis',
    author: {
      id: '3',
      name: 'DataLabs',
      email: 'team@datalabs.ai',
      verified: false
    },
    status: 'rejected',
    price: 49.99,
    rating: 4.9,
    reviewCount: 623,
    downloads: 5240,
    revenue: 23450.25,
    createdAt: '2024-01-20',
    updatedAt: '2024-09-05',
    featured: false,
    trending: true,
    tags: ['Data Analysis', 'Visualization', 'Insights']
  },
  {
    id: '4',
    name: 'WriteGenius',
    description: 'AI-powered writing assistant for content creation and copywriting',
    category: 'Content',
    author: {
      id: '4',
      name: 'ContentCorp',
      email: 'support@contentcorp.io',
      verified: true
    },
    status: 'approved',
    price: 19.99,
    rating: 4.7,
    reviewCount: 445,
    downloads: 7820,
    revenue: 15630.80,
    createdAt: '2024-03-05',
    updatedAt: '2024-08-15',
    featured: false,
    trending: false,
    tags: ['Writing', 'Content', 'Copywriting']
  }
]

const AgentStatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    approved: { color: 'bg-green-100 text-green-800', label: 'Approved', icon: CheckCircle },
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending', icon: Clock },
    rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected', icon: XCircle }
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
  const Icon = config.icon

  return (
    <Badge className={`${config.color} flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  )
}

const AgentActionsDropdown = ({ agent, onAction }: { 
  agent: any, 
  onAction: (action: string, agentId: string) => void 
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const actions = [
    { label: 'View Details', icon: Eye, action: 'view' },
    { label: 'Edit Agent', icon: Edit, action: 'edit' },
    ...(agent.status === 'pending' ? [
      { label: 'Approve', icon: CheckCircle, action: 'approve' },
      { label: 'Reject', icon: XCircle, action: 'reject' }
    ] : []),
    { label: 'Delete', icon: Trash2, action: 'delete', destructive: true }
  ]

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MoreHorizontal className="w-4 h-4" />
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-background border z-20">
            <div className="py-1">
              {actions.map((action) => (
                <button
                  key={action.action}
                  onClick={() => {
                    onAction(action.action, agent.id)
                    setIsOpen(false)
                  }}
                  className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent w-full text-left ${
                    action.destructive ? 'text-red-600 hover:text-red-700' : ''
                  }`}
                >
                  <action.icon className="w-4 h-4" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const AgentsTable = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('updatedAt')
  const [sortOrder, setSortOrder] = useState('desc')

  const filteredAgents = mockAgents
    .filter(agent => {
      const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          agent.author.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || agent.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a]
      const bValue = b[sortBy as keyof typeof b]
      const modifier = sortOrder === 'asc' ? 1 : -1
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * modifier
      }
      return (Number(aValue) - Number(bValue)) * modifier
    })

  const handleAction = (action: string, agentId: string) => {
    console.log(`${action} agent ${agentId}`)
    // Implement action handlers
    switch (action) {
      case 'view':
        window.open(`/agents/${agentId}`, '_blank')
        break
      case 'edit':
        // Navigate to edit page
        break
      case 'approve':
        // Approve agent
        break
      case 'reject':
        // Reject agent
        break
      case 'delete':
        if (confirm('Are you sure you want to delete this agent?')) {
          // Delete agent
        }
        break
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>All Agents ({filteredAgents.length})</CardTitle>
          <Button asChild>
            <Link href="/admin/agents/new">
              <Plus className="w-4 h-4 mr-2" />
              Add New Agent
            </Link>
          </Button>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search agents or authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          
          <select
            value={`${sortBy}_${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('_')
              setSortBy(field)
              setSortOrder(order)
            }}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="updatedAt_desc">Latest Updated</option>
            <option value="createdAt_desc">Newest First</option>
            <option value="downloads_desc">Most Downloads</option>
            <option value="revenue_desc">Highest Revenue</option>
            <option value="rating_desc">Best Rating</option>
          </select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-medium">Agent</th>
                <th className="text-left p-4 font-medium">Author</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Performance</th>
                <th className="text-left p-4 font-medium">Revenue</th>
                <th className="text-left p-4 font-medium">Updated</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAgents.map((agent) => (
                <tr key={agent.id} className="border-b hover:bg-accent/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-agent-500/20 flex items-center justify-center border">
                        <Zap className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {agent.name}
                          {agent.featured && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                          {agent.trending && (
                            <Badge variant="outline" className="text-xs">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Trending
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">{agent.category}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div>
                      <div className="font-medium flex items-center gap-1">
                        {agent.author.name}
                        {agent.author.verified && (
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{agent.author.email}</div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <AgentStatusBadge status={agent.status} />
                  </td>
                  
                  <td className="p-4">
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{agent.rating} ({agent.reviewCount})</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Download className="w-3 h-3" />
                        <span>{agent.downloads > 1000 ? `${(agent.downloads / 1000).toFixed(1)}k` : agent.downloads}</span>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="text-sm">
                      {agent.price === 0 ? (
                        <span className="text-green-600 font-medium">Free</span>
                      ) : (
                        <div>
                          <div className="font-medium">${agent.price}/month</div>
                          <div className="text-muted-foreground">
                            ${(agent.revenue / 1000).toFixed(1)}k total
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="text-sm text-muted-foreground">
                      {new Date(agent.updatedAt).toLocaleDateString()}
                    </div>
                  </td>
                  
                  <td className="p-4 text-right">
                    <AgentActionsDropdown agent={agent} onAction={handleAction} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredAgents.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No agents found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const AdminAgentsStats = () => {
  const stats = [
    {
      title: 'Total Agents',
      value: mockAgents.length,
      icon: Zap,
      color: 'text-blue-600'
    },
    {
      title: 'Pending Review',
      value: mockAgents.filter(a => a.status === 'pending').length,
      icon: Clock,
      color: 'text-yellow-600'
    },
    {
      title: 'Approved',
      value: mockAgents.filter(a => a.status === 'approved').length,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Total Revenue',
      value: `$${(mockAgents.reduce((sum, agent) => sum + agent.revenue, 0) / 1000).toFixed(1)}k`,
      icon: DollarSign,
      color: 'text-purple-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function AdminAgentsPage() {
  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Agents Management</h1>
            <p className="text-muted-foreground">
              Manage all AI agents on your marketplace
            </p>
          </div>
        </div>

        <AdminAgentsStats />
        <AgentsTable />
      </motion.div>
    </AdminLayout>
  )
}