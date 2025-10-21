<script>
export default {
  name: 'TheNavigation',
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
    </div>
    <div class="foot" style="gap: 20px">
      <AppLink to="https://github.com/exxxdox">
        <img alt="github logo" class="logo" src="/svg/github.svg" />
      </AppLink>
      <AppLink to="https://space.bilibili.com/26660539">
        <img alt="bilibili logo" class="logo" src="/svg/bilibili.svg" />
      </AppLink>
    </div>
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
  background-color: black;
}
.left {
  display: grid;
  align-items: center;
  grid-template-columns: repeat(3, auto);
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
</style>
