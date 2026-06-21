<script setup>
defineProps({
  input: {
    type: String,
    required: true,
  },
  output: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="signal-strip" role="img" :aria-label="`${input} signal routed to ${output}`">
    <span class="signal-strip__label">{{ input }}</span>
    <span class="signal-strip__meter" aria-hidden="true">
      <i v-for="index in 10" :key="index"></i>
    </span>
    <span class="signal-strip__label signal-strip__label--output">{{ output }}</span>
  </div>
</template>

<style scoped>
.signal-strip {
  display: grid;
  grid-template-columns: auto minmax(7rem, 14rem) auto;
  align-items: center;
  width: fit-content;
  max-width: 100%;
  gap: 0.65rem;
  padding: 0.55rem 0.65rem;
  color: rgba(222, 255, 238, 0.72);
  background: rgba(2, 13, 24, 0.72);
  border: 1px solid rgba(61, 255, 141, 0.2);
  border-radius: 6px;
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.04) inset;
}

.signal-strip__label {
  font-size: 0.66rem;
  font-weight: 850;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  white-space: nowrap;
}

.signal-strip__label--output {
  color: var(--color-accent-warm);
}

.signal-strip__meter {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 0.22rem;
}

.signal-strip__meter i {
  display: block;
  width: 100%;
  height: 0.48rem;
  background: var(--color-accent);
  box-shadow: 0 0 0.55rem rgba(61, 255, 141, 0.24);
}

.signal-strip__meter i:nth-child(4n) {
  background: var(--color-accent-warm);
  box-shadow: 0 0 0.55rem rgba(255, 179, 71, 0.22);
}

@media (max-width: 420px) {
  .signal-strip {
    grid-template-columns: auto minmax(5rem, 1fr) auto;
    width: 100%;
  }
}
</style>
