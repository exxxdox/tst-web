import assert from 'node:assert/strict'
import test from 'node:test'

import { parseHttpUrl } from './externalUrl.js'

test('parseHttpUrl accepts only absolute HTTP URLs', () => {
  assert.equal(parseHttpUrl('https://example.com/path')?.host, 'example.com')
  assert.equal(parseHttpUrl('HTTPS://EXAMPLE.COM/path')?.protocol, 'https:')
  assert.equal(parseHttpUrl('example.com'), null)
  assert.equal(parseHttpUrl('javascript:alert(1)'), null)
})
