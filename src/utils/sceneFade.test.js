import assert from 'node:assert/strict'
import test from 'node:test'

import { sceneFade } from './sceneFade.js'

test('sceneFade keeps the center opaque and fades toward the viewport edge', () => {
  const vh = 900

  assert.equal(sceneFade(0, vh), 1)
  assert.equal(sceneFade(vh * 0.35, vh), 1)
  assert.equal(sceneFade(vh * 0.55, vh), 0.5)
  assert.equal(sceneFade(vh * 0.75, vh), 0)
  assert.equal(sceneFade(vh * 2, vh), 0)
})

test('sceneFade falls back to visible when the viewport height is invalid', () => {
  assert.equal(sceneFade(100, 0), 1)
  assert.equal(sceneFade(100, -1), 1)
})
