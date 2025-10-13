/**
 * 工作坊基础表单组件
 *
 * 统一的表单组件库，具有一致的样式和行为
 * 专为工作坊场景优化，支持实时验证和Agent反馈
 */

'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  X,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Bot,
  User
} from 'lucide-react'

// 基础组件Props类型
interface BaseFormFieldProps {
  label: string
  name: string
  value: any
  onChange: (value: any) => void
  error?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  className?: string
  onAgentFeedback?: (fieldName: string, value: any) => void
}

// 工作坊文本输入框
export function WorkshopInput({
  label,
  name,
  value = '',
  onChange,
  error,
  hint,
  required = false,
  disabled = false,
  className = '',
  onAgentFeedback,
  placeholder,
  maxLength = 200
}: BaseFormFieldProps & {
  placeholder?: string
  maxLength?: number
}) {
  const [isFocused, setIsFocused] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)

    // 触发Agent反馈（当输入长度足够时）
    if (onAgentFeedback && newValue.length > 10) {
      onAgentFeedback(name, newValue)
    }
  }

  return (
    <div className={`workshop-input ${className}`}>
      <Label htmlFor={name} className="flex items-center gap-2 mb-2">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>

      <div className="relative">
        <Input
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder || `请输入${label}...`}
          maxLength={maxLength}
          disabled={disabled}
          className={`transition-all duration-200 ${
            error ? 'border-red-500 focus:border-red-500' :
            isFocused ? 'border-blue-500 ring-2 ring-blue-100' : ''
          }`}
        />

        {/* 字符计数 */}
        {maxLength && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            {value.length}/{maxLength}
          </div>
        )}
      </div>

      {/* 错误和提示信息 */}
      {error && (
        <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {hint && !error && (
        <div className="mt-2 text-gray-600 text-sm">
          <Lightbulb className="w-4 h-4 inline mr-1" />
          {hint}
        </div>
      )}
    </div>
  )
}

// 工作坊多行文本框
export function WorkshopTextarea({
  label,
  name,
  value = '',
  onChange,
  error,
  hint,
  required = false,
  disabled = false,
  className = '',
  onAgentFeedback,
  placeholder,
  maxLength = 500,
  minRows = 3,
  maxRows = 8
}: BaseFormFieldProps & {
  placeholder?: string
  maxLength?: number
  minRows?: number
  maxRows?: number
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  // 自动调整高度
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const scrollHeight = textarea.scrollHeight
      const lineHeight = 24
      const rows = Math.min(Math.max(Math.ceil(scrollHeight / lineHeight), minRows), maxRows)
      textarea.style.height = `${rows * lineHeight}px`
    }
  }, [value, minRows, maxRows])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    onChange(newValue)

    // 触发Agent反馈
    if (onAgentFeedback && newValue.length > 20) {
      onAgentFeedback(name, newValue)
    }
  }

  return (
    <div className={`workshop-textarea ${className}`}>
      <Label htmlFor={name} className="flex items-center gap-2 mb-2">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>

      <div className="relative">
        <Textarea
          ref={textareaRef}
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder || `请详细描述${label}...`}
          maxLength={maxLength}
          disabled={disabled}
          className={`resize-none transition-all duration-200 ${
            error ? 'border-red-500 focus:border-red-500' :
            isFocused ? 'border-blue-500 ring-2 ring-blue-100' : ''
          }`}
          style={{ minHeight: `${minRows * 24}px` }}
        />

        {/* 字符计数 */}
        <div className="absolute right-3 bottom-3 text-xs text-gray-400 bg-white px-1">
          {value.length}/{maxLength}
        </div>
      </div>

      {/* 错误和提示信息 */}
      {error && (
        <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {hint && !error && (
        <div className="mt-2 text-gray-600 text-sm">
          <Lightbulb className="w-4 h-4 inline mr-1" />
          {hint}
        </div>
      )}
    </div>
  )
}

// 工作坊选择框
export function WorkshopSelect({
  label,
  name,
  value = '',
  onChange,
  error,
  hint,
  required = false,
  disabled = false,
  className = '',
  options,
  placeholder = '请选择...'
}: BaseFormFieldProps & {
  options: Array<{ value: string; label: string; description?: string }>
  placeholder?: string
}) {
  return (
    <div className={`workshop-select ${className}`}>
      <Label htmlFor={name} className="flex items-center gap-2 mb-2">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>

      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className={error ? 'border-red-500' : ''}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div>
                <div className="font-medium">{option.label}</div>
                {option.description && (
                  <div className="text-xs text-gray-500">{option.description}</div>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 错误和提示信息 */}
      {error && (
        <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {hint && !error && (
        <div className="mt-2 text-gray-600 text-sm">
          <Lightbulb className="w-4 h-4 inline mr-1" />
          {hint}
        </div>
      )}
    </div>
  )
}

// 工作坊滑块评分
export function WorkshopSlider({
  label,
  name,
  value = 5,
  onChange,
  error,
  hint,
  required = false,
  disabled = false,
  className = '',
  min = 1,
  max = 10,
  step = 1,
  showLabels = true,
  labels = ['低', '中', '高']
}: BaseFormFieldProps & {
  min?: number
  max?: number
  step?: number
  showLabels?: boolean
  labels?: string[]
}) {
  const handleChange = (newValue: number[]) => {
    onChange(newValue[0])
  }

  return (
    <div className={`workshop-slider ${className}`}>
      <Label htmlFor={name} className="flex items-center gap-2 mb-4">
        {label}
        {required && <span className="text-red-500">*</span>}
        <Badge variant="outline" className="ml-auto">
          {value}/{max}
        </Badge>
      </Label>

      <div className="px-4">
        <Slider
          value={[value]}
          onValueChange={handleChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className="w-full"
        />

        {/* 刻度标签 */}
        {showLabels && labels.length > 0 && (
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            {labels.map((label, index) => (
              <span key={index}>{label}</span>
            ))}
          </div>
        )}
      </div>

      {/* 错误和提示信息 */}
      {error && (
        <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {hint && !error && (
        <div className="mt-2 text-gray-600 text-sm">
          <Lightbulb className="w-4 h-4 inline mr-1" />
          {hint}
        </div>
      )}
    </div>
  )
}

// 工作坊动态列表
export function WorkshopDynamicList({
  label,
  name,
  value = [],
  onChange,
  error,
  hint,
  required = false,
  disabled = false,
  className = '',
  placeholder = '输入项目内容...',
  maxItems = 10,
  minItems = 1,
  itemMaxLength = 100
}: BaseFormFieldProps & {
  placeholder?: string
  maxItems?: number
  minItems?: number
  itemMaxLength?: number
}) {
  const [newItem, setNewItem] = useState('')

  const addItem = () => {
    if (newItem.trim() && value.length < maxItems) {
      onChange([...value, newItem.trim()])
      setNewItem('')
    }
  }

  const removeItem = (index: number) => {
    const newList = value.filter((_: any, i: number) => i !== index)
    onChange(newList)
  }

  const updateItem = (index: number, newValue: string) => {
    const newList = [...value]
    newList[index] = newValue
    onChange(newList)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      addItem()
    }
  }

  return (
    <div className={`workshop-dynamic-list ${className}`}>
      <Label htmlFor={name} className="flex items-center gap-2 mb-2">
        {label}
        {required && <span className="text-red-500">*</span>}
        <Badge variant="outline" className="ml-auto">
          {value.length}/{maxItems}
        </Badge>
      </Label>

      {/* 现有项目列表 */}
      <div className="space-y-2 mb-3">
        {value.map((item: string, index: number) => (
          <div key={index} className="flex items-center gap-2 p-2 border rounded-lg">
            <span className="text-sm font-medium text-gray-600 min-w-[20px]">
              {index + 1}.
            </span>
            <Input
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              maxLength={itemMaxLength}
              disabled={disabled}
              className="flex-1 border-0 shadow-none focus-visible:ring-0"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeItem(index)}
              disabled={disabled || value.length <= minItems}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* 添加新项目 */}
      {value.length < maxItems && (
        <div className="flex gap-2">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            maxLength={itemMaxLength}
            disabled={disabled}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={addItem}
            disabled={!newItem.trim() || disabled}
            size="sm"
            className="px-3"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* 错误和提示信息 */}
      {error && (
        <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {hint && !error && (
        <div className="mt-2 text-gray-600 text-sm">
          <Lightbulb className="w-4 h-4 inline mr-1" />
          {hint}
        </div>
      )}
    </div>
  )
}

// 工作坊数字输入框
export function WorkshopNumberInput({
  label,
  name,
  value = 0,
  onChange,
  error,
  hint,
  required = false,
  disabled = false,
  className = '',
  min = 0,
  max = 1000000,
  step = 1,
  prefix = '',
  suffix = '',
  placeholder
}: BaseFormFieldProps & {
  min?: number
  max?: number
  step?: number
  prefix?: string
  suffix?: string
  placeholder?: string
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseFloat(e.target.value) || 0
    const clampedValue = Math.min(Math.max(numValue, min), max)
    onChange(clampedValue)
  }

  return (
    <div className={`workshop-number-input ${className}`}>
      <Label htmlFor={name} className="flex items-center gap-2 mb-2">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>

      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
            {prefix}
          </span>
        )}

        <Input
          id={name}
          name={name}
          type="number"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          disabled={disabled}
          className={`${prefix ? 'pl-8' : ''} ${suffix ? 'pr-12' : ''} ${
            error ? 'border-red-500 focus:border-red-500' : ''
          }`}
        />

        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
            {suffix}
          </span>
        )}
      </div>

      {/* 错误和提示信息 */}
      {error && (
        <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {hint && !error && (
        <div className="mt-2 text-gray-600 text-sm">
          <Lightbulb className="w-4 h-4 inline mr-1" />
          {hint}
        </div>
      )}
    </div>
  )
}

// 工作坊表单验证状态指示器
export function FormFieldStatus({
  isValid,
  isRequired,
  hasValue,
  className = ''
}: {
  isValid: boolean
  isRequired: boolean
  hasValue: boolean
  className?: string
}) {
  if (!isRequired && !hasValue) {
    return null
  }

  return (
    <div className={`inline-flex items-center ml-2 ${className}`}>
      {isValid ? (
        <CheckCircle className="w-4 h-4 text-green-500" />
      ) : hasValue ? (
        <AlertCircle className="w-4 h-4 text-red-500" />
      ) : isRequired ? (
        <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
      ) : null}
    </div>
  )
}

// 工作坊表单节段分组
export function WorkshopFormSection({
  title,
  description,
  children,
  isCompleted = false,
  isActive = false,
  error,
  className = ''
}: {
  title: string
  description?: string
  children: React.ReactNode
  isCompleted?: boolean
  isActive?: boolean
  error?: string
  className?: string
}) {
  return (
    <div className={`workshop-form-section ${className} border rounded-lg p-6 ${
      isActive ? 'border-blue-300 bg-blue-50' :
      isCompleted ? 'border-green-300 bg-green-50' :
      error ? 'border-red-300 bg-red-50' : 'border-gray-200'
    }`}>
      <div className="flex items-start gap-3 mb-4">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
          isCompleted ? 'bg-green-500 text-white' :
          isActive ? 'bg-blue-500 text-white' :
          error ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-600'
        }`}>
          {isCompleted ? <CheckCircle className="w-4 h-4" /> :
           error ? <AlertCircle className="w-4 h-4" /> : '?'}
        </div>

        <div className="flex-1">
          <h3 className={`text-lg font-semibold mb-1 ${
            isActive ? 'text-blue-800' :
            isCompleted ? 'text-green-800' :
            error ? 'text-red-800' : 'text-gray-800'
          }`}>
            {title}
          </h3>

          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}

          {error && (
            <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {children}
      </div>
    </div>
  )
}