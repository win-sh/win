import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { attachArtifact } from './reporting.js'

const PR_URL_RE = /https:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)\/pull\/(\d+)/g

export function parseArtifactSuggestionsFromLog({ execution, log }) {
  const agentLog = extractAgentLog(log)
  const base = {
    executionId: execution.id,
    runId: execution.runId,
    loopId: execution.loopId
  }
  const suggestions = []
  const seen = new Set()

  for (const match of agentLog.matchAll(PR_URL_RE)) {
    pushUnique(suggestions, seen, {
      ...base,
      kind: 'pr',
      title: `GitHub PR ${match[1]}/${match[2]}#${match[3]}`,
      url: match[0],
      path: '',
      summary: ''
    })
  }

  for (const line of agentLog.split('\n')) {
    const path = parseChangedFile(line)
    if (path) {
      pushUnique(suggestions, seen, {
        ...base,
        kind: 'file',
        title: `Changed file ${path}`,
        url: '',
        path,
        summary: ''
      })
    }

    const summary = parseTestSummary(line)
    if (summary) {
      pushUnique(suggestions, seen, {
        ...base,
        kind: 'test',
        title: 'Test summary',
        url: '',
        path: '',
        summary
      })
    }
  }

  return suggestions
}

function extractAgentLog(log) {
  if (!log.includes('## stdout') && !log.includes('## stderr')) return log

  const sections = []
  const stdout = log.match(/## stdout\n([\s\S]*?)(?:\n## stderr\n|$)/)
  if (stdout) sections.push(stdout[1])
  const stderr = log.match(/## stderr\n([\s\S]*)$/)
  if (stderr) sections.push(stderr[1])
  return sections.join('\n')
}

export async function suggestArtifactsFromExecution({
  targetRepo,
  executionId,
  now = new Date()
}) {
  if (!targetRepo) throw new Error('targetRepo is required')
  if (!executionId) throw new Error('executionId is required')

  const target = resolve(targetRepo)
  const execution = await findExecution(target, executionId)
  const log = await readFile(join(target, execution.logPath), 'utf8')
  const parsed = parseArtifactSuggestionsFromLog({ execution, log })
  if (parsed.length === 0) return []

  const timestamp = toDate(now).toISOString()
  const suggestionsPath = join(target, '.win', 'state', 'artifact-suggestions.jsonl')
  const existing = await readJsonl(suggestionsPath)
  const existingKeys = new Set(existing.map(suggestionKey))
  const existingIds = new Set(existing.map(suggestion => suggestion.id))
  const created = []

  for (const suggestion of parsed) {
    const key = suggestionKey(suggestion)
    if (existingKeys.has(key)) continue

    const row = {
      ...suggestion,
      id: nextSuggestionId({ executionId, existingIds, index: created.length + 1 }),
      status: 'pending',
      createdAt: timestamp
    }
    existingIds.add(row.id)
    existingKeys.add(key)
    created.push(row)
  }

  if (created.length === 0) return []

  await mkdir(join(target, '.win', 'state'), { recursive: true })
  await appendFile(suggestionsPath, created.map(item => JSON.stringify(item)).join('\n') + '\n', 'utf8')
  await appendSuggestionJournal({ target, execution, suggestions: created })
  return created
}

export async function listArtifactSuggestions({ targetRepo }) {
  if (!targetRepo) throw new Error('targetRepo is required')
  return readJsonl(join(resolve(targetRepo), '.win', 'state', 'artifact-suggestions.jsonl'))
}

export async function acceptArtifactSuggestion({
  targetRepo,
  suggestionId,
  now = new Date()
}) {
  if (!targetRepo) throw new Error('targetRepo is required')
  if (!suggestionId) throw new Error('suggestionId is required')

  const target = resolve(targetRepo)
  const suggestionsPath = join(target, '.win', 'state', 'artifact-suggestions.jsonl')
  const suggestions = await readJsonl(suggestionsPath)
  const index = suggestions.findIndex(suggestion => suggestion.id === suggestionId)
  if (index === -1) throw new Error(`Artifact suggestion not found: ${suggestionId}`)

  const suggestion = suggestions[index]
  if (suggestion.status !== 'pending') {
    throw new Error(`Artifact suggestion is already ${suggestion.status}: ${suggestionId}`)
  }

  const timestamp = toDate(now).toISOString()
  const artifact = await attachArtifact({
    targetRepo: target,
    runId: suggestion.runId,
    kind: suggestion.kind,
    title: suggestion.title,
    url: suggestion.url || '',
    path: suggestion.path || '',
    summary: suggestion.summary || '',
    now
  })
  const accepted = {
    ...suggestion,
    status: 'accepted',
    acceptedAt: timestamp,
    artifactId: artifact.id
  }

  suggestions[index] = accepted
  await writeJsonl(suggestionsPath, suggestions)
  return { suggestion: accepted, artifact }
}

export function renderArtifactSuggestionsTable(suggestions) {
  const rows = suggestions.filter(suggestion => suggestion.status === 'pending')
  if (rows.length === 0) return 'Artifact Suggestions\n\nNo pending artifact suggestions.\n'

  const table = [
    ['ID', 'Kind', 'Run', 'Evidence'],
    ['--', '----', '---', '--------'],
    ...rows.map(suggestion => [
      suggestion.id,
      suggestion.kind,
      suggestion.runId,
      suggestion.title || suggestion.url || suggestion.path || suggestion.summary || '-'
    ])
  ]
  return `Artifact Suggestions\n\n${formatTable(table)}\n`
}

async function findExecution(target, executionId) {
  const executions = await readJsonl(join(target, '.win', 'state', 'executions.jsonl'))
  const execution = executions.find(item => item.id === executionId)
  if (!execution) throw new Error(`Execution not found: ${executionId}`)
  return execution
}

function parseChangedFile(line) {
  const trimmed = line.trim()
  const labeled = trimmed.match(/^(?:modified|changed|created|deleted|added):\s+(.+)$/i)
  if (labeled) return normalizePath(labeled[1])

  const gitStatus = trimmed.match(/^(?:M|A|D|R|C|\?\?|MM|AM|AD|MD|UU)\s+(.+)$/)
  if (gitStatus) return normalizePath(gitStatus[1])

  return ''
}

function parseTestSummary(line) {
  const trimmed = line.trim()
  if (!trimmed) return ''
  if (/\btests?\s+(?:passed|pass|passing)\b/i.test(trimmed)) return trimmed
  if (/\b\d+\s+passed\b/i.test(trimmed) && /\b(?:tests?|specs?|files?)\b/i.test(trimmed)) return trimmed
  return ''
}

function normalizePath(value) {
  const path = value
    .replace(/^["']|["']$/g, '')
    .split(' -> ')
    .at(-1)
    .trim()
  if (!path || path.includes('://')) return ''
  return path
}

function pushUnique(suggestions, seen, suggestion) {
  const key = suggestionKey(suggestion)
  if (seen.has(key)) return
  seen.add(key)
  suggestions.push(suggestion)
}

function suggestionKey(suggestion) {
  return [
    suggestion.executionId,
    suggestion.kind,
    suggestion.url || '',
    suggestion.path || '',
    suggestion.summary || ''
  ].join('\t')
}

function nextSuggestionId({ executionId, existingIds, index }) {
  const prefix = `${executionId}-suggestion`
  let number = index
  let id = `${prefix}-${String(number).padStart(2, '0')}`
  while (existingIds.has(id)) {
    number += 1
    id = `${prefix}-${String(number).padStart(2, '0')}`
  }
  return id
}

async function appendSuggestionJournal({ target, execution, suggestions }) {
  await appendFile(
    join(target, '.win', 'loops', execution.loopId, 'journal.md'),
    `
## ${suggestions[0].createdAt.slice(0, 10)} - Artifact Suggestions

- Run: ${execution.runId}
- Execution: ${execution.id}
- Suggestions: ${suggestions.length}
- Accept: win-loops artifact accept <suggestion-id>
`,
    'utf8'
  )
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

async function writeJsonl(path, rows) {
  const body = rows.map(row => JSON.stringify(row)).join('\n')
  await writeFile(path, `${body}${body ? '\n' : ''}`, 'utf8')
}

function formatTable(rows) {
  const widths = rows[0].map((_, index) => Math.max(...rows.map(row => String(row[index]).length)))
  return rows
    .map(row => row.map((cell, index) => String(cell).padEnd(widths[index])).join('  '))
    .join('\n')
}

function toDate(value) {
  return value instanceof Date ? value : new Date(value)
}
