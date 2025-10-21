<script setup></script>
<template>
  <div class="centered-rotated-text">TST</div>
  <img class="fixed-bluegiant" src="/BlueGiant-head-sculpture.png" alt="sculpture" />
</template>

<style scoped>
.centered-rotated-text {
  opacity: 0.1;
  position: fixed;
  top: 50%;
  left: 50%;
  font-size: 70vw;
  text-align: center;
  font-weight: bold;
  transform: translate(-50%, -50%) rotate(-15deg);
  /*点击可以穿透*/
  pointer-events: none;
}

.fixed-bluegiant {
  opacity: 0.2;
  position: fixed;
  right: 0; /* 贴左侧 */
  top: 0; /* 贴底部 */
  z-index: 999; /* 保证显示在最上层，不被其他元素覆盖 */
  width: 60vw; /* 占据视口宽度的50% */
  height: 100vh; /* 占据整个视口高度 */
  object-fit: cover; /* 保持图片比例并覆盖整个区域 */
  pointer-events: none;
}
</style>
