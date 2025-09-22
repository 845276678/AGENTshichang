export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, any>
  error?: {
    name: string
    message: string
    stack?: string
  }
  userId?: string
  requestId?: string
  ip?: string
  userAgent?: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isProduction = process.env.NODE_ENV === 'production'

  private formatMessage(entry: LogEntry): string {
    const { timestamp, level, message, context, error } = entry

    if (this.isDevelopment) {
      let output = `[${timestamp}] ${level.toUpperCase()}: ${message}`

      if (context) {
        output += `\nContext: ${JSON.stringify(context, null, 2)}`
      }

      if (error) {
        output += `\nError: ${error.name} - ${error.message}`
        if (error.stack) {
          output += `\nStack: ${error.stack}`
        }
      }

      return output
    }

    return JSON.stringify(entry)
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    }

    const formattedMessage = this.formatMessage(entry)

    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedMessage)
        break
      case LogLevel.WARN:
        console.warn(formattedMessage)
        break
      case LogLevel.INFO:
        console.info(formattedMessage)
        break
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.debug(formattedMessage)
        }
        break
    }

    // In production, send to external logging service
    if (this.isProduction && level === LogLevel.ERROR) {
      this.sendToExternalService(entry)
    }
  }

  private async sendToExternalService(entry: LogEntry) {
    // Implement integration with logging services like:
    // - Sentry
    // - DataDog
    // - CloudWatch
    // - LogRocket
    // - Papertrail

    try {
      // Example: Send to webhook or API
      // await fetch(process.env.LOGGING_WEBHOOK_URL, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry)
      // })
    } catch (error) {
      console.error('Failed to send log to external service:', error)
    }
  }

  error(message: string, context?: Record<string, any>, error?: Error) {
    this.log(LogLevel.ERROR, message, context, error)
  }

  warn(message: string, context?: Record<string, any>) {
    this.log(LogLevel.WARN, message, context)
  }

  info(message: string, context?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context)
  }

  debug(message: string, context?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context)
  }

  // API request logging
  logApiRequest(method: string, url: string, userId?: string, ip?: string, userAgent?: string) {
    this.info('API Request', {
      method,
      url,
      userId,
      ip,
      userAgent,
    })
  }

  // Authentication events
  logAuth(event: 'login' | 'logout' | 'register' | 'password_change' | 'failed_login', userId?: string, ip?: string) {
    this.info(`Auth: ${event}`, {
      event,
      userId,
      ip,
    })
  }

  // Security events
  logSecurity(event: string, context?: Record<string, any>) {
    this.warn(`Security: ${event}`, context)
  }

  // Performance logging
  logPerformance(operation: string, duration: number, context?: Record<string, any>) {
    this.info(`Performance: ${operation} took ${duration}ms`, {
      operation,
      duration,
      ...context,
    })
  }
}

export const logger = new Logger()

// Performance timing utility
export function withTiming<T>(operation: string, fn: () => T | Promise<T>): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const start = Date.now()
    try {
      const result = await fn()
      const duration = Date.now() - start
      logger.logPerformance(operation, duration)
      resolve(result)
    } catch (error) {
      const duration = Date.now() - start
      logger.error(`${operation} failed after ${duration}ms`, { duration }, error as Error)
      reject(error)
    }
  })
}

// Request ID middleware helper
export function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15)
}