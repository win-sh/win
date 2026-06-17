import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { loadLoop } from './catalog.js'

export async function installLoop({ loopId, targetRepo, agent = 'codex', sourceRoot }) {
  if (!loopId) throw new Error('loopId is required')
  if (!targetRepo) throw new Error('targetRepo is required')

  const target = resolve(targetRepo)
  const pack = await loadLoop(loopId, sourceRoot)
  const loopTargetDir = join(target, '.win', 'loops', loopId)
  const stateDir = join(target, '.win', 'state')
  const runsDir = join(target, '.win', 'runs')
  const executionsDir = join(target, '.win', 'executions')
  const codexSkillDir = join(target, '.agents', 'skills', `win-${loopId}`)
  const claudeSkillDir = join(target, '.claude', 'skills', `win-${loopId}`)

  await mkdir(loopTargetDir, { recursive: true })
  await mkdir(stateDir, { recursive: true })
  await mkdir(runsDir, { recursive: true })
  await mkdir(executionsDir, { recursive: true })
  await mkdir(codexSkillDir, { recursive: true })
  await mkdir(claudeSkillDir, { recursive: true })

  await writeFile(join(loopTargetDir, 'LOOP.md'), pack.loopMarkdown, 'utf8')
  await writeFile(join(loopTargetDir, 'journal.md'), pack.journalMarkdown, 'utf8')
  await writeFile(join(loopTargetDir, 'state.json'), `${JSON.stringify(defaultLoopState(loopId, agent), null, 2)}\n`, 'utf8')
  const installedSkill = withInstallHeader(pack.skillMarkdown, agent)
  await writeFile(join(codexSkillDir, 'SKILL.md'), installedSkill, 'utf8')
  await writeFile(join(claudeSkillDir, 'SKILL.md'), installedSkill, 'utf8')
  await ensureAgentGuidance({ target, loopId })
  await ensureFile(join(stateDir, 'runs.jsonl'))
  await ensureFile(join(stateDir, 'artifacts.jsonl'))
  await ensureFile(join(stateDir, 'artifact-suggestions.jsonl'))
  await ensureFile(join(stateDir, 'outcomes.jsonl'))
  await ensureFile(join(stateDir, 'approvals.jsonl'))
  await ensureFile(join(stateDir, 'executions.jsonl'))

  return {
    loopId,
    targetRepo: target,
    agent,
    loopPath: join(loopTargetDir, 'LOOP.md'),
    skillPath: join(codexSkillDir, 'SKILL.md'),
    codexSkillPath: join(codexSkillDir, 'SKILL.md'),
    claudeSkillPath: join(claudeSkillDir, 'SKILL.md'),
    guidancePaths: [
      join(target, 'AGENTS.md'),
      join(target, 'CLAUDE.md')
    ]
  }
}

export async function setLoopEnabled({ loopId, targetRepo, enabled }) {
  if (!loopId) throw new Error('loopId is required')
  if (!targetRepo) throw new Error('targetRepo is required')

  const statePath = join(resolve(targetRepo), '.win', 'loops', loopId, 'state.json')
  const raw = await readFile(statePath, 'utf8')
  const state = JSON.parse(raw)
  state.enabled = Boolean(enabled)
  state.updatedAt = new Date().toISOString()
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8')
  return state
}

async function ensureFile(path) {
  try {
    await readFile(path, 'utf8')
  } catch {
    await writeFile(path, '', 'utf8')
  }
}

function withInstallHeader(skillMarkdown, agent) {
  return skillMarkdown.replace(
    /^#\s+/m,
    `<!-- Installed by win-loops for ${agent}. This is a scoped loop execution skill. -->\n\n# `
  )
}

async function ensureAgentGuidance({ target, loopId }) {
  const section = renderAgentGuidance(loopId)
  await upsertMarkedSection(join(target, 'AGENTS.md'), section)
  await upsertMarkedSection(join(target, 'CLAUDE.md'), section)
}

async function upsertMarkedSection(path, section) {
  let existing = ''
  try {
    existing = await readFile(path, 'utf8')
  } catch {
    await writeFile(path, section, 'utf8')
    return
  }

  const start = '<!-- win-loops:start -->'
  const end = '<!-- win-loops:end -->'
  const pattern = new RegExp(`${escapeRegExp(start)}[\\s\\S]*?${escapeRegExp(end)}\\n?`, 'm')
  const next = pattern.test(existing)
    ? existing.replace(pattern, section)
    : `${existing.trimEnd()}\n\n${section}`
  await writeFile(path, next, 'utf8')
}

function renderAgentGuidance(loopId) {
  return [
    '<!-- win-loops:start -->',
    '## win.sh Loops',
    '',
    `This repo has win.sh business loops installed. The most recently installed loop is \`${loopId}\`.`,
    '',
    '- Loop contracts and journals live in `.win/loops/<loop-id>/`.',
    '- Run briefs live in `.win/runs/` and are the source of truth for the next agent task.',
    '- Codex project skills live in `.agents/skills/win-<loop-id>/SKILL.md`.',
    '- Claude Code project skills live in `.claude/skills/win-<loop-id>/SKILL.md`.',
    '- Use `win status --repo .`, `win inbox --repo .`, and `win next --repo .` to inspect loop state.',
    '- Execute only the run brief selected by `win next --repo .`; stay within the authority rules in `.win/loops/<loop-id>/LOOP.md`.',
    '- Record proof with `win artifact attach` or accept detected proof with `win artifact accept` after execution.',
    '<!-- win-loops:end -->',
    ''
  ].join('\n')
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function defaultLoopState(loopId, agent) {
  const now = new Date().toISOString()
  return {
    id: loopId,
    enabled: true,
    agent,
    installedAt: now,
    updatedAt: now
  }
}
