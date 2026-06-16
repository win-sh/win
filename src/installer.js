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
  const skillDir = join(target, '.agents', 'skills', `win-${loopId}`)

  await mkdir(loopTargetDir, { recursive: true })
  await mkdir(stateDir, { recursive: true })
  await mkdir(runsDir, { recursive: true })
  await mkdir(skillDir, { recursive: true })

  await writeFile(join(loopTargetDir, 'LOOP.md'), pack.loopMarkdown, 'utf8')
  await writeFile(join(loopTargetDir, 'journal.md'), pack.journalMarkdown, 'utf8')
  await writeFile(join(loopTargetDir, 'state.json'), `${JSON.stringify(defaultLoopState(loopId, agent), null, 2)}\n`, 'utf8')
  await writeFile(join(skillDir, 'SKILL.md'), withInstallHeader(pack.skillMarkdown, agent), 'utf8')
  await ensureFile(join(stateDir, 'runs.jsonl'))
  await ensureFile(join(stateDir, 'artifacts.jsonl'))
  await ensureFile(join(stateDir, 'outcomes.jsonl'))
  await ensureFile(join(stateDir, 'approvals.jsonl'))

  return {
    loopId,
    targetRepo: target,
    agent,
    loopPath: join(loopTargetDir, 'LOOP.md'),
    skillPath: join(skillDir, 'SKILL.md')
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
