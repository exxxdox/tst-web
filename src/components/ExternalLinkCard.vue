<script setup>
import { ref } from 'vue'

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
const hasPreview = ref(true)
const previewUrl = `https://api.microlink.io/?url=${encodeURIComponent(
  props.url,
)}&screenshot=true&meta=false&embed=screenshot.url`
</script>

<template>
  <a class="link-card" :href="url" target="_blank" rel="noopener noreferrer">
    <span class="preview-wrap">
      <img
        v-if="hasPreview"
        class="preview"
        :src="previewUrl"
        :alt="`${title} preview`"
        @error="hasPreview = false"
      />
      <span v-else class="preview-fallback" aria-hidden="true">TST</span>
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
  color: var(--color-heading);
  background:
    linear-gradient(135deg, rgba(61, 255, 141, 0.1), rgba(255, 179, 71, 0.06)),
    var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  box-shadow: 0 18px 50px rgba(0, 12, 24, 0.36);
  backdrop-filter: blur(14px);
}

.link-card::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(90deg, transparent, rgba(255, 179, 71, 0.1), transparent);
  opacity: 0;
  transition: opacity 0.28s ease;
}

.link-card:hover {
  color: var(--color-heading);
  border-color: var(--color-border-hover);
  transform: translateY(-2px);
}

.link-card:hover::before {
  opacity: 1;
}

.preview-wrap {
  display: grid;
  place-items: center;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background:
    repeating-linear-gradient(
      90deg,
      rgba(61, 255, 141, 0.1) 0 0.5rem,
      transparent 0.5rem 0.9rem
    ),
    linear-gradient(135deg, rgba(255, 179, 71, 0.14), transparent),
    var(--color-background-mute);
  border: 1px solid rgba(61, 255, 141, 0.1);
  border-radius: 14px;
}

.preview,
.preview-fallback {
  display: block;
  width: 100%;
  height: 100%;
}

.preview {
  object-fit: cover;
}

.preview-fallback {
  display: grid;
  place-items: center;
  color: rgba(222, 255, 238, 0.82);
  font-family: var(--font-display);
  font-size: clamp(2rem, 8vw, 4.5rem);
  line-height: 1;
  text-shadow:
    0.08em 0.08em 0 rgba(61, 255, 141, 0.4),
    -0.04em -0.04em 0 rgba(255, 179, 71, 0.38);
}

.link-content {
  display: grid;
  gap: 0.35rem;
  min-width: 0;
}

.host {
  color: rgba(255, 179, 71, 0.76);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.title {
  color: var(--color-heading);
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 850;
  letter-spacing: -0.06em;
  line-height: 1;
  white-space: nowrap;
}

.description {
  color: var(--color-text);
  font-size: 1rem;
  font-weight: 650;
}

.visit {
  align-self: end;
  padding: 0.6rem 0.85rem;
  color: #06111f;
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent-warm));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 900;
}

@media (max-width: 760px) {
  .link-card {
    grid-template-columns: minmax(0, 1fr);
    min-width: 0;
    min-height: 0;
  }

  .link-content {
    min-width: 0;
  }

  .title {
    font-size: clamp(1.25rem, 6vw, 2rem);
    line-height: 1.15;
    white-space: normal;
    overflow-wrap: anywhere;
    word-break: break-word;
  }

  .visit {
    justify-self: start;
  }
}
</style>
