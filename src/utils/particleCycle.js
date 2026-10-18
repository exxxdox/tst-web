/**
 * 返回当前应展示的帧序号：按停留时长等分时间轴并取模，保证索引始终落在 [0, count)。
 * 非法输入统一回落到首帧，避免组件在资源未就绪时出现空白。
 */
export function getCycleIndex(elapsedMs, count, dwellMs) {
  if (!(count > 0) || !(dwellMs > 0) || !(elapsedMs >= 0)) return 0
  return Math.floor(elapsedMs / dwellMs) % count
}
