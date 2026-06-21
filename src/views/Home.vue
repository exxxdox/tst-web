<script setup></script>
<template>
  <main class="home-page">
    <div class="centered-rotated-text">TST</div>
    <img class="fixed-bluegiant" src="/BlueGiant-head-sculpture.png" alt="sculpture" />

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
        <AppLink class="hero__action" :to="{ name: 'Links' }">Open links</AppLink>
      </div>
      <span class="signal-rule" aria-hidden="true"></span>
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
  min-height: 3rem;
  padding: 0.78rem 1rem;
  color: var(--color-heading);
  background: rgba(8, 24, 42, 0.72);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  box-shadow: 0 16px 40px rgba(0, 8, 20, 0.22);
  backdrop-filter: blur(14px);
}

.hero__action--primary {
  color: #06111f;
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent-warm));
  border-color: transparent;
}

.hero__action:hover {
  transform: translateY(-2px);
}

.centered-rotated-text {
  opacity: 0.07;
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
  text-shadow:
    1vw 1vw 30px rgba(61, 255, 141, 0.55),
    -0.5vw -0.5vw 30px rgba(255, 179, 71, 0.26);
  /*点击可以穿透*/
  pointer-events: none;
}

.fixed-bluegiant {
  opacity: 0.2;
  position: fixed;
  right: 0; /* 贴右侧浏览器边缘 */
  top: 0; /* 贴顶部视口 */
  z-index: 1;
  height: 100vh; /* 以视口高度为准，上下贴紧 */
  width: auto; /* 宽度按高度与图片自然比例自适应，不限制在右侧半屏内 */
  min-width: 0; /* 不设最小宽度，避免被撑成固定宽度框 */
  max-width: none; /* 不限制最大宽度，由浏览器视口左侧裁切多余部分 */
  object-fit: contain; /* 高度撑满后按比例显示，水平方向由视口裁切 */
  object-position: top right;
  filter: saturate(0.82) contrast(1.08) drop-shadow(-2rem 2rem 4rem rgba(0, 0, 0, 0.4));
  pointer-events: none;
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
    opacity: 0.06;
    transform: translate(-50%, -50%) rotate(-8deg);
    white-space: nowrap;
    pointer-events: none;
  }

  /* 雕塑作为右下角受控点缀 */
  .fixed-bluegiant {
    top: auto;
    right: 0;
    bottom: 0;
    width: 70%; /* 百分比宽度避免横向溢出 */
    max-width: 320px;
    height: auto;
    max-height: 45vh;
    min-width: 0; /* 覆盖桌面端 526px，防止横向溢出 */
    object-fit: contain;
    object-position: bottom right;
    opacity: 0.18;
    pointer-events: none;
  }
}

/* 超窄屏微调：进一步收敛尺寸保持精致 */
@media (max-width: 380px) {
  .centered-rotated-text {
    font-size: 46vw;
    opacity: 0.05;
  }

  .fixed-bluegiant {
    width: 80%;
    max-width: 240px;
    max-height: 38vh;
    opacity: 0.16;
  }
}
</style>
