import assert from 'node:assert/strict'
import test from 'node:test'

import { anchorScrollPosition } from './anchorScroll.js'

test('anchorScrollPosition offsets the target by the sticky nav height', () => {
  assert.deepEqual(
    anchorScrollPosition({
      targetTop: 800,
      scrollY: 400,
      navHeight: 92,
      prefersReducedMotion: false,
    }),
    { top: 1108, behavior: 'smooth' },
  )
})

test('anchorScrollPosition returns to the top when the target is missing', () => {
  assert.deepEqual(
    anchorScrollPosition({
      targetTop: null,
      scrollY: 400,
      navHeight: 92,
      prefersReducedMotion: false,
    }),
    { top: 0, behavior: 'smooth' },
  )
})

test('anchorScrollPosition skips smooth scrolling under reduced motion', () => {
  assert.equal(
    anchorScrollPosition({
      targetTop: 800,
      scrollY: 400,
      navHeight: 92,
      prefersReducedMotion: true,
    }).behavior,
    'auto',
  )
})
