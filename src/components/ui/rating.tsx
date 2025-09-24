import React from 'react'
import { cn } from '@/lib/utils'
import { Star } from 'lucide-react'

interface RatingProps {
  value: number
  max?: number
  showText?: boolean
  showCount?: boolean
  count?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
  readonly?: boolean
}

const sizeClasses = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
}

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
}

export function Rating({
  value,
  max = 5,
  showText = false,
  showCount = false,
  count,
  size = 'md',
  className,
}: RatingProps) {
  const filledStars = Math.floor(value)
  const hasHalfStar = value % 1 !== 0
  const emptyStars = max - filledStars - (hasHalfStar ? 1 : 0)

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {/* Filled stars */}
        {Array.from({ length: filledStars }).map((_, index) => (
          <Star
            key={`filled-${index}`}
            className={cn(
              sizeClasses[size],
              'fill-yellow-400 text-yellow-400'
            )}
          />
        ))}
        
        {/* Half star */}
        {hasHalfStar && (
          <div className="relative">
            <Star
              className={cn(
                sizeClasses[size],
                'text-gray-300 dark:text-gray-600'
              )}
            />
            <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
              <Star
                className={cn(
                  sizeClasses[size],
                  'fill-yellow-400 text-yellow-400'
                )}
              />
            </div>
          </div>
        )}
        
        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, index) => (
          <Star
            key={`empty-${index}`}
            className={cn(
              sizeClasses[size],
              'text-gray-300 dark:text-gray-600'
            )}
          />
        ))}
      </div>
      
      {/* Rating text */}
      {showText && (
        <span className={cn(
          'text-muted-foreground font-medium',
          textSizeClasses[size]
        )}>
          {value.toFixed(1)}
        </span>
      )}
      
      {/* Review count */}
      {showCount && count !== undefined && (
        <span className={cn(
          'text-muted-foreground',
          textSizeClasses[size]
        )}>
          ({count})
        </span>
      )}
    </div>
  )
}

export default Rating