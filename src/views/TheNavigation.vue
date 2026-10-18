<script>
import { getFocusLoopTarget } from '@/utils/focusTrap.js'

export default {
  name: 'TheNavigation',
  data() {
    return {
      isOpen: false,
    }
  },
  watch: {
    $route() {
      this.close()
    },
    isOpen(val) {
      if (val) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    },
  },
  mounted() {
    document.addEventListener('keydown', this.onKeydown)
    window.addEventListener('resize', this.onResize)
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.onKeydown)
    window.removeEventListener('resize', this.onResize)
    document.body.style.overflow = ''
  },
  methods: {
    toggle() {
      if (this.isOpen) {
        this.close()
        return
      }

      this.isOpen = true
      this.$nextTick(() => this.$refs.drawerClose?.focus())
    },
    close({ restoreFocus = true } = {}) {
      const wasOpen = this.isOpen
      this.isOpen = false

      if (wasOpen && restoreFocus) {
        this.$nextTick(() => this.$refs.menuButton?.focus())
      }
    },
    onKeydown(e) {
      if (!this.isOpen) return

      if (e.key === 'Escape') {
        this.close()
      } else if (e.key === 'Tab') {
        this.trapDrawerFocus(e)
      }
    },
    onResize() {
      if (window.innerWidth > 760 && this.isOpen) {
        this.close({ restoreFocus: false })
      }
    },
    trapDrawerFocus(e) {
      const focusable = this.$refs.drawer.querySelectorAll('a[href], button:not([disabled])')
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const target = getFocusLoopTarget({
        activeElement: document.activeElement,
        container: this.$refs.drawer,
        first,
        last,
        shiftKey: e.shiftKey,
      })

      if (!target) return
      e.preventDefault()
      target.focus()
    },
  },
}
</script>

<template>
  <!-- 首页的粒子画从视口顶部铺满，导航去掉底色，避免遮挡画面 -->
  <header class="nav-container" :class="{ 'nav--home': $route.name === 'Home' }">
    <nav class="left" aria-label="Primary navigation">
      <AppLink class="brand-link" :to="{ name: 'Home' }" aria-label="TST home">TST</AppLink>
      <AppLink class="nav-link" :to="{ name: 'Performance' }">Performance</AppLink>
      <AppLink class="nav-link" :to="{ name: 'Links' }">Links</AppLink>
    </nav>
    <div class="foot" style="gap: 20px">
      <AppLink class="social-link" to="https://github.com/exxxdox">
        <img alt="github logo" class="logo" src="/svg/github.svg" />
      </AppLink>
      <AppLink class="social-link" to="https://space.bilibili.com/26660539">
        <img alt="bilibili logo" class="logo" src="/svg/bilibili.svg" />
      </AppLink>
    </div>

    <button
      ref="menuButton"
      class="hamburger"
      type="button"
      aria-label="Toggle navigation menu"
      :aria-expanded="isOpen ? 'true' : 'false'"
      aria-controls="mobile-drawer"
      @click="toggle"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>

    <div class="drawer-backdrop" :class="{ open: isOpen }" @click="close" aria-hidden="true"></div>

    <aside
      id="mobile-drawer"
      ref="drawer"
      class="drawer"
      :class="{ open: isOpen }"
      role="dialog"
      aria-modal="true"
      :aria-hidden="isOpen ? 'false' : 'true'"
      :inert="isOpen ? undefined : ''"
    >
      <button
        ref="drawerClose"
        class="drawer-close"
        type="button"
        aria-label="Close menu"
        @click="close"
      >
        ×
      </button>
      <nav class="drawer-nav">
        <AppLink :to="{ name: 'Home' }" @click="close">Home</AppLink>
        <AppLink :to="{ name: 'Performance' }" @click="close">Performance</AppLink>
        <AppLink :to="{ name: 'Links' }" @click="close">Links</AppLink>
      </nav>
      <div class="drawer-foot">
        <AppLink to="https://github.com/exxxdox" @click="close">
          <img alt="github logo" class="logo" src="/svg/github.svg" />
        </AppLink>
        <AppLink to="https://space.bilibili.com/26660539" @click="close">
          <img alt="bilibili logo" class="logo" src="/svg/bilibili.svg" />
        </AppLink>
      </div>
    </aside>
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
/* 首页只保留导航元素本身：去背景、去分隔线、去模糊，让人物粒子画完整露出。 */
.nav-container.nav--home {
  background: transparent;
  border-bottom-color: transparent;
  backdrop-filter: none;
}
/* 透明背景下给链接加一层暗色投影，压在亮部粒子上仍然可读。 */
.nav-container.nav--home .nav-link {
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.85);
}
.left {
  display: grid;
  align-items: center;
  grid-template-columns: repeat(3, auto);
  gap: clamp(1rem, 3vw, 2rem);
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
.nav-link {
  padding-block: 0.4rem;
  color: rgba(222, 255, 238, 0.78);
  font-size: clamp(0.92rem, 1.5vw, 1rem);
  letter-spacing: 0.04em;
}
.foot {
  display: flex;
  flex-direction: row;
  position: absolute;
  left: 100%;
  transform: translateX(-100%);
  align-items: center;
  padding-right: clamp(1rem, 4vw, 2rem);
}
.social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--color-border);
  border-radius: 999px;
}
.router-link-active {
  color: var(--hover-color);
}
.nav-link.router-link-active {
  color: var(--color-heading);
  border-bottom: 2px solid var(--color-accent-warm);
}

/* Hamburger / drawer hidden on desktop */
.hamburger,
.drawer,
.drawer-backdrop {
  display: none;
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
    max-width: calc(100vw - 6.5rem);
    overflow: hidden;
    font-size: 2rem;
    white-space: nowrap;
  }
  /* Collapse inline non-Home links + foot icons behind hamburger */
  .left > a:not(:first-child) {
    display: none;
  }
  .foot {
    display: none;
  }

  /* Hamburger button */
  .hamburger {
    display: inline-flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 5px;
    width: 42px;
    height: 42px;
    margin-left: auto;
    padding: 0;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--color-border);
    border-radius: 999px;
    cursor: pointer;
    z-index: 30;
  }
  .hamburger span {
    display: block;
    width: 20px;
    height: 2px;
    background-color: var(--hover-color);
    transition:
      transform 0.25s ease,
      opacity 0.2s ease;
    transform-origin: center;
  }
  .hamburger[aria-expanded='true'] span:nth-child(1) {
    transform: translateY(7px) rotate(45deg);
  }
  .hamburger[aria-expanded='true'] span:nth-child(2) {
    opacity: 0;
  }
  .hamburger[aria-expanded='true'] span:nth-child(3) {
    transform: translateY(-7px) rotate(-45deg);
  }

  /* Backdrop */
  .drawer-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.62);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.25s ease;
    z-index: 110;
  }
  .drawer-backdrop.open {
    opacity: 1;
    pointer-events: auto;
  }

  /* Drawer */
  .drawer {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: min(86vw, 320px);
    max-width: calc(100vw - 1rem);
    min-height: 100dvh;
    padding: calc(4rem + env(safe-area-inset-top)) 1.5rem calc(1.5rem + env(safe-area-inset-bottom));
    background:
      linear-gradient(180deg, rgba(255, 179, 71, 0.08), transparent 32%),
      var(--color-background-soft);
    border-left: 1px solid var(--color-border);
    backdrop-filter: blur(16px);
    transform: translateX(100%);
    transition: transform 0.28s ease;
    z-index: 120;
    overflow-y: auto;
    box-shadow: -28px 0 70px rgba(0, 0, 0, 0.42);
  }
  .drawer.open {
    transform: translateX(0);
  }
  .drawer-close {
    position: absolute;
    top: calc(0.6rem + env(safe-area-inset-top));
    right: 0.8rem;
    width: 36px;
    height: 36px;
    padding: 0;
    background: transparent;
    border: none;
    color: var(--hover-color);
    font-size: 28px;
    line-height: 1;
    cursor: pointer;
  }
  .drawer-nav {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
  .drawer-nav a {
    color: var(--color-heading);
    font-size: 1.6rem;
  }
  .drawer-foot {
    display: flex;
    flex-direction: row;
    gap: 20px;
    margin-top: auto;
    padding-top: 2rem;
    align-items: center;
  }
  .drawer-foot .logo {
    width: 24px;
    height: 24px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hamburger span,
  .drawer,
  .drawer-backdrop {
    transition: none;
  }
}
</style>
