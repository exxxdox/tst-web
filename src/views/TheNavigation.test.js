import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const source = await readFile(new URL('./TheNavigation.vue', import.meta.url), 'utf8')

test('mobile drawer keeps its keyboard accessibility contract', () => {
  assert.match(source, /:inert="isOpen \? undefined : ''"/)
  assert.match(source, /\$refs\.drawerClose\?\.focus\(\)/)
  assert.match(source, /\$refs\.menuButton\?\.focus\(\)/)
  assert.match(source, /trapDrawerFocus\(e\)/)
})
