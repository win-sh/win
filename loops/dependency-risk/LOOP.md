---
name: dependency-risk
title: Dependency Risk
description: Monitor vulnerable or outdated dependencies and open safe upgrade PRs.
category: engineering
required_connectors:
  - github
default_authority: ask_first
---

# Dependency Risk

## Goal

Keep dependencies secure without destabilizing the product.

## When This Runs

A security advisory, lockfile drift, or stale critical dependency appears.

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

Package manifests, lockfiles, advisories, changelogs, CI status.

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

Prioritize security, runtime packages, and low-risk patch upgrades.

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

Open upgrade branch, run tests, open PR with risk notes.

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

Patch/minor PRs can be automatic. Major upgrades require approval.

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion `SKILL.md` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

CI passes and no runtime regression is reported after the verification window.

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

Run weekly, immediately on security advisories, and after blocked PRs are updated.

Every execution must end with `nextRunAt`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

Upgrade pattern, package risk, test failures, rollback notes.

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
