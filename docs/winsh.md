# win.sh Documentation

This repository is the open-source loop harness for win.sh.

It contains:

- readable loop packs in `loops/*`
- a terminal CLI published as `@win.sh/win`
- local state and journal files under `.win/`
- Codex-compatible skills under `.agents/skills`
- Claude Code-compatible skills under `.claude/skills`
- root `AGENTS.md` and `CLAUDE.md` guidance sections for native automations
- connector snapshot contracts that hosted win.sh can fill from OAuth integrations

## Install

```bash
npm install -g @win.sh/win
```

The package exposes two equivalent commands:

```bash
win --help
win-loops --help
```

Use `win` for new docs and `win-loops` when working with older examples.

## Local Loop Flow

Install a loop into an app repo:

```bash
win install bug-autofix --repo /path/to/app --agent codex
```

Create a run from a plain signal:

```bash
win run bug-autofix \
  --repo /path/to/app \
  --signal "Sentry error group checkout-null-pointer repeated 21 times."
```

Create a run from a connector snapshot:

```bash
win run seo-growth \
  --repo /path/to/site \
  --connector-fixture loops/seo-growth/examples/connector-snapshot.json
```

Execute a run locally:

```bash
win next --repo /path/to/app
win exec --repo /path/to/app --agent codex --dry-run
win exec --repo /path/to/app --agent codex --run <run-id>
```

Review proof suggested from execution logs:

```bash
win artifact suggestions --repo /path/to/app
win artifact accept <suggestion-id> --repo /path/to/app
```

Record outcomes and approvals:

```bash
win outcome record <run-id> --repo /path/to/app --status improved --metric error_rate_down
win approval request <run-id> --repo /path/to/app --action "Merge PR" --reason "Touches checkout"
win approval approve <approval-id> --repo /path/to/app --by founder
```

## Terminal Auth

The terminal can connect to hosted win.sh with an API token.

Browser approval flow:

```bash
win auth login
```

Expected flow:

1. CLI starts a localhost callback server.
2. CLI opens `https://win.sh/settings/api-tokens/cli`.
3. User approves a token in win.sh Settings.
4. win.sh redirects back to the local callback with the token.
5. CLI stores the token in `~/.config/win-loops/auth.json` with file mode `0600`.

Manual token fallback:

```bash
win auth login --token <token> --workspace <workspace>
```

Inspect auth:

```bash
win auth status
win auth token
win auth logout
```

## win.sh Settings API Token Contract

Hosted win.sh should expose:

```text
GET /settings/api-tokens
GET /settings/api-tokens/cli?client=win-loops&redirect_uri=<local-callback>&state=<state>
```

The CLI approval page should:

- require an authenticated win.sh user
- show the workspace and token scope
- create a token scoped to loop execution and connector snapshot reads
- redirect to the supplied local callback after approval
- preserve the `state` parameter

Redirect shape:

```text
http://127.0.0.1:<port>/callback?token=<token>&workspace=<workspace>&state=<state>&expires_at=<iso>
```

The CLI rejects callbacks with a state mismatch or missing token.

## Hosted Connector Snapshot Contract

Hosted win.sh should normalize OAuth connector data into deterministic snapshots before each loop run.

The CLI fetches hosted snapshots with:

```bash
win snapshot fetch bug-autofix
win snapshot fetch seo-growth --output .win/snapshots/seo-growth.json
```

API endpoint:

```text
GET /v1/loops/:loopId/connector-snapshot
Authorization: Bearer <win.sh token>
Accept: application/json
```

The response body is the same JSON shape accepted by:

```bash
win run <loop> --connector-fixture <snapshot.json>
```

Current production snapshot adapters:

- `bug-autofix`: Sentry issue/events + GitHub repo/codeowners/commits
- `seo-growth`: GSC rows + page metadata + competitors + GitHub candidate files
- `feedback-to-fix`: support threads + customers + analytics + GitHub issues/files

## Hosted Web App

Hosted win.sh should include these sections:

- Loops catalog
- Installed loops
- Loop detail
- Run detail
- Journal
- Artifacts
- Approvals
- Outcomes
- Settings > API Tokens
- Settings > Connectors
- Custom loops

Loop detail should show:

- enabled status
- authority level
- next scheduled run
- countdown until next run
- latest run status
- pending approvals
- pending artifact suggestions
- journal entries

The agent may suggest enabling a loop or creating a custom loop, but win.sh must require explicit approval before enabling any loop that can publish, merge, spend money, or send customer communication.

## Local State

Installed repos store:

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
```

The journal is append-only. Runs and reporting state are JSONL so users can inspect, diff, back up, and migrate them.

## Scheduler

Cron can wake the scheduler, but each loop decides the next useful run time:

```bash
win tick --repo /path/to/app
```

Example cron wrapper:

```cron
*/15 * * * * win tick --repo /path/to/app >> /path/to/app/.win/tick.log 2>&1
```

Hosted win.sh should use the same contract: a frequent scheduler wakeup plus per-loop adaptive `nextRunAt`.
