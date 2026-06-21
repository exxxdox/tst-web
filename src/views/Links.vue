<script setup>
import ExternalLinkCard from '@/components/ExternalLinkCard.vue'
import SignalStrip from '@/components/SignalStrip.vue'

const links = [
  {
    title: 'Transcribe Website',
    url: 'https://tc.tstio.com',
    description: 'Transcribe, learn, and stay creative.',
  },
]
</script>

<template>
  <main class="links-page">
    <section class="links-shell container" aria-labelledby="links-title">
      <div class="links-head">
        <p class="kicker">Outboard gear</p>
        <h1 id="links-title">Web instruments</h1>
        <p>
          A short patch bay for projects, profiles, and web tools that sit outside this little stage.
        </p>
        <SignalStrip input="Tool bus" output="Online" />
      </div>

      <div class="links-grid" aria-label="External links">
        <ExternalLinkCard
          v-for="link in links"
          :key="link.url"
          :title="link.title"
          :url="link.url"
          :description="link.description"
        />
      </div>
    </section>
  </main>
</template>

<style scoped>
.links-page {
  min-height: calc(100vh - var(--nav-height) - var(--footer-height));
  padding-block: clamp(2.5rem, 7vw, 6rem);
}

.links-shell {
  display: grid;
  gap: clamp(1.5rem, 4vw, 3rem);
}

.links-head {
  display: grid;
  gap: 0.85rem;
}

.links-head h1 {
  text-wrap: balance;
}

.links-head p:not(.kicker) {
  color: rgba(222, 255, 238, 0.8);
  font-weight: 650;
}

.links-grid {
  display: grid;
  width: min(100%, var(--stage-max));
  gap: 1.5rem;
}

@media (max-width: 760px) {
  .links-page {
    min-height: auto;
    padding-block: 2rem 4rem;
  }
}
</style>
