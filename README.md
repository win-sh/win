# win

Open-source business improvement loops for AI agents and win.sh.

The repo contains readable Markdown loop packs. Each loop defines how to detect a business signal, diagnose it, act within authority, verify the outcome, schedule the next run, and update memory.

win.sh Cloud should run these same loop packs as the hosted no-install solution. Local users can run them with Codex, Claude Code, or another agent that can read files.

## What Is A Loop?

A loop is not a cron job.

A cron job runs at a fixed time. A loop decides when it should run next based on signals, cooldowns, verification windows, and business value.

Each loop has:

- `LOOP.md`: business contract and control policy
- `SKILL.md`: scoped executor workflow for Codex, Claude Code, or win.sh Cloud
- `journal.md`: append-only loop memory
- `examples/`: sample inputs and run briefs
- `evals/`: contract checks

## Quick Start

```bash
npm test
npm run eval
node bin/win-loops.js list
```

Published package target:

```bash
npm install -g @win.sh/win
win list
```

Install a loop into another repo:

```bash
node bin/win-loops.js install bug-autofix --repo /path/to/app --agent codex
```

Create a local run brief:

```bash
node bin/win-loops.js run bug-autofix \
  --repo /path/to/app \
  --signal "Sentry error group checkout-null-pointer repeated 21 times in 1 hour."
```

Create a `bug-autofix` run from the included Sentry-style fixture:

```bash
node bin/win-loops.js run bug-autofix \
  --repo /path/to/app \
  --fixture loops/bug-autofix/examples/sentry-error-group.json
```

Create a `bug-autofix` run from a local Sentry/GitHub connector snapshot:

```bash
node bin/win-loops.js run bug-autofix \
  --repo /path/to/app \
  --connector-fixture loops/bug-autofix/examples/connector-snapshot.json
```

Connector snapshots are deterministic JSON payloads shaped like hosted connector output. For `bug-autofix`, the adapter normalizes Sentry issue data, affected users, stack frames, GitHub codeowners, and recent commits into one scoped run brief.

Production connector snapshot examples exist for:

```bash
node bin/win-loops.js run seo-growth \
  --repo /path/to/app \
  --connector-fixture loops/seo-growth/examples/connector-snapshot.json

node bin/win-loops.js run feedback-to-fix \
  --repo /path/to/app \
  --connector-fixture loops/feedback-to-fix/examples/connector-snapshot.json
```

Connect the terminal to hosted win.sh:

```bash
node bin/win-loops.js auth login
node bin/win-loops.js auth status
node bin/win-loops.js snapshot fetch bug-autofix
```

Then ask Codex or Claude Code to execute the generated run brief under `.win/runs/`.

Show the local loop dashboard:

```bash
node bin/win-loops.js status --repo /path/to/app
```

Example:

```text
Loop         State     Status      Next run                  Countdown  Last run
-----------  --------  ----------  ------------------------  ---------  ------------------------
bug-autofix  enabled   diagnosing  2026-06-16T14:00:00.000Z  4h 30m     2026-06-16T08:00:00.000Z
seo-growth   disabled  watching    -                         not scheduled  -
```

Show the operator inbox and next action:

```bash
node bin/win-loops.js inbox --repo /path/to/app
node bin/win-loops.js next --repo /path/to/app
node bin/win-loops.js exec --repo /path/to/app --agent codex --dry-run
node bin/win-loops.js exec --repo /path/to/app --agent codex --run <run-id>
```

`inbox` summarizes pending executions, approvals, approved actions waiting for scheduler resume, overdue outcome checks, and latest proof per loop. `next` prints the single highest-priority operator action. `exec --dry-run` renders the local-agent handoff for the next executable run brief. `exec` without `--dry-run` runs the local agent command, captures stdout/stderr, updates run status, and writes an execution log.

After execution, `win-loops` parses the captured log for likely proof such as PR URLs, changed files, and test summaries. These are saved as pending suggestions until an operator accepts them:

```bash
node bin/win-loops.js artifact suggestions --repo /path/to/app
node bin/win-loops.js artifact accept <suggestion-id> --repo /path/to/app
```

Run one local scheduler pass:

```bash
node bin/win-loops.js tick --repo /path/to/app
```

`tick` inspects installed loops, skips disabled loops, creates run briefs for enabled loops whose `nextRunAt` is due, and updates each loop state with the next adaptive run time.

Report what happened during a run:

```bash
node bin/win-loops.js artifact attach <run-id> \
  --repo /path/to/app \
  --kind pr \
  --url https://github.com/acme/app/pull/123 \
  --title "Checkout fix"

node bin/win-loops.js outcome record <run-id> \
  --repo /path/to/app \
  --status improved \
  --metric error_rate_down \
  --summary "Checkout crash dropped after deploy."

node bin/win-loops.js approval request <run-id> \
  --repo /path/to/app \
  --action "Merge PR 123" \
  --reason "Touches checkout payment flow." \
  --risk medium

node bin/win-loops.js approval approve <approval-id> \
  --repo /path/to/app \
  --by founder \
  --note "Approved after test review."
```

When an approval is approved, the next `tick` creates a new `trigger: "approval"` run brief so the agent can continue with the approved action.

## Catalog

The initial catalog has 50 loop packs across:

- engineering
- SEO
- growth
- ads
- customer
- sales
- finance
- product
- ops

Start with these loops in production:

1. `bug-autofix`
2. `seo-growth`
3. `feedback-to-fix`

They have clear inputs, clear executors, and measurable outcomes.

## Hosted win.sh Role

Local mode gives users inspectable files and agent skills.

win.sh Cloud adds:

- OAuth connectors
- hosted scheduling
- email and mobile approvals
- loop dashboards
- multi-user authority
- traces and artifacts
- cross-loop journals
- managed execution

The hosted product should import and run these same loop packs. Core loop logic should stay visible in Markdown.

## Commands

```bash
win-loops list
win-loops inspect <loop>
win-loops install <loop> [--repo <path>] [--agent codex|claude-code]
win-loops run <loop> [--repo <path>] [--trigger manual|signal] [--signal <text>] [--signal-file <path>] [--fixture <path>] [--connector-fixture <path>]
win-loops status [--repo <path>]
win-loops inbox [--repo <path>]
win-loops next [--repo <path>]
win-loops exec [--repo <path>] [--agent codex|claude-code] [--run <run-id>] [--dry-run]
win-loops tick [--repo <path>]
win-loops enable <loop> [--repo <path>]
win-loops disable <loop> [--repo <path>]
win-loops journals [--repo <path>]
win-loops journal <loop> [--repo <path>]
win-loops artifact attach <run-id> [--repo <path>] [--kind <kind>] [--url <url>] [--path <path>] [--title <text>] [--summary <text>]
win-loops artifact suggestions [--repo <path>]
win-loops artifact suggest <execution-id> [--repo <path>]
win-loops artifact accept <suggestion-id> [--repo <path>]
win-loops outcome record <run-id> [--repo <path>] --status <status> [--metric <metric>] [--summary <text>] [--evidence <text>]
win-loops approval request <run-id> [--repo <path>] --action <text> --reason <text> [--risk low|medium|high] [--approver <text>]
win-loops approval approve <approval-id> [--repo <path>] [--by <text>] [--note <text>]
win-loops approval reject <approval-id> [--repo <path>] [--by <text>] [--note <text>]
win-loops auth login [--token <token>] [--workspace <name>] [--app-url <url>] [--api-url <url>] [--config-dir <path>] [--no-open] [--print-url]
win-loops auth status [--config-dir <path>]
win-loops auth token [--config-dir <path>]
win-loops auth logout [--config-dir <path>]
win-loops snapshot fetch <loop> [--config-dir <path>] [--api-url <url>] [--token <token>] [--output <path>]
win-loops eval
```

## Documentation

- [win.sh product and terminal docs](docs/winsh.md)
- [local install](docs/local-install.md)
- [hosted win.sh integration](docs/hosted-winsh.md)
- [loop format](docs/loop-format.md)
- [publishing](docs/publishing.md)

## Quality Gates

```bash
npm test
npm run eval
npm run check
```

Tests cover loop parsing, catalog validation, installation into a target repo, run-record creation, adaptive scheduling metadata, local scheduler ticks, connector snapshots, terminal auth, hosted snapshot fetching, operator inboxes, executor dry-runs and execution capture, artifact suggestions, reporting commands, CLI flows, and journal writes.
