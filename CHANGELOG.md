# Changelog

## v0.1.2 - 2026-06-17

Agent automation compatibility release.

- `win install` now writes loop skills to both `.agents/skills` for Codex and `.claude/skills` for Claude Code.
- `win install` now adds a marked win.sh section to `AGENTS.md` and `CLAUDE.md`, preserving existing project guidance.
- Added Codex Automation and Claude Code recurring-task prompts in `docs/agent-automations.md`.
- Documented the fixed wake-up/adaptive loop split: native automations wake the repo, `win tick` decides whether work is actually due.
- Published `@win.sh/win@0.1.2` to npm and verified clean install from the public registry.
- Added a release workflow guard that skips npm publish when the exact package version already exists.

## v0.1.1 - 2026-06-17

Release packaging correction for the first npm publish candidate.

- Bumped the package to `0.1.1` so the final banner, changelog, and release docs can ship without rewriting the already-pushed `v0.1.0` tag.
- Updated the release workflow to require the pushed tag to match `package.json`.
- Updated the release workflow to publish with a temporary `NPM_TOKEN` when present, or npm trusted publishing OIDC when configured.
- Removed the obsolete feature branch from CI triggers after the remote branch cleanup.

## v0.1.0 - 2026-06-17

Initial public release candidate for `@win.sh/win`.

### Highlights

- Added the open-source win loop harness for Codex, Claude Code, and hosted win.sh.
- Added 50 readable loop packs across engineering, SEO, growth, ads, customer, sales, finance, product, and operations.
- Added production-ready starter loops for `bug-autofix`, `seo-growth`, and `feedback-to-fix`.
- Added adaptive scheduling where cron can wake the process, but each loop decides its next useful run time.
- Added append-only journals, run briefs, approvals, outcomes, artifact suggestions, and execution logs under local `.win/` state.
- Added terminal dashboard commands for loop status, operator inbox, next action, journals, and scheduler ticks.
- Added browser-approved hosted win.sh CLI auth and manual token fallback.
- Added hosted connector snapshot fetch support through the documented win.sh API contract.
- Added CI, package dry-run checks, release workflow scaffolding, and publish-ready metadata for `@win.sh/win`.

### Included CLI Surface

Core local commands:

```bash
win list
win inspect <loop>
win install <loop> --repo /path/to/app --agent codex
win run <loop> --repo /path/to/app
win status --repo /path/to/app
win tick --repo /path/to/app
win inbox --repo /path/to/app
win next --repo /path/to/app
win exec --repo /path/to/app --agent codex --dry-run
win journals --repo /path/to/app
win journal <loop> --repo /path/to/app
```

Hosted commands:

```bash
win auth login
win auth status
win snapshot fetch bug-autofix --output .win/snapshots/bug-autofix.json
```

### Quality Gates

The release candidate was verified with:

```bash
npm run check
npm run pack:dry
```

Current `npm run check` covers 56 tests plus the catalog eval with all 50 loop packs.

### Hosted win.sh Status

- Production API docs are live at `https://win.sh/docs/api`.
- The homepage and footer link to the API reference.
- Unauthenticated production API requests return `401 Authentication required`.
- The CLI can generate the browser approval URL for `https://win.sh/settings/api-tokens/cli`.
- Invalid hosted API tokens are rejected with `401 Unauthorized`.

Full browser-approved token creation still requires a signed-in win.sh browser session and user approval.

### Publishing Status

- GitHub repository: `https://github.com/win-sh/win`
- Default branch: `main`
- Release tag: `v0.1.2`
- npm package target: `@win.sh/win`

`@win.sh/win@0.1.2` is published on npm and installable with `npm install -g @win.sh/win`. The first publish was bootstrapped locally without provenance; future releases should use npm trusted publishing from GitHub Actions.

### Known Limits

- Local mode writes `.win/` and `.agents/` files into the target repo by design.
- Hosted connector snapshots require a bearer token with the appropriate snapshot scope.
- Browser-approved CLI auth requires a signed-in win.sh session.
- Trusted publishing still needs to be configured before the next provenance-backed npm release.
