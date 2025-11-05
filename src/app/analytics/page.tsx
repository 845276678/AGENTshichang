'use client'

/**
 * 市场分析页面
 *
 * 功能：
 * - 查看市场趋势数据
 * - 触发数据采集
 * - 管理竞品监控
 * - 数据可视化
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Loader2, Plus, TrendingUp, Eye, RefreshCw, Trash2, BarChart } from 'lucide-react'

// 平台配置
const PLATFORMS = [
  { value: 'DOUYIN', label: '抖音', icon: '🎵' },
  { value: 'XIAOHONGSHU', label: '小红书', icon: '📕' },
  { value: 'BILIBILI', label: 'B站', icon: '📺' },
  { value: 'WEIBO', label: '微博', icon: '🔴' },
  { value: 'TIKTOK', label: 'TikTok', icon: '🎬' },
]

interface MarketTrend {
  id: string
  platform: string
  keyword: string
  heat: number
  rank: number
  topPosts: any[]
  collectedAt: string
}

interface Competitor {
  id: string
  competitorName: string
  platform: string
  accountUrl: string
  accountId: string
  isActive: boolean
  lastCheckedAt: string | null
  createdAt: string
}

export default function AnalyticsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // 趋势数据
  const [trends, setTrends] = useState<MarketTrend[]>([])
  const [trendStats, setTrendStats] = useState<any[]>([])

  // 竞品数据
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [competitorStats, setCompetitorStats] = useState<any[]>([])

  // 对话框状态
  const [collectDialogOpen, setCollectDialogOpen] = useState(false)
  const [competitorDialogOpen, setCompetitorDialogOpen] = useState(false)

  // 采集表单
  const [collectForm, setCollectForm] = useState({
    platforms: [] as string[],
    keywords: ''
  })

  // 竞品表单
  const [competitorForm, setCompetitorForm] = useState({
    competitorName: '',
    platform: '',
    accountUrl: '',
    accountId: ''
  })

  // 筛选器
  const [trendFilter, setTrendFilter] = useState({
    platform: '',
    keyword: '',
    sortBy: 'heat',
    sortOrder: 'desc'
  })

  // 加载数据
  const fetchData = async () => {
    try {
      const [trendsRes, competitorsRes] = await Promise.all([
        fetch(`/api/analytics/trends?sortBy=${trendFilter.sortBy}&sortOrder=${trendFilter.sortOrder}${trendFilter.platform ? `&platform=${trendFilter.platform}` : ''}${trendFilter.keyword ? `&keyword=${trendFilter.keyword}` : ''}`),
        fetch('/api/analytics/competitors'),
      ])

      const trendsData = await trendsRes.json()
      const competitorsData = await competitorsRes.json()

      if (trendsData.success) {
        setTrends(trendsData.data.trends)
        setTrendStats(trendsData.data.stats || [])
      }

      if (competitorsData.success) {
        setCompetitors(competitorsData.data.competitors)
        setCompetitorStats(competitorsData.data.stats || [])
      }
    } catch (error: any) {
      toast({
        title: '加载失败',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [trendFilter])

  // 触发数据采集
  const handleCollect = async () => {
    if (collectForm.platforms.length === 0) {
      toast({
        title: '请选择平台',
        description: '至少选择一个平台进行采集',
        variant: 'destructive',
      })
      return
    }

    try {
      const res = await fetch('/api/analytics/trends/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platforms: collectForm.platforms,
          keywords: collectForm.keywords.split(',').map(k => k.trim()).filter(Boolean),
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: '采集已启动',
          description: `已为 ${collectForm.platforms.length} 个平台启动数据采集`,
        })
        setCollectDialogOpen(false)
        setCollectForm({ platforms: [], keywords: '' })

        // 5秒后刷新数据
        setTimeout(() => fetchData(), 5000)
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: '启动失败',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  // 添加竞品监控
  const handleAddCompetitor = async () => {
    if (!competitorForm.competitorName || !competitorForm.platform || !competitorForm.accountUrl) {
      toast({
        title: '请填写必填项',
        description: '竞品名称、平台和账号URL是必填的',
        variant: 'destructive',
      })
      return
    }

    try {
      const res = await fetch('/api/analytics/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(competitorForm),
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: '添加成功',
          description: '竞品监控已启动',
        })
        setCompetitorDialogOpen(false)
        setCompetitorForm({
          competitorName: '',
          platform: '',
          accountUrl: '',
          accountId: ''
        })
        fetchData()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: '添加失败',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  // 删除竞品
  const handleDeleteCompetitor = async (id: string) => {
    if (!confirm('确定要删除此竞品监控吗？')) return

    try {
      const res = await fetch(`/api/analytics/competitors/${id}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: '删除成功',
          description: '竞品监控已删除',
        })
        fetchData()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: '删除失败',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  // 切换竞品状态
  const handleToggleCompetitor = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/analytics/competitors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: '更新成功',
          description: !isActive ? '已启用监控' : '已暂停监控',
        })
        fetchData()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: '更新失败',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* 页面标题 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">市场分析</h1>
          <p className="text-muted-foreground mt-1">
            监控市场趋势和竞品动态
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setRefreshing(true)
              fetchData()
            }}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            刷新
          </Button>
          <Button onClick={() => setCollectDialogOpen(true)}>
            <TrendingUp className="h-4 w-4 mr-2" />
            采集数据
          </Button>
        </div>
      </div>

      {/* 标签页 */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList>
          <TabsTrigger value="trends">
            <BarChart className="h-4 w-4 mr-2" />
            市场趋势
          </TabsTrigger>
          <TabsTrigger value="competitors">
            <Eye className="h-4 w-4 mr-2" />
            竞品监控
          </TabsTrigger>
        </TabsList>

        {/* 市场趋势标签 */}
        <TabsContent value="trends" className="space-y-4">
          {/* 统计卡片 */}
          {trendStats.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {trendStats.map((stat) => {
                const platform = PLATFORMS.find(p => p.value === stat.platform)
                return (
                  <Card key={stat.platform} className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{platform?.icon}</span>
                      <h3 className="font-semibold">{platform?.label}</h3>
                    </div>
                    <div className="text-2xl font-bold">{stat._count.id}</div>
                    <div className="text-sm text-muted-foreground">
                      平均热度: {Math.round(stat._avg.heat || 0)}
                    </div>
                  </Card>
                )
              })}
            </div>
          )}

          {/* 筛选器 */}
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>平台</Label>
                <Select
                  value={trendFilter.platform}
                  onValueChange={(value) =>
                    setTrendFilter({ ...trendFilter, platform: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="全部平台" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">全部平台</SelectItem>
                    {PLATFORMS.map((platform) => (
                      <SelectItem key={platform.value} value={platform.value}>
                        {platform.icon} {platform.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>关键词搜索</Label>
                <Input
                  placeholder="输入关键词"
                  value={trendFilter.keyword}
                  onChange={(e) =>
                    setTrendFilter({ ...trendFilter, keyword: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>排序方式</Label>
                <Select
                  value={trendFilter.sortBy}
                  onValueChange={(value) =>
                    setTrendFilter({ ...trendFilter, sortBy: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="heat">按热度</SelectItem>
                    <SelectItem value="collectedAt">按时间</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>排序顺序</Label>
                <Select
                  value={trendFilter.sortOrder}
                  onValueChange={(value) =>
                    setTrendFilter({ ...trendFilter, sortOrder: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">降序</SelectItem>
                    <SelectItem value="asc">升序</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* 趋势列表 */}
          {trends.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">还没有趋势数据</h3>
              <p className="text-muted-foreground mb-4">
                点击"采集数据"按钮开始收集市场趋势
              </p>
              <Button onClick={() => setCollectDialogOpen(true)}>
                <TrendingUp className="h-4 w-4 mr-2" />
                采集数据
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trends.map((trend) => {
                const platform = PLATFORMS.find(p => p.value === trend.platform)
                return (
                  <Card key={trend.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{platform?.icon}</span>
                        <Badge variant="outline">{platform?.label}</Badge>
                      </div>
                      {trend.rank && (
                        <Badge variant="secondary">#{trend.rank}</Badge>
                      )}
                    </div>

                    <h3 className="font-semibold mb-2 line-clamp-2">
                      {trend.keyword}
                    </h3>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        <span>热度: {trend.heat.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      采集时间: {new Date(trend.collectedAt).toLocaleString()}
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* 竞品监控标签 */}
        <TabsContent value="competitors" className="space-y-4">
          {/* 操作按钮 */}
          <div className="flex justify-end">
            <Button onClick={() => setCompetitorDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              添加竞品
            </Button>
          </div>

          {/* 竞品列表 */}
          {competitors.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="text-6xl mb-4">👀</div>
              <h3 className="text-xl font-semibold mb-2">还没有竞品监控</h3>
              <p className="text-muted-foreground mb-4">
                添加竞品账号，自动监控他们的动态
              </p>
              <Button onClick={() => setCompetitorDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                添加竞品
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {competitors.map((competitor) => {
                const platform = PLATFORMS.find(p => p.value === competitor.platform)
                return (
                  <Card key={competitor.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{platform?.icon}</span>
                        <h3 className="font-semibold">{competitor.competitorName}</h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCompetitor(competitor.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">平台: </span>
                        <Badge variant="outline">{platform?.label}</Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">状态: </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleCompetitor(competitor.id, competitor.isActive)}
                        >
                          <Badge variant={competitor.isActive ? 'default' : 'secondary'}>
                            {competitor.isActive ? '监控中' : '已暂停'}
                          </Badge>
                        </Button>
                      </div>

                      {competitor.lastCheckedAt && (
                        <div className="text-xs text-muted-foreground">
                          最后检查: {new Date(competitor.lastCheckedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* 数据采集对话框 */}
      <Dialog open={collectDialogOpen} onOpenChange={setCollectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>采集市场数据</DialogTitle>
            <DialogDescription>
              选择要采集的平台和关键词
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* 平台选择 */}
            <div className="space-y-2">
              <Label>选择平台 *</Label>
              <div className="grid grid-cols-2 gap-2">
                {PLATFORMS.map((platform) => (
                  <div key={platform.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`collect-${platform.value}`}
                      checked={collectForm.platforms.includes(platform.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setCollectForm({
                            ...collectForm,
                            platforms: [...collectForm.platforms, platform.value]
                          })
                        } else {
                          setCollectForm({
                            ...collectForm,
                            platforms: collectForm.platforms.filter(p => p !== platform.value)
                          })
                        }
                      }}
                    />
                    <label htmlFor={`collect-${platform.value}`} className="text-sm cursor-pointer">
                      {platform.icon} {platform.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* 关键词（可选） */}
            <div className="space-y-2">
              <Label>关键词（可选）</Label>
              <Input
                placeholder="输入关键词，用逗号分隔"
                value={collectForm.keywords}
                onChange={(e) =>
                  setCollectForm({ ...collectForm, keywords: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                不填写则采集平台热榜数据
              </p>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCollectDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCollect}>
              <TrendingUp className="h-4 w-4 mr-2" />
              开始采集
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 添加竞品对话框 */}
      <Dialog open={competitorDialogOpen} onOpenChange={setCompetitorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加竞品监控</DialogTitle>
            <DialogDescription>
              填写竞品信息，开始自动监控
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* 竞品名称 */}
            <div className="space-y-2">
              <Label>竞品名称 *</Label>
              <Input
                placeholder="输入竞品名称"
                value={competitorForm.competitorName}
                onChange={(e) =>
                  setCompetitorForm({ ...competitorForm, competitorName: e.target.value })
                }
              />
            </div>

            {/* 平台 */}
            <div className="space-y-2">
              <Label>平台 *</Label>
              <Select
                value={competitorForm.platform}
                onValueChange={(value) =>
                  setCompetitorForm({ ...competitorForm, platform: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择平台" />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((platform) => (
                    <SelectItem key={platform.value} value={platform.value}>
                      {platform.icon} {platform.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 账号URL */}
            <div className="space-y-2">
              <Label>账号URL *</Label>
              <Input
                placeholder="https://..."
                value={competitorForm.accountUrl}
                onChange={(e) =>
                  setCompetitorForm({ ...competitorForm, accountUrl: e.target.value })
                }
              />
            </div>

            {/* 账号ID（可选） */}
            <div className="space-y-2">
              <Label>账号ID（可选）</Label>
              <Input
                placeholder="平台账号ID"
                value={competitorForm.accountId}
                onChange={(e) =>
                  setCompetitorForm({ ...competitorForm, accountId: e.target.value })
                }
              />
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCompetitorDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAddCompetitor}>
              <Plus className="h-4 w-4 mr-2" />
              添加竞品
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
