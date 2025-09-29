import { CreditOperationMonitor } from '@/lib/monitoring/credit-monitor'

export class BiddingErrorHandler {
  private static retryAttempts = new Map<string, number>()
  private static maxRetries = 3

  static async handleCreditOperation<T>(
    operationId: string,
    userId: string,
    amount: number,
    type: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const monitor = CreditOperationMonitor.getInstance()
    monitor.trackOperation(operationId, userId, amount, type)

    try {
      const result = await operation()
      monitor.markSuccess(operationId)
      this.retryAttempts.delete(operationId)
      return result
    } catch (error) {
      const currentAttempts = this.retryAttempts.get(operationId) || 0

      if (currentAttempts < this.maxRetries) {
        // 指数退避重试
        const delay = Math.pow(2, currentAttempts) * 1000
        this.retryAttempts.set(operationId, currentAttempts + 1)

        console.warn(`⚠️ Credit operation ${operationId} failed, retrying in ${delay}ms (attempt ${currentAttempts + 1}/${this.maxRetries})`)

        await new Promise(resolve => setTimeout(resolve, delay))
        return this.handleCreditOperation(operationId, userId, amount, type, operation)
      } else {
        monitor.markFailed(operationId, error instanceof Error ? error.message : String(error))
        this.retryAttempts.delete(operationId)
        throw error
      }
    }
  }

  static async handleWebSocketError(error: Error, reconnectFn: () => void): Promise<void> {
    console.error('🔌 WebSocket error detected:', error)

    // 等待3秒后尝试重连
    setTimeout(() => {
      console.log('🔄 Attempting WebSocket reconnection...')
      reconnectFn()
    }, 3000)
  }

  static createOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}