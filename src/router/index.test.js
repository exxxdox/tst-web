import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const routerSource = await readFile(new URL('./index.js', import.meta.url), 'utf8')
const appSource = await readFile(new URL('../App.vue', import.meta.url), 'utf8')

test('merged routes keep old paths as section anchors and focus wiring stays intact', () => {
  assert.match(routerSource, /meta: \{ title: 'Website of TST \| Rory' \}/)
  assert.match(
    routerSource,
    /path: '\/performance', redirect: \{ name: 'Home', hash: '#performance' \}/,
  )
  assert.match(routerSource, /path: '\/links', redirect: \{ name: 'Home', hash: '#links' \}/)
  assert.match(routerSource, /scrollY - navHeight/)
  assert.match(routerSource, /behavior: 'smooth'/)
  assert.doesNotMatch(routerSource, /views\/Performance\.vue/)
  assert.doesNotMatch(routerSource, /views\/Links\.vue/)
  assert.match(appSource, /document\.title = route\.meta\.title/)
  assert.match(appSource, /await focusAfterRender\(nextTick, focusMainContent\)/)
})
