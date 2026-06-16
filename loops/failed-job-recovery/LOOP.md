---
name: failed-job-recovery
title: Failed Job Recovery
description: Detect failed jobs, webhooks, or queues and recover safely.
category: engineering
required_connectors:
  - logs
  - github
default_authority: ask_first
---

# Failed Job Recovery

## Goal

Prevent background failures from silently damaging the business.

## When This Runs

A recurring job, webhook, or queue worker fails repeatedly.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

Job logs, webhook dashboards, retry counts, error payloads, recent changes.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Classify transient provider issue versus code/data bug.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Retry safe jobs, open issue, patch code, create support packet.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Retries are automatic when idempotent. Data mutation and billing retries require approval.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

Failed job count drops and affected records are reconciled.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Recheck quickly during incident, then daily until zero failures.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Failure class, idempotency decision, affected records, recovery result.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
