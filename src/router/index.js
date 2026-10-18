import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/views/Home.vue'

const routes = [
  // 首屏路由静态导入：避免 entry → Home chunk → Home CSS 的串行发现链，优先 LCP。
  { path: '/', name: 'Home', component: Home },
  { path: '/performance', name: 'Performance', component: () => import('@/views/Performance.vue') },
  { path: '/links', name: 'Links', component: () => import('@/views/Links.vue') },
  { path: '/:pathMatch(.*)*', redirect: { name: 'Home' } },
]
const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ?? { top: 0, left: 0 }
  },
})

export default router
