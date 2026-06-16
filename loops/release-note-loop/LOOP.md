---
name: release-note-loop
title: Release Note Loop
description: Convert shipped changes into customer-facing release notes when useful.
category: product
required_connectors:
  - github
  - email
default_authority: ask_first
---

# Release Note Loop

## Goal

Communicate product progress without spamming users.

## When This Runs

PRs merge, feature ships, or customer-requested fix is released.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

Merged PRs, issues closed, affected customers, product changelog.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Decide whether change deserves public note, targeted reply, or no-op.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Draft changelog, targeted customer replies, or social post.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Publishing/sending requires authority.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

Measure reads, replies, reduced confusion, or customer satisfaction.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Run after releases and batch low-value changes weekly.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Change, audience, message, response.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
