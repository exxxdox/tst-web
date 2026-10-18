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
  /* 首页背景是黑白粒子画：用品牌绿+橙做小面积强调，主体仍是黑白灰 */
  --color-accent: #3dff8d;
  --color-accent-warm: #ffb347;
  --color-heading: #ffffff;

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
  color: #ffffff;
  font-size: var(--fs-display);
  /* 内层黑投影保证白粒子上的轮廓，外层绿/橙错位投影对应品牌双色 */
  text-shadow:
    0.025em 0.025em 0 rgba(0, 0, 0, 0.9),
    0.075em 0.075em 0 rgba(61, 255, 141, 0.35),
    -0.05em -0.05em 0 rgba(255, 179, 71, 0.42),
    0 0 42px rgba(0, 0, 0, 0.85);
}

.kicker {
  color: #3dff8d;
  text-shadow:
    0 1px 10px rgba(0, 0, 0, 0.9),
    0 0 18px rgba(61, 255, 141, 0.35);
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
  color: #f5f5f5;
  /* 半透明黑底 + 白描边：压在亮粒子上按钮边界仍然清晰 */
  background: rgba(8, 8, 8, 0.72);
  border: 1px solid rgba(61, 255, 141, 0.34);
  border-radius: 7px;
  box-shadow:
    0 12px 28px rgba(0, 0, 0, 0.45),
    0 0 20px rgba(61, 255, 141, 0.12),
    0 1px 0 rgba(255, 255, 255, 0.08) inset;
  backdrop-filter: blur(4px);
}

.hero__action--primary {
  color: #150d02;
  /* 暖色只给主 CTA，黑白画面上形成唯一视觉锚点 */
  background: #ffb347;
  border-color: #ffd39a;
  box-shadow:
    0 12px 30px rgba(0, 0, 0, 0.5),
    0 0 24px rgba(255, 179, 71, 0.28),
    0 0 44px rgba(61, 255, 141, 0.14);
}

/* 全局 a:hover 会把文字刷成 --hover-color（首页为白），暖底上必须保持深色文字 */
.hero__action--primary:hover {
  color: #150d02;
}

.hero__action--primary::after {
  width: 0.45rem;
  height: 0.45rem;
  content: '';
  /* 品牌绿作为电源指示灯，和暖橙主按钮形成双色 */
  background: #3dff8d;
  border-radius: 50%;
  box-shadow: 0 0 0.6rem rgba(61, 255, 141, 0.75);
}

.hero__action:hover {
  transform: translateY(-2px);
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
