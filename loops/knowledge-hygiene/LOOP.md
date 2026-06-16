---
name: knowledge-hygiene
title: Knowledge Hygiene
description: Clean stale beliefs, contradictions, obsolete assumptions, and failed tactics.
category: ops
required_connectors:
  - memory
default_authority: ask_first
---

# Knowledge Hygiene

## Goal

Keep agent memory useful and current.

## When This Runs

Weekly reflection, contradiction, stale claim, or repeated failed action appears.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

Loop journals, decisions, beliefs, metrics, user corrections.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Detect stale facts, contradictions, weak evidence, and repeated failed tactics.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Draft memory updates and policy changes.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Memory updates can be automatic if low risk. Strategy changes require approval.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

Future runs use cleaner context and avoid repeated failed tactics.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Run weekly and after major business changes.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Removed stale belief, resolved contradiction, new policy.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
