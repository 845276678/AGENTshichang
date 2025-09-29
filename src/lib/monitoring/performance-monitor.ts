export class BiddingPerformanceMonitor {
  private static metrics = {
    webSocketLatency: [] as number[],
    creditOperationTime: [] as number[],
    stageTransitionTime: [] as number[],
    userInteractionTime: [] as number[]
  }

  static recordWebSocketLatency(latency: number) {
    this.metrics.webSocketLatency.push(latency)
    this.keepRecentMetrics('webSocketLatency')
  }

  static recordCreditOperationTime(time: number) {
    this.metrics.creditOperationTime.push(time)
    this.keepRecentMetrics('creditOperationTime')
  }

  static recordStageTransition(time: number) {
    this.metrics.stageTransitionTime.push(time)
    this.keepRecentMetrics('stageTransitionTime')
  }

  static recordUserInteraction(time: number) {
    this.metrics.userInteractionTime.push(time)
    this.keepRecentMetrics('userInteractionTime')
  }

  private static keepRecentMetrics(type: keyof typeof this.metrics) {
    // 只保留最近100个数据点
    if (this.metrics[type].length > 100) {
      this.metrics[type] = this.metrics[type].slice(-100)
    }
  }

  static getMetricsSummary() {
    return {
      webSocket: this.calculateStats(this.metrics.webSocketLatency),
      creditOps: this.calculateStats(this.metrics.creditOperationTime),
      stageTransitions: this.calculateStats(this.metrics.stageTransitionTime),
      userInteractions: this.calculateStats(this.metrics.userInteractionTime)
    }
  }

  private static calculateStats(data: number[]) {
    if (data.length === 0) return null

    const sorted = [...data].sort((a, b) => a - b)
    const avg = data.reduce((a, b) => a + b, 0) / data.length
    const p95 = sorted[Math.floor(data.length * 0.95)]
    const p99 = sorted[Math.floor(data.length * 0.99)]

    return {
      count: data.length,
      average: Math.round(avg),
      p95: Math.round(p95),
      p99: Math.round(p99),
      min: sorted[0],
      max: sorted[sorted.length - 1]
    }
  }

  static logPerformanceReport() {
    const summary = this.getMetricsSummary()
    console.group('📊 Bidding Performance Report')
    console.table(summary)
    console.groupEnd()
  }
}