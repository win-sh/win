---
name: internal-linking
title: Internal Linking
description: Find underlinked pages and add contextual internal links.
category: seo
required_connectors:
  - gsc
  - github
default_authority: ask_first
---

# Internal Linking

## Goal

Improve crawlability and authority flow across existing content.

## When This Runs

A valuable page is orphaned, underlinked, or ranking just below target.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

Sitemap, page graph, GSC performance, content inventory.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Find relevant source pages with contextual anchor opportunities.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Open PR adding links and updating navigation or related content blocks.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Routine internal-link PRs can be automatic. Sitewide navigation changes require approval.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

Verify crawl/index status and target page performance after 21 days.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Run monthly and after publishing new pages.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Source pages, anchors used, target pages, performance delta.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
