import test from 'node:test'
import assert from 'node:assert/strict'
import { parseLoopMarkdown, validateLoop } from '../src/loop-parser.js'

const validLoop = `---
name: bug-autofix
title: Bug Autofix
description: Watch production errors and open verified fix PRs.
category: engineering
required_connectors:
  - github
  - sentry
default_authority: ask_first
---

# Bug Autofix

## Goal

Reduce production errors without introducing regressions.

## When This Runs

Run when an error group crosses the threshold.

## Signals

Read Sentry errors and GitHub deploy history.

## Diagnosis

Rank by users affected, revenue risk, frequency, and recency.

## Allowed Actions

Open issues, ask an executor to patch, and open PRs.

## Authority

Merge requires approval.

## Executor Instructions

Use the executor skill.

## Verification

Check the error group after 24 hours.

## Adaptive Scheduling

Schedule verification after the error rate has enough data.

## Journal

Append a run summary after each execution.

## Memory Update

Record root cause and fix pattern.
`

test('parseLoopMarkdown extracts frontmatter, title, and sections', () => {
  const parsed = parseLoopMarkdown(validLoop)

  assert.equal(parsed.frontmatter.name, 'bug-autofix')
  assert.equal(parsed.frontmatter.title, 'Bug Autofix')
  assert.deepEqual(parsed.frontmatter.required_connectors, ['github', 'sentry'])
  assert.equal(parsed.title, 'Bug Autofix')
  assert.match(parsed.sections.get('Goal'), /Reduce production errors/)
  assert.match(parsed.sections.get('Adaptive Scheduling'), /Schedule verification/)
})

test('validateLoop accepts a complete loop contract', () => {
  const parsed = parseLoopMarkdown(validLoop)
  const result = validateLoop(parsed)

  assert.equal(result.valid, true)
  assert.deepEqual(result.errors, [])
})

test('validateLoop rejects missing required sections', () => {
  const parsed = parseLoopMarkdown(`---
name: broken
title: Broken
description: Missing sections.
category: engineering
---

# Broken

## Goal
Only one section.
`)

  const result = validateLoop(parsed)

  assert.equal(result.valid, false)
  assert.ok(result.errors.some(error => error.includes('When This Runs')))
  assert.ok(result.errors.some(error => error.includes('Verification')))
})
