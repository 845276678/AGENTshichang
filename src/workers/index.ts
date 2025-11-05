/**
 * Worker导出索引
 *
 * 统一导出所有Worker实例
 */

export { publishWorker, PublishWorker } from './social-publisher'
export { verifyWorker, VerifyWorker } from './social-verifier'
export { trendWorker, TrendWorker } from './trend-collector'
export { competitorWorker, CompetitorWorker } from './competitor-monitor'
export { BaseWorker } from './base-worker'

export type { PublishResult } from './social-publisher'
export type { VerifyResult } from './social-verifier'
export type { TrendResult } from './trend-collector'
export type { CompetitorResult } from './competitor-monitor'
export type { WorkerContext } from './base-worker'
