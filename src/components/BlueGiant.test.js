import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const source = await readFile(new URL('./BlueGiant.vue', import.meta.url), 'utf8')

test('animation prefetches the next frame and follows reduced-motion changes', () => {
  assert.match(source, /for \(let k = 0; k < PREFETCH_AHEAD; k \+= 1\)/)
  assert.match(source, /addEventListener\('change', handleMotionPreferenceChange\)/)
  assert.match(source, /removeEventListener\('change', handleMotionPreferenceChange\)/)
  assert.match(source, /cancelAnimationFrame\(frameId\)/)
})
