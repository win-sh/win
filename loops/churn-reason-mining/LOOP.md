---
name: churn-reason-mining
title: Churn Reason Mining
description: Mine churn, refunds, and support for repeated cancellation causes.
category: customer
required_connectors:
  - stripe
  - support
default_authority: ask_first
---

# Churn Reason Mining

## Goal

Reduce churn by finding repeated causes worth fixing.

## When This Runs

New churn events, refund requests, or cancellation feedback accumulates.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

Stripe churn/refunds, cancellation reasons, support conversations, usage data.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Cluster causes by revenue, frequency, preventability, and product area.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Create churn insight, propose product/support/pricing action.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Analysis automatic. Product/communication actions require authority.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

The targeted churn cause declines or is deprioritized with evidence.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Run when enough new churn data exists or monthly.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Churn cluster, evidence, proposed fix, outcome.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
