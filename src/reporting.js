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
  const { runs, run, index } = await loadRun(target, runId)
  const artifact = {
    id: buildId(runId, 'artifact', timestamp),
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
  await appendJsonl(join(target, '.win', 'state', 'artifacts.jsonl'), artifact)
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
  const { runs, run, index } = await loadRun(target, runId)
  const outcome = {
    id: buildId(runId, 'outcome', timestamp),
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
  await appendJsonl(join(target, '.win', 'state', 'outcomes.jsonl'), outcome)
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
  const { runs, run, index } = await loadRun(target, runId)
  const approval = {
    id: buildId(runId, 'approval', timestamp),
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
  await appendJsonl(join(target, '.win', 'state', 'approvals.jsonl'), approval)
  await appendJournal(target, run.loopId, renderApprovalJournal(approval))

  return approval
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
