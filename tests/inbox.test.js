import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { installLoop } from '../src/installer.js'
import {
  approveApproval,
  attachArtifact,
  recordOutcome,
  requestApproval
} from '../src/reporting.js'
import { createLoopRun } from '../src/runner.js'
import { buildInbox, pickNextAction, renderInbox, renderNextAction } from '../src/inbox.js'

test('buildInbox summarizes pending operations and latest loop context', async () => {
  const target = await mkdtemp(join(tmpdir(), 'win-loops-inbox-'))

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

    const pendingRun = await createLoopRun({
      loopId: 'bug-autofix',
      targetRepo: target,
      trigger: 'manual',
      signal: 'Checkout crash repeated 21 times.',
      now: new Date('2026-06-16T08:00:00.000Z')
    })
    await requestApproval({
      targetRepo: target,
      runId: pendingRun.id,
      action: 'Merge PR https://github.com/acme/app/pull/123',
      reason: 'Touches checkout payment flow.',
      risk: 'medium',
      now: new Date('2026-06-16T08:10:00.000Z')
    })
    await createLoopRun({
      loopId: 'bug-autofix',
      targetRepo: target,
      trigger: 'manual',
      signal: 'Investigate a separate checkout warning.',
      now: new Date('2026-06-16T08:30:00.000Z')
    })

    const seoRun = await createLoopRun({
      loopId: 'seo-growth',
      targetRepo: target,
      trigger: 'manual',
      signal: 'Optimize pricing page query.',
      now: new Date('2026-06-15T08:00:00.000Z')
    })
    await attachArtifact({
      targetRepo: target,
      runId: seoRun.id,
      kind: 'page',
      title: 'Pricing page refresh',
      url: 'https://example.com/pricing',
      now: new Date('2026-06-15T09:00:00.000Z')
    })

    const report = await buildInbox({
      targetRepo: target,
      now: new Date('2026-06-16T15:00:00.000Z')
    })

    assert.equal(report.items.filter(item => item.kind === 'approval').length, 1)
    assert.equal(report.items.filter(item => item.kind === 'execution').length, 1)
    assert.equal(report.items.filter(item => item.kind === 'outcome').length, 1)
    assert.equal(report.latestByLoop.find(item => item.loopId === 'seo-growth').latestArtifact.title, 'Pricing page refresh')

    const table = renderInbox(report)
    assert.match(table, /Operator Inbox/)
    assert.match(table, /approval/)
    assert.match(table, /execution/)
    assert.match(table, /outcome/)
    assert.match(table, /Pricing page refresh/)
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('pickNextAction prioritizes pending approvals over execution work', async () => {
  const target = await mkdtemp(join(tmpdir(), 'win-loops-next-approval-'))

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
      reason: 'Touches checkout payment flow.',
      risk: 'medium',
      now: new Date('2026-06-16T08:10:00.000Z')
    })

    const report = await buildInbox({
      targetRepo: target,
      now: new Date('2026-06-16T09:00:00.000Z')
    })
    const next = pickNextAction(report)

    assert.equal(next.kind, 'approval')
    assert.equal(next.id, approval.id)
    assert.match(renderNextAction(next), /win-loops approval approve/)
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('pickNextAction tells the operator to tick approved approvals before other work', async () => {
  const target = await mkdtemp(join(tmpdir(), 'win-loops-next-resume-'))

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
      reason: 'Touches checkout payment flow.',
      risk: 'medium',
      now: new Date('2026-06-16T08:10:00.000Z')
    })
    await approveApproval({
      targetRepo: target,
      approvalId: approval.id,
      decidedBy: 'founder',
      note: 'Approved.',
      now: new Date('2026-06-16T08:20:00.000Z')
    })

    const report = await buildInbox({
      targetRepo: target,
      now: new Date('2026-06-16T09:00:00.000Z')
    })
    const next = pickNextAction(report)

    assert.equal(next.kind, 'resume')
    assert.match(renderNextAction(next), /win-loops tick/)
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('pickNextAction prints the skill and run brief for pending execution', async () => {
  const target = await mkdtemp(join(tmpdir(), 'win-loops-next-exec-'))

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

    const report = await buildInbox({
      targetRepo: target,
      now: new Date('2026-06-16T09:00:00.000Z')
    })
    const next = pickNextAction(report)

    assert.equal(next.kind, 'execution')
    assert.match(renderNextAction(next), /Use the win-bug-autofix skill/)
    assert.match(renderNextAction(next), new RegExp(`\\.win/runs/${run.id}\\.md`))
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('renderNextAction is explicit when no action is waiting', async () => {
  const report = {
    targetRepo: '/tmp/example',
    checkedAt: '2026-06-16T09:00:00.000Z',
    items: [],
    latestByLoop: []
  }

  assert.match(renderNextAction(pickNextAction(report)), /No immediate loop actions/)
})
