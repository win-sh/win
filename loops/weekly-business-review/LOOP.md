---
name: weekly-business-review
title: Weekly Business Review
description: Summarize business metrics, decisions, risks, and next actions.
category: ops
required_connectors:
  - stripe
  - analytics
  - support
default_authority: ask_first
---

# Weekly Business Review

## Goal

Maintain operator situational awareness and decision quality.

## When This Runs

Weekly review time arrives or owner requests a review.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

Revenue, traffic, activation, support, product changes, decisions, loop journals.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Separate meaningful changes from noise and identify the highest-leverage next action.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Write review, propose decisions, update beliefs.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Reports automatic. New actions follow their loop authority.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

Next week, decision outcomes and metric predictions are checked.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Run weekly, then schedule outcome review for next cycle.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Metrics, decisions, predictions, misses, learnings.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
