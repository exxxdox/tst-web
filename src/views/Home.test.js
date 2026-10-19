import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const source = await readFile(new URL('./Home.vue', import.meta.url), 'utf8')

test('merged home renders Performance and Links as scroll-revealed sections', () => {
  assert.match(source, /import PerformanceSection from '@\/components\/PerformanceSection\.vue'/)
  assert.match(source, /import LinksSection from '@\/components\/LinksSection\.vue'/)
  assert.match(source, /import ParticleTextLink from '@\/components\/ParticleTextLink\.vue'/)
  assert.match(source, /id="performance" class="scene" data-reveal/)
  assert.match(source, /id="links" class="scene" data-reveal/)
  assert.match(source, /observeReveal\(targets,/)
  assert.match(source, /--scene-fade/)
  assert.match(source, /text="Music"[\s\S]*?hash: '#performance'/)
  assert.match(source, /text="Code"[\s\S]*?hash: '#links'/)
  assert.match(
    source,
    /text="Music"[\s\S]*?<br \/><span class="hero__mark-amp">&amp;<\/span><br \/><ParticleTextLink[\s\S]*?text="Code"/,
  )
  assert.doesNotMatch(source, /Watch performance|Explore instruments|hero__action/)
  assert.match(source, /@keyframes hero-link-float/)
  assert.match(
    source,
    /\.hero-stage \{[\s\S]*?z-index: 21;[\s\S]*?overflow: clip;[\s\S]*?overflow-clip-margin: 30vmax;/,
  )
  assert.match(source, /@media \(max-width: 760px\)[\s\S]*?\.hero-stage \{[\s\S]*?z-index: 101;/)
  // 首屏层级高于导航，外壳必须让出指针，否则滚动后整块盖住 TST 品牌链接。
  assert.match(source, /\.hero-stage \{[\s\S]*?pointer-events: none;/)
  assert.match(source, /\.hero \{[\s\S]*?pointer-events: auto;/)
  assert.match(source, /\.hero__mark \{[\s\S]*?width: fit-content;[\s\S]*?text-align: center;/)
  assert.match(source, /prefers-reduced-motion[\s\S]*?\.hero__mark-link[\s\S]*?animation: none/)
})
