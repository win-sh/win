import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { installLoop } from '../src/installer.js'
import { createLoopRun } from '../src/runner.js'
import { attachArtifact, recordOutcome, requestApproval } from '../src/reporting.js'

test('attachArtifact records proof on the run, artifacts log, and loop journal', async () => {
  const target = await mkdtemp(join(tmpdir(), 'win-loops-reporting-artifact-'))

  try {
    const run = await createInstalledRun(target)

    const artifact = await attachArtifact({
      targetRepo: target,
      runId: run.id,
      kind: 'pr',
      title: 'Checkout null pointer fix',
      url: 'https://github.com/acme/app/pull/123',
      summary: 'Fixes checkout crash and adds regression coverage.',
      now: new Date('2026-06-16T10:00:00.000Z')
    })

    assert.equal(artifact.runId, run.id)
    assert.equal(artifact.loopId, 'bug-autofix')
    assert.equal(artifact.kind, 'pr')

    const artifacts = parseJsonl(await readFile(join(target, '.win', 'state', 'artifacts.jsonl'), 'utf8'))
    assert.equal(artifacts.length, 1)
    assert.equal(artifacts[0].url, 'https://github.com/acme/app/pull/123')

    const runs = parseJsonl(await readFile(join(target, '.win', 'state', 'runs.jsonl'), 'utf8'))
    assert.equal(runs[0].artifacts.length, 1)
    assert.equal(runs[0].artifacts[0].id, artifact.id)

    const journal = await readFile(join(target, '.win', 'loops', 'bug-autofix', 'journal.md'), 'utf8')
    assert.match(journal, /Artifact Attached/)
    assert.match(journal, /Checkout null pointer fix/)
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('recordOutcome writes measured result and marks the run outcome recorded', async () => {
  const target = await mkdtemp(join(tmpdir(), 'win-loops-reporting-outcome-'))

  try {
    const run = await createInstalledRun(target)

    const outcome = await recordOutcome({
      targetRepo: target,
      runId: run.id,
      status: 'improved',
      metric: 'error_rate_down_92_percent',
      summary: 'Sentry group dropped from 87 events/day to 7 events/day after deploy.',
      evidence: 'https://sentry.io/acme/issues/checkout-null-pointer/',
      now: new Date('2026-06-17T10:00:00.000Z')
    })

    assert.equal(outcome.runId, run.id)
    assert.equal(outcome.status, 'improved')

    const outcomes = parseJsonl(await readFile(join(target, '.win', 'state', 'outcomes.jsonl'), 'utf8'))
    assert.equal(outcomes.length, 1)
    assert.equal(outcomes[0].metric, 'error_rate_down_92_percent')

    const runs = parseJsonl(await readFile(join(target, '.win', 'state', 'runs.jsonl'), 'utf8'))
    assert.equal(runs[0].status, 'outcome_recorded')
    assert.equal(runs[0].latestOutcome.id, outcome.id)

    const journal = await readFile(join(target, '.win', 'loops', 'bug-autofix', 'journal.md'), 'utf8')
    assert.match(journal, /Outcome Recorded/)
    assert.match(journal, /error_rate_down_92_percent/)
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('requestApproval writes a pending approval and marks the run waiting for approval', async () => {
  const target = await mkdtemp(join(tmpdir(), 'win-loops-reporting-approval-'))

  try {
    const run = await createInstalledRun(target)

    const approval = await requestApproval({
      targetRepo: target,
      runId: run.id,
      action: 'Merge PR https://github.com/acme/app/pull/123',
      reason: 'Fix is tested but touches checkout payment flow.',
      risk: 'medium',
      approver: 'founder',
      now: new Date('2026-06-16T11:00:00.000Z')
    })

    assert.equal(approval.runId, run.id)
    assert.equal(approval.status, 'pending')
    assert.equal(approval.risk, 'medium')

    const approvals = parseJsonl(await readFile(join(target, '.win', 'state', 'approvals.jsonl'), 'utf8'))
    assert.equal(approvals.length, 1)
    assert.equal(approvals[0].approver, 'founder')

    const runs = parseJsonl(await readFile(join(target, '.win', 'state', 'runs.jsonl'), 'utf8'))
    assert.equal(runs[0].status, 'waiting_for_approval')
    assert.equal(runs[0].pendingApprovals.length, 1)

    const journal = await readFile(join(target, '.win', 'loops', 'bug-autofix', 'journal.md'), 'utf8')
    assert.match(journal, /Approval Requested/)
    assert.match(journal, /checkout payment flow/)
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

async function createInstalledRun(target) {
  await installLoop({
    loopId: 'bug-autofix',
    targetRepo: target,
    agent: 'codex',
    sourceRoot: new URL('..', import.meta.url)
  })

  return createLoopRun({
    loopId: 'bug-autofix',
    targetRepo: target,
    trigger: 'manual',
    signal: 'Sentry error group checkout-null-pointer repeated 21 times in 1 hour.',
    now: new Date('2026-06-16T08:00:00.000Z')
  })
}

function parseJsonl(raw) {
  return raw
    .split('\n')
    .filter(Boolean)
    .map(line => JSON.parse(line))
}
