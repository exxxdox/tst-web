/**
 * 等待视图完成替换后再移动焦点，避免目标节点尚未挂载。
 */
export async function focusAfterRender(afterRender, getTarget) {
  await afterRender()
  getTarget()?.focus()
}
