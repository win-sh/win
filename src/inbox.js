import { readdir, readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

export async function buildInbox({ targetRepo = process.cwd(), now = new Date() } = {}) {
  const target = resolve(targetRepo)
  const checkedAt = toDate(now).toISOString()
  const loops = await readInstalledLoopIds(target)
  const runs = await readJsonl(join(target, '.win', 'state', 'runs.jsonl'))
  const artifacts = await readJsonl(join(target, '.win', 'state', 'artifacts.jsonl'))
  const outcomes = await readJsonl(join(target, '.win', 'state', 'outcomes.jsonl'))
  const items = [
    ...pendingApprovalItems({ runs, target }),
    ...approvedResumeItems({ runs, target }),
    ...pendingExecutionItems({ runs, target }),
    ...overdueOutcomeItems({ runs, now: toDate(now), target })
  ].sort((a, b) => a.priority - b.priority || a.loopId.localeCompare(b.loopId) || a.id.localeCompare(b.id))

  return {
    targetRepo: target,
    checkedAt,
    items,
    latestByLoop: latestByLoop({ loopIds: loops, runs, artifacts, outcomes })
  }
}

export function pickNextAction(report) {
  return report.items[0] || {
    kind: 'none',
    priority: 999,
    targetRepo: report.targetRepo,
    checkedAt: report.checkedAt
  }
}

export function renderInbox(report) {
  const lines = [
    'Operator Inbox',
    `Repo: ${report.targetRepo}`,
    `Checked: ${report.checkedAt}`,
    ''
  ]

  if (report.items.length === 0) {
    lines.push('No immediate loop actions.', '')
  } else {
    lines.push(renderTable([
      ['Kind', 'Loop', 'Status', 'Item', 'Next action'],
      ...report.items.map(item => [
        item.kind,
        item.loopId,
        item.status,
        item.summary,
        item.nextAction
      ])
    ]))
  }

  if (report.latestByLoop.length > 0) {
    lines.push('Latest Context')
    lines.push(renderTable([
      ['Loop', 'Latest run', 'Latest artifact', 'Latest outcome'],
      ...report.latestByLoop.map(item => [
        item.loopId,
        item.latestRun?.id || '-',
        item.latestArtifact?.title || '-',
        item.latestOutcome?.status || '-'
      ])
    ]))
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n') + '\n'
}

export function renderNextAction(action) {
  if (!action || action.kind === 'none') {
    return 'No immediate loop actions.\n'
  }

  if (action.kind === 'approval') {
    return [
      `Approve or reject approval ${action.id}.`,
      `Run: ${action.runId}`,
      `Loop: ${action.loopId}`,
      `Action: ${action.summary}`,
      '',
      `Approve: win-loops approval approve ${action.id} --repo ${action.targetRepo} --by <name> --note "<note>"`,
      `Reject:  win-loops approval reject ${action.id} --repo ${action.targetRepo} --by <name> --note "<note>"`
    ].join('\n') + '\n'
  }

  if (action.kind === 'resume') {
    return [
      `Resume approved action ${action.id}.`,
      `Loop: ${action.loopId}`,
      `Action: ${action.summary}`,
      '',
      `Run: win-loops tick --repo ${action.targetRepo}`
    ].join('\n') + '\n'
  }

  if (action.kind === 'execution') {
    return [
      `Use the win-${action.loopId} skill.`,
      `Execute ${action.runBrief}.`,
      `Run ID: ${action.id}`
    ].join('\n') + '\n'
  }

  if (action.kind === 'outcome') {
    return [
      `Record outcome for ${action.id}.`,
      `Loop: ${action.loopId}`,
      `Evidence is due from ${action.dueAt}.`,
      '',
      `Run: win-loops outcome record ${action.id} --repo ${action.targetRepo} --status <status> --metric <metric> --summary "<summary>"`
    ].join('\n') + '\n'
  }

  return `${action.nextAction}\n`
}

function pendingApprovalItems({ runs, target }) {
  return runs.flatMap(run => (run.pendingApprovals || []).map(approval => ({
    id: approval.id,
    kind: 'approval',
    priority: 10,
    loopId: run.loopId,
    runId: run.id,
    status: approval.status || 'pending',
    summary: approval.action,
    detail: approval.reason,
    targetRepo: target,
    nextAction: `approval approve/reject ${approval.id}`
  })))
}

function approvedResumeItems({ runs, target }) {
  return runs.flatMap(run => (run.approvalDecisions || [])
    .filter(decision => decision.status === 'approved' && !decision.resumedRunId)
    .map(decision => ({
      id: decision.approvalId,
      kind: 'resume',
      priority: 20,
      loopId: run.loopId,
      runId: run.id,
      status: 'approved',
      summary: decision.action,
      detail: decision.note || decision.reason,
      targetRepo: target,
      nextAction: 'win-loops tick'
    })))
}

function pendingExecutionItems({ runs, target }) {
  return runs
    .filter(run => (run.artifacts || []).length === 0)
    .filter(run => run.status === 'diagnosing')
    .map(run => ({
      id: run.id,
      kind: 'execution',
      priority: 30,
      loopId: run.loopId,
      runId: run.id,
      status: run.status,
      summary: run.title || run.id,
      detail: run.signal || '',
      targetRepo: target,
      runBrief: `.win/runs/${run.id}.md`,
      nextAction: `execute .win/runs/${run.id}.md`
    }))
}

function overdueOutcomeItems({ runs, now, target }) {
  return runs
    .filter(run => (run.artifacts || []).length > 0)
    .filter(run => !run.latestOutcome)
    .filter(run => run.nextRun?.at && new Date(run.nextRun.at).getTime() <= now.getTime())
    .map(run => ({
      id: run.id,
      kind: 'outcome',
      priority: 40,
      loopId: run.loopId,
      runId: run.id,
      status: 'overdue',
      summary: run.expectedOutcome || 'Outcome check due',
      detail: '',
      targetRepo: target,
      dueAt: run.nextRun.at,
      nextAction: `outcome record ${run.id}`
    }))
}

function latestByLoop({ loopIds, runs, artifacts, outcomes }) {
  const allLoopIds = [...new Set([...loopIds, ...runs.map(run => run.loopId)])].sort()
  return allLoopIds.map(loopId => ({
    loopId,
    latestRun: latest(runs.filter(run => run.loopId === loopId), item => item.createdAt || item.updatedAt),
    latestArtifact: latest(artifacts.filter(artifact => artifact.loopId === loopId), item => item.createdAt),
    latestOutcome: latest(outcomes.filter(outcome => outcome.loopId === loopId), item => item.recordedAt)
  }))
}

function latest(items, getDate) {
  return [...items].sort((a, b) => String(getDate(b) || '').localeCompare(String(getDate(a) || '')))[0] || null
}

function renderTable(rows) {
  const widths = rows[0].map((_, index) => Math.max(...rows.map(row => String(row[index]).length)))
  return rows
    .map((row, rowIndex) => {
      const line = row.map((cell, index) => String(cell).padEnd(widths[index])).join('  ')
      if (rowIndex === 0) {
        return `${line}\n${widths.map(width => '-'.repeat(width)).join('  ')}`
      }
      return line
    })
    .join('\n') + '\n'
}

async function readInstalledLoopIds(target) {
  const entries = await safeReaddir(join(target, '.win', 'loops'))
  return entries.filter(entry => entry.isDirectory()).map(entry => entry.name)
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

async function safeReaddir(path) {
  try {
    return readdir(path, { withFileTypes: true })
  } catch {
    return []
  }
}

function toDate(value) {
  return value instanceof Date ? value : new Date(value)
}
