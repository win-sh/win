---
name: feature-request-scoring
title: Feature Request Scoring
description: Cluster and score feature requests by evidence and business value.
category: customer
required_connectors:
  - support
  - analytics
  - stripe
default_authority: ask_first
---

# Feature Request Scoring

## Goal

Prioritize features using demand evidence instead of anecdotes.

## When This Runs

Feature requests accumulate or roadmap decision is needed.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

Support requests, user segments, revenue, product usage, strategy docs.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Score by user count, revenue, frequency, strategic fit, effort, and alternatives.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Create ranked feature brief, open issue, recommend no-build when weak.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Roadmap changes require approval. Scoring is automatic.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

Selected features show adoption or evidence remains insufficient and work is stopped.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Run after request threshold or before planning review.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Cluster, score, decision, adoption outcome.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
