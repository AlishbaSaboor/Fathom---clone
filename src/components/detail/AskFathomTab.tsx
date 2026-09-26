"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { AlertIcon, ArrowUpIcon, SparkleIcon } from "@/components/ui/icons";
import { formatTimestamp } from "@/lib/format";
import { MAX_QUESTION_CHARS } from "@/lib/recordings/limits";
import { parseTimestamp } from "@/lib/recordings/normalize";
import type { ApiErrorBody, AskRequest, AskResponse } from "@/lib/recordings/types";
import type { Meeting } from "@/types/meeting";

/** Chip label plus the real question it sends. */
const SUGGESTIONS = [
  { label: "Decisions", question: "What were the key decisions?" },
  { label: "Action items", question: "Who owns which action item?" },
  { label: "Summary", question: "Summarize this call in three sentences." },
];

interface Message {
  role: "user" | "assistant";
  text: string;
  error?: boolean;
}

/** Renders an answer: "- " lines as bullets, **bold**, and [m:ss] as links that jump to that moment. */
function AnswerText({ text, onJump }: { text: string; onJump: (t: number) => void }) {
  const inline = (line: string) =>
    line.split(/(\*\*[^*]+\*\*|\[\d{1,2}:\d{2}(?::\d{2})?\])/g).map((part, i) => {
      const bold = part.match(/^\*\*(.+)\*\*$/);
      if (bold) return <strong key={i} className="font-semibold text-[#201D1A] dark:text-[#F3F4F6]">{bold[1]}</strong>;
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
              className="rounded px-1 py-0.5 font-mono text-xs font-semibold tabular-nums text-[#0F6E56] underline decoration-dotted hover:bg-[#0F6E56]/15 dark:text-[#3EC79A] dark:hover:bg-[#3EC79A]/20"
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
          <ul key={i} className="list-disc space-y-1 pl-4 marker:text-[#0F6E56]/50 dark:marker:text-[#3EC79A]/50">
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

export function AskFathomTab({ meeting, onJump }: { meeting: Meeting; onJump: (t: number) => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [slow, setSlow] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [messages, pending]);

  useEffect(() => () => abort.current?.abort(), []);

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
    <>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {empty && (
          <div className="flex items-start gap-2.5 rounded-xl border border-[#0F6E56]/20 bg-[#0F6E56]/10 p-3 text-xs leading-relaxed text-[#0F6E56] dark:border-[#3EC79A]/25 dark:bg-[#3EC79A]/10 dark:text-[#3EC79A]">
            <SparkleIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Hi! I&rsquo;m Ask Fathom, scoped to this call. Ask about decisions, topics or action items
              &mdash; click any cited timestamp to jump straight to that moment.
            </p>
          </div>
        )}

        <div className="space-y-3" aria-live="polite">
          {messages.map((m, i) =>
            m.role === "user" ? (
              <p
                key={i}
                className="ml-auto w-fit max-w-[85%] whitespace-pre-wrap break-words [overflow-wrap:anywhere] rounded-2xl rounded-tr-xs bg-[#0F6E56] px-3.5 py-2 text-xs font-medium text-white shadow-2xs dark:bg-[#3EC79A] dark:text-[#0B0F19]"
              >
                {m.text}
              </p>
            ) : m.error ? (
              <div
                key={i}
                role="alert"
                className="flex max-w-[92%] items-start gap-2 break-words [overflow-wrap:anywhere] rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-900 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-100"
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
              <div
                key={i}
                className="max-w-[92%] break-words [overflow-wrap:anywhere] rounded-2xl rounded-tl-xs border border-[#201D1A]/5 bg-[#201D1A]/5 px-3.5 py-2.5 text-xs leading-relaxed text-[#201D1A]/90 dark:border-white/5 dark:bg-white/[0.05] dark:text-[#F3F4F6]/90"
              >
                <AnswerText text={m.text} onJump={onJump} />
              </div>
            ),
          )}

          {pending && (
            <div
              className="flex w-fit items-center gap-2 rounded-xl bg-[#201D1A]/5 px-3 py-2 text-xs text-[#201D1A]/70 dark:bg-white/[0.05] dark:text-[#F3F4F6]/70"
              role="status"
            >
              <span className="flex gap-1" aria-hidden>
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#0F6E56] [animation-delay:-0.3s] dark:bg-[#3EC79A]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#0F6E56] [animation-delay:-0.15s] dark:bg-[#3EC79A]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#0F6E56] dark:bg-[#3EC79A]" />
              </span>
              <span>{slow ? "Gemini is busy right now…" : "Thinking…"}</span>
            </div>
          )}

          {!pending && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  disabled={pending}
                  onClick={() => send(s.question)}
                  className="rounded-full border border-[#201D1A]/10 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#201D1A]/70 transition-colors hover:bg-[#201D1A]/5 disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-[#F3F4F6]/70 dark:hover:bg-white/10"
                >
                  {s.label}
                </button>
              ))}
              {!empty && (
                <button
                  type="button"
                  onClick={clear}
                  className="ml-auto text-xs font-semibold text-[#201D1A]/50 underline hover:text-[#201D1A] dark:text-[#F3F4F6]/50 dark:hover:text-[#F3F4F6]"
                >
                  Clear chat
                </button>
              )}
            </div>
          )}
          <div ref={bottom} />
        </div>
      </div>

      <form
        className="m-3 flex items-center gap-2 rounded-xl border border-[#201D1A]/10 bg-white px-2.5 py-1.5 focus-within:border-[#0F6E56] focus-within:ring-2 focus-within:ring-[#0F6E56]/20 dark:border-white/10 dark:bg-[#161F30] dark:focus-within:border-[#3EC79A] dark:focus-within:ring-[#3EC79A]/20"
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
          placeholder="Ask about this meeting…"
          className="min-w-0 flex-1 bg-transparent px-1 py-1 text-xs outline-none placeholder:text-[#201D1A]/40 dark:placeholder:text-[#F3F4F6]/40"
        />
        <button
          type="submit"
          disabled={pending || !input.trim()}
          aria-label="Send question"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0F6E56] text-white hover:bg-[#0c5945] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#3EC79A] dark:text-[#0B0F19] dark:hover:bg-[#35b58b]"
        >
          <ArrowUpIcon className="h-3.5 w-3.5" />
        </button>
      </form>
    </>
  );
}
