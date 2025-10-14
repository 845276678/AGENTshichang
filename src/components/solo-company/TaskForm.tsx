/**
 * 任务创建表单组件
 *
 * 功能：
 * 1. 选择所属部门
 * 2. 设置任务详情
 * 3. 安排时间段
 * 4. 预估工作时间
 */

'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X, Clock, AlertTriangle } from 'lucide-react'
import { DEPARTMENTS, type DepartmentId } from '@/app/solo-company/page'

interface TaskFormData {
  department: DepartmentId | ''
  title: string
  description: string
  timeSlot: 'morning' | 'afternoon' | 'evening' | ''
  estimatedHours: number
  priority: 'high' | 'medium' | 'low'
}

interface TaskFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (task: Omit<TaskFormData, 'department'> & { department: DepartmentId }) => void
}

const TIME_SLOT_OPTIONS = [
  { value: 'morning', label: '上午 (09:00-12:00)', icon: '🌅' },
  { value: 'afternoon', label: '下午 (14:00-18:00)', icon: '☀️' },
  { value: 'evening', label: '晚上 (19:00-22:00)', icon: '🌙' }
]

const PRIORITY_OPTIONS = [
  { value: 'high', label: '高优先级', color: 'red' },
  { value: 'medium', label: '中优先级', color: 'yellow' },
  { value: 'low', label: '低优先级', color: 'green' }
]

export default function TaskForm({ open, onClose, onSubmit }: TaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    department: '',
    title: '',
    description: '',
    timeSlot: '',
    estimatedHours: 1,
    priority: 'medium'
  })

  const [errors, setErrors] = useState<Partial<Record<keyof TaskFormData, string>>>({})

  // 验证表单
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TaskFormData, string>> = {}

    if (!formData.department) {
      newErrors.department = '请选择所属部门'
    }
    if (!formData.title.trim()) {
      newErrors.title = '请输入任务标题'
    }
    if (!formData.timeSlot) {
      newErrors.timeSlot = '请选择时间段'
    }
    if (formData.estimatedHours <= 0 || formData.estimatedHours > 8) {
      newErrors.estimatedHours = '预估时间应在0.5-8小时之间'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 提交表单
  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData as TaskFormData & { department: DepartmentId })
      handleClose()
    }
  }

  // 关闭表单
  const handleClose = () => {
    setFormData({
      department: '',
      title: '',
      description: '',
      timeSlot: '',
      estimatedHours: 1,
      priority: 'medium'
    })
    setErrors({})
    onClose()
  }

  // 获取部门的示例任务
  const getDepartmentExamples = (deptId: DepartmentId) => {
    return DEPARTMENTS[deptId].examples
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>添加新任务</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 选择部门 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">选择部门 *</label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(DEPARTMENTS).map(([id, dept]) => (
                <Card
                  key={id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    formData.department === id
                      ? `ring-2 ring-${dept.color}-500 bg-${dept.color}-50`
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, department: id as DepartmentId }))}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-${dept.color}-100 flex items-center justify-center`}>
                        <dept.icon className={`w-4 h-4 text-${dept.color}-600`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{dept.name}</h3>
                        <p className="text-xs text-gray-600">{dept.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {errors.department && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {errors.department}
              </p>
            )}
          </div>

          {/* 部门示例任务 */}
          {formData.department && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-sm text-blue-900 mb-2">
                {DEPARTMENTS[formData.department].name} 常见任务示例：
              </h4>
              <div className="flex flex-wrap gap-1">
                {getDepartmentExamples(formData.department).map((example, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs cursor-pointer hover:bg-blue-200"
                    onClick={() => setFormData(prev => ({ ...prev, title: example }))}
                  >
                    {example}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 任务标题 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">任务标题 *</label>
            <Input
              placeholder="输入具体的任务内容"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
            {errors.title && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {errors.title}
              </p>
            )}
          </div>

          {/* 任务描述 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">任务描述 (可选)</label>
            <Textarea
              placeholder="详细描述任务的具体内容、目标和要求..."
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 时间段选择 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">时间段 *</label>
              <Select
                value={formData.timeSlot}
                onValueChange={(value) => setFormData(prev => ({ ...prev, timeSlot: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择时间段" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOT_OPTIONS.map(slot => (
                    <SelectItem key={slot.value} value={slot.value}>
                      <div className="flex items-center gap-2">
                        <span>{slot.icon}</span>
                        <span>{slot.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.timeSlot && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.timeSlot}
                </p>
              )}
            </div>

            {/* 预估时间 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">预估时间 (小时) *</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0.5"
                  max="8"
                  step="0.5"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    estimatedHours: parseFloat(e.target.value) || 1
                  }))}
                />
                <Clock className="w-4 h-4 text-gray-400" />
              </div>
              {errors.estimatedHours && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.estimatedHours}
                </p>
              )}
            </div>
          </div>

          {/* 优先级选择 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">任务优先级</label>
            <div className="flex gap-2">
              {PRIORITY_OPTIONS.map(priority => (
                <Button
                  key={priority.value}
                  variant={formData.priority === priority.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, priority: priority.value as any }))}
                >
                  <div className={`w-2 h-2 rounded-full bg-${priority.color}-500 mr-2`} />
                  {priority.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            取消
          </Button>
          <Button onClick={handleSubmit}>
            添加任务
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}