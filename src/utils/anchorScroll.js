/**
 * 计算页内锚点的目标位置。
 * 固定导航会盖住区块顶部，所以落点要减去导航高度；目标不存在时回到页首。
 * 减少动态偏好由调用方传入：CSS 的 scroll-behavior 覆盖不到 JS 返回的 behavior。
 */
export function anchorScrollPosition({ targetTop, scrollY, navHeight, prefersReducedMotion }) {
  return {
    top: targetTop === null ? 0 : targetTop + scrollY - navHeight,
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
  }
}
