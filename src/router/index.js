import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/views/Home.vue'

const routes = [
  // 首屏路由静态导入：避免 entry → Home chunk → Home CSS 的串行发现链，优先 LCP。
  // 三页已合并为单页，Performance / Links 作为页内区块由滚动呈现。
  { path: '/', name: 'Home', component: Home, meta: { title: 'Website of TST | Rory' } },
  // 旧地址保留为重定向，外部书签仍能落到对应区块。
  { path: '/performance', redirect: { name: 'Home', hash: '#performance' } },
  { path: '/links', redirect: { name: 'Home', hash: '#links' } },
  { path: '/:pathMatch(.*)*', redirect: { name: 'Home' } },
]
const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    // 页内锚点平滑滚动，并把区块顶部落到固定导航下方。
    if (to.hash) {
      // 用 id 查找而不是 querySelector：任意 hash 都不会触发非法选择器异常。
      const target = document.getElementById(to.hash.slice(1))
      const navHeight = document.querySelector('.nav-container')?.offsetHeight ?? 0
      // 显式扣掉固定导航：Vue Router 不会读取 scroll-margin-top。
      return {
        top: target ? target.getBoundingClientRect().top + window.scrollY - navHeight : 0,
        behavior: 'smooth',
      }
    }
    return savedPosition ?? { top: 0, left: 0 }
  },
})

export default router
