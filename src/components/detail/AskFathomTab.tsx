"use client";

import { useState } from "react";
import { SparkleIcon } from "@/components/ui/icons";

const SUGGESTIONS = [
  "What were the key decisions?",
  "Who owns which action item?",
  "Summarize this call in three sentences",
];

// Lowest-priority stub. There is no AI backend in this build, so Ask Fathom
// only shows the shape of the UI: suggested questions that get a plainly
// labeled placeholder reply, and a disabled input.
export function AskFathomTab() {
  const [asked, setAsked] = useState<string[]>([]);

  return (
    <div className="flex min-h-80 flex-col">
      <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200">
        <SparkleIcon className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          <span className="font-semibold">Coming soon.</span> Ask Fathom would answer questions about this call. It
          isn&rsquo;t connected to an AI backend in this build.
        </p>
      </div>

      <div className="flex-1 space-y-3">
        {asked.map((q, i) => (
          <div key={i} className="space-y-2">
            <p className="ml-auto w-fit max-w-[85%] rounded-lg bg-violet-600 px-3 py-2 text-sm text-white">{q}</p>
            <p className="max-w-[85%] rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
              Placeholder reply: answers aren&rsquo;t generated in this build.
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setAsked((prev) => [...prev, s])}
            className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input
          disabled
          aria-label="Ask a question about this call (disabled in this build)"
          placeholder="Ask anything about this call…"
          className="flex-1 rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm placeholder:text-zinc-400 disabled:cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          disabled
          className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white opacity-50"
        >
          Ask
        </button>
      </div>
    </div>
  );
}
