---
name: refund-dispute-defense
title: Refund and Dispute Defense
description: Gather evidence for refunds or disputes and draft responses.
category: finance
required_connectors:
  - stripe
  - support
default_authority: ask_first
---

# Refund and Dispute Defense

## Goal

Handle payment disputes with evidence and consistent policy.

## When This Runs

A dispute, refund request, or chargeback signal appears.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

Stripe invoice, usage logs, terms, support history, product access.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Assess validity, policy, customer harm, evidence completeness, and goodwill risk.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Draft evidence packet, recommend refund/defense, create support response.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Submission/refund requires money authority. Drafting evidence is automatic.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

Track dispute result, refund acceptance, and policy learning.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Run immediately on dispute and before submission deadline.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Reason, evidence, decision, outcome, future prevention.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
