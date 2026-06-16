---
name: bug-autofix
title: Bug Autofix
description: Watch production errors, open scoped fix PRs, and verify that the error rate drops.
category: engineering
required_connectors:
  - github
  - sentry
default_authority: ask_first
---

# Bug Autofix

## Goal

Reduce production errors without introducing regressions.

## When This Runs

A production error repeats, a paying user is affected, or a new error appears after deploy.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

Sentry error groups, application logs, recent deploys, GitHub issues, CI status.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Rank by paying users affected, frequency, recency, deploy correlation, and fix reversibility.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Create issue, generate run brief, ask Codex or Claude Code for a patch, open PR, request merge approval.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Issues and PRs can be automatic. Merge, deploy, billing code, and emergency hotfixes require explicit authority.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

After merge, check the error group for 24 hours. Success means error rate drops at least 80% and no related regression appears.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Run soon when a signal spikes. After PR creation, follow up in 6 hours. After merge, verify after 24 hours.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Root cause, changed files, test added, fix pattern, verification result, and what not to retry.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
