"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { AlertIcon, SparkleIcon } from "@/components/ui/icons";
import { formatTimestamp } from "@/lib/format";
import { MAX_QUESTION_CHARS } from "@/lib/recordings/limits";
import { parseTimestamp } from "@/lib/recordings/normalize";
import type { ApiErrorBody, AskRequest, AskResponse } from "@/lib/recordings/types";
import type { Meeting } from "@/types/meeting";

const SUGGESTIONS = [
  "What were the key decisions?",
  "Who owns which action item?",
  "Summarize this call in three sentences",
];

interface Message {
  role: "user" | "assistant";
  text: string;
  /** An error bubble: shown in red with a retry, and not sent back as conversation history. */
  error?: boolean;
}

/** Renders an answer: "- " lines as bullets, **bold**, and [m:ss] as links that jump to that moment. */
function AnswerText({ text, onJump }: { text: string; onJump: (t: number) => void }) {
  const inline = (line: string) =>
    line.split(/(\*\*[^*]+\*\*|\[\d{1,2}:\d{2}(?::\d{2})?\])/g).map((part, i) => {
      const bold = part.match(/^\*\*(.+)\*\*$/);
      if (bold) return <strong key={i}>{bold[1]}</strong>;
      const ts = part.match(/^\[(\d{1,2}:\d{2}(?::\d{2})?)\]$/);
      if (ts) {
        const seconds = parseTimestamp(ts[1]);
        if (seconds !== null) {
          return (
            <button
              key={i}
              type="button"
              onClick={() => onJump(seconds)}
              title="Jump to this moment in the transcript"
              className="rounded px-0.5 font-medium tabular-nums text-blue-700 underline decoration-dotted hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-950"
            >
              {formatTimestamp(seconds)}
            </button>
          );
        }
      }
      return <Fragment key={i}>{part}</Fragment>;
    });

  const blocks: { bullets: boolean; lines: string[] }[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.trimEnd();
    if (!line.trim()) continue;
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    const last = blocks[blocks.length - 1];
    if (bullet) {
      if (last?.bullets) last.lines.push(bullet[1]);
      else blocks.push({ bullets: true, lines: [bullet[1]] });
    } else {
      blocks.push({ bullets: false, lines: [line] });
    }
  }

  return (
    <div className="space-y-2">
      {blocks.map((b, i) =>
        b.bullets ? (
          <ul key={i} className="list-disc space-y-1 pl-5 marker:text-zinc-400">
            {b.lines.map((l, j) => (
              <li key={j}>{inline(l)}</li>
            ))}
          </ul>
        ) : (
          <p key={i}>{inline(b.lines[0])}</p>
        ),
      )}
    </div>
  );
}

/**
 * Ask Fathom: a chat about one meeting, answered by Gemini from that meeting's
 * transcript. Only the call's share token and the question are sent: the
 * server reads the transcript from the database. The last few turns are sent
 * too so follow-ups make sense.
 */
export function AskFathomTab({ meeting, onJump }: { meeting: Meeting; onJump: (t: number) => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [slow, setSlow] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const bottom = useRef<HTMLDivElement>(null);

  // Keep the newest message in view.
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [messages, pending]);

  // Cancel an in-flight question if the tab goes away.
  useEffect(() => () => abort.current?.abort(), []);

  // After a while, say it's still working rather than looking frozen.
  useEffect(() => {
    if (!pending) return;
    const t = window.setTimeout(() => setSlow(true), 15_000);
    return () => {
      window.clearTimeout(t);
      setSlow(false);
    };
  }, [pending]);

  async function ask(question: string, history: Message[]) {
    const q = question.trim();
    if (!q || pending) return;
    setPending(true);

    const ac = new AbortController();
    abort.current = ac;
    const body: AskRequest = {
      question: q,
      history: history.filter((m) => !m.error).map((m) => ({ role: m.role, text: m.text })),
      shareToken: meeting.shareToken,
    };

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: ac.signal,
      });
      if (!res.ok) {
        let message = "Something went wrong. Please try again.";
        try {
          message = ((await res.json()) as ApiErrorBody).error.message || message;
        } catch {
          // not JSON
        }
        setMessages((m) => [...m, { role: "assistant", text: message, error: true }]);
      } else {
        const { answer } = (await res.json()) as AskResponse;
        setMessages((m) => [...m, { role: "assistant", text: answer }]);
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Couldn't reach the server. Check your connection and try again.", error: true },
      ]);
    } finally {
      setPending(false);
    }
  }

  function send(question: string) {
    const q = question.trim();
    if (!q || pending) return;
    const history = messages;
    setMessages([...messages, { role: "user", text: q }]);
    setInput("");
    void ask(q, history);
  }

  function retry() {
    // Drop the error bubble and ask the same question again.
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser || pending) return;
    const withoutError = messages.slice(0, -1);
    setMessages(withoutError);
    void ask(lastUser.text, withoutError.slice(0, -1));
  }

  function clear() {
    abort.current?.abort();
    setMessages([]);
    setPending(false);
  }

  const empty = messages.length === 0;

  return (
    <div className="flex min-h-80 min-w-0 flex-col">
      {empty && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
          <SparkleIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Ask anything about this call. Answers are written by Gemini from the call&rsquo;s transcript, so they can
            occasionally be wrong. Check the timestamps it cites.
          </p>
        </div>
      )}

      <div className="flex-1 space-y-3" aria-live="polite">
        {messages.map((m, i) =>
          m.role === "user" ? (
            <p key={i} className="ml-auto w-fit max-w-[85%] whitespace-pre-wrap break-words [overflow-wrap:anywhere] rounded-lg bg-blue-600 px-3 py-2 text-sm text-white">
              {m.text}
            </p>
          ) : m.error ? (
            <div
              key={i}
              role="alert"
              className="flex max-w-[92%] items-start gap-2 break-words [overflow-wrap:anywhere] rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-100"
            >
              <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p>{m.text}</p>
                {i === messages.length - 1 && !pending && (
                  <button type="button" onClick={retry} className="mt-1 text-xs font-semibold underline">
                    Try again
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div key={i} className="max-w-[92%] break-words [overflow-wrap:anywhere] rounded-lg bg-zinc-100 px-3 py-2 text-sm leading-relaxed dark:bg-zinc-900">
              <AnswerText text={m.text} onJump={onJump} />
            </div>
          ),
        )}

        {pending && (
          <div className="flex w-fit items-center gap-2 rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400" role="status">
            <span className="flex gap-1" aria-hidden>
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" />
            </span>
            {slow ? "Still thinking. Gemini is busy right now…" : "Thinking…"}
          </div>
        )}
        <div ref={bottom} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            disabled={pending}
            onClick={() => send(s)}
            className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            {s}
          </button>
        ))}
        {!empty && (
          <button type="button" onClick={clear} className="ml-auto text-xs font-medium text-zinc-500 underline hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100">
            Clear chat
          </button>
        )}
      </div>

      <form
        className="mt-3 flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={MAX_QUESTION_CHARS}
          aria-label="Ask a question about this call"
          placeholder="Ask anything about this call…"
          className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          type="submit"
          disabled={pending || !input.trim()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Ask
        </button>
      </form>
    </div>
  );
}
