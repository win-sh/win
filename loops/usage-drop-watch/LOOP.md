---
name: usage-drop-watch
title: Usage Drop Watch
description: Detect product usage drops by cohort or feature and investigate.
category: product
required_connectors:
  - analytics
default_authority: ask_first
---

# Usage Drop Watch

## Goal

Catch product value degradation before churn.

## When This Runs

Active usage, feature use, or cohort retention drops.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

Product analytics, cohort data, release history, support feedback.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Identify if drop is tracking, seasonality, broken flow, UX friction, or lost demand.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Create investigation, open issue, propose fix or no-op.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Read-only automatic. Product changes require code authority.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

Usage stabilizes or cause is documented with next action.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Run when usage threshold changes and after relevant release.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Cohort, feature, cause, follow-up action.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
