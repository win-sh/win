---
name: creative-testing
title: Creative Testing
description: Generate, test, kill, and scale ad creative variants under caps.
category: ads
required_connectors:
  - ads
  - analytics
default_authority: ask_first
---

# Creative Testing

## Goal

Improve paid creative performance through controlled iteration.

## When This Runs

Creative fatigue, low CTR, high CAC, or campaign learning stagnation appears.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

Ad performance, comments, landing page, audience, prior creative history.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Identify message, visual, audience, and landing mismatch hypotheses.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Draft new variants, recommend kill/keep/scale, update test plan.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Publishing and scaling require authority. Drafts can be automatic.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

CTR/CVR/CAC improves against control with enough spend or impressions.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Run when spend/sample threshold is reached, not daily by default.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Creative hypothesis, variants, result, winning pattern.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
