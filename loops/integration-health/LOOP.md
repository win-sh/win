---
name: integration-health
title: Integration Health
description: Monitor OAuth/API connectors and recover broken access before loops fail.
category: ops
required_connectors:
  - integrations
default_authority: ask_first
---

# Integration Health

## Goal

Keep data sources connected and prevent silent blind spots.

## When This Runs

Connector errors, expired tokens, missing scopes, or stale sync timestamps appear.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

Connector status, last sync, API errors, scope grants, loop dependencies.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Classify credential, provider outage, scope, quota, or code issue.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Notify owner, create support packet, pause dependent loops, retry safe sync.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Credential repair requires user action. Safe retries automatic.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

Connector syncs successfully and dependent loops resume.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Run when connector status changes and daily for critical integrations.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Connector, failure class, affected loops, recovery.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
