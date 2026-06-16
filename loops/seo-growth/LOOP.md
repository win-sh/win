---
name: seo-growth
title: SEO Growth
description: Run a complete organic growth loop across GSC, competitor research, page updates, and delayed verification.
category: seo
required_connectors:
  - gsc
  - github
default_authority: ask_first
---

# SEO Growth

## Goal

Grow qualified organic traffic through repeated evidence-driven SEO improvements.

## When This Runs

GSC shows opportunity, rankings decay, competitors gain share, or the owner requests an SEO improvement cycle.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

GSC pages and queries, current content, sitemap, internal links, competitor SERPs, and prior SEO loop journals.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Choose whether the highest-leverage action is page refresh, new page, internal links, technical fix, or no-op.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Create page brief, edit existing page, draft new article, add internal links, or open a technical SEO issue.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Drafts and low-risk PRs can be automatic. Publishing follows website authority.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

Verify after 14-28 days using clicks, CTR, rank, impressions, and indexed status.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Run when fresh GSC data contains material opportunity. After a change, wait for the search verification window.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

SEO hypothesis, action taken, baseline, verification date, result, and failed tactics.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
