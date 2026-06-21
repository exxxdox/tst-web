<script setup>
import TheNavigation from '@/views/TheNavigation.vue'
import TheFooter from '@/components/TheFooter.vue'
</script>

<template>
  <TheNavigation></TheNavigation>
  <RouterView></RouterView>
  <TheFooter v-if="$route.name !== 'Home'"></TheFooter>
</template>

<style scoped></style>
