export function buildFeedbackToFixSignalFromConnectors(snapshot) {
  const threads = Array.isArray(snapshot.support?.threads) ? snapshot.support.threads : []
  const customers = new Map((snapshot.customers || []).map(customer => [customer.id, customer]))
  const quotes = representativeQuotes(threads)
  const payingCustomers = threads
    .map(thread => customers.get(thread.customerId))
    .filter(customer => Number(customer?.mrr || 0) > 0)
  const revenueAtRisk = uniqueById(payingCustomers).reduce((sum, customer) => sum + Number(customer.mrr || 0), 0)
  const classification = classifyFeedback({ threads, analytics: snapshot.analytics })
  const existingIssue = (snapshot.github?.existingIssues || [])[0]

  return {
    loopId: 'feedback-to-fix',
    classification,
    evidenceCount: threads.length,
    payingUsersAffected: uniqueById(payingCustomers).length,
    revenueAtRisk,
    summary: `${classification} across ${threads.length} feedback threads and $${revenueAtRisk} MRR at risk`,
    runBrief: renderRunBrief({
      snapshot,
      threads,
      quotes,
      classification,
      payingUsersAffected: uniqueById(payingCustomers).length,
      revenueAtRisk,
      existingIssue
    })
  }
}

function renderRunBrief({
  snapshot,
  threads,
  quotes,
  classification,
  payingUsersAffected,
  revenueAtRisk,
  existingIssue
}) {
  return `# Feedback to Fix Connector Signal

## Classification

- Primary classification: ${classification}
- Evidence count: ${threads.length}
- Paying users affected: ${payingUsersAffected}
- Revenue at risk: $${revenueAtRisk}
- Workflow: ${snapshot.analytics?.workflow || '-'}
- Failure rate: ${formatPct(snapshot.analytics?.failureRate || 0)} vs baseline ${formatPct(snapshot.analytics?.baselineFailureRate || 0)}

## Representative Quotes

${quotes.map(quote => `- ${quote}`).join('\n') || '- No customer quotes supplied'}

## Connector Evidence

- GitHub repo: ${snapshot.github?.repository?.fullName || '-'}
- Existing issue: ${existingIssue ? `${existingIssue.url} (${existingIssue.title})` : '-'}
- Candidate files:
${(snapshot.github?.candidateFiles || []).map(file => `  - ${file}`).join('\n') || '  - None'}
- Support threads: ${threads.map(thread => thread.id).join(', ') || '-'}

## Expected Action

Because this is classified as ${classification}, create or update the linked GitHub issue, prepare a scoped bug-fix executor brief, and draft a customer reply. Do not build a feature request by default.

## Draft Customer Reply

Thanks for reporting this. We found a repeated CSV export failure when campaign filters are applied, and we are linking your thread to the engineering issue so the team can fix and verify it. We will follow up with the outcome once the fix is confirmed.

Do not send this reply without communication approval.

## Verification Plan

- Confirm issue or PR is linked to the support threads.
- Verify export failure rate returns near baseline.
- Follow up with affected customers after the fix is confirmed.
`
}

function representativeQuotes(threads) {
  return threads
    .map(thread => (thread.messages || []).find(message => message.author === 'customer')?.body)
    .filter(Boolean)
}

function classifyFeedback({ threads, analytics }) {
  const text = JSON.stringify(threads).toLowerCase()
  if (text.includes('fail') || text.includes('broken') || Number(analytics?.failureRate || 0) > 0.2) return 'bug'
  if (text.includes('confusing') || text.includes('where')) return 'support confusion'
  if (text.includes('wish') || text.includes('feature')) return 'feature request'
  return 'no-action'
}

function uniqueById(items) {
  const seen = new Set()
  const result = []
  for (const item of items) {
    if (!item?.id || seen.has(item.id)) continue
    seen.add(item.id)
    result.push(item)
  }
  return result
}

function formatPct(value) {
  return `${(Number(value) * 100).toFixed(1)}%`
}
