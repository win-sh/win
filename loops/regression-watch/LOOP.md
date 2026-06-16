---
name: regression-watch
title: Regression Watch
description: Watch deploys for new errors, broken funnels, or sudden metric drops.
category: engineering
required_connectors:
  - github
  - sentry
  - analytics
default_authority: ask_first
---

# Regression Watch

## Goal

Catch regressions quickly after releases.

## When This Runs

A deploy finishes, a new error group appears, or a critical metric moves after release.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

Deploy history, Sentry, logs, analytics events, funnel metrics, CI status.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Compare before and after deploy windows and isolate the smallest plausible cause.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Open issue, request rollback, ask executor for a patch, notify owner.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Rollback and customer-impacting changes require approval unless full autonomy is granted.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

Verify the regressed metric returns to baseline and no new issue appears in the next 24 hours.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Check 30 minutes after deploy, again after 2 hours if anomalous, then after 24 hours.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Release pattern, regression cause, detection lag, rollback or patch outcome.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
