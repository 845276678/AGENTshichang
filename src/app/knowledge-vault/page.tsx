'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Bookmark,
  Plus,
  Search,
  ExternalLink,
  Globe,
  FileText,
  Video,
  Image,
  Music,
  Code,
  Star,
  Clock,
  Tag,
  Filter,
  Download,
  Zap,
  TrendingUp,
  Brain,
  Lightbulb,
  Target,
  Sparkles,
  Archive,
  Eye,
  Share2,
  MoreHorizontal
} from 'lucide-react'

// 模拟数据类型
interface KnowledgeItem {
  id: string
  title: string
  url: string
  description: string
  category: 'crawlable' | 'non-crawlable' | 'pending'
  type: 'article' | 'video' | 'image' | 'audio' | 'code' | 'other'
  tags: string[]
  addedAt: Date
  lastAccessed?: Date
  isFavorite: boolean
  domain: string
  thumbnail?: string
  readingTime?: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  rating: number
  notes?: string
}

interface SuggestedItem {
  id: string
  title: string
  url: string
  description: string
  relevanceScore: number
  source: string
  type: 'article' | 'video' | 'image' | 'audio' | 'code' | 'other'
  estimatedValue: number
}

// 模拟数据
const mockKnowledgeItems: KnowledgeItem[] = [
  {
    id: '1',
    title: 'React 18 新特性完全指南',
    url: 'https://react.dev/blog/2022/03/29/react-v18',
    description: '深入了解 React 18 的并发特性、自动批处理、新的 Hooks 等重要更新',
    category: 'crawlable',
    type: 'article',
    tags: ['React', 'JavaScript', '前端开发', 'Web'],
    addedAt: new Date('2024-01-15'),
    lastAccessed: new Date('2024-01-20'),
    isFavorite: true,
    domain: 'react.dev',
    thumbnail: '/api/placeholder/300/200',
    readingTime: 15,
    difficulty: 'intermediate',
    rating: 4.8,
    notes: '重点关注并发特性的实际应用场景'
  },
  {
    id: '2',
    title: 'AI 产品设计思维课程',
    url: 'https://example.com/ai-design-course',
    description: '从零开始学习如何设计AI驱动的产品，包含用户体验和技术实现',
    category: 'non-crawlable',
    type: 'video',
    tags: ['AI', '产品设计', 'UX', '机器学习'],
    addedAt: new Date('2024-01-10'),
    isFavorite: false,
    domain: 'example.com',
    readingTime: 120,
    difficulty: 'advanced',
    rating: 4.5,
    notes: '需要付费订阅才能观看完整内容'
  },
  {
    id: '3',
    title: 'TypeScript 高级类型系统',
    url: 'https://github.com/microsoft/TypeScript',
    description: 'TypeScript 官方文档中关于高级类型系统的详细说明',
    category: 'crawlable',
    type: 'code',
    tags: ['TypeScript', '类型系统', '编程语言'],
    addedAt: new Date('2024-01-12'),
    lastAccessed: new Date('2024-01-18'),
    isFavorite: true,
    domain: 'github.com',
    readingTime: 30,
    difficulty: 'advanced',
    rating: 4.9
  },
  {
    id: '4',
    title: '设计系统构建指南',
    url: 'https://designsystem.example.com',
    description: '如何从零开始构建一个完整的设计系统，包含组件库和设计规范',
    category: 'pending',
    type: 'article',
    tags: ['设计系统', 'UI设计', '前端开发'],
    addedAt: new Date('2024-01-14'),
    isFavorite: false,
    domain: 'designsystem.example.com',
    readingTime: 25,
    difficulty: 'intermediate',
    rating: 4.2
  }
]

const mockSuggestions: SuggestedItem[] = [
  {
    id: 's1',
    title: 'React 19 Beta 版本特性预览',
    url: 'https://react.dev/blog/2024/04/25/react-19',
    description: 'React 19 即将到来的新特性和改进',
    relevanceScore: 0.95,
    source: 'React官方博客',
    type: 'article',
    estimatedValue: 4.7
  },
  {
    id: 's2',
    title: 'Next.js 15 性能优化最佳实践',
    url: 'https://nextjs.org/blog/next-15',
    description: '利用最新的 Next.js 15 特性提升应用性能',
    relevanceScore: 0.88,
    source: 'Vercel官方',
    type: 'article',
    estimatedValue: 4.5
  },
  {
    id: 's3',
    title: 'TypeScript 5.0 新功能深度解析',
    url: 'https://devblogs.microsoft.com/typescript/',
    description: 'TypeScript 5.0 带来的重大改进和新特性',
    relevanceScore: 0.92,
    source: 'Microsoft DevBlog',
    type: 'article',
    estimatedValue: 4.6
  }
]

const categoryIcons = {
  crawlable: <Download className="w-4 h-4" />,
  'non-crawlable': <Archive className="w-4 h-4" />,
  pending: <Clock className="w-4 h-4" />
}

const typeIcons = {
  article: <FileText className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
  image: <Image className="w-4 h-4" />,
  audio: <Music className="w-4 h-4" />,
  code: <Code className="w-4 h-4" />,
  other: <Globe className="w-4 h-4" />
}

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800'
}

export default function KnowledgeVaultPage() {
  const [items, setItems] = useState<KnowledgeItem[]>(mockKnowledgeItems)
  const [suggestions, setSuggestions] = useState<SuggestedItem[]>(mockSuggestions)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [sortBy, setSortBy] = useState<string>('date')
  const [newItem, setNewItem] = useState({
    title: '',
    url: '',
    description: '',
    tags: '',
    type: 'article' as const,
    difficulty: 'intermediate' as const,
    notes: ''
  })

  // 筛选和搜索逻辑
  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesType = selectedType === 'all' || item.type === selectedType

    return matchesSearch && matchesCategory && matchesType
  })

  // 排序逻辑
  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
      case 'rating':
        return b.rating - a.rating
      case 'title':
        return a.title.localeCompare(b.title)
      case 'readingTime':
        return (a.readingTime || 0) - (b.readingTime || 0)
      default:
        return 0
    }
  })

  const addNewItem = () => {
    if (!newItem.title || !newItem.url) return

    const item: KnowledgeItem = {
      id: Date.now().toString(),
      title: newItem.title,
      url: newItem.url,
      description: newItem.description,
      category: 'pending',
      type: newItem.type,
      tags: newItem.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      addedAt: new Date(),
      isFavorite: false,
      domain: new URL(newItem.url).hostname,
      difficulty: newItem.difficulty,
      rating: 0,
      notes: newItem.notes
    }

    setItems([item, ...items])
    setNewItem({
      title: '',
      url: '',
      description: '',
      tags: '',
      type: 'article',
      difficulty: 'intermediate',
      notes: ''
    })
    setIsAddDialogOpen(false)
  }

  const toggleFavorite = (id: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    ))
  }

  const addSuggestionToVault = (suggestion: SuggestedItem) => {
    const newItem: KnowledgeItem = {
      id: suggestion.id,
      title: suggestion.title,
      url: suggestion.url,
      description: suggestion.description,
      category: 'pending',
      type: suggestion.type,
      tags: ['推荐内容'],
      addedAt: new Date(),
      isFavorite: false,
      domain: new URL(suggestion.url).hostname,
      difficulty: 'intermediate',
      rating: suggestion.estimatedValue
    }

    setItems([newItem, ...items])
    setSuggestions(suggestions.filter(s => s.id !== suggestion.id))
  }

  const getCategoryStats = () => {
    const stats = {
      total: items.length,
      crawlable: items.filter(item => item.category === 'crawlable').length,
      'non-crawlable': items.filter(item => item.category === 'non-crawlable').length,
      pending: items.filter(item => item.category === 'pending').length,
      favorites: items.filter(item => item.isFavorite).length
    }
    return stats
  }

  const stats = getCategoryStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                知识库收藏夹
              </h1>
              <p className="text-lg text-gray-600">收集、整理和发现有价值的知识内容</p>
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                  <Plus className="w-5 h-5 mr-2" />
                  添加知识内容
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">添加新的知识内容</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right font-medium">标题</Label>
                    <Input
                      id="title"
                      value={newItem.title}
                      onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                      className="col-span-3"
                      placeholder="输入内容标题"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="url" className="text-right font-medium">链接</Label>
                    <Input
                      id="url"
                      value={newItem.url}
                      onChange={(e) => setNewItem({...newItem, url: e.target.value})}
                      className="col-span-3"
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right font-medium">描述</Label>
                    <Textarea
                      id="description"
                      value={newItem.description}
                      onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                      className="col-span-3"
                      placeholder="简要描述这个内容"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right font-medium">类型</Label>
                    <Select value={newItem.type} onValueChange={(value: any) => setNewItem({...newItem, type: value})}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="article">文章</SelectItem>
                        <SelectItem value="video">视频</SelectItem>
                        <SelectItem value="image">图片</SelectItem>
                        <SelectItem value="audio">音频</SelectItem>
                        <SelectItem value="code">代码</SelectItem>
                        <SelectItem value="other">其他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="difficulty" className="text-right font-medium">难度</Label>
                    <Select value={newItem.difficulty} onValueChange={(value: any) => setNewItem({...newItem, difficulty: value})}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">初级</SelectItem>
                        <SelectItem value="intermediate">中级</SelectItem>
                        <SelectItem value="advanced">高级</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="tags" className="text-right font-medium">标签</Label>
                    <Input
                      id="tags"
                      value={newItem.tags}
                      onChange={(e) => setNewItem({...newItem, tags: e.target.value})}
                      className="col-span-3"
                      placeholder="用逗号分隔，如: React, 前端, 教程"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="notes" className="text-right font-medium">备注</Label>
                    <Textarea
                      id="notes"
                      value={newItem.notes}
                      onChange={(e) => setNewItem({...newItem, notes: e.target.value})}
                      className="col-span-3"
                      placeholder="个人备注或心得"
                      rows={2}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={addNewItem} className="bg-blue-600 hover:bg-blue-700">
                    添加到收藏夹
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">总计</div>
              </CardContent>
            </Card>
            <Card className="bg-green-50/70 backdrop-blur-sm border-0 shadow-md">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-700">{stats.crawlable}</div>
                <div className="text-sm text-green-600">可爬取</div>
              </CardContent>
            </Card>
            <Card className="bg-orange-50/70 backdrop-blur-sm border-0 shadow-md">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-700">{stats['non-crawlable']}</div>
                <div className="text-sm text-orange-600">不可爬取</div>
              </CardContent>
            </Card>
            <Card className="bg-blue-50/70 backdrop-blur-sm border-0 shadow-md">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-700">{stats.pending}</div>
                <div className="text-sm text-blue-600">待处理</div>
              </CardContent>
            </Card>
            <Card className="bg-purple-50/70 backdrop-blur-sm border-0 shadow-md">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-700">{stats.favorites}</div>
                <div className="text-sm text-purple-600">收藏</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <Card className="mb-8 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="搜索标题、描述或标签..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 py-3 text-base"
                />
              </div>
              <div className="flex gap-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有分类</SelectItem>
                    <SelectItem value="crawlable">可爬取</SelectItem>
                    <SelectItem value="non-crawlable">不可爬取</SelectItem>
                    <SelectItem value="pending">待处理</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有类型</SelectItem>
                    <SelectItem value="article">文章</SelectItem>
                    <SelectItem value="video">视频</SelectItem>
                    <SelectItem value="image">图片</SelectItem>
                    <SelectItem value="audio">音频</SelectItem>
                    <SelectItem value="code">代码</SelectItem>
                    <SelectItem value="other">其他</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">按时间</SelectItem>
                    <SelectItem value="rating">按评分</SelectItem>
                    <SelectItem value="title">按标题</SelectItem>
                    <SelectItem value="readingTime">按时长</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 主要内容区域 */}
        <Tabs defaultValue="vault" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px] bg-white/70 backdrop-blur-sm">
            <TabsTrigger value="vault" className="flex items-center gap-2">
              <Bookmark className="w-4 h-4" />
              我的收藏夹
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              智能推荐
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vault" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedItems.map((item) => (
                <Card key={item.id} className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-0 overflow-hidden">
                  <div className="relative">
                    {item.thumbnail && (
                      <div className="h-48 bg-gradient-to-r from-purple-200 to-blue-200 flex items-center justify-center">
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <Globe className="w-12 h-12 text-gray-400" />
                        </div>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex gap-2">
                      <Badge className={`${item.category === 'crawlable' ? 'bg-green-500' :
                                        item.category === 'non-crawlable' ? 'bg-orange-500' : 'bg-blue-500'} text-white`}>
                        {categoryIcons[item.category]}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(item.id)}
                        className="p-2 bg-white/80 backdrop-blur-sm hover:bg-white/90"
                      >
                        <Star className={`w-4 h-4 ${item.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                      </Button>
                    </div>
                    <div className="absolute top-3 left-3">
                      <Badge variant="outline" className="bg-white/80 backdrop-blur-sm">
                        {typeIcons[item.type]}
                        <span className="ml-1 capitalize">{item.type}</span>
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-lg text-gray-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={`text-xs ${difficultyColors[item.difficulty]}`}>
                        {item.difficulty === 'beginner' ? '初级' :
                         item.difficulty === 'intermediate' ? '中级' : '高级'}
                      </Badge>
                      {item.readingTime && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {item.readingTime}分钟
                        </Badge>
                      )}
                      <div className="flex items-center">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs text-gray-600 ml-1">{item.rating}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {item.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {item.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{item.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span>{item.domain}</span>
                      <span>{new Date(item.addedAt).toLocaleDateString()}</span>
                    </div>

                    {item.notes && (
                      <div className="bg-gray-50 p-3 rounded-lg mb-4">
                        <p className="text-sm text-gray-700 italic">{item.notes}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open(item.url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        访问
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {sortedItems.length === 0 && (
              <div className="text-center py-12">
                <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">暂无匹配的内容</h3>
                <p className="text-gray-500">尝试调整搜索条件或添加新的知识内容</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  智能内容推荐
                </CardTitle>
                <p className="text-gray-600">基于你的收藏内容，为你推荐相关的优质资源</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {suggestions.map((suggestion) => (
                    <div key={suggestion.id} className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                      <div className="flex-shrink-0">
                        {typeIcons[suggestion.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 line-clamp-1">
                            {suggestion.title}
                          </h4>
                          <div className="flex items-center gap-2 ml-3">
                            <Badge className="bg-green-100 text-green-800 whitespace-nowrap">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              {Math.round(suggestion.relevanceScore * 100)}% 匹配
                            </Badge>
                            <Badge variant="outline" className="whitespace-nowrap">
                              <Star className="w-3 h-3 mr-1" />
                              {suggestion.estimatedValue}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {suggestion.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs text-gray-500">
                            <Globe className="w-3 h-3 mr-1" />
                            来源: {suggestion.source}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(suggestion.url, '_blank')}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              预览
                            </Button>
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={() => addSuggestionToVault(suggestion)}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              添加到收藏夹
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {suggestions.length === 0 && (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h4 className="text-lg font-medium text-gray-600 mb-2">暂无推荐内容</h4>
                    <p className="text-gray-500">添加更多收藏内容后，我们将为你推荐相关资源</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}