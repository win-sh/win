# win

[![CI](https://github.com/win-sh/win/actions/workflows/ci.yml/badge.svg)](https://github.com/win-sh/win/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@win.sh/win?color=111827)](https://www.npmjs.com/package/@win.sh/win)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Business improvement loops for AI agents.

`win` turns repeatable business work into inspectable Markdown loops that Codex, Claude Code, or hosted win.sh can execute: fix production bugs, grow SEO traffic, process customer feedback, optimize ads, watch conversion, follow up outcomes, and remember what worked.

```bash
npm install -g @win.sh/win
win list
```

Local-first. Hosted-ready. No black box.

When working from a source checkout before the package is installed globally, use `node bin/win-loops.js` in place of `win`.

## Why win?

Most agent automations are cron jobs with a prompt attached. Real business work is a loop:

1. Watch the right signal.
2. Decide whether action is worth it.
3. Create a scoped run brief.
4. Let an agent execute inside authority rules.
5. Capture artifacts and approvals.
6. Verify the metric later.
7. Update memory and schedule the next useful run.

`win` packages those loops as files you can read, version, install, run locally, and later hand to hosted win.sh.

## 60-Second Start

```bash
git clone https://github.com/win-sh/win.git
cd win
npm install
npm run check
```

Install the first production loop into an app repo:

```bash
win install bug-autofix --repo /path/to/app --agent codex
```

Create a run from a realistic connector snapshot:

```bash
win run bug-autofix \
  --repo /path/to/app \
  --connector-fixture loops/bug-autofix/examples/connector-snapshot.json
```

Ask the local agent what to do next:

```bash
win next --repo /path/to/app
win exec --repo /path/to/app --agent codex --dry-run
```

Execute and capture output:

```bash
win exec --repo /path/to/app --agent codex --run <run-id>
```

Review proof suggested from the execution log:

```bash
win artifact suggestions --repo /path/to/app
win artifact accept <suggestion-id> --repo /path/to/app
```

## What You Get

- 50 readable loop packs across engineering, SEO, growth, ads, customer, sales, finance, product, and ops.
- Production-grade starter loops for `bug-autofix`, `seo-growth`, and `feedback-to-fix`.
- Local terminal dashboard with enabled state, current status, next run time, countdown, and last run.
- Adaptive scheduling: cron can wake the process, but each loop chooses the next useful run date.
- Append-only loop journals.
- Run briefs under `.win/runs/`.
- Execution logs under `.win/executions/`.
- Artifact suggestions parsed from agent output.
- Approval and outcome tracking.
- Connector snapshot contracts for hosted win.sh.
- Browser-based terminal auth for hosted win.sh API tokens.

## Production Loops

### Bug Autofix

Turns Sentry/log errors and GitHub context into scoped fix briefs.

```bash
win run bug-autofix \
  --repo /path/to/app \
  --connector-fixture loops/bug-autofix/examples/connector-snapshot.json
```

The adapter normalizes:

- Sentry issue metadata and sample events
- impacted paying users
- stack frames and affected routes
- GitHub codeowners and recent commits

### SEO Growth

Turns GSC, page, competitor, and repo context into one SEO action.

```bash
win run seo-growth \
  --repo /path/to/site \
  --connector-fixture loops/seo-growth/examples/connector-snapshot.json
```

The adapter normalizes:

- GSC page/query metrics
- target page metadata
- competitor SERP patterns
- candidate website files
- verification window

### Feedback To Fix

Turns support threads, customer value, analytics, and GitHub context into a fix, issue, docs change, or reply draft.

```bash
win run feedback-to-fix \
  --repo /path/to/app \
  --connector-fixture loops/feedback-to-fix/examples/connector-snapshot.json
```

The adapter normalizes:

- representative user quotes
- classification
- affected paying users and revenue at risk
- existing GitHub issues
- candidate files
- customer reply draft with approval boundary

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
```

Nothing is hidden. You can inspect, diff, commit, back up, or migrate every important decision.

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

Current coverage includes:

- loop parsing and catalog validation
- installation into target repos
- run brief creation
- adaptive scheduling and tick behavior
- connector snapshots
- terminal auth
- hosted snapshot fetching
- operator inbox and next actions
- executor dry-runs and execution capture
- artifact suggestions
- approvals, outcomes, and journal writes

## Documentation

- [win.sh product and terminal docs](docs/winsh.md)
- [local install](docs/local-install.md)
- [hosted win.sh integration](docs/hosted-winsh.md)
- [loop format](docs/loop-format.md)
- [publishing](docs/publishing.md)

## Publishing

Target GitHub repo:

```text
https://github.com/win-sh/win.git
```

Target npm package:

```text
@win.sh/win
```

Dry run:

```bash
npm run pack:dry
```

Publish:

```bash
npm publish --access public --provenance
```

## License

MIT
