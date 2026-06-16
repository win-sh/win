# Progress

Last updated: 2026-06-16

## Completed

- Created `/Users/romainsimon/dev/win-loops`.
- Added Node 22 ESM package and CLI entrypoint.
- Added parser for Markdown loop contracts with minimal frontmatter.
- Added catalog loader for `loops/*`.
- Added eval validator for loop contract completeness.
- Added local installer that writes `.win/loops`, `.win/state`, `.win/runs`, and `.agents/skills`.
- Added local run creation with run brief, JSONL state, journal entry, and adaptive `nextRun` metadata.
- Scaffolded 50 readable loop packs.
- Added tests for parser, catalog, install, run, and eval behavior.
- Hand-authored deeper production contracts and executor skills for `bug-autofix`, `seo-growth`, and `feedback-to-fix`.
- Added a Sentry-style fixture for `bug-autofix`.
- Added `bug-autofix` signal adapter that turns the fixture into a scoped run signal and executor brief.
- Added CLI support for `win-loops run bug-autofix --fixture <path>`.
- Added focused production-loop and CLI fixture tests.
- Added installed-loop state files with enabled/disabled status.
- Added terminal dashboard command: `win-loops status --repo <path>`.
- Added `enable`, `disable`, `journals`, and per-loop `journal` flows for local operation.
- Added local scheduler command: `win-loops tick --repo <path>`.
- Added due-loop detection that skips disabled loops, writes due run briefs, and persists adaptive `nextRunAt` state.
- Added reporting commands: `artifact attach`, `outcome record`, and `approval request`.
- Added `artifacts.jsonl` plus run updates and journal entries for reporting events.
- Added approval decision commands: `approval approve` and `approval reject`.
- Added scheduler resumption for approved approvals via `trigger: "approval"` run briefs.
- Added operator inbox command: `win-loops inbox --repo <path>`.
- Added next-action command: `win-loops next --repo <path>`.
- Added executor dry-run command: `win-loops exec --agent codex|claude-code --dry-run`.
- Added real executor process spawning with `.win/executions` logs and `executions.jsonl` state.
- Added report-back parsing from execution logs into pending artifact suggestions.
- Added `artifact suggestions`, `artifact suggest`, and `artifact accept` commands.
- Added `artifact-suggestions.jsonl` state plus journal entries for suggested proof.
- Added local Sentry/GitHub connector snapshot support for `bug-autofix`.
- Added CLI support for `win-loops run bug-autofix --connector-fixture <path>`.
- Added connector snapshot support for `seo-growth` and `feedback-to-fix`.
- Added terminal auth commands: `auth login`, `auth status`, `auth token`, and `auth logout`.
- Added browser approval callback support for win.sh Settings API tokens.
- Added hosted connector snapshot fetch command: `snapshot fetch <loop>`.
- Added publish-ready package metadata for `@win.sh/win` and GitHub `win-sh/win`.
- Added GitHub Actions CI and npm dry-pack checks.
- Added full win.sh product, terminal auth, connector, and publishing docs.

## Current Quality Gates

- `npm test`
- `npm run eval`
- `npm run check`

## Next Work

- Push to `github.com/win-sh/win.git` once the org repo exists.
- Publish `@win.sh/win` once npm org access is configured.
- Implement hosted win.sh Settings UI and connector snapshot API against the documented contracts.
- Add richer deterministic evals per individual loop as loops graduate to production autonomy.
- Add MCP server surface for Codex/Claude if direct MCP integration becomes preferable to CLI handoff.
- Add launchd/systemd wrappers if users want a daemon instead of cron or hosted scheduling.

## First Production Candidate

`bug-autofix` should be the first end-to-end loop:

1. Read Sentry/log signal.
2. Rank error by impact.
3. Generate scoped Codex run brief.
4. Open PR.
5. Record artifact.
6. Verify error rate after 24 hours.
7. Append journal entry and update memory.
