---
name: docs-support-gap
title: Docs Support Gap
description: Turn repeated support questions into documentation or UX improvements.
category: customer
required_connectors:
  - support
  - github
default_authority: ask_first
---

# Docs Support Gap

## Goal

Reduce support load by fixing unclear docs or product copy.

## When This Runs

Multiple users ask the same support question or fail setup.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

Support threads, docs pages, onboarding screens, search queries.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Identify missing doc, confusing UI, wrong expectation, or product gap.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Draft docs PR, FAQ, empty state, or onboarding copy.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Docs PRs automatic. Product UI changes follow code authority.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

Repeat question frequency declines after publish.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Run when question cluster threshold is reached and verify after 14 days.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Question cluster, doc change, support volume result.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
