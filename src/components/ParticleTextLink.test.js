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
  assert.match(source, /Math\.sin\(Math\.PI \* progress\)/)
  assert.match(source, /scatterX: pointX \+ Math\.cos\(angle\) \* distance/)
  assert.match(source, /pointerInside \|\| focused/)
  assert.match(source, /prefers-reduced-motion: reduce/)
  assert.match(source, /ResizeObserver\(buildParticles\)/)
  assert.match(source, /drawLayer\(shadow\.green/)
  assert.match(source, /context\.shadowBlur = shadow\.blur/)
})
