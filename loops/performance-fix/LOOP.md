---
name: performance-fix
title: Performance Fix
description: Detect slow pages or endpoints, optimize, and verify latency improvement.
category: engineering
required_connectors:
  - analytics
  - logs
  - github
default_authority: ask_first
---

# Performance Fix

## Goal

Improve user-visible latency and reliability.

## When This Runs

Page speed or endpoint latency crosses target thresholds.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

RUM metrics, server logs, Core Web Vitals, traces, code hot paths.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Rank by user volume, revenue impact, p95 latency, and implementation risk.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Create performance issue, profile, patch, open PR.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Read-only diagnosis is automatic. Code changes follow repository authority.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

p95 latency or CWV improves against baseline without error increase.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Check daily while slow, verify after deploy and after traffic sample is sufficient.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Bottleneck, optimization, metric delta, and regression risk.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
