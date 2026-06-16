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
