---
name: winback
title: Winback Loop
description: Identify churned or high-intent users and draft targeted winback actions.
category: growth
required_connectors:
  - stripe
  - email
default_authority: ask_first
---

# Winback Loop

## Goal

Recover qualified users who churned or stalled.

## When This Runs

A churned segment emerges or a product fix addresses prior churn reason.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

Stripe churn data, cancellation reasons, product changes, email history.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Segment by reason, value, timing, and whether the product now solves the issue.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Draft winback email, offer, or product update note.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Draft-only by default. Sending requires communication authority.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

Measure replies, reactivations, unsubscribes, and revenue recovered.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Run after relevant product fixes and monthly for churn cohorts.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Segment, message angle, send status, recovered revenue.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
