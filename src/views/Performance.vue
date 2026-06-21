<script setup>
const bilibiliPlayerUrl =
  'https://player.bilibili.com/player.html?bvid=BV1yCXAYRECD&page=1&high_quality=1&danmaku=0'
</script>

<template>
  <main class="performance-page">
    <section class="performance container" aria-labelledby="performance-title">
      <div class="performance__copy">
        <p class="kicker">Live take / guitar cover</p>
        <h1 id="performance-title">My Favourite Things</h1>
        <p class="performance__meta">Jonathan Kreisberg · covered by TST</p>
        <span class="signal-rule" aria-hidden="true"></span>
      </div>

      <div class="stage-frame" aria-label="Performance video player">
        <iframe
          class="performance__player"
          :src="bilibiliPlayerUrl"
          title="My Favourite Things - Covered by TST"
          allowfullscreen
          scrolling="no"
          frameborder="0"
          sandbox="allow-same-origin allow-forms allow-scripts allow-popups allow-popups-to-escape-sandbox"
        ></iframe>
      </div>
    </section>
  </main>
</template>

<style scoped>
.performance-page {
  min-height: calc(100vh - var(--nav-height));
  padding-block: clamp(2.5rem, 7vw, 6rem);
}

.performance {
  display: grid;
  gap: clamp(1.5rem, 4vw, 3rem);
}

.performance__copy {
  display: grid;
  gap: 0.85rem;
}

.performance__meta {
  color: rgba(222, 255, 238, 0.82);
  font-size: clamp(1.05rem, 2vw, 1.3rem);
  font-weight: 750;
}

.stage-frame {
  width: min(100%, 980px);
  padding: clamp(0.55rem, 1.8vw, 1rem);
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(255, 179, 71, 0.12), rgba(61, 255, 141, 0.08)),
    rgba(8, 24, 42, 0.66);
  border: 1px solid rgba(255, 179, 71, 0.22);
  border-radius: 20px;
  box-shadow:
    0 28px 80px rgba(0, 8, 20, 0.42),
    0 0 0 1px rgba(255, 255, 255, 0.03) inset;
  backdrop-filter: blur(14px);
}

.performance__player {
  display: block;
  width: 100%;
  aspect-ratio: 854 / 480;
  overflow: hidden;
  background: #000;
  border: 0;
  border-radius: 14px;
}
</style>
