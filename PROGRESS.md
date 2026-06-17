# Progress

Last updated: 2026-06-17

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
- Pushed the repository to `github.com/win-sh/win.git` with `main` as the default branch.
- Removed the obsolete remote feature branch.
- Verified production win.sh API docs, homepage links, and footer links.
- Verified production API auth failure behavior for unauthenticated and invalid-token requests.
- Verified CLI browser approval URL generation for hosted API token login.
- Added `CHANGELOG.md` release notes for `v0.1.0`.
- Noted that the existing `v0.1.0` tag predates the final banner and changelog docs.
- Bumped the publish candidate to `@win.sh/win@0.1.1` to avoid rewriting the existing public `v0.1.0` tag.
- Hardened the release workflow with tag/package version matching and token-or-OIDC publishing.
- Pushed the `v0.1.1` release tag after CI passed on `main`.
- Confirmed the `v0.1.1` Release workflow passed checks and failed only at the npm `Publish` step.
- Confirmed npm still returns `404` for `@win.sh/win` and the local npm token returns `E401`.
- Added Codex Automation and Claude Code recurring-task compatibility by writing both `.agents/skills` and `.claude/skills`.
- Added marked win.sh guidance sections to `AGENTS.md` and `CLAUDE.md` during loop install.
- Bumped the next publish candidate to `@win.sh/win@0.1.2` because `v0.1.1` predates the automation compatibility changes.

## Current Quality Gates

- `npm test`
- `npm run eval`
- `npm run check`
- `npm run pack:dry`

## Next Work

- Publish `@win.sh/win` once npm org access is configured.
- Configure npm trusted publishing for `win-sh/win` or add a temporary `NPM_TOKEN` to bootstrap the first publish.
- Cut and push the `v0.1.2` release tag after npm trusted publishing or `NPM_TOKEN` is configured.
- Complete a browser-approved CLI token creation test with a signed-in win.sh session.
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
