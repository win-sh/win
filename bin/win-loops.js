#!/usr/bin/env node
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { loadCatalog, loadLoop } from '../src/catalog.js'
import { validateCatalog } from '../src/eval.js'
import { installLoop } from '../src/installer.js'
import { createLoopRun } from '../src/runner.js'

const [command, ...args] = process.argv.slice(2)

try {
  const result = await run(command, args)
  if (result !== undefined) {
    process.stdout.write(typeof result === 'string' ? result : `${JSON.stringify(result, null, 2)}\n`)
  }
} catch (error) {
  process.stderr.write(`${error.message}\n`)
  process.exitCode = 1
}

async function run(command, args) {
  switch (command) {
    case 'list':
    case undefined:
      return listLoops()
    case 'inspect':
      return inspectLoop(readArg(args, 0, 'loop id'))
    case 'install':
      return install(args)
    case 'run':
      return runLoop(args)
    case 'journal':
      return journal(args)
    case 'eval':
      return evalCatalog()
    case 'help':
    case '--help':
    case '-h':
      return usage()
    default:
      throw new Error(`Unknown command: ${command}\n\n${usage()}`)
  }
}

async function listLoops() {
  const catalog = await loadCatalog()
  return catalog
    .map(entry => `${entry.id}\t${entry.loop.frontmatter.category}\t${entry.loop.frontmatter.title}`)
    .join('\n') + '\n'
}

async function inspectLoop(loopId) {
  const pack = await loadLoop(loopId)
  return {
    id: pack.id,
    title: pack.loop.frontmatter.title,
    description: pack.loop.frontmatter.description,
    category: pack.loop.frontmatter.category,
    requiredConnectors: pack.loop.frontmatter.required_connectors || [],
    defaultAuthority: pack.loop.frontmatter.default_authority,
    sections: [...pack.loop.sections.keys()]
  }
}

async function install(args) {
  const loopId = readArg(args, 0, 'loop id')
  const targetRepo = readOption(args, '--repo') || process.cwd()
  const agent = readOption(args, '--agent') || (args.includes('--claude-code') ? 'claude-code' : 'codex')
  return installLoop({ loopId, targetRepo, agent })
}

async function runLoop(args) {
  const loopId = readArg(args, 0, 'loop id')
  const targetRepo = readOption(args, '--repo') || process.cwd()
  const trigger = readOption(args, '--trigger') || 'manual'
  const signalFile = readOption(args, '--signal-file')
  const signal = signalFile ? await readFile(resolve(signalFile), 'utf8') : readOption(args, '--signal') || ''
  return createLoopRun({ loopId, targetRepo, trigger, signal })
}

async function journal(args) {
  const loopId = readArg(args, 0, 'loop id')
  const targetRepo = readOption(args, '--repo') || process.cwd()
  return readFile(resolve(targetRepo, '.win', 'loops', loopId, 'journal.md'), 'utf8')
}

async function evalCatalog() {
  const catalog = await loadCatalog()
  const report = await validateCatalog(catalog)
  if (!report.passed) {
    process.exitCode = 1
  }
  return report
}

function readArg(args, index, label) {
  const value = args[index]
  if (!value || value.startsWith('--')) throw new Error(`Missing ${label}`)
  return value
}

function readOption(args, name) {
  const index = args.indexOf(name)
  if (index === -1) return null
  const value = args[index + 1]
  if (!value || value.startsWith('--')) throw new Error(`Missing value for ${name}`)
  return value
}

function usage() {
  return `win-loops

Commands:
  list
  inspect <loop>
  install <loop> [--repo <path>] [--agent codex|claude-code]
  run <loop> [--repo <path>] [--trigger manual|signal] [--signal <text>]
  journal <loop> [--repo <path>]
  eval
`
}
