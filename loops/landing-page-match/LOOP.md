---
name: landing-page-match
title: Landing Page Match
description: Align ads with landing pages to reduce paid traffic waste.
category: ads
required_connectors:
  - ads
  - analytics
  - github
default_authority: ask_first
---

# Landing Page Match

## Goal

Improve paid conversion by matching promise, audience, and landing page.

## When This Runs

Paid clicks convert below benchmark or bounce rate rises.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

Ad copy, creative, landing page, traffic source, funnel analytics.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Compare ad promise to first viewport, proof, CTA, pricing, and intent.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Draft landing copy/section changes or ad copy recommendations.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Landing PRs and ad changes follow respective authority.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

Paid conversion or bounce improves after sufficient traffic.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Run when ad test starts, after enough clicks, and after landing change.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Mismatch found, fix, source-specific outcome.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
