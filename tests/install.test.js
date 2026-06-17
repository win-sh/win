import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
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
    assert.ok(existsSync(join(target, '.win', 'state', 'executions.jsonl')))
    assert.ok(existsSync(join(target, '.win', 'executions')))
    assert.ok(existsSync(join(target, '.agents', 'skills', 'win-bug-autofix', 'SKILL.md')))
    assert.ok(existsSync(join(target, '.claude', 'skills', 'win-bug-autofix', 'SKILL.md')))
    assert.ok(existsSync(join(target, 'AGENTS.md')))
    assert.ok(existsSync(join(target, 'CLAUDE.md')))

    const skill = await readFile(join(target, '.agents', 'skills', 'win-bug-autofix', 'SKILL.md'), 'utf8')
    const claudeSkill = await readFile(join(target, '.claude', 'skills', 'win-bug-autofix', 'SKILL.md'), 'utf8')
    const agentsGuidance = await readFile(join(target, 'AGENTS.md'), 'utf8')
    const claudeGuidance = await readFile(join(target, 'CLAUDE.md'), 'utf8')
    assert.match(skill, /scoped loop execution/i)
    assert.equal(claudeSkill, skill)
    assert.match(agentsGuidance, /win\.sh Loops/)
    assert.match(agentsGuidance, /\.agents\/skills\/win-<loop-id>\/SKILL\.md/)
    assert.match(claudeGuidance, /\.claude\/skills\/win-<loop-id>\/SKILL\.md/)
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('installLoop preserves existing guidance files and updates the marked win section once', async () => {
  const target = await mkdtemp(join(tmpdir(), 'win-loops-guidance-'))

  try {
    await writeFile(join(target, 'AGENTS.md'), '# Project Agents\n\nKeep this Codex rule.\n', 'utf8')
    await writeFile(join(target, 'CLAUDE.md'), '# Project Claude\n\nKeep this Claude rule.\n', 'utf8')

    await installLoop({
      loopId: 'bug-autofix',
      targetRepo: target,
      agent: 'codex',
      sourceRoot: new URL('..', import.meta.url)
    })
    await installLoop({
      loopId: 'seo-growth',
      targetRepo: target,
      agent: 'claude-code',
      sourceRoot: new URL('..', import.meta.url)
    })

    const agentsGuidance = await readFile(join(target, 'AGENTS.md'), 'utf8')
    const claudeGuidance = await readFile(join(target, 'CLAUDE.md'), 'utf8')

    assert.match(agentsGuidance, /Keep this Codex rule/)
    assert.match(claudeGuidance, /Keep this Claude rule/)
    assert.equal((agentsGuidance.match(/<!-- win-loops:start -->/g) || []).length, 1)
    assert.equal((claudeGuidance.match(/<!-- win-loops:start -->/g) || []).length, 1)
    assert.match(agentsGuidance, /most recently installed loop is `seo-growth`/)
    assert.match(claudeGuidance, /most recently installed loop is `seo-growth`/)
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})
