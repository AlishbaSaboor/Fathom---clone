"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ApiErrorBody } from "@/lib/recordings/types";
import { AlertIcon } from "@/components/ui/icons";

const INPUT =
  "w-full rounded-lg border border-[#2B241C]/20 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-[#2B241C]/40 focus:border-[#0F6E56] focus:ring-2 focus:ring-[#0F6E56]/25 dark:border-[#F2EDDD]/20 dark:bg-[#101B33] dark:placeholder:text-[#F2EDDD]/40 dark:focus:border-[#3EC79A] dark:focus:ring-[#3EC79A]/25";
const LABEL = "mb-1.5 block text-sm font-medium";
const SUBMIT =
  "w-full rounded-lg bg-[#0F6E56] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E56] dark:bg-[#3EC79A] dark:text-[#101B33] dark:focus-visible:outline-[#3EC79A]";

export function LoginForm({ from, initialError }: { from: string; initialError?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
        setError(body?.error.message ?? "Something went wrong. Please try again.");
        setPending(false);
        return;
      }
      router.push(from);
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-800 dark:bg-rose-950/50 dark:text-rose-200">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
      <div>
        <label htmlFor="email" className={LABEL}>Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={INPUT}
        />
      </div>
      <div>
        <label htmlFor="password" className={LABEL}>Password</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={INPUT}
        />
      </div>
      <button type="submit" disabled={pending} className={SUBMIT}>
        {pending ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
