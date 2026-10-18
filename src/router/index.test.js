import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const routerSource = await readFile(new URL('./index.js', import.meta.url), 'utf8')
const appSource = await readFile(new URL('../App.vue', import.meta.url), 'utf8')

test('route changes update the page title and focus the main content', () => {
  assert.match(routerSource, /meta: \{ title: 'Website of TST \| Rory' \}/)
  assert.match(routerSource, /meta: \{ title: 'Performance \| TST' \}/)
  assert.match(routerSource, /meta: \{ title: 'Links \| TST' \}/)
  assert.match(appSource, /document\.title = route\.meta\.title/)
  assert.match(appSource, /await nextTick\(\)/)
  assert.match(appSource, /focusMainContent\(\)/)
})
