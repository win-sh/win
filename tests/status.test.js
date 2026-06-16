import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { installLoop, setLoopEnabled } from '../src/installer.js'
import { createLoopRun } from '../src/runner.js'
import { getInstalledLoopStatus, renderStatusTable } from '../src/status.js'

test('installed loop status table shows enabled state and countdown until next run', async () => {
  const target = await mkdtemp(join(tmpdir(), 'win-loops-status-'))

  try {
    await installLoop({
      loopId: 'bug-autofix',
      targetRepo: target,
      agent: 'codex',
      sourceRoot: new URL('..', import.meta.url)
    })

    await createLoopRun({
      loopId: 'bug-autofix',
      targetRepo: target,
      trigger: 'manual',
      signal: 'Production checkout error repeated 21 times.',
      now: new Date('2026-06-16T08:00:00.000Z')
    })

    const rows = await getInstalledLoopStatus({
      targetRepo: target,
      now: new Date('2026-06-16T09:30:00.000Z')
    })
    const table = renderStatusTable(rows)

    assert.equal(rows.length, 1)
    assert.equal(rows[0].id, 'bug-autofix')
    assert.equal(rows[0].enabled, true)
    assert.equal(rows[0].nextRunAt, '2026-06-16T14:00:00.000Z')
    assert.equal(rows[0].countdown, '4h 30m')
    assert.match(table, /Loop/)
    assert.match(table, /bug-autofix/)
    assert.match(table, /enabled/)
    assert.match(table, /4h 30m/)
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('setLoopEnabled toggles installed loop state', async () => {
  const target = await mkdtemp(join(tmpdir(), 'win-loops-enable-'))

  try {
    await installLoop({
      loopId: 'seo-growth',
      targetRepo: target,
      agent: 'codex',
      sourceRoot: new URL('..', import.meta.url)
    })

    await setLoopEnabled({ loopId: 'seo-growth', targetRepo: target, enabled: false })
    const state = JSON.parse(await readFile(join(target, '.win', 'loops', 'seo-growth', 'state.json'), 'utf8'))
    assert.equal(state.enabled, false)

    await setLoopEnabled({ loopId: 'seo-growth', targetRepo: target, enabled: true })
    const nextState = JSON.parse(await readFile(join(target, '.win', 'loops', 'seo-growth', 'state.json'), 'utf8'))
    assert.equal(nextState.enabled, true)
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})
