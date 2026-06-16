import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { installLoop } from '../src/installer.js'

test('installLoop installs loop contract, executor skill, and state files into a target repo', async () => {
  const target = await mkdtemp(join(tmpdir(), 'win-loops-install-'))

  try {
    const result = await installLoop({
      loopId: 'bug-autofix',
      targetRepo: target,
      agent: 'codex',
      sourceRoot: new URL('..', import.meta.url)
    })

    assert.equal(result.loopId, 'bug-autofix')
    assert.ok(existsSync(join(target, '.win', 'loops', 'bug-autofix', 'LOOP.md')))
    assert.ok(existsSync(join(target, '.win', 'loops', 'bug-autofix', 'journal.md')))
    assert.ok(existsSync(join(target, '.win', 'state', 'runs.jsonl')))
    assert.ok(existsSync(join(target, '.win', 'state', 'artifacts.jsonl')))
    assert.ok(existsSync(join(target, '.agents', 'skills', 'win-bug-autofix', 'SKILL.md')))

    const skill = await readFile(join(target, '.agents', 'skills', 'win-bug-autofix', 'SKILL.md'), 'utf8')
    assert.match(skill, /scoped loop execution/i)
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})
