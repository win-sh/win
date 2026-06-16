---
name: mrr-anomaly
title: MRR Anomaly
description: Detect and diagnose MRR, churn, expansion, and refund anomalies.
category: finance
required_connectors:
  - stripe
  - analytics
default_authority: ask_first
---

# MRR Anomaly

## Goal

Explain revenue movement quickly and accurately.

## When This Runs

MRR, churn, expansion, refunds, or trial conversion moves materially.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

Stripe events, customer segments, plan changes, refunds, product usage.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Classify data issue, cohort behavior, pricing impact, churn driver, or expansion event.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Create diagnosis report, recommend action, open follow-up loops.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Analysis automatic. Money/customer actions require authority.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

Anomaly is explained and linked actions are verified.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Run on anomaly and after follow-up data arrives.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Metric move, cause, confidence, action, result.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
