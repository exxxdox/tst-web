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
  min-height: var(--footer-height);
  border-top: 1px solid rgba(61, 255, 141, 0.12);
  background: rgba(3, 14, 25, 0.72);
}

.site-footer__inner {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  min-height: var(--footer-height);
  gap: 1rem;
  color: rgba(178, 218, 204, 0.62);
  font-size: 0.72rem;
  font-weight: 750;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.site-footer__brand {
  color: var(--color-heading);
  font-family: var(--font-display);
  font-size: 1.35rem;
  letter-spacing: -0.06em;
}

.site-footer__status {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(222, 255, 238, 0.72);
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
