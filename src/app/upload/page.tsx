import type { Metadata } from "next";
import Link from "next/link";
import { UploadForm } from "@/components/upload/UploadForm";
import { requireUser } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Upload a recording | Fathom AI" };

// The upload API routes already require a session on their own; this call is just the
// same redirect-to-/login defense-in-depth the other two protected pages have (see
// lib/server/auth.ts) so a stale or cleared session lands on /login, not a broken form.
export default async function UploadPage() {
  await requireUser();
  return (
    <>
      <Link
        href="/calls"
        className="mb-4 inline-flex items-center gap-1 text-sm text-[#201D1A]/60 hover:text-[#201D1A] dark:text-[#F3F4F6]/60 dark:hover:text-white transition-colors"
      >
        <span aria-hidden>←</span> My Calls
      </Link>
      <UploadForm />
    </>
  );
}
