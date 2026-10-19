import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const source = await readFile(new URL('./Performance.vue', import.meta.url), 'utf8')

test('play button wires iframe replacement to post-render focus', () => {
  assert.match(source, /@click="play"/)
  assert.match(source, /await focusAfterRender\(nextTick, \(\) => player\.value\)/)
  assert.match(source, /ref="player"/)
})
