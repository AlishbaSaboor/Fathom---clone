/** Google's "G" mark, in its own fixed brand colors (unlike the rest of the app's icons, which follow currentColor). */
function GoogleG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden>
      <path fill="#4285F4" d="M19.6 10.23c0-.68-.06-1.36-.18-2.02H10v3.83h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.9-1.75 2.99-4.32 2.99-7.33z" />
      <path fill="#34A853" d="M10 20c2.7 0 4.96-.89 6.62-2.42l-3.23-2.5c-.9.6-2.05.96-3.39.96-2.6 0-4.8-1.76-5.59-4.12H1.06v2.58A10 10 0 0 0 10 20z" />
      <path fill="#FBBC05" d="M4.41 11.92a6 6 0 0 1 0-3.84V5.5H1.06a10 10 0 0 0 0 9l3.35-2.58z" />
      <path fill="#EA4335" d="M10 3.96c1.47 0 2.79.5 3.82 1.5l2.87-2.87C14.95.99 12.7 0 10 0A10 10 0 0 0 1.06 5.5l3.35 2.58C5.2 5.72 7.4 3.96 10 3.96z" />
    </svg>
  );
}

/** Full-navigation link (not a fetch): Google sign-in needs a real redirect, not an XHR. `from` is passed through so login returns to where the visitor was headed. */
export function GoogleButton({ from }: { from?: string }) {
  const href = from ? `/api/auth/google?from=${encodeURIComponent(from)}` : "/api/auth/google";
  return (
    <a
      href={href}
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#2B241C]/20 bg-white px-4 py-2.5 text-sm font-semibold text-[#2B241C] transition hover:bg-[#2B241C]/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E56] dark:border-[#F2EDDD]/20 dark:bg-[#101B33] dark:text-[#F2EDDD] dark:hover:bg-[#F2EDDD]/5"
    >
      <GoogleG className="h-4 w-4" />
      Continue with Google
    </a>
  );
}
