---
name: compliance-watch
title: Compliance Watch
description: Track deadlines, policy changes, and required compliance tasks.
category: ops
required_connectors:
  - calendar
  - web
default_authority: ask_first
---

# Compliance Watch

## Goal

Avoid missed deadlines and stale legal/operational obligations.

## When This Runs

Deadline approaches, regulation changes, or required document is missing.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

Calendar, official sources, internal policies, company context.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Assess applicability, urgency, owner, evidence source, and required action.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Create checklist, draft document, request approval or expert review.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Compliance tasks are draft/ask-first by default.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

Deadline is met or risk is explicitly escalated.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Schedule based on deadline, lead time, and missing dependencies.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Rule, source, applicability, action, completion evidence.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
