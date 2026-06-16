---
name: gsc-rank-growth
title: GSC Rank Growth
description: Find GSC ranking and CTR opportunities, improve pages, and verify delayed impact.
category: seo
required_connectors:
  - gsc
  - github
default_authority: ask_first
---

# GSC Rank Growth

## Goal

Increase qualified organic clicks from existing pages.

## When This Runs

A page has impressions with weak CTR, rank 4-20 opportunity, or click decay.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

GSC queries/pages/devices, current page content, SERP snippets, internal links.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Separate ranking, CTR, intent mismatch, cannibalization, and indexing issues.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Draft title/meta/content/internal-link improvements and open PR or CMS draft.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Drafts can be automatic. Publishing requires approval unless authority allows routine SEO edits.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

Verify after 14-28 days using clicks, CTR, average position, and indexed status.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Run when GSC data refreshes, then wait for search verification window.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Query intent, change made, baseline, verification delta, failed hypotheses.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
