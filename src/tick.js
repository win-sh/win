import { appendFile, readdir, readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { createLoopRun } from './runner.js'

export async function tickLoops({ targetRepo = process.cwd(), now = new Date() } = {}) {
  const target = resolve(targetRepo)
  const checkedAt = toDate(now)
  const loopsDir = join(target, '.win', 'loops')
  const runsPath = join(target, '.win', 'state', 'runs.jsonl')
  const entries = await safeReaddir(loopsDir)
  const runs = await readRuns(runsPath)
  const rows = []

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (!entry.isDirectory()) continue

    const loopId = entry.name
    const statePath = join(loopsDir, loopId, 'state.json')
    const state = await readLoopState(statePath, loopId)
    const latestRun = [...runs].reverse().find(run => run.loopId === loopId) || null
    const scheduledAt = state.nextRunAt || latestRun?.nextRun?.at || null

    if (state.enabled === false) {
      rows.push({
        loopId,
        action: 'disabled',
        reason: 'loop disabled',
        nextRunAt: scheduledAt,
        runId: ''
      })
      continue
    }

    const resumableApproval = findResumableApproval(runs, loopId)
    if (resumableApproval) {
      const run = await createLoopRun({
        loopId,
        targetRepo: target,
        trigger: 'approval',
        signal: renderApprovalSignal(resumableApproval),
        now: checkedAt
      })

      await markApprovalResumed({
        target,
        sourceRunId: resumableApproval.run.id,
        approvalId: resumableApproval.decision.approvalId,
        resumedRunId: run.id,
        now: checkedAt
      })
      await writeLoopState(statePath, {
        ...state,
        enabled: true,
        lastTickAt: checkedAt.toISOString(),
        lastRunId: run.id,
        lastRunAt: run.createdAt,
        nextRunAt: run.nextRun.at,
        updatedAt: checkedAt.toISOString()
      })

      rows.push({
        loopId,
        action: 'resumed',
        reason: 'approval approved',
        nextRunAt: run.nextRun.at,
        runId: run.id
      })
      continue
    }

    const dueReason = dueReasonFor({ scheduledAt, now: checkedAt })
    if (!dueReason) {
      rows.push({
        loopId,
        action: 'waiting',
        reason: 'not due',
        nextRunAt: scheduledAt,
        runId: latestRun?.id || ''
      })
      continue
    }

    const run = await createLoopRun({
      loopId,
      targetRepo: target,
      trigger: 'tick',
      signal: renderTickSignal({ loopId, reason: dueReason, scheduledAt, checkedAt }),
      now: checkedAt
    })

    await writeLoopState(statePath, {
      ...state,
      enabled: true,
      lastTickAt: checkedAt.toISOString(),
      lastRunId: run.id,
      lastRunAt: run.createdAt,
      nextRunAt: run.nextRun.at,
      updatedAt: checkedAt.toISOString()
    })

    rows.push({
      loopId,
      action: 'ran',
      reason: dueReason,
      nextRunAt: run.nextRun.at,
      runId: run.id
    })
  }

  return {
    targetRepo: target,
    checkedAt: checkedAt.toISOString(),
    rows
  }
}

export function renderTickTable(rows) {
  if (rows.length === 0) return 'No loops installed.\n'

  const headers = ['Loop', 'Action', 'Reason', 'Next run', 'Run']
  const body = rows.map(row => [
    row.loopId,
    row.action,
    row.reason,
    row.nextRunAt || '-',
    row.runId || '-'
  ])

  return renderTable([headers, ...body])
}

function dueReasonFor({ scheduledAt, now }) {
  if (!scheduledAt) return 'first run'

  const scheduled = new Date(scheduledAt)
  if (Number.isNaN(scheduled.getTime())) return 'invalid nextRunAt'
  if (scheduled.getTime() <= now.getTime()) return 'due'

  return null
}

function findResumableApproval(runs, loopId) {
  for (const run of runs) {
    if (run.loopId !== loopId) continue
    const decision = (run.approvalDecisions || []).find(item => item.status === 'approved' && !item.resumedRunId)
    if (decision) return { run, decision }
  }

  return null
}

function renderTickSignal({ loopId, reason, scheduledAt, checkedAt }) {
  return [
    `Scheduled tick for ${loopId}.`,
    '',
    `Reason: ${reason}.`,
    `Checked at: ${checkedAt.toISOString()}.`,
    `Previous next run: ${scheduledAt || 'none'}.`
  ].join('\n')
}

function renderApprovalSignal({ run, decision }) {
  return [
    'Approval was approved for a previous loop run.',
    '',
    `Original run: ${run.id}.`,
    `Approval: ${decision.approvalId}.`,
    `Action: ${decision.action}.`,
    `Reason: ${decision.reason}.`,
    `Approved by: ${decision.decidedBy || decision.approver || 'unknown'}.`,
    `Approval note: ${decision.note || '-'}`
  ].join('\n')
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

async function readRuns(path) {
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

async function readLoopState(path, loopId) {
  try {
    return JSON.parse(await readFile(path, 'utf8'))
  } catch {
    return { id: loopId, enabled: true }
  }
}

async function writeLoopState(path, state) {
  await writeFile(path, `${JSON.stringify(state, null, 2)}\n`, 'utf8')
}

async function markApprovalResumed({ target, sourceRunId, approvalId, resumedRunId, now }) {
  const runsPath = join(target, '.win', 'state', 'runs.jsonl')
  const runs = await readRuns(runsPath)
  const index = runs.findIndex(run => run.id === sourceRunId)
  if (index === -1) return

  const timestamp = toDate(now).toISOString()
  const sourceRun = runs[index]
  sourceRun.status = 'approval_resumed'
  sourceRun.approvalDecisions = (sourceRun.approvalDecisions || []).map(decision => {
    if (decision.approvalId !== approvalId) return decision
    return {
      ...decision,
      resumedRunId,
      resumedAt: timestamp
    }
  })
  sourceRun.updatedAt = timestamp
  runs[index] = sourceRun

  await writeRuns(runsPath, runs)
  await appendFile(
    join(target, '.win', 'loops', sourceRun.loopId, 'journal.md'),
    renderApprovalResumeJournal({ sourceRunId, approvalId, resumedRunId, timestamp }),
    'utf8'
  )
}

async function writeRuns(path, runs) {
  const body = runs.map(run => JSON.stringify(run)).join('\n')
  await writeFile(path, `${body}${body ? '\n' : ''}`, 'utf8')
}

function renderApprovalResumeJournal({ sourceRunId, approvalId, resumedRunId, timestamp }) {
  return `
## ${timestamp.slice(0, 10)} - Approval Resumed

- Original Run: ${sourceRunId}
- Approval: ${approvalId}
- Resumed Run: ${resumedRunId}
`
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
