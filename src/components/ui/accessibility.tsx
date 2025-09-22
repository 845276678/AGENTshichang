import React from 'react'

interface AccessibilityProps {
  children: React.ReactNode
  label?: string
  description?: string
  role?: string
  tabIndex?: number
}

// 可访问性包装器组件
export const AccessibleContainer: React.FC<AccessibilityProps> = ({
  children,
  label,
  description,
  role,
  tabIndex
}) => {
  const props: Record<string, any> = {}

  if (label) {
    props['aria-label'] = label
  }

  if (description) {
    props['aria-description'] = description
  }

  if (role) {
    props.role = role
  }

  if (tabIndex !== undefined) {
    props.tabIndex = tabIndex
  }

  return <div {...props}>{children}</div>
}

// 屏幕阅读器专用文本
export const ScreenReaderOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="sr-only">{children}</span>
)

// 跳转到内容链接
export const SkipToContent: React.FC = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
  >
    跳转到主要内容
  </a>
)

// 焦点管理 Hook
export const useFocusManagement = (containerRef: React.RefObject<HTMLElement>) => {
  const trapFocus = (event: KeyboardEvent) => {
    if (!containerRef.current) return

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          event.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          event.preventDefault()
        }
      }
    }
  }

  const restoreFocus = (previousActiveElement: Element | null) => {
    if (previousActiveElement && 'focus' in previousActiveElement) {
      (previousActiveElement as HTMLElement).focus()
    }
  }

  return { trapFocus, restoreFocus }
}

// 键盘导航 Hook
export const useKeyboardNavigation = () => {
  const handleKeyNavigation = (
    event: React.KeyboardEvent,
    onEnter?: () => void,
    onEscape?: () => void,
    onArrowUp?: () => void,
    onArrowDown?: () => void,
    onArrowLeft?: () => void,
    onArrowRight?: () => void
  ) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        onEnter?.()
        event.preventDefault()
        break
      case 'Escape':
        onEscape?.()
        break
      case 'ArrowUp':
        onArrowUp?.()
        event.preventDefault()
        break
      case 'ArrowDown':
        onArrowDown?.()
        event.preventDefault()
        break
      case 'ArrowLeft':
        onArrowLeft?.()
        event.preventDefault()
        break
      case 'ArrowRight':
        onArrowRight?.()
        event.preventDefault()
        break
    }
  }

  return { handleKeyNavigation }
}

// 辅助文本公告 Hook
export const useAnnouncements = () => {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }

  return { announce }
}

// 高对比度模式检测 Hook
export const useHighContrast = () => {
  const [isHighContrast, setIsHighContrast] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)')
    setIsHighContrast(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return isHighContrast
}

// 减少动画偏好检测 Hook
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return prefersReducedMotion
}