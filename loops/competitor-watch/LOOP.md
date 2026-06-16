---
name: competitor-watch
title: Competitor Watch
description: Track competitor launches, pricing, SEO, ads, and positioning changes.
category: ops
required_connectors:
  - web
  - seo
default_authority: ask_first
---

# Competitor Watch

## Goal

Keep strategy informed without overreacting.

## When This Runs

Competitor page changes, pricing shifts, ad changes, ranking moves, or news appear.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

Competitor sites, SERPs, ads libraries, changelogs, public posts.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Classify threat, noise, copyable tactic, differentiation gap, or no-op.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Write brief, propose response, create SEO/product follow-up.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Analysis automatic. Public response/product changes require authority.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

Response action is later evaluated for impact or marked no-op.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Run weekly or on material competitor change.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Change observed, assessment, response, result.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
