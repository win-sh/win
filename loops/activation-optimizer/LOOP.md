---
name: activation-optimizer
title: Activation Optimizer
description: Find onboarding drop-offs and ship improvements that increase first value.
category: growth
required_connectors:
  - analytics
  - github
default_authority: ask_first
---

# Activation Optimizer

## Goal

Increase the share of new users reaching activation.

## When This Runs

Activation rate drops or onboarding step has high abandonment.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

Event funnel, session recordings if available, support feedback, onboarding code.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Classify friction as clarity, technical, setup, pricing, or missing integration.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Draft onboarding change, checklist, empty state, or bug fix.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Product changes require normal code authority.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

Activation rate improves and support confusion decreases.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Run when enough new users enter onboarding or after a product change.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Friction found, fix shipped, activation delta.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
