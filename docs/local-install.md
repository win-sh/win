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

Then ask the agent:

```text
Use the win-bug-autofix skill. Execute the latest run brief in .win/runs/.
```

The agent should report artifacts back into the run journal or hosted win.sh.
