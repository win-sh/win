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

## Current Quality Gates

- `npm test`
- `npm run eval`
- `npm run check`

## Next Work

- Add real connector adapters for the first three loops.
- Add richer deterministic evals per loop, beyond contract validation.
- Add MCP server surface for Codex/Claude integration.
- Add hosted win.sh importer and loop dashboard.
- Replace generated generic loop text with deeper hand-authored playbooks for `bug-autofix`, `seo-growth`, and `feedback-to-fix`.
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
