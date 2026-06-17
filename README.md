![win.sh business loops for AI agents](https://raw.githubusercontent.com/win-sh/win/main/assets/readme-banner.jpg)

# win

[![CI](https://github.com/win-sh/win/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/win-sh/win/actions/workflows/ci.yml?query=branch%3Amain)
[![npm](https://img.shields.io/npm/v/@win.sh/win?color=111827)](https://www.npmjs.com/package/@win.sh/win)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Open-source business improvement loops for Codex, Claude Code, and hosted win.sh.**

`win` turns business signals into repeatable agent runs: watch the signal, decide if action is worth it, write a scoped brief, let an agent execute, capture proof, verify the outcome, update the journal, and schedule the next useful run.

It is not another chat wrapper. It is the operating memory around AI agents so they can improve products, growth, support, and operations over time.

```bash
npm install -g @win.sh/win
win list
```

Local-first. Markdown-native. Hosted-ready.

When working from a source checkout before the package is installed globally, use `node bin/win-loops.js` in place of `win`.

## What It Does

Most automations are fixed cron jobs with a fixed prompt. Real business work is a loop.

| Cron task | win loop |
| --- | --- |
| Runs at a fixed time | Chooses the next useful run time after every execution |
| Runs the same script every time | Uses a readable `SKILL.md` that can adapt to the current signal |
| Usually fire-and-forget | Records briefs, artifacts, approvals, outcomes, and journals |
| Hard to inspect later | Stores everything as files in the target repo |
| Good for mechanical jobs | Built for business cases where judgment matters |

Examples:

| Loop | Watches | Produces |
| --- | --- | --- |
| `bug-autofix` | Sentry/log errors, impacted customers, GitHub context | scoped fix brief, agent handoff, PR/test proof |
| `seo-growth` | Google Search Console, page metadata, competitors | content or technical SEO action with verification window |
| `feedback-to-fix` | support threads, revenue at risk, analytics, issues | bug/feature/docs decision plus reply draft |
| `conversion-optimizer` | funnel metrics and benchmarks | test hypothesis, implementation brief, outcome check |
| `ads-budget-guard` | spend, CAC, creative performance | pause/scale/test decision with approval boundary |

## Why Teams Use It

- Give Codex or Claude Code business context, not just one-off tasks.
- Keep every agent decision inspectable in Markdown and JSONL.
- Add approval boundaries before agents merge code, publish content, spend money, or contact customers.
- Run locally with your own agent subscription, then move the same loop contracts to hosted win.sh when you need scheduling, connectors, dashboards, and team governance.
- Build custom loops as readable files instead of opaque workflow graphs.

## Open Source vs Hosted

| Use this repo when you want... | Use hosted win.sh when you want... |
| --- | --- |
| local files, local agent execution, and full inspectability | no install, managed scheduling, and team dashboards |
| Markdown loop packs you can edit and commit | OAuth connectors and hosted connector snapshots |
| Codex or Claude Code running in your own repo | managed execution and approval queues |
| JSONL state, append-only journals, and terminal workflows | email/mobile approvals, shared history, and central governance |

The loop logic stays open and portable. Hosted win.sh is the managed operating layer around the same contracts.

## Quick Start

From npm:

```bash
npm install -g @win.sh/win
win list
```

From source:

```bash
git clone https://github.com/win-sh/win.git
cd win
npm install
npm run check
node bin/win-loops.js list
```

Install a loop into an app repo:

```bash
win install bug-autofix --repo /path/to/app --agent codex
```

Create a run from a realistic connector snapshot:

```bash
win run bug-autofix \
  --repo /path/to/app \
  --connector-fixture loops/bug-autofix/examples/connector-snapshot.json
```

Ask what the operator or agent should do next:

```bash
win status --repo /path/to/app
win next --repo /path/to/app
win exec --repo /path/to/app --agent codex --dry-run
```

Execute and capture output:

```bash
win exec --repo /path/to/app --agent codex --run <run-id>
```

Accept proof suggested from the execution log:

```bash
win artifact suggestions --repo /path/to/app
win artifact accept <suggestion-id> --repo /path/to/app
```

## What You Get

- 50 readable loop packs across engineering, SEO, growth, ads, customer, sales, finance, product, and ops.
- Production-grade starter loops for `bug-autofix`, `seo-growth`, and `feedback-to-fix`.
- A terminal dashboard with enabled state, current status, next run time, countdown, and last run.
- Adaptive scheduling: cron can wake the process, but each loop decides when it is useful to run again.
- Append-only loop journals.
- Run briefs under `.win/runs/`.
- Execution logs under `.win/executions/`.
- Artifact suggestions parsed from agent output.
- Approval and outcome tracking.
- Connector snapshot contracts for hosted win.sh.
- Browser-based terminal auth for hosted win.sh API tokens.

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

Scheduler tick:

```bash
win tick --repo /path/to/app
```

`tick` creates run briefs only for enabled loops whose adaptive `nextRunAt` is due. It also resumes approved actions before normal scheduled work.

## Production Loops

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

## Local State

Installing a loop writes inspectable state into the target repo:

```text
.win/
  loops/<loop-id>/LOOP.md
  loops/<loop-id>/journal.md
  loops/<loop-id>/state.json
  runs/<run-id>.md
  executions/<execution-id>.log
  state/runs.jsonl
  state/executions.jsonl
  state/artifacts.jsonl
  state/artifact-suggestions.jsonl
  state/outcomes.jsonl
  state/approvals.jsonl

.agents/
  skills/win-<loop-id>/SKILL.md

.claude/
  skills/win-<loop-id>/SKILL.md

AGENTS.md
CLAUDE.md
```

Nothing is hidden. You can inspect, diff, commit, back up, or migrate every important decision.

`AGENTS.md` makes the loop visible to Codex and Codex Automations. `CLAUDE.md` plus `.claude/skills` makes the loop visible to Claude Code and Claude Code recurring tasks.

## Hosted win.sh

Local mode is the open harness. Hosted win.sh adds:

- OAuth connectors
- hosted scheduling
- team approvals
- loop dashboards
- mobile/email approval flows
- centralized journals
- managed execution

Connect the CLI:

```bash
win auth login
win auth status
```

Browser approval flow:

1. CLI starts a localhost callback server.
2. CLI opens `https://win.sh/settings/api-tokens/cli`.
3. User approves a scoped API token.
4. win.sh redirects back to the local callback.
5. CLI stores the token at `~/.config/win-loops/auth.json` with file mode `0600`.

Manual token fallback:

```bash
win auth login --token <token> --workspace <workspace>
```

Fetch a hosted connector snapshot:

```bash
win snapshot fetch bug-autofix --output .win/snapshots/bug-autofix.json
```

Then run it locally:

```bash
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

## Loop Format

Each loop pack lives under `loops/<loop-id>/`:

```text
LOOP.md
SKILL.md
journal.md
examples/input.json
examples/run-brief.md
evals/contract.json
```

`LOOP.md` is the business contract. `SKILL.md` is the executor workflow. `journal.md` is append-only loop memory.

## Quality Gates

```bash
npm run check
npm run pack:dry
```

Current coverage includes loop parsing, catalog validation, installation into target repos, run brief creation, adaptive scheduling, connector snapshots, terminal auth, hosted snapshot fetching, operator queues, executor dry-runs, execution capture, artifact suggestions, approvals, outcomes, and journal writes.

## Release Status

`@win.sh/win@0.1.2` is published on npm and installable with `npm install -g @win.sh/win`. The `v0.1.2` tag points at the published package source; current `main` includes release-guard and documentation updates for future tags.

The first npm version was bootstrapped locally without provenance so the package could exist under the `win.sh` scope. Future releases should use npm trusted publishing through GitHub Actions, or a temporary `NPM_TOKEN` secret only when bootstrapping is required.

Hosted API docs are live at [win.sh/docs/api](https://win.sh/docs/api). Hosted snapshot calls require an API token, and full browser-approved CLI auth requires a signed-in win.sh session.

## Documentation

- [win.sh product and terminal docs](docs/winsh.md)
- [local install](docs/local-install.md)
- [hosted win.sh integration](docs/hosted-winsh.md)
- [agent automations compatibility](docs/agent-automations.md)
- [loop format](docs/loop-format.md)
- [publishing](docs/publishing.md)
- [changelog](CHANGELOG.md)

## License

MIT
