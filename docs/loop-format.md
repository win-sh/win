# Loop Format

Each loop pack lives under `loops/<loop-id>/`.

Required files:

```text
LOOP.md
SKILL.md
journal.md
examples/input.json
examples/run-brief.md
evals/contract.json
```

## LOOP.md

`LOOP.md` is the business contract.

Required frontmatter:

```md
---
name: bug-autofix
title: Bug Autofix
description: Watch production errors and open verified fix PRs.
category: engineering
required_connectors:
  - github
  - sentry
default_authority: ask_first
---
```

Required headings:

- `Goal`
- `When This Runs`
- `Signals`
- `Diagnosis`
- `Allowed Actions`
- `Authority`
- `Executor Instructions`
- `Verification`
- `Adaptive Scheduling`
- `Journal`
- `Memory Update`

## SKILL.md

`SKILL.md` is the executor workflow for Codex, Claude Code, or win.sh Cloud.

The skill should execute a scoped run brief. It should not decide the whole business strategy.

## journal.md

The journal is append-only loop memory.

Each entry should record:

- signal
- diagnosis
- action
- expected outcome
- verification date
- actual outcome
- learning

## Adaptive Scheduling

Every run must end with:

```json
{
  "nextRun": {
    "at": "2026-06-16T14:00:00.000Z",
    "reason": "manual trigger created an execution brief; follow up after the executor reports an artifact",
    "confidence": "medium"
  }
}
```

Cron can wake the scheduler. The loop decides whether the next run is useful.
