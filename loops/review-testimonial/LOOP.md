---
name: review-testimonial
title: Review Testimonial Loop
description: Ask happy users for reviews or testimonials at the right moment.
category: customer
required_connectors:
  - support
  - stripe
  - email
default_authority: ask_first
---

# Review Testimonial Loop

## Goal

Generate social proof without annoying users.

## When This Runs

A user succeeds, upgrades, replies positively, or reaches usage milestone.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

Customer success signals, support sentiment, revenue status, prior outreach.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Check fit, timing, ask fatigue, and testimonial angle.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Draft review/testimonial request and track response.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Sending requires communication authority and suppression rules.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

Measure replies, reviews collected, unsubscribes, and relationship impact.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Run when positive signals arrive, with per-user cooldowns.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Trigger, ask angle, response, proof asset produced.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
