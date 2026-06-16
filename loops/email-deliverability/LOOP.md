---
name: email-deliverability
title: Email Deliverability
description: Monitor bounce, spam, unsubscribe, and reply quality for outbound email.
category: sales
required_connectors:
  - email
default_authority: ask_first
---

# Email Deliverability

## Goal

Protect sender reputation and outreach quality.

## When This Runs

Bounce rate, spam complaints, unsubscribes, or low reply quality crosses threshold.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

Email provider metrics, suppression list, campaign copy, reply sentiment.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Classify list quality, copy issue, domain reputation, or offer mismatch.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Pause campaign, update suppression, improve copy, reduce volume.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Sending and volume changes require communication authority.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

Deliverability metrics return within guardrails.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Run daily during campaigns and immediately on threshold breach.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Metric breach, cause, action, deliverability result.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
