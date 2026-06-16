---
name: margin-watch
title: Margin Watch
description: Monitor infrastructure, model, ads, and vendor costs against revenue.
category: finance
required_connectors:
  - stripe
  - billing
default_authority: ask_first
---

# Margin Watch

## Goal

Protect gross margin and detect cost leaks.

## When This Runs

Cost or margin moves outside threshold.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

Revenue, model costs, hosting, provider bills, ad spend, usage by customer.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Separate growth-driven cost, leak, abuse, bad pricing, or provider change.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Recommend cuts, pricing changes, limits, or vendor changes.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Cost-cut recommendations automatic. Production changes require authority.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

Margin returns to target or exception is documented.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Run weekly and on cost spike anomalies.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Cost driver, action, savings, margin result.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
