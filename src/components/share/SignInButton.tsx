"use client";

import { useEffect, useRef, useState } from "react";

// Accounts and sign-in are out of scope for this build (there is no auth at
// all), so this matches the real share page's "Sign In" button visually but
// does nothing except say so.
export function SignInButton() {
  const [note, setNote] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  function show() {
    setNote(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setNote(false), 3500);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={show}
        className="rounded-md px-2 py-1.5 text-sm font-semibold hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:hover:bg-zinc-800"
      >
        Sign In
      </button>
      {note && (
        <p
          role="status"
          className="absolute right-0 top-full z-20 mt-2 w-60 rounded-md bg-zinc-900 px-3 py-2 text-xs text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900"
        >
          Sign in isn&rsquo;t available in this build: accounts and auth are out of scope.
        </p>
      )}
    </div>
  );
}
