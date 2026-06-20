<script>
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
      this.isOpen = !this.isOpen
    },
    close() {
      this.isOpen = false
    },
    onKeydown(e) {
      if (e.key === 'Escape' && this.isOpen) {
        this.close()
      }
    },
    onResize() {
      if (window.innerWidth > 760 && this.isOpen) {
        this.close()
      }
    },
  },
}
</script>

<template>
  <header class="nav-container">
    <div class="left">
      <AppLink
        :to="{ name: 'Home' }"
        style="font-family: Bitcount, monospace; font-size: 12rem; font-weight: normal"
        >Home</AppLink
      >
      <AppLink :to="{ name: 'Performance' }">Performance</AppLink>
      <AppLink :to="{ name: 'Links' }">Links</AppLink>
    </div>
    <div class="foot" style="gap: 20px">
      <AppLink to="https://github.com/exxxdox">
        <img alt="github logo" class="logo" src="/svg/github.svg" />
      </AppLink>
      <AppLink to="https://space.bilibili.com/26660539">
        <img alt="bilibili logo" class="logo" src="/svg/bilibili.svg" />
      </AppLink>
    </div>

    <button
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

    <div
      class="drawer-backdrop"
      :class="{ open: isOpen }"
      @click="close"
      aria-hidden="true"
    ></div>

    <aside
      id="mobile-drawer"
      class="drawer"
      :class="{ open: isOpen }"
      role="dialog"
      aria-modal="true"
      :aria-hidden="isOpen ? 'false' : 'true'"
    >
      <button class="drawer-close" type="button" aria-label="Close menu" @click="close">
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
  display: flex;
  justify-content: flex-start;
  align-items: center;
  /*border-bottom: 1px solid #535252;*/
  margin: 0;
  min-height: 18rem;
  background-color: rgba(6, 17, 31, 0.78);
  backdrop-filter: blur(16px);
}
.left {
  display: grid;
  align-items: center;
  grid-template-columns: repeat(4, auto);
  gap: 2rem;
  padding-left: 2rem;
}
.foot {
  display: flex;
  flex-direction: row;
  position: absolute;
  left: 100%;
  transform: translateX(-100%);
  align-items: center;
  padding-right: 2rem;
}
.router-link-active {
  color: var(--hover-color);
}

/* Hamburger / drawer hidden on desktop */
.hamburger,
.drawer,
.drawer-backdrop {
  display: none;
}

@media (max-width: 760px) {
  .nav-container {
    position: relative;
    flex-wrap: nowrap;
    min-height: auto;
    padding: 1rem;
    gap: 1rem;
  }
  .left {
    grid-template-columns: auto;
    gap: 0;
    padding-left: 0;
    justify-content: start;
    align-items: center;
  }
  .left :first-child {
    font-size: 2rem !important;
    line-height: 1 !important;
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
    width: 36px;
    height: 36px;
    margin-left: auto;
    padding: 0;
    background: transparent;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    cursor: pointer;
    z-index: 30;
  }
  .hamburger span {
    display: block;
    width: 20px;
    height: 2px;
    background-color: var(--hover-color);
    transition: transform 0.25s ease, opacity 0.2s ease;
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
    background-color: rgba(0, 0, 0, 0.55);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.25s ease;
    z-index: 35;
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
    width: min(78vw, 320px);
    padding: 4rem 1.5rem 1.5rem;
    background-color: var(--color-background-soft);
    border-left: 1px solid var(--color-border);
    backdrop-filter: blur(16px);
    transform: translateX(100%);
    transition: transform 0.28s ease;
    z-index: 40;
    overflow-y: auto;
  }
  .drawer.open {
    transform: translateX(0);
  }
  .drawer-close {
    position: absolute;
    top: 0.6rem;
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
