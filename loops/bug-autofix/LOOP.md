---
name: bug-autofix
title: Bug Autofix
description: Watch production errors, open scoped fix PRs, and verify that the error rate drops.
category: engineering
required_connectors:
  - github
  - sentry
default_authority: ask_first
---

# Bug Autofix

## Goal

Reduce production errors without introducing regressions. The loop should turn a concrete production failure into a scoped engineering task, get an executor to fix it, and verify that the error actually stops.

The loop optimizes for customer impact, not log volume. A rare error that blocks a paying user's checkout beats a noisy harmless warning.

## When This Runs

Run when one of these conditions is true:

- A Sentry or log error group crosses 10 events in 1 hour.
- A paying user hits the same error twice.
- Three or more paying users hit the same error group.
- A new error appears within 2 hours of a deploy.
- A critical flow fails: signup, login, checkout, payment, core generation, export, or admin access.
- The owner manually starts the loop from win.sh, the local CLI, Codex, or Claude Code.

Do not run for warnings, bot-only errors, local development noise, or provider outages that clearly require waiting rather than code changes.

## Signals

Read:

- Error group id, title, level, event count, first seen, last seen.
- Affected routes, releases, suspect commits, suspect files, stack traces.
- User impact: anonymous users, paying users, plan, MRR at risk, affected accounts.
- Recent deploys and merged PRs.
- Existing GitHub issues and open PRs touching the same area.
- CI status and recent failed tests.

Minimum signal for action:

- an error group id or reproducible log pattern
- affected route or stack trace
- user impact or frequency
- suspected code area

If the minimum signal is missing, create an investigation note instead of asking an executor to patch.

## Diagnosis

Compute an Impact score before acting:

```text
Impact score =
  paying_users_affected * 5
  + event_count_bucket
  + revenue_risk_bucket
  + critical_flow_bonus
  + deploy_correlation_bonus
  - known_provider_outage_penalty
```

Use the score to classify:

- `p1`: checkout/payment/core product blocked, 3+ paying users affected, or clear deploy regression.
- `p2`: repeated user-visible error with limited revenue impact.
- `p3`: low-volume, non-critical, or uncertain impact.

Diagnosis must separate:

- facts from logs
- assumptions about root cause
- missing context
- exact files likely involved
- safest next action

Prefer the smallest fix that removes the error. Do not redesign the area. Do not broaden into unrelated cleanup.

## Allowed Actions

The loop may:

- Create a GitHub issue with impact, reproduction, stack trace, and suspect files.
- Create a scoped run brief for Codex or Claude Code.
- Ask the executor to reproduce the error.
- Ask the executor to implement the smallest safe patch.
- Ask the executor to add or update a regression test.
- Ask the executor to open a PR.
- Attach PR, test output, screenshots, logs, and verification notes to the run.
- Request merge approval.

The loop may not:

- Merge without explicit authority.
- Deploy without explicit authority.
- Touch billing, auth, payment-provider configuration, user deletion, or data migration without approval.
- Disable tests to pass CI.
- Suppress or ignore the error without explaining why root cause does not need a patch.
- Retry the same failed fix pattern more than once without new evidence.

## Authority

Default authority:

- Read logs and errors: automatic.
- Create issue: automatic.
- Create run brief: automatic.
- Ask executor for patch: automatic for `p2` and `p3`, ask-first for `p1`.
- Open PR: automatic.
- Merge PR: ask-first.
- Deploy: ask-first.
- Emergency hotfix: disabled.
- Billing, auth, payments, data deletion, or migration code: ask-first even when the rest of the loop has higher autonomy.

Do not merge. The executor skill must repeat this boundary in its output.

The loop cannot raise its own authority. It may suggest authority upgrade only after at least 10 successful fixes, no unauthorized changes, and verified error reduction above 80% on at least 90% of runs.

## Executor Instructions

Use the companion `SKILL.md` as the scoped execution workflow.

The run brief must include:

- error group id
- impact score and priority
- affected users or customer class
- stack trace
- suspect files
- exact non-goals
- tests expected
- merge/deploy boundary

The executor should:

1. Reproduce the failure if practical.
2. Locate the smallest code path that can explain it.
3. Add or update a regression test.
4. Implement the smallest safe fix.
5. Run the narrowest relevant checks first, then broader checks if needed.
6. Open a PR or provide a patch.
7. Report risks, test output, and verification recommendation.

## Verification

After merge or deploy, verify for 24 hours.

Success:

- The same error group drops by at least 80%.
- No new related error group appears.
- CI remains green.
- The affected flow passes a synthetic or manual check.
- No paying user reports the same issue again during the window.

Failure:

- Error drops less than 80%.
- A related error appears.
- Fix creates a new regression.
- Users still report the same issue.

If verification fails, reopen the loop, link the failed PR, downgrade confidence in the fix pattern, and ask before trying a second patch.

## Adaptive Scheduling

Scheduling rules:

- New `p1` signal: run immediately.
- New `p2` signal: run within 1 hour.
- New `p3` signal: batch until daily unless it repeats.
- After run brief creation: check in 6 hours for executor artifact.
- After PR opened: check when CI finishes or after 4 hours.
- After merge/deploy: verify after 24 hours.
- If the error continues during verification: rerun immediately only once, then ask.
- If provider outage is likely: wait 2 hours and recheck before patching.

Every run must end with `nextRunAt`, reason, confidence, and required next signal.

## Journal

Append one entry per run:

- error group and priority
- impact score
- affected users
- suspected root cause
- action taken
- PR or issue URL
- tests run
- verification deadline
- verification outcome
- learning

Keep failed attempts. They are useful memory.

## Memory Update

Record:

- root cause
- changed files
- test added
- fix pattern
- release or commit that introduced the issue
- verification result
- failed hypotheses
- areas that need stronger tests

If the same class of bug appears twice, propose a prevention task: test coverage, type guard, lint rule, monitor, fixture, or product flow check.
