# Local Install

Install a loop into a local repo:

```bash
node /Users/romainsimon/dev/win-loops/bin/win-loops.js install bug-autofix \
  --repo /path/to/repo \
  --agent codex
```

This creates:

```text
.win/
  loops/<loop-id>/LOOP.md
  loops/<loop-id>/journal.md
  state/runs.jsonl
  state/artifacts.jsonl
  state/outcomes.jsonl
  state/approvals.jsonl
  runs/

.agents/
  skills/win-<loop-id>/SKILL.md
```

Create a run:

```bash
node /Users/romainsimon/dev/win-loops/bin/win-loops.js run bug-autofix \
  --repo /path/to/repo \
  --signal "Production checkout error repeated 21 times."
```

Create a run from the included Sentry-style fixture:

```bash
node /Users/romainsimon/dev/win-loops/bin/win-loops.js run bug-autofix \
  --repo /path/to/repo \
  --fixture /Users/romainsimon/dev/win-loops/loops/bug-autofix/examples/sentry-error-group.json
```

Then ask the agent:

```text
Use the win-bug-autofix skill. Execute the latest run brief in .win/runs/.
```

The agent should report artifacts back into the run journal or hosted win.sh.

Attach an artifact after execution:

```bash
node /Users/romainsimon/dev/win-loops/bin/win-loops.js artifact attach <run-id> \
  --repo /path/to/repo \
  --kind pr \
  --url https://github.com/acme/app/pull/123 \
  --title "Checkout fix" \
  --summary "Fixes checkout crash and adds regression coverage."
```

Record an outcome after the verification window:

```bash
node /Users/romainsimon/dev/win-loops/bin/win-loops.js outcome record <run-id> \
  --repo /path/to/repo \
  --status improved \
  --metric error_rate_down_92_percent \
  --summary "Sentry group dropped after deploy." \
  --evidence https://sentry.io/acme/issues/checkout-null-pointer/
```

Request approval before a sensitive action:

```bash
node /Users/romainsimon/dev/win-loops/bin/win-loops.js approval request <run-id> \
  --repo /path/to/repo \
  --action "Merge PR https://github.com/acme/app/pull/123" \
  --reason "Fix is tested but touches checkout payment flow." \
  --risk medium \
  --approver founder
```

Resolve the approval:

```bash
node /Users/romainsimon/dev/win-loops/bin/win-loops.js approval approve <approval-id> \
  --repo /path/to/repo \
  --by founder \
  --note "Approved after checking tests."

node /Users/romainsimon/dev/win-loops/bin/win-loops.js approval reject <approval-id> \
  --repo /path/to/repo \
  --by founder \
  --note "Rejected until a safer migration is added."
```

Approved actions are resumed by the scheduler. The next `tick` creates a new run brief with `trigger: "approval"` and links it back to the approval decision.

## Terminal Dashboard

Show installed loops:

```bash
node /Users/romainsimon/dev/win-loops/bin/win-loops.js status --repo /path/to/repo
```

Enable or disable a loop:

```bash
node /Users/romainsimon/dev/win-loops/bin/win-loops.js disable seo-growth --repo /path/to/repo
node /Users/romainsimon/dev/win-loops/bin/win-loops.js enable seo-growth --repo /path/to/repo
```

List journals:

```bash
node /Users/romainsimon/dev/win-loops/bin/win-loops.js journals --repo /path/to/repo
```

Read one journal:

```bash
node /Users/romainsimon/dev/win-loops/bin/win-loops.js journal bug-autofix --repo /path/to/repo
```

## Local Scheduler

Run one scheduler pass:

```bash
node /Users/romainsimon/dev/win-loops/bin/win-loops.js tick --repo /path/to/repo
```

`tick` creates run briefs only for enabled loops that are due. It is safe to call from a simple local timer because each loop owns its next adaptive run time in `.win/loops/<loop-id>/state.json`.

If a run has an approved approval decision, `tick` resumes it before waiting for the normal `nextRunAt` time.

Example cron-style wrapper:

```bash
*/15 * * * * node /Users/romainsimon/dev/win-loops/bin/win-loops.js tick --repo /path/to/repo >> /path/to/repo/.win/tick.log 2>&1
```
