import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { installLoop } from '../src/installer.js'
import { createLoopRun } from '../src/runner.js'

test('createLoopRun writes a run record, run brief, and journal entry with adaptive next run', async () => {
  const target = await mkdtemp(join(tmpdir(), 'win-loops-run-'))

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
      signal: 'Sentry error group checkout-null-pointer repeated 21 times in 1 hour.',
      now: new Date('2026-06-16T08:00:00.000Z')
    })

    assert.equal(run.loopId, 'bug-autofix')
    assert.equal(run.status, 'diagnosing')
    assert.equal(run.nextRun.reason, 'manual trigger created an execution brief; follow up after the executor reports an artifact')
    assert.equal(run.nextRun.at, '2026-06-16T14:00:00.000Z')

    const runs = await readFile(join(target, '.win', 'state', 'runs.jsonl'), 'utf8')
    assert.match(runs, /checkout-null-pointer/)

    const brief = await readFile(join(target, '.win', 'runs', `${run.id}.md`), 'utf8')
    assert.match(brief, /Bug Autofix/)
    assert.match(brief, /Expected Executor Output/)

    const journal = await readFile(join(target, '.win', 'loops', 'bug-autofix', 'journal.md'), 'utf8')
    assert.match(journal, /Run created/)
    assert.match(journal, /checkout-null-pointer/)
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('createLoopRun makes unique run ids for same-second loop runs', async () => {
  const target = await mkdtemp(join(tmpdir(), 'win-loops-run-id-'))

  try {
    await installLoop({
      loopId: 'bug-autofix',
      targetRepo: target,
      agent: 'codex',
      sourceRoot: new URL('..', import.meta.url)
    })

    const now = new Date('2026-06-16T08:00:00.000Z')
    const first = await createLoopRun({
      loopId: 'bug-autofix',
      targetRepo: target,
      trigger: 'manual',
      signal: 'First run.',
      now
    })
    const second = await createLoopRun({
      loopId: 'bug-autofix',
      targetRepo: target,
      trigger: 'approval',
      signal: 'Second run in the same second.',
      now
    })

    assert.notEqual(first.id, second.id)

    const runs = parseJsonl(await readFile(join(target, '.win', 'state', 'runs.jsonl'), 'utf8'))
    assert.equal(new Set(runs.map(run => run.id)).size, 2)

    const secondBrief = await readFile(join(target, '.win', 'runs', `${second.id}.md`), 'utf8')
    assert.match(secondBrief, /Second run in the same second/)
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
