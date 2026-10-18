import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const source = await readFile(new URL('./Performance.vue', import.meta.url), 'utf8')

test('video player receives focus after replacing the play button', () => {
  assert.match(source, /@click="play"/)
  assert.match(source, /await nextTick\(\)/)
  assert.match(source, /player\.value\?\.focus\(\)/)
  assert.match(source, /ref="player"/)
})
