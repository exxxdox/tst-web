<script setup>
import TheNavigation from '@/views/TheNavigation.vue'
import TheFooter from '@/components/TheFooter.vue'
import { Analytics } from '@vercel/analytics/vue'
import { SpeedInsights } from '@vercel/speed-insights/vue'
</script>

<template>
  <Analytics />
  <SpeedInsights />
  <TheNavigation></TheNavigation>
  <RouterView></RouterView>
  <TheFooter v-if="$route.name !== 'Home'"></TheFooter>
</template>

<style scoped></style>
