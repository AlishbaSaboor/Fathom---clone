"use client";

import { useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";

export interface FeatureBenefit {
  title: string;
  desc: string;
}

/**
 * An honest, minimal subscription paywall shown by the premium nav tabs
 * (Team Calls, Alerts, Deals): clear value proposition, checklist of real features,
 * transparent pricing, direct link to compare plans, and an informative pop-up
 * when requesting a trial in demo mode.
 */
export function FeatureStubPage({
  title,
  description,
  tier = "Pro",
  price = "$19",
  benefits = [],
}: {
  title: string;
  description: string;
  tier?: "Pro" | "Plus";
  price?: string;
  benefits?: FeatureBenefit[];
}) {
  const [showTrialModal, setShowTrialModal] = useState(false);

  return (
    <div className="mx-auto max-w-xl py-8 text-center sm:py-12">
      {/* Tier Badge */}
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0F6E56]/20 bg-[#0F6E56]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0F6E56] dark:border-[#3EC79A]/30 dark:bg-[#3EC79A]/15 dark:text-[#3EC79A]">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span>Fathom {tier} Feature</span>
      </span>

      {/* Title & Description */}
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl text-[#201D1A] dark:text-[#F3F4F6]">{title}.</h1>
      <p className="mt-3 text-base leading-relaxed text-[#201D1A]/70 dark:text-[#F3F4F6]/70">{description}</p>

      {/* Benefit Checklist Card */}
      {benefits.length > 0 && (
        <div className="mt-8 rounded-2xl border border-[#201D1A]/10 bg-white p-5 text-left shadow-xs dark:border-white/10 dark:bg-white/[0.03]">
          <ul className="divide-y divide-[#201D1A]/5 dark:divide-white/5">
            {benefits.map((b, idx) => (
              <li key={idx} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-[#0F6E56] dark:text-[#3EC79A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <div className="text-xs leading-relaxed">
                  <strong className="font-semibold text-[#201D1A] dark:text-[#F3F4F6]">{b.title}: </strong>
                  <span className="text-[#201D1A]/70 dark:text-[#F3F4F6]/70">{b.desc}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pricing and CTA */}
      <div className="mt-8 flex items-baseline justify-center gap-1.5">
        <span className="text-3xl font-extrabold text-[#201D1A] dark:text-[#F3F4F6]">{price}</span>
        <span className="text-sm font-normal text-[#201D1A]/60 dark:text-[#F3F4F6]/60">/ user / month</span>
      </div>

      <div className="mt-4 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => setShowTrialModal(true)}
          className="inline-flex w-full max-w-xs items-center justify-center rounded-xl bg-[#0F6E56] px-6 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-[#0c5945] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E56] dark:bg-[#3EC79A] dark:text-[#0B0F19] dark:hover:bg-[#35b58b] dark:focus-visible:outline-[#3EC79A] cursor-pointer"
        >
          Start 14-Day Free Trial
        </button>
        <Link
          href="/pricing"
          className="text-xs font-semibold text-[#0F6E56] hover:underline dark:text-[#3EC79A]"
        >
          Compare all plans on Pricing →
        </Link>
      </div>

      {/* Free Trial Not Available Pop-up Modal */}
      <Modal
        open={showTrialModal}
        onClose={() => setShowTrialModal(false)}
        title="14-Day Free Trial"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-50/50 p-4 text-left dark:border-amber-400/20 dark:bg-amber-950/20">
            <svg
              className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div className="text-sm leading-relaxed text-[#201D1A]/80 dark:text-[#F3F4F6]/80">
              <p className="font-semibold text-[#201D1A] dark:text-[#F3F4F6]">Not available yet</p>
              <p className="mt-1 text-xs">
                Free trials for Fathom {tier} features (<span className="font-medium text-[#201D1A] dark:text-[#F3F4F6]">{title}</span>) are not currently available in this demo build.
              </p>
            </div>
          </div>

          <p className="text-left text-xs leading-relaxed text-[#201D1A]/70 dark:text-[#F3F4F6]/70">
            You can review feature comparisons, user allowances, and plan details anytime on the pricing page.
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setShowTrialModal(false)}
              className="rounded-lg px-3.5 py-2 text-xs font-semibold text-[#201D1A]/70 hover:bg-[#201D1A]/5 dark:text-[#F3F4F6]/70 dark:hover:bg-white/10 transition-colors"
            >
              Close
            </button>
            <Link
              href="/pricing"
              onClick={() => setShowTrialModal(false)}
              className="rounded-lg bg-[#0F6E56] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#0c5945] dark:bg-[#3EC79A] dark:text-[#0B0F19] dark:hover:bg-[#35b58b] transition-colors"
            >
              Compare all price plans →
            </Link>
          </div>
        </div>
      </Modal>
    </div>
  );
}
