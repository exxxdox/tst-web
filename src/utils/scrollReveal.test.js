import assert from 'node:assert/strict'
import test from 'node:test'

import { observeReveal } from './scrollReveal.js'

class FakeObserver {
  static instances = []

  constructor(callback, options) {
    this.callback = callback
    this.options = options
    this.observed = []
    this.unobserved = []
    this.disconnected = false
    FakeObserver.instances.push(this)
  }

  observe(element) {
    this.observed.push(element)
  }

  unobserve(element) {
    this.unobserved.push(element)
  }

  disconnect() {
    this.disconnected = true
  }
}

test('reveals each element once and stops observing it', () => {
  FakeObserver.instances = []
  const revealed = []
  const first = { id: 'performance' }
  const second = { id: 'links' }

  const disconnect = observeReveal(
    [first, second],
    (element) => revealed.push(element),
    FakeObserver,
  )
  const observer = FakeObserver.instances[0]

  assert.deepEqual(observer.observed, [first, second])

  observer.callback([{ target: first, isIntersecting: true }])
  observer.callback([{ target: first, isIntersecting: true }])
  observer.callback([{ target: second, isIntersecting: false }])

  assert.deepEqual(revealed, [first])
  assert.deepEqual(observer.unobserved, [first])

  disconnect()
  assert.equal(observer.disconnected, true)
})

test('reveals everything immediately when IntersectionObserver is unavailable', () => {
  const revealed = []
  const disconnect = observeReveal(['a', 'b'], (element) => revealed.push(element), null)

  assert.deepEqual(revealed, ['a', 'b'])
  assert.equal(typeof disconnect, 'function')
  disconnect()
})
