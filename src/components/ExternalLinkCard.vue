<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
})

const host = new URL(props.url).host
const previewUrl = `https://api.microlink.io/?url=${encodeURIComponent(
  props.url,
)}&screenshot=true&meta=false&embed=screenshot.url`
</script>

<template>
  <a class="link-card" :href="url" target="_blank" rel="noopener noreferrer">
    <span class="preview-wrap">
      <img class="preview" :src="previewUrl" :alt="`${title} preview`" />
    </span>

    <span class="link-content">
      <span class="host">{{ host }}</span>
      <span class="title">{{ title }}</span>
      <span v-if="description" class="description">{{ description }}</span>
    </span>

    <span class="visit" aria-hidden="true">Open</span>
  </a>
</template>

<style scoped>
.link-card {
  display: grid;
  grid-template-columns: minmax(180px, 320px) minmax(0, 1fr) auto;
  align-items: center;
  gap: clamp(1rem, 3vw, 2rem);
  min-height: 190px;
  padding: 1rem;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.9);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.04)), #151515;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 8px;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.34);
}

.link-card:hover {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.35);
  transform: translateY(-2px);
}

.preview-wrap {
  display: block;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.16), transparent), #242424;
  border-radius: 6px;
}

.preview {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.link-content {
  display: grid;
  gap: 0.35rem;
  min-width: 0;
}

.host {
  color: rgba(255, 255, 255, 0.52);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.title {
  color: #fff;
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 800;
  line-height: 1;
  white-space: nowrap;
}

.description {
  color: rgba(255, 255, 255, 0.64);
  font-size: 1rem;
  font-weight: 600;
}

.visit {
  align-self: end;
  padding: 0.6rem 0.85rem;
  color: #111;
  background: #fff;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 800;
}

@media (max-width: 760px) {
  .link-card {
    grid-template-columns: 1fr;
    min-height: 0;
  }

  .visit {
    justify-self: start;
  }
}
</style>
