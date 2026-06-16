---
name: feedback-to-fix
title: Feedback to Fix
description: Classify user feedback, turn it into fixes or issues, and draft replies.
category: customer
required_connectors:
  - support
  - github
default_authority: ask_first
---

# Feedback to Fix

## Goal

Convert repeated user pain into product improvement and clear replies.

## When This Runs

New feedback arrives, complaints cluster, or a high-value user reports pain.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

Support threads, feedback forms, reviews, GitHub issues, product state.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Classify bug, feature request, support confusion, pricing objection, or edge case.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Open issue, ask executor for fix, draft customer reply, propose roadmap item.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Replies and PRs require communication/code authority. Classification can be automatic.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

Issue is resolved or acknowledged, customer receives useful response, repeat complaints decline.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Run when feedback count threshold is reached or high-value feedback arrives.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Feedback cluster, classification, action, reply, resolution outcome.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
