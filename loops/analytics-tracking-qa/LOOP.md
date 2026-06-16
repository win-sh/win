---
name: analytics-tracking-qa
title: Analytics Tracking QA
description: Detect broken or misleading analytics events and attribution gaps.
category: growth
required_connectors:
  - analytics
  - github
default_authority: ask_first
---

# Analytics Tracking QA

## Goal

Keep business decisions based on reliable data.

## When This Runs

Key event volume drops, spikes, duplicates, or attribution changes unexpectedly.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

Analytics event schema, recent deploys, page flows, server events.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Classify tracking break, real behavior change, bot traffic, or attribution shift.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Open tracking fix PR, update dashboard note, backfill if safe.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Tracking PRs automatic. Data backfills require approval.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

Event counts return to expected range or anomaly is documented.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Run after deploys and on event anomalies.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Event, issue class, fix, data caveat.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
