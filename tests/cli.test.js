import test from 'node:test'
import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

test('CLI run bug-autofix --fixture creates a run from a sentry-like fixture', async () => {
  const target = await mkdtemp(join(tmpdir(), 'win-loops-cli-'))

  try {
    await execFileAsync(process.execPath, ['bin/win-loops.js', 'install', 'bug-autofix', '--repo', target], {
      cwd: new URL('..', import.meta.url).pathname
    })

    const { stdout } = await execFileAsync(process.execPath, [
      'bin/win-loops.js',
      'run',
      'bug-autofix',
      '--repo',
      target,
      '--fixture',
      'loops/bug-autofix/examples/sentry-error-group.json'
    ], {
      cwd: new URL('..', import.meta.url).pathname
    })

    const run = JSON.parse(stdout)
    const brief = await readFile(join(target, '.win', 'runs', `${run.id}.md`), 'utf8')

    assert.match(brief, /checkout-null-pointer/)
    assert.match(brief, /3 paying users/)
    assert.match(brief, /Do not merge/)
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('CLI run bug-autofix --connector-fixture creates a run from Sentry and GitHub snapshots', async () => {
  const target = await mkdtemp(join(tmpdir(), 'win-loops-cli-connector-'))

  try {
    await execFileAsync(process.execPath, ['bin/win-loops.js', 'install', 'bug-autofix', '--repo', target], {
      cwd: new URL('..', import.meta.url).pathname
    })

    const { stdout } = await execFileAsync(process.execPath, [
      'bin/win-loops.js',
      'run',
      'bug-autofix',
      '--repo',
      target,
      '--connector-fixture',
      'loops/bug-autofix/examples/connector-snapshot.json'
    ], {
      cwd: new URL('..', import.meta.url).pathname
    })

    const run = JSON.parse(stdout)
    const brief = await readFile(join(target, '.win', 'runs', `${run.id}.md`), 'utf8')

    assert.match(brief, /Connector Evidence/)
    assert.match(brief, /https:\/\/sentry\.io\/organizations\/acme\/issues\/9821\//)
    assert.match(brief, /acme\/melies-web/)
    assert.match(brief, /abc1234/)
    assert.match(brief, /2 paying users/)
    assert.match(brief, /Do not merge/)
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('CLI run seo-growth --connector-fixture creates a run from GSC and competitor snapshots', async () => {
  const target = await mkdtemp(join(tmpdir(), 'win-loops-cli-seo-connector-'))

  try {
    await execFileAsync(process.execPath, ['bin/win-loops.js', 'install', 'seo-growth', '--repo', target], {
      cwd: new URL('..', import.meta.url).pathname
    })

    const { stdout } = await execFileAsync(process.execPath, [
      'bin/win-loops.js',
      'run',
      'seo-growth',
      '--repo',
      target,
      '--connector-fixture',
      'loops/seo-growth/examples/connector-snapshot.json'
    ], {
      cwd: new URL('..', import.meta.url).pathname
    })

    const run = JSON.parse(stdout)
    const brief = await readFile(join(target, '.win', 'runs', `${run.id}.md`), 'utf8')

    assert.match(brief, /Connector Evidence/)
    assert.match(brief, /ai video generator for ads/)
    assert.match(brief, /ranking-improvement/)
    assert.match(brief, /verify after 21 days/)
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('CLI run feedback-to-fix --connector-fixture creates a run from support snapshots', async () => {
  const target = await mkdtemp(join(tmpdir(), 'win-loops-cli-feedback-connector-'))

  try {
    await execFileAsync(process.execPath, ['bin/win-loops.js', 'install', 'feedback-to-fix', '--repo', target], {
      cwd: new URL('..', import.meta.url).pathname
    })

    const { stdout } = await execFileAsync(process.execPath, [
      'bin/win-loops.js',
      'run',
      'feedback-to-fix',
      '--repo',
      target,
      '--connector-fixture',
      'loops/feedback-to-fix/examples/connector-snapshot.json'
    ], {
      cwd: new URL('..', import.meta.url).pathname
    })

    const run = JSON.parse(stdout)
    const brief = await readFile(join(target, '.win', 'runs', `${run.id}.md`), 'utf8')

    assert.match(brief, /Representative Quotes/)
    assert.match(brief, /CSV export fails every time/)
    assert.match(brief, /Draft Customer Reply/)
    assert.match(brief, /Do not send/)
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('CLI tick shows scheduled loop actions and writes due run briefs', async () => {
  const target = await mkdtemp(join(tmpdir(), 'win-loops-cli-tick-'))

  try {
    await execFileAsync(process.execPath, ['bin/win-loops.js', 'install', 'bug-autofix', '--repo', target], {
      cwd: new URL('..', import.meta.url).pathname
    })

    const { stdout } = await execFileAsync(process.execPath, ['bin/win-loops.js', 'tick', '--repo', target], {
      cwd: new URL('..', import.meta.url).pathname
    })

    assert.match(stdout, /Loop/)
    assert.match(stdout, /bug-autofix/)
    assert.match(stdout, /ran/)

    const runs = await readFile(join(target, '.win', 'state', 'runs.jsonl'), 'utf8')
    assert.match(runs, /"trigger":"tick"/)
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('CLI reporting commands attach artifacts, outcomes, and approvals to a run', async () => {
  const target = await mkdtemp(join(tmpdir(), 'win-loops-cli-reporting-'))

  try {
    await execFileAsync(process.execPath, ['bin/win-loops.js', 'install', 'bug-autofix', '--repo', target], {
      cwd: new URL('..', import.meta.url).pathname
    })

    const { stdout: runStdout } = await execFileAsync(process.execPath, [
      'bin/win-loops.js',
      'run',
      'bug-autofix',
      '--repo',
      target,
      '--signal',
      'Checkout crash repeated 21 times.'
    ], {
      cwd: new URL('..', import.meta.url).pathname
    })
    const run = JSON.parse(runStdout)

    const { stdout: artifactStdout } = await execFileAsync(process.execPath, [
      'bin/win-loops.js',
      'artifact',
      'attach',
      run.id,
      '--repo',
      target,
      '--kind',
      'pr',
      '--url',
      'https://github.com/acme/app/pull/123',
      '--title',
      'Checkout fix'
    ], {
      cwd: new URL('..', import.meta.url).pathname
    })
    assert.equal(JSON.parse(artifactStdout).kind, 'pr')

    const { stdout: outcomeStdout } = await execFileAsync(process.execPath, [
      'bin/win-loops.js',
      'outcome',
      'record',
      run.id,
      '--repo',
      target,
      '--status',
      'improved',
      '--metric',
      'error_rate_down',
      '--summary',
      'Error rate dropped.'
    ], {
      cwd: new URL('..', import.meta.url).pathname
    })
    assert.equal(JSON.parse(outcomeStdout).status, 'improved')

    const { stdout: approvalStdout } = await execFileAsync(process.execPath, [
      'bin/win-loops.js',
      'approval',
      'request',
      run.id,
      '--repo',
      target,
      '--action',
      'Merge PR',
      '--reason',
      'Checkout code changed.',
      '--risk',
      'medium'
    ], {
      cwd: new URL('..', import.meta.url).pathname
    })
    const approval = JSON.parse(approvalStdout)
    assert.equal(approval.status, 'pending')

    const { stdout: approveStdout } = await execFileAsync(process.execPath, [
      'bin/win-loops.js',
      'approval',
      'approve',
      approval.id,
      '--repo',
      target,
      '--by',
      'founder',
      '--note',
      'Approved from CLI.'
    ], {
      cwd: new URL('..', import.meta.url).pathname
    })
    assert.equal(JSON.parse(approveStdout).status, 'approved')

    const { stdout: nextApprovalStdout } = await execFileAsync(process.execPath, [
      'bin/win-loops.js',
      'approval',
      'request',
      run.id,
      '--repo',
      target,
      '--action',
      'Roll back PR',
      '--reason',
      'Metric got worse.',
      '--risk',
      'low'
    ], {
      cwd: new URL('..', import.meta.url).pathname
    })
    const nextApproval = JSON.parse(nextApprovalStdout)

    const { stdout: rejectStdout } = await execFileAsync(process.execPath, [
      'bin/win-loops.js',
      'approval',
      'reject',
      nextApproval.id,
      '--repo',
      target,
      '--by',
      'founder',
      '--note',
      'Rejecting rollback for now.'
    ], {
      cwd: new URL('..', import.meta.url).pathname
    })
    assert.equal(JSON.parse(rejectStdout).status, 'rejected')

    const runs = await readFile(join(target, '.win', 'state', 'runs.jsonl'), 'utf8')
    assert.match(runs, /"artifacts":/)
    assert.match(runs, /"latestOutcome":/)
    assert.match(runs, /"approvalDecisions":/)
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('CLI inbox and next show the operator work queue', async () => {
  const target = await mkdtemp(join(tmpdir(), 'win-loops-cli-inbox-'))

  try {
    await execFileAsync(process.execPath, ['bin/win-loops.js', 'install', 'bug-autofix', '--repo', target], {
      cwd: new URL('..', import.meta.url).pathname
    })

    const { stdout: runStdout } = await execFileAsync(process.execPath, [
      'bin/win-loops.js',
      'run',
      'bug-autofix',
      '--repo',
      target,
      '--signal',
      'Checkout crash repeated 21 times.'
    ], {
      cwd: new URL('..', import.meta.url).pathname
    })
    const run = JSON.parse(runStdout)

    const { stdout: approvalStdout } = await execFileAsync(process.execPath, [
      'bin/win-loops.js',
      'approval',
      'request',
      run.id,
      '--repo',
      target,
      '--action',
      'Merge PR',
      '--reason',
      'Touches checkout.',
      '--risk',
      'medium'
    ], {
      cwd: new URL('..', import.meta.url).pathname
    })
    const approval = JSON.parse(approvalStdout)

    await execFileAsync(process.execPath, [
      'bin/win-loops.js',
      'run',
      'bug-autofix',
      '--repo',
      target,
      '--signal',
      'Investigate separate checkout warning.'
    ], {
      cwd: new URL('..', import.meta.url).pathname
    })

    const { stdout: inboxStdout } = await execFileAsync(process.execPath, [
      'bin/win-loops.js',
      'inbox',
      '--repo',
      target
    ], {
      cwd: new URL('..', import.meta.url).pathname
    })
    assert.match(inboxStdout, /Operator Inbox/)
    assert.match(inboxStdout, /approval/)
    assert.match(inboxStdout, /execution/)

    const { stdout: nextStdout } = await execFileAsync(process.execPath, [
      'bin/win-loops.js',
      'next',
      '--repo',
      target
    ], {
      cwd: new URL('..', import.meta.url).pathname
    })
    assert.match(nextStdout, new RegExp(approval.id))
    assert.match(nextStdout, /approval approve/)
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('CLI exec --dry-run renders an agent handoff for the next executable run', async () => {
  const target = await mkdtemp(join(tmpdir(), 'win-loops-cli-exec-'))

  try {
    await execFileAsync(process.execPath, ['bin/win-loops.js', 'install', 'bug-autofix', '--repo', target], {
      cwd: new URL('..', import.meta.url).pathname
    })

    const { stdout: runStdout } = await execFileAsync(process.execPath, [
      'bin/win-loops.js',
      'run',
      'bug-autofix',
      '--repo',
      target,
      '--signal',
      'Checkout crash repeated 21 times.'
    ], {
      cwd: new URL('..', import.meta.url).pathname
    })
    const run = JSON.parse(runStdout)

    const { stdout } = await execFileAsync(process.execPath, [
      'bin/win-loops.js',
      'exec',
      '--repo',
      target,
      '--agent',
      'codex',
      '--dry-run'
    ], {
      cwd: new URL('..', import.meta.url).pathname
    })

    assert.match(stdout, /Dry Run/)
    assert.match(stdout, /codex /)
    assert.match(stdout, /Use the win-bug-autofix skill/)
    assert.match(stdout, new RegExp(`\\.win/runs/${run.id}\\.md`))
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('CLI exec captures real command output when dry-run is omitted', async () => {
  const target = await mkdtemp(join(tmpdir(), 'win-loops-cli-exec-real-'))

  try {
    await execFileAsync(process.execPath, ['bin/win-loops.js', 'install', 'bug-autofix', '--repo', target], {
      cwd: new URL('..', import.meta.url).pathname
    })

    const { stdout: runStdout } = await execFileAsync(process.execPath, [
      'bin/win-loops.js',
      'run',
      'bug-autofix',
      '--repo',
      target,
      '--signal',
      'Checkout crash repeated 21 times.'
    ], {
      cwd: new URL('..', import.meta.url).pathname
    })
    const run = JSON.parse(runStdout)

    const { stdout } = await execFileAsync(process.execPath, [
      'bin/win-loops.js',
      'exec',
      '--repo',
      target,
      '--agent',
      'codex',
      '--run',
      run.id
    ], {
      cwd: new URL('..', import.meta.url).pathname,
      env: {
        ...process.env,
        WIN_LOOPS_CODEX_EXECUTABLE: process.execPath,
        WIN_LOOPS_CODEX_ARGS_JSON: JSON.stringify(['-e', 'console.log("cli agent stdout")'])
      }
    })

    const execution = JSON.parse(stdout)
    assert.equal(execution.status, 'succeeded')

    const log = await readFile(join(target, execution.logPath), 'utf8')
    assert.match(log, /cli agent stdout/)

    const runs = await readFile(join(target, '.win', 'state', 'runs.jsonl'), 'utf8')
    assert.match(runs, /"status":"executed"/)
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('CLI artifact suggestions can be listed and accepted after execution', async () => {
  const target = await mkdtemp(join(tmpdir(), 'win-loops-cli-artifact-suggestions-'))

  try {
    await execFileAsync(process.execPath, ['bin/win-loops.js', 'install', 'bug-autofix', '--repo', target], {
      cwd: new URL('..', import.meta.url).pathname
    })

    const { stdout: runStdout } = await execFileAsync(process.execPath, [
      'bin/win-loops.js',
      'run',
      'bug-autofix',
      '--repo',
      target,
      '--signal',
      'Checkout crash repeated 21 times.'
    ], {
      cwd: new URL('..', import.meta.url).pathname
    })
    const run = JSON.parse(runStdout)

    await execFileAsync(process.execPath, [
      'bin/win-loops.js',
      'exec',
      '--repo',
      target,
      '--agent',
      'codex',
      '--run',
      run.id
    ], {
      cwd: new URL('..', import.meta.url).pathname,
      env: {
        ...process.env,
        WIN_LOOPS_CODEX_EXECUTABLE: process.execPath,
        WIN_LOOPS_CODEX_ARGS_JSON: JSON.stringify([
          '-e',
          [
            'console.log("Opened PR https://github.com/acme/app/pull/123")',
            'console.log("modified: src/checkout.js")',
            'console.log("Tests passed: 14 passed, 0 failed")'
          ].join(';')
        ])
      }
    })

    const { stdout: suggestionsStdout } = await execFileAsync(process.execPath, [
      'bin/win-loops.js',
      'artifact',
      'suggestions',
      '--repo',
      target
    ], {
      cwd: new URL('..', import.meta.url).pathname
    })
    assert.match(suggestionsStdout, /Artifact Suggestions/)
    assert.match(suggestionsStdout, /GitHub PR acme\/app#123/)

    const suggestions = parseJsonl(await readFile(join(target, '.win', 'state', 'artifact-suggestions.jsonl'), 'utf8'))
    const { stdout: acceptStdout } = await execFileAsync(process.execPath, [
      'bin/win-loops.js',
      'artifact',
      'accept',
      suggestions[0].id,
      '--repo',
      target
    ], {
      cwd: new URL('..', import.meta.url).pathname
    })
    const accepted = JSON.parse(acceptStdout)
    assert.equal(accepted.artifact.kind, 'pr')
    assert.equal(accepted.suggestion.status, 'accepted')

    const artifacts = await readFile(join(target, '.win', 'state', 'artifacts.jsonl'), 'utf8')
    assert.match(artifacts, /https:\/\/github\.com\/acme\/app\/pull\/123/)
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
