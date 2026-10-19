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
    try {
      if (storage.getItem(preloadReloadKey)) {
        event.preventDefault()
        return
      }

      storage.setItem(preloadReloadKey, '1')
    } catch {
      // 存储失败时保留 Vite 原始错误，不能把未恢复的故障静默吞掉。
      return
    }

    event.preventDefault()
    browserWindow.location.reload()
  })

  router.afterEach((_to, _from, failure) => {
    if (!failure) {
      try {
        storage.removeItem(preloadReloadKey)
      } catch {
        // 清理失败不应把一次成功导航改成路由错误。
      }
    }
  })
}
