<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { assignParticleTargets, getCycleIndex } from '@/utils/particleCycle'

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
// 鼠标排斥半径（设计空间像素）。
const REPEL_RADIUS = 90
const MAX_BACKING = 1800
// 每张图停留 1s；轮播时长随帧数变化。
const DWELL_MS = 1000
// 提前 4 帧（约 4s）加载与采样，给网络留预算。
const PREFETCH_AHEAD = 4

let ctx = null
let cssWidth = 0
let cssHeight = 0
let scale = 1
let originX = 0
let originY = 0
let frameId = 0
let resizeFrame = 0
let prefetchHandle = 0
let reducedMotion = false
let alive = true
let startTime = 0
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
// 正在加载与加载失败的帧，避免同一帧重复请求。
const pendingTargets = new Set()
const failedTargets = new Set()

const pointer = { x: -9999, y: -9999 }

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
  const height = Math.max(1, Math.round((image.naturalHeight / image.naturalWidth) * SAMPLE_W))
  const offscreen = document.createElement('canvas')
  offscreen.width = SAMPLE_W
  offscreen.height = height
  const sampleCtx = offscreen.getContext('2d', { willReadFrequently: true })
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

function createParticle(target) {
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
    // 提高弹簧刚度配合 0.62 阻尼（接近临界阻尼），切帧收敛更快且不在终点反复回弹。
    ease: 0.14 + Math.random() * 0.06,
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

// 异步加载像素并采样成目标点；同一帧只发起一次请求。
function requestTargets(index) {
  if (!FRAME_COUNT) return
  const i = wrapIndex(index)
  if (targetsCache.has(i) || pendingTargets.has(i) || failedTargets.has(i)) return
  pendingTargets.add(i)
  loadImage(FRAME_URLS[i]).then((image) => {
    pendingTargets.delete(i)
    if (!alive) return
    if (!image) {
      failedTargets.add(i)
      return
    }
    targetsCache.set(i, buildTargets(image))
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

function updateParticle(particle) {
  const dx = pointer.x - particle.x
  const dy = pointer.y - particle.y
  const distSq = dx * dx + dy * dy
  if (distSq < REPEL_RADIUS * REPEL_RADIUS && distSq > 0.01) {
    const dist = Math.sqrt(distSq)
    const force = (REPEL_RADIUS - dist) / REPEL_RADIUS
    particle.vx -= (dx / dist) * force * 3.5
    particle.vy -= (dy / dist) * force * 3.5
  }

  // 所有粒子（含淡出中的冗余粒子）统一流向各自局部目标；
  // 阻尼从 0.82 提到 0.62，接近临界阻尼，快速收敛且不来回震荡。
  particle.vx = (particle.vx + (particle.targetX - particle.x) * particle.ease) * 0.62
  particle.vy = (particle.vy + (particle.targetY - particle.y) * particle.ease) * 0.62
  particle.x += particle.vx
  particle.y += particle.vy

  // 加快透明度、尺寸与亮度的缓动，匹配更快的切帧节奏。
  particle.alpha += ((particle.active ? 1 : 0) - particle.alpha) * 0.15
  particle.size += (particle.targetSize - particle.size) * 0.18
  particle.level += (particle.targetLevel - particle.level) * 0.15
}

function drawParticles(moving) {
  for (const bucket of renderBuckets) bucket.length = 0
  for (const particle of pool) {
    if (moving) updateParticle(particle)
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

function render(moving) {
  if (!ctx) return
  ctx.clearRect(0, 0, cssWidth, cssHeight)
  ctx.save()
  ctx.translate(originX, originY)
  ctx.scale(scale, scale)

  // 黑底每帧重铺，清屏后不会露出页面底色。
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, DESIGN_W, DESIGN_H)

  drawParticles(moving)
  ctx.restore()
}

// 后续帧的加载与像素采样放进空闲时段，避免和切帧挤在同一帧造成掉帧。
// 超时必须小于 1s 的切帧间隔，否则采样会拖到切帧后才完成。
function prefetch(index) {
  if (!FRAME_COUNT) return
  const run = () => {
    if (!alive) return
    for (let k = 1; k <= PREFETCH_AHEAD; k += 1) requestTargets(index + k)
  }
  if (typeof requestIdleCallback === 'function') {
    prefetchHandle = requestIdleCallback(run, { timeout: 120 })
  } else {
    prefetchHandle = setTimeout(run, 80)
  }
}

function tick(now) {
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
  render(true)
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

  const artAspect = DESIGN_W / DESIGN_H
  const viewAspect = cssWidth / cssHeight
  // 常规/窄屏用 cover 铺满，裁掉两侧；比原图更宽的屏幕改 contain，
  // 否则按宽度放大后上下会切掉主体。
  scale =
    viewAspect > artAspect
      ? Math.min(cssWidth / DESIGN_W, cssHeight / DESIGN_H)
      : Math.max(cssWidth / DESIGN_W, cssHeight / DESIGN_H)

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

function renderStaticFirstFrame() {
  applyTargets(targetsCache.get(0))
  for (const particle of pool) {
    particle.x = particle.targetX
    particle.y = particle.targetY
    particle.size = particle.targetSize
    particle.level = particle.targetLevel
    particle.alpha = particle.active ? 1 : 0
  }
  render(false)
}

onMounted(async () => {
  const context = canvas.value?.getContext('2d')
  if (!context) return
  ctx = context
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  resize()
  window.addEventListener('resize', handleResize)
  window.addEventListener('pointermove', handlePointerMove)
  document.documentElement.addEventListener('pointerleave', resetPointer)

  // 只等首帧：其余帧按播放进度提前异步加载，不阻塞首屏。
  const firstImage = FRAME_COUNT ? await loadImage(FRAME_URLS[0]) : null
  if (!alive || !firstImage) return
  targetsCache.set(0, buildTargets(firstImage))

  if (reducedMotion) {
    // 减少动态：只画首帧的粒子静态图，不启动交替循环。
    renderStaticFirstFrame()
    return
  }

  appliedIndex = 0
  currentIndex = 0
  applyTargets(targetsCache.get(0))
  prefetch(1)
  startTime = performance.now()
  frameId = requestAnimationFrame(tick)
})

onBeforeUnmount(() => {
  alive = false
  cancelAnimationFrame(frameId)
  cancelAnimationFrame(resizeFrame)
  if (typeof cancelIdleCallback === 'function') {
    cancelIdleCallback(prefetchHandle)
  } else {
    clearTimeout(prefetchHandle)
  }
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('pointermove', handlePointerMove)
  document.documentElement.removeEventListener('pointerleave', resetPointer)
})
</script>

<template>
  <div class="blue-giant" aria-hidden="true">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<style scoped>
.blue-giant {
  position: fixed;
  inset: 0;
  z-index: 0;
  width: 100vw;
  height: 100vh;
  opacity: 0.8;
  pointer-events: none;
  /* 原图左侧本身是黑场，不再整块渐隐，否则会把手（画面焦点）一起抹掉。 */
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
}

/* 窄屏没有左右分栏，降低亮度避免和正文抢注意力。 */
@media (max-width: 760px) {
  .blue-giant {
    opacity: 0.42;
  }
}

@media (max-width: 380px) {
  .blue-giant {
    opacity: 0.34;
  }
}
</style>
