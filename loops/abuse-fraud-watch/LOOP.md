---
name: abuse-fraud-watch
title: Abuse and Fraud Watch
description: Detect suspicious usage, payment fraud, or account abuse.
category: finance
required_connectors:
  - stripe
  - analytics
default_authority: ask_first
---

# Abuse and Fraud Watch

## Goal

Limit abuse, fraud, and cost leakage without harming good users.

## When This Runs

Usage/cost/payment patterns cross abuse thresholds.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

Usage logs, Stripe risk signals, account history, IP/device patterns.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Separate legitimate heavy use, fraud, scraping, and configuration issue.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Flag account, recommend limits, draft customer note, request review.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Account restrictions and refunds require approval by default.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

Abuse metric declines and false positives are reviewed.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Run on threshold breach and daily for active incidents.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Signal, classification, action, false-positive review.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
