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

Login with an npm account that has publish access:

```bash
npm login --scope=@win.sh
```

Dry-run package contents:

```bash
npm run pack:dry
```

Publish:

```bash
npm publish --access public --provenance
```

## Release Checklist

1. `npm run check`
2. `npm run pack:dry`
3. Confirm `README.md`, `docs/winsh.md`, and `docs/publishing.md` are current.
4. Confirm GitHub Actions passes on `main`.
5. Tag the release:

```bash
git tag v0.1.0
git push origin v0.1.0
```

6. Publish to npm:

```bash
npm publish --access public --provenance
```

## Required Secrets

The current CI only checks and packs. Publishing should stay manual until the org has decided on release permissions.

If automated publishing is added later, use trusted publishing/provenance from GitHub Actions rather than storing long-lived npm tokens.
