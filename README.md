<p align="center">
  <img src="https://raw.githubusercontent.com/win-sh/win/main/assets/readme-banner.jpg" alt="win.sh - run an autonomous company" width="100%">
</p>

<h1 align="center">win</h1>

<p align="center">
  <strong>Run autonomous business loops with Codex, Claude Code, and win.sh.</strong>
</p>

<p align="center">
  <a href="https://github.com/win-sh/win/actions/workflows/ci.yml?query=branch%3Amain"><img alt="CI" src="https://github.com/win-sh/win/actions/workflows/ci.yml/badge.svg?branch=main"></a>
  <a href="https://www.npmjs.com/package/@win.sh/win"><img alt="npm" src="https://img.shields.io/npm/v/@win.sh/win?color=111827"></a>
  <a href="LICENSE"><img alt="License" src="https://img.shields.io/badge/license-MIT-blue.svg"></a>
  <a href="https://github.com/win-sh/win/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/win-sh/win?style=social"></a>
</p>

<p align="center">
  <a href="#quickstart">Quickstart</a> |
  <a href="#built-in-loops">Built-in loops</a> |
  <a href="#open-source-vs-hosted">Open source vs hosted</a> |
  <a href="#docs">Docs</a>
</p>

`win` is an open-source harness for agents that need to own business outcomes, not just answer prompts.

Codex and Claude Code are good at doing work. `win` gives them the operating loop around the work:

```text
signal -> decision -> scoped brief -> agent run -> proof -> outcome -> journal -> next run
```

That makes it useful for work like bug autofix, SEO growth, feedback-to-fix, conversion optimization, ads budget control, user lifecycle follow-up, and weekly business review loops.

```bash
npm install -g @win.sh/win
win list
```

Local-first. Markdown-native. Hosted-ready.

## Why win Exists

Most agent setups are one-off sessions. Most automations are cron jobs. Real company work sits in the middle.

Business loops need to wake up when there is a useful signal, decide whether action is worth it, act through an agent, capture evidence, verify whether the action helped, remember what happened, and schedule the next useful check.

That is what `win` provides.

| Cron task | win loop |
| --- | --- |
| Runs at a fixed time | Schedules the next useful run after every execution |
| Replays the same script | Uses a readable `SKILL.md` that adapts to the signal |
| Usually fire-and-forget | Records briefs, approvals, artifacts, outcomes, and journals |
| Hard to inspect later | Writes files you can diff, commit, and audit |
| Good for mechanical jobs | Built for business cases where judgment matters |

If Codex or Claude Code is the worker, `win` is the operating cadence, memory, and audit trail.

## Quickstart

Install from npm:

```bash
npm install -g @win.sh/win
win list
```

Install a loop into your app repo:

```bash
win install bug-autofix --repo /path/to/app --agent codex
```

See what is enabled and when each loop will run:

```bash
win status --repo /path/to/app
```

Create a run from a realistic connector snapshot:

```bash
win run bug-autofix \
  --repo /path/to/app \
  --connector-fixture loops/bug-autofix/examples/connector-snapshot.json
```

Ask what should happen next:

```bash
win next --repo /path/to/app
win exec --repo /path/to/app --agent codex --dry-run
```

Execute the run and capture output:

```bash
win exec --repo /path/to/app --agent codex --run <run-id>
```

Working from source:

```bash
git clone https://github.com/win-sh/win.git
cd win
npm install
npm run check
node bin/win-loops.js list
```

When working from a source checkout before the package is installed globally, use `node bin/win-loops.js` in place of `win`.

## Built-in Loops

`win` ships with 50 readable loop packs across engineering, SEO, growth, ads, customer, sales, finance, product, and ops.

| Loop | Watches | Produces |
| --- | --- | --- |
| `bug-autofix` | Sentry/log errors, impacted customers, GitHub context | scoped fix brief, agent handoff, PR/test proof |
| `seo-growth` | Google Search Console, page metadata, competitors | content or technical SEO action with a verification window |
| `feedback-to-fix` | support threads, revenue at risk, analytics, issues | bug/feature/docs decision plus reply draft |
| `conversion-optimizer` | funnel metrics and benchmarks | test hypothesis, implementation brief, outcome check |
| `ads-budget-guard` | spend, CAC, creative performance | pause/scale/test decision with approval boundary |
| `traffic-growth-optimizer` | acquisition channels and search traffic | highest-leverage traffic experiment |
| `failed-payment-recovery` | failed charges and customer value | recovery action, message, or retry plan |
| `weekly-business-review` | product, revenue, support, and growth metrics | concise operating review and next actions |

Production-grade starter loops are included for:

- `bug-autofix`
- `seo-growth`
- `feedback-to-fix`

Each loop is just files:

```text
loops/<loop-id>/
  LOOP.md       # business contract
  SKILL.md      # executor workflow
  journal.md    # append-only loop memory
  examples/
  evals/
```

## What You Get

- A terminal dashboard with enabled state, current status, next run time, countdown, and last run.
- Adaptive scheduling where cron can wake the process, but each loop decides if work is actually due.
- Run briefs under `.win/runs/`.
- Execution logs under `.win/executions/`.
- Append-only loop journals.
- Artifact suggestions parsed from agent output.
- Approval and outcome tracking.
- Codex skill install under `.agents/skills`.
- Claude Code skill install under `.claude/skills`.
- Hosted connector snapshot contracts for win.sh.
- Browser-based terminal auth for hosted win.sh API tokens.

Nothing important is hidden. You can inspect, diff, commit, back up, or migrate every decision.

## Is win For You?

Use `win` if you want to:

- Give Codex or Claude Code business context, not just isolated tasks.
- Run recurring business improvement loops without building a private harness from scratch.
- Keep every autonomous decision inspectable in Markdown and JSONL.
- Add approval boundaries before agents merge code, publish content, spend money, or contact customers.
- Start locally with your own agent subscription, then move the same loop contracts to hosted win.sh.
- Build custom loops as readable files instead of opaque workflow graphs.

Do not use `win` if you only need:

- A single chat interface.
- A static prompt library with no scheduling, state, or outcomes.
- A workflow that should always run the same deterministic script.

## How It Works

Every loop follows the same operating cycle:

| Step | What happens | Local artifact |
| --- | --- | --- |
| 1. Watch | Read a business signal or connector snapshot | input JSON or hosted snapshot |
| 2. Decide | Determine whether work is worth doing now | `.win/loops/<id>/state.json` |
| 3. Brief | Create a scoped agent handoff | `.win/runs/<run-id>.md` |
| 4. Execute | Run Codex, Claude Code, or another agent | `.win/executions/<id>.log` |
| 5. Prove | Attach PRs, files, charts, replies, or metrics | `.win/state/artifacts.jsonl` |
| 6. Verify | Record whether the action helped | `.win/state/outcomes.jsonl` |
| 7. Remember | Update the loop journal | `.win/loops/<id>/journal.md` |
| 8. Schedule | Pick the next useful run time | `.win/loops/<id>/state.json` |

The scheduler command is intentionally simple:

```bash
win tick --repo /path/to/app
```

`tick` creates run briefs only for enabled loops whose adaptive `nextRunAt` is due. It also resumes approved actions before normal scheduled work.

## Terminal Dashboard

```bash
win status --repo /path/to/app
```

Example:

```text
Loop         State     Status      Next run                  Countdown      Last run
-----------  --------  ----------  ------------------------  -------------  ------------------------
bug-autofix  enabled   diagnosing  2026-06-16T14:00:00.000Z  4h 30m         2026-06-16T08:00:00.000Z
seo-growth   disabled  watching    -                         not scheduled  -
```

Operator queue:

```bash
win inbox --repo /path/to/app
win next --repo /path/to/app
```

Accept proof suggested from an execution log:

```bash
win artifact suggestions --repo /path/to/app
win artifact accept <suggestion-id> --repo /path/to/app
```

## Agent Compatibility

`win install` writes the loop into the target repo in the format your agent already reads.

```text
.win/
  loops/<loop-id>/LOOP.md
  loops/<loop-id>/journal.md
  loops/<loop-id>/state.json
  runs/<run-id>.md
  executions/<execution-id>.log
  state/*.jsonl

.agents/
  skills/win-<loop-id>/SKILL.md

.claude/
  skills/win-<loop-id>/SKILL.md

AGENTS.md
CLAUDE.md
```

`AGENTS.md` makes loops visible to Codex and Codex Automations. `CLAUDE.md` plus `.claude/skills` makes loops visible to Claude Code and Claude Code recurring tasks.

Native automations can wake the repo on a fixed cadence. `win tick` decides whether a loop should actually run.

## Open Source vs Hosted

The open-source repo is the local harness. Hosted win.sh is the managed operating layer around the same loop contracts.

| Use this repo when you want... | Use hosted win.sh when you want... |
| --- | --- |
| local files, local agent execution, and full inspectability | no install, managed scheduling, and team dashboards |
| Markdown loop packs you can edit and commit | OAuth connectors and hosted connector snapshots |
| Codex or Claude Code running in your own repo | managed execution and approval queues |
| JSONL state, append-only journals, and terminal workflows | email/mobile approvals, shared history, and central governance |

Connect the CLI to hosted win.sh:

```bash
win auth login
win auth status
```

Browser approval flow:

```text
CLI starts localhost callback
-> opens https://win.sh/settings/api-tokens/cli
-> user approves a scoped token
-> win.sh redirects back to localhost
-> CLI stores the token at ~/.config/win-loops/auth.json
```

Fetch a hosted connector snapshot and run it locally:

```bash
win snapshot fetch bug-autofix --output .win/snapshots/bug-autofix.json
win run bug-autofix \
  --repo /path/to/app \
  --connector-fixture .win/snapshots/bug-autofix.json
```

## Core Commands

```bash
win list
win inspect <loop>
win install <loop> [--repo <path>] [--agent codex|claude-code]
win run <loop> [--repo <path>] [--trigger manual|signal] [--signal <text>] [--signal-file <path>] [--fixture <path>] [--connector-fixture <path>]
win status [--repo <path>]
win inbox [--repo <path>]
win next [--repo <path>]
win exec [--repo <path>] [--agent codex|claude-code] [--run <run-id>] [--dry-run]
win tick [--repo <path>]
win enable <loop> [--repo <path>]
win disable <loop> [--repo <path>]
win journals [--repo <path>]
win journal <loop> [--repo <path>]
```

Reporting:

```bash
win artifact attach <run-id> [--repo <path>] [--kind <kind>] [--url <url>] [--path <path>] [--title <text>] [--summary <text>]
win artifact suggestions [--repo <path>]
win artifact suggest <execution-id> [--repo <path>]
win artifact accept <suggestion-id> [--repo <path>]
win outcome record <run-id> [--repo <path>] --status <status> [--metric <metric>] [--summary <text>] [--evidence <text>]
win approval request <run-id> [--repo <path>] --action <text> --reason <text> [--risk low|medium|high] [--approver <text>]
win approval approve <approval-id> [--repo <path>] [--by <text>] [--note <text>]
win approval reject <approval-id> [--repo <path>] [--by <text>] [--note <text>]
```

Hosted auth and snapshots:

```bash
win auth login [--token <token>] [--workspace <name>] [--app-url <url>] [--api-url <url>] [--config-dir <path>] [--no-open] [--print-url]
win auth status [--config-dir <path>]
win auth token [--config-dir <path>]
win auth logout [--config-dir <path>]
win snapshot fetch <loop> [--config-dir <path>] [--api-url <url>] [--token <token>] [--output <path>]
```

## Production Loop Examples

### Bug Autofix

Turns Sentry/log errors and GitHub context into scoped fix briefs.

```bash
win run bug-autofix \
  --repo /path/to/app \
  --connector-fixture loops/bug-autofix/examples/connector-snapshot.json
```

The adapter normalizes Sentry issue metadata, sample events, impacted paying users, stack frames, affected routes, GitHub codeowners, and recent commits.

### SEO Growth

Turns GSC, page, competitor, and repo context into one SEO action.

```bash
win run seo-growth \
  --repo /path/to/site \
  --connector-fixture loops/seo-growth/examples/connector-snapshot.json
```

The adapter normalizes GSC page/query metrics, target page metadata, competitor SERP patterns, candidate website files, and the verification window.

### Feedback To Fix

Turns support threads, customer value, analytics, and GitHub context into a fix, issue, docs change, or reply draft.

```bash
win run feedback-to-fix \
  --repo /path/to/app \
  --connector-fixture loops/feedback-to-fix/examples/connector-snapshot.json
```

The adapter normalizes representative user quotes, classification, affected paying users, revenue at risk, existing issues, candidate files, and customer reply drafts.

## Development

```bash
npm install
npm run check
npm run pack:dry
```

Current coverage includes loop parsing, catalog validation, installation into target repos, run brief creation, adaptive scheduling, connector snapshots, terminal auth, hosted snapshot fetching, operator queues, executor dry-runs, execution capture, artifact suggestions, approvals, outcomes, and journal writes.

## Release Status

`@win.sh/win@0.1.2` is published on npm and installable with `npm install -g @win.sh/win`. The `v0.1.2` tag points at the published package source; current `main` includes release-guard and documentation updates for future tags.

The first npm version was bootstrapped locally without provenance so the package could exist under the `win.sh` scope. Future releases should use npm trusted publishing through GitHub Actions, or a temporary `NPM_TOKEN` secret only when bootstrapping is required.

Hosted API docs are live at [win.sh/docs/api](https://win.sh/docs/api). Hosted snapshot calls require an API token, and full browser-approved CLI auth requires a signed-in win.sh session.

## Docs

- [win.sh product and terminal docs](docs/winsh.md)
- [local install](docs/local-install.md)
- [hosted win.sh integration](docs/hosted-winsh.md)
- [agent automations compatibility](docs/agent-automations.md)
- [loop format](docs/loop-format.md)
- [publishing](docs/publishing.md)
- [changelog](CHANGELOG.md)

## License

MIT
