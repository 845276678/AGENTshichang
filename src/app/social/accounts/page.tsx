'use client'

/**
 * 社交账号管理页面
 *
 * 功能：
 * - 查看所有已绑定的社交账号
 * - 添加新账号
 * - 编辑账号信息
 * - 删除账号
 * - 查看账号验证状态
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Trash2, Edit, CheckCircle, XCircle, Clock } from 'lucide-react'

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
  ACTIVE: { label: '正常', color: 'bg-green-500', icon: CheckCircle },
  PENDING_VERIFICATION: { label: '验证中', color: 'bg-yellow-500', icon: Clock },
  COOKIE_EXPIRED: { label: 'Cookie过期', color: 'bg-red-500', icon: XCircle },
  VERIFICATION_FAILED: { label: '验证失败', color: 'bg-red-500', icon: XCircle },
}

interface SocialAccount {
  id: string
  platform: string
  platformAccountId: string
  platformUsername: string
  status: keyof typeof STATUS_CONFIG
  lastVerifiedAt: string
  cookieExpiresAt: string
  createdAt: string
}

export default function SocialAccountsPage() {
  const { toast } = useToast()
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<SocialAccount | null>(null)

  // 表单状态
  const [formData, setFormData] = useState({
    platform: '',
    platformAccountId: '',
    platformUsername: '',
    cookieString: '',
  })

  // 加载账号列表
  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/social/accounts')
      const data = await res.json()

      if (data.success) {
        setAccounts(data.data)
      } else {
        throw new Error(data.error)
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
    fetchAccounts()
  }, [])

  // 打开添加对话框
  const handleAdd = () => {
    setEditingAccount(null)
    setFormData({
      platform: '',
      platformAccountId: '',
      platformUsername: '',
      cookieString: '',
    })
    setDialogOpen(true)
  }

  // 提交表单
  const handleSubmit = async () => {
    if (!formData.platform || !formData.platformAccountId || !formData.cookieString) {
      toast({
        title: '请填写必填项',
        description: '平台、账号ID和Cookie是必填的',
        variant: 'destructive',
      })
      return
    }

    try {
      const res = await fetch('/api/social/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: '添加成功',
          description: '账号已添加，正在验证中...',
        })
        setDialogOpen(false)
        fetchAccounts()
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

  // 删除账号
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除此账号吗？')) return

    try {
      const res = await fetch(`/api/social/accounts/${id}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: '删除成功',
          description: '账号已删除',
        })
        fetchAccounts()
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
          <h1 className="text-3xl font-bold">社交账号管理</h1>
          <p className="text-muted-foreground mt-1">
            管理你的社交媒体账号，用于自动发布内容
          </p>
        </div>
        <Button onClick={handleAdd} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          添加账号
        </Button>
      </div>

      {/* 账号列表 */}
      {accounts.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">🔗</div>
          <h3 className="text-xl font-semibold mb-2">还没有账号</h3>
          <p className="text-muted-foreground mb-4">
            添加你的社交媒体账号，开始自动发布内容
          </p>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            添加第一个账号
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => {
            const platform = PLATFORMS.find((p) => p.value === account.platform)
            const statusConfig = STATUS_CONFIG[account.status]
            const StatusIcon = statusConfig.icon

            return (
              <Card key={account.id} className="p-6">
                {/* 平台头部 */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{platform?.icon}</span>
                    <div>
                      <h3 className="font-semibold">{platform?.label}</h3>
                      <p className="text-sm text-muted-foreground">
                        {account.platformUsername}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(account.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* 状态 */}
                <div className="flex items-center gap-2 mb-3">
                  <StatusIcon className={`h-4 w-4 text-white ${statusConfig.color} rounded-full p-0.5`} />
                  <span className="text-sm">{statusConfig.label}</span>
                </div>

                {/* 信息 */}
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>账号ID: {account.platformAccountId}</div>
                  <div>
                    最后验证: {new Date(account.lastVerifiedAt).toLocaleDateString()}
                  </div>
                  <div>
                    Cookie到期: {new Date(account.cookieExpiresAt).toLocaleDateString()}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* 添加账号对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>添加社交账号</DialogTitle>
            <DialogDescription>
              填写账号信息和Cookie，系统会自动验证
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* 平台选择 */}
            <div className="space-y-2">
              <Label>平台 *</Label>
              <Select
                value={formData.platform}
                onValueChange={(value) =>
                  setFormData({ ...formData, platform: value })
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

            {/* 账号ID */}
            <div className="space-y-2">
              <Label>账号ID *</Label>
              <Input
                placeholder="平台账号ID"
                value={formData.platformAccountId}
                onChange={(e) =>
                  setFormData({ ...formData, platformAccountId: e.target.value })
                }
              />
            </div>

            {/* 用户名 */}
            <div className="space-y-2">
              <Label>用户名（可选）</Label>
              <Input
                placeholder="显示名称"
                value={formData.platformUsername}
                onChange={(e) =>
                  setFormData({ ...formData, platformUsername: e.target.value })
                }
              />
            </div>

            {/* Cookie */}
            <div className="space-y-2">
              <Label>Cookie *</Label>
              <Textarea
                placeholder="粘贴从浏览器复制的Cookie"
                rows={4}
                value={formData.cookieString}
                onChange={(e) =>
                  setFormData({ ...formData, cookieString: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                从浏览器开发者工具中复制Cookie字符串
              </p>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit}>添加账号</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
