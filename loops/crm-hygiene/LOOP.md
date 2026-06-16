---
name: crm-hygiene
title: CRM Hygiene
description: Clean stale deals, missing notes, and next actions.
category: sales
required_connectors:
  - crm
default_authority: ask_first
---

# CRM Hygiene

## Goal

Keep sales data usable and prevent silent pipeline decay.

## When This Runs

Deals go stale, stages conflict, or required fields are missing.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

CRM records, activity history, owner notes, expected close dates.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Identify stale, duplicate, blocked, or missing-context records.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Draft updates, create tasks, request missing info.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Safe metadata cleanup can be automatic. Deal stage changes may require approval.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

Pipeline has fewer stale/unknown records and next actions are explicit.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Run weekly or after major sales activity.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Records changed, stale pattern, next-action quality.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
