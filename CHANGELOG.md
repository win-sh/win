# Changelog

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

Current `npm run check` covers 55 tests plus the catalog eval with all 50 loop packs.

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
- Release tag: `v0.1.0`
- npm package target: `@win.sh/win`

The package is ready to publish, but npm publication depends on either:

- npm trusted publishing configured for GitHub Actions, or
- a valid temporary `NPM_TOKEN` with publish access to the `win.sh` npm organization.

Local npm authentication was not valid during verification, so `@win.sh/win` was not published from the terminal.

### Known Limits

- Local mode writes `.win/` and `.agents/` files into the target repo by design.
- Hosted connector snapshots require a bearer token with the appropriate snapshot scope.
- Browser-approved CLI auth requires a signed-in win.sh session.
- The first npm publish may need a temporary token before package-level trusted publishing can be configured.
