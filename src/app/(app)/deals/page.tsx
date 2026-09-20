import type { Metadata } from "next";
import { DealsBackdrop, DealsCardMock } from "@/components/upsell/mocks";
import { UpsellCta } from "@/components/upsell/UpsellCta";

export const metadata: Metadata = { title: "Deals | Fathom Clone" };

// Out of scope for this build (paid feature that depends on CRM sync, which is
// also out of scope). Like the real product, the page shows a dimmed deal table
// with an upsell card on top; the table is decorative sample data. The card is
// in normal flow so the page grows with it (e.g. when the CTA message opens on
// a narrow phone) instead of clipping it.
export default function DealsPage() {
  return (
    <div className="relative">
      <div className="absolute inset-0 overflow-hidden">
        <DealsBackdrop />
      </div>
      <div className="relative flex min-h-[36rem] items-center justify-center py-6">
        <div className="w-full max-w-lg rounded-xl border border-zinc-200 bg-white/95 p-6 text-center shadow-2xl backdrop-blur dark:border-zinc-700 dark:bg-zinc-950/95 sm:p-8">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">See deal momentum instantly</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Centralize every signal to forecast with confidence
          </p>
          <DealsCardMock />
          <div className="mt-6">
            <UpsellCta feature="Deals" />
          </div>
          <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
            View features &amp; pricing on the Fathom website
          </p>
        </div>
      </div>
    </div>
  );
}
