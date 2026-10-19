import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const source = await readFile(new URL('./Home.vue', import.meta.url), 'utf8')

test('merged home renders Performance and Links as scroll-revealed sections', () => {
  assert.match(source, /import PerformanceSection from '@\/components\/PerformanceSection\.vue'/)
  assert.match(source, /import LinksSection from '@\/components\/LinksSection\.vue'/)
  assert.match(source, /id="performance" class="scene" data-reveal/)
  assert.match(source, /id="links" class="scene" data-reveal/)
  assert.match(source, /observeReveal\(targets,/)
  assert.match(source, /--scene-fade/)
  assert.match(source, /hash: '#performance'[\s\S]*?hero__mark-word">Music<\/span>/)
  assert.match(source, /hash: '#links'[\s\S]*?hero__mark-word">Code<\/span>/)
  assert.match(
    source,
    /Music<\/span>[\s\S]*?<br \/><span class="hero__mark-amp">&amp;<\/span><br \/><AppLink[\s\S]*?Code<\/span>/,
  )
  assert.doesNotMatch(source, /Watch performance|Explore instruments|hero__action/)
  assert.match(source, /@keyframes hero-word-disperse/)
  assert.match(source, /@keyframes hero-link-float/)
  assert.match(source, /\.hero__mark \{[\s\S]*?width: fit-content;[\s\S]*?text-align: center;/)
  assert.doesNotMatch(source, /hero-particle-scatter|--particle-color|clip-path|filter: blur/)
  assert.match(source, /prefers-reduced-motion[\s\S]*?\.hero__mark-link[\s\S]*?animation: none/)
})
