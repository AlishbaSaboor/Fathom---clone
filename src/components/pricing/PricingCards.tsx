"use client";

import Link from "next/link";
import { useToast } from "@/components/ui/Toast";

interface Plan {
  name: string;
  price: string;
  description: string;
  cta: string;
  /** Present only for Free: a real destination. Pro and Plus have none — see onSelect below. */
  href?: string;
}

const PLANS: Plan[] = [
  {
    name: "Free",
    price: "$0",
    description:
      "Upload up to 200 MB or 30 minutes per recording and get a real transcript, summary and action items. Ask Fathom answers from your actual meeting data, and every recording gets a shareable link — no login required to view it.",
    cta: "Go to My Calls",
    href: "/calls",
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

/**
 * Three plan cards. Logged out, every button goes to /login: picking a plan
 * before an account exists doesn't mean anything yet. Logged in, Free links
 * straight into the real app; Pro and Plus are plausible marketing copy for a
 * paid tier that doesn't exist yet, so their buttons show the same honest stub
 * message as the rest of the app.
 */
export function PricingCards({ loggedIn }: { loggedIn: boolean }) {
  const { show, toast } = useToast();

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-3">
        {PLANS.map((plan) => {
          const href = loggedIn ? plan.href : "/login";
          return (
            <div
              key={plan.name}
              className="flex flex-col rounded-2xl border border-[#2B241C]/15 p-6 dark:border-[#F2EDDD]/15"
            >
              <h2 className="text-lg font-bold">{plan.name}</h2>
              <p className="mt-2">
                <span className="text-3xl font-extrabold">{plan.price}</span>
                <span className="text-base font-normal text-[#2B241C]/50 dark:text-[#F2EDDD]/50">/mo</span>
              </p>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-[#2B241C]/70 dark:text-[#F2EDDD]/70">
                {plan.description}
              </p>
              {href ? (
                <Link
                  href={href}
                  className="mt-6 rounded-lg bg-[#0F6E56] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E56] dark:bg-[#3EC79A] dark:text-[#101B33] dark:focus-visible:outline-[#3EC79A]"
                >
                  {plan.cta}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => show("Not part of this build", "info")}
                  className="mt-6 rounded-lg bg-[#0F6E56] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E56] dark:bg-[#3EC79A] dark:text-[#101B33] dark:focus-visible:outline-[#3EC79A]"
                >
                  {plan.cta}
                </button>
              )}
            </div>
          );
        })}
      </div>
      {toast}
    </>
  );
}
