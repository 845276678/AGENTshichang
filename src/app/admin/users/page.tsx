'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui'
import {
  Search,
  MoreHorizontal,
  Edit,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  User,
  Crown,
  AlertTriangle,
  UserCheck,
  Activity,
  DollarSign,
  Download,
  TrendingUp,
  MessageCircle
} from 'lucide-react'

// Mock users data for admin management
const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'user',
    status: 'active',
    verified: true,
    avatar: null,
    joinDate: '2024-01-15',
    lastLogin: '2024-09-15',
    agentsCreated: 3,
    agentsPurchased: 12,
    totalSpent: 456.78,
    totalEarnings: 1234.56,
    location: 'San Francisco, CA',
    plan: 'Pro'
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@techcorp.com',
    role: 'developer',
    status: 'active',
    verified: true,
    avatar: null,
    joinDate: '2024-02-10',
    lastLogin: '2024-09-16',
    agentsCreated: 8,
    agentsPurchased: 5,
    totalSpent: 234.50,
    totalEarnings: 5678.90,
    location: 'New York, NY',
    plan: 'Enterprise'
  },
  {
    id: '3',
    name: 'Mike Chen',
    email: 'mike.chen@startup.io',
    role: 'admin',
    status: 'active',
    verified: true,
    avatar: null,
    joinDate: '2024-01-05',
    lastLogin: '2024-09-16',
    agentsCreated: 0,
    agentsPurchased: 25,
    totalSpent: 1234.00,
    totalEarnings: 0,
    location: 'Seattle, WA',
    plan: 'Pro'
  },
  {
    id: '4',
    name: 'Emily Rodriguez',
    email: 'emily.r@freelance.com',
    role: 'user',
    status: 'suspended',
    verified: false,
    avatar: null,
    joinDate: '2024-03-20',
    lastLogin: '2024-08-30',
    agentsCreated: 1,
    agentsPurchased: 3,
    totalSpent: 89.97,
    totalEarnings: 45.20,
    location: 'Austin, TX',
    plan: 'Free'
  },
  {
    id: '5',
    name: 'David Kim',
    email: 'david.kim@agency.co',
    role: 'developer',
    status: 'active',
    verified: true,
    avatar: null,
    joinDate: '2024-02-28',
    lastLogin: '2024-09-14',
    agentsCreated: 15,
    agentsPurchased: 8,
    totalSpent: 567.80,
    totalEarnings: 9876.54,
    location: 'Los Angeles, CA',
    plan: 'Enterprise'
  }
]

const UserRoleBadge = ({ role }: { role: string }) => {
  const roleConfig = {
    admin: { color: 'bg-purple-100 text-purple-800', label: 'Admin', icon: Crown },
    developer: { color: 'bg-blue-100 text-blue-800', label: 'Developer', icon: User },
    user: { color: 'bg-gray-100 text-gray-800', label: 'User', icon: User }
  }

  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.user
  const Icon = config.icon

  return (
    <Badge className={`${config.color} flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  )
}

const UserStatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    active: { color: 'bg-green-100 text-green-800', label: 'Active', icon: CheckCircle },
    suspended: { color: 'bg-red-100 text-red-800', label: 'Suspended', icon: Ban },
    inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inactive', icon: XCircle }
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
  const Icon = config.icon

  return (
    <Badge className={`${config.color} flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  )
}

const UserActionsDropdown = ({ user, onAction }: { 
  user: any, 
  onAction: (action: string, userId: string) => void 
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const actions = [
    { label: 'View Profile', icon: Eye, action: 'view' },
    { label: 'Edit User', icon: Edit, action: 'edit' },
    { label: 'Send Message', icon: MessageCircle, action: 'message' },
    ...(user.status === 'active' ? [
      { label: 'Suspend User', icon: Ban, action: 'suspend', destructive: true }
    ] : [
      { label: 'Activate User', icon: UserCheck, action: 'activate' }
    ]),
    { label: 'View Activity', icon: Activity, action: 'activity' }
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
                    onAction(action.action, user.id)
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

const UsersTable = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('lastLogin')
  const [sortOrder, setSortOrder] = useState('desc')

  const filteredUsers = mockUsers
    .filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter
      return matchesSearch && matchesRole && matchesStatus
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

  const handleAction = (action: string, userId: string) => {
    console.log(`${action} user ${userId}`)
    // Implement action handlers
    switch (action) {
      case 'view':
        // Navigate to user profile
        break
      case 'edit':
        // Navigate to edit user page
        break
      case 'message':
        // Send message to user
        break
      case 'suspend':
        if (confirm('Are you sure you want to suspend this user?')) {
          // Suspend user
        }
        break
      case 'activate':
        // Activate user
        break
      case 'activity':
        // View user activity
        break
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
          <Button>
            Export Data
          </Button>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm"
            />
          </div>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="developer">Developer</option>
            <option value="user">User</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <select
            value={`${sortBy}_${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('_')
              setSortBy(field || 'lastLogin')
              setSortOrder(order || 'desc')
            }}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="lastLogin_desc">Last Login</option>
            <option value="joinDate_desc">Newest First</option>
            <option value="totalSpent_desc">Highest Spending</option>
            <option value="totalEarnings_desc">Highest Earnings</option>
            <option value="agentsCreated_desc">Most Agents</option>
          </select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-medium">User</th>
                <th className="text-left p-4 font-medium">Role & Status</th>
                <th className="text-left p-4 font-medium">Activity</th>
                <th className="text-left p-4 font-medium">Financial</th>
                <th className="text-left p-4 font-medium">Joined</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-accent/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-agent-500/20 flex items-center justify-center border">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {user.name}
                          {user.verified && (
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        <div className="text-xs text-muted-foreground">{user.location}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="space-y-2">
                      <UserRoleBadge role={user.role} />
                      <UserStatusBadge status={user.status} />
                      <div className="text-xs text-muted-foreground">{user.plan} Plan</div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-1">
                        <Activity className="w-3 h-3 text-muted-foreground" />
                        <span>Last: {new Date(user.lastLogin).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <TrendingUp className="w-3 h-3" />
                        <span>{user.agentsCreated} created</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Download className="w-3 h-3" />
                        <span>{user.agentsPurchased} purchased</span>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-green-600" />
                        <span className="text-green-600">${user.totalSpent.toFixed(2)} spent</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-blue-600" />
                        <span className="text-blue-600">${user.totalEarnings.toFixed(2)} earned</span>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="text-sm text-muted-foreground">
                      {new Date(user.joinDate).toLocaleDateString()}
                    </div>
                  </td>
                  
                  <td className="p-4 text-right">
                    <UserActionsDropdown user={user} onAction={handleAction} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No users found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const AdminUsersStats = () => {
  const totalUsers = mockUsers.length
  const activeUsers = mockUsers.filter(u => u.status === 'active').length
  const developers = mockUsers.filter(u => u.role === 'developer').length
  const totalRevenue = mockUsers.reduce((sum, user) => sum + user.totalSpent, 0)

  const stats = [
    {
      title: 'Total Users',
      value: totalUsers,
      icon: User,
      color: 'text-blue-600'
    },
    {
      title: 'Active Users',
      value: activeUsers,
      icon: UserCheck,
      color: 'text-green-600'
    },
    {
      title: 'Developers',
      value: developers,
      icon: Crown,
      color: 'text-purple-600'
    },
    {
      title: 'Total Revenue',
      value: `$${(totalRevenue / 1000).toFixed(1)}k`,
      icon: DollarSign,
      color: 'text-orange-600'
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

export default function AdminUsersPage() {
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
            <h1 className="text-3xl font-bold">Users Management</h1>
            <p className="text-muted-foreground">
              Manage all users on your marketplace
            </p>
          </div>
        </div>

        <AdminUsersStats />
        <UsersTable />
      </motion.div>
    </AdminLayout>
  )
}