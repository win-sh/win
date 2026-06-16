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

## Current Quality Gates

- `npm test`
- `npm run eval`
- `npm run check`

## Next Work

- Add real connector adapters for the first three loops.
- Add richer deterministic evals per loop, beyond contract validation.
- Add MCP server surface for Codex/Claude integration.
- Add hosted win.sh importer and loop dashboard.
- Add approval inbox/listing command for pending decisions.
- Add configurable local scheduler daemon/service wrappers for launchd, cron, and GitHub Actions.
- Add GitHub Actions CI after repo is published.

## First Production Candidate

`bug-autofix` should be the first end-to-end loop:

1. Read Sentry/log signal.
2. Rank error by impact.
3. Generate scoped Codex run brief.
4. Open PR.
5. Record artifact.
6. Verify error rate after 24 hours.
7. Append journal entry and update memory.
