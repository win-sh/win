#!/usr/bin/env node
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { loadCatalog, loadLoop } from '../src/catalog.js'
import { validateCatalog } from '../src/eval.js'
import { installLoop, setLoopEnabled } from '../src/installer.js'
import { buildBugAutofixSignal } from '../src/loops/bug-autofix.js'
import {
  approveApproval,
  attachArtifact,
  recordOutcome,
  rejectApproval,
  requestApproval
} from '../src/reporting.js'
import { createLoopRun } from '../src/runner.js'
import { getInstalledLoopStatus, renderStatusTable } from '../src/status.js'
import { tickLoops, renderTickTable } from '../src/tick.js'

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
    case 'status':
      return status(args)
    case 'tick':
      return tick(args)
    case 'enable':
      return enableLoop(args, true)
    case 'disable':
      return enableLoop(args, false)
    case 'journals':
      return journals(args)
    case 'journal':
      return journal(args)
    case 'artifact':
      return artifact(args)
    case 'outcome':
      return outcome(args)
    case 'approval':
      return approval(args)
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
  const fixtureFile = readOption(args, '--fixture')
  const signalFile = readOption(args, '--signal-file')
  const signal = await resolveSignal({ loopId, fixtureFile, signalFile, args })
  return createLoopRun({ loopId, targetRepo, trigger, signal })
}

async function resolveSignal({ loopId, fixtureFile, signalFile, args }) {
  if (fixtureFile) {
    const fixture = JSON.parse(await readFile(resolve(fixtureFile), 'utf8'))
    if (loopId === 'bug-autofix') {
      return buildBugAutofixSignal(fixture).runBrief
    }
    return JSON.stringify(fixture, null, 2)
  }

  if (signalFile) {
    return readFile(resolve(signalFile), 'utf8')
  }

  return readOption(args, '--signal') || ''
}

async function journal(args) {
  const loopId = readArg(args, 0, 'loop id')
  const targetRepo = readOption(args, '--repo') || process.cwd()
  return readFile(resolve(targetRepo, '.win', 'loops', loopId, 'journal.md'), 'utf8')
}

async function journals(args) {
  const targetRepo = readOption(args, '--repo') || process.cwd()
  const rows = await getInstalledLoopStatus({ targetRepo })
  if (rows.length === 0) return 'No loops installed.\n'
  return rows.map(row => `${row.id}\t.win/loops/${row.id}/journal.md`).join('\n') + '\n'
}

async function status(args) {
  const targetRepo = readOption(args, '--repo') || process.cwd()
  const rows = await getInstalledLoopStatus({ targetRepo })
  if (rows.length === 0) return 'No loops installed.\n'
  return renderStatusTable(rows)
}

async function tick(args) {
  const targetRepo = readOption(args, '--repo') || process.cwd()
  const report = await tickLoops({ targetRepo })
  return renderTickTable(report.rows)
}

async function enableLoop(args, enabled) {
  const loopId = readArg(args, 0, 'loop id')
  const targetRepo = readOption(args, '--repo') || process.cwd()
  const state = await setLoopEnabled({ loopId, targetRepo, enabled })
  return `${state.id} ${state.enabled ? 'enabled' : 'disabled'}\n`
}

async function artifact(args) {
  const subcommand = readArg(args, 0, 'artifact subcommand')
  if (subcommand !== 'attach') throw new Error(`Unknown artifact command: ${subcommand}`)

  const runId = readArg(args, 1, 'run id')
  const targetRepo = readOption(args, '--repo') || process.cwd()
  return attachArtifact({
    targetRepo,
    runId,
    kind: readOption(args, '--kind') || undefined,
    title: readOption(args, '--title') || undefined,
    url: readOption(args, '--url') || '',
    path: readOption(args, '--path') || '',
    summary: readOption(args, '--summary') || ''
  })
}

async function outcome(args) {
  const subcommand = readArg(args, 0, 'outcome subcommand')
  if (subcommand !== 'record') throw new Error(`Unknown outcome command: ${subcommand}`)

  const runId = readArg(args, 1, 'run id')
  const targetRepo = readOption(args, '--repo') || process.cwd()
  return recordOutcome({
    targetRepo,
    runId,
    status: readOption(args, '--status'),
    metric: readOption(args, '--metric') || '',
    summary: readOption(args, '--summary') || '',
    evidence: readOption(args, '--evidence') || ''
  })
}

async function approval(args) {
  const subcommand = readArg(args, 0, 'approval subcommand')

  if (subcommand === 'approve' || subcommand === 'reject') {
    const approvalId = readArg(args, 1, 'approval id')
    const targetRepo = readOption(args, '--repo') || process.cwd()
    const payload = {
      targetRepo,
      approvalId,
      decidedBy: readOption(args, '--by') || '',
      note: readOption(args, '--note') || ''
    }
    return subcommand === 'approve' ? approveApproval(payload) : rejectApproval(payload)
  }

  if (subcommand !== 'request') throw new Error(`Unknown approval command: ${subcommand}`)

  const runId = readArg(args, 1, 'run id')
  const targetRepo = readOption(args, '--repo') || process.cwd()
  return requestApproval({
    targetRepo,
    runId,
    action: readOption(args, '--action'),
    reason: readOption(args, '--reason'),
    risk: readOption(args, '--risk') || 'medium',
    approver: readOption(args, '--approver') || ''
  })
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
  run <loop> [--repo <path>] [--trigger manual|signal] [--signal <text>] [--signal-file <path>] [--fixture <path>]
  status [--repo <path>]
  tick [--repo <path>]
  enable <loop> [--repo <path>]
  disable <loop> [--repo <path>]
  journals [--repo <path>]
  journal <loop> [--repo <path>]
  artifact attach <run-id> [--repo <path>] [--kind <kind>] [--url <url>] [--path <path>] [--title <text>] [--summary <text>]
  outcome record <run-id> [--repo <path>] --status <status> [--metric <metric>] [--summary <text>] [--evidence <text>]
  approval request <run-id> [--repo <path>] --action <text> --reason <text> [--risk low|medium|high] [--approver <text>]
  approval approve <approval-id> [--repo <path>] [--by <text>] [--note <text>]
  approval reject <approval-id> [--repo <path>] [--by <text>] [--note <text>]
  eval
`
}
