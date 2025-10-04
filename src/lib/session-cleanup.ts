/**
 * 会话自动清理任务
 * 定期清理过期的会话和相关数据
 */

import { cleanupExpiredSessions } from './session-persistence';

/**
 * 启动自动清理任务
 * 每6小时运行一次
 */
export function startSessionCleanupTask(): void {
  console.log('🧹 Starting session cleanup task...');

  // 立即执行一次清理
  runCleanup();

  // 每6小时执行一次清理
  const SIX_HOURS = 6 * 60 * 60 * 1000;
  setInterval(() => {
    runCleanup();
  }, SIX_HOURS);
}

/**
 * 执行清理操作
 */
async function runCleanup(): Promise<void> {
  try {
    console.log('🧹 Running session cleanup...');
    const cleanedCount = await cleanupExpiredSessions();
    console.log(`✅ Session cleanup completed: ${cleanedCount} sessions cleaned`);
  } catch (error) {
    console.error('❌ Session cleanup failed:', error);
  }
}
