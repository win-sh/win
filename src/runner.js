import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { parseLoopMarkdown } from './loop-parser.js'
import { decideNextRun } from './scheduler.js'

export async function createLoopRun({
  loopId,
  targetRepo,
  trigger = 'manual',
  signal = '',
  now = new Date()
}) {
  if (!loopId) throw new Error('loopId is required')
  if (!targetRepo) throw new Error('targetRepo is required')

  const target = resolve(targetRepo)
  const loopPath = join(target, '.win', 'loops', loopId, 'LOOP.md')
  const markdown = await readFile(loopPath, 'utf8')
  const loop = parseLoopMarkdown(markdown)
  const timestamp = toDate(now).toISOString()
  const id = `${loopId}-${timestamp.replace(/[-:.TZ]/g, '').slice(0, 14)}`
  const status = 'diagnosing'
  const nextRun = decideNextRun({ loopId, trigger, status, now: toDate(now) })
  const run = {
    id,
    loopId,
    title: loop.frontmatter.title,
    trigger,
    signal,
    status,
    createdAt: timestamp,
    nextRun,
    expectedOutcome: expectedOutcomeFor(loopId),
    artifacts: []
  }

  await mkdir(join(target, '.win', 'runs'), { recursive: true })
  await appendFile(join(target, '.win', 'state', 'runs.jsonl'), `${JSON.stringify(run)}\n`, 'utf8')
  await writeFile(join(target, '.win', 'runs', `${id}.md`), renderRunBrief(run, loop), 'utf8')
  await appendFile(join(target, '.win', 'loops', loopId, 'journal.md'), renderJournalEntry(run), 'utf8')

  return run
}

function renderRunBrief(run, loop) {
  return `# ${run.title} Run Brief

Run ID: ${run.id}
Loop: ${run.loopId}
Trigger: ${run.trigger}
Status: ${run.status}

## Signal

${run.signal || 'Manual run without additional signal text.'}

## Goal

${loop.sections.get('Goal')}

## Diagnosis Instructions

${loop.sections.get('Diagnosis')}

## Allowed Actions

${loop.sections.get('Allowed Actions')}

## Authority

${loop.sections.get('Authority')}

## Expected Executor Output

- Summary of diagnosis
- Action taken or proposed
- Artifact links
- Tests or checks run
- Verification recommendation

## Next Scheduled Check

${run.nextRun.at}

Reason: ${run.nextRun.reason}
`
}

function renderJournalEntry(run) {
  return `
## ${run.createdAt.slice(0, 10)} — ${run.id}

### Signal

${run.signal || 'Manual run without additional signal text.'}

### Decision

Run created. Status: ${run.status}.

### Expected Outcome

${run.expectedOutcome}

### Next Run

${run.nextRun.at} — ${run.nextRun.reason}
`
}

function expectedOutcomeFor(loopId) {
  if (loopId.includes('bug')) return 'The selected error group decreases materially without new related regressions.'
  if (loopId.includes('seo')) return 'Target page or query improves clicks, CTR, ranking, or indexed coverage after the verification window.'
  if (loopId.includes('feedback')) return 'The user-facing issue is classified, acted on, and the customer receives a useful response.'
  return 'The target business metric improves or the loop records why no action was warranted.'
}

function toDate(value) {
  return value instanceof Date ? value : new Date(value)
}
