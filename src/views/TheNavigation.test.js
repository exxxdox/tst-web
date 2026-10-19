import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const source = await readFile(new URL('./TheNavigation.vue', import.meta.url), 'utf8')
const script = source
  .match(/<script>([\s\S]*?)<\/script>/)[1]
  .replace(
    "import { getFocusLoopTarget } from '@/utils/focusTrap.js'",
    'const getFocusLoopTarget = () => null',
  )
const { default: navigation } = await import(
  `data:text/javascript;base64,${Buffer.from(script).toString('base64')}`
)

function createNavigation(routeName) {
  const vm = {
    $nextTick(callback) {
      callback()
    },
    $refs: {
      desktopBrand: {
        $el: {
          focus() {
            vm.desktopFocusCount += 1
          },
        },
      },
      menuButton: {
        focus() {
          vm.focusCount += 1
        },
      },
    },
    $route: { name: routeName },
    desktopFocusCount: 0,
    focusCount: 0,
    isOpen: true,
  }
  vm.close = navigation.methods.close.bind(vm)
  vm.closeForRoute = navigation.methods.closeForRoute.bind(vm)
  return vm
}

test('mobile drawer keeps its keyboard accessibility contract', () => {
  assert.match(source, /:inert="isOpen \? undefined : ''"/)
  assert.match(source, /aria-label="Navigation menu"/)
  assert.match(source, /\$route\(\) \{[\s\S]*?close\(\{ restoreFocus: false \}\)/)
  assert.match(source, /\$refs\.drawerClose\?\.focus\(\)/)
  assert.match(source, /\$refs\.menuButton\?\.focus\(\)/)
  assert.match(source, /trapDrawerFocus\(e\)/)
})

test('same-route and desktop resize closures restore focus outside the inert drawer', () => {
  const sameRoute = createNavigation('Home')
  sameRoute.closeForRoute('Home')
  assert.equal(sameRoute.isOpen, false)
  assert.equal(sameRoute.focusCount, 1)

  const differentRoute = createNavigation('Home')
  differentRoute.closeForRoute('Links')
  assert.equal(differentRoute.focusCount, 0)

  const resized = createNavigation('Home')
  const originalWindow = globalThis.window
  globalThis.window = { innerWidth: 761 }
  try {
    navigation.methods.onResize.call(resized)
  } finally {
    globalThis.window = originalWindow
  }
  assert.equal(resized.isOpen, false)
  assert.equal(resized.focusCount, 0)
  assert.equal(resized.desktopFocusCount, 1)
})
