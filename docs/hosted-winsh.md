# Hosted win.sh Integration

win.sh Cloud should treat this repo as the loop source.

## Import

Hosted win.sh imports:

- `LOOP.md` as the loop contract
- `SKILL.md` as executor instructions
- `evals/contract.json` as basic contract checks

The hosted database stores per-company loop state:

- installed loop id
- loop version
- authority settings
- connector bindings
- journal entries
- runs
- approvals
- artifacts
- outcomes
- next run schedule

## Connector Snapshots

Hosted connectors should produce deterministic snapshot payloads before a loop runs. The loop adapter owns normalization from connector payloads into a scoped run signal.

For `bug-autofix`, the snapshot combines:

- Sentry issue metadata, sample events, stack frames, affected routes, and impacted users
- GitHub repository metadata, codeowners, and recent commits

For `seo-growth`, the snapshot combines:

- GSC page/query metrics
- page metadata
- competitor SERP patterns
- GitHub candidate files

For `feedback-to-fix`, the snapshot combines:

- support threads and quotes
- customer plan, segment, and MRR
- product analytics for the affected workflow
- GitHub issues and candidate files

The local harness can exercise the same contract with:

```bash
win-loops run bug-autofix \
  --repo /path/to/repo \
  --connector-fixture loops/bug-autofix/examples/connector-snapshot.json
```

Hosted snapshot API:

```text
GET /v1/loops/:loopId/connector-snapshot
Authorization: Bearer <token>
Accept: application/json
```

The terminal harness uses this endpoint through:

```bash
win snapshot fetch bug-autofix
```

## Settings And API Tokens

Add `Settings > API Tokens`.

The page should support:

- create token
- revoke token
- name token
- show workspace
- show scopes
- copy token once
- see last used time

Terminal approval endpoint:

```text
GET /settings/api-tokens/cli?client=win-loops&redirect_uri=<local-callback>&state=<state>
```

Flow:

1. User runs `win auth login`.
2. CLI starts `http://127.0.0.1:<port>/callback`.
3. CLI opens the endpoint above in a browser.
4. win.sh asks the logged-in user to approve a CLI token.
5. win.sh redirects to the callback with `token`, `workspace`, `state`, and optional `expires_at`.

Redirect shape:

```text
http://127.0.0.1:<port>/callback?token=<token>&workspace=<workspace>&state=<state>&expires_at=<iso>
```

Security rules:

- preserve and validate `state`
- use short-lived approval pages
- show scope and workspace before approval
- never display an existing token again after creation
- allow revocation from Settings
- log last used timestamp server-side

## Web UI

Add a top-level `Loops` section:

- Catalog
- Installed loops
- Loop detail
- Journal
- Runs
- Approvals
- Outcomes
- Custom loops

## Agent-Created Loops

The agent may draft custom loops as Markdown.

Rules:

- It may create draft loops.
- It may enable observe-only loops if authority allows.
- It cannot enable write, publish, spend, merge, or customer communication loops without approval.
- It cannot raise its own authority.

## Scheduling

Cron wakes the loop scheduler. The loop state decides whether to run.

Common next-run reasons:

- signal threshold reached
- verification window ended
- cooldown ended
- sample size reached
- manual trigger
- blocked dependency resolved
