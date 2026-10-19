<script>
export default {
  name: 'TheNavigation',
}
</script>

<template>
  <!-- 首页的粒子画从视口顶部铺满，导航去掉底色，避免遮挡画面 -->
  <header class="nav-container" :class="{ 'nav--home': $route.name === 'Home' }">
    <nav class="left" aria-label="Primary navigation">
      <AppLink class="brand-link" :to="{ name: 'Home' }" aria-label="TST home">TST</AppLink>
    </nav>
    <!-- 社交图标固定在导航右侧，保持主品牌入口独立。 -->
    <div class="foot">
      <AppLink class="social-link" to="https://github.com/exxxdox">
        <img alt="github logo" class="logo" src="/svg/github.svg" />
      </AppLink>
      <AppLink class="social-link" to="https://space.bilibili.com/26660539">
        <img alt="bilibili logo" class="logo" src="/svg/bilibili.svg" />
      </AppLink>
    </div>
  </header>
</template>

<style scoped>
.nav-container {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  min-height: var(--nav-height);
  margin: 0;
  padding-inline: clamp(1rem, 4vw, 2rem);
  background:
    linear-gradient(90deg, rgba(6, 17, 31, 0.9), rgba(8, 24, 42, 0.64)), rgba(6, 17, 31, 0.78);
  border-bottom: 1px solid rgba(61, 255, 141, 0.1);
  backdrop-filter: blur(16px);
}
/* 导航始终透明，粒子画与页面内容直接透出；文字靠投影保证可读。 */
.nav-container.nav--home {
  background: transparent;
  border-bottom-color: transparent;
  backdrop-filter: none;
}
/* 首页粒子画是黑白灰：品牌字去色后与背景一致。 */
.nav-container.nav--home .brand-link {
  color: #ffffff;
  /* 黑白错位投影替代原绿/橙荧光，保证压在亮粒子上仍有轮廓 */
  text-shadow:
    0.025em 0.025em 0 rgba(0, 0, 0, 0.9),
    0.08em 0.08em 0 rgba(255, 255, 255, 0.22),
    -0.05em -0.05em 0 rgba(120, 120, 120, 0.4),
    0 0 22px rgba(0, 0, 0, 0.9);
}
.left {
  display: grid;
  align-items: center;
}
.brand-link {
  color: var(--color-heading);
  font-family: var(--font-display);
  font-size: clamp(2.1rem, 5vw, 3.2rem);
  font-weight: 400;
  letter-spacing: -0.08em;
  line-height: 1;
  text-shadow:
    0.08em 0.08em 0 rgba(61, 255, 141, 0.46),
    -0.045em -0.045em 0 rgba(255, 179, 71, 0.46);
}
.foot {
  display: flex;
  flex-direction: row;
  position: absolute;
  left: 100%;
  transform: translateX(-100%);
  align-items: center;
  gap: 20px;
  padding-right: clamp(1rem, 4vw, 2rem);
}
.social-link {
  /* 直接展示图标，不加外圈背景/描边；尺寸保留以保证点击区域 */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
}
.router-link-active {
  color: var(--hover-color);
}
/* 全局 a:hover 会把链接刷成品牌绿，导航品牌统一停留在黑白灰 */
.nav-container .brand-link:hover {
  color: #ffffff;
}

@media (max-width: 760px) {
  .nav-container {
    position: sticky;
    top: 0;
    z-index: 100;
    width: 100%;
    flex-wrap: nowrap;
    min-height: auto;
    padding: 1rem;
    gap: 1rem;
    backdrop-filter: none;
  }
  .left {
    min-width: 0;
    grid-template-columns: auto;
    gap: 0;
    padding-left: 0;
    justify-content: start;
    align-items: center;
  }
  .brand-link {
    display: inline-flex;
    /* 给右侧两个 44px 社交按钮 + 间距留出空间 */
    max-width: calc(100vw - 9rem);
    overflow: hidden;
    font-size: 2rem;
    white-space: nowrap;
  }
  .foot {
    gap: 12px;
    padding-right: 0;
  }
}
</style>
