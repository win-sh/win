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
