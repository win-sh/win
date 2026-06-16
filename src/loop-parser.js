export const REQUIRED_FRONTMATTER = [
  'name',
  'title',
  'description',
  'category',
  'default_authority'
]

export const REQUIRED_SECTIONS = [
  'Goal',
  'When This Runs',
  'Signals',
  'Diagnosis',
  'Allowed Actions',
  'Authority',
  'Executor Instructions',
  'Verification',
  'Adaptive Scheduling',
  'Journal',
  'Memory Update'
]

export function parseLoopMarkdown(markdown) {
  const { frontmatter, body } = parseFrontmatter(markdown)
  const title = extractTitle(body)
  const sections = extractSections(body)

  return {
    frontmatter,
    title,
    sections,
    body
  }
}

export function validateLoop(loop) {
  const errors = []

  for (const field of REQUIRED_FRONTMATTER) {
    if (!loop.frontmatter[field]) {
      errors.push(`Missing frontmatter field: ${field}`)
    }
  }

  if (loop.frontmatter.name && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(loop.frontmatter.name)) {
    errors.push('Frontmatter field "name" must be kebab-case')
  }

  if (!loop.title) {
    errors.push('Missing H1 title')
  }

  for (const section of REQUIRED_SECTIONS) {
    const content = loop.sections.get(section)
    if (!content || content.trim().length === 0) {
      errors.push(`Missing required section: ${section}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

function parseFrontmatter(markdown) {
  if (!markdown.startsWith('---\n')) {
    return { frontmatter: {}, body: markdown }
  }

  const end = markdown.indexOf('\n---', 4)
  if (end === -1) {
    return { frontmatter: {}, body: markdown }
  }

  const raw = markdown.slice(4, end)
  const body = markdown.slice(end + 5).replace(/^\n/, '')
  return {
    frontmatter: parseSimpleYaml(raw),
    body
  }
}

function parseSimpleYaml(raw) {
  const output = {}
  const lines = raw.split('\n')
  let currentListKey = null

  for (const line of lines) {
    if (!line.trim()) continue

    const listMatch = line.match(/^\s*-\s+(.+)$/)
    if (listMatch && currentListKey) {
      output[currentListKey].push(stripQuotes(listMatch[1].trim()))
      continue
    }

    const kv = line.match(/^([A-Za-z0-9_-]+):(?:\s*(.*))?$/)
    if (!kv) continue

    const key = kv[1]
    const value = kv[2] ?? ''
    if (value.trim() === '') {
      output[key] = []
      currentListKey = key
    } else {
      output[key] = stripQuotes(value.trim())
      currentListKey = null
    }
  }

  return output
}

function stripQuotes(value) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1)
  }
  return value
}

function extractTitle(body) {
  const match = body.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : ''
}

function extractSections(body) {
  const sections = new Map()
  const matches = [...body.matchAll(/^##\s+(.+)$/gm)]

  for (let i = 0; i < matches.length; i += 1) {
    const match = matches[i]
    const next = matches[i + 1]
    const name = match[1].trim()
    const start = match.index + match[0].length
    const end = next ? next.index : body.length
    sections.set(name, body.slice(start, end).trim())
  }

  return sections
}
