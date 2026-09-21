"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { AlertIcon, ArrowUpIcon, CheckIcon, CopyIcon, PanelRightIcon, SparkleIcon, XIcon } from "@/components/ui/icons";
import { copyRich } from "@/lib/clipboard";
import { MAX_UPLOADED_CALLS, buildDigest } from "@/lib/digest";
import { MAX_QUESTION_CHARS } from "@/lib/recordings/limits";
import { useUploads } from "@/lib/recordings/storage";
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
          <Link key={i} href={href} className="font-medium text-blue-700 underline decoration-dotted hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-950">
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
 * Account-level Ask Fathom: a chat across every call, answered from summaries.
 * Built-in calls are digested on the server; the visitor's uploaded calls only
 * exist in this browser, so their digests are sent with each question (see
 * lib/digest.ts). The panel stays mounted while hidden, so a conversation
 * survives hiding and re-showing it.
 */
export function AskAllPanel({
  meetings,
  className,
  state,
  onHideDesktop,
  onCloseMobile,
}: {
  meetings: MeetingListItem[];
  className: string;
  /** Read by the page layout (via the data attribute) to make room for the column. */
  state: "open" | "hidden";
  onHideDesktop: () => void;
  onCloseMobile: () => void;
}) {
  const uploads = useUploads();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [slow, setSlow] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const abort = useRef<AbortController | null>(null);
  const bottom = useRef<HTMLDivElement>(null);

  // Where a cited call lives. Uploaded calls open at /uploads/, built-in ones at /meetings/.
  const hrefs = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of meetings) map.set(m.id, `/meetings/${m.id}`);
    for (const u of uploads) map.set(u.id, `/uploads/${u.id}`);
    return map;
  }, [meetings, uploads]);
  const callCount = meetings.length + uploads.length;

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
      uploads: [...uploads]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, MAX_UPLOADED_CALLS)
        .map((m) => ({ id: m.id, title: m.title, date: m.date, digest: buildDigest(m) })),
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
    <aside aria-label="Ask Fathom" data-ask-panel={state === "open" ? "open" : undefined} className={`min-w-0 flex-col rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 ${className}`}>
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
          <SparkleIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          Ask Fathom
        </h2>
        {/* One button per breakpoint: on desktop hiding is remembered, on mobile it just closes the overlay. */}
        <button
          type="button"
          onClick={onHideDesktop}
          aria-label="Hide Ask Fathom"
          title="Hide Ask Fathom"
          className="hidden rounded p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 lg:block dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        >
          <PanelRightIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close Ask Fathom"
          className="rounded p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 lg:hidden dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        >
          <XIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <p className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs leading-relaxed text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
          Ask across all {callCount} of your calls. Answers come from call summaries, not full transcripts, so they can
          miss detail. Open a call to ask about its transcript.
        </p>

        <div className="mt-4 space-y-3" aria-live="polite">
          {messages.map((m, i) =>
            m.role === "user" ? (
              <p key={i} className="ml-auto w-fit max-w-[88%] whitespace-pre-wrap break-words [overflow-wrap:anywhere] rounded-lg bg-blue-600 px-3 py-2 text-sm text-white">
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
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  <SparkleIcon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1 break-words [overflow-wrap:anywhere]">
                  <div className="text-sm leading-relaxed">
                    <AnswerText text={m.text} hrefFor={(id) => hrefs.get(id)} />
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2 border-t border-zinc-200 pt-2 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                    <button
                      type="button"
                      onClick={() => void copy(i)}
                      aria-label="Copy answer"
                      className="inline-flex items-center gap-1 rounded p-1 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                    >
                      {copied === i ? <CheckIcon className="h-4 w-4 text-emerald-600" /> : <CopyIcon className="h-4 w-4" />}
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
            <div className="flex w-fit items-center gap-2 rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400" role="status">
              <span className="flex gap-1" aria-hidden>
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" />
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
                  className="max-w-[92%] rounded-md border border-zinc-300 px-3 py-1.5 text-right text-xs hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  {s}
                </button>
              ))}
              {!empty && (
                <button type="button" onClick={clear} className="text-xs font-medium text-zinc-500 underline hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100">
                  Clear chat
                </button>
              )}
            </div>
          )}
          <div ref={bottom} />
        </div>
      </div>

      <form
        className="m-3 rounded-lg border border-zinc-300 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/30 dark:border-zinc-700 dark:bg-zinc-900"
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
          className="block w-full resize-none bg-transparent px-3 pt-2.5 text-sm outline-none placeholder:text-zinc-400"
        />
        <div className="flex items-center justify-between px-2 pb-2">
          {/* Team Calls is an out-of-scope stub, so scope is fixed to My Calls: a label, not a dead dropdown. */}
          <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">My Calls</span>
          <button
            type="submit"
            disabled={pending || !input.trim()}
            aria-label="Send question"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowUpIcon className="h-4 w-4" />
          </button>
        </div>
      </form>
    </aside>
  );
}
