import assert from 'node:assert/strict'
import test from 'node:test'

import { focusAfterRender } from './focusAfterRender.js'

test('focusAfterRender waits for the replacement view before focusing it', async () => {
  const calls = []
  const target = { focus: () => calls.push('focus') }

  await focusAfterRender(
    async () => calls.push('render'),
    () => target,
  )

  assert.deepEqual(calls, ['render', 'focus'])
})

test('focusAfterRender tolerates a missing target', async () => {
  await assert.doesNotReject(() =>
    focusAfterRender(
      async () => {},
      () => null,
    ),
  )
})
