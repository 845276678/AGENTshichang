import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: vi.fn().mockImplementation(({ children, ...props }) =>
      React.createElement('div', props, children)
    ),
    span: vi.fn().mockImplementation(({ children, ...props }) =>
      React.createElement('span', props, children)
    ),
  },
  AnimatePresence: vi.fn().mockImplementation(({ children }) => children),
}))

// Mock UI components
vi.mock('@/components/ui/badge', () => ({
  Badge: vi.fn().mockImplementation(({ children, className }) =>
    React.createElement('span', { className }, children)
  )
}))

vi.mock('@/components/ui/button', () => ({
  Button: vi.fn().mockImplementation(({ children, onClick, disabled, className }) =>
    React.createElement('button', { onClick, disabled, className }, children)
  )
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock performance.now
Object.defineProperty(global, 'performance', {
  writable: true,
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    memory: {
      usedJSHeapSize: 1000000,
      totalJSHeapSize: 2000000,
      jsHeapSizeLimit: 4000000
    }
  }
})

// Mock process for Node.js environment
if (typeof global.process === 'undefined') {
  global.process = {
    memoryUsage: vi.fn(() => ({
      rss: 1000000,
      heapTotal: 2000000,
      heapUsed: 1000000,
      external: 500000,
      arrayBuffers: 100000
    }))
  } as any
}

// Import React globally for JSX
import React from 'react'
global.React = React