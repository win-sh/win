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
