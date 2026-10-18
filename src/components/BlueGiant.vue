<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { getCycleIndex } from '@/utils/particleCycle'

const canvas = ref(null)
// 同一支演奏视频的黑白抽帧，已统一转换为 1280×725 的 WebP。
// 用 Vite 的 glob 按文件名收集帧：增删或调整顺序只需改文件名，不用改代码。
const frameUrls = import.meta.glob('../assets/hand-study/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
})
const IMAGE_URLS = Object.keys(frameUrls)
  .sort()
  .map((key) => frameUrls[key])
const DESIGN_W = 1280
const DESIGN_H = 725
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
// 每张图停留时长；9 张循环一轮约 38 秒。
const DWELL_MS = 4200

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
let frames = []

// 粒子池：所有帧共用同一批粒子，切帧时只换目标点，粒子云会自然重组。
// 池长按实际采样点上限动态增长，不为 10 帧分别常驻粒子对象。
const pool = []
// 每帧重建绘制分桶：alpha 随切帧淡入淡出，不能像单图实现那样静态分组。
const renderBuckets = Array.from({ length: ALPHA_LEVELS }, () => [])
// 只缓存当前帧与下一帧的采样点，控制内存。
const targetsCache = new Map()

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
    // 新粒子从目标附近散开淡入，避免切帧时凭空冒出。
    x: target.x + (Math.random() - 0.5) * 120,
    y: target.y + (Math.random() - 0.5) * 120,
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
    ease: 0.08 + Math.random() * 0.06,
  }
}

// 把新帧的采样点分配给粒子池：多出的点扩池并淡入，少掉的粒子原地淡出。
function applyTargets(points) {
  while (pool.length < points.length) pool.push(createParticle(points[pool.length]))

  for (let i = 0; i < pool.length; i += 1) {
    const particle = pool[i]
    const target = points[i]
    if (!target) {
      particle.active = false
      continue
    }
    particle.targetX = target.x
    particle.targetY = target.y
    particle.targetSize = target.size
    particle.targetLevel = target.level
    particle.active = true
  }
}

function getTargets(index) {
  const count = frames.length
  const i = ((index % count) + count) % count
  if (!targetsCache.has(i)) targetsCache.set(i, buildTargets(frames[i]))

  // 只保留当前帧和下一帧，其余采样点立即释放。
  const next = (i + 1) % count
  for (const key of targetsCache.keys()) {
    if (key !== i && key !== next) targetsCache.delete(key)
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

  // 弹簧回位 + 摩擦力：切帧时粒子飞向新目标，鼠标移开后自动复原。
  particle.vx += ((particle.active ? particle.targetX : particle.x) - particle.x) * particle.ease
  particle.vy += ((particle.active ? particle.targetY : particle.y) - particle.y) * particle.ease
  particle.vx *= 0.82
  particle.vy *= 0.82
  particle.x += particle.vx
  particle.y += particle.vy

  // 淡入淡出、笔触尺寸与亮度都做缓动，切帧过渡不会出现硬跳。
  particle.alpha += ((particle.active ? 1 : 0) - particle.alpha) * 0.07
  particle.size += (particle.targetSize - particle.size) * 0.1
  particle.level += (particle.targetLevel - particle.level) * 0.08
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

function prefetch(index) {
  if (!frames.length) return
  const run = () => {
    if (!alive) return
    getTargets(index)
  }
  // 下一帧的像素采样放进空闲时段，避免和切帧挤在同一帧造成掉帧。
  if (typeof requestIdleCallback === 'function') {
    prefetchHandle = requestIdleCallback(run, { timeout: 2000 })
  } else {
    prefetchHandle = setTimeout(run, 300)
  }
}

function tick(now) {
  if (frames.length) {
    const index = getCycleIndex(now - startTime, frames.length, DWELL_MS)
    if (index !== currentIndex) {
      currentIndex = index
      applyTargets(getTargets(index))
      prefetch(index + 1)
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

onMounted(async () => {
  const context = canvas.value?.getContext('2d')
  if (!context) return
  ctx = context
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  resize()
  window.addEventListener('resize', handleResize)
  window.addEventListener('pointermove', handlePointerMove)
  document.documentElement.addEventListener('pointerleave', resetPointer)

  const loaded = await Promise.all(IMAGE_URLS.map(loadImage))
  if (!alive) return
  frames = loaded.filter(Boolean)
  if (!frames.length) return

  if (reducedMotion) {
    // 减少动态：只画首帧的粒子静态图，不启动交替循环。
    applyTargets(buildTargets(frames[0]))
    for (const particle of pool) {
      particle.x = particle.targetX
      particle.y = particle.targetY
      particle.size = particle.targetSize
      particle.level = particle.targetLevel
      particle.alpha = particle.active ? 1 : 0
    }
    render(false)
    return
  }

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
