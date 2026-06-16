# win-loops

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
```

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
win-loops run <loop> [--repo <path>] [--trigger manual|signal] [--signal <text>]
win-loops status [--repo <path>]
win-loops tick [--repo <path>]
win-loops enable <loop> [--repo <path>]
win-loops disable <loop> [--repo <path>]
win-loops journals [--repo <path>]
win-loops journal <loop> [--repo <path>]
win-loops artifact attach <run-id> [--repo <path>] [--kind <kind>] [--url <url>] [--path <path>] [--title <text>] [--summary <text>]
win-loops outcome record <run-id> [--repo <path>] --status <status> [--metric <metric>] [--summary <text>] [--evidence <text>]
win-loops approval request <run-id> [--repo <path>] --action <text> --reason <text> [--risk low|medium|high] [--approver <text>]
win-loops eval
```

## Quality Gates

```bash
npm test
npm run eval
npm run check
```

Tests cover loop parsing, catalog validation, installation into a target repo, run-record creation, adaptive scheduling metadata, local scheduler ticks, reporting commands, CLI flows, and journal writes.
