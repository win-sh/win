import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { installLoop, setLoopEnabled } from '../src/installer.js'
import { approveApproval, rejectApproval, requestApproval } from '../src/reporting.js'
import { createLoopRun } from '../src/runner.js'
import { tickLoops, renderTickTable } from '../src/tick.js'

test('tickLoops creates runs for enabled due loops and skips disabled loops', async () => {
  const target = await mkdtemp(join(tmpdir(), 'win-loops-tick-'))

  try {
    await installLoop({
      loopId: 'bug-autofix',
      targetRepo: target,
      agent: 'codex',
      sourceRoot: new URL('..', import.meta.url)
    })
    await installLoop({
      loopId: 'seo-growth',
      targetRepo: target,
      agent: 'codex',
      sourceRoot: new URL('..', import.meta.url)
    })
    await installLoop({
      loopId: 'feedback-to-fix',
      targetRepo: target,
      agent: 'codex',
      sourceRoot: new URL('..', import.meta.url)
    })

    await createLoopRun({
      loopId: 'bug-autofix',
      targetRepo: target,
      trigger: 'manual',
      signal: 'Old bug signal.',
      now: new Date('2026-06-16T08:00:00.000Z')
    })
    await createLoopRun({
      loopId: 'seo-growth',
      targetRepo: target,
      trigger: 'manual',
      signal: 'Fresh SEO signal.',
      now: new Date('2026-06-16T13:30:00.000Z')
    })
    await setLoopEnabled({ loopId: 'feedback-to-fix', targetRepo: target, enabled: false })

    const report = await tickLoops({
      targetRepo: target,
      now: new Date('2026-06-16T14:01:00.000Z')
    })

    assert.equal(report.rows.length, 3)
    assert.equal(report.rows.find(row => row.loopId === 'bug-autofix').action, 'ran')
    assert.equal(report.rows.find(row => row.loopId === 'seo-growth').action, 'waiting')
    assert.equal(report.rows.find(row => row.loopId === 'feedback-to-fix').action, 'disabled')

    const runs = await readFile(join(target, '.win', 'state', 'runs.jsonl'), 'utf8')
    const bugRuns = runs.split('\n').filter(line => line.includes('"loopId":"bug-autofix"'))
    assert.equal(bugRuns.length, 2)

    const table = renderTickTable(report.rows)
    assert.match(table, /bug-autofix/)
    assert.match(table, /ran/)
    assert.match(table, /feedback-to-fix/)
    assert.match(table, /disabled/)
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('tickLoops runs a newly installed enabled loop with no prior run', async () => {
  const target = await mkdtemp(join(tmpdir(), 'win-loops-tick-new-'))

  try {
    await installLoop({
      loopId: 'bug-autofix',
      targetRepo: target,
      agent: 'codex',
      sourceRoot: new URL('..', import.meta.url)
    })

    const report = await tickLoops({
      targetRepo: target,
      now: new Date('2026-06-16T08:00:00.000Z')
    })

    assert.equal(report.rows[0].action, 'ran')
    assert.match(report.rows[0].reason, /first run/)
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('tickLoops respects explicit future state nextRunAt', async () => {
  const target = await mkdtemp(join(tmpdir(), 'win-loops-tick-future-'))

  try {
    await installLoop({
      loopId: 'bug-autofix',
      targetRepo: target,
      agent: 'codex',
      sourceRoot: new URL('..', import.meta.url)
    })

    const statePath = join(target, '.win', 'loops', 'bug-autofix', 'state.json')
    const state = JSON.parse(await readFile(statePath, 'utf8'))
    state.nextRunAt = '2026-06-16T12:00:00.000Z'
    await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8')

    const report = await tickLoops({
      targetRepo: target,
      now: new Date('2026-06-16T08:00:00.000Z')
    })

    assert.equal(report.rows[0].action, 'waiting')
    assert.equal(report.rows[0].nextRunAt, '2026-06-16T12:00:00.000Z')
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('tickLoops resumes an approved approval before the scheduled next run', async () => {
  const target = await mkdtemp(join(tmpdir(), 'win-loops-tick-approved-'))

  try {
    await installLoop({
      loopId: 'bug-autofix',
      targetRepo: target,
      agent: 'codex',
      sourceRoot: new URL('..', import.meta.url)
    })

    const run = await createLoopRun({
      loopId: 'bug-autofix',
      targetRepo: target,
      trigger: 'manual',
      signal: 'Checkout crash repeated 21 times.',
      now: new Date('2026-06-16T08:00:00.000Z')
    })
    const approval = await requestApproval({
      targetRepo: target,
      runId: run.id,
      action: 'Merge PR https://github.com/acme/app/pull/123',
      reason: 'Fix is tested but touches checkout payment flow.',
      risk: 'medium',
      now: new Date('2026-06-16T08:10:00.000Z')
    })
    await approveApproval({
      targetRepo: target,
      approvalId: approval.id,
      decidedBy: 'founder',
      note: 'Approved for merge.',
      now: new Date('2026-06-16T08:20:00.000Z')
    })

    const report = await tickLoops({
      targetRepo: target,
      now: new Date('2026-06-16T08:30:00.000Z')
    })

    assert.equal(report.rows[0].action, 'resumed')
    assert.match(report.rows[0].reason, /approval approved/)

    const runs = parseJsonl(await readFile(join(target, '.win', 'state', 'runs.jsonl'), 'utf8'))
    const resumedRun = runs.find(item => item.trigger === 'approval')
    const originalRun = runs.find(item => item.id === run.id)
    assert.ok(resumedRun)
    assert.match(resumedRun.signal, /Merge PR/)
    assert.equal(originalRun.status, 'approval_resumed')
    assert.equal(originalRun.approvalDecisions[0].resumedRunId, resumedRun.id)
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('tickLoops does not resume rejected approvals', async () => {
  const target = await mkdtemp(join(tmpdir(), 'win-loops-tick-rejected-'))

  try {
    await installLoop({
      loopId: 'bug-autofix',
      targetRepo: target,
      agent: 'codex',
      sourceRoot: new URL('..', import.meta.url)
    })

    const run = await createLoopRun({
      loopId: 'bug-autofix',
      targetRepo: target,
      trigger: 'manual',
      signal: 'Checkout crash repeated 21 times.',
      now: new Date('2026-06-16T08:00:00.000Z')
    })
    const approval = await requestApproval({
      targetRepo: target,
      runId: run.id,
      action: 'Merge PR https://github.com/acme/app/pull/123',
      reason: 'Fix is tested but touches checkout payment flow.',
      risk: 'medium',
      now: new Date('2026-06-16T08:10:00.000Z')
    })
    await rejectApproval({
      targetRepo: target,
      approvalId: approval.id,
      decidedBy: 'founder',
      note: 'Rejected.',
      now: new Date('2026-06-16T08:20:00.000Z')
    })

    const report = await tickLoops({
      targetRepo: target,
      now: new Date('2026-06-16T08:30:00.000Z')
    })

    assert.equal(report.rows[0].action, 'waiting')

    const runs = parseJsonl(await readFile(join(target, '.win', 'state', 'runs.jsonl'), 'utf8'))
    assert.equal(runs.filter(item => item.trigger === 'approval').length, 0)
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

function parseJsonl(raw) {
  return raw
    .split('\n')
    .filter(Boolean)
    .map(line => JSON.parse(line))
}
