<script setup>
import ExternalLinkCard from '@/components/ExternalLinkCard.vue'

const links = [
  {
    title: 'Transcribe Website',
    url: 'https://tc.tstio.com',
    description: 'Transcribe, learn and being creative.',
  },
]
</script>

<template>
  <main class="links-page">
    <section class="links-shell" aria-label="External links">
      <ExternalLinkCard
        v-for="link in links"
        :key="link.url"
        :title="link.title"
        :url="link.url"
        :description="link.description"
      />
    </section>
  </main>
</template>

<style scoped>
.links-page {
  display: grid;
  place-items: center;
  min-height: calc(100vh - 18rem);
  padding: clamp(2rem, 5vw, 5rem);
}

.links-shell {
  display: grid;
  width: min(100%, 1120px);
  gap: 1.5rem;
}

@media (max-width: 760px) {
  .links-page {
    padding: 1rem;
  }
}
</style>
