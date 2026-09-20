#!/usr/bin/env python3
"""
8x assignment agent-capture hook for Claude Code.

Wired in .claude/settings.json to:
  - SessionStart     -> remembers the model for the session
  - UserPromptSubmit -> logs the prompt (verbatim)
  - Stop             -> logs the final response for that turn

Writes .agent-logs/<YYYY-MM-DD_HH-MM-SS>_<session-short>.md in the 8x format.
Only the prompt and the final response are captured -- no thinking, tool calls,
or intermediate assistant narration.

The hook never blocks Claude Code. Failures are appended to
.claude/hooks/capture-errors.log so a broken capture is discoverable rather
than silent.
"""

import json
import os
import subprocess
import sys
import time
import traceback
from datetime import datetime, timezone

REPO_ROOT = os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd())
LOG_DIR = os.path.join(REPO_ROOT, ".agent-logs")
HOOK_DIR = os.path.join(REPO_ROOT, ".claude", "hooks")
STATE_DIR = os.path.join(HOOK_DIR, ".state")
ERROR_LOG = os.path.join(HOOK_DIR, "capture-errors.log")

TOOL_NAME = "claude-code"
PROJECT_NAME = os.path.basename(os.path.normpath(REPO_ROOT)) or "project"


def utc_now():
    n = datetime.now(timezone.utc)
    return n.strftime("%Y-%m-%dT%H:%M:%S.") + f"{n.microsecond // 1000:03d}Z"


def read_text(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def write_text(path, text, mode="w"):
    with open(path, mode, encoding="utf-8", newline="\n") as f:
        f.write(text)


def log_error(msg):
    try:
        os.makedirs(HOOK_DIR, exist_ok=True)
        write_text(ERROR_LOG, f"{utc_now()} {msg}\n", "a")
    except Exception:
        pass


# ---- state -----------------------------------------------------------------

def state_path(session_id):
    os.makedirs(STATE_DIR, exist_ok=True)
    return os.path.join(STATE_DIR, f"{session_id}.json")


def load_state(session_id):
    p = state_path(session_id)
    if os.path.exists(p):
        return json.loads(read_text(p))
    return None


def save_state(session_id, state):
    write_text(state_path(session_id), json.dumps(state))


# ---- identity --------------------------------------------------------------

def detect_author():
    if os.environ.get("CAPTURE_AUTHOR"):
        return os.environ["CAPTURE_AUTHOR"]
    try:
        url = subprocess.run(
            ["git", "-C", REPO_ROOT, "remote", "get-url", "origin"],
            capture_output=True, text=True, timeout=5,
        ).stdout.strip()
        # https://github.com/<handle>/<repo> or git@github.com:<handle>/<repo>
        if "github.com" in url:
            tail = url.split("github.com", 1)[1].lstrip(":/")
            return tail.split("/")[0]
    except Exception:
        pass
    return "unknown"


# ---- transcript parsing ----------------------------------------------------

def iter_entries(transcript_path):
    try:
        text = read_text(transcript_path)
    except Exception:
        return
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            yield json.loads(line)
        except json.JSONDecodeError:
            continue


def is_real_prompt(entry):
    """A human prompt: user entry, main thread, string content (tool results
    are user entries with list content)."""
    if entry.get("type") != "user" or entry.get("isSidechain") or entry.get("isMeta"):
        return False
    content = entry.get("message", {}).get("content")
    if isinstance(content, str):
        return True
    if isinstance(content, list):
        return any(isinstance(b, dict) and b.get("type") == "text" for b in content) and \
            not any(isinstance(b, dict) and b.get("type") == "tool_result" for b in content)
    return False


def last_model(transcript_path):
    model = None
    for e in iter_entries(transcript_path):
        if e.get("type") == "assistant" and not e.get("isSidechain"):
            m = e.get("message", {}).get("model")
            if m and not m.startswith("<"):  # ignore synthetic placeholders
                model = m
    return model


def final_response(transcript_path):
    """Text the assistant wrote after its last tool call in the latest turn,
    or None if the turn has no assistant text yet."""
    collected = []
    for e in iter_entries(transcript_path):
        if is_real_prompt(e):
            collected = []  # new turn
            continue
        if e.get("type") != "assistant" or e.get("isSidechain"):
            continue
        content = e.get("message", {}).get("content", [])
        if not isinstance(content, list):
            continue
        for b in content:
            if not isinstance(b, dict):
                continue
            if b.get("type") == "tool_use":
                collected = []  # narration before a tool call is not final
            elif b.get("type") == "text" and b.get("text", "").strip():
                collected.append(b["text"])
    return "\n\n".join(collected).strip() if collected else None


# ---- log file --------------------------------------------------------------

def header(state, model):
    author = state["author"]
    short = state["session_id"].split("-")[0]
    return (
        "---\n"
        f"session_id: {state['session_id']}\n"
        f"date: {state['date']}\n"
        f"author: {author}\n"
        f"model: {model}\n"
        f"tool: {TOOL_NAME}\n"
        f"project: {PROJECT_NAME}\n"
        f"total_exchanges: {state['total_exchanges']}\n"
        f"first_prompt_time: {state['first_prompt_time']}\n"
        f"last_prompt_time: {state['last_prompt_time']}\n"
        "---\n\n"
        f"# Session Log - {state['date']}\n\n"
        f"Session: `{short}` | Project: `{PROJECT_NAME}` | Author: `{author}`\n\n"
        "---\n"
    )


def rewrite_header(state, model):
    """Refresh only the front matter/title block; entries are never touched."""
    path = state["log_path"]
    body = read_text(path)
    marker = "\n---\n"
    first = body.find(marker)                    # end of front matter
    second = body.find(marker, first + 1)        # end of title block
    rest = body[second + len(marker):] if second != -1 else ""
    write_text(path, header(state, model) + rest)


def append_entry(state, kind, num, text, ts, model):
    block = (
        f"\n[LOG_ENTRY type={kind} num={num} session={state['session_id']}]\n"
        f"timestamp: {ts}\n"
        f"model: {model}\n\n"
        f"{text}\n\n"
    )
    write_text(state["log_path"], block, "a")


# ---- handlers --------------------------------------------------------------

def handle_session_start(payload, sid):
    state = load_state(sid) or {}
    if payload.get("model"):
        state["model"] = payload["model"]
        state.setdefault("session_id", sid)
        save_state(sid, state)


def handle_prompt(payload, sid):
    ts = utc_now()
    state = load_state(sid)
    if not state or "log_path" not in state:
        state = state or {}
        now_local = datetime.now()
        os.makedirs(LOG_DIR, exist_ok=True)
        state.update({
            "session_id": sid,
            "date": now_local.strftime("%Y-%m-%d"),
            "log_path": os.path.join(
                LOG_DIR, f"{now_local.strftime('%Y-%m-%d_%H-%M-%S')}_{sid.split('-')[0]}.md"),
            "total_exchanges": 0,
            "first_prompt_time": ts,
            "author": detect_author(),
        })
        # placeholder so rewrite_header finds its two markers
        write_text(state["log_path"], "---\nx\n---\n\n---\n")

    model = (payload.get("model")
             or last_model(payload.get("transcript_path", ""))
             or state.get("model")
             or os.environ.get("CAPTURE_MODEL_NAME")
             or "unknown")
    state["model"] = model
    state["total_exchanges"] += 1
    state["last_prompt_time"] = ts
    state["_pending_num"] = state["total_exchanges"]
    save_state(sid, state)

    rewrite_header(state, model)
    append_entry(state, "PROMPT", state["total_exchanges"], payload.get("prompt", ""), ts, model)


def handle_stop(payload, sid):
    state = load_state(sid)
    if not state or "log_path" not in state:
        return  # Stop with no logged prompt (e.g. hook installed mid-turn)
    num = state.get("_pending_num", state["total_exchanges"])
    if state.get("_responded_num") == num:
        return  # already logged a response for this turn

    tp = payload.get("transcript_path", "")
    text = (payload.get("last_assistant_message") or "").strip() or None
    # The transcript can lag the Stop event; wait briefly for the final text.
    for _ in range(10):
        if text:
            break
        text = final_response(tp)
        if not text:
            time.sleep(0.3)
    if not text:
        text = "[capture hook: no final assistant text found in transcript]"

    model = last_model(tp) or state.get("model") or "unknown"
    state["model"] = model
    state["_responded_num"] = num
    save_state(sid, state)

    rewrite_header(state, model)
    append_entry(state, "RESPONSE", num, text, utc_now(), model)


def main():
    try:
        payload = json.loads(sys.stdin.buffer.read().decode("utf-8"))
    except Exception as e:
        log_error(f"bad stdin json: {e}")
        return
    try:
        event = payload.get("hook_event_name")
        sid = payload.get("session_id", "unknown-session")
        if event == "SessionStart":
            handle_session_start(payload, sid)
        elif event == "UserPromptSubmit":
            handle_prompt(payload, sid)
        elif event == "Stop":
            handle_stop(payload, sid)
    except Exception:
        log_error(traceback.format_exc())


if __name__ == "__main__":
    main()
