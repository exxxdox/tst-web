import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const source = await readFile(new URL('./BlueGiant.vue', import.meta.url), 'utf8')

test('component wires reduced-motion changes to symmetric animation cleanup', () => {
  assert.match(source, /addEventListener\('change', handleMotionPreferenceChange\)/)
  assert.match(source, /removeEventListener\('change', handleMotionPreferenceChange\)/)
  assert.match(source, /cancelAnimationFrame\(frameId\)/)
})
