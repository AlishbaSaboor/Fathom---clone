# Capture test

## Setup

- **Tool:** Claude Code
- **Model:** `claude-sonnet-5` (single model; no separate planner/executor)
- **Automatic mechanism available:** yes — Claude Code hooks (`SessionStart`, `UserPromptSubmit`, `Stop`)

## Mechanism

- **Config file changed:** `.claude/settings.json` — all three events run
  `python3 "$CLAUDE_PROJECT_DIR/.claude/hooks/capture.py"`.
- **Script:** `.claude/hooks/capture.py`
  - `UserPromptSubmit` logs the prompt verbatim.
  - `Stop` logs the final response only. Thinking, tool calls and narration before a tool call are excluded.
  - The model comes from the transcript's `message.model`, not a hardcoded value.
  - Errors go to `.claude/hooks/capture-errors.log` (does not exist, i.e. no errors so far).
- **Bookkeeping:** `.claude/hooks/.state/` (git-ignored). `.agent-logs/` is not ignored.

## Where the canaries landed

| Session | Log file | Canary entries |
|---|---|---|
| 1 (`de8d5c68`) | `.agent-logs/2026-09-20_13-57-19_de8d5c68.md` | `PROMPT num=2`, `RESPONSE num=2` |
| 2 (`d30a9adc`, new session) | `.agent-logs/2026-09-20_14-09-03_d30a9adc.md` | `PROMPT num=1`, `RESPONSE num=1` |

No errors log exists after either session.

## Canary 1 — session `de8d5c68`, raw

````
[LOG_ENTRY type=PROMPT num=2 session=de8d5c68-eb15-4763-ae39-0e5d7b57d506]
timestamp: 2026-09-20T09:03:47.500Z
model: claude-sonnet-5



<pasted_content id="be5f">
CAPTURE TEST — 8x assignment, Alishba Saboor
</pasted_content id="be5f">



[LOG_ENTRY type=RESPONSE num=2 session=de8d5c68-eb15-4763-ae39-0e5d7b57d506]
timestamp: 2026-09-20T09:04:14.245Z
model: claude-sonnet-5

Canary 1 has landed for this session, but two steps remain before capture is verified.

- **Canary 1 prompt:** it is logged in `.agent-logs/2026-09-20_13-57-19_de8d5c68.md` as `PROMPT num=2` with `claude-sonnet-5`. The tool wrapped it in `<pasted_content>` tags, and the hook recorded exactly what it received.
- **Canary 1 response:** this reply will be logged as `RESPONSE num=2` when I finish. I'll confirm it on the next turn, since I can't check my own final entry until it's written.
- **Author fix:** the header still showed the old placeholder author. I've corrected it in the session state, and the header will show `AlishbaSaboor` after this turn's Stop.
- **Wrong model name:** `PROMPT num=1` still says `claude-sonnet-4-6`. I'm leaving it as is and will note it in `CAPTURE-TEST.md`.

**Still needed from you**
1. Restart Claude Code in this folder so the new `SessionStart` hook loads, or run `/hooks` and accept it.
2. In the new session, send `CAPTURE TEST — 8x assignment, Alishba Saboor` again.
3. Tell me once that's sent. I'll verify both canaries in `.agent-logs/` and write `CAPTURE-TEST.md` with the raw entries.
````

## Canary 2 — session `d30a9adc` (new session), raw

````
[LOG_ENTRY type=PROMPT num=1 session=d30a9adc-c3f8-4459-b92b-ab90ac940560]
timestamp: 2026-09-20T09:09:03.589Z
model: claude-sonnet-5



<pasted_content id="25bd">
CAPTURE TEST — 8x assignment, Alishba Saboor
</pasted_content id="25bd">



[LOG_ENTRY type=RESPONSE num=1 session=d30a9adc-c3f8-4459-b92b-ab90ac940560]
timestamp: 2026-09-20T09:09:06.782Z
model: claude-sonnet-5

Your message came through: "CAPTURE TEST — 8x assignment, Alishba Saboor". It doesn't include a task, though. What would you like me to do in the `Fathom---clone` repo?
````

The `<pasted_content>` wrapper is added by Claude Code around pasted input; the hook logs exactly what it receives.

## What did not work / known imperfections

Left as-is in the logs, per the no-editing rule.

1. **A capture hook already existed** in `.claude/` before I did anything, and it had already logged this session's first prompt. I did not write it. I found it, read it, and rewrote it because of the issues below.
2. **Wrong model in the original hook:** it hardcoded `claude-sonnet-4-6`. Session 1 `PROMPT num=1` therefore says `claude-sonnet-4-6` although the real model was `claude-sonnet-5`. `RESPONSE num=1` and everything after it are correct. That first entry is a hook bug, not a model switch.
3. **Placeholder author:** the original hook wrote `author: set-your-github-handle`. The rewrite derives `AlishbaSaboor` from the git remote. Session 1's state file had kept the placeholder, so I corrected the state file (metadata only, no entries). Session 1's front matter now shows the right author.
4. **Original Stop handler was fragile:** it took the last assistant text in the transcript, which could log intermediate narration if the transcript lagged. It also had no explicit UTF-8 handling and no error logging. The rewrite fixes all three, tested against synthetic payloads in a scratch directory before use.
5. **Project name case differs between sessions:** session 1 says `fathom---clone` and session 2 says `Fathom---clone`. The hook takes it from the directory path Claude Code was launched with, and the case differed. Cosmetic.
6. **Entry session IDs:** the entry tags use the full session UUID rather than the short form in the spec's sample. The front matter matches the spec, and I kept this for consistency within session 1's file, which the original hook had already started.
7. **Session 1's first prompt is the setup document itself** (the entire 8x capture-setup file), so that entry is long.
