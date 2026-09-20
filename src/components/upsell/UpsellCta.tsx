"use client";

import Link from "next/link";
import { useState } from "react";
import { XIcon } from "@/components/ui/icons";

// The main button on an upsell page. Free trials and paid features are out of
// scope for this build, so clicking it does nothing except say so.
export function UpsellCta({ feature, label = "Start 14-Day Trial" }: { feature: string; label?: string }) {
  const [shown, setShown] = useState(false);

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={() => setShown(true)}
        className="rounded-md border-2 border-violet-600 px-9 py-3 text-base font-semibold text-violet-700 transition hover:bg-violet-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 dark:border-violet-400 dark:text-violet-300 dark:hover:bg-violet-950/50"
      >
        {label}
      </button>

      {shown && (
        <div
          role="status"
          className="mt-4 w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-4 text-left text-sm shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="font-semibold">This feature isn&rsquo;t part of this build</p>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => setShown(false)}
              className="-mr-1 -mt-1 rounded p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            {feature} is a paid Fathom feature and out of scope here, so there are no trials or sign-ups.{" "}
            <Link href="/" className="font-medium text-violet-700 underline dark:text-violet-300">
              Back to My Calls
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
