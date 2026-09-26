"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { AlertIcon, ArrowUpIcon, CheckIcon, CopyIcon, SparkleIcon, XIcon } from "@/components/ui/icons";
import { copyRich } from "@/lib/clipboard";
import { MAX_QUESTION_CHARS } from "@/lib/recordings/limits";
import type { ApiErrorBody, AskAllRequest, AskAllResponse } from "@/lib/recordings/types";
import type { MeetingListItem } from "@/types/meeting";

const STOCK_SUGGESTIONS = [
  "Any looming deadlines?",
  "What are my open action items?",
  "What decisions were made recently?",
];

interface Message {
  role: "user" | "assistant";
  text: string;
  error?: boolean;
  followUps?: string[];
  analyzed?: number;
  seconds?: number;
}

const clock = () => Date.now();

const CITATION = /\[\[([\w-]+)\|([^\]]+)\]\]/g;

const plainText = (text: string) => text.replace(CITATION, "$2").replace(/\*\*([^*]+)\*\*/g, "$1");

function AnswerText({ text, hrefFor }: { text: string; hrefFor: (id: string) => string | undefined }) {
  const inline = (line: string) =>
    line.split(/(\*\*[^*]+\*\*|\[\[[\w-]+\|[^\]]+\]\])/g).map((part, i) => {
      const bold = part.match(/^\*\*(.+)\*\*$/);
      if (bold) return <strong key={i} className="font-semibold text-[#201D1A] dark:text-[#F3F4F6]">{bold[1]}</strong>;
      const cite = part.match(/^\[\[([\w-]+)\|([^\]]+)\]\]$/);
      if (cite) {
        const href = hrefFor(cite[1]);
        return href ? (
          <Link
            key={i}
            href={href}
            className="font-medium text-[#0F6E56] underline decoration-dotted hover:bg-[#0F6E56]/10 dark:text-[#3EC79A] dark:hover:bg-[#3EC79A]/15"
          >
            {cite[2]}
          </Link>
        ) : (
          <Fragment key={i}>{cite[2]}</Fragment>
        );
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

export function AskAllPanel({
  meetings,
  onClose,
  open,
  className = "",
}: {
  meetings: MeetingListItem[];
  onClose: () => void;
  open: boolean;
  className?: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [slow, setSlow] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const copyTimer = useRef<number | undefined>(undefined);
  const abort = useRef<AbortController | null>(null);
  const bottom = useRef<HTMLDivElement>(null);

  const hrefs = useMemo(() => new Map(meetings.map((m) => [m.id, `/meetings/${m.id}`])), [meetings]);

  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

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

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function copy(index: number) {
    const text = messages[index]?.text;
    if (!text) return;
    await copyRich(plainText(text));
    setCopied(index);
    window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(null), 1800);
  }

  async function ask(question: string, history: Message[]) {
    const q = question.trim();
    if (!q || pending) return;
    setPending(true);

    const ac = new AbortController();
    abort.current = ac;
    const body: AskAllRequest = {
      question: q,
      history: history.filter((m) => !m.error).map((m) => ({ role: m.role, text: m.text })),
    };

    const start = clock();
    try {
      const res = await fetch("/api/ask-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: ac.signal,
      });
      const elapsed = Math.round((clock() - start) / 100) / 10;
      if (!res.ok) {
        let message = "Something went wrong. Please try again.";
        try {
          message = ((await res.json()) as ApiErrorBody).error.message || message;
        } catch {
          // not JSON
        }
        setMessages((m) => [...m, { role: "assistant", text: message, error: true }]);
      } else {
        const { answer, followUps, analyzed } = (await res.json()) as AskAllResponse;
        setMessages((m) => [
          ...m,
          { role: "assistant", text: answer, followUps, analyzed, seconds: elapsed },
        ]);
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
  const lastFollowUps = [...messages].reverse().find((m) => m.followUps && m.followUps.length > 0)?.followUps;
  const chips = lastFollowUps && lastFollowUps.length > 0 ? lastFollowUps : STOCK_SUGGESTIONS;
  const callCount = meetings.length;

  return (
    <aside
      aria-label="Ask Fathom"
      data-ask-panel={open ? "open" : undefined}
      className={`min-w-0 flex-col rounded-2xl border border-[#201D1A]/10 bg-white shadow-xl dark:border-white/10 dark:bg-[#111827] overflow-hidden ${className}`}
    >
      <div className="flex items-center justify-between border-b border-[#201D1A]/8 bg-[#FAF9F5] px-4 py-3.5 dark:border-white/10 dark:bg-[#0B0F19]">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0F6E56]/10 text-[#0F6E56] dark:bg-[#3EC79A]/15 dark:text-[#3EC79A]">
            <SparkleIcon className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-[#201D1A] dark:text-[#F3F4F6]">Ask Fathom</h2>
            <p className="text-[11px] text-[#201D1A]/50 dark:text-[#F3F4F6]/50">Across all {callCount} calls</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Ask Fathom"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#201D1A]/10 bg-white text-[#201D1A]/70 hover:bg-[#201D1A]/5 hover:text-[#201D1A] dark:border-white/10 dark:bg-white/[0.04] dark:text-[#F3F4F6]/70 dark:hover:bg-white/10 dark:hover:text-white transition"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <p className="rounded-xl border border-[#0F6E56]/20 bg-[#0F6E56]/10 p-3 text-xs leading-relaxed text-[#0F6E56] dark:border-[#3EC79A]/25 dark:bg-[#3EC79A]/10 dark:text-[#3EC79A]">
          Ask across all {callCount} of your calls. Answers come from call summaries. Open an individual call to query its exact timestamped transcript.
        </p>

        <div className="mt-4 space-y-3" aria-live="polite">
          {messages.map((m, i) =>
            m.role === "user" ? (
              <p
                key={i}
                className="ml-auto w-fit max-w-[88%] whitespace-pre-wrap break-words [overflow-wrap:anywhere] rounded-2xl rounded-tr-xs bg-[#0F6E56] px-3.5 py-2 text-xs font-medium text-white shadow-2xs dark:bg-[#3EC79A] dark:text-[#0B0F19]"
              >
                {m.text}
              </p>
            ) : m.error ? (
              <div
                key={i}
                role="alert"
                className="flex items-start gap-2 break-words [overflow-wrap:anywhere] rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-900 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-100"
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
              <div key={i} className="flex gap-2">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0F6E56]/10 text-[#0F6E56] dark:bg-[#3EC79A]/15 dark:text-[#3EC79A]">
                  <SparkleIcon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1 break-words [overflow-wrap:anywhere]">
                  <div className="text-xs leading-relaxed text-[#201D1A]/90 dark:text-[#F3F4F6]/90">
                    <AnswerText text={m.text} hrefFor={(id) => hrefs.get(id)} />
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2 border-t border-[#201D1A]/8 pt-2 text-[11px] text-[#201D1A]/60 dark:border-white/10 dark:text-[#F3F4F6]/60">
                    <button
                      type="button"
                      onClick={() => void copy(i)}
                      aria-label="Copy answer"
                      className="inline-flex items-center gap-1 rounded p-1 hover:bg-[#201D1A]/5 hover:text-[#201D1A] dark:hover:bg-white/5 dark:hover:text-white"
                    >
                      {copied === i ? <CheckIcon className="h-3.5 w-3.5 text-[#0F6E56] dark:text-[#3EC79A]" /> : <CopyIcon className="h-3.5 w-3.5" />}
                      {copied === i && <span>Copied</span>}
                    </button>
                    {m.analyzed !== undefined && (
                      <span className="font-mono">
                        Analyzed {m.analyzed} {m.analyzed === 1 ? "call" : "calls"} in {m.seconds}s
                      </span>
                    )}
                  </div>
                </div>
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
            <div className="flex flex-col items-end gap-1.5 pt-1">
              {chips.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="max-w-[92%] rounded-full border border-[#201D1A]/10 bg-white px-2.5 py-1 text-right text-xs font-semibold text-[#201D1A]/70 transition-colors hover:bg-[#201D1A]/5 dark:border-white/10 dark:bg-white/[0.04] dark:text-[#F3F4F6]/70 dark:hover:bg-white/10"
                >
                  {s}
                </button>
              ))}
              {!empty && (
                <button
                  type="button"
                  onClick={clear}
                  className="text-xs font-semibold text-[#201D1A]/50 underline hover:text-[#201D1A] dark:text-[#F3F4F6]/50 dark:hover:text-[#F3F4F6]"
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
        className="m-3 rounded-xl border border-[#201D1A]/10 bg-white focus-within:border-[#0F6E56] focus-within:ring-2 focus-within:ring-[#0F6E56]/20 dark:border-white/10 dark:bg-[#161F30] dark:focus-within:border-[#3EC79A] dark:focus-within:ring-[#3EC79A]/20"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          maxLength={MAX_QUESTION_CHARS}
          rows={2}
          aria-label="Ask a question about your calls"
          placeholder="Ask anything across all calls…"
          className="block w-full resize-none bg-transparent px-3 pt-2 text-xs outline-none placeholder:text-[#201D1A]/40 dark:placeholder:text-[#F3F4F6]/40"
        />
        <div className="flex items-center justify-between px-2.5 pb-2">
          <span className="rounded-md bg-[#201D1A]/5 px-2 py-0.5 text-[11px] font-semibold text-[#201D1A]/60 dark:bg-white/5 dark:text-[#F3F4F6]/60">
            My Calls
          </span>
          <button
            type="submit"
            disabled={pending || !input.trim()}
            aria-label="Send question"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0F6E56] text-white hover:bg-[#0c5945] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#3EC79A] dark:text-[#0B0F19] dark:hover:bg-[#35b58b]"
          >
            <ArrowUpIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </aside>
  );
}
