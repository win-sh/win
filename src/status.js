import { readdir, readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

export async function getInstalledLoopStatus({ targetRepo = process.cwd(), now = new Date() } = {}) {
  const target = resolve(targetRepo)
  const loopsDir = join(target, '.win', 'loops')
  const runsPath = join(target, '.win', 'state', 'runs.jsonl')
  const entries = await safeReaddir(loopsDir)
  const runs = await readRuns(runsPath)
  const rows = []

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const loopId = entry.name
    const state = await readLoopState(join(loopsDir, loopId, 'state.json'), loopId)
    const latestRun = [...runs].reverse().find(run => run.loopId === loopId) || null
    const nextRunAt = state.nextRunAt || latestRun?.nextRun?.at || null

    rows.push({
      id: loopId,
      enabled: state.enabled !== false,
      status: latestRun?.status || 'watching',
      nextRunAt,
      countdown: nextRunAt ? formatCountdown(new Date(nextRunAt), toDate(now)) : 'not scheduled',
      lastRunId: latestRun?.id || '',
      lastRunAt: latestRun?.createdAt || ''
    })
  }

  return rows.sort((a, b) => a.id.localeCompare(b.id))
}

export function renderStatusTable(rows) {
  const headers = ['Loop', 'State', 'Status', 'Next run', 'Countdown', 'Last run']
  const body = rows.map(row => [
    row.id,
    row.enabled ? 'enabled' : 'disabled',
    row.status,
    row.nextRunAt || '-',
    row.countdown,
    row.lastRunAt || '-'
  ])

  return renderTable([headers, ...body])
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

function formatCountdown(next, now) {
  const diffMs = next.getTime() - now.getTime()
  if (diffMs <= 0) return 'due'

  const totalMinutes = Math.round(diffMs / 60000)
  const days = Math.floor(totalMinutes / 1440)
  const hours = Math.floor((totalMinutes % 1440) / 60)
  const minutes = totalMinutes % 60

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
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
