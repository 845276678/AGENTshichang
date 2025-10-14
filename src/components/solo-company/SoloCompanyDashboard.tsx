/**
 * 一人公司仪表板组件
 *
 * 核心功能：
 * 1. 六大部门时间规划
 * 2. 日程管理和任务跟踪
 * 3. 部门平衡度分析
 * 4. 每日反思和总结
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Calendar,
  Clock,
  Plus,
  Check,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Target,
  Lightbulb,
  AlertCircle
} from 'lucide-react'
import { DEPARTMENTS, type DepartmentId } from '@/app/solo-company/page'
import TaskForm from '@/components/solo-company/TaskForm'

// 任务数据类型
interface Task {
  id: string
  department: DepartmentId
  title: string
  description?: string
  timeSlot: 'morning' | 'afternoon' | 'evening'
  estimatedHours: number
  completed: boolean
  priority: 'high' | 'medium' | 'low'
  createdAt: Date
}

// 日程数据类型
interface DaySchedule {
  date: string
  tasks: Task[]
  reflection: string
  departmentHours: Record<DepartmentId, number>
  mood: 'excellent' | 'good' | 'okay' | 'poor'
  productivity: number // 1-10
}

// 时间段配置
const TIME_SLOTS = {
  morning: { label: '上午', time: '09:00-12:00', icon: '🌅' },
  afternoon: { label: '下午', time: '14:00-18:00', icon: '☀️' },
  evening: { label: '晚上', time: '19:00-22:00', icon: '🌙' }
} as const

export default function SoloCompanyDashboard() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [schedules, setSchedules] = useState<Record<string, DaySchedule>>({})
  const [activeTab, setActiveTab] = useState<'schedule' | 'analysis' | 'reflection'>('schedule')
  const [showTaskForm, setShowTaskForm] = useState(false)

  const dateKey = currentDate.toISOString().split('T')[0]
  const currentSchedule = schedules[dateKey] || createEmptySchedule(dateKey)

  // 创建空的日程
  function createEmptySchedule(date: string): DaySchedule {
    return {
      date,
      tasks: [],
      reflection: '',
      departmentHours: {
        board: 0,
        rd: 0,
        production: 0,
        marketing: 0,
        finance: 0,
        hr: 0
      },
      mood: 'good',
      productivity: 7
    }
  }

  // 获取部门任务
  const getTasksByDepartment = (dept: DepartmentId, timeSlot?: string) => {
    return currentSchedule.tasks.filter(task =>
      task.department === dept &&
      (!timeSlot || task.timeSlot === timeSlot)
    )
  }

  // 获取时间段任务
  const getTasksByTimeSlot = (timeSlot: string) => {
    return currentSchedule.tasks.filter(task => task.timeSlot === timeSlot)
  }

  // 计算部门工作时间分布
  const calculateDepartmentBalance = () => {
    const total = Object.values(currentSchedule.departmentHours).reduce((sum, hours) => sum + hours, 0)
    return Object.entries(currentSchedule.departmentHours).map(([dept, hours]) => ({
      department: dept as DepartmentId,
      hours,
      percentage: total > 0 ? Math.round((hours / total) * 100) : 0
    }))
  }

  // 切换日期
  const changeDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
    setCurrentDate(newDate)
  }

  // 添加任务
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
      completed: false
    }

    const updatedSchedule = {
      ...currentSchedule,
      tasks: [...currentSchedule.tasks, newTask]
    }

    setSchedules(prev => ({
      ...prev,
      [dateKey]: updatedSchedule
    }))
  }

  // 切换任务完成状态
  const toggleTask = (taskId: string) => {
    const updatedTasks = currentSchedule.tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    )

    setSchedules(prev => ({
      ...prev,
      [dateKey]: { ...currentSchedule, tasks: updatedTasks }
    }))
  }

  return (
    <div className="space-y-6">
      {/* 日期导航 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeDate('prev')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="text-center">
                <h2 className="text-xl font-semibold">
                  {currentDate.toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h2>
                <p className="text-sm text-gray-600">
                  {currentDate.toLocaleDateString('zh-CN', { weekday: 'long' })}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => changeDate('next')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline">
                任务 {currentSchedule.tasks.filter(t => t.completed).length}/
                {currentSchedule.tasks.length}
              </Badge>
              <Button
                size="sm"
                onClick={() => setShowTaskForm(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                添加任务
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 主要内容标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab as any}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="schedule">今日规划</TabsTrigger>
          <TabsTrigger value="analysis">部门分析</TabsTrigger>
          <TabsTrigger value="reflection">日终反思</TabsTrigger>
        </TabsList>

        {/* 今日规划 */}
        <TabsContent value="schedule" className="space-y-6">
          {/* 六大部门概览 */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(DEPARTMENTS).map(([id, dept]) => {
              const tasks = getTasksByDepartment(id as DepartmentId)
              const completedTasks = tasks.filter(t => t.completed).length
              const totalHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0)

              return (
                <Card key={id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-lg bg-${dept.color}-100 flex items-center justify-center`}>
                        <dept.icon className={`w-5 h-5 text-${dept.color}-600`} />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {totalHours}h
                      </Badge>
                    </div>
                    <h3 className="font-medium text-sm mb-1">{dept.name}</h3>
                    <p className="text-xs text-gray-600 mb-2">{dept.description}</p>

                    {tasks.length > 0 ? (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>完成度</span>
                          <span>{completedTasks}/{tasks.length}</span>
                        </div>
                        <Progress
                          value={tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0}
                          className="h-2"
                        />
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">暂无任务</p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* 时间段规划 */}
          <div className="grid gap-6">
            {Object.entries(TIME_SLOTS).map(([slot, config]) => {
              const tasks = getTasksByTimeSlot(slot)

              return (
                <Card key={slot}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{config.icon}</span>
                        <div>
                          <CardTitle className="text-lg">{config.label}</CardTitle>
                          <p className="text-sm text-gray-600">{config.time}</p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {tasks.length} 个任务
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {tasks.length > 0 ? (
                      <div className="space-y-3">
                        {tasks.map(task => {
                          const dept = DEPARTMENTS[task.department]
                          return (
                            <div
                              key={task.id}
                              className={`flex items-center gap-3 p-3 rounded-lg border ${
                                task.completed
                                  ? 'bg-gray-50 opacity-75'
                                  : 'bg-white hover:shadow-sm'
                              } transition-all`}
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleTask(task.id)}
                                className="p-1 h-auto"
                              >
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                  task.completed
                                    ? 'bg-green-500 border-green-500'
                                    : 'border-gray-300 hover:border-gray-400'
                                }`}>
                                  {task.completed && (
                                    <Check className="w-3 h-3 text-white" />
                                  )}
                                </div>
                              </Button>

                              <div className={`w-2 h-2 rounded-full bg-${dept.color}-500`} />

                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`font-medium ${
                                    task.completed ? 'line-through text-gray-500' : ''
                                  }`}>
                                    {task.title}
                                  </span>
                                  <Badge variant="secondary" className="text-xs">
                                    {dept.name}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {task.estimatedHours}h
                                  </Badge>
                                </div>
                                {task.description && (
                                  <p className="text-xs text-gray-600">
                                    {task.description}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm" className="p-1 h-auto">
                                  <Edit3 className="w-3 h-3" />
                                </Button>
                                <Button variant="ghost" size="sm" className="p-1 h-auto">
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">这个时间段还没有安排任务</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2"
                          onClick={() => setShowTaskForm(true)}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          添加任务
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* 部门分析 */}
        <TabsContent value="analysis">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  部门时间分配
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {calculateDepartmentBalance().map(({ department, hours, percentage }) => {
                    const dept = DEPARTMENTS[department]
                    return (
                      <div key={department} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <dept.icon className={`w-4 h-4 text-${dept.color}-600`} />
                            <span className="font-medium">{dept.name}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {hours}h ({percentage}%)
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  平衡度建议
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-900">建议</span>
                    </div>
                    <p className="text-sm text-blue-800">
                      董事会思考时间建议保持在15-20%，确保有足够时间进行战略思考
                    </p>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span className="font-medium text-amber-900">注意</span>
                    </div>
                    <p className="text-sm text-amber-800">
                      行政部时间不足，记得关注个人健康和休息
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 日终反思 */}
        <TabsContent value="reflection">
          <Card>
            <CardHeader>
              <CardTitle>今日总结与反思</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">今日收获与感悟</label>
                <Textarea
                  placeholder="回顾今天的工作，有什么收获和感悟？遇到了什么挑战？明天可以如何改进？"
                  rows={4}
                  value={currentSchedule.reflection}
                  onChange={(e) => {
                    setSchedules(prev => ({
                      ...prev,
                      [dateKey]: {
                        ...currentSchedule,
                        reflection: e.target.value
                      }
                    }))
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">心情状态</label>
                  <div className="flex gap-2">
                    {[
                      { value: 'excellent', emoji: '😄', label: '很棒' },
                      { value: 'good', emoji: '😊', label: '不错' },
                      { value: 'okay', emoji: '😐', label: '一般' },
                      { value: 'poor', emoji: '😔', label: '不好' }
                    ].map(mood => (
                      <Button
                        key={mood.value}
                        variant={currentSchedule.mood === mood.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setSchedules(prev => ({
                            ...prev,
                            [dateKey]: {
                              ...currentSchedule,
                              mood: mood.value as any
                            }
                          }))
                        }}
                      >
                        <span className="mr-1">{mood.emoji}</span>
                        {mood.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    效率评分: {currentSchedule.productivity}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={currentSchedule.productivity}
                    onChange={(e) => {
                      setSchedules(prev => ({
                        ...prev,
                        [dateKey]: {
                          ...currentSchedule,
                          productivity: parseInt(e.target.value)
                        }
                      }))
                    }}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 任务创建表单 */}
      <TaskForm
        open={showTaskForm}
        onClose={() => setShowTaskForm(false)}
        onSubmit={(taskData) => {
          addTask(taskData)
          setShowTaskForm(false)
        }}
      />
    </div>
  )
}