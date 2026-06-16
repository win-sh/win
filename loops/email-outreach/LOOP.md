---
name: email-outreach
title: Email Outreach
description: Build targeted outreach lists, draft messages, and measure replies safely.
category: sales
required_connectors:
  - email
  - crm
default_authority: ask_first
---

# Email Outreach

## Goal

Create qualified pipeline without spam.

## When This Runs

A campaign goal exists and a verified target segment is available.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

Prospect list, website, CRM, prior emails, suppression list, offer proof.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Score relevance, personalization evidence, risk, and expected value.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Draft messages, prepare send queue, record objections and replies.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Draft-only by default. Sending needs strict authority, caps, and suppression.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

Measure replies, positive responses, unsubscribes, and conversions.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Run when list quality threshold is met and cooldown allows.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Segment, message pattern, reply outcome, suppression updates.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
