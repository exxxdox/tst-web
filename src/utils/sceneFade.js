/**
 * 区块中心离视口中心越远，透明度越低。
 * 中心 35% 视口高度内保持不透明，到 75% 处淡到 0。
 */
export function sceneFade(distance, viewportHeight) {
  if (!(viewportHeight > 0)) return 1

  const opaqueRange = viewportHeight * 0.35
  const fadeRange = viewportHeight * 0.75
  const fade = Math.min(1, Math.max(0, 1 - (distance - opaqueRange) / (fadeRange - opaqueRange)))
  // 写入 CSS 前收敛到三位小数，避免浮点噪声和每帧无意义的重绘。
  return Math.round(fade * 1000) / 1000
}
