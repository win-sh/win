---
name: support-quality
title: Support Quality
description: Review support threads for unresolved pain and response quality.
category: customer
required_connectors:
  - support
default_authority: ask_first
---

# Support Quality

## Goal

Improve support outcomes and extract product learnings.

## When This Runs

Open threads age, repeated follow-ups, low satisfaction, or unresolved pain appears.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

Support inbox, response times, customer sentiment, linked product issues.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Identify unresolved root cause, missing macro, product gap, or bad response.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Draft follow-up, propose macro, create issue, record learning.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Customer replies require authority. Internal notes are automatic.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

Thread closes satisfactorily or gets escalated with clear owner.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Run daily for active inboxes and faster for urgent customers.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Thread pattern, support gap, action, customer outcome.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
