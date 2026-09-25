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
  /** An error bubble: shown in red with a retry, and not sent back as conversation history. */
  error?: boolean;
  followUps?: string[];
  analyzed?: number;
  seconds?: number;
}

// Reads the clock outside the component so the render-purity lint rule sees only event-handler use.
const clock = () => Date.now();

const CITATION = /\[\[([\w-]+)\|([^\]]+)\]\]/g;

/** Answer text as plain text: citations become just the call title. Used for Copy. */
const plainText = (text: string) => text.replace(CITATION, "$2").replace(/\*\*([^*]+)\*\*/g, "$1");

/** Renders an answer: "- " lines as bullets, **bold**, and [[id|Title]] citations as links to that call. */
function AnswerText({ text, hrefFor }: { text: string; hrefFor: (id: string) => string | undefined }) {
  const inline = (line: string) =>
    line.split(/(\*\*[^*]+\*\*|\[\[[\w-]+\|[^\]]+\]\])/g).map((part, i) => {
      const bold = part.match(/^\*\*(.+)\*\*$/);
      if (bold) return <strong key={i}>{bold[1]}</strong>;
      const cite = part.match(/^\[\[([\w-]+)\|([^\]]+)\]\]$/);
      if (cite) {
        // Only link ids we know: the model must not be able to send the user somewhere invented.
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
          <ul key={i} className="list-disc space-y-1 pl-5 marker:text-[#2B241C]/40 dark:marker:text-[#F2EDDD]/40">
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
 * Account-level Ask Fathom: a chat across every call, answered from summaries.
 * The server digests the visitor's own calls from the database (see
 * lib/digest.ts); only the question and the conversation are sent. The panel
 * stays mounted while closed, so a conversation survives closing and reopening
 * it. Opening and closing work the same way as the per-meeting panel on the
 * meeting detail page: a floating button opens it, its own close button closes
 * it — there is no separate desktop-only collapse behavior.
 */
export function AskAllPanel({
  meetings,
  className,
  open,
  onClose,
}: {
  meetings: MeetingListItem[];
  className: string;
  /** Read by the page layout (via the data attribute) to reserve room for the column. */
  open: boolean;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [slow, setSlow] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const abort = useRef<AbortController | null>(null);
  const bottom = useRef<HTMLDivElement>(null);

  // Where a cited call lives: only the visitor's own calls can be linked to.
  const hrefs = useMemo(() => new Map(meetings.map((m) => [m.id, `/meetings/${m.id}`])), [meetings]);
  const callCount = meetings.length;

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
    const started = clock();
    const ac = new AbortController();
    abort.current = ac;

    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const body: AskAllRequest = {
      question: q,
      today,
      history: history.filter((m) => !m.error).map((m) => ({ role: m.role, text: plainText(m.text) })),
    };

    try {
      const res = await fetch("/api/ask-all", {
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
        const { answer, followUps, analyzed } = (await res.json()) as AskAllResponse;
        setMessages((m) => [
          ...m,
          { role: "assistant", text: answer, followUps, analyzed, seconds: Math.max(1, Math.round((clock() - started) / 1000)) },
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

  async function copy(index: number) {
    if (await copyRich(plainText(messages[index].text))) {
      setCopied(index);
      window.setTimeout(() => setCopied((c) => (c === index ? null : c)), 1800);
    }
  }

  const empty = messages.length === 0;
  const last = messages[messages.length - 1];
  const chips = (!empty && last?.role === "assistant" && !last.error && last.followUps?.length ? last.followUps : STOCK_SUGGESTIONS);

  return (
    <aside
      aria-label="Ask Fathom"
      data-ask-panel={open ? "open" : undefined}
      className={`min-w-0 flex-col rounded-xl border border-[#2B241C]/15 bg-white dark:border-[#F2EDDD]/15 dark:bg-[#101B33] ${className}`}
    >
      <div className="flex items-center justify-between border-b border-[#2B241C]/10 px-4 py-3 dark:border-[#F2EDDD]/10">
        <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#2B241C]/70 dark:text-[#F2EDDD]/70">
          <SparkleIcon className="h-4 w-4 text-[#0F6E56] dark:text-[#3EC79A]" />
          Ask Fathom
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Ask Fathom"
          className="rounded p-1 text-[#2B241C]/60 hover:bg-[#2B241C]/5 hover:text-[#2B241C] dark:text-[#F2EDDD]/60 dark:hover:bg-[#F2EDDD]/10 dark:hover:text-[#F2EDDD]"
        >
          <XIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <p className="rounded-lg border border-[#0F6E56]/20 bg-[#0F6E56]/10 p-3 text-xs leading-relaxed text-[#0F6E56] dark:border-[#3EC79A]/30 dark:bg-[#3EC79A]/10 dark:text-[#3EC79A]">
          Ask across all {callCount} of your calls. Answers come from call summaries, not full transcripts, so they can
          miss detail. Open a call to ask about its transcript.
        </p>

        <div className="mt-4 space-y-3" aria-live="polite">
          {messages.map((m, i) =>
            m.role === "user" ? (
              <p
                key={i}
                className="ml-auto w-fit max-w-[88%] whitespace-pre-wrap break-words [overflow-wrap:anywhere] rounded-lg bg-[#0F6E56] px-3 py-2 text-sm text-white dark:bg-[#3EC79A] dark:text-[#101B33]"
              >
                {m.text}
              </p>
            ) : m.error ? (
              <div
                key={i}
                role="alert"
                className="flex items-start gap-2 break-words [overflow-wrap:anywhere] rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-100"
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
                  <div className="text-sm leading-relaxed">
                    <AnswerText text={m.text} hrefFor={(id) => hrefs.get(id)} />
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2 border-t border-[#2B241C]/10 pt-2 text-xs text-[#2B241C]/60 dark:border-[#F2EDDD]/10 dark:text-[#F2EDDD]/60">
                    <button
                      type="button"
                      onClick={() => void copy(i)}
                      aria-label="Copy answer"
                      className="inline-flex items-center gap-1 rounded p-1 hover:bg-[#2B241C]/5 hover:text-[#2B241C] dark:hover:bg-[#F2EDDD]/10 dark:hover:text-[#F2EDDD]"
                    >
                      {copied === i ? <CheckIcon className="h-4 w-4 text-[#0F6E56] dark:text-[#3EC79A]" /> : <CopyIcon className="h-4 w-4" />}
                      {copied === i && <span>Copied</span>}
                    </button>
                    {m.analyzed !== undefined && (
                      <span>
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
              className="flex w-fit items-center gap-2 rounded-lg bg-[#2B241C]/5 px-3 py-2 text-sm text-[#2B241C]/70 dark:bg-[#F2EDDD]/10 dark:text-[#F2EDDD]/60"
              role="status"
            >
              <span className="flex gap-1" aria-hidden>
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#2B241C]/40 [animation-delay:-0.3s] dark:bg-[#F2EDDD]/40" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#2B241C]/40 [animation-delay:-0.15s] dark:bg-[#F2EDDD]/40" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#2B241C]/40 dark:bg-[#F2EDDD]/40" />
              </span>
              {slow ? "Still thinking. Gemini is busy right now…" : "Thinking…"}
            </div>
          )}

          {!pending && (
            <div className="flex flex-col items-end gap-2 pt-1">
              {chips.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="max-w-[92%] rounded-md border border-[#2B241C]/20 px-3 py-1.5 text-right text-xs hover:bg-[#2B241C]/5 dark:border-[#F2EDDD]/20 dark:hover:bg-[#F2EDDD]/10"
                >
                  {s}
                </button>
              ))}
              {!empty && (
                <button
                  type="button"
                  onClick={clear}
                  className="text-xs font-medium text-[#2B241C]/60 underline hover:text-[#2B241C] dark:text-[#F2EDDD]/60 dark:hover:text-[#F2EDDD]"
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
        className="m-3 rounded-lg border border-[#2B241C]/20 bg-white focus-within:border-[#0F6E56] focus-within:ring-2 focus-within:ring-[#0F6E56]/25 dark:border-[#F2EDDD]/20 dark:bg-[#101B33] dark:focus-within:border-[#3EC79A] dark:focus-within:ring-[#3EC79A]/25"
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
          placeholder="Ask anything…"
          className="block w-full resize-none bg-transparent px-3 pt-2.5 text-sm outline-none placeholder:text-[#2B241C]/40 dark:placeholder:text-[#F2EDDD]/40"
        />
        <div className="flex items-center justify-between px-2 pb-2">
          {/* The question always covers all of My Calls: a label, not a dead dropdown. */}
          <span className="rounded-md bg-[#2B241C]/5 px-2 py-1 text-xs text-[#2B241C]/70 dark:bg-[#F2EDDD]/10 dark:text-[#F2EDDD]/70">
            My Calls
          </span>
          <button
            type="submit"
            disabled={pending || !input.trim()}
            aria-label="Send question"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0F6E56] text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#3EC79A] dark:text-[#101B33]"
          >
            <ArrowUpIcon className="h-4 w-4" />
          </button>
        </div>
      </form>
    </aside>
  );
}
