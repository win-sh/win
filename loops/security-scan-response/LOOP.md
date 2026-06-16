---
name: security-scan-response
title: Security Scan Response
description: Respond to security scan findings with triage, fixes, and verification.
category: engineering
required_connectors:
  - github
default_authority: ask_first
---

# Security Scan Response

## Goal

Reduce security risk without noisy churn.

## When This Runs

Security scan produces new finding or dependency advisory.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

Static scan output, dependency advisories, code ownership, exploitability context.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Rank by severity, reachability, exploitability, and fix risk.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Open issue, patch, add test, request review.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Security PRs automatic if low-risk. Secrets/infra changes require approval.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

Finding is resolved and no regression appears.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Run on new findings and weekly for open high severity issues.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Finding, risk, fix, verification.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
