<script setup>
import BlueGiant from '@/components/BlueGiant.vue'
import SignalStrip from '@/components/SignalStrip.vue'
</script>
<template>
  <main id="main-content" class="home-page" tabindex="-1">
    <div class="centered-rotated-text">TST</div>
    <!-- 首屏视觉改为 canvas 粒子画：装饰性内容不进可访问性树，也不作为 LCP 图片参与加载 -->
    <BlueGiant />

    <section class="hero container" aria-labelledby="home-title">
      <p class="kicker">Music & Code</p>
      <h1 id="home-title" class="hero__mark">TST</h1>
      <p class="hero__intro">
        Rory builds small web instruments and records guitar performances — a personal stage for
        sound, tools, and experiments.
      </p>
      <div class="hero__actions" aria-label="Primary links">
        <AppLink class="hero__action hero__action--primary" :to="{ name: 'Performance' }">
          Watch performance
        </AppLink>
        <AppLink class="hero__action" :to="{ name: 'Links' }">Explore instruments</AppLink>
      </div>
      <SignalStrip input="Guitar" output="Code" />
    </section>
  </main>
</template>

<style scoped>
.home-page {
  display: grid;
  min-height: calc(100vh - var(--nav-height));
  overflow: hidden;
  padding-block: clamp(3rem, 7vw, 7rem);
}

.hero {
  z-index: 3;
  display: grid;
  align-self: center;
  gap: clamp(1rem, 2vw, 1.5rem);
}

.hero__mark {
  max-width: none;
  color: var(--color-heading);
  font-size: var(--fs-display);
  text-shadow:
    0.06em 0.06em 0 rgba(61, 255, 141, 0.42),
    -0.035em -0.035em 0 rgba(255, 179, 71, 0.46),
    0 0 48px rgba(61, 255, 141, 0.26);
}

.hero__intro {
  max-width: 42rem;
  color: rgba(222, 255, 238, 0.84);
  font-size: clamp(1.1rem, 2.4vw, 1.45rem);
  font-weight: 650;
  line-height: 1.45;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  padding-top: 0.5rem;
}

.hero__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  min-height: 3rem;
  padding: 0.78rem 1.05rem;
  color: var(--color-heading);
  background: #0a2032;
  border: 1px solid rgba(61, 255, 141, 0.24);
  border-radius: 7px;
  box-shadow:
    0 12px 28px rgba(0, 8, 20, 0.22),
    0 1px 0 rgba(255, 255, 255, 0.05) inset;
}

.hero__action--primary {
  color: #06111f;
  background: var(--color-accent);
  border-color: rgba(222, 255, 238, 0.4);
}

.hero__action--primary::after {
  width: 0.45rem;
  height: 0.45rem;
  content: '';
  background: var(--color-accent-warm);
  border-radius: 50%;
  box-shadow: 0 0 0.55rem rgba(255, 179, 71, 0.64);
}

.hero__action:hover {
  transform: translateY(-2px);
}

.centered-rotated-text {
  opacity: 0.035;
  position: fixed;
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

.hero > :nth-child(4) {
  animation-delay: 0.22s;
}

.hero > :nth-child(5) {
  animation-delay: 0.29s;
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
  .home-page {
    min-height: auto;
    padding-block: 2rem 5rem;
  }

  .hero {
    align-self: start;
  }

  .hero__actions {
    align-items: stretch;
    flex-direction: column;
    max-width: 20rem;
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
