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
  assert.match(source, /hash: '#performance'[^>]*>\s*Music\s*<\/AppLink>/)
  assert.match(source, /hash: '#links'[^>]*>\s*Code\s*<\/AppLink>/)
  assert.doesNotMatch(source, /Watch performance|Explore instruments|hero__action/)
})
