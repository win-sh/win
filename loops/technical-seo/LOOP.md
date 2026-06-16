---
name: technical-seo
title: Technical SEO
description: Monitor indexing, sitemap, canonicals, schema, metadata, and Core Web Vitals.
category: seo
required_connectors:
  - gsc
  - github
default_authority: ask_first
---

# Technical SEO

## Goal

Keep the site technically indexable and healthy.

## When This Runs

GSC coverage warnings, sitemap errors, metadata regressions, schema failures, CWV drops.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

GSC, sitemap, robots.txt, page HTML, structured data, CWV metrics.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Classify issue by indexability, duplication, metadata, structured data, or performance.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Open fix PR, update sitemap/schema/meta, request validation.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Technical fixes can be automatic if low-risk. Canonical/indexing changes require approval.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

GSC validation passes or affected URL count declines.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Run weekly and immediately after GSC/indexing anomalies.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Issue class, URLs affected, fix, validation result.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
