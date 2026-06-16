import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { installLoop } from '../src/installer.js'
import { createLoopRun } from '../src/runner.js'
import {
  approveApproval,
  attachArtifact,
  recordOutcome,
  rejectApproval,
  requestApproval
} from '../src/reporting.js'

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

test('requestApproval makes unique approval ids for same-second requests', async () => {
  const target = await mkdtemp(join(tmpdir(), 'win-loops-reporting-approval-id-'))

  try {
    const run = await createInstalledRun(target)
    const now = new Date('2026-06-16T11:00:00.000Z')
    const first = await requestApproval({
      targetRepo: target,
      runId: run.id,
      action: 'Merge PR',
      reason: 'Touches checkout.',
      risk: 'medium',
      now
    })
    const second = await requestApproval({
      targetRepo: target,
      runId: run.id,
      action: 'Roll back PR',
      reason: 'Metric got worse.',
      risk: 'low',
      now
    })

    assert.notEqual(first.id, second.id)

    const approvals = parseJsonl(await readFile(join(target, '.win', 'state', 'approvals.jsonl'), 'utf8'))
    assert.equal(new Set(approvals.map(approval => approval.id)).size, 2)
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('approveApproval records a decision and clears the pending approval', async () => {
  const target = await mkdtemp(join(tmpdir(), 'win-loops-reporting-approve-'))

  try {
    const run = await createInstalledRun(target)
    const approval = await requestApproval({
      targetRepo: target,
      runId: run.id,
      action: 'Merge PR https://github.com/acme/app/pull/123',
      reason: 'Fix is tested but touches checkout payment flow.',
      risk: 'medium',
      now: new Date('2026-06-16T11:00:00.000Z')
    })

    const decision = await approveApproval({
      targetRepo: target,
      approvalId: approval.id,
      decidedBy: 'founder',
      note: 'Approved after checking tests.',
      now: new Date('2026-06-16T11:10:00.000Z')
    })

    assert.equal(decision.status, 'approved')
    assert.equal(decision.approvalId, approval.id)

    const approvals = parseJsonl(await readFile(join(target, '.win', 'state', 'approvals.jsonl'), 'utf8'))
    assert.equal(approvals.length, 2)
    assert.equal(approvals[1].status, 'approved')

    const runs = parseJsonl(await readFile(join(target, '.win', 'state', 'runs.jsonl'), 'utf8'))
    assert.equal(runs[0].status, 'approval_approved')
    assert.deepEqual(runs[0].pendingApprovals, [])
    assert.equal(runs[0].approvalDecisions[0].approvalId, approval.id)

    const journal = await readFile(join(target, '.win', 'loops', 'bug-autofix', 'journal.md'), 'utf8')
    assert.match(journal, /Approval Approved/)
    assert.match(journal, /Approved after checking tests/)
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('rejectApproval records a decision and marks the run rejected', async () => {
  const target = await mkdtemp(join(tmpdir(), 'win-loops-reporting-reject-'))

  try {
    const run = await createInstalledRun(target)
    const approval = await requestApproval({
      targetRepo: target,
      runId: run.id,
      action: 'Merge PR https://github.com/acme/app/pull/123',
      reason: 'Fix is tested but touches checkout payment flow.',
      risk: 'high',
      now: new Date('2026-06-16T11:00:00.000Z')
    })

    const decision = await rejectApproval({
      targetRepo: target,
      approvalId: approval.id,
      decidedBy: 'founder',
      note: 'Rejected until a safer migration is added.',
      now: new Date('2026-06-16T11:10:00.000Z')
    })

    assert.equal(decision.status, 'rejected')

    const approvals = parseJsonl(await readFile(join(target, '.win', 'state', 'approvals.jsonl'), 'utf8'))
    assert.equal(approvals.length, 2)
    assert.equal(approvals[1].status, 'rejected')

    const runs = parseJsonl(await readFile(join(target, '.win', 'state', 'runs.jsonl'), 'utf8'))
    assert.equal(runs[0].status, 'approval_rejected')
    assert.deepEqual(runs[0].pendingApprovals, [])
    assert.equal(runs[0].approvalDecisions[0].status, 'rejected')

    const journal = await readFile(join(target, '.win', 'loops', 'bug-autofix', 'journal.md'), 'utf8')
    assert.match(journal, /Approval Rejected/)
    assert.match(journal, /safer migration/)
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
