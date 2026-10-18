import assert from 'node:assert/strict'
import test from 'node:test'
import { getCycleIndex } from './particleCycle.js'

test('getCycleIndex stays on the first frame until the dwell time elapses', () => {
  assert.equal(getCycleIndex(0, 10, 4200), 0)
  assert.equal(getCycleIndex(4199, 10, 4200), 0)
})

test('getCycleIndex advances and wraps around the frame list', () => {
  assert.equal(getCycleIndex(4200, 10, 4200), 1)
  assert.equal(getCycleIndex(4200 * 9, 10, 4200), 9)
  assert.equal(getCycleIndex(4200 * 10, 10, 4200), 0)
})

test('getCycleIndex falls back to zero on invalid input', () => {
  assert.equal(getCycleIndex(-1, 10, 4200), 0)
  assert.equal(getCycleIndex(100, 0, 4200), 0)
  assert.equal(getCycleIndex(100, 10, 0), 0)
})
