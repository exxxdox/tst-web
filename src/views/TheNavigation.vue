<script>
export default {
  name: 'TheNavigation',
}
</script>

<template>
  <header class="header">
    <div class="left">
      <AppLink
        :to="{ name: 'Home' }"
        style="font-family: Bitcount, monospace; font-size: 50px; font-weight: normal"
        >TST</AppLink
      >
      <AppLink :to="{ name: 'Performance' }">Performance</AppLink>
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
</template>

<style scoped>
.header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-size: 30px;
  border-bottom: 1px solid #535252;
  margin: 0;
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
