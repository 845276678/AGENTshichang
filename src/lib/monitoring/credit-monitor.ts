export class CreditOperationMonitor {
  private static instance: CreditOperationMonitor
  private operations: Map<string, {
    userId: string
    amount: number
    type: string
    timestamp: Date
    status: 'pending' | 'success' | 'failed'
  }> = new Map()

  static getInstance(): CreditOperationMonitor {
    if (!CreditOperationMonitor.instance) {
      CreditOperationMonitor.instance = new CreditOperationMonitor()
    }
    return CreditOperationMonitor.instance
  }

  trackOperation(operationId: string, userId: string, amount: number, type: string) {
    this.operations.set(operationId, {
      userId,
      amount,
      type,
      timestamp: new Date(),
      status: 'pending'
    })
  }

  markSuccess(operationId: string) {
    const operation = this.operations.get(operationId)
    if (operation) {
      operation.status = 'success'
      console.log(`✅ Credit operation ${operationId} succeeded:`, operation)
    }
  }

  markFailed(operationId: string, error: string) {
    const operation = this.operations.get(operationId)
    if (operation) {
      operation.status = 'failed'
      console.error(`❌ Credit operation ${operationId} failed:`, operation, error)
    }
  }

  getFailedOperations(): Array<any> {
    return Array.from(this.operations.values()).filter(op => op.status === 'failed')
  }

  cleanup() {
    // 清理1小时前的操作记录
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    for (const [id, operation] of this.operations.entries()) {
      if (operation.timestamp < oneHourAgo) {
        this.operations.delete(id)
      }
    }
  }
}