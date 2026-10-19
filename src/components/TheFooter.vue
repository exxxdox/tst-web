<script setup>
const year = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer__inner container">
      <span class="site-footer__brand">TST</span>
      <span class="site-footer__discipline">Guitar · Code</span>
      <span class="site-footer__status">
        <i aria-hidden="true"></i>
        Signal online · {{ year }}
      </span>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  /* 固定粒子背景是 z-index 0，页脚必须抬到它上面才可见 */
  position: relative;
  z-index: 1;
  /* display:grid + align-content:center 让内层垂直居中，取代内层自己那份 min-height。
     两层都写 min-height: var(--footer-height) 时，内层已占满 64px，外层 border-top
     只能加在这 64px 之外 → footer 实际 64.8px，比页面 min-height 里预留的多 1px，
     Performance / Links 因此常驻纵向滚动条（首页不渲染 footer，所以没这问题）。 */
  display: grid;
  align-content: center;
  min-height: var(--footer-height);
  border-top: 1px solid rgba(255, 255, 255, 0.14);
  /* 完全透明：粒子背景直接透出，仅保留顶部分隔线 */
  background: transparent;
}

.site-footer__inner {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1rem;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.72rem;
  font-weight: 750;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.site-footer__brand {
  color: #ffffff;
  font-family: var(--font-display);
  font-size: 1.35rem;
  letter-spacing: -0.06em;
}

.site-footer__status {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.85);
}

.site-footer__status i {
  width: 0.5rem;
  height: 0.5rem;
  background: var(--color-accent);
  border-radius: 50%;
  box-shadow: 0 0 0.65rem rgba(61, 255, 141, 0.48);
}

@media (max-width: 540px) {
  .site-footer__inner {
    grid-template-columns: auto 1fr;
  }

  .site-footer__discipline {
    display: none;
  }
}
</style>
