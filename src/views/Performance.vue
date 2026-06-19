<script setup>
const bilibiliPlayerUrl =
  'https://player.bilibili.com/player.html?bvid=BV1yCXAYRECD&page=1&high_quality=1&danmaku=0'
</script>

<template>
  <div class="performance">
    <h1>My favourtite things</h1>
    <h2>Jonathan Kreisberg</h2>
    <h3>Covered by tst</h3>
    <iframe
      class="performance__player"
      :src="bilibiliPlayerUrl"
      title="My favourtite things - Covered by tst"
      allowfullscreen
      scrolling="no"
      frameborder="0"
      sandbox="allow-top-navigation allow-same-origin allow-forms allow-scripts"
    ></iframe>
  </div>
</template>

<style scoped>
.performance {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.performance__player {
  width: min(854px, 100%);
  aspect-ratio: 854 / 480;
  border: 0;
}
</style>
