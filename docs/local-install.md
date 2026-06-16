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

Example cron-style wrapper:

```bash
*/15 * * * * node /Users/romainsimon/dev/win-loops/bin/win-loops.js tick --repo /path/to/repo >> /path/to/repo/.win/tick.log 2>&1
```
