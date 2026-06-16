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

The local harness can exercise the same contract with:

```bash
win-loops run bug-autofix \
  --repo /path/to/repo \
  --connector-fixture loops/bug-autofix/examples/connector-snapshot.json
```

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
