---
name: roadmap-reality-check
title: Roadmap Reality Check
description: Compare roadmap ideas against evidence before building.
category: product
required_connectors:
  - support
  - analytics
  - stripe
default_authority: ask_first
---

# Roadmap Reality Check

## Goal

Prevent low-evidence feature work.

## When This Runs

A new idea appears, repeated request cluster forms, or planning review starts.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

Feature requests, revenue segments, usage, strategy, competitor context.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Score evidence, opportunity cost, reversibility, and fastest validation path.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Recommend build, validate, defer, or kill.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Analysis automatic. Roadmap commitment requires approval.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

Decision outcome is reviewed after planned interval.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Run before planning and when evidence changes.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Idea, evidence score, decision, eventual outcome.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
