import { LogoMark } from "@/components/brand/Logo";

/**
 * The mark and wordmark for the marketing page, in the page's own charcoal/cream
 * palette rather than the app's blue: the accent color is reserved for the CTA
 * button and the card dots, not the brand mark. The bars are given the page's
 * background color (instead of the shared mark's default white) so they stay
 * visible now that the bubble itself can turn light in dark mode.
 */
export function LandingWordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 text-[17px] leading-none tracking-tight ${className}`}>
      <LogoMark className="h-7 w-7 text-[#2B241C] dark:text-[#F2EDDD]" barClassName="fill-white dark:fill-[#101B33]" />
      <span>
        <span className="font-bold">Fathom</span> <span className="font-medium">Clone</span>
      </span>
    </span>
  );
}
