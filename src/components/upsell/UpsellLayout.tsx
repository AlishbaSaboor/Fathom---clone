import { CheckIcon } from "@/components/ui/icons";
import { UpsellCta } from "./UpsellCta";

/**
 * Shared layout for the out-of-scope sections, modeled on the real product's
 * upsell screens: centered text on the left (eyebrow, headline, bullets, a
 * "Start 14-Day Trial" button) and a product mock on the right.
 */
export function UpsellLayout({
  eyebrow,
  headline,
  intro,
  bullets,
  feature,
  mock,
}: {
  eyebrow: string;
  headline: string;
  intro?: string;
  bullets: string[];
  /** Name used in the message shown when the main button is clicked. */
  feature: string;
  mock: React.ReactNode;
}) {
  return (
    <div className="grid items-center gap-10 py-4 lg:grid-cols-2 lg:gap-14 lg:py-10">
      <div className="mx-auto w-full max-w-lg text-center">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">{headline}</h1>
        {intro && <p className="mx-auto mt-3 max-w-md text-sm text-zinc-600 dark:text-zinc-400">{intro}</p>}

        <ul className="mx-auto mt-6 max-w-md space-y-4 text-left">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-3 text-base font-medium text-amber-700 dark:text-amber-300">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white dark:bg-amber-400 dark:text-zinc-900">
                <CheckIcon className="h-3.5 w-3.5" />
              </span>
              {b}
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <UpsellCta feature={feature} />
        </div>
        <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">View features &amp; pricing on the Fathom website</p>
      </div>

      <div className="min-w-0">{mock}</div>
    </div>
  );
}
