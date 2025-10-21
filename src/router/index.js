import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Home', component: () => import('@/views/Home.vue') },
  { path: '/performance', name: 'Performance', component: () => import('@/views/Performance.vue') },
]
const router = createRouter({
  history: createWebHashHistory(),
  routes,
  // linkActiveClass: "vue-school-active-link",
  scrollBehavior(to, from, savedPosition) {
    // return desired position
    if (savedPosition) {
      return savedPosition
    } else {
      return new Promise((resolve) => {
        setTimeout(() => resolve({ top: 0, left: 0, behavior: 'smooth' }), 300)
      })
    }
  },
})
// global navigation guard 全局导航守卫
// 会继承父路由的meta信息
// router.beforeEach((to, from) => {
//   if (to.meta.requiresAuth && !window.user) {
//     // need to login if note already logged in
//     return { name: "login", query: { redirect: to.fullPath } };
//   }
// });

// 添加路由导航守卫用于调试
// router.beforeEach((to, from, next) => {
//   console.log('路由跳转:', from.path, '->', to.path)
//   next()
// })

export default router
