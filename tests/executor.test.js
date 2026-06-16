import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { installLoop } from '../src/installer.js'
import { requestApproval } from '../src/reporting.js'
import { createLoopRun } from '../src/runner.js'
import { buildExecPlan, executeExecPlan, renderExecPlan } from '../src/executor.js'

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

test('executeExecPlan captures a successful command into execution state and journal', async () => {
  const target = await mkdtemp(join(tmpdir(), 'win-loops-exec-success-'))

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
      runId: run.id,
      dryRun: false
    })

    const execution = await executeExecPlan(plan, {
      executable: process.execPath,
      args: ['-e', 'console.log("agent stdout"); console.error("agent stderr")'],
      now: new Date('2026-06-16T09:00:00.000Z')
    })

    assert.equal(execution.status, 'succeeded')
    assert.equal(execution.runId, run.id)

    const log = await readFile(join(target, execution.logPath), 'utf8')
    assert.match(log, /agent stdout/)
    assert.match(log, /agent stderr/)

    const executions = parseJsonl(await readFile(join(target, '.win', 'state', 'executions.jsonl'), 'utf8'))
    assert.equal(executions.length, 1)
    assert.equal(executions[0].status, 'succeeded')

    const runs = parseJsonl(await readFile(join(target, '.win', 'state', 'runs.jsonl'), 'utf8'))
    assert.equal(runs[0].status, 'executed')
    assert.equal(runs[0].latestExecution.id, execution.id)

    const journal = await readFile(join(target, '.win', 'loops', 'bug-autofix', 'journal.md'), 'utf8')
    assert.match(journal, /Execution Succeeded/)
    assert.match(journal, new RegExp(execution.logPath))
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('executeExecPlan records failed commands without losing the log', async () => {
  const target = await mkdtemp(join(tmpdir(), 'win-loops-exec-failure-'))

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
      runId: run.id,
      dryRun: false
    })

    const execution = await executeExecPlan(plan, {
      executable: process.execPath,
      args: ['-e', 'console.error("agent failed"); process.exit(7)'],
      now: new Date('2026-06-16T09:00:00.000Z')
    })

    assert.equal(execution.status, 'failed')
    assert.equal(execution.exitCode, 7)

    const log = await readFile(join(target, execution.logPath), 'utf8')
    assert.match(log, /agent failed/)

    const runs = parseJsonl(await readFile(join(target, '.win', 'state', 'runs.jsonl'), 'utf8'))
    assert.equal(runs[0].status, 'execution_failed')
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
