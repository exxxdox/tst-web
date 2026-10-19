/**
 * 观察一组元素，首次进入视口时回调并停止观察。
 * 没有 IntersectionObserver 的环境直接全部回调，避免内容永久停留在隐藏状态。
 *
 * @param {Iterable<Element>} elements
 * @param {(element: Element) => void} onReveal
 * @param {typeof IntersectionObserver | null} ObserverClass
 * @returns {() => void} 清理函数
 */
export function observeReveal(elements, onReveal, ObserverClass = globalThis.IntersectionObserver) {
  const targets = [...elements]

  if (!ObserverClass) {
    targets.forEach(onReveal)
    return () => {}
  }

  // 观察器取消订阅前的回调可能重复送达，用集合保证每个元素只进场一次。
  const revealed = new WeakSet()
  const observer = new ObserverClass(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || revealed.has(entry.target)) continue
        revealed.add(entry.target)
        onReveal(entry.target)
        observer.unobserve(entry.target)
      }
    },
    // 提前一点触发，留出过渡时间；阈值保证元素真正进入视口而不是擦边。
    { rootMargin: '0px 0px -12% 0px', threshold: 0.15 },
  )

  targets.forEach((element) => observer.observe(element))
  return () => observer.disconnect()
}
