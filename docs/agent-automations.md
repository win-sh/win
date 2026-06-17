# Agent Automations Compatibility

win loops are compatible with Codex Automations and Claude Code recurring tasks when the loop is installed into the target project repo.

The compatible shape is:

1. A native automation wakes up on a fixed cadence.
2. The automation runs `win tick --repo .`.
3. `win` decides which loops are actually due using `.win/loops/<loop-id>/state.json`.
4. The automation runs `win next --repo .`.
5. If the next action is execution, the agent uses the generated `win-<loop-id>` skill and executes the exact run brief in `.win/runs/`.
6. Proof, approvals, outcomes, and journals are written back through `win`.

This keeps the important distinction: Codex or Claude owns the fixed wake-up schedule, while the loop owns the adaptive next useful run time.

## Installed Files

`win install <loop> --repo <repo>` writes files for both agent systems:

```text
AGENTS.md
CLAUDE.md

.win/
  loops/<loop-id>/LOOP.md
  loops/<loop-id>/journal.md
  loops/<loop-id>/state.json
  runs/
  executions/
  state/*.jsonl

.agents/
  skills/win-<loop-id>/SKILL.md

.claude/
  skills/win-<loop-id>/SKILL.md
```

Codex reads `AGENTS.md` and can use skills from `.agents/skills`. Claude Code reads `CLAUDE.md` and can use project skills from `.claude/skills`.

## Codex Automation Prompt

Use this as the Codex Automation prompt for a project-scoped automation:

```text
Run one win.sh loop pass for this repo.

1. Run `win tick --repo .`.
2. Run `win inbox --repo .`.
3. Run `win next --repo .`.
4. If the next action is an approval or outcome check, report it and stop.
5. If the next action is execution, use the named `win-<loop-id>` skill and execute the exact `.win/runs/<run-id>.md` brief.
6. Stay within `.win/loops/<loop-id>/LOOP.md` authority. Do not broaden the task.
7. If you make code/content changes, run the relevant tests or checks.
8. Attach proof with `win artifact attach <run-id> --repo . ...` or accept detected proof with `win artifact suggestions --repo .` and `win artifact accept <suggestion-id> --repo .`.
9. Summarize whether anything changed, what proof was recorded, and whether follow-up approval or outcome verification is needed.
```

Recommended Codex Automation settings:

- Project: the target repo where loops are installed.
- Execution: local project if the loop should write into the main checkout, or worktree if you want isolation.
- Cadence: frequent enough to wake loops, such as every 15-60 minutes. The loop state prevents unnecessary work.
- Prompt: the prompt above. Installed enabled loops are filtered by due state.

## Claude Code Remote Task Prompt

This mirrors the `/dev/ceo` scheduled-task style.

```markdown
# win.sh Loop Runner

## Scheduled Task Configuration

- **Repo**: <repo-name>
- **Schedule**: every 15-60 minutes, or daily/weekly for low-frequency loops
- **Branch**: main

## Prompt

You are running one win.sh loop pass for this repository.

1. Run `win tick --repo .`.
2. Run `win inbox --repo .`.
3. Run `win next --repo .`.
4. If the next action is an approval, outcome check, or blocked state, report it and stop.
5. If the next action is execution, invoke the matching `/win-<loop-id>` skill and execute the exact `.win/runs/<run-id>.md` brief.
6. Read `.win/loops/<loop-id>/LOOP.md` before taking action and stay within its authority.
7. Keep changes focused. Do not merge, deploy, spend money, publish, or contact customers unless the loop authority explicitly allows it.
8. Run relevant checks.
9. Record proof through `win artifact attach` or detected artifact suggestions.
10. End with a concise status: no-op, action taken, approval needed, or verification pending.
```

## Compatibility Matrix

| Surface | Status | Notes |
| --- | --- | --- |
| Codex manual run | Compatible | `win exec --agent codex --dry-run` prints the exact Codex command and prompt. |
| Codex Automations | Compatible | Use a project-scoped automation that wakes the repo and runs the prompt above. |
| Claude Code manual run | Compatible | `win exec --agent claude-code --dry-run` prints the exact Claude command and prompt. |
| Claude Code Remote Tasks | Compatible | Use the Markdown scheduled-task prompt above. |
| Hosted win.sh | Compatible | Hosted win.sh should provide connector snapshots, approval queues, dashboards, and managed scheduling around the same loop files. |

## Limits

- Native automations have fixed wake-up schedules. Adaptive scheduling still belongs to `win tick`.
- Codex project automations need the local Codex app machine powered on when running against local projects.
- Claude Code cloud/remote tasks need access to the repo, CLI, environment variables, and network destinations required by the loop.
- Hosted connector snapshots require `win auth login` or a manually configured API token.
- Loops that merge code, spend money, publish pages, or contact customers still need explicit authority in `.win/loops/<loop-id>/LOOP.md`.
