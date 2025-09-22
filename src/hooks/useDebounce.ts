'use client'

import { useState, useEffect } from 'react'
import { debounce } from '@/lib/utils'

interface UseDebounceProps<T> {
  value: T
  delay: number
}

export function useDebounce<T>({ value, delay }: UseDebounceProps<T>): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = debounce((newValue: T) => {
      setDebouncedValue(newValue)
    }, delay)

    handler(value)

    return () => {
      // Cleanup function would go here if debounce returned a cleanup function
    }
  }, [value, delay])

  return debouncedValue
}

// Alternative hook for debouncing functions
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const [debouncedCallback] = useState(() => debounce(callback, delay))
  
  return debouncedCallback as T
}