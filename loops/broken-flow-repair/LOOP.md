---
name: broken-flow-repair
title: Broken Flow Repair
description: Continuously test key product flows and repair failures.
category: engineering
required_connectors:
  - playwright
  - github
default_authority: ask_first
---

# Broken Flow Repair

## Goal

Keep signup, checkout, login, and core workflows functional.

## When This Runs

Synthetic tests fail or product analytics show abnormal flow drop-off.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

Browser checks, screenshots, console errors, network failures, funnel analytics.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Determine whether failure is frontend, backend, provider, auth, or content related.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Open issue, generate reproduction, ask executor for fix, attach screenshots.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Fix PRs can be automatic. Payment, auth, and deploy actions require approval.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

Synthetic flow passes and funnel metric recovers or stabilizes.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Run after deploys, daily for critical flows, and immediately after a failure.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Broken step, root cause, screenshot, test added, fix result.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
