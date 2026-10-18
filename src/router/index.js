import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Home', component: () => import('@/views/Home.vue') },
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
