# Codex Integration

Local loop installation uses Codex-compatible skills in `.agents/skills`.

Recommended flow:

```bash
node /Users/romainsimon/dev/win-loops/bin/win-loops.js install bug-autofix --repo /path/to/repo --agent codex
node /Users/romainsimon/dev/win-loops/bin/win-loops.js run bug-autofix --repo /path/to/repo --signal "..."
```

Prompt Codex:

```text
Use the win-bug-autofix skill. Execute the latest run brief in .win/runs/.
Stay inside the authority rules in .win/loops/bug-autofix/LOOP.md.
```

Codex executes the local work. win.sh or `win-loops` owns the loop journal, outcome verification, and next scheduling decision.

If you run through the CLI executor, Codex output is captured and parsed for artifact suggestions:

```bash
node /Users/romainsimon/dev/win-loops/bin/win-loops.js exec --repo /path/to/repo --agent codex --run <run-id>
node /Users/romainsimon/dev/win-loops/bin/win-loops.js artifact suggestions --repo /path/to/repo
node /Users/romainsimon/dev/win-loops/bin/win-loops.js artifact accept <suggestion-id> --repo /path/to/repo
```

This lets Codex propose proof in plain output while the operator explicitly decides what becomes part of the run record.
