import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { installLoop } from '../src/installer.js'
import { createLoopRun } from '../src/runner.js'
import {
  acceptArtifactSuggestion,
  listArtifactSuggestions,
  parseArtifactSuggestionsFromLog,
  renderArtifactSuggestionsTable,
  suggestArtifactsFromExecution
} from '../src/artifact-suggestions.js'

test('parseArtifactSuggestionsFromLog extracts PRs, changed files, and test summaries', () => {
  const suggestions = parseArtifactSuggestionsFromLog({
    execution: {
      id: 'run-1-exec-20260616090000',
      runId: 'run-1',
      loopId: 'bug-autofix'
    },
    log: [
      'Opened PR https://github.com/acme/app/pull/123',
      'modified: src/checkout.js',
      'Tests passed: 14 passed, 0 failed'
    ].join('\n')
  })

  assert.deepEqual(suggestions.map(suggestion => suggestion.kind), ['pr', 'file', 'test'])
  assert.equal(suggestions[0].title, 'GitHub PR acme/app#123')
  assert.equal(suggestions[0].url, 'https://github.com/acme/app/pull/123')
  assert.equal(suggestions[1].path, 'src/checkout.js')
  assert.match(suggestions[2].summary, /14 passed/)
})

test('suggestArtifactsFromExecution stores pending suggestions and acceptance attaches proof', async () => {
  const target = await mkdtemp(join(tmpdir(), 'win-loops-artifact-suggestions-'))

  try {
    const run = await createInstalledRun(target)
    const execution = {
      id: 'run-exec-1',
      runId: run.id,
      loopId: 'bug-autofix',
      agent: 'codex',
      status: 'succeeded',
      logPath: '.win/executions/run-exec-1.log',
      startedAt: '2026-06-16T09:00:00.000Z',
      finishedAt: '2026-06-16T09:01:00.000Z'
    }

    await writeFile(join(target, '.win', 'state', 'executions.jsonl'), `${JSON.stringify(execution)}\n`, 'utf8')
    await writeFile(
      join(target, execution.logPath),
      [
        'Execution: run-exec-1',
        'Run: run-1',
        '',
        '## stdout',
        'Opened PR https://github.com/acme/app/pull/123',
        'M src/checkout.js',
        'Tests passed: 14 passed, 0 failed'
      ].join('\n'),
      'utf8'
    )

    const created = await suggestArtifactsFromExecution({
      targetRepo: target,
      executionId: execution.id,
      now: new Date('2026-06-16T09:02:00.000Z')
    })
    assert.equal(created.length, 3)
    assert.equal(created[0].status, 'pending')

    const listed = await listArtifactSuggestions({ targetRepo: target })
    assert.equal(listed.length, 3)
    assert.match(renderArtifactSuggestionsTable(listed), /GitHub PR acme\/app#123/)

    const accepted = await acceptArtifactSuggestion({
      targetRepo: target,
      suggestionId: created[0].id,
      now: new Date('2026-06-16T09:05:00.000Z')
    })
    assert.equal(accepted.artifact.kind, 'pr')
    assert.equal(accepted.suggestion.status, 'accepted')

    const artifacts = parseJsonl(await readFile(join(target, '.win', 'state', 'artifacts.jsonl'), 'utf8'))
    assert.equal(artifacts.length, 1)
    assert.equal(artifacts[0].url, 'https://github.com/acme/app/pull/123')

    const suggestions = parseJsonl(await readFile(join(target, '.win', 'state', 'artifact-suggestions.jsonl'), 'utf8'))
    assert.equal(suggestions[0].status, 'accepted')
    assert.equal(suggestions[0].artifactId, accepted.artifact.id)
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
    signal: 'Checkout crash repeated 21 times.',
    now: new Date('2026-06-16T08:00:00.000Z')
  })
}

function parseJsonl(raw) {
  return raw
    .split('\n')
    .filter(Boolean)
    .map(line => JSON.parse(line))
}
