export function buildBugAutofixSignal(fixture) {
  const errorGroup = requiredString(fixture.slug || fixture.id, 'fixture.slug')
  const impactedPayingUsers = Array.isArray(fixture.payingUsers) ? fixture.payingUsers.length : Number(fixture.impactedPayingUsers || 0)
  const eventCount = Number(fixture.eventCount || fixture.count || 0)
  const revenueAtRisk = Number(fixture.revenueAtRisk || 0)
  const suspectFiles = Array.isArray(fixture.suspectFiles) ? fixture.suspectFiles : []
  const priority = classifyPriority({ impactedPayingUsers, eventCount, revenueAtRisk, level: fixture.level })
  const suspectOwner = fixture.suspectedOwner || fixture.owner || 'unknown'
  const firstSuspectFile = suspectFiles[0] || 'unknown'

  const summary = [
    `${errorGroup}: ${eventCount} events`,
    `${impactedPayingUsers} paying users affected`,
    revenueAtRisk > 0 ? `$${revenueAtRisk} revenue at risk` : 'revenue impact unknown',
    `priority ${priority}`
  ].join(', ')

  return {
    loopId: 'bug-autofix',
    priority,
    errorGroup,
    impactedPayingUsers,
    eventCount,
    revenueAtRisk,
    suspectFiles,
    summary,
    runBrief: renderRunBrief({
      fixture,
      errorGroup,
      impactedPayingUsers,
      eventCount,
      revenueAtRisk,
      priority,
      suspectOwner,
      firstSuspectFile
    })
  }
}

function renderRunBrief({ fixture, errorGroup, impactedPayingUsers, eventCount, revenueAtRisk, priority, suspectOwner, firstSuspectFile }) {
  const stack = Array.isArray(fixture.stacktrace) ? fixture.stacktrace : []
  const suspectFiles = Array.isArray(fixture.suspectFiles) ? fixture.suspectFiles : []
  const affectedRoutes = Array.isArray(fixture.affectedRoutes) ? fixture.affectedRoutes : []

  return `# Bug Autofix Signal

Error group: ${errorGroup}
Priority: ${priority}
Level: ${fixture.level || 'unknown'}
Events: ${eventCount}
Paying users affected: ${impactedPayingUsers} paying users
Revenue at risk: ${revenueAtRisk > 0 ? `$${revenueAtRisk}` : 'unknown'}
Release: ${fixture.release || 'unknown'}
First seen: ${fixture.firstSeen || 'unknown'}
Last seen: ${fixture.lastSeen || 'unknown'}
Suspected owner: ${suspectOwner}

## Impact

${fixture.impact || 'No human impact note supplied.'}

## Suspect Area

Primary suspect file: ${firstSuspectFile}

${suspectFiles.map(file => `- ${file}`).join('\n') || '- No suspect files supplied'}

## Affected Routes

${affectedRoutes.map(route => `- ${route}`).join('\n') || '- No affected routes supplied'}

## Stacktrace

${stack.map(frame => `- ${frame.function || 'anonymous'} in ${frame.file || 'unknown'}:${frame.line || '?'}`).join('\n') || '- No stacktrace supplied'}

## Executor Boundary

Reproduce the issue if possible. Implement the smallest safe fix. Add or update a regression test.

Do not merge. Do not deploy. Do not touch billing, auth, or payment provider configuration unless the owner explicitly approves that escalation.

## Expected Artifact

- GitHub issue or PR URL
- Tests/checks run
- Risk notes
- Verification recommendation for the 24 hour error-rate check
`
}

function classifyPriority({ impactedPayingUsers, eventCount, revenueAtRisk, level }) {
  if (level === 'fatal' || impactedPayingUsers >= 3 || revenueAtRisk >= 500 || eventCount >= 50) return 'p1'
  if (impactedPayingUsers >= 1 || eventCount >= 10) return 'p2'
  return 'p3'
}

function requiredString(value, label) {
  if (!value || typeof value !== 'string') {
    throw new Error(`Missing required ${label}`)
  }
  return value
}
