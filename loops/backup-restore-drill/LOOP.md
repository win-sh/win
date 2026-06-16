---
name: backup-restore-drill
title: Backup Restore Drill
description: Verify backups and restore procedures before they are needed.
category: ops
required_connectors:
  - infra
default_authority: ask_first
---

# Backup Restore Drill

## Goal

Ensure recovery capability is real, not assumed.

## When This Runs

Scheduled drill date arrives or infrastructure changes.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

Backup status, restore scripts, data stores, runbooks.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Check freshness, coverage, restore time, and missing credentials.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Run safe dry-run, update runbook, create issue for gaps.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Production restore actions require explicit approval.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

Restore drill passes or gaps are documented with owner.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Run monthly or after infrastructure changes.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Backup source, drill result, gaps, fix.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
