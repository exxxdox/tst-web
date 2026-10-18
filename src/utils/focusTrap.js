export function getFocusLoopTarget({ activeElement, container, first, last, shiftKey }) {
  if (!first || !last) return null
  if (!container.contains(activeElement)) return shiftKey ? last : first
  if (shiftKey && activeElement === first) return last
  if (!shiftKey && activeElement === last) return first
  return null
}
