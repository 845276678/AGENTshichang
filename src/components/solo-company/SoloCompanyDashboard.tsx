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
  AlertCircle,
  Heart,
  TrendingUp
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
    <div className="space-y-8">
      {/* 优化的日期导航卡片 */}
      <Card className="border-0 shadow-xl shadow-blue-500/10 bg-gradient-to-r from-white via-blue-50/30 to-indigo-50/30 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button
                variant="outline"
                size="lg"
                onClick={() => changeDate('prev')}
                className="rounded-full bg-white/60 backdrop-blur border-white/30 hover:bg-white/80 shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              <div className="text-center px-4">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent">
                  {currentDate.toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h2>
                <p className="text-base text-gray-600 mt-1 font-medium">
                  {currentDate.toLocaleDateString('zh-CN', { weekday: 'long' })}
                </p>
              </div>

              <Button
                variant="outline"
                size="lg"
                onClick={() => changeDate('next')}
                className="rounded-full bg-white/60 backdrop-blur border-white/30 hover:bg-white/80 shadow-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">
                    任务进度 {currentSchedule.tasks.filter(t => t.completed).length}/
                    {currentSchedule.tasks.length}
                  </span>
                </div>
              </div>
              <Button
                size="lg"
                onClick={() => setShowTaskForm(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/25 border-0 rounded-full px-6"
              >
                <Plus className="w-5 h-5 mr-2" />
                添加任务
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 重新设计的标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab as any} className="space-y-8">
        <div className="flex justify-center">
          <TabsList className="bg-white/70 backdrop-blur-sm border border-white/30 shadow-lg rounded-full p-1 h-14">
            <TabsTrigger
              value="schedule"
              className="rounded-full px-8 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
            >
              <Calendar className="w-4 h-4 mr-2" />
              今日规划
            </TabsTrigger>
            <TabsTrigger
              value="analysis"
              className="rounded-full px-8 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              部门分析
            </TabsTrigger>
            <TabsTrigger
              value="reflection"
              className="rounded-full px-8 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
            >
              <Target className="w-4 h-4 mr-2" />
              日终反思
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 今日规划 */}
        <TabsContent value="schedule" className="space-y-8">
          {/* 六大部门概览 - 重新设计 */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {Object.entries(DEPARTMENTS).map(([id, dept]) => {
              const tasks = getTasksByDepartment(id as DepartmentId)
              const completedTasks = tasks.filter(t => t.completed).length
              const totalHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0)
              const progressPercentage = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0

              // 部门颜色映射
              const colorClasses = {
                purple: 'from-purple-500 to-purple-600 bg-purple-50 text-purple-700 border-purple-200',
                blue: 'from-blue-500 to-blue-600 bg-blue-50 text-blue-700 border-blue-200',
                green: 'from-green-500 to-green-600 bg-green-50 text-green-700 border-green-200',
                orange: 'from-orange-500 to-orange-600 bg-orange-50 text-orange-700 border-orange-200',
                yellow: 'from-yellow-500 to-yellow-600 bg-yellow-50 text-yellow-700 border-yellow-200',
                pink: 'from-pink-500 to-pink-600 bg-pink-50 text-pink-700 border-pink-200'
              }

              const colors = colorClasses[dept.color as keyof typeof colorClasses] || colorClasses.purple

              return (
                <Card key={id} className={`group hover:shadow-2xl hover:shadow-${dept.color}-500/10 transition-all duration-300 border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors.split(' ')[0]} ${colors.split(' ')[1]} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <dept.icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="text-right">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${colors.split(' ')[2]} ${colors.split(' ')[4]}`}>
                          {totalHours}小时
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{dept.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{dept.description}</p>
                      <p className="text-xs text-gray-500">{dept.focus}</p>
                    </div>

                    {tasks.length > 0 ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium text-gray-700">今日进度</span>
                          <span className={`font-bold ${colors.split(' ')[3]}`}>
                            {completedTasks}/{tasks.length}
                          </span>
                        </div>
                        <div className="relative">
                          <Progress
                            value={progressPercentage}
                            className="h-3 bg-gray-100"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold text-white mix-blend-difference">
                              {Math.round(progressPercentage)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Plus className="w-4 h-4 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-400">暂无任务安排</p>
                        <p className="text-xs text-gray-300 mt-1">点击添加任务开始规划</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* 时间段规划 - 重新设计 */}
          <div className="grid gap-8">
            {Object.entries(TIME_SLOTS).map(([slot, config]) => {
              const tasks = getTasksByTimeSlot(slot)
              const completedTasks = tasks.filter(t => t.completed).length
              const progressPercentage = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0

              // 时间段渐变色
              const timeGradients = {
                morning: 'from-orange-400 via-yellow-400 to-amber-400',
                afternoon: 'from-blue-400 via-cyan-400 to-sky-400',
                evening: 'from-purple-400 via-indigo-400 to-violet-400'
              }

              const gradient = timeGradients[slot as keyof typeof timeGradients]

              return (
                <Card key={slot} className="border-0 shadow-xl shadow-gray-500/5 bg-white/70 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-4 bg-gradient-to-r from-white/60 to-gray-50/60 rounded-t-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                          <span className="text-2xl">{config.icon}</span>
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-bold text-gray-900">{config.label}</CardTitle>
                          <p className="text-base text-gray-600 font-medium">{config.time}</p>
                          {tasks.length > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-sm text-gray-600">
                                进度 {completedTasks}/{tasks.length} ({Math.round(progressPercentage)}%)
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30 shadow-sm">
                          <span className="text-sm font-medium text-gray-700">
                            {tasks.length} 个任务
                          </span>
                        </div>
                        {tasks.length > 0 && (
                          <div className="mt-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 bg-gradient-to-r ${gradient} rounded-full transition-all duration-300`}
                                style={{ width: `${progressPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    {tasks.length > 0 ? (
                      <div className="space-y-4">
                        {tasks.map(task => {
                          const dept = DEPARTMENTS[task.department]

                          // 优先级颜色
                          const priorityColors = {
                            high: 'bg-red-100 text-red-700 border-red-200',
                            medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                            low: 'bg-green-100 text-green-700 border-green-200'
                          }

                          return (
                            <div
                              key={task.id}
                              className={`group flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 ${
                                task.completed
                                  ? 'bg-gray-50/80 border-gray-200 opacity-75'
                                  : 'bg-white/90 border-white/50 hover:border-gray-200 hover:shadow-lg hover:bg-white'
                              }`}
                            >
                              {/* 完成状态按钮 */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleTask(task.id)}
                                className="p-0 h-auto hover:bg-transparent"
                              >
                                <div className={`w-6 h-6 rounded-full border-3 flex items-center justify-center transition-all duration-300 ${
                                  task.completed
                                    ? 'bg-green-500 border-green-500 shadow-lg shadow-green-500/25'
                                    : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
                                }`}>
                                  {task.completed && (
                                    <Check className="w-4 h-4 text-white" />
                                  )}
                                </div>
                              </Button>

                              {/* 部门标识 */}
                              <div className={`w-3 h-12 rounded-full bg-gradient-to-b from-${dept.color}-400 to-${dept.color}-600 shadow-sm`} />

                              {/* 任务内容 */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className={`font-semibold text-lg ${
                                    task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                                  }`}>
                                    {task.title}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <div className={`px-2 py-1 rounded-lg text-xs font-medium border ${priorityColors[task.priority]}`}>
                                      {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}优先级
                                    </div>
                                    <div className="px-2 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                      {dept.name}
                                    </div>
                                    <div className="px-2 py-1 rounded-lg text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {task.estimatedHours}h
                                    </div>
                                  </div>
                                </div>
                                {task.description && (
                                  <p className="text-sm text-gray-600 leading-relaxed">
                                    {task.description}
                                  </p>
                                )}
                              </div>

                              {/* 操作按钮 */}
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <Button variant="ghost" size="sm" className="w-8 h-8 p-0 hover:bg-blue-50 hover:text-blue-600">
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="w-8 h-8 p-0 hover:bg-red-50 hover:text-red-600">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${gradient} opacity-20 flex items-center justify-center mx-auto mb-4`}>
                          <Clock className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-600 mb-2">这个时间段还没有安排任务</h3>
                        <p className="text-sm text-gray-500 mb-4">为这个时间段添加一些任务来开始你的高效规划</p>
                        <Button
                          variant="outline"
                          size="lg"
                          className="bg-white/60 hover:bg-white border-gray-200 hover:border-gray-300"
                          onClick={() => setShowTaskForm(true)}
                        >
                          <Plus className="w-5 h-5 mr-2" />
                          添加{config.label}任务
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* 部门分析 - 重新设计 */}
        <TabsContent value="analysis" className="space-y-8">
          <div className="grid gap-8">
            <Card className="border-0 shadow-xl shadow-blue-500/5 bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/20 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  部门时间分配分析
                </CardTitle>
                <p className="text-gray-600 text-lg">了解您在各个职能部门的时间投入分布</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {calculateDepartmentBalance().map(({ department, hours, percentage }, index) => {
                  const dept = DEPARTMENTS[department]

                  // 部门渐变色配置
                  const deptGradients = {
                    purple: 'from-purple-400 to-purple-600',
                    blue: 'from-blue-400 to-blue-600',
                    green: 'from-green-400 to-green-600',
                    orange: 'from-orange-400 to-orange-600',
                    yellow: 'from-yellow-400 to-yellow-600',
                    pink: 'from-pink-400 to-pink-600'
                  }

                  const gradient = deptGradients[dept.color as keyof typeof deptGradients]

                  return (
                    <div key={department} className="bg-white/60 rounded-xl p-6 backdrop-blur-sm border border-white/30 hover:bg-white/80 transition-all duration-300">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                            <dept.icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <span className="font-bold text-lg text-gray-900">{dept.name}</span>
                            <p className="text-sm text-gray-600">{dept.focus}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">{hours}<span className="text-sm text-gray-600 ml-1">小时</span></div>
                          <div className="text-sm font-medium text-gray-600">{percentage}% 占比</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>时间投入</span>
                          <span>{percentage}%</span>
                        </div>
                        <div className="relative">
                          <div className="w-full bg-gray-200 rounded-full h-4">
                            <div
                              className={`h-4 bg-gradient-to-r ${gradient} rounded-full transition-all duration-1000 shadow-sm`}
                              style={{
                                width: `${percentage}%`,
                                animationDelay: `${index * 200}ms`
                              }}
                            ></div>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold text-white mix-blend-difference">
                              {percentage}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl shadow-amber-500/5 bg-gradient-to-br from-white via-amber-50/20 to-orange-50/20 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  智能平衡度建议
                </CardTitle>
                <p className="text-gray-600 text-lg">基于一人公司最佳实践的个性化建议</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                      <Lightbulb className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-blue-900 mb-2">💡 战略思考建议</h4>
                      <p className="text-blue-800 leading-relaxed">
                        董事会思考时间建议保持在15-20%，确保有足够时间进行战略思考和长远规划。
                        作为一人公司的CEO，战略决策是您最重要的职责之一。
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-100">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-900 mb-2">⚠️ 健康管理提醒</h4>
                      <p className="text-amber-800 leading-relaxed">
                        行政部时间不足，记得关注个人健康和休息。建议每天至少安排1-2小时用于运动、
                        放松和个人成长，这是可持续发展的关键。
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-green-900 mb-2">📈 效率优化建议</h4>
                      <p className="text-green-800 leading-relaxed">
                        生产部和研发部的时间分配看起来很合理。建议在高效时段专注核心工作，
                        在低效时段处理行政事务和学习充电。
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 日终反思 - 重新设计 */}
        <TabsContent value="reflection" className="space-y-8">
          <Card className="border-0 shadow-xl shadow-purple-500/5 bg-gradient-to-br from-white via-purple-50/20 to-pink-50/20 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                今日总结与反思
              </CardTitle>
              <p className="text-gray-600 text-lg">记录今天的收获，为明天的成长做准备</p>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* 反思文本区域 */}
              <div className="bg-white/60 rounded-xl p-6 backdrop-blur-sm border border-white/30">
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  📝 今日收获与感悟
                </label>
                <Textarea
                  placeholder="回顾今天的工作，有什么收获和感悟？&#10;• 遇到了什么挑战？如何解决的？&#10;• 有什么新的想法或灵感？&#10;• 明天可以如何改进和优化？&#10;• 感谢今天努力的自己..."
                  rows={6}
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
                  className="text-base leading-relaxed bg-white/80 border-white/50 focus:border-purple-300 focus:ring-purple-200 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 心情状态 */}
                <div className="bg-white/60 rounded-xl p-6 backdrop-blur-sm border border-white/30">
                  <label className="block text-lg font-semibold text-gray-900 mb-4">
                    😊 今日心情状态
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'excellent', emoji: '😄', label: '很棒', color: 'from-green-400 to-emerald-400' },
                      { value: 'good', emoji: '😊', label: '不错', color: 'from-blue-400 to-cyan-400' },
                      { value: 'okay', emoji: '😐', label: '一般', color: 'from-yellow-400 to-orange-400' },
                      { value: 'poor', emoji: '😔', label: '不好', color: 'from-red-400 to-pink-400' }
                    ].map(mood => (
                      <Button
                        key={mood.value}
                        variant={currentSchedule.mood === mood.value ? 'default' : 'outline'}
                        size="lg"
                        onClick={() => {
                          setSchedules(prev => ({
                            ...prev,
                            [dateKey]: {
                              ...currentSchedule,
                              mood: mood.value as any
                            }
                          }))
                        }}
                        className={`h-auto py-4 text-base font-medium transition-all duration-300 ${
                          currentSchedule.mood === mood.value
                            ? `bg-gradient-to-r ${mood.color} text-white shadow-lg border-0 hover:shadow-xl`
                            : 'bg-white/60 hover:bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-2xl">{mood.emoji}</span>
                          <span>{mood.label}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* 效率评分 */}
                <div className="bg-white/60 rounded-xl p-6 backdrop-blur-sm border border-white/30">
                  <label className="block text-lg font-semibold text-gray-900 mb-4">
                    ⚡ 效率评分: {currentSchedule.productivity}/10
                  </label>

                  <div className="space-y-4">
                    {/* 评分滑块 */}
                    <div className="relative">
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
                        className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #8b5cf6 0%, #a855f7 ${currentSchedule.productivity * 10}%, #e5e7eb ${currentSchedule.productivity * 10}%, #e5e7eb 100%)`
                        }}
                      />
                      <div className="flex justify-between text-sm text-gray-500 mt-2">
                        <span>1</span>
                        <span>5</span>
                        <span>10</span>
                      </div>
                    </div>

                    {/* 效率描述 */}
                    <div className="text-center">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                        currentSchedule.productivity >= 8 ? 'bg-green-100 text-green-700' :
                        currentSchedule.productivity >= 6 ? 'bg-blue-100 text-blue-700' :
                        currentSchedule.productivity >= 4 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {currentSchedule.productivity >= 8 ? '🚀 效率超群' :
                         currentSchedule.productivity >= 6 ? '✨ 表现良好' :
                         currentSchedule.productivity >= 4 ? '💪 还需努力' :
                         '😴 状态低迷'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 保存按钮 */}
              <div className="flex justify-center pt-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/25 border-0 px-8 py-4 text-lg"
                >
                  💾 保存今日反思
                </Button>
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