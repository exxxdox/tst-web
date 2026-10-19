<script>
import { getFocusLoopTarget } from '@/utils/focusTrap.js'

export default {
  name: 'TheNavigation',
  data() {
    return {
      isOpen: false,
      activeSection: '',
    }
  },
  watch: {
    $route() {
      // 换页后的焦点交给 App 的主内容，避免菜单按钮覆盖页面宣告。
      this.close({ restoreFocus: false })
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
    window.addEventListener('scroll', this.onScroll, { passive: true })
    this.onScroll()
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.onKeydown)
    window.removeEventListener('resize', this.onResize)
    window.removeEventListener('scroll', this.onScroll)
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
    closeForRoute(routeName) {
      // 同页点击不会触发路由 watcher，必须主动把焦点移出即将 inert 的抽屉。
      this.close({ restoreFocus: this.$route.name === routeName })
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
        // 桌面断点会隐藏菜单按钮，改为聚焦仍可见的品牌链接。
        this.$nextTick(() => this.$refs.desktopBrand?.$el?.focus())
      }
    },
    onScroll() {
      // 区块与导航同页，按视口中线判断当前区块。
      const midline = window.innerHeight / 2
      let current = ''
      for (const id of ['performance', 'links']) {
        const rect = document.getElementById(id)?.getBoundingClientRect()
        if (rect && rect.top <= midline && rect.bottom > midline) current = id
      }
      this.activeSection = current
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
      <AppLink ref="desktopBrand" class="brand-link" :to="{ name: 'Home' }" aria-label="TST home">
        TST
      </AppLink>
      <AppLink
        class="nav-link"
        :class="{ 'is-current': activeSection === 'performance' }"
        :to="{ name: 'Home', hash: '#performance' }"
        >Performance</AppLink
      >
      <AppLink
        class="nav-link"
        :class="{ 'is-current': activeSection === 'links' }"
        :to="{ name: 'Home', hash: '#links' }"
        >Links</AppLink
      >
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
      aria-label="Navigation menu"
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
        <AppLink :to="{ name: 'Home', hash: '#performance' }" @click="closeForRoute('Home')">
          Performance
        </AppLink>
        <AppLink :to="{ name: 'Home', hash: '#links' }" @click="closeForRoute('Home')">
          Links
        </AppLink>
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
/* 导航始终透明，粒子画与页面内容直接透出；文字靠投影保证可读。 */
.nav-container.nav--home {
  background: transparent;
  border-bottom-color: transparent;
  backdrop-filter: none;
}
/* 透明背景下给链接加一层暗色投影，压在亮部粒子上仍然可读。 */
.nav-container.nav--home .nav-link {
  color: rgba(255, 255, 255, 0.88);
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.95);
}
/* 首页粒子画是黑白灰：品牌字与导航链接统一去色。 */
.nav-container.nav--home .brand-link {
  color: #ffffff;
  /* 黑白错位投影替代原绿/橙荧光，保证压在亮粒子上仍有轮廓 */
  text-shadow:
    0.025em 0.025em 0 rgba(0, 0, 0, 0.9),
    0.08em 0.08em 0 rgba(255, 255, 255, 0.22),
    -0.05em -0.05em 0 rgba(120, 120, 120, 0.4),
    0 0 22px rgba(0, 0, 0, 0.9);
}
.nav-container.nav--home .nav-link.router-link-active {
  color: #ffffff;
  /* 导航保持黑白灰：当前区块只用白色下划线标记 */
  border-bottom-color: rgba(255, 255, 255, 0.85);
}
.nav-container.nav--home .social-link {
  background: rgba(0, 0, 0, 0.42);
  border-color: rgba(255, 255, 255, 0.32);
}
.nav-container.nav--home .hamburger {
  background: rgba(0, 0, 0, 0.42);
  border-color: rgba(255, 255, 255, 0.32);
}
.nav-container.nav--home .hamburger span {
  background-color: #ffffff;
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
  /* 与左侧 TST 标志统一使用显示字体 */
  font-family: var(--font-display);
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
/* 同页锚点会让两个 router-link-active 同时命中，区块高亮改由滚动观察决定 */
.nav-link.router-link-active {
  color: rgba(222, 255, 238, 0.78);
}
.nav-link.is-current {
  color: #ffffff;
  border-bottom: 2px solid rgba(255, 255, 255, 0.85);
}
/* 全局 a:hover 会把链接刷成品牌绿，导航内统一停留在黑白灰 */
.nav-container .nav-link:hover,
.nav-container .brand-link:hover,
.drawer-nav a:hover {
  color: #ffffff;
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
      linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent 32%), rgba(4, 4, 4, 0.94);
    border-left: 1px solid rgba(255, 255, 255, 0.16);
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
    /* 抽屉保持黑白灰，关闭按钮不再用品牌绿 */
    color: #ffffff;
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
    /* 抽屉沿用导航黑白灰，不用带绿调的 heading 色 */
    color: #ffffff;
    /* 移动端抽屉沿用桌面导航的显示字体 */
    font-family: var(--font-display);
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
