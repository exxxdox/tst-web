<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const canvas = ref(null)
const IMAGE_URL = '/hand-study.webp'
// 画幅与 public/hand-study.webp 一致（转换时锁定为 1280×725）；换素材需同步这两个数。
const DESIGN_W = 1280
const DESIGN_H = 725
// 采样网格宽度。640 宽再按步长 2 取点，约 2.5 万个粒子，兼顾细节与本机帧率。
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

let ctx = null
let buckets = null
let cssWidth = 0
let cssHeight = 0
let scale = 1
let originX = 0
let originY = 0
let frameId = 0
let resizeFrame = 0
let reducedMotion = false

const pointer = { x: -9999, y: -9999 }

// 读取图片像素，按亮度生成粒子：亮部不透明且笔触饱满，暗部烟雾轻薄透明。
function buildParticles(image) {
  const height = Math.max(1, Math.round((image.naturalHeight / image.naturalWidth) * SAMPLE_W))
  const offscreen = document.createElement('canvas')
  offscreen.width = SAMPLE_W
  offscreen.height = height
  const sampleCtx = offscreen.getContext('2d', { willReadFrequently: true })
  sampleCtx.drawImage(image, 0, 0, SAMPLE_W, height)
  const data = sampleCtx.getImageData(0, 0, SAMPLE_W, height).data

  const scaleX = DESIGN_W / SAMPLE_W
  const scaleY = DESIGN_H / height
  const levels = Array.from({ length: ALPHA_LEVELS }, () => [])

  for (let y = 0; y < height; y += SAMPLE_STEP) {
    for (let x = 0; x < SAMPLE_W; x += SAMPLE_STEP) {
      const index = (y * SAMPLE_W + x) * 4
      const brightness = (data[index] + data[index + 1] + data[index + 2]) / 3
      if (brightness <= MIN_BRIGHTNESS) continue

      const norm = brightness / 255
      const originX = (x + SAMPLE_STEP / 2) * scaleX + (Math.random() - 0.5) * JITTER
      const originY = (y + SAMPLE_STEP / 2) * scaleY + (Math.random() - 0.5) * JITTER
      const level = Math.min(ALPHA_LEVELS - 1, Math.floor(norm * ALPHA_LEVELS))

      levels[level].push({
        // 初始位置随机散开，入场时由弹簧力汇聚成手。
        x: originX + (Math.random() - 0.5) * 120,
        y: originY + (Math.random() - 0.5) * 120,
        originX,
        originY,
        vx: 0,
        vy: 0,
        // 采样步长换算回设计空间；亮度越高笔触越饱满。
        size: SAMPLE_STEP * scaleX * (0.55 + norm * 0.55),
        ease: 0.08 + Math.random() * 0.06,
      })
    }
  }

  return levels
}

function updateParticle(p) {
  const dx = pointer.x - p.x
  const dy = pointer.y - p.y
  const distSq = dx * dx + dy * dy
  if (distSq < REPEL_RADIUS * REPEL_RADIUS && distSq > 0.01) {
    const dist = Math.sqrt(distSq)
    const force = (REPEL_RADIUS - dist) / REPEL_RADIUS
    p.vx -= (dx / dist) * force * 3.5
    p.vy -= (dy / dist) * force * 3.5
  }

  // 弹簧回位 + 摩擦力：鼠标移开后粒子自动复原。
  p.vx += (p.originX - p.x) * p.ease
  p.vy += (p.originY - p.y) * p.ease
  p.vx *= 0.82
  p.vy *= 0.82
  p.x += p.vx
  p.y += p.vy
}

function drawParticles(moving) {
  for (let level = 0; level < ALPHA_LEVELS; level += 1) {
    const bucket = buckets[level]
    if (!bucket.length) continue
    ctx.fillStyle = `rgba(255, 255, 255, ${(level + 0.5) / ALPHA_LEVELS})`
    for (const p of bucket) {
      if (moving) updateParticle(p)
      ctx.fillRect(p.x, p.y, p.size, p.size)
    }
  }
}

function render(moving) {
  if (!ctx || !buckets) return
  ctx.clearRect(0, 0, cssWidth, cssHeight)
  ctx.save()
  ctx.translate(originX, originY)
  ctx.scale(scale, scale)

  // 黑底每帧重铺，清屏后不会露出页面底色。
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, DESIGN_W, DESIGN_H)

  // 静止状态直接按原始位置画一遍，用于 prefers-reduced-motion。
  if (!moving) {
    for (const p of buckets.flat()) {
      p.x = p.originX
      p.y = p.originY
    }
  }
  drawParticles(moving)
  ctx.restore()
}

function tick() {
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

  // 竖屏可见宽度太窄，把中心从画幅中点移到左手（原图焦点），避免手被裁掉。
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

onMounted(() => {
  const context = canvas.value?.getContext('2d')
  if (!context) return
  ctx = context
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  resize()
  window.addEventListener('resize', handleResize)
  window.addEventListener('pointermove', handlePointerMove)
  document.documentElement.addEventListener('pointerleave', resetPointer)

  const image = new Image()
  image.decoding = 'async'
  image.onload = () => {
    buckets = buildParticles(image)
    resize()
    if (reducedMotion) {
      render(false)
      return
    }
    frameId = requestAnimationFrame(tick)
  }
  image.src = IMAGE_URL
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frameId)
  cancelAnimationFrame(resizeFrame)
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
