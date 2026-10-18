import assert from 'node:assert/strict'
import test from 'node:test'

import { getFocusLoopTarget } from './focusTrap.js'

test('getFocusLoopTarget keeps Tab focus inside the drawer', () => {
  const first = { name: 'first' }
  const middle = { name: 'middle' }
  const last = { name: 'last' }
  const container = { contains: (element) => [first, middle, last].includes(element) }

  assert.equal(getFocusLoopTarget({ activeElement: last, container, first, last }), first)
  assert.equal(
    getFocusLoopTarget({ activeElement: first, container, first, last, shiftKey: true }),
    last,
  )
  assert.equal(getFocusLoopTarget({ activeElement: middle, container, first, last }), null)
  assert.equal(getFocusLoopTarget({ activeElement: {}, container, first, last }), first)
  assert.equal(
    getFocusLoopTarget({ activeElement: {}, container, first, last, shiftKey: true }),
    last,
  )
})
