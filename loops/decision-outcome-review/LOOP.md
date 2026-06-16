---
name: decision-outcome-review
title: Decision Outcome Review
description: Revisit past decisions and score whether expected outcomes happened.
category: ops
required_connectors:
  - analytics
  - stripe
default_authority: ask_first
---

# Decision Outcome Review

## Goal

Improve judgment by closing the loop on decisions.

## When This Runs

A decision verification date arrives or a major outcome lands.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

Decision log, expected outcome, metrics, artifacts, follow-up notes.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Compare actual versus expected and classify why it matched or missed.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Score decision, update confidence, suggest policy change.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Scoring automatic. Policy changes require approval.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

Decision has an outcome, learning, and next policy implication.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Run when verification dates arrive.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Decision, expectation, result, bias or pattern.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
