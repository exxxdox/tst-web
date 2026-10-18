const preloadReloadKey = 'vite-preload-reload'

export function installPreloadRecovery(router, browserWindow = window) {
  const storage = browserWindow.sessionStorage

  // 新部署删除旧 chunk 时只刷新一次，避免旧页面永久白屏或循环刷新。
  browserWindow.addEventListener('vite:preloadError', (event) => {
    event.preventDefault()
    if (storage.getItem(preloadReloadKey)) return

    storage.setItem(preloadReloadKey, '1')
    browserWindow.location.reload()
  })

  router.afterEach((_to, _from, failure) => {
    if (!failure) storage.removeItem(preloadReloadKey)
  })
}
