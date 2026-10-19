<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  to: {
    type: [String, Object],
    required: true,
  },
})

const canvas = ref(null)
const label = ref(null)
const isReady = ref(false)

let animationFrame = 0
let particles = []
let viewport = { width: 0, height: 0 }
let shadow = { black: 0, green: 0, warm: 0, blur: 0 }
let cycleStartedAt = 0
let pointerInside = false
let focused = false
let pointerCyclePlayed = false
let focusCyclePlayed = false
let reducedMotion = false
let resizeObserver = null
let motionQuery = null
let resizeFrame = 0

const CYCLE_DURATION = 680

function particleBurst(progress, timing) {
  const peak = 0.16 + timing * 0.12
  if (progress <= peak) {
    const outward = progress / peak
    return 1 - (1 - outward) ** 4
  }

  const inward = (progress - peak) / (1 - peak)
  return (1 - inward) ** 3
}

function draw(progress = 0) {
  const context = canvas.value?.getContext('2d')
  if (!context) return

  const warmMix = pointerInside || focused || (progress > 0 && progress < 1) ? 1 : 0
  context.clearRect(0, 0, viewport.width, viewport.height)

  function drawLayer(offsetX, offsetY, color, radiusScale = 1) {
    context.fillStyle = color
    context.beginPath()

    for (const particle of particles) {
      const burst = particleBurst(progress, particle.timing)
      const wobble =
        Math.sin(progress * Math.PI * 3 + particle.phase) * particle.radius * burst * 1.6
      const x =
        particle.x +
        (particle.scatterX - particle.x) * burst +
        Math.cos(particle.phase) * wobble +
        offsetX
      const y =
        particle.y +
        (particle.scatterY - particle.y) * burst +
        Math.sin(particle.phase) * wobble +
        offsetY
      const radius = particle.radius * (1 + burst * 0.45) * radiusScale
      context.moveTo(x + radius, y)
      context.arc(x, y, radius, 0, Math.PI * 2)
    }

    context.fill()
  }

  drawLayer(shadow.green, shadow.green, 'rgba(61, 255, 141, 0.35)')
  drawLayer(-shadow.warm, -shadow.warm, 'rgba(255, 179, 71, 0.42)')
  context.shadowColor = 'rgba(0, 0, 0, 0.85)'
  context.shadowBlur = shadow.blur
  drawLayer(shadow.black, shadow.black, 'rgba(0, 0, 0, 0.9)', 1.12)
  context.shadowColor = 'transparent'
  context.shadowBlur = 0
  drawLayer(0, 0, `rgb(255 ${Math.round(255 - 76 * warmMix)} ${Math.round(255 - 184 * warmMix)})`)
}

function animate(now) {
  const progress = Math.min((now - cycleStartedAt) / CYCLE_DURATION, 1)
  draw(progress)

  if (progress < 1) {
    animationFrame = requestAnimationFrame(animate)
    return
  }

  animationFrame = 0
  draw()
}

function startCycle() {
  if (reducedMotion) {
    draw()
    return
  }
  if (animationFrame) return
  cycleStartedAt = performance.now()
  animationFrame = requestAnimationFrame(animate)
}

function onPointerEnter() {
  pointerInside = true
  if (pointerCyclePlayed) return
  // 每次进入只播放一轮；离开后才允许下一次 hover 重新触发。
  pointerCyclePlayed = true
  startCycle()
}

function onPointerLeave() {
  pointerInside = false
  pointerCyclePlayed = false
  if (!animationFrame) draw()
}

function onFocus() {
  focused = true
  if (focusCyclePlayed) return
  focusCyclePlayed = true
  startCycle()
}

function onBlur() {
  focused = false
  focusCyclePlayed = false
  if (!animationFrame) draw()
}

function buildParticles() {
  const targetCanvas = canvas.value
  const targetLabel = label.value
  if (!targetCanvas || !targetLabel) return

  const rect = targetLabel.getBoundingClientRect()
  if (!rect.width || !rect.height) return

  const styles = getComputedStyle(targetLabel)
  const fontSize = Number.parseFloat(styles.fontSize) || rect.height
  const scatterRadiusX = window.innerWidth * 0.25
  const scatterRadiusY = window.innerHeight * 0.25
  const particleMargin = Math.ceil(fontSize * 0.2 + 12)
  const bleedX = Math.ceil(scatterRadiusX + particleMargin)
  const bleedY = Math.ceil(scatterRadiusY + particleMargin)
  const width = Math.ceil(rect.width + bleedX * 2)
  const height = Math.ceil(rect.height + bleedY * 2)
  // 大范围 Canvas 只承载圆点，限制像素倍率以免高分屏显存随面积激增。
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5)

  targetCanvas.style.setProperty('--particle-bleed-x', `${bleedX}px`)
  targetCanvas.style.setProperty('--particle-bleed-y', `${bleedY}px`)
  targetCanvas.style.width = `${width}px`
  targetCanvas.style.height = `${height}px`
  targetCanvas.width = Math.ceil(width * dpr)
  targetCanvas.height = Math.ceil(height * dpr)

  const context = targetCanvas.getContext('2d')
  if (!context) return
  context.setTransform(dpr, 0, 0, dpr, 0, 0)
  viewport = { width, height }

  // 直接采样浏览器渲染的当前字体，字重和响应式字号变化都会同步到粒子字形。
  const sampleCanvas = document.createElement('canvas')
  sampleCanvas.width = width
  sampleCanvas.height = height
  const sample = sampleCanvas.getContext('2d', { willReadFrequently: true })
  if (!sample) return

  sample.font = `${styles.fontStyle} ${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`
  sample.textAlign = 'center'
  sample.textBaseline = 'alphabetic'
  const metrics = sample.measureText(props.text)
  const ascent = metrics.actualBoundingBoxAscent || rect.height * 0.75
  const descent = metrics.actualBoundingBoxDescent || rect.height * 0.25
  const baseline = bleedY + (rect.height - ascent - descent) / 2 + ascent
  sample.fillStyle = '#fff'
  sample.fillText(props.text, bleedX + rect.width / 2, baseline)

  const pixels = sample.getImageData(0, 0, width, height).data
  const step = Math.max(4, Math.round(rect.height / 14))
  const centerX = width / 2
  const centerY = height / 2
  const nextParticles = []

  shadow = {
    black: fontSize * 0.025,
    green: fontSize * 0.075,
    warm: fontSize * 0.05,
    blur: Math.max(4, fontSize * 0.08),
  }

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      let alphaTotal = 0
      let weightedX = 0
      let weightedY = 0
      const endX = Math.min(x + step, width)
      const endY = Math.min(y + step, height)

      // 采样整个网格而非单个交点，细笔画不会因刚好落在点阵间隙而消失。
      for (let pixelY = y; pixelY < endY; pixelY += 1) {
        for (let pixelX = x; pixelX < endX; pixelX += 1) {
          const alpha = pixels[(pixelY * width + pixelX) * 4 + 3]
          alphaTotal += alpha
          weightedX += pixelX * alpha
          weightedY += pixelY * alpha
        }
      }

      if (alphaTotal < 128) continue

      const pointX = weightedX / alphaTotal
      const pointY = weightedY / alphaTotal
      const coverage = alphaTotal / (255 * (endX - x) * (endY - y))
      const phase = Math.random() * Math.PI * 2
      const angle = Math.atan2(pointY - centerY, pointX - centerX) + (Math.random() - 0.5) * 1.2
      const distance = 0.72 + Math.random() * 0.28
      nextParticles.push({
        x: pointX,
        y: pointY,
        scatterX: pointX + Math.cos(angle) * scatterRadiusX * distance,
        scatterY: pointY + Math.sin(angle) * scatterRadiusY * distance,
        radius: step * (0.3 + Math.min(coverage * 0.3, 0.14) + Math.random() * 0.04),
        phase,
        timing: Math.random(),
      })
    }
  }

  particles = nextParticles
  isReady.value = particles.length > 0
  draw()
}

function scheduleBuildParticles() {
  cancelAnimationFrame(resizeFrame)
  resizeFrame = requestAnimationFrame(() => {
    resizeFrame = 0
    buildParticles()
  })
}

function onMotionChange(event) {
  reducedMotion = event.matches
  cancelAnimationFrame(animationFrame)
  animationFrame = 0
  draw()
}

onMounted(async () => {
  // 字体加载完成后再取样，避免先用回退字体生成错误轮廓。
  await document.fonts?.ready
  await nextTick()
  buildParticles()

  resizeObserver = new ResizeObserver(scheduleBuildParticles)
  resizeObserver.observe(label.value)
  window.addEventListener('resize', scheduleBuildParticles)
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion = motionQuery.matches
  motionQuery.addEventListener('change', onMotionChange)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrame)
  cancelAnimationFrame(resizeFrame)
  resizeObserver?.disconnect()
  window.removeEventListener('resize', scheduleBuildParticles)
  motionQuery?.removeEventListener('change', onMotionChange)
})
</script>

<template>
  <AppLink
    class="particle-text-link"
    :class="{ 'is-ready': isReady }"
    :to="to"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
    @focus="onFocus"
    @blur="onBlur"
  >
    <span ref="label" class="particle-text-link__label">{{ text }}</span>
    <canvas ref="canvas" class="particle-text-link__canvas" aria-hidden="true"></canvas>
  </AppLink>
</template>

<style scoped>
.particle-text-link {
  position: relative;
  display: inline-block;
  color: inherit;
}

.particle-text-link__label {
  display: inline-block;
}

/* Canvas 成功生成后才隐藏真字；不支持 Canvas 时链接文字仍然可见。 */
.particle-text-link.is-ready .particle-text-link__label {
  color: transparent;
  text-shadow: none;
}

.particle-text-link__canvas {
  position: absolute;
  top: calc(-1 * var(--particle-bleed-y, 0px));
  left: calc(-1 * var(--particle-bleed-x, 0px));
  max-width: none;
  pointer-events: none;
}
</style>
