---
name: pricing-experiment
title: Pricing Experiment
description: Monitor pricing metrics and propose reversible pricing tests.
category: growth
required_connectors:
  - stripe
  - analytics
default_authority: ask_first
---

# Pricing Experiment

## Goal

Improve ARPU and conversion without increasing churn unexpectedly.

## When This Runs

Conversion, ARPU, churn, refund, or competitor pricing signals change.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

Stripe plans, checkout conversion, churn cohorts, competitor pricing, support objections.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Estimate upside, downside, reversibility, affected cohorts, and trust impact.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Propose price/page/offer test with rollback plan.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Pricing changes require explicit approval. The loop may draft only by default.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

Measure conversion, ARPU, churn, refunds, and support complaints.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Run monthly or when material pricing signal appears.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Hypothesis, cohort, test design, result, rollback decision.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
