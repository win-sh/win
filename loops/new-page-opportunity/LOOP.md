---
name: new-page-opportunity
title: New Page Opportunity
description: Research gaps and create new pages or articles when evidence supports demand.
category: seo
required_connectors:
  - gsc
  - ahrefs
  - github
default_authority: ask_first
---

# New Page Opportunity

## Goal

Capture search demand not covered by current site.

## When This Runs

Competitor ranks for relevant terms, GSC shows adjacent queries, or customers use repeated language.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

Ahrefs/SEO data, GSC, competitor SERPs, product capabilities, existing sitemap.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Score by intent, difficulty, business fit, content uniqueness, and cannibalization risk.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Draft page brief, create article/tool page, add internal links.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

New page drafts are automatic. Publishing requires approval by default.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

Verify indexing, impressions, and early ranking after 14-45 days.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Schedule after research, after publish, and when indexed data appears.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Keyword thesis, page angle, publish date, index/rank result.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
