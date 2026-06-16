---
name: failed-payment-recovery
title: Failed Payment Recovery
description: Detect failed payments and recover revenue with controlled customer communication.
category: finance
required_connectors:
  - stripe
  - email
default_authority: ask_first
---

# Failed Payment Recovery

## Goal

Recover failed payments without damaging trust.

## When This Runs

Payment fails, subscription becomes past due, or dunning does not recover.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

Stripe invoices, customer history, plan, prior payment failures, email status.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Classify card issue, fraud risk, high-value account, and communication timing.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Draft recovery email, create task, update customer note.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Emails require communication authority. Refunds/credits require money authority.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

Measure recovered MRR, cancellation, or no-response outcome.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Run on payment failure, then according to dunning intervals.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Customer segment, message, recovered amount, outcome.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
