import assert from 'node:assert/strict'
import test from 'node:test'
import { assignParticleTargets, findFirstAvailableFrame, getCycleIndex } from './particleCycle.js'

test('getCycleIndex stays on the first frame until the dwell time elapses', () => {
  assert.equal(getCycleIndex(0, 10, 2400), 0)
  assert.equal(getCycleIndex(2399, 10, 2400), 0)
})

test('getCycleIndex advances and wraps around the frame list', () => {
  assert.equal(getCycleIndex(2400, 10, 2400), 1)
  assert.equal(getCycleIndex(2400 * 9, 10, 2400), 9)
  assert.equal(getCycleIndex(2400 * 10, 10, 2400), 0)
})

test('getCycleIndex falls back to zero on invalid input', () => {
  assert.equal(getCycleIndex(-1, 10, 2400), 0)
  assert.equal(getCycleIndex(100, 0, 2400), 0)
  assert.equal(getCycleIndex(100, 10, 0), 0)
})

test('findFirstAvailableFrame skips failed frames', async () => {
  const requested = []
  const result = await findFirstAvailableFrame(['frame-0', 'frame-1', 'frame-2'], async (url) => {
    requested.push(url)
    return url === 'frame-1' ? { url } : null
  })

  assert.deepEqual(requested, ['frame-0', 'frame-1'])
  assert.deepEqual(result, { image: { url: 'frame-1' }, index: 1 })
})

test('assignParticleTargets pairs particles by spatial order and anchors surplus particles locally', () => {
  const pool = [
    { x: 900, y: 500, targetX: 0, targetY: 0, targetSize: 0, targetLevel: 0, active: true },
    { x: 100, y: 50, targetX: 0, targetY: 0, targetSize: 0, targetLevel: 0, active: true },
    { x: 400, y: 200, targetX: 0, targetY: 0, targetSize: 0, targetLevel: 0, active: true },
    { x: 420, y: 200, targetX: 0, targetY: 0, targetSize: 0, targetLevel: 0, active: true },
  ]
  const targets = [
    { x: 120, y: 60, size: 2, level: 0.5 },
    { x: 880, y: 480, size: 3, level: 0.9 },
  ]

  assignParticleTargets(pool, targets, (t) => ({ ...t }), 1280)

  // Pool is sorted top-to-bottom so top particles stay at the top target instead of crossing the canvas
  assert.equal(pool[0].targetX, 120)
  assert.equal(pool[0].active, true)
  assert.equal(pool[1].targetX, 120)
  assert.equal(pool[1].active, false)
  assert.equal(pool[2].targetX, 880)
  assert.equal(pool[2].active, true)
  assert.equal(pool[3].targetX, 880)
  assert.equal(pool[3].active, false)
})

test('assignParticleTargets grows the pool evenly when target count exceeds pool length', () => {
  const pool = []
  const targets = [
    { x: 10, y: 10, size: 2, level: 0.4 },
    { x: 20, y: 20, size: 2.5, level: 0.6 },
    { x: 30, y: 30, size: 3, level: 0.8 },
  ]

  assignParticleTargets(
    pool,
    targets,
    (t) => ({
      x: t.x,
      y: t.y,
      targetX: t.x,
      targetY: t.y,
      targetSize: t.size,
      targetLevel: t.level,
      active: true,
    }),
    1280,
  )

  assert.equal(pool.length, 3)
  assert.deepEqual(
    pool.map((p) => p.targetX),
    [10, 20, 30],
  )
  assert.equal(
    pool.every((p) => p.active),
    true,
  )
})
