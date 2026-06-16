import { readFile } from 'node:fs/promises'
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

  if (!dryRun) {
    return {
      status: 'blocked',
      reason: 'Only --dry-run execution planning is implemented.',
      targetRepo: target,
      agent,
      dryRun
    }
  }

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
    command: `${agentConfig.command} ${JSON.stringify(prompt)}`
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
