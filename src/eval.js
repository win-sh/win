import { validateLoop } from './loop-parser.js'

export async function validateCatalog(catalog) {
  const failures = []

  for (const entry of catalog) {
    if (entry.id !== entry.loop.frontmatter.name) {
      failures.push({
        loopId: entry.id,
        check: 'frontmatter_name_matches_directory',
        message: `Directory "${entry.id}" does not match LOOP.md name "${entry.loop.frontmatter.name}"`
      })
    }

    const loopValidation = validateLoop(entry.loop)
    for (const error of loopValidation.errors) {
      failures.push({
        loopId: entry.id,
        check: 'loop_contract',
        message: error
      })
    }

    if (!entry.skillExists) {
      failures.push({
        loopId: entry.id,
        check: 'skill_exists',
        message: 'Missing SKILL.md'
      })
    }

    if (!entry.journalExists) {
      failures.push({
        loopId: entry.id,
        check: 'journal_exists',
        message: 'Missing journal.md'
      })
    }

    if (!entry.exampleInputExists) {
      failures.push({
        loopId: entry.id,
        check: 'example_input_exists',
        message: 'Missing examples/input.json'
      })
    }

    if (!entry.exampleBriefExists) {
      failures.push({
        loopId: entry.id,
        check: 'example_brief_exists',
        message: 'Missing examples/run-brief.md'
      })
    }

    if (!entry.evalExists) {
      failures.push({
        loopId: entry.id,
        check: 'contract_eval_exists',
        message: 'Missing evals/contract.json'
      })
    }
  }

  return {
    passed: failures.length === 0,
    loopCount: catalog.length,
    failures
  }
}
