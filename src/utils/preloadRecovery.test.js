import assert from 'node:assert/strict'
import test from 'node:test'

import { installPreloadRecovery } from './preloadRecovery.js'

test('installPreloadRecovery reloads once and clears the guard after success', () => {
  const values = new Map()
  let preloadError
  let afterEach
  let reloads = 0
  let prevented = 0
  const browserWindow = {
    addEventListener(_name, listener) {
      preloadError = listener
    },
    location: {
      reload() {
        reloads += 1
      },
    },
    sessionStorage: {
      getItem(key) {
        return values.get(key) ?? null
      },
      removeItem(key) {
        values.delete(key)
      },
      setItem(key, value) {
        values.set(key, value)
      },
    },
  }
  const router = {
    afterEach(listener) {
      afterEach = listener
    },
  }
  const event = {
    preventDefault() {
      prevented += 1
    },
  }

  installPreloadRecovery(router, browserWindow)
  preloadError(event)
  preloadError(event)

  assert.equal(prevented, 2)
  assert.equal(reloads, 1)
  afterEach(null, null, new Error('failed navigation'))
  assert.equal(values.size, 1)
  afterEach(null, null)
  assert.equal(values.size, 0)
})
