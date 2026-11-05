import test from 'node:test'
import assert from 'node:assert/strict'

/**
 * client.js is a browser bundle: it hands its factory to window.__ModuleLoader__
 * and only touches the DOM when it renders. Stubbing those seams lets the pure
 * ordering, filtering, and copy helpers run under node.
 */
const captured = []
globalThis.window = { __ModuleLoader__: { load: (entry) => captured.push(entry) } }

await import('../lib/client.js')
assert.equal(captured.length, 1, 'bundle registers exactly one factory')

const React = {
  createElement: () => null,
  Component: class {
    constructor(props) {
      this.props = props
      this.state = {}
    }
  }
}
const mod = captured[0].factory((id) => {
  if (id === 'react') return React
  if (id === 'react-dom') return { createPortal: (node) => node }
  return {
    useAnchoredPosition: () => null,
    useDismissOnOutsidePointer: () => {},
    IconBranchOutline16: () => null,
    IconCheckOutline14: () => null,
    IconChevronDownOutline14: () => null,
    Tooltip: ({ children }) => children
  }
})
const {
  parseTrack,
  sortBranches,
  filterBranches,
  trackText,
  shortHead,
  branchLabel,
  changeText,
  operationText,
  errorMessage
} = mod.__internals

const known = new Set([
  'clean', 'dirty', 'dirtyOne', 'unborn', 'unknown',
  'operation.merge', 'operation.rebase', 'operation.cherry-pick', 'operation.revert', 'operation.bisect',
  'error.dirty-conflict', 'error.operation-in-progress', 'error.switch-failed'
])
const tr = (key, values) => {
  if (!known.has(key)) return key
  return key === 'dirty' && values !== undefined ? key + JSON.stringify(values) : key
}

test('parseTrack decodes the host track string', () => {
  assert.deepEqual(parseTrack('[ahead 3, behind 1]'), { ahead: 3, behind: 1, gone: false })
  assert.deepEqual(parseTrack('[gone]'), { ahead: 0, behind: 0, gone: true })
  assert.deepEqual(parseTrack(undefined), { ahead: 0, behind: 0, gone: false })
})

test('sortBranches keeps the current branch first, then newest commit', () => {
  const sorted = sortBranches([
    { name: 'old', current: false, commit: '2026-01-01T00:00:00.000Z' },
    { name: 'new', current: false, commit: '2026-05-01T00:00:00.000Z' },
    { name: 'main', current: true, commit: '2025-01-01T00:00:00.000Z' }
  ])
  assert.deepEqual(sorted.map((branch) => branch.name), ['main', 'new', 'old'])
})

test('filterBranches matches names and upstreams case-insensitively', () => {
  const branches = [
    { name: 'main', upstream: 'origin/main' },
    { name: 'Feature/Login', upstream: null },
    { name: 'fix', upstream: 'origin/release' }
  ]
  assert.deepEqual(filterBranches(branches, 'feat').map((branch) => branch.name), ['Feature/Login'])
  assert.deepEqual(filterBranches(branches, 'release').map((branch) => branch.name), ['fix'])
  assert.equal(filterBranches(branches, '  ').length, 3)
})

test('trackText uses compact arrows and marks a gone upstream', () => {
  assert.equal(trackText({ ahead: 2, behind: 0, gone: false }), '↑2')
  assert.equal(trackText({ ahead: 0, behind: 3, gone: false }), '↓3')
  assert.equal(trackText({ ahead: 1, behind: 2, gone: false }), '↑1 ↓2')
  assert.equal(trackText({ ahead: 0, behind: 0, gone: true }), 'gone')
  assert.equal(trackText(undefined), '')
})

test('branchLabel explains detached and unborn states', () => {
  assert.equal(branchLabel({ branch: 'main', detached: false, unborn: false }, tr), 'main')
  assert.equal(branchLabel({ branch: null, detached: true, unborn: false, head: 'abcdef123' }, tr), 'HEAD@abcdef1')
  assert.equal(branchLabel({ branch: null, detached: false, unborn: true }, tr), 'unborn')
  assert.equal(branchLabel({ branch: '', detached: false, unborn: false }, tr), 'unknown')
})

test('shortHead never invents a hash', () => {
  assert.equal(shortHead('0123456789abcdef'), '0123456')
  assert.equal(shortHead(undefined), '')
})

test('changeText distinguishes clean, one change, and many changes', () => {
  assert.equal(changeText(0, tr), 'clean')
  assert.equal(changeText(1, tr), 'dirtyOne')
  assert.equal(changeText(4, tr), 'dirty' + JSON.stringify({ count: 4 }))
})

test('operationText translates known markers and preserves unknown ones', () => {
  assert.equal(operationText('rebase', tr), 'operation.rebase')
  assert.equal(operationText('odd-state', tr), 'odd-state')
  assert.equal(operationText(null, tr), '')
})

test('errorMessage localizes known codes and falls back to the generic copy', () => {
  assert.equal(errorMessage({ code: 'dirty-conflict' }, tr, null), 'error.dirty-conflict')
  assert.equal(errorMessage({ code: 'operation-in-progress' }, tr, 'merge'), 'error.operation-in-progress')
  assert.equal(errorMessage({ code: 'something-new' }, tr, null), 'error.switch-failed')
  assert.equal(errorMessage(undefined, tr, null), 'error.switch-failed')
})
