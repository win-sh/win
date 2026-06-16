---
name: content-refresh
title: Content Refresh
description: Refresh decaying pages with current content, better examples, and internal links.
category: seo
required_connectors:
  - gsc
  - github
default_authority: ask_first
---

# Content Refresh

## Goal

Recover organic traffic from pages losing relevance.

## When This Runs

Clicks or impressions decay over several weeks without a known seasonality reason.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

GSC history, page age, competitor pages, docs/API changes, internal links.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Identify whether decay comes from stale content, SERP change, title issue, or lost intent match.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Update content, screenshots, examples, FAQs, schema, and links.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Content PRs are automatic. Publishing follows website authority.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

Traffic or CTR stabilizes or improves after verification window.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Run weekly for decaying pages and verify 21 days after changes.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Decay cause, refreshed sections, competitor insight, result.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
