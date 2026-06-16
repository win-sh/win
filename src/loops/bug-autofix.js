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
    suspectedOwner: suspectOwner,
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

export function buildBugAutofixSignalFromConnectors(snapshot) {
  const sentry = snapshot.sentry || {}
  const github = snapshot.github || {}
  const issue = sentry.issue || {}
  const events = Array.isArray(sentry.events) ? sentry.events : []
  const stacktrace = uniqueFrames(events.flatMap(eventFrames))
  const suspectFiles = unique([
    ...stacktrace.map(frame => frame.file).filter(Boolean),
    ...relevantCommitFiles({ commits: github.recentCommits, files: stacktrace.map(frame => frame.file) })
  ])
  const payingUsers = uniqueUsers(events.map(event => event.user).filter(isPayingUser))
  const affectedRoutes = unique(events.flatMap(eventRoutes))
  const relevantCommits = relevantCommitsForFiles({ commits: github.recentCommits, files: suspectFiles })
  const fixture = {
    id: issue.shortId || issue.id,
    slug: issue.slug || slugFromIssue(issue),
    title: issue.title,
    level: issue.level,
    eventCount: issue.count,
    firstSeen: issue.firstSeen,
    lastSeen: issue.lastSeen,
    release: issue.release,
    environment: issue.environment || sentry.environment,
    payingUsers,
    revenueAtRisk: payingUsers.reduce((sum, user) => sum + Number(user.mrr || 0), 0),
    affectedRoutes,
    suspectedOwner: ownerForFiles({ codeowners: github.codeowners, files: suspectFiles }),
    suspectFiles,
    stacktrace,
    impact: connectorImpact({ issue, payingUsers, affectedRoutes }),
    connectorEvidence: {
      sentryUrl: issue.permalink || '',
      githubRepo: github.repository?.fullName || '',
      defaultBranch: github.repository?.defaultBranch || '',
      recentCommits: relevantCommits
    }
  }

  return buildBugAutofixSignal(fixture)
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

${renderConnectorEvidence(fixture.connectorEvidence)}

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

function renderConnectorEvidence(evidence) {
  if (!evidence) return ''

  const commits = Array.isArray(evidence.recentCommits) ? evidence.recentCommits : []
  return `## Connector Evidence

- Sentry: ${evidence.sentryUrl || '-'}
- GitHub repo: ${evidence.githubRepo || '-'}
- Default branch: ${evidence.defaultBranch || '-'}
- Recent suspect commits:
${commits.map(commit => `  - ${commit.sha}: ${commit.message}${commit.url ? ` (${commit.url})` : ''}`).join('\n') || '  - None'}
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

function eventFrames(event) {
  if (Array.isArray(event.stacktrace)) return event.stacktrace
  if (!Array.isArray(event.entries)) return []

  return event.entries.flatMap(entry => {
    if (Array.isArray(entry.stacktrace?.frames)) return entry.stacktrace.frames
    if (Array.isArray(entry.data?.values)) {
      return entry.data.values.flatMap(value => value.stacktrace?.frames || [])
    }
    return []
  })
}

function uniqueFrames(frames) {
  const seen = new Set()
  const uniqueItems = []
  for (const frame of frames) {
    const file = frame.file || frame.filename || frame.absPath || ''
    if (!file || frame.inApp === false) continue
    const normalized = {
      function: frame.function || frame.functionName || 'anonymous',
      file,
      line: frame.line || frame.lineNo || frame.lineno || '?'
    }
    const key = `${normalized.file}:${normalized.line}:${normalized.function}`
    if (seen.has(key)) continue
    seen.add(key)
    uniqueItems.push(normalized)
  }
  return uniqueItems
}

function eventRoutes(event) {
  return [
    event.tags?.route,
    event.tags?.transaction,
    event.transaction,
    event.request?.url
  ].filter(Boolean)
}

function isPayingUser(user) {
  return Boolean(user?.isPaying || Number(user?.mrr || 0) > 0 || user?.plan === 'pro' || user?.plan === 'team')
}

function uniqueUsers(users) {
  const seen = new Set()
  const result = []
  for (const user of users) {
    const id = user.id || user.email || user.username
    if (!id || seen.has(id)) continue
    seen.add(id)
    result.push({
      id,
      plan: user.plan || 'unknown',
      mrr: Number(user.mrr || 0)
    })
  }
  return result
}

function relevantCommitFiles({ commits = [], files }) {
  return relevantCommitsForFiles({ commits, files }).flatMap(commit => commit.files || [])
}

function relevantCommitsForFiles({ commits = [], files }) {
  if (!Array.isArray(commits)) return []
  const fileSet = new Set(files.filter(Boolean))
  return commits
    .filter(commit => Array.isArray(commit.files) && commit.files.some(file => fileSet.has(file)))
    .map(commit => ({
      sha: commit.sha || '',
      message: commit.message || '',
      author: commit.author || '',
      date: commit.date || '',
      files: commit.files || [],
      url: commit.url || ''
    }))
}

function ownerForFiles({ codeowners = [], files }) {
  if (!Array.isArray(codeowners)) return 'unknown'

  for (const file of files) {
    const match = codeowners.find(entry => matchesOwnerPattern({ pattern: entry.pattern, file }))
    if (match?.owner) return match.owner
  }
  return 'unknown'
}

function matchesOwnerPattern({ pattern = '', file }) {
  const normalized = pattern.replace(/\*+$/, '')
  if (!normalized) return false
  return file.startsWith(normalized)
}

function connectorImpact({ issue, payingUsers, affectedRoutes }) {
  const routeText = affectedRoutes.length > 0 ? ` Affected routes: ${affectedRoutes.join(', ')}.` : ''
  return `Sentry issue ${issue.shortId || issue.id || issue.slug} reports ${issue.title || 'a production error'} affecting ${payingUsers.length} paying users.${routeText}`
}

function slugFromIssue(issue) {
  if (issue.shortId) return String(issue.shortId).toLowerCase()
  if (issue.id) return String(issue.id)
  return String(issue.title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function unique(items) {
  return [...new Set(items.filter(Boolean))]
}
