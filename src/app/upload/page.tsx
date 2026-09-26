import type { Metadata } from "next";
import Link from "next/link";
import { UploadForm } from "@/components/upload/UploadForm";
import { requireUser } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Upload a recording | Fathom Clone" };

// The upload API routes already require a session on their own; this call is just the
// same redirect-to-/login defense-in-depth the other two protected pages have (see
// lib/server/auth.ts) so a stale or cleared session lands on /login, not a broken form.
export default async function UploadPage() {
  await requireUser();
  return (
    <>
      <Link
        href="/calls"
        className="mb-4 inline-flex items-center gap-1 text-sm text-[#2B241C]/60 hover:text-[#2B241C] dark:text-[#F2EDDD]/60 dark:hover:text-[#F2EDDD]"
      >
        <span aria-hidden>←</span> My Calls
      </Link>
      <UploadForm />
    </>
  );
}
