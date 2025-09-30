<script setup>
import { ref, computed } from 'vue'
import NotFound from './components/NotFound.vue'
import Home from './components/Home.vue'
import About from './components/About.vue'
const routes = {
  '/': Home,
  '/about': About,
  '/NotFound': NotFound,
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
    <!-- <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />
    </div> -->
    <div class="left">
      <a href="#/" style="font-family: Bitcount; font-size: 50px">TST</a>
      <a href="#/about">About</a>
      <a href="#/non-existent-path">Broken Link</a>
    </div>
    <div class="foot">test</div>
  </header>

  <main>
    <component :is="currentView" />
    <!-- <TheWelcome /> -->
  </main>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: flex-left;
  align-items: center;
  font-size: 30px;
  /* background-color: var(--main-color);
  color: white; */
}
.left {
  /* position: absolute;
  left: 50%;
  transform: translateX(-50%); 123*/
  display: grid;
  grid-template-columns: repeat(3, auto);
  gap: 40px;
}
.foot {
  position: absolute;
  left: 100%;
  transform: translateX(-100%);
}
</style>
