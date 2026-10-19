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

test('installPreloadRecovery does not block startup when storage is unavailable', () => {
  let listeners = 0
  const browserWindow = {
    addEventListener() {
      listeners += 1
    },
    get sessionStorage() {
      throw new DOMException('Blocked', 'SecurityError')
    },
  }

  assert.doesNotThrow(() => installPreloadRecovery({}, browserWindow))
  assert.equal(listeners, 0)
})

test('installPreloadRecovery preserves the original error when storage methods fail', () => {
  for (const failedMethod of ['getItem', 'setItem']) {
    let preloadError
    let prevented = 0
    let reloads = 0
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
        getItem() {
          if (failedMethod === 'getItem') throw new DOMException('Blocked', 'SecurityError')
          return null
        },
        removeItem() {},
        setItem() {
          if (failedMethod === 'setItem') throw new DOMException('Blocked', 'SecurityError')
        },
      },
    }
    const router = { afterEach() {} }

    installPreloadRecovery(router, browserWindow)
    preloadError({
      preventDefault() {
        prevented += 1
      },
    })

    assert.equal(prevented, 0, `${failedMethod} failure must remain visible`)
    assert.equal(reloads, 0, `${failedMethod} failure must not reload`)
  }
})

test('installPreloadRecovery does not turn guard cleanup failure into navigation failure', () => {
  let afterEach
  const browserWindow = {
    addEventListener() {},
    location: { reload() {} },
    sessionStorage: {
      getItem() {
        return null
      },
      removeItem() {
        throw new DOMException('Blocked', 'SecurityError')
      },
      setItem() {},
    },
  }
  const router = {
    afterEach(listener) {
      afterEach = listener
    },
  }

  installPreloadRecovery(router, browserWindow)
  assert.doesNotThrow(() => afterEach(null, null))
})
