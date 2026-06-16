import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { installLoop } from '../src/installer.js'
import { requestApproval } from '../src/reporting.js'
import { createLoopRun } from '../src/runner.js'
import { buildExecPlan, renderExecPlan } from '../src/executor.js'

test('buildExecPlan creates a Codex dry-run handoff for the next executable run', async () => {
  const target = await mkdtemp(join(tmpdir(), 'win-loops-exec-codex-'))

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

    const plan = await buildExecPlan({
      targetRepo: target,
      agent: 'codex',
      dryRun: true
    })

    assert.equal(plan.status, 'ready')
    assert.equal(plan.agent, 'codex')
    assert.equal(plan.runId, run.id)
    assert.equal(plan.skillName, 'win-bug-autofix')
    assert.equal(plan.runBrief, `.win/runs/${run.id}.md`)
    assert.match(plan.command, /^codex /)
    assert.match(plan.prompt, /Use the win-bug-autofix skill/)
    assert.match(renderExecPlan(plan), /Dry Run/)
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('buildExecPlan creates a Claude Code dry-run handoff for an explicit run id', async () => {
  const target = await mkdtemp(join(tmpdir(), 'win-loops-exec-claude-'))

  try {
    await installLoop({
      loopId: 'bug-autofix',
      targetRepo: target,
      agent: 'claude-code',
      sourceRoot: new URL('..', import.meta.url)
    })
    const run = await createLoopRun({
      loopId: 'bug-autofix',
      targetRepo: target,
      trigger: 'manual',
      signal: 'Checkout crash repeated 21 times.',
      now: new Date('2026-06-16T08:00:00.000Z')
    })

    const plan = await buildExecPlan({
      targetRepo: target,
      agent: 'claude-code',
      runId: run.id,
      dryRun: true
    })

    assert.equal(plan.status, 'ready')
    assert.equal(plan.agent, 'claude-code')
    assert.equal(plan.runId, run.id)
    assert.match(plan.command, /^claude /)
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('buildExecPlan blocks when the next operator action is an approval', async () => {
  const target = await mkdtemp(join(tmpdir(), 'win-loops-exec-blocked-'))

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
    await requestApproval({
      targetRepo: target,
      runId: run.id,
      action: 'Merge PR https://github.com/acme/app/pull/123',
      reason: 'Touches checkout payment flow.',
      risk: 'medium',
      now: new Date('2026-06-16T08:10:00.000Z')
    })

    const plan = await buildExecPlan({
      targetRepo: target,
      agent: 'codex',
      dryRun: true
    })

    assert.equal(plan.status, 'blocked')
    assert.match(plan.reason, /Next action is approval/)
    assert.match(renderExecPlan(plan), /win-loops next/)
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})
