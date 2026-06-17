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
  state/artifact-suggestions.jsonl
  state/outcomes.jsonl
  state/approvals.jsonl
  state/executions.jsonl
  runs/
  executions/

.agents/
  skills/win-<loop-id>/SKILL.md

.claude/
  skills/win-<loop-id>/SKILL.md

AGENTS.md
CLAUDE.md
```

`AGENTS.md` is the Codex project guidance file. `CLAUDE.md` is the Claude Code project guidance file. `win install` preserves existing content and adds or updates only the marked win.sh section.

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

Create a run from a local Sentry/GitHub connector snapshot:

```bash
node /Users/romainsimon/dev/win-loops/bin/win-loops.js run bug-autofix \
  --repo /path/to/repo \
  --connector-fixture /Users/romainsimon/dev/win-loops/loops/bug-autofix/examples/connector-snapshot.json
```

The connector fixture path is the local stand-in for hosted OAuth connectors. It lets the loop normalize Sentry issue data, impacted paying users, GitHub codeowners, and recent commits before creating the run brief.

Fetch a connector snapshot from hosted win.sh:

```bash
node /Users/romainsimon/dev/win-loops/bin/win-loops.js auth login
node /Users/romainsimon/dev/win-loops/bin/win-loops.js snapshot fetch bug-autofix \
  --output /path/to/repo/.win/snapshots/bug-autofix.json
```

`auth login` opens win.sh Settings in the browser, asks the user to approve a CLI token, and stores the token locally. For CI or manual setup:

```bash
node /Users/romainsimon/dev/win-loops/bin/win-loops.js auth login \
  --token <token> \
  --workspace <workspace>
```

Then ask the agent:

```text
Use the win-bug-autofix skill. Execute the latest run brief in .win/runs/.
```

The agent should report artifacts back into the run journal or hosted win.sh. If you use `win-loops exec`, stdout and stderr are captured in `.win/executions/` and likely proof is suggested automatically.

Review suggested artifacts after execution:

```bash
node /Users/romainsimon/dev/win-loops/bin/win-loops.js artifact suggestions \
  --repo /path/to/repo

node /Users/romainsimon/dev/win-loops/bin/win-loops.js artifact accept <suggestion-id> \
  --repo /path/to/repo
```

`artifact suggestions` shows pending proof detected from execution logs, such as PR URLs, changed files, and test summaries. `artifact accept` converts one suggestion into a real artifact, updates `.win/state/artifacts.jsonl`, and appends the loop journal.

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

Show operator work:

```bash
node /Users/romainsimon/dev/win-loops/bin/win-loops.js inbox --repo /path/to/repo
node /Users/romainsimon/dev/win-loops/bin/win-loops.js next --repo /path/to/repo
node /Users/romainsimon/dev/win-loops/bin/win-loops.js exec --repo /path/to/repo --agent codex --dry-run
node /Users/romainsimon/dev/win-loops/bin/win-loops.js exec --repo /path/to/repo --agent codex --run <run-id>
```

`inbox` shows pending executions, pending approvals, approved actions waiting for `tick`, overdue outcome checks, and latest loop context. `next` prints the single next action to take. `exec --dry-run` prints the agent prompt and command hint for the next executable run brief. `exec` without `--dry-run` runs the local agent command and captures stdout/stderr in `.win/executions/`.

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
