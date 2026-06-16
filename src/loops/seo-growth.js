export function buildSeoGrowthSignalFromConnectors(snapshot) {
  const rows = Array.isArray(snapshot.gsc?.rows) ? snapshot.gsc.rows : []
  const targetPage = pickTargetPage(rows)
  const targetRows = rows.filter(row => row.page === targetPage)
  const baseline = aggregateRows(targetRows)
  const queryCluster = targetRows.map(row => row.query).filter(Boolean)
  const competitors = Array.isArray(snapshot.competitors) ? snapshot.competitors : []
  const candidateFiles = Array.isArray(snapshot.github?.candidateFiles) ? snapshot.github.candidateFiles : []
  const page = (snapshot.site?.pages || []).find(item => item.url === targetPage) || {}
  const actionType = chooseActionType({ baseline, page })

  return {
    loopId: 'seo-growth',
    targetPage,
    actionType,
    queryCluster,
    baseline,
    summary: `${actionType} for ${targetPage} across ${baseline.impressions} impressions and ${baseline.clicks} clicks`,
    runBrief: renderRunBrief({
      snapshot,
      targetPage,
      actionType,
      queryCluster,
      baseline,
      page,
      competitors,
      candidateFiles
    })
  }
}

function renderRunBrief({
  snapshot,
  targetPage,
  actionType,
  queryCluster,
  baseline,
  page,
  competitors,
  candidateFiles
}) {
  const verification = actionType === 'ctr-improvement' ? 'verify after 14 days' : 'verify after 21 days'
  return `# SEO Growth Connector Signal

## Target

- Page: ${targetPage || '-'}
- Query cluster: ${queryCluster.join(', ') || '-'}
- Selected action: ${actionType}
- Verification: ${verification}

## Baseline Metrics

- Clicks: ${baseline.clicks}
- Impressions: ${baseline.impressions}
- CTR: ${formatPct(baseline.ctr)}
- Average position: ${baseline.position.toFixed(1)}
- GSC window: ${snapshot.gsc?.window?.current || '-'} vs ${snapshot.gsc?.window?.previous || '-'}

## Existing Page

- Title: ${page.title || '-'}
- Meta: ${page.meta || '-'}
- H1: ${page.h1 || '-'}
- Updated: ${page.updatedAt || '-'}
- Schema: ${(page.schema || []).join(', ') || '-'}

## Connector Evidence

- GSC property: ${snapshot.gsc?.property || '-'}
- GitHub repo: ${snapshot.github?.repository?.fullName || '-'}
- Candidate files:
${candidateFiles.map(file => `  - ${file}`).join('\n') || '  - None'}

## Competitor Pattern

${competitors.map(competitor => `- ${displayHost(competitor.url)} position ${competitor.position}: ${competitor.title}; ${competitor.pattern}`).join('\n') || '- No competitor evidence supplied'}

## Diagnosis Instructions

Improve the target page for the query cluster above. Preserve brand voice and avoid generic filler.

Reject new-page creation unless cannibalization checks show the current page cannot satisfy the intent. Do not publish canonical, robots, noindex, redirect, or navigation changes without approval.

## Expected Artifact

- SEO opportunity brief or PR URL
- Exact title/meta/content/internal-link changes
- Cannibalization notes
- Verification recommendation: ${verification}
`
}

function pickTargetPage(rows) {
  const byPage = new Map()
  for (const row of rows) {
    const current = byPage.get(row.page) || 0
    byPage.set(row.page, current + Number(row.impressions || 0))
  }
  return [...byPage.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || ''
}

function aggregateRows(rows) {
  const impressions = rows.reduce((sum, row) => sum + Number(row.impressions || 0), 0)
  const clicks = rows.reduce((sum, row) => sum + Number(row.clicks || 0), 0)
  const weightedPosition = rows.reduce((sum, row) => sum + Number(row.position || 0) * Number(row.impressions || 0), 0)
  return {
    clicks,
    impressions,
    ctr: impressions > 0 ? clicks / impressions : 0,
    position: impressions > 0 ? weightedPosition / impressions : 0
  }
}

function chooseActionType({ baseline, page }) {
  if (baseline.position >= 4 && baseline.position <= 20) return 'ranking-improvement'
  if (baseline.ctr < 0.015) return 'ctr-improvement'
  if (!page.title) return 'new-page'
  return 'internal-linking'
}

function formatPct(value) {
  return `${(value * 100).toFixed(2)}%`
}

function displayHost(url = '') {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    return host.charAt(0).toUpperCase() + host.slice(1).split('.')[0]
  } catch {
    return url || 'Competitor'
  }
}
