"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface Plan {
  name: string;
  price: string;
  description: string;
  cta: string;
}

const PLANS: Plan[] = [
  {
    name: "Free",
    price: "$0",
    description:
      "Upload up to 200 MB or 30 minutes per recording and get a real transcript, summary and action items. Ask Fathom answers from your actual meeting data, and every recording gets a shareable link — no login required to view it.",
    cta: "Register for free",
  },
  {
    name: "Pro",
    price: "$19",
    description:
      "For people who live in their calls: longer recordings, a shared team library, and playlists to keep the best moments close at hand.",
    cta: "Start 14-Day Trial",
  },
  {
    name: "Plus",
    price: "$39",
    description:
      "Everything in Pro, plus real-time alerts and deal tracking for teams who need to act on what's said the moment it's said.",
    cta: "Start 14-Day Trial",
  },
];

const CTA_CLASS =
  "mt-6 rounded-lg bg-[#0F6E56] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#0c5945] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E56] dark:bg-[#3EC79A] dark:text-[#0B0F19] dark:hover:bg-[#35b58b] dark:focus-visible:outline-[#3EC79A]";

/** A small, dismissible amber note anchored right under a Pro/Plus button. */
function NotBuiltNotice({ onDismiss }: { onDismiss: () => void }) {
  return (
    <p
      role="status"
      className="absolute left-0 right-0 top-full z-20 mt-2 rounded-md bg-amber-100 px-3 py-2 text-xs text-amber-800 shadow-lg dark:bg-amber-950/60 dark:text-amber-300"
    >
      Not part of this build.
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="absolute right-1.5 top-1.5 rounded p-0.5 leading-none hover:bg-amber-200/60 dark:hover:bg-amber-900/60"
      >
        ×
      </button>
    </p>
  );
}

export function PricingCards({ loggedIn }: { loggedIn: boolean }) {
  const [noticeFor, setNoticeFor] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  function showNotice(plan: string) {
    window.clearTimeout(timer.current);
    setNoticeFor(plan);
    timer.current = window.setTimeout(() => setNoticeFor(null), 4000);
  }

  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {PLANS.map((plan) => {
        const isFree = plan.name === "Free";
        return (
          <div
            key={plan.name}
            className="flex flex-col rounded-2xl border border-[#201D1A]/10 bg-white p-6 shadow-xs dark:border-white/10 dark:bg-white/[0.03]"
          >
            <h2 className="text-lg font-bold">{plan.name}</h2>
            <p className="mt-2">
              <span className="text-3xl font-extrabold">{plan.price}</span>
              <span className="text-base font-normal text-[#201D1A]/50 dark:text-[#F3F4F6]/50">/mo</span>
            </p>
            <p className="mt-4 flex-1 text-sm leading-relaxed text-[#201D1A]/70 dark:text-[#F3F4F6]/70">
              {plan.description}
            </p>
            <div className="relative">
              {!loggedIn ? (
                <Link href="/login" className={CTA_CLASS}>
                  {plan.cta}
                </Link>
              ) : isFree ? (
                <button type="button" disabled className={`${CTA_CLASS} cursor-not-allowed opacity-50`}>
                  Already claimed
                </button>
              ) : (
                <button type="button" onClick={() => showNotice(plan.name)} className={CTA_CLASS}>
                  {plan.cta}
                </button>
              )}
              {noticeFor === plan.name && <NotBuiltNotice onDismiss={() => setNoticeFor(null)} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}
