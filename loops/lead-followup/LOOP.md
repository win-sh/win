---
name: lead-followup
title: Lead Follow-up
description: Detect stale leads or trials and draft next best follow-up.
category: sales
required_connectors:
  - crm
  - email
  - analytics
default_authority: ask_first
---

# Lead Follow-up

## Goal

Recover interested prospects with timely follow-up.

## When This Runs

Lead is stale, trial has intent signal, or reply is waiting.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

CRM stage, email history, product usage, website activity.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Determine next step: answer objection, ask question, offer help, or stop.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Draft follow-up and update CRM next action.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Sending requires communication authority.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

Measure reply, conversion, or qualified close-lost reason.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Run when lead state changes or follow-up date arrives.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Lead status, reason for follow-up, message, outcome.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
