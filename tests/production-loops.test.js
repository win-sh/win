import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { buildBugAutofixSignal, buildBugAutofixSignalFromConnectors } from '../src/loops/bug-autofix.js'
import { buildFeedbackToFixSignalFromConnectors } from '../src/loops/feedback-to-fix.js'
import { buildSeoGrowthSignalFromConnectors } from '../src/loops/seo-growth.js'

test('bug-autofix converts a sentry-like fixture into a scoped run signal', async () => {
  const fixture = JSON.parse(await readFile(new URL('../loops/bug-autofix/examples/sentry-error-group.json', import.meta.url), 'utf8'))
  const signal = buildBugAutofixSignal(fixture)

  assert.equal(signal.loopId, 'bug-autofix')
  assert.equal(signal.priority, 'p1')
  assert.equal(signal.errorGroup, 'checkout-null-pointer')
  assert.equal(signal.impactedPayingUsers, 3)
  assert.match(signal.summary, /checkout-null-pointer/)
  assert.match(signal.summary, /3 paying users/)
  assert.match(signal.runBrief, /Suspected owner/)
  assert.match(signal.runBrief, /src\/checkout\/createCheckoutSession.ts/)
  assert.match(signal.runBrief, /Do not merge/)
})

test('bug-autofix converts Sentry and GitHub connector snapshots into a scoped run signal', async () => {
  const snapshot = JSON.parse(await readFile(new URL('../loops/bug-autofix/examples/connector-snapshot.json', import.meta.url), 'utf8'))
  const signal = buildBugAutofixSignalFromConnectors(snapshot)

  assert.equal(signal.loopId, 'bug-autofix')
  assert.equal(signal.priority, 'p1')
  assert.equal(signal.errorGroup, 'checkout-null-pointer')
  assert.equal(signal.impactedPayingUsers, 2)
  assert.equal(signal.revenueAtRisk, 148)
  assert.equal(signal.suspectedOwner, '@billing-checkout')
  assert.deepEqual(signal.suspectFiles.slice(0, 3), [
    'src/checkout/createCheckoutSession.ts',
    'src/app/api/checkout/session/route.ts',
    'src/lib/pricing.ts'
  ])
  assert.match(signal.runBrief, /Connector Evidence/)
  assert.match(signal.runBrief, /https:\/\/sentry\.io\/organizations\/acme\/issues\/9821\//)
  assert.match(signal.runBrief, /acme\/melies-web/)
  assert.match(signal.runBrief, /abc1234/)
  assert.match(signal.runBrief, /POST \/api\/checkout\/session/)
})

test('seo-growth converts GSC and competitor connector snapshots into a scoped run signal', async () => {
  const snapshot = JSON.parse(await readFile(new URL('../loops/seo-growth/examples/connector-snapshot.json', import.meta.url), 'utf8'))
  const signal = buildSeoGrowthSignalFromConnectors(snapshot)

  assert.equal(signal.loopId, 'seo-growth')
  assert.equal(signal.targetPage, 'https://www.melies.ai/ai-video-generator')
  assert.equal(signal.actionType, 'ranking-improvement')
  assert.equal(signal.baseline.impressions, 6300)
  assert.equal(signal.baseline.clicks, 60)
  assert.match(signal.runBrief, /Connector Evidence/)
  assert.match(signal.runBrief, /ai video generator for ads/)
  assert.match(signal.runBrief, /Creativebench/)
  assert.match(signal.runBrief, /app\/\(marketing\)\/ai-video-generator\/page\.tsx/)
  assert.match(signal.runBrief, /verify after 21 days/)
})

test('feedback-to-fix converts support and GitHub connector snapshots into a scoped run signal', async () => {
  const snapshot = JSON.parse(await readFile(new URL('../loops/feedback-to-fix/examples/connector-snapshot.json', import.meta.url), 'utf8'))
  const signal = buildFeedbackToFixSignalFromConnectors(snapshot)

  assert.equal(signal.loopId, 'feedback-to-fix')
  assert.equal(signal.classification, 'bug')
  assert.equal(signal.evidenceCount, 3)
  assert.equal(signal.payingUsersAffected, 2)
  assert.equal(signal.revenueAtRisk, 698)
  assert.match(signal.runBrief, /Representative Quotes/)
  assert.match(signal.runBrief, /CSV export fails every time/)
  assert.match(signal.runBrief, /https:\/\/github\.com\/win-sh\/app\/issues\/241/)
  assert.match(signal.runBrief, /Draft Customer Reply/)
  assert.match(signal.runBrief, /Do not send/)
})

test('first production loops contain non-generic operating policy', async () => {
  const bug = await readFile(new URL('../loops/bug-autofix/LOOP.md', import.meta.url), 'utf8')
  const seo = await readFile(new URL('../loops/seo-growth/LOOP.md', import.meta.url), 'utf8')
  const feedback = await readFile(new URL('../loops/feedback-to-fix/LOOP.md', import.meta.url), 'utf8')

  assert.match(bug, /Impact score/)
  assert.match(bug, /Do not merge/)
  assert.match(bug, /80%/)
  assert.match(bug, /24 hours/)

  assert.match(seo, /minimum evidence/)
  assert.match(seo, /14 days/)
  assert.match(seo, /28 days/)
  assert.match(seo, /cannibalization/)

  assert.match(feedback, /bug/)
  assert.match(feedback, /feature request/)
  assert.match(feedback, /support confusion/)
  assert.match(feedback, /customer reply/)
})
