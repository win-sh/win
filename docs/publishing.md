# Publishing

Target repository:

```text
https://github.com/win-sh/win.git
```

Target npm package:

```text
@win.sh/win
```

## GitHub Setup

Create the repository under the `win-sh` organization:

```bash
git remote add origin git@github.com:win-sh/win.git
git push -u origin main
```

The package metadata already points to:

```text
git+https://github.com/win-sh/win.git
```

## npm Setup

The npm organization should be `win.sh`, which publishes scoped packages as:

```text
@win.sh/<package>
```

This repo is configured as:

```json
{
  "name": "@win.sh/win",
  "publishConfig": {
    "access": "public",
    "provenance": true
  }
}
```

Login with an npm account that has publish access for local registry checks:

```bash
npm login --scope=@win.sh
```

Dry-run package contents:

```bash
npm run pack:dry
```

Publishing with provenance must run from a supported CI provider. The repository includes:

- `.github/workflows/ci.yml` for checks and packaging dry-runs
- `.github/workflows/release.yml` for tag-based npm publishing

Local `npm publish` is expected to fail while `publishConfig.provenance` is enabled because npm cannot create provenance from a plain terminal session.

## Trusted Publishing Setup

Configure npm trusted publishing for the package:

```text
Package: @win.sh/win
Provider: GitHub Actions
Organization: win-sh
Repository: win
Workflow filename: release.yml
Allowed action: npm publish
```

Npm trusted publishing uses OIDC, so the release workflow has `id-token: write` and does not need a long-lived npm token.

For the first `@win.sh/win` publish, npm may require the package to exist before package-level trusted publishing can be configured. If that happens, add a temporary GitHub Actions secret named `NPM_TOKEN` with publish access to the `win.sh` npm org, push the release tag that matches `package.json`, then remove the secret after the package exists and trusted publishing is configured.

## Release Checklist

1. `npm run check`
2. `npm run pack:dry`
3. Confirm `README.md`, `docs/winsh.md`, and `docs/publishing.md` are current.
4. Confirm GitHub Actions passes on `main`.
5. Confirm the release tag matches `package.json`:

```bash
node -p "'v' + require('./package.json').version"
```

6. Tag the release:

```bash
git tag v0.1.2
```

7. Let GitHub Actions publish the tag:

```bash
git push origin v0.1.2
```

## If Publish Fails

If the Release workflow reaches the `Publish` step and fails while npm still returns `404` for `@win.sh/win`, publishing credentials are not configured yet.

Fix one of these:

- Configure npm trusted publishing for `win-sh/win` and workflow filename `release.yml`.
- Or add a temporary GitHub Actions secret named `NPM_TOKEN` with publish access to the `win.sh` npm organization.

After credentials are configured, rerun the failed Release workflow for the existing tag. Do not create another tag unless `package.json` version changes.

## Required Secrets

No npm token is required when trusted publishing is configured on npmjs.com. `NPM_TOKEN` is only for bootstrapping the first package version if npm package settings are not available yet. If the org chooses not to use trusted publishing, remove `publishConfig.provenance` or publish from a supported CI environment with an authorized token.
