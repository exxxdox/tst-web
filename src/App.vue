<script setup>
import { ref, computed } from 'vue'
import Home from './components/Home.vue'
import Music from './components/Music.vue'
const routes = {
  '/': Home,
  '/detail': Music,
}
const currentPath = ref(window.location.hash)
window.addEventListener('hashchange', () => {
  currentPath.value = window.location.hash
})
const currentView = computed(() => {
  return routes[currentPath.value.slice(1) || '/'] || NotFound
})
</script>

<template>
  <header class="header">
    <div class="left">
      <a href="#/" style="font-family: Bitcount; font-size: 50px; font-weight: normal">TST</a>
      <a href="#/detail">Music</a>
    </div>
    <div class="foot" style="gap: 20px">
      <a href="https://github.com/exxxdox">
        <img alt="github logo" class="logo" target="_blank" src="/svg/github.svg" />
      </a>
      <a href="https://space.bilibili.com/26660539">
        <img alt="github logo" class="logo" target="_blank" src="/svg/bilibili.svg" />
      </a>
    </div>
  </header>

  <main>
    <component :is="currentView" />
  </main>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: flex-left;
  align-items: center;
  font-size: 30px;
  border-bottom: 1px solid #535252;
}
.left {
  display: grid;
  align-items: center;
  grid-template-columns: repeat(3, auto);
  gap: 40px;
}
.foot {
  display: flex;
  flex-direction: row;
  position: absolute;
  left: 100%;
  transform: translateX(-100%);
  align-items: center;
}
</style>
