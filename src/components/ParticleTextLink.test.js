import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const source = await readFile(new URL('./ParticleTextLink.vue', import.meta.url), 'utf8')

test('particle link samples its real label and keeps the semantic fallback', () => {
  assert.match(source, /document\.fonts\?\.ready/)
  assert.match(source, /sample\.fillText\(props\.text/)
  assert.match(source, /sample\.getImageData/)
  assert.match(source, /alphaTotal \+= alpha/)
  assert.match(source, /weightedX \/ alphaTotal/)
  assert.match(source, /<span ref="label"[\s\S]*?\{\{ text \}\}/)
  assert.match(source, /<canvas ref="canvas"[\s\S]*?aria-hidden="true"/)
  assert.match(source, /is-ready[\s\S]*?color: transparent/)
})

test('particle link scatters and returns while respecting reduced motion', () => {
  assert.match(source, /const CYCLE_DURATION = 680/)
  assert.match(source, /function particleBurst\(progress, timing\)/)
  assert.match(source, /const peak = 0\.16 \+ timing \* 0\.12/)
  assert.match(source, /timing: Math\.random\(\)/)
  assert.match(source, /const scatterRadiusX = window\.innerWidth \* 0\.25/)
  assert.match(source, /const scatterRadiusY = window\.innerHeight \* 0\.25/)
  assert.match(source, /scatterX: pointX \+ Math\.cos\(angle\) \* scatterRadiusX \* distance/)
  assert.match(source, /scatterY: pointY \+ Math\.sin\(angle\) \* scatterRadiusY \* distance/)
  assert.match(source, /pointerCyclePlayed = true/)
  assert.doesNotMatch(source, /cycleStartedAt = now/)
  assert.match(source, /prefers-reduced-motion: reduce/)
  assert.match(source, /ResizeObserver\(scheduleBuildParticles\)/)
  assert.match(source, /window\.addEventListener\('resize', scheduleBuildParticles\)/)
  assert.match(source, /drawLayer\(shadow\.green/)
  assert.match(source, /context\.shadowBlur = shadow\.blur/)
})
