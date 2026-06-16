---
name: programmatic-seo-qa
title: Programmatic SEO QA
description: Audit generated pages for thin content, duplicates, cannibalization, and quality drift.
category: seo
required_connectors:
  - gsc
  - github
default_authority: ask_first
---

# Programmatic SEO QA

## Goal

Keep programmatic pages useful and non-spammy.

## When This Runs

New page batch ships, traffic decays, duplicate/cannibalization risk appears.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

Generated page samples, templates, GSC, duplicate clusters, quality rubric.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Identify thin pages, duplicate templates, missing unique evidence, and search intent conflicts.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Flag pages, improve templates, prune or noindex weak pages.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Pruning/noindex requires approval. Template quality PRs can be automatic.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

Quality checks pass and indexed pages avoid traffic/CTR decline.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Run after page generation and monthly for mature page sets.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Template issue, pages affected, action, SEO outcome.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
