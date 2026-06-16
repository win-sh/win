---
name: quality-regression
title: Quality Regression
description: Monitor generation failures, retries, complaints, and refunds for quality decline.
category: product
required_connectors:
  - analytics
  - support
  - stripe
default_authority: ask_first
---

# Quality Regression

## Goal

Keep product output quality above customer tolerance.

## When This Runs

Failure rate, retries, complaints, or refunds increase.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

Generation logs, support complaints, refunds, model/provider changes.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Classify provider issue, prompt regression, UX gap, abuse, or expectation mismatch.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Open issue, propose prompt/model/tool fix, draft customer note.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Prompt/config changes require authority defined by product risk.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

Failure/complaint rate returns to baseline.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Run on quality anomaly and after model/provider changes.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Quality signal, root cause, fix, metric result.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
