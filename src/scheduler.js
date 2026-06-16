const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS

export function decideNextRun({ loopId, trigger, status, now = new Date() }) {
  const base = now instanceof Date ? now : new Date(now)

  if (status === 'waiting_for_outcome') {
    const days = verificationDays(loopId)
    return {
      at: new Date(base.getTime() + days * DAY_MS).toISOString(),
      reason: `verification window for ${loopId} ends after ${days} day${days === 1 ? '' : 's'}`,
      confidence: 'medium'
    }
  }

  if (trigger === 'manual') {
    return {
      at: new Date(base.getTime() + 6 * HOUR_MS).toISOString(),
      reason: 'manual trigger created an execution brief; follow up after the executor reports an artifact',
      confidence: 'medium'
    }
  }

  if (trigger === 'signal') {
    return {
      at: new Date(base.getTime() + HOUR_MS).toISOString(),
      reason: 'signal threshold was reached; re-check quickly for escalation or stabilization',
      confidence: 'high'
    }
  }

  return {
    at: new Date(base.getTime() + DAY_MS).toISOString(),
    reason: 'routine adaptive check; no urgent signal or active verification window',
    confidence: 'low'
  }
}

function verificationDays(loopId) {
  if (loopId.includes('seo')) return 21
  if (loopId.includes('ads')) return 2
  if (loopId.includes('conversion')) return 14
  if (loopId.includes('bug') || loopId.includes('regression')) return 1
  return 7
}
