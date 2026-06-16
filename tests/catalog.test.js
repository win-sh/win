import test from 'node:test'
import assert from 'node:assert/strict'
import { loadCatalog } from '../src/catalog.js'
import { validateCatalog } from '../src/eval.js'

test('catalog loads loop packs from the loops directory', async () => {
  const catalog = await loadCatalog(new URL('../loops', import.meta.url))

  assert.ok(catalog.length >= 20)
  assert.ok(catalog.some(loop => loop.id === 'bug-autofix'))
  assert.ok(catalog.some(loop => loop.id === 'seo-growth'))
  assert.ok(catalog.every(loop => loop.loop.frontmatter.name === loop.id))
})

test('catalog eval requires LOOP.md, SKILL.md, and journal.md for every pack', async () => {
  const catalog = await loadCatalog(new URL('../loops', import.meta.url))
  const report = await validateCatalog(catalog)

  assert.equal(report.passed, true)
  assert.equal(report.failures.length, 0)
  assert.ok(report.loopCount >= 20)
})
