'use client'

/**
 * 社交媒体发布任务页面
 *
 * 功能：
 * - 创建新的发布任务
 * - 查看任务列表
 * - 查看任务详情和进度
 * - 取消任务
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
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Loader2, Plus, Send, Clock, CheckCircle2, XCircle, Loader } from 'lucide-react'

// 内容类型
const CONTENT_TYPES = [
  { value: 'VIDEO', label: '视频', icon: '🎬' },
  { value: 'IMAGE', label: '图片', icon: '🖼️' },
  { value: 'TEXT', label: '文字', icon: '📝' },
]

// 平台配置
const PLATFORMS = [
  { value: 'DOUYIN', label: '抖音', icon: '🎵' },
  { value: 'XIAOHONGSHU', label: '小红书', icon: '📕' },
  { value: 'BILIBILI', label: 'B站', icon: '📺' },
  { value: 'WEIBO', label: '微博', icon: '🔴' },
  { value: 'TIKTOK', label: 'TikTok', icon: '🎬' },
]

// 状态配置
const STATUS_CONFIG = {
  PENDING: { label: '等待中', color: 'bg-gray-500', icon: Clock },
  PROCESSING: { label: '发布中', color: 'bg-blue-500', icon: Loader },
  COMPLETED: { label: '已完成', color: 'bg-green-500', icon: CheckCircle2 },
  FAILED: { label: '失败', color: 'bg-red-500', icon: XCircle },
  CANCELLED: { label: '已取消', color: 'bg-gray-500', icon: XCircle },
}

interface SocialAccount {
  id: string
  platform: string
  platformUsername: string
  status: string
}

interface PublishTask {
  id: string
  contentType: string
  title: string
  description?: string
  targetPlatforms: string[]
  status: keyof typeof STATUS_CONFIG
  progress: number
  publishedCount: number
  failedCount: number
  creditsCost: number
  createdAt: string
}

export default function SocialTasksPage() {
  const { toast } = useToast()
  const [tasks, setTasks] = useState<PublishTask[]>([])
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  // 表单状态
  const [formData, setFormData] = useState({
    contentType: 'VIDEO',
    title: '',
    description: '',
    tags: '',
    mediaUrls: '',
    targetPlatforms: [] as string[],
    selectedAccountIds: [] as string[],
    publishType: 'immediate',
  })

  // 加载数据
  const fetchData = async () => {
    try {
      const [tasksRes, accountsRes] = await Promise.all([
        fetch('/api/social/tasks'),
        fetch('/api/social/accounts?status=ACTIVE'),
      ])

      const tasksData = await tasksRes.json()
      const accountsData = await accountsRes.json()

      if (tasksData.success) {
        setTasks(tasksData.data.tasks)
      }

      if (accountsData.success) {
        setAccounts(accountsData.data)
      }
    } catch (error: any) {
      toast({
        title: '加载失败',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // 轮询任务状态
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  // 打开创建对话框
  const handleCreate = () => {
    setFormData({
      contentType: 'VIDEO',
      title: '',
      description: '',
      tags: '',
      mediaUrls: '',
      targetPlatforms: [],
      selectedAccountIds: [],
      publishType: 'immediate',
    })
    setDialogOpen(true)
  }

  // 提交任务
  const handleSubmit = async () => {
    if (!formData.title || formData.targetPlatforms.length === 0 || formData.selectedAccountIds.length === 0) {
      toast({
        title: '请填写必填项',
        description: '标题、目标平台和账号是必填的',
        variant: 'destructive',
      })
      return
    }

    try {
      const res = await fetch('/api/social/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
          mediaUrls: formData.mediaUrls.split('\n').map(u => u.trim()).filter(Boolean),
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: '创建成功',
          description: '发布任务已创建，正在处理中...',
        })
        setDialogOpen(false)
        fetchData()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: '创建失败',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  // 取消任务
  const handleCancel = async (id: string) => {
    if (!confirm('确定要取消此任务吗？')) return

    try {
      const res = await fetch(`/api/social/tasks/${id}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: '取消成功',
          description: '任务已取消',
        })
        fetchData()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: '取消失败',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  // 根据平台筛选账号
  const getAccountsForPlatforms = () => {
    if (formData.targetPlatforms.length === 0) return []
    return accounts.filter(acc => formData.targetPlatforms.includes(acc.platform))
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
          <h1 className="text-3xl font-bold">发布任务</h1>
          <p className="text-muted-foreground mt-1">
            创建和管理社交媒体内容发布任务
          </p>
        </div>
        <Button onClick={handleCreate} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          创建任务
        </Button>
      </div>

      {/* 任务列表 */}
      {tasks.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">📤</div>
          <h3 className="text-xl font-semibold mb-2">还没有任务</h3>
          <p className="text-muted-foreground mb-4">
            创建你的第一个发布任务，开始自动化营销
          </p>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            创建任务
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => {
            const statusConfig = STATUS_CONFIG[task.status]
            const StatusIcon = statusConfig.icon
            const contentType = CONTENT_TYPES.find(t => t.value === task.contentType)

            return (
              <Card key={task.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* 标题和类型 */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{contentType?.icon}</span>
                      <h3 className="text-lg font-semibold">{task.title}</h3>
                      <Badge variant="outline">{contentType?.label}</Badge>
                    </div>

                    {/* 描述 */}
                    {task.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {task.description}
                      </p>
                    )}

                    {/* 平台标签 */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {task.targetPlatforms.map((platform) => {
                        const platformConfig = PLATFORMS.find(p => p.value === platform)
                        return (
                          <Badge key={platform} variant="secondary">
                            {platformConfig?.icon} {platformConfig?.label}
                          </Badge>
                        )
                      })}
                    </div>

                    {/* 进度 */}
                    {task.status === 'PROCESSING' && (
                      <div className="space-y-1 mb-3">
                        <div className="flex justify-between text-sm">
                          <span>发布进度</span>
                          <span>{task.progress}%</span>
                        </div>
                        <Progress value={task.progress} />
                      </div>
                    )}

                    {/* 统计 */}
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>成功: {task.publishedCount}</span>
                      <span>失败: {task.failedCount}</span>
                      <span>消耗: {task.creditsCost} 积分</span>
                      <span>创建: {new Date(task.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* 状态和操作 */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`h-4 w-4 text-white ${statusConfig.color} rounded-full p-0.5`} />
                      <span className="text-sm font-medium">{statusConfig.label}</span>
                    </div>

                    {(task.status === 'PENDING' || task.status === 'PROCESSING') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancel(task.id)}
                      >
                        取消
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* 创建任务对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>创建发布任务</DialogTitle>
            <DialogDescription>
              填写内容信息，选择目标平台和账号
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* 内容类型 */}
            <div className="space-y-2">
              <Label>内容类型 *</Label>
              <Select
                value={formData.contentType}
                onValueChange={(value) =>
                  setFormData({ ...formData, contentType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 标题 */}
            <div className="space-y-2">
              <Label>标题 *</Label>
              <Input
                placeholder="输入内容标题"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            {/* 描述 */}
            <div className="space-y-2">
              <Label>描述</Label>
              <Textarea
                placeholder="输入内容描述"
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            {/* 标签 */}
            <div className="space-y-2">
              <Label>标签</Label>
              <Input
                placeholder="输入标签，用逗号分隔"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
              />
            </div>

            {/* 媒体URL */}
            <div className="space-y-2">
              <Label>媒体URL</Label>
              <Textarea
                placeholder="每行一个URL"
                rows={3}
                value={formData.mediaUrls}
                onChange={(e) =>
                  setFormData({ ...formData, mediaUrls: e.target.value })
                }
              />
            </div>

            {/* 目标平台 */}
            <div className="space-y-2">
              <Label>目标平台 *</Label>
              <div className="grid grid-cols-2 gap-2">
                {PLATFORMS.map((platform) => (
                  <div key={platform.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={platform.value}
                      checked={formData.targetPlatforms.includes(platform.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({
                            ...formData,
                            targetPlatforms: [...formData.targetPlatforms, platform.value]
                          })
                        } else {
                          setFormData({
                            ...formData,
                            targetPlatforms: formData.targetPlatforms.filter(p => p !== platform.value)
                          })
                        }
                      }}
                    />
                    <label htmlFor={platform.value} className="text-sm cursor-pointer">
                      {platform.icon} {platform.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* 选择账号 */}
            {formData.targetPlatforms.length > 0 && (
              <div className="space-y-2">
                <Label>选择账号 *</Label>
                <div className="border rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
                  {getAccountsForPlatforms().length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      所选平台没有可用账号
                    </p>
                  ) : (
                    getAccountsForPlatforms().map((account) => {
                      const platform = PLATFORMS.find(p => p.value === account.platform)
                      return (
                        <div key={account.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={account.id}
                            checked={formData.selectedAccountIds.includes(account.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  selectedAccountIds: [...formData.selectedAccountIds, account.id]
                                })
                              } else {
                                setFormData({
                                  ...formData,
                                  selectedAccountIds: formData.selectedAccountIds.filter(id => id !== account.id)
                                })
                              }
                            }}
                          />
                          <label htmlFor={account.id} className="text-sm cursor-pointer flex items-center gap-1">
                            {platform?.icon} {account.platformUsername}
                          </label>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit}>
              <Send className="h-4 w-4 mr-2" />
              创建任务
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
