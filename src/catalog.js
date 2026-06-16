import { readdir, readFile, stat } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseLoopMarkdown } from './loop-parser.js'

export async function loadCatalog(loopsPath = defaultLoopsPath()) {
  const root = normalizePath(loopsPath)
  const entries = await readdir(root, { withFileTypes: true })
  const loops = []

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const loopDir = join(root, entry.name)
    const loopPath = join(loopDir, 'LOOP.md')
    const skillPath = join(loopDir, 'SKILL.md')
    const journalPath = join(loopDir, 'journal.md')
    const exampleInputPath = join(loopDir, 'examples', 'input.json')
    const exampleBriefPath = join(loopDir, 'examples', 'run-brief.md')
    const evalPath = join(loopDir, 'evals', 'contract.json')

    if (!(await exists(loopPath))) continue

    const markdown = await readFile(loopPath, 'utf8')
    const loop = parseLoopMarkdown(markdown)

    loops.push({
      id: entry.name,
      dir: loopDir,
      loopPath,
      skillPath,
      journalPath,
      exampleInputPath,
      exampleBriefPath,
      evalPath,
      loop,
      skillExists: await exists(skillPath),
      journalExists: await exists(journalPath),
      exampleInputExists: await exists(exampleInputPath),
      exampleBriefExists: await exists(exampleBriefPath),
      evalExists: await exists(evalPath)
    })
  }

  return loops.sort((a, b) => a.id.localeCompare(b.id))
}

export async function loadLoop(loopId, sourceRoot = defaultSourceRoot()) {
  const root = normalizePath(sourceRoot)
  const loopDir = join(root, 'loops', loopId)
  const loopPath = join(loopDir, 'LOOP.md')
  const skillPath = join(loopDir, 'SKILL.md')
  const journalPath = join(loopDir, 'journal.md')

  if (!(await exists(loopPath))) {
    throw new Error(`Unknown loop: ${loopId}`)
  }

  const markdown = await readFile(loopPath, 'utf8')
  return {
    id: loopId,
    dir: loopDir,
    loopPath,
    skillPath,
    journalPath,
    loop: parseLoopMarkdown(markdown),
    loopMarkdown: markdown,
    skillMarkdown: await readFile(skillPath, 'utf8'),
    journalMarkdown: await readFile(journalPath, 'utf8')
  }
}

export function defaultSourceRoot() {
  return resolve(fileURLToPath(new URL('..', import.meta.url)))
}

function defaultLoopsPath() {
  return join(defaultSourceRoot(), 'loops')
}

function normalizePath(input) {
  if (input instanceof URL) return fileURLToPath(input)
  return resolve(String(input))
}

async function exists(path) {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}
