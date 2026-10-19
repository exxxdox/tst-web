<script setup>
import { nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import TheNavigation from '@/views/TheNavigation.vue'
import TheFooter from '@/components/TheFooter.vue'
import { Analytics } from '@vercel/analytics/vue'
import { SpeedInsights } from '@vercel/speed-insights/vue'
import { focusAfterRender } from '@/utils/focusAfterRender.js'

const route = useRoute()

function focusMainContent() {
  // Hash 路由会把普通锚点当成路由；直接聚焦可保留当前页面地址。
  document.getElementById('main-content')?.focus()
}

watch(
  () => route.fullPath,
  async () => {
    document.title = route.meta.title
    // 路由视图替换完成后聚焦新主内容，让键盘和屏幕阅读器收到换页反馈。
    await focusAfterRender(nextTick, focusMainContent)
  },
)
</script>

<template>
  <Analytics />
  <SpeedInsights />
  <a class="skip-link" href="#main-content" @click.prevent="focusMainContent">Skip to content</a>
  <TheNavigation></TheNavigation>
  <RouterView></RouterView>
  <TheFooter v-if="$route.name !== 'Home'"></TheFooter>
</template>

<style scoped>
.skip-link {
  position: fixed;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 200;
  padding: 0.65rem 0.85rem;
  color: #06111f;
  background: var(--color-accent-warm);
  border-radius: 6px;
  transform: translateY(calc(-100% - 1rem));
}

.skip-link:focus {
  transform: translateY(0);
}
</style>
