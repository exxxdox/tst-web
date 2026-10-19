<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import BlueGiant from '@/components/BlueGiant.vue'
import PerformanceSection from '@/components/PerformanceSection.vue'
import LinksSection from '@/components/LinksSection.vue'
import { observeReveal } from '@/utils/scrollReveal.js'
import { sceneFade } from '@/utils/sceneFade.js'

const page = ref(null)
const isScrolled = ref(false)
let stopReveal = null
let scrollFrame = 0

function onScroll() {
  // 合并到一帧：高刷设备的事件频率高于刷新率，避免重复读布局与写样式。
  if (scrollFrame) return
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = 0
    // 滚过首屏后降低粒子背景强度，避免干扰下方正文
    isScrolled.value = window.scrollY > window.innerHeight * 0.6
    updateSceneFade()
  })
}

// 区块中心越靠近视口中心越不透明；靠近上下边缘时淡出，避免边缘内容抢焦点。
function updateSceneFade() {
  const viewportHeight = window.innerHeight
  const viewportCenter = viewportHeight / 2
  for (const element of page.value?.querySelectorAll('.hero-stage, .scene') ?? []) {
    const rect = element.getBoundingClientRect()
    const distance = Math.abs(rect.top + rect.height / 2 - viewportCenter)
    element.style.setProperty('--scene-fade', String(sceneFade(distance, viewportHeight)))
  }
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
  onScroll()
  // 首屏以下的区块首次进入视口时加类，之后停止观察；动画本身交给 CSS。
  const targets = page.value?.querySelectorAll('[data-reveal]') ?? []
  stopReveal = observeReveal(targets, (section) => section.classList.add('is-revealed'))
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  cancelAnimationFrame(scrollFrame)
  stopReveal?.()
})
</script>
<template>
  <main id="main-content" ref="page" class="home-page" tabindex="-1">
    <!-- 粒子画固定在视口背后贯穿整页，滚动后由 is-dim 降低强度 -->
    <BlueGiant :class="{ 'is-dim': isScrolled }" />

    <!-- 首屏负责排版与水印，背景仍由固定粒子画提供 -->
    <section class="hero-stage" aria-labelledby="home-title">
      <div class="centered-rotated-text">TST</div>

      <div class="hero container">
        <!-- 标题直接承担两个区块入口，避免重复 CTA。 -->
        <h1 id="home-title" class="hero__mark">
          <AppLink class="hero__mark-link" :to="{ name: 'Home', hash: '#performance' }">
            Music
          </AppLink>
          &amp;<br />
          <AppLink class="hero__mark-link" :to="{ name: 'Home', hash: '#links' }"> Code </AppLink>
        </h1>
      </div>
    </section>

    <!-- 原 Performance / Links 路由页，合并为同一页内依次进场的区块 -->
    <section id="performance" class="scene" data-reveal aria-labelledby="performance-title">
      <PerformanceSection />
    </section>

    <section id="links" class="scene" data-reveal aria-labelledby="links-title">
      <LinksSection />
    </section>
  </main>
</template>

<style scoped>
.home-page {
  /* 首页背景是黑白粒子画：用品牌绿+橙做小面积强调，主体仍是黑白灰 */
  --color-accent: #3dff8d;
  --color-accent-warm: #ffb347;
  --color-heading: #ffffff;
}

/* 首屏只负责排版：粒子画固定在整页背景层 */
.hero-stage {
  position: relative;
  z-index: 1;
  /* 滚动时按与视口中心的距离淡入淡出，边缘内容不抢中心焦点 */
  opacity: var(--scene-fade, 1);
  display: grid;
  align-items: center;
  min-height: calc(100vh - var(--nav-height));
  overflow: hidden;
  padding-block: clamp(3rem, 7vw, 7rem);
}

/* 下方区块首次进入视口时由 IntersectionObserver 加上 .is-revealed */
.scene {
  position: relative;
  /* 区块整体压在固定粒子背景之上 */
  z-index: 1;
  /* 由 updateSceneFade 写入，越靠视口边缘越透明 */
  opacity: var(--scene-fade, 1);
}

/* 动画放在内容层而不是锚点区块本身，避免位移改变锚点落点 */
.scene > * {
  opacity: 0;
  transform: translateY(clamp(1.25rem, 3vw, 2.5rem));
  transition:
    opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}

.scene.is-revealed > * {
  opacity: 1;
  transform: none;
}

/* 减少动态偏好下直接显示：区块不能因为不触发过渡而永久透明 */
@media (prefers-reduced-motion: reduce) {
  .scene > * {
    opacity: 1;
    transform: none;
    transition: none;
  }

  /* 滚动淡化也属于动效，偏好减少动态时保持完全可见 */
  .hero-stage,
  .scene {
    opacity: 1;
  }
}

.hero {
  z-index: 3;
  display: grid;
  align-self: center;
  gap: clamp(1rem, 2vw, 1.5rem);
}

.hero__mark {
  max-width: none;
  color: #ffffff;
  /* 两行标题用 h1 阶梯，避免 display 字号过大压过粒子画 */
  font-size: var(--fs-h1);
  /* 内层黑投影保证白粒子上的轮廓，外层绿/橙错位投影对应品牌双色 */
  text-shadow:
    0.025em 0.025em 0 rgba(0, 0, 0, 0.9),
    0.075em 0.075em 0 rgba(61, 255, 141, 0.35),
    -0.05em -0.05em 0 rgba(255, 179, 71, 0.42),
    0 0 42px rgba(0, 0, 0, 0.85);
}

.hero__mark-link {
  color: inherit;
  font-weight: inherit;
}

/* SignalStrip 内部有绿色/暖色硬编码，首页用 :deep 覆盖成黑白灰并保留高对比 */
.home-page :deep(.signal-strip) {
  color: rgba(245, 245, 245, 0.8);
  background: rgba(0, 0, 0, 0.62);
  border-color: rgba(61, 255, 141, 0.3);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.05) inset,
    0 0 22px rgba(61, 255, 141, 0.12);
}

.home-page :deep(.signal-strip__meter i:nth-child(4n)) {
  background: #ffb347;
  box-shadow: 0 0 0.55rem rgba(255, 179, 71, 0.4);
}

.centered-rotated-text {
  opacity: 0.035;
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 0;
  font-family: var(--font-display);
  font-size: 60vw;
  font-weight: 400;
  line-height: 1;
  text-align: center;
  transform: translate(-50%, -50%) rotate(-15deg);
  /* 这里原本挂两个 30px 大半径 text-shadow。60vw 字号下等于对一个约 3700×2400 的图层做两次模糊，
     而元素整体 opacity 只有 0.035，阴影会被一起乘掉：等效透明度 ≤ 0.28×0.035 ≈ 1%，
     通道偏移 ≤2/255，肉眼不可见。实测切回主页最差帧 25~30ms → 5~10ms，超 16ms 的长帧清零。
     要恢复辉光得连着色调一起重做，不要直接加回 text-shadow。 */
  /*点击可以穿透*/
  pointer-events: none;
}

.hero > * {
  animation: power-on 0.52s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.hero > :nth-child(2) {
  animation-delay: 0.08s;
}

.hero > :nth-child(3) {
  animation-delay: 0.15s;
}

@keyframes power-on {
  from {
    opacity: 0;
    transform: translateY(0.55rem);
    filter: brightness(1.8);
  }

  to {
    opacity: 1;
    transform: translateY(0);
    filter: brightness(1);
  }
}

/* 移动端适配：保留装饰元素，重排为雅致的窄屏构图，层级低于导航 */
@media (max-width: 760px) {
  .hero-stage {
    min-height: auto;
    padding-block: 2rem 5rem;
  }

  .hero {
    align-self: start;
  }

  /* 小屏单列布局留白多，标题放大一档增强首屏存在感 */
  .hero__mark {
    font-size: clamp(3.5rem, 15vw, 5rem);
  }

  /* TST 作为居中浅色水印 */
  .centered-rotated-text {
    font-size: 46vw;
    opacity: 0.03;
    transform: translate(-50%, -50%) rotate(-8deg);
    white-space: nowrap;
    pointer-events: none;
  }
}

/* 超窄屏微调：进一步收敛尺寸保持精致 */
@media (max-width: 380px) {
  .centered-rotated-text {
    font-size: 46vw;
    opacity: 0.025;
  }
}
</style>
