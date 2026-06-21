<script setup>
import { ref } from 'vue'
import SignalStrip from '@/components/SignalStrip.vue'

const bilibiliPlayerUrl =
  'https://player.bilibili.com/player.html?bvid=BV1yCXAYRECD&page=1&high_quality=1&danmaku=0'

const isPlaying = ref(false)
</script>

<template>
  <main class="performance-page">
    <section class="performance container" aria-labelledby="performance-title">
      <div class="performance__copy">
        <p class="kicker">Live take / guitar cover</p>
        <h1 id="performance-title">My Favourite Things</h1>
        <p class="performance__meta">Jonathan Kreisberg · covered by TST</p>
        <SignalStrip input="Take 01" output="Video" />
      </div>

      <div class="stage-frame" aria-label="Performance video player">
        <div class="stage-frame__status" aria-hidden="true">
          <span><i></i> Input armed</span>
          <span>48 kHz / live take</span>
        </div>
        <button
          v-if="!isPlaying"
          class="performance-poster"
          type="button"
          aria-label="Play My Favourite Things performance"
          @click="isPlaying = true"
        >
          <img src="/anime-jazz-guitar-cover.png" alt="" />
          <span class="performance-poster__copy">
            <span class="performance-poster__play" aria-hidden="true">▶</span>
            <span>
              <strong>Play live take</strong>
              <small>My Favourite Things · TST</small>
            </span>
          </span>
        </button>
        <iframe
          v-else
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
  min-height: calc(100vh - var(--nav-height) - var(--footer-height));
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

.performance__copy h1 {
  text-wrap: balance;
}

.performance__meta {
  color: rgba(222, 255, 238, 0.82);
  font-size: clamp(1.05rem, 2vw, 1.3rem);
  font-weight: 750;
}

.stage-frame {
  width: min(100%, var(--stage-max));
  padding: clamp(0.55rem, 1.8vw, 1rem);
  overflow: hidden;
  background: #091d2e;
  border: 1px solid rgba(61, 255, 141, 0.22);
  border-radius: 10px;
  box-shadow:
    0 28px 70px rgba(0, 8, 20, 0.38),
    0 1px 0 rgba(255, 255, 255, 0.05) inset;
}

.stage-frame__status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0 0.25rem 0.7rem;
  color: rgba(178, 218, 204, 0.66);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.stage-frame__status span:first-child {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.stage-frame__status i {
  width: 0.48rem;
  height: 0.48rem;
  background: var(--color-accent-warm);
  border-radius: 50%;
  box-shadow: 0 0 0.55rem rgba(255, 179, 71, 0.48);
}

.performance-poster {
  position: relative;
  display: grid;
  width: 100%;
  aspect-ratio: 854 / 480;
  place-items: center;
  overflow: hidden;
  padding: 0;
  color: var(--color-heading);
  background:
    linear-gradient(90deg, rgba(2, 13, 24, 0.92), rgba(2, 13, 24, 0.26)),
    #020d18;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
}

.performance-poster::after {
  position: absolute;
  inset: 0;
  content: '';
  background: repeating-linear-gradient(
    180deg,
    transparent 0 5px,
    rgba(61, 255, 141, 0.035) 5px 6px
  );
  pointer-events: none;
}

.performance-poster img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  opacity: 0.72;
  filter: saturate(0.72) contrast(1.2);
  transition: opacity 0.28s ease, transform 0.28s ease;
}

.performance-poster__copy {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-self: start;
  gap: 1rem;
  padding: clamp(1.2rem, 4vw, 3rem);
  text-align: left;
}

.performance-poster__copy > span:last-child {
  display: grid;
  gap: 0.25rem;
}

.performance-poster__copy strong {
  font-size: clamp(1.15rem, 2.5vw, 1.75rem);
  font-weight: 850;
}

.performance-poster__copy small {
  color: rgba(178, 218, 204, 0.72);
  font-size: clamp(0.78rem, 1.4vw, 0.95rem);
  font-weight: 700;
}

.performance-poster__play {
  display: grid;
  width: clamp(3rem, 7vw, 4.6rem);
  aspect-ratio: 1;
  place-items: center;
  padding-left: 0.18em;
  color: #06111f;
  background: var(--color-accent);
  border: 1px solid rgba(222, 255, 238, 0.44);
  border-radius: 8px;
  box-shadow: 0 0 1.8rem rgba(61, 255, 141, 0.2);
}

.performance-poster:hover img {
  opacity: 0.82;
  transform: scale(1.025);
}

.performance__player {
  display: block;
  width: 100%;
  aspect-ratio: 854 / 480;
  overflow: hidden;
  background: #000;
  border: 0;
  border-radius: 6px;
}

@media (max-width: 540px) {
  .stage-frame__status span:last-child {
    display: none;
  }

}
</style>
