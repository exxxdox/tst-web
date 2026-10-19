/**
 * 返回当前应展示的帧序号：按停留时长等分时间轴并取模，保证索引始终落在 [0, count)。
 * 非法输入统一回落到首帧，避免组件在资源未就绪时出现空白。
 */
export function getCycleIndex(elapsedMs, count, dwellMs) {
  if (!(count > 0) || !(dwellMs > 0) || !(elapsedMs >= 0)) return 0
  return Math.floor(elapsedMs / dwellMs) % count
}

/**
 * 累积高刷新率下不足一帧的时间，只在达到目标间隔时消费完整步长。
 */
export function consumeFrameTime(accumulatedMs, elapsedMs, frameIntervalMs, maxDeltaSeconds) {
  const total = Math.max(0, accumulatedMs) + Math.max(0, elapsedMs)
  if (!(frameIntervalMs > 0) || total < frameIntervalMs) {
    return { dt: 0, remainderMs: total }
  }

  const maxDeltaMs = Math.max(0, maxDeltaSeconds) * 1000
  const remainderMs = total % frameIntervalMs
  const consumedMs = Math.min(total - remainderMs, maxDeltaMs)
  return {
    dt: consumedMs / 1000,
    // 后台恢复时丢弃被上限截断的积压，避免随后连续追帧。
    remainderMs: total - remainderMs > maxDeltaMs ? 0 : remainderMs,
  }
}

/**
 * 失败帧经过冷却后可重试，避免永久缺帧或逐动画帧重复请求。
 */
export function isFrameRetryReady(failedAt, now, retryDelayMs) {
  return failedAt === undefined || now - failedAt >= retryDelayMs
}

/**
 * 按帧顺序寻找第一张可用图片，避免单张资源失败时阻断整段动画。
 */
export async function findFirstAvailableFrame(urls, loadImage) {
  for (let index = 0; index < urls.length; index += 1) {
    const image = await loadImage(urls[index])
    if (image) return { image, index }
  }
  return null
}

/**
 * 从已提前加载的首帧继续查找，跳过无法读取像素的图片。
 */
export async function findFirstRenderableFrame(
  urls,
  loadImage,
  buildTargets,
  initialFrame,
  canTryNext = () => true,
) {
  const startIndex = initialFrame?.index ?? 0
  for (let index = startIndex; index < urls.length; index += 1) {
    const image = index === initialFrame?.index ? initialFrame.image : await loadImage(urls[index])
    if (!image) continue
    try {
      return { image, index, targets: buildTargets(image) }
    } catch (error) {
      // 单帧像素不可读时继续找下一张，减少动态模式也不能永久空白。
      if (!canTryNext(error)) return null
    }
  }
  return null
}

/**
 * 按空间扫描序与分位数把新帧目标点分配给粒子池：
 * 1. 粒子数不足时按新帧分位数均匀补齐，避免新粒子全堆在画面底部；
 * 2. 按当前扫描序重排粒子池，消除不同帧点数差异引发的跨屏对角线乱飞；
 * 3. 冗余粒子跟随同分位数目标移动并淡出，既消除静态残影，又让下次激活时就近淡入。
 */
export function assignParticleTargets(pool, points, createParticle, designWidth = 1280) {
  const targetCount = points.length
  if (!targetCount) {
    for (const particle of pool) particle.active = false
    return
  }

  if (pool.length < targetCount) {
    const missing = targetCount - pool.length
    for (let k = 0; k < missing; k += 1) {
      const sampleIndex = Math.floor(((k + 0.5) * targetCount) / missing)
      pool.push(createParticle(points[sampleIndex]))
    }
  }

  // 按扫描线顺序排列现有粒子，使每个粒子就近匹配新帧同区域的采样点。
  pool.sort((a, b) => a.y * designWidth + a.x - (b.y * designWidth + b.x))

  const poolLength = pool.length
  let prevTargetIndex = -1
  for (let i = 0; i < poolLength; i += 1) {
    const targetIndex = Math.floor((i * targetCount) / poolLength)
    const target = points[targetIndex]
    const particle = pool[i]
    particle.targetX = target.x
    particle.targetY = target.y
    particle.targetSize = target.size
    particle.targetLevel = target.level
    particle.active = targetIndex !== prevTargetIndex
    prevTargetIndex = targetIndex
  }
}
