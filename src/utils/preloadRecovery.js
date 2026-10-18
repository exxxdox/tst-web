const preloadReloadKey = 'vite-preload-reload'

export function installPreloadRecovery(router, browserWindow = window) {
  let storage
  try {
    storage = browserWindow.sessionStorage
  } catch {
    // 隐私策略可能禁止 Web Storage；此时只放弃自动恢复，不能阻止应用挂载。
    return
  }

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
