---
name: lifecycle-nurture
title: Lifecycle Nurture
description: Send or draft timely lifecycle messages based on user stage.
category: customer
required_connectors:
  - analytics
  - email
default_authority: ask_first
---

# Lifecycle Nurture

## Goal

Improve activation, retention, and expansion through relevant communication.

## When This Runs

User enters milestone, stalls, upgrades, or risks churn.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

Product events, lifecycle stage, plan, support history, prior messages.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Select useful message or no-op based on user context and cooldown.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Draft onboarding, education, upgrade, or retention message.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Sending requires authority and suppression rules.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

Measure activation, reply, conversion, and unsubscribe.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Run on lifecycle events and cooldown windows.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Segment, message, result, learning.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
