<script setup></script>
<template>
  <div class="not-found">
    <h1>HomePage</h1>
  </div>
  <video
    autoplay
    muted
    loop
    id="myVideo"
    style="
      width: 854px;
      height: 480px;
      object-fit: cover;
      /* position: fixed;
      top: 0;
      left: 0; */
      z-index: -1;
    "
  >
    <source src="/rotate-My favourite things.mp4" type="video/mp4" />
  </video>
</template>

<style scoped></style>
