# Codex Integration

Local loop installation uses Codex-compatible skills in `.agents/skills` and adds a marked win.sh section to `AGENTS.md`.

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

## Codex Automations

Codex Automations can wake a repo on a fixed cadence, but the loop should still decide whether useful work is due.

Use this automation prompt:

```text
Run one win.sh loop pass for this repo.

1. Run `win tick --repo .`.
2. Run `win inbox --repo .`.
3. Run `win next --repo .`.
4. If the next action is execution, use the named `win-<loop-id>` skill and execute the exact `.win/runs/<run-id>.md` brief.
5. Stay within `.win/loops/<loop-id>/LOOP.md` authority.
6. Record proof with `win artifact attach` or accept detected proof with `win artifact accept`.
```

See [agent automations compatibility](agent-automations.md) for the full Codex and Claude Code prompts.

If you run through the CLI executor, Codex output is captured and parsed for artifact suggestions:

```bash
node /Users/romainsimon/dev/win-loops/bin/win-loops.js exec --repo /path/to/repo --agent codex --run <run-id>
node /Users/romainsimon/dev/win-loops/bin/win-loops.js artifact suggestions --repo /path/to/repo
node /Users/romainsimon/dev/win-loops/bin/win-loops.js artifact accept <suggestion-id> --repo /path/to/repo
```

This lets Codex propose proof in plain output while the operator explicitly decides what becomes part of the run record.
