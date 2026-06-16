---
name: win-bug-autofix
description: Scoped loop execution skill for Bug Autofix. Use when win.sh or win-loops gives a production error run brief.
---

# Bug Autofix Executor

This is a scoped loop execution skill. Execute the run brief. Do not reprioritize the business problem and do not broaden into unrelated cleanup.

## Inputs

- Run brief from `.win/runs/<run-id>.md` or win.sh Cloud.
- Loop contract from `.win/loops/bug-autofix/LOOP.md`.
- Error fixture, Sentry link, log excerpt, stack trace, screenshots, and linked issue or PR.

## Workflow

1. Read the run brief and loop contract.
2. Restate the error group, impact, affected flow, and authority boundary.
3. Reproduce the error if practical. If not practical, explain why and continue from stack trace evidence.
4. Identify the smallest code path that can explain the failure.
5. Check for an existing issue or PR touching the same area.
6. Add or update a regression test before or alongside the fix.
7. Implement the smallest safe fix.
8. Run the narrowest relevant test first, then broader checks if cheap.
9. Open a PR or provide a patch.
10. Return artifact URLs, tests run, risk notes, and a verification recommendation.

## Output

Return:

- Error group and priority
- Root cause hypothesis
- Files changed
- Test added or updated
- Commands run
- PR or patch link
- Remaining risk
- 24 hour verification recommendation

## Constraints

- Do not merge.
- Do not deploy.
- Do not disable tests.
- Do not suppress the error without fixing root cause unless the run brief authorizes a temporary mitigation.
- Do not touch billing, auth, payment provider configuration, user deletion, or data migration without explicit approval.
- If evidence is weak, stop with an investigation note rather than patching blindly.
