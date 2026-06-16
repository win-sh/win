import { appendFile, readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

export async function attachArtifact({
  targetRepo,
  runId,
  kind,
  title,
  url = '',
  path = '',
  summary = '',
  now = new Date()
}) {
  if (!runId) throw new Error('runId is required')
  if (!targetRepo) throw new Error('targetRepo is required')

  const target = resolve(targetRepo)
  const timestamp = toDate(now).toISOString()
  const artifactsPath = join(target, '.win', 'state', 'artifacts.jsonl')
  const { runs, run, index } = await loadRun(target, runId)
  const artifact = {
    id: await nextEventId(artifactsPath, buildId(runId, 'artifact', timestamp)),
    runId,
    loopId: run.loopId,
    kind: kind || inferArtifactKind({ url, path }),
    title: title || url || path || 'Artifact',
    url,
    path,
    summary,
    createdAt: timestamp
  }

  run.artifacts = [...(run.artifacts || []), artifact]
  run.updatedAt = timestamp
  runs[index] = run

  await writeRuns(target, runs)
  await appendJsonl(artifactsPath, artifact)
  await appendJournal(target, run.loopId, renderArtifactJournal(artifact))

  return artifact
}

export async function recordOutcome({
  targetRepo,
  runId,
  status,
  metric = '',
  summary = '',
  evidence = '',
  now = new Date()
}) {
  if (!runId) throw new Error('runId is required')
  if (!targetRepo) throw new Error('targetRepo is required')
  if (!status) throw new Error('status is required')

  const target = resolve(targetRepo)
  const timestamp = toDate(now).toISOString()
  const outcomesPath = join(target, '.win', 'state', 'outcomes.jsonl')
  const { runs, run, index } = await loadRun(target, runId)
  const outcome = {
    id: await nextEventId(outcomesPath, buildId(runId, 'outcome', timestamp)),
    runId,
    loopId: run.loopId,
    status,
    metric,
    summary,
    evidence,
    recordedAt: timestamp
  }

  run.status = 'outcome_recorded'
  run.latestOutcome = outcome
  run.updatedAt = timestamp
  runs[index] = run

  await writeRuns(target, runs)
  await appendJsonl(outcomesPath, outcome)
  await appendJournal(target, run.loopId, renderOutcomeJournal(outcome))

  return outcome
}

export async function requestApproval({
  targetRepo,
  runId,
  action,
  reason,
  risk = 'medium',
  approver = '',
  now = new Date()
}) {
  if (!runId) throw new Error('runId is required')
  if (!targetRepo) throw new Error('targetRepo is required')
  if (!action) throw new Error('action is required')
  if (!reason) throw new Error('reason is required')

  const target = resolve(targetRepo)
  const timestamp = toDate(now).toISOString()
  const approvalsPath = join(target, '.win', 'state', 'approvals.jsonl')
  const { runs, run, index } = await loadRun(target, runId)
  const approval = {
    id: await nextEventId(approvalsPath, buildId(runId, 'approval', timestamp)),
    runId,
    loopId: run.loopId,
    action,
    reason,
    risk,
    approver,
    status: 'pending',
    requestedAt: timestamp
  }

  run.status = 'waiting_for_approval'
  run.pendingApprovals = [...(run.pendingApprovals || []), approval]
  run.updatedAt = timestamp
  runs[index] = run

  await writeRuns(target, runs)
  await appendJsonl(approvalsPath, approval)
  await appendJournal(target, run.loopId, renderApprovalJournal(approval))

  return approval
}

export async function approveApproval({
  targetRepo,
  approvalId,
  decidedBy = '',
  note = '',
  now = new Date()
}) {
  return decideApproval({
    targetRepo,
    approvalId,
    status: 'approved',
    decidedBy,
    note,
    now
  })
}

export async function rejectApproval({
  targetRepo,
  approvalId,
  decidedBy = '',
  note = '',
  now = new Date()
}) {
  return decideApproval({
    targetRepo,
    approvalId,
    status: 'rejected',
    decidedBy,
    note,
    now
  })
}

async function decideApproval({
  targetRepo,
  approvalId,
  status,
  decidedBy = '',
  note = '',
  now = new Date()
}) {
  if (!approvalId) throw new Error('approvalId is required')
  if (!targetRepo) throw new Error('targetRepo is required')

  const target = resolve(targetRepo)
  const timestamp = toDate(now).toISOString()
  const approvalsPath = join(target, '.win', 'state', 'approvals.jsonl')
  const runs = await readRuns(target)
  const runIndex = runs.findIndex(run => (run.pendingApprovals || []).some(approval => approval.id === approvalId))
  if (runIndex === -1) throw new Error(`Pending approval not found: ${approvalId}`)

  const run = runs[runIndex]
  const approval = run.pendingApprovals.find(item => item.id === approvalId)
  const decision = {
    id: await nextEventId(approvalsPath, buildId(approvalId, status, timestamp)),
    approvalId,
    runId: run.id,
    loopId: run.loopId,
    action: approval.action,
    reason: approval.reason,
    risk: approval.risk,
    approver: approval.approver || '',
    status,
    decidedBy,
    note,
    decidedAt: timestamp
  }

  run.pendingApprovals = run.pendingApprovals.filter(item => item.id !== approvalId)
  run.approvalDecisions = [...(run.approvalDecisions || []), decision]
  run.status = status === 'approved' ? 'approval_approved' : 'approval_rejected'
  run.updatedAt = timestamp
  runs[runIndex] = run

  await writeRuns(target, runs)
  await appendJsonl(approvalsPath, decision)
  await appendJournal(target, run.loopId, renderApprovalDecisionJournal(decision))

  return decision
}

async function loadRun(target, runId) {
  const runs = await readRuns(target)
  const index = runs.findIndex(run => run.id === runId)
  if (index === -1) throw new Error(`Run not found: ${runId}`)
  return { runs, run: runs[index], index }
}

async function readRuns(target) {
  const raw = await readFile(join(target, '.win', 'state', 'runs.jsonl'), 'utf8')
  return raw
    .split('\n')
    .filter(Boolean)
    .map(line => JSON.parse(line))
}

async function writeRuns(target, runs) {
  const body = runs.map(run => JSON.stringify(run)).join('\n')
  await writeFile(join(target, '.win', 'state', 'runs.jsonl'), `${body}${body ? '\n' : ''}`, 'utf8')
}

async function appendJsonl(path, value) {
  await appendFile(path, `${JSON.stringify(value)}\n`, 'utf8')
}

async function nextEventId(path, base) {
  const existing = await readJsonl(path)
  const existingIds = new Set(existing.map(item => item.id))
  if (!existingIds.has(base)) return base

  let suffix = 2
  while (existingIds.has(`${base}-${suffix}`)) {
    suffix += 1
  }
  return `${base}-${suffix}`
}

async function readJsonl(path) {
  try {
    const raw = await readFile(path, 'utf8')
    return raw
      .split('\n')
      .filter(Boolean)
      .map(line => JSON.parse(line))
  } catch {
    return []
  }
}

async function appendJournal(target, loopId, body) {
  await appendFile(join(target, '.win', 'loops', loopId, 'journal.md'), body, 'utf8')
}

function renderArtifactJournal(artifact) {
  return `
## ${artifact.createdAt.slice(0, 10)} - Artifact Attached

- Run: ${artifact.runId}
- Artifact: ${artifact.title}
- Kind: ${artifact.kind}
- URL: ${artifact.url || '-'}
- Path: ${artifact.path || '-'}
- Summary: ${artifact.summary || '-'}
`
}

function renderOutcomeJournal(outcome) {
  return `
## ${outcome.recordedAt.slice(0, 10)} - Outcome Recorded

- Run: ${outcome.runId}
- Status: ${outcome.status}
- Metric: ${outcome.metric || '-'}
- Evidence: ${outcome.evidence || '-'}
- Summary: ${outcome.summary || '-'}
`
}

function renderApprovalJournal(approval) {
  return `
## ${approval.requestedAt.slice(0, 10)} - Approval Requested

- Run: ${approval.runId}
- Action: ${approval.action}
- Reason: ${approval.reason}
- Risk: ${approval.risk}
- Approver: ${approval.approver || '-'}
- Status: ${approval.status}
`
}

function renderApprovalDecisionJournal(decision) {
  const title = decision.status === 'approved' ? 'Approval Approved' : 'Approval Rejected'
  return `
## ${decision.decidedAt.slice(0, 10)} - ${title}

- Run: ${decision.runId}
- Approval: ${decision.approvalId}
- Action: ${decision.action}
- Decision By: ${decision.decidedBy || '-'}
- Note: ${decision.note || '-'}
- Status: ${decision.status}
`
}

function inferArtifactKind({ url, path }) {
  if (url) return 'link'
  if (path) return 'file'
  return 'note'
}

function buildId(runId, type, timestamp) {
  return `${runId}-${type}-${timestamp.replace(/[-:.TZ]/g, '').slice(0, 14)}`
}

function toDate(value) {
  return value instanceof Date ? value : new Date(value)
}
