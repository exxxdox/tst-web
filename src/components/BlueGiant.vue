<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import {
  assignParticleTargets,
  consumeFrameTime,
  findFirstAvailableFrame,
  findFirstRenderableFrame,
  getCycleIndex,
  isFrameRetryReady,
} from '@/utils/particleCycle'

const canvas = ref(null)
// assets/frames 是同一支演奏视频的顺序抽帧，文件名零填充，按字典序即为播放顺序。
// 用 Vite 的 glob 按文件名收集帧：增删或调整顺序只需改文件名，不用改代码。
// 统一为 640 宽的 WebP，其余源图不放进该目录，避免误打包。
const frameUrls = import.meta.glob('../assets/frames/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
})
const FRAME_URLS = Object.keys(frameUrls)
  .sort()
  .map((key) => frameUrls[key])
const FRAME_COUNT = FRAME_URLS.length
// setup 阶段即寻找首张可用帧：提前请求，同时避免单张资源失败阻断整段动画。
const firstAvailableFrame = FRAME_COUNT ? findFirstAvailableFrame(FRAME_URLS, loadImage) : null
const DESIGN_W = 1280
const DESIGN_H = 720
// 采样网格宽度。640 宽再按步长 2 取点，单帧约 2.5 万个粒子，兼顾细节与本机帧率。
const SAMPLE_W = 640
const SAMPLE_STEP = 2
// 保留暗部烟雾：阈值压低，灰白过渡也会变成半透明粒子。
const MIN_BRIGHTNESS = 12
const JITTER = 1.4
// 亮度分桶：每桶只设置一次 fillStyle，避免每帧切换两万多次颜色字符串。
const ALPHA_LEVELS = 16
// 鼠标排斥半径（设计空间像素）。cover 放大后画面粒子更稀疏，半径略放大保证排斥圈仍有足够粒子。
const REPEL_RADIUS = 240
// 排斥是速度冲量，按每秒归一化，保证不同刷新率下力度一致。
// 冲量要明显大于弹簧刚度（~270），否则粒子被推开不到 2px 就被拉回，肉眼看不到洞。
const REPEL_IMPULSE = 60 * 60
// 连续弹簧参数：由原 60Hz 离散缓动反推，ζ≈0.65、ω≈16.4rad/s，60Hz 下约 0.4s 收敛。
const EASE_OMEGA = 16.44
const EASE_ZETA = 0.654
// 一阶缓动速率（1/s），与原 60Hz 参数按同一倍率换算。
const ALPHA_RATE = 7.309
const SIZE_RATE = 8.983
// 单次积分上限：低帧率时拆成多个 1/60s 子步，轨迹与高刷设备一致。
const MAX_STEP = 1 / 60
// 切后台回来时 dt 可能很大，截断避免粒子瞬移和积分发散。
const MAX_DELTA = 0.05
const FRAME_INTERVAL_MS = 1000 / 60
const MAX_BACKING = 1800
// 每张图停留 1.3s；轮播时长随帧数变化。
const DWELL_MS = 1300
// 提前 4 帧（约 5.2s）加载与采样，给网络留预算。
const PREFETCH_AHEAD = 4
// 一轮后再试瞬时失败；至少冷却 5s，避免少帧素材频繁请求。
const RETRY_DELAY_MS = Math.max(DWELL_MS * FRAME_COUNT, 5000)

let ctx = null
let cssWidth = 0
let cssHeight = 0
let scale = 1
let originX = 0
let originY = 0
let frameId = 0
let resizeFrame = 0
let samplingHandle = null
let reducedMotion = false
let motionPreference = null
let alive = true
let startTime = 0
let lastTime = 0
let accumulatedFrameMs = 0
let currentIndex = -1
let appliedIndex = -1

// 粒子池：所有帧共用同一批粒子，切帧时只换目标点，粒子云会自然重组。
// 池长按实际采样点上限动态增长，不为所有帧分别常驻粒子对象。
const pool = []
// 每帧重建绘制分桶：alpha 随切帧淡入淡出，不能像单图实现那样静态分组。
const renderBuckets = Array.from({ length: ALPHA_LEVELS }, () => [])
// 只缓存当前帧与下一帧的采样点，不驻留解码后的位图：
// 帧数较多时全部解码常驻会占用上百 MB 位图内存。
const targetsCache = new Map()
// pending 覆盖下载与待采样阶段；失败时间用于有界冷却后重试。
const pendingTargets = new Set()
const failedTargets = new Map()
const samplingQueue = []

const pointer = { x: -9999, y: -9999 }

class CanvasSamplingUnavailableError extends Error {}

function loadImage(url) {
  return new Promise((resolve) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => resolve(image)
    // 单张加载失败时跳过该帧，不能让整段动画卡死。
    image.onerror = () => resolve(null)
    image.src = url
  })
}

// 读取图片像素，按亮度采样成粒子目标点：亮部笔触饱满，暗部烟雾轻薄透明。
function buildTargets(image) {
  if (!image.naturalWidth) throw new Error('Frame has no readable width')
  const height = Math.max(1, Math.round((image.naturalHeight / image.naturalWidth) * SAMPLE_W))
  const offscreen = document.createElement('canvas')
  offscreen.width = SAMPLE_W
  offscreen.height = height
  const sampleCtx = offscreen.getContext('2d', { willReadFrequently: true })
  // Context 缺失属于设备级故障，换一张图片也无法恢复。
  if (!sampleCtx) throw new CanvasSamplingUnavailableError('Canvas sampling context is unavailable')
  sampleCtx.drawImage(image, 0, 0, SAMPLE_W, height)
  const data = sampleCtx.getImageData(0, 0, SAMPLE_W, height).data

  const scaleX = DESIGN_W / SAMPLE_W
  const scaleY = DESIGN_H / height
  const points = []

  for (let y = 0; y < height; y += SAMPLE_STEP) {
    for (let x = 0; x < SAMPLE_W; x += SAMPLE_STEP) {
      const index = (y * SAMPLE_W + x) * 4
      const brightness = (data[index] + data[index + 1] + data[index + 2]) / 3
      if (brightness <= MIN_BRIGHTNESS) continue

      const norm = brightness / 255
      points.push({
        x: (x + SAMPLE_STEP / 2) * scaleX + (Math.random() - 0.5) * JITTER,
        y: (y + SAMPLE_STEP / 2) * scaleY + (Math.random() - 0.5) * JITTER,
        // 采样步长换算回设计空间；亮度越高笔触越饱满。
        size: SAMPLE_STEP * scaleX * (0.55 + norm * 0.55),
        level: norm,
      })
    }
  }

  return points
}

function markTargetFailed(index) {
  pendingTargets.delete(index)
  failedTargets.set(index, performance.now())
}

// 每个空闲任务只采样一张图，避免多个 getImageData 连续阻塞主线程。
function scheduleSampling() {
  if (!alive || samplingHandle !== null || !samplingQueue.length) return
  const run = () => {
    samplingHandle = null
    if (!alive) return
    const { index, image } = samplingQueue.shift()
    try {
      targetsCache.set(index, buildTargets(image))
      pruneTargets(currentIndex >= 0 ? currentIndex : index)
      failedTargets.delete(index)
      pendingTargets.delete(index)
    } catch {
      markTargetFailed(index)
    }
    scheduleSampling()
  }

  if (typeof requestIdleCallback === 'function') {
    samplingHandle = requestIdleCallback(run, { timeout: 120 })
  } else {
    samplingHandle = setTimeout(run, 80)
  }
}

function createParticle(target) {
  // 角频率做 ±9% 抖动，避免所有粒子同步收敛显得机械。
  const omega = EASE_OMEGA * (0.91 + Math.random() * 0.18)
  return {
    // 新粒子从目标就近微幅散开并淡入，避免切帧时远距离突兀飞入。
    x: target.x + (Math.random() - 0.5) * 36,
    y: target.y + (Math.random() - 0.5) * 36,
    vx: 0,
    vy: 0,
    targetX: target.x,
    targetY: target.y,
    targetSize: target.size,
    targetLevel: target.level,
    size: target.size,
    level: target.level,
    alpha: 0,
    active: true,
    // 缓动系数换成连续弹簧的刚度与阻尼，配合 delta-time 积分。
    stiffness: omega * omega,
    damping: 2 * EASE_ZETA * omega,
  }
}

// 按空间分位数把新帧目标点就近分配给粒子池，消除跨屏乱飞和原地残影。
function applyTargets(points) {
  assignParticleTargets(pool, points, createParticle, DESIGN_W)
}

function wrapIndex(index) {
  const count = FRAME_COUNT || 1
  return ((index % count) + count) % count
}

// 只保留当前帧与预取窗口内的采样点，其余立即释放。
function pruneTargets(keepIndex) {
  const keep = new Set()
  for (let k = 0; k <= PREFETCH_AHEAD; k += 1) keep.add(wrapIndex(keepIndex + k))
  for (const key of targetsCache.keys()) {
    if (!keep.has(key)) targetsCache.delete(key)
  }
}

// 下载可并发；采样进入串行空闲队列，失败帧冷却一轮后可重试。
function requestTargets(index) {
  if (!FRAME_COUNT) return
  const i = wrapIndex(index)
  if (
    targetsCache.has(i) ||
    pendingTargets.has(i) ||
    !isFrameRetryReady(failedTargets.get(i), performance.now(), RETRY_DELAY_MS)
  ) {
    return
  }
  pendingTargets.add(i)
  loadImage(FRAME_URLS[i]).then((image) => {
    if (!alive) return
    if (!image) {
      markTargetFailed(i)
      return
    }
    samplingQueue.push({ index: i, image })
    scheduleSampling()
  })
}

// 返回目标点；图片还没就绪时返回 null，由调用方保留上一帧画面。
function getTargets(index) {
  if (!FRAME_COUNT) return null
  const i = wrapIndex(index)
  if (!targetsCache.has(i)) {
    requestTargets(i)
    return null
  }
  return targetsCache.get(i)
}

function updateParticle(particle, dt) {
  const dx = pointer.x - particle.x
  const dy = pointer.y - particle.y
  const distSq = dx * dx + dy * dy
  if (distSq < REPEL_RADIUS * REPEL_RADIUS && distSq > 0.01) {
    const dist = Math.sqrt(distSq)
    const force = (REPEL_RADIUS - dist) / REPEL_RADIUS
    particle.vx -= (dx / dist) * force * REPEL_IMPULSE * dt
    particle.vy -= (dy / dist) * force * REPEL_IMPULSE * dt
  }

  // 连续弹簧-阻尼积分：墙钟轨迹与刷新率无关。
  particle.vx +=
    (particle.stiffness * (particle.targetX - particle.x) - particle.damping * particle.vx) * dt
  particle.vy +=
    (particle.stiffness * (particle.targetY - particle.y) - particle.damping * particle.vy) * dt
  particle.x += particle.vx * dt
  particle.y += particle.vy * dt
}

function drawParticles(moving, dt) {
  for (const bucket of renderBuckets) bucket.length = 0

  if (moving && dt > 0) {
    // 低帧率拆成 ≤1/60s 的子步，使 30Hz 与 120Hz 走同一条轨迹。
    let remaining = dt
    while (remaining > 0) {
      const step = Math.min(remaining, MAX_STEP)
      for (const particle of pool) updateParticle(particle, step)
      remaining -= step
    }

    // 一阶缓动用指数衰减换算，任意 dt 下时长一致。
    const alphaK = 1 - Math.exp(-ALPHA_RATE * dt)
    const sizeK = 1 - Math.exp(-SIZE_RATE * dt)
    for (const particle of pool) {
      particle.alpha += ((particle.active ? 1 : 0) - particle.alpha) * alphaK
      particle.size += (particle.targetSize - particle.size) * sizeK
      particle.level += (particle.targetLevel - particle.level) * alphaK
    }
  }

  for (const particle of pool) {
    const alpha = particle.alpha * particle.level
    if (alpha < 0.03) continue
    const level = Math.min(ALPHA_LEVELS - 1, Math.floor(alpha * ALPHA_LEVELS))
    renderBuckets[level].push(particle)
  }

  for (let level = 0; level < ALPHA_LEVELS; level += 1) {
    const bucket = renderBuckets[level]
    if (!bucket.length) continue
    ctx.fillStyle = `rgba(255, 255, 255, ${(level + 1) / ALPHA_LEVELS})`
    for (const particle of bucket) {
      ctx.fillRect(particle.x, particle.y, particle.size, particle.size)
    }
  }
}

function render(moving, dt = 0) {
  if (!ctx) return
  ctx.clearRect(0, 0, cssWidth, cssHeight)
  ctx.save()
  ctx.translate(originX, originY)
  ctx.scale(scale, scale)

  // 黑底每帧重铺，清屏后不会露出页面底色。
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, DESIGN_W, DESIGN_H)

  drawParticles(moving, dt)
  ctx.restore()
}

// 同批图片并发下载；下载完成后的像素采样由空闲队列逐张处理。
function prefetch(index) {
  if (!FRAME_COUNT) return
  for (let k = 0; k < PREFETCH_AHEAD; k += 1) requestTargets(index + k)
}

function tick(now) {
  const elapsedMs = lastTime ? now - lastTime : FRAME_INTERVAL_MS
  lastTime = now
  const frameTime = consumeFrameTime(accumulatedFrameMs, elapsedMs, FRAME_INTERVAL_MS, MAX_DELTA)
  accumulatedFrameMs = frameTime.remainderMs
  if (!frameTime.dt) {
    frameId = requestAnimationFrame(tick)
    return
  }
  if (FRAME_COUNT) {
    const index = getCycleIndex(now - startTime, FRAME_COUNT, DWELL_MS)
    if (index !== currentIndex) {
      currentIndex = index
      prefetch(index + 1)
    }
    // 图片尚未就绪时保留上一帧目标，粒子继续缓动而不是卡住。
    if (index !== appliedIndex) {
      const targets = getTargets(index)
      if (targets) {
        appliedIndex = index
        applyTargets(targets)
        pruneTargets(index)
      }
    }
  }
  render(true, frameTime.dt)
  frameId = requestAnimationFrame(tick)
}

function resize() {
  const el = canvas.value
  if (!el || !ctx) return
  const rect = el.getBoundingClientRect()
  if (!rect.width || !rect.height) return

  const quality = Math.min(
    window.devicePixelRatio || 1,
    MAX_BACKING / Math.max(rect.width, rect.height),
  )
  const backingWidth = Math.max(1, Math.round(rect.width * quality))
  const backingHeight = Math.max(1, Math.round(rect.height * quality))
  if (el.width !== backingWidth || el.height !== backingHeight) {
    el.width = backingWidth
    el.height = backingHeight
  }

  cssWidth = rect.width
  cssHeight = rect.height

  // 统一 cover：超宽屏也按宽度铺满，宁可裁掉少量上下，也不在左右留黑边。
  // 019 等帧底部的白色舞台需要贴住左右边界，contain 会把它截成两列黑条。
  scale = Math.max(cssWidth / DESIGN_W, cssHeight / DESIGN_H)

  // 竖屏可见宽度太窄，把中心从画幅中点移到手部（画面焦点），避免手被裁掉。
  const focusX = cssWidth < 760 ? DESIGN_W * 0.34 : DESIGN_W / 2
  originX = cssWidth / 2 - focusX * scale
  originY = (cssHeight - DESIGN_H * scale) / 2

  ctx.setTransform(quality, 0, 0, quality, 0, 0)
  if (reducedMotion) render(false)
}

// resize 事件在拖拽窗口时会连续触发；合并到一帧，避免重复计算和重绘。
function handleResize() {
  if (resizeFrame) return
  resizeFrame = requestAnimationFrame(() => {
    resizeFrame = 0
    resize()
  })
}

function handlePointerMove(event) {
  if (event.pointerType !== 'mouse') return
  const rect = canvas.value?.getBoundingClientRect()
  if (!rect) return
  pointer.x = (event.clientX - rect.left - originX) / scale
  pointer.y = (event.clientY - rect.top - originY) / scale
}

function resetPointer() {
  pointer.x = -9999
  pointer.y = -9999
}

function renderStaticFrame(index) {
  const targets = targetsCache.get(index)
  if (!targets) return
  applyTargets(targets)
  for (const particle of pool) {
    particle.x = particle.targetX
    particle.y = particle.targetY
    particle.size = particle.targetSize
    particle.level = particle.targetLevel
    particle.alpha = particle.active ? 1 : 0
  }
  render(false)
}

function handleMotionPreferenceChange(event) {
  if (reducedMotion === event.matches) return
  reducedMotion = event.matches

  if (reducedMotion) {
    cancelAnimationFrame(frameId)
    frameId = 0
    renderStaticFrame(appliedIndex)
    return
  }

  if (appliedIndex < 0) return
  startTime = performance.now() - appliedIndex * DWELL_MS
  lastTime = 0
  accumulatedFrameMs = 0
  frameId = requestAnimationFrame(tick)
}

onMounted(async () => {
  const context = canvas.value?.getContext('2d')
  if (!context) return
  ctx = context
  motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion = motionPreference.matches
  // 系统偏好可能在页面打开后改变，动画必须即时停下或恢复。
  motionPreference.addEventListener('change', handleMotionPreferenceChange)
  resize()
  window.addEventListener('resize', handleResize)
  window.addEventListener('pointermove', handlePointerMove)
  document.documentElement.addEventListener('pointerleave', resetPointer)

  // 只等首张可用帧：其余帧按播放进度提前异步加载，不阻塞首屏。
  const loadedFirstFrame = firstAvailableFrame ? await firstAvailableFrame : null
  if (!alive || !loadedFirstFrame) return
  const firstFrame = await findFirstRenderableFrame(
    FRAME_URLS,
    loadImage,
    buildTargets,
    loadedFirstFrame,
    (error) => !(error instanceof CanvasSamplingUnavailableError),
  )
  if (!alive || !firstFrame) return
  targetsCache.set(firstFrame.index, firstFrame.targets)
  appliedIndex = firstFrame.index
  currentIndex = firstFrame.index

  if (reducedMotion) {
    // 减少动态：只画首张可用帧的粒子静态图，不启动交替循环。
    renderStaticFrame(firstFrame.index)
    return
  }

  applyTargets(targetsCache.get(firstFrame.index))
  prefetch(firstFrame.index + 1)
  startTime = performance.now() - firstFrame.index * DWELL_MS
  frameId = requestAnimationFrame(tick)
})

onBeforeUnmount(() => {
  alive = false
  cancelAnimationFrame(frameId)
  cancelAnimationFrame(resizeFrame)
  if (typeof cancelIdleCallback === 'function') {
    if (samplingHandle !== null) cancelIdleCallback(samplingHandle)
  } else {
    if (samplingHandle !== null) clearTimeout(samplingHandle)
  }
  samplingQueue.length = 0
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('pointermove', handlePointerMove)
  document.documentElement.removeEventListener('pointerleave', resetPointer)
  motionPreference?.removeEventListener('change', handleMotionPreferenceChange)
})
</script>

<template>
  <div class="blue-giant" aria-hidden="true">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<style scoped>
.blue-giant {
  /* 粒子画作为整页固定背景：z-index 0 才能压在 body 黑底之上，
     正文区块与页脚通过更高层级保持在上方 */
  position: fixed;
  inset: 0;
  z-index: 0;
  width: 100vw;
  height: 100vh;
  opacity: 0.8;
  pointer-events: none;
  transition: opacity 0.45s ease;
  /* 原图左侧本身是黑场，不再整块渐隐，否则会把手（画面焦点）一起抹掉。 */
}

/* 滚过首屏后降低粒子强度，保证下方正文的可读性 */
.blue-giant.is-dim {
  opacity: 0.3;
}

.blue-giant canvas {
  display: block;
  width: 100%;
  height: 100%;
}

@media (max-width: 1100px) {
  .blue-giant {
    opacity: 0.55;
  }
  .blue-giant.is-dim {
    opacity: 0.22;
  }
}

/* 窄屏没有左右分栏，降低亮度避免和正文抢注意力。 */
@media (max-width: 760px) {
  .blue-giant {
    opacity: 0.42;
  }
  .blue-giant.is-dim {
    opacity: 0.18;
  }
}

@media (max-width: 380px) {
  .blue-giant {
    opacity: 0.34;
  }
  .blue-giant.is-dim {
    opacity: 0.15;
  }
}
</style>
