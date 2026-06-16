import { spawn } from 'node:child_process'
import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { buildInbox, pickNextAction, renderNextAction } from './inbox.js'

const AGENTS = new Map([
  ['codex', { command: 'codex', label: 'Codex' }],
  ['claude-code', { command: 'claude', label: 'Claude Code' }]
])

export async function buildExecPlan({
  targetRepo = process.cwd(),
  agent = 'codex',
  runId = '',
  dryRun = true
} = {}) {
  const target = resolve(targetRepo)
  const agentConfig = AGENTS.get(agent)
  if (!agentConfig) throw new Error(`Unsupported agent: ${agent}`)

  if (runId) {
    return buildRunHandoff({ targetRepo: target, agent, agentConfig, runId, dryRun })
  }

  const inbox = await buildInbox({ targetRepo: target })
  const next = pickNextAction(inbox)
  if (next.kind !== 'execution') {
    return {
      status: 'blocked',
      reason: `Next action is ${next.kind}. Resolve it before executing a run brief.`,
      targetRepo: target,
      agent,
      dryRun,
      nextAction: renderNextAction(next)
    }
  }

  return buildRunHandoff({ targetRepo: target, agent, agentConfig, runId: next.runId, dryRun })
}

export function renderExecPlan(plan) {
  if (plan.status !== 'ready') {
    return [
      'Execution Blocked',
      '',
      plan.reason,
      '',
      `Inspect: win-loops next --repo ${plan.targetRepo}`,
      '',
      plan.nextAction ? `Next action:\n${plan.nextAction.trimEnd()}` : 'Run win-loops next for the current operator action.'
    ].join('\n') + '\n'
  }

  return [
    'Dry Run',
    '',
    `Agent: ${plan.agentLabel}`,
    `Repo: ${plan.targetRepo}`,
    `Run: ${plan.runId}`,
    `Skill: ${plan.skillName}`,
    `Brief: ${plan.runBrief}`,
    '',
    'Prompt:',
    plan.prompt,
    '',
    'Command:',
    plan.command
  ].join('\n') + '\n'
}

export async function executeExecPlan(plan, {
  executable,
  args,
  env = process.env,
  now = new Date()
} = {}) {
  if (plan.status !== 'ready') {
    return {
      status: 'blocked',
      reason: plan.reason,
      targetRepo: plan.targetRepo,
      runId: plan.runId || ''
    }
  }

  const target = resolve(plan.targetRepo)
  const startedAt = toDate(now).toISOString()
  const executionId = await nextExecutionId({ target, runId: plan.runId, timestamp: startedAt })
  const logPath = `.win/executions/${executionId}.log`
  const command = resolveExecutionCommand({ plan, executable, args, env })
  const startedExecution = {
    id: executionId,
    runId: plan.runId,
    loopId: plan.loopId,
    agent: plan.agent,
    status: 'running',
    command: command.executable,
    args: command.args,
    logPath,
    startedAt
  }

  await mkdir(join(target, '.win', 'executions'), { recursive: true })
  await updateRunForExecution({ target, runId: plan.runId, status: 'executing', execution: startedExecution })

  const result = await runProcess({
    cwd: target,
    executable: command.executable,
    args: command.args,
    env
  })
  const finishedAt = new Date().toISOString()
  const status = result.exitCode === 0 ? 'succeeded' : 'failed'
  const execution = {
    ...startedExecution,
    status,
    exitCode: result.exitCode,
    signal: result.signal,
    stdoutBytes: Buffer.byteLength(result.stdout),
    stderrBytes: Buffer.byteLength(result.stderr),
    finishedAt
  }

  await writeFile(join(target, logPath), renderExecutionLog({ execution, stdout: result.stdout, stderr: result.stderr }), 'utf8')
  await appendJsonl(join(target, '.win', 'state', 'executions.jsonl'), execution)
  await updateRunForExecution({
    target,
    runId: plan.runId,
    status: status === 'succeeded' ? 'executed' : 'execution_failed',
    execution
  })
  await appendExecutionJournal({ target, plan, execution })

  return execution
}

async function buildRunHandoff({ targetRepo, agent, agentConfig, runId, dryRun }) {
  const run = await findRun(targetRepo, runId)
  if ((run.artifacts || []).length > 0) {
    return blockedRun({ targetRepo, agent, dryRun, runId, reason: `Run already has artifacts: ${runId}` })
  }
  if (run.status !== 'diagnosing') {
    return blockedRun({ targetRepo, agent, dryRun, runId, reason: `Run is not executable while status is ${run.status}.` })
  }

  const runBrief = `.win/runs/${run.id}.md`
  const skillName = `win-${run.loopId}`
  const prompt = `Use the ${skillName} skill. Execute ${runBrief}.`
  const executable = agentConfig.command
  const args = [prompt]
  return {
    status: 'ready',
    targetRepo,
    agent,
    agentLabel: agentConfig.label,
    dryRun,
    runId: run.id,
    loopId: run.loopId,
    skillName,
    runBrief,
    prompt,
    executable,
    args,
    command: renderCommand({ executable, args })
  }
}

function blockedRun({ targetRepo, agent, dryRun, runId, reason }) {
  return {
    status: 'blocked',
    targetRepo,
    agent,
    dryRun,
    runId,
    reason
  }
}

async function findRun(targetRepo, runId) {
  const runs = await readRuns(targetRepo)
  const run = runs.find(item => item.id === runId)
  if (!run) throw new Error(`Run not found: ${runId}`)
  return run
}

async function readRuns(targetRepo) {
  const raw = await readFile(join(targetRepo, '.win', 'state', 'runs.jsonl'), 'utf8')
  return raw
    .split('\n')
    .filter(Boolean)
    .map(line => JSON.parse(line))
}

async function writeRuns(targetRepo, runs) {
  const body = runs.map(run => JSON.stringify(run)).join('\n')
  await writeFile(join(targetRepo, '.win', 'state', 'runs.jsonl'), `${body}${body ? '\n' : ''}`, 'utf8')
}

async function updateRunForExecution({ target, runId, status, execution }) {
  const runs = await readRuns(target)
  const index = runs.findIndex(run => run.id === runId)
  if (index === -1) throw new Error(`Run not found: ${runId}`)

  const run = runs[index]
  run.status = status
  run.updatedAt = execution.finishedAt || execution.startedAt
  if (status === 'executing') {
    run.currentExecution = execution
  } else {
    delete run.currentExecution
    run.latestExecution = execution
  }
  runs[index] = run
  await writeRuns(target, runs)
}

async function nextExecutionId({ target, runId, timestamp }) {
  const base = `${runId}-exec-${timestamp.replace(/[-:.TZ]/g, '').slice(0, 14)}`
  const existing = await readJsonl(join(target, '.win', 'state', 'executions.jsonl'))
  const existingIds = new Set(existing.map(item => item.id))
  if (!existingIds.has(base)) return base

  let suffix = 2
  while (existingIds.has(`${base}-${suffix}`)) {
    suffix += 1
  }
  return `${base}-${suffix}`
}

async function readJsonl(path) {
  try {
    const raw = await readFile(path, 'utf8')
    return raw
      .split('\n')
      .filter(Boolean)
      .map(line => JSON.parse(line))
  } catch {
    return []
  }
}

async function appendJsonl(path, value) {
  await appendFile(path, `${JSON.stringify(value)}\n`, 'utf8')
}

function resolveExecutionCommand({ plan, executable, args, env }) {
  const overrideExecutable = executable || envOverrideExecutable({ agent: plan.agent, env })
  const overrideArgs = args || envOverrideArgs({ agent: plan.agent, env })
  return {
    executable: overrideExecutable || plan.executable,
    args: overrideArgs || plan.args
  }
}

function envOverrideExecutable({ agent, env }) {
  if (agent === 'codex') return env.WIN_LOOPS_CODEX_EXECUTABLE || ''
  if (agent === 'claude-code') return env.WIN_LOOPS_CLAUDE_CODE_EXECUTABLE || ''
  return ''
}

function envOverrideArgs({ agent, env }) {
  const raw = agent === 'codex' ? env.WIN_LOOPS_CODEX_ARGS_JSON : env.WIN_LOOPS_CLAUDE_CODE_ARGS_JSON
  if (!raw) return null
  const parsed = JSON.parse(raw)
  if (!Array.isArray(parsed)) throw new Error('Agent args override must be a JSON array')
  return parsed.map(String)
}

function runProcess({ cwd, executable, args, env }) {
  return new Promise(resolveProcess => {
    const child = spawn(executable, args, { cwd, env })
    let stdout = ''
    let stderr = ''

    child.stdout.on('data', chunk => {
      stdout += chunk.toString()
    })
    child.stderr.on('data', chunk => {
      stderr += chunk.toString()
    })
    child.on('error', error => {
      resolveProcess({
        exitCode: 127,
        signal: null,
        stdout,
        stderr: `${stderr}${error.message}\n`
      })
    })
    child.on('close', (exitCode, signal) => {
      resolveProcess({
        exitCode,
        signal,
        stdout,
        stderr
      })
    })
  })
}

function renderExecutionLog({ execution, stdout, stderr }) {
  return [
    `Execution: ${execution.id}`,
    `Run: ${execution.runId}`,
    `Agent: ${execution.agent}`,
    `Status: ${execution.status}`,
    `Command: ${renderCommand({ executable: execution.command, args: execution.args })}`,
    `Started: ${execution.startedAt}`,
    `Finished: ${execution.finishedAt}`,
    `Exit Code: ${execution.exitCode}`,
    '',
    '## stdout',
    stdout || '(empty)',
    '',
    '## stderr',
    stderr || '(empty)',
    ''
  ].join('\n')
}

async function appendExecutionJournal({ target, plan, execution }) {
  const title = execution.status === 'succeeded' ? 'Execution Succeeded' : 'Execution Failed'
  await appendFile(
    join(target, '.win', 'loops', plan.loopId, 'journal.md'),
    `
## ${execution.finishedAt.slice(0, 10)} - ${title}

- Run: ${execution.runId}
- Execution: ${execution.id}
- Agent: ${execution.agent}
- Status: ${execution.status}
- Exit Code: ${execution.exitCode}
- Log: ${execution.logPath}
`,
    'utf8'
  )
}

function renderCommand({ executable, args }) {
  return [executable, ...args.map(arg => JSON.stringify(arg))].join(' ')
}

function toDate(value) {
  return value instanceof Date ? value : new Date(value)
}
