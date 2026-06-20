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
  font-size: 60vw;
  text-align: center;
  font-weight: bold;
  transform: translate(-50%, -50%) rotate(-15deg);
  text-shadow: 1vw 1vw 30px rgb(145, 144, 208);
  /*点击可以穿透*/
  pointer-events: none;
}

.fixed-bluegiant {
  opacity: 0.2;
  position: fixed;
  right: 0; /* 贴右侧浏览器边缘 */
  top: 0; /* 贴顶部视口 */
  z-index: 999; /* 保证显示在最上层，不被其他元素覆盖 */
  height: 100vh; /* 以视口高度为准，上下贴紧 */
  width: auto; /* 宽度按高度与图片自然比例自适应，不限制在右侧半屏内 */
  min-width: 0; /* 不设最小宽度，避免被撑成固定宽度框 */
  max-width: none; /* 不限制最大宽度，由浏览器视口左侧裁切多余部分 */
  object-fit: contain; /* 高度撑满后按比例显示，水平方向由视口裁切 */
  object-position: top right;
  pointer-events: none;
}

/* 移动端适配：保留装饰元素，重排为雅致的窄屏构图，层级低于导航 */
@media (max-width: 760px) {
  /* TST 作为居中浅色水印 */
  .centered-rotated-text {
    font-size: 42vw;
    opacity: 0.07;
    transform: translate(-50%, -50%) rotate(-8deg);
    z-index: 0; /* 低于汉堡(30)/遮罩(35)/抽屉(40) */
    white-space: nowrap;
    pointer-events: none;
  }

  /* 雕塑作为右下角受控点缀 */
  .fixed-bluegiant {
    top: auto;
    right: 0;
    bottom: 0;
    width: 70%; /* 百分比宽度避免横向溢出 */
    max-width: 320px;
    height: auto;
    max-height: 45vh;
    min-width: 0; /* 覆盖桌面端 526px，防止横向溢出 */
    object-fit: contain;
    object-position: bottom right;
    opacity: 0.18;
    z-index: 1; /* 低于导航层 */
    pointer-events: none;
  }
}

/* 超窄屏微调：进一步收敛尺寸保持精致 */
@media (max-width: 380px) {
  .centered-rotated-text {
    font-size: 46vw;
    opacity: 0.06;
  }

  .fixed-bluegiant {
    width: 80%;
    max-width: 240px;
    max-height: 38vh;
    opacity: 0.16;
  }
}
</style>
