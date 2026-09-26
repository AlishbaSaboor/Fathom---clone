"use client";

import { useState } from "react";
import Link from "next/link";
import { Wordmark } from "@/components/brand/Logo";
import { PrivacyPolicyModal } from "@/components/PrivacyPolicyModal";

/**
 * The marketing page's footer: wordmark + tagline left,
 * links to Features, Pricing, Contact us, How it works, FAQs, and Privacy Policy right.
 */
export function LandingFooter() {
  const [privacyOpen, setPrivacyOpen] = useState(false);

  return (
    <>
      <footer className="border-t border-[#201D1A]/8 py-10 px-4 sm:px-6 dark:border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 text-xs text-[#201D1A]/60 sm:flex-row dark:text-[#F3F4F6]/60">
          
          <div className="flex flex-col items-center gap-2 text-center sm:items-start sm:text-left">
            <Wordmark />
            <p className="max-w-sm text-xs leading-relaxed text-[#201D1A]/70 dark:text-[#F3F4F6]/70">
              AI meeting notetaker that turns recordings into transcripts, summaries, and answers.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-6 font-medium">
            <Link href="/features" className="hover:text-[#201D1A] dark:hover:text-white transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="hover:text-[#201D1A] dark:hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/contact" className="hover:text-[#201D1A] dark:hover:text-white transition-colors">
              Contact us
            </Link>
            <Link href="/#how-it-works" className="hover:text-[#201D1A] dark:hover:text-white transition-colors">
              How it works
            </Link>
            <Link href="/#faq" className="hover:text-[#201D1A] dark:hover:text-white transition-colors">
              FAQs
            </Link>
            <button
              type="button"
              onClick={() => setPrivacyOpen(true)}
              className="cursor-pointer hover:text-[#201D1A] dark:hover:text-white transition-colors"
            >
              Privacy Policy
            </button>
          </div>

        </div>
      </footer>

      <PrivacyPolicyModal open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </>
  );
}
